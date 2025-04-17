import { database } from "../../config.mjs";
import { BadRequestError, NotFoundError } from "../utils/errors.mjs";
import {
  createDateObj,
  ensureObjectId,
  getTimeUTC,
  validateNewCustomer,
  validateNewDate,
  validateNewLocation,
  validateNewServices,
} from "../utils/helpers.mjs";
import {
  createLocation,
  findLocationById,
  retrieveExistingLocations,
  updateOldLocation,
} from "./locations.mjs";
import {
  createCustomer,
  findCustomerByEmail,
  retrieveExistingCustomers,
  updateOldCustomer,
} from "./customers.mjs";
import { createServices, retrieveExistingServices } from "./services.mjs";
import { findUserById } from "./users.mjs";
import { findOrganizationById } from "./organizations.mjs";

const jobColl = database.collection("jobs");

export const emailUserJob = async (req, res, next) => {};

export const sendJobInvoice = async (req, res, next) => {};

export const payJobInvoice = async (req, res, next) => {};

export const archiveJob = async (req, res, next) => {};

export const retrieveActiveJobs = async (req, res, next) => {
  const { userId } = req.query;
  if (!userId) {
    return next(new BadRequestError("Invalid user id"));
  }
  try {
    const user = await findUserById(userId);

    if (!user) {
      return next(new BadRequestError("User does not exist"));
    }

    const organizationId = user.organization?._id;

    if (!organizationId) {
      return next(new BadRequestError("Organization does not exist"));
    }

    const retrievedJobs = await jobColl
      .find({
        organizationId: organizationId,
        archived: false,
      })
      .toArray();

    const groups = {};

    retrievedJobs.map((job) => {
      const statusCode = job.statusCode;
      if (statusCode > 99 && statusCode < 1000) {
        const firstDigit = Math.floor(statusCode / 100);
        if (!groups[firstDigit]) {
          groups[firstDigit] = [];
        }
        groups[firstDigit].push(job);
      }
    });

    return res.status(200).send({ jobs: groups });
  } catch (err) {
    console.log(err);
  }
};

export const retrieveExistingData = async (req, res, next) => {
  const { userId } = req;
  if (!userId) {
    return next(new BadRequestError("Invalid user id"));
  }
  try {
    const user = await findUserById(userId);

    if (!user) {
      return next(new BadRequestError("User does not exist"));
    }

    const organizationId = user.organization?._id;

    if (!organizationId) {
      return next(new BadRequestError("Organization id not found"));
    }

    const organization = await findOrganizationById(organizationId);

    if (!organization) {
      return next(new BadRequestError("Organization does not exist"));
    }

    const existingLocations = await retrieveExistingLocations(organizationId);

    const existingServices = await retrieveExistingServices(organizationId);

    const existingCustomers = await retrieveExistingCustomers(organizationId);

    return res.status(200).send({
      existingCustomers,
      existingLocations,
      existingServices,
      organization,
    });
  } catch (err) {
    console.log(err);
  }
};

export const createJob = async (req, res, next) => {
  const { customer, userId, location, services, date, sendToCustomer } =
    req.body;

  const customerIsValid = validateNewCustomer(customer);
  if (!customerIsValid) {
    return next(new BadRequestError("Invalid customer"));
  }

  const locationIsValid = validateNewLocation(location);
  if (!locationIsValid) {
    return next(new BadRequestError("Invalid location"));
  }

  const servicesIsValid = validateNewServices(services);
  if (!servicesIsValid) {
    return next(new BadRequestError("Invalid services"));
  }

  const dateIsValid = validateNewDate(date);
  if (!dateIsValid) {
    return next(new BadRequestError("Invalid date"));
  }

  try {
    const user = await findUserById(userId);

    if (!user) {
      return next(new BadRequestError("Invalid User id"));
    }

    const organization = await findOrganizationById(user.organization._id);

    if (!organization) {
      return next(new BadRequestError("No organization found"));
    }

    const customerRes = await findCustomerByEmail(customer.email);

    let customerObj;
    if (customerRes) {
      const updatedCustomerRes = await updateOldCustomer(
        customerRes._id,
        customer,
        userId
      );
      customerObj = updatedCustomerRes;
    } else {
      const newCustomerObj = await createCustomer(
        customer,
        organization._id,
        userId
      );
      customerObj = newCustomerObj;
    }

    const locationRes = await findLocationById(location._id, ["address"]);

    let locationObj;
    if (locationRes) {
      const updatedLocationRes = await updateOldLocation(
        locationRes._id,
        location,
        userId
      );
      locationObj = updatedLocationRes;
    } else {
      const newLocationObj = await createLocation(
        location,
        organization._id,
        customerObj,
        userId
      );
      locationObj = newLocationObj;
    }

    const newServicesRes = await createServices(
      services,
      organization._id,
      organization.taxesAndFeeRates,
      userId
    );

    if (newServicesRes.status !== "success") {
      return next(new BadRequestError("Creating services error"));
    }

    const startDateObj = createDateObj(date.startDate);
    const endDateObj = createDateObj(date.endDate);

    const newDateObj = {
      type: date.type,
      startDate: startDateObj,
      endDate: endDateObj,
    };

    console.log(
      "Job Obj:",
      customerObj,
      userId,
      organization,
      locationObj,
      services,
      newDateObj
    );

    const jobObj = createJobObj(
      customerObj,
      userId,
      organization,
      locationObj,
      services,
      newDateObj
    );

    const { insertedId } = await jobColl.insertOne(jobObj);

    const job = await findJobById(insertedId.toString());

    if (!job) {
      return next(new NotFoundError("Job does not exist"));
    }

    if (sendToCustomer) {
      // Implement sending email to user + update job invoice field
    }

    return res.status(200).send({ message: "Job created", job });
  } catch (err) {
    console.log(err);
  }
};

const createJobObj = (
  customer,
  userId,
  organization,
  location,
  services,
  date
) => {
  const timestamp = getTimeUTC();
  const invoiceNumber = createInvoiceNumber(organization.tag);

  const customerObj = createCustomerJobObj(customer);
  const locationObj = createLocationJobObj(location);
  const servicesArray = createServicesJobArray(services);
  const dateObj = createDateJobObj(date);

  const { subTotal, taxAndFeesTotal, totalPrice } = calculateInvoiceTotals(
    servicesArray,
    organization.taxesAndFeeRates
  );

  const retJobObj = {
    customer: customerObj,
    location: locationObj,
    services: servicesArray,
    date: dateObj,
    organizationId: organization._id,
    createdBy: ensureObjectId(userId),
    createdAt: timestamp,
    updatedAt: timestamp,
    updatedBy: ensureObjectId(userId),
    statusCode: 100,
    subTotal,
    taxAndFeesTotal,
    totalPrice,
    invoiceNumber,
    emailSentToUser: false,
    archived: false,
  };

  return retJobObj;
};

const createCustomerJobObj = (customer) => {
  const { _id, firstName, lastName, username, email, phoneNumber } = customer;
  const retObj = {
    _id: _id,
    firstName,
    lastName,
    username,
    email,
    phoneNumber,
  };
  return retObj;
};

const createLocationJobObj = (location) => {
  const { street, unitNumber, city, province, postalCode, country } =
    location.address;
  const retObj = {
    street,
    unitNumber,
    city,
    province,
    postalCode,
    country,
  };
  return retObj;
};

const createServicesJobArray = (services) => {
  const retArray = [...services];
  return retArray;
};

const createDateJobObj = (date) => {
  const { type, startDate, endDate } = date;
  const retObj = {
    type,
    startDate,
    endDate,
  };
  return retObj;
};

const createInvoiceNumber = (tag) => {
  const timestamp = Date.now().toString(36); // base36 encoding
  return `${tag}-${timestamp.toUpperCase()}`;
};

const calculateInvoiceTotals = (services, taxesAndFeeRates) => {
  const servicesList = services;
  const tfList = taxesAndFeeRates;
  let retSubTotal = 0;
  let taxAndFeesTotal = 0;
  let totalPrice = 0;
  for (let service of servicesList) {
    const price = service.price;
    retSubTotal += price;

    let totalTFMultiplier = 0;
    let totalTFFlatAdd = 0;

    for (let tf of service.taxesAndFees) {
      const taxAndFee = tfList.find((t) => t.code === tf.code);
      const type = taxAndFee.type;
      const tfAmount = taxAndFee.amount;
      if (type === "percent") {
        totalTFMultiplier += tfAmount;
      } else if (type === "flat") {
        totalTFFlatAdd += tfAmount;
      }
    }

    taxAndFeesTotal += price * (totalTFMultiplier / 100);
    taxAndFeesTotal += totalTFFlatAdd;
  }
  totalPrice = taxAndFeesTotal + retSubTotal;
  return {
    subTotal: retSubTotal,
    taxAndFeesTotal: taxAndFeesTotal,
    totalPrice: totalPrice,
  };
};

const findJobById = async (id, fields) => {
  if (!id) {
    return null;
  }
  const idString = id.toString();
  if (idString.length !== 24) {
    return null;
  }
  try {
    let retFields = {};
    let fieldsArray;
    if (fields && Array.isArray(fields)) {
      fieldsArray = fields;
    } else if (fields) {
      let splitFields = fields.split(",");
      fieldsArray = splitFields;
    }
    if (fields) {
      for (let field of fieldsArray) {
        retFields[field] = 1;
      }
    }

    const foundJob = await jobColl.findOne(
      {
        _id: ensureObjectId(idString),
      },
      { projection: retFields }
    );
    console.log("Found job by id: ", foundJob);
    return foundJob;
  } catch (err) {
    console.log(err);
  }
};
