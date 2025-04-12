import { ObjectId } from "mongodb";
import { database } from "../../config.mjs";
import { BadRequestError, NotFoundError } from "../utils/errors.mjs";
import {
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
} from "./locations.mjs";
import {
  createCustomer,
  findCustomerByEmail,
  retrieveExistingCustomers,
} from "./customers.mjs";
import { createServices, retrieveExistingServices } from "./services.mjs";
import { findUserById } from "./users.mjs";

const jobColl = database.collection("jobs");

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

    const organizationId = user.organization?.id;

    if (!organizationId) {
      return next(new BadRequestError("Organization does not exist"));
    }

    const existingLocations = await retrieveExistingLocations(organizationId);

    const existingServices = await retrieveExistingServices(organizationId);

    const existingCustomers = await retrieveExistingCustomers(organizationId);

    return res
      .status(200)
      .send({ existingCustomers, existingLocations, existingServices });
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

    const organization = user.organization;

    const customerRes = await findCustomerByEmail(customer.email);

    let customerObj;
    if (customerRes) {
      customerObj = customerRes;
    } else {
      const newCustomerObj = await createCustomer(
        customer,
        organization.id,
        userId
      );
      customerObj = newCustomerObj;
    }

    const locationRes = await findLocationById(location._id, ["address"]);

    let locationObj;
    if (locationRes) {
      locationObj = locationRes;
    } else {
      const newLocationObj = await createLocation(
        location,
        organization.id,
        customerObj,
        userId
      );
      locationObj = newLocationObj;
    }

    const newServicesRes = await createServices(
      services,
      organization.id,
      organization.taxAndFeeRates,
      userId
    );

    if (newServicesRes.status !== "success") {
      return next(new BadRequestError("Creating services error"));
    }

    const jobObj = createJobObj(
      customerObj,
      userId,
      organization,
      locationObj,
      services,
      date
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
    organization.taxAndFeeRates
  );

  const retJobObj = {
    customer: customerObj,
    location: locationObj,
    services: servicesArray,
    date: dateObj,
    organizationId: organization.id,
    createdBy: userId,
    createdAt: timestamp,
    updatedAt: timestamp,
    statusCode: 0,
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
    id: _id,
    firstName,
    lastName,
    username,
    email,
    phoneNumber,
  };
  return retObj;
};

const createLocationJobObj = (location) => {
  const { street, unitNumber, city, province, postalCode, country } = location;
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
  const { mode, startDate, endDate } = date;
  const retObj = {
    mode,
    startDate,
    endDate,
  };
  return retObj;
};

const createInvoiceNumber = (tag) => {
  return tag;
};

const calculateInvoiceTotals = (services, taxAndFeeRates) => {
  return 0;
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
        _id: ObjectId.createFromHexString(idString),
      },
      { projection: retFields }
    );
    console.log("Found job by id: ", foundJob);
    return foundJob;
  } catch (err) {
    console.log(err);
  }
};
// Sent to me
// {
//     user: {
//       firstName: 'Test',
//       lastName: 'Name3',
//       email: 'test3@example.com',
//       phoneNumber: '3333333333'
//     },
//     location: {
//       street: '1111 Random Street',
//       unitNumber: 4,
//       city: 'Burnaby',
//       province: 'BC',
//       postalCode: 'A1A 2B2',
//       country: 'Canada'
//     },
//     services: [
//       {
//         name: 'Cleaning',
//         description: 'Big cleaning',
//         taxAndFees: [Array],
//         quantity: 1,
//         price: 2125,
//         rate: 'flat'
//       }
//     ],
//     date: {
//       mode: 'multi',
//       startDate: '2025-04-24T06:21:06.347Z',
//       endDate: '2025-04-20T06:21:11.710Z'
//     },
//     userId: ''
//     sendToUser: true
//   }

// in the DB
// {
//     user: {
//       id: customerId
//       firstName: 'Test',
//       lastName: 'Name3',
//       username: 'Test Name3'
//       email: 'test3@example.com',
//       phoneNumber: '3333333333'
//       createdAt
//       updatedAt
//       role: ['customer']
//       organizationId: organizationId
//       address: addressId
//     },
//       id: addressId
//       organizationId: organizationId,
//       belongsTo: customerId,
//       addresses: [locations]
//     location: {
//       street: '1111 Random Street',
//       unitNumber: 4,
//       city: 'Burnaby',
//       province: 'BC',
//       postalCode: 'A1A 2B2',
//       country: 'Canada'
//       search: '1111 Random Street, Burnaby, BC'
//     },
//     id: serviceId
//     organizationId: organizationId,
//     services: [services]
//      services: [
//       {
//         name: 'Cleaning',
//         description: 'Big cleaning',
//         taxAndFees: [Array],
//         quantity: 1,
//         price: 2125,
//         rate: 'flat'
//       }
//     ],
//     date: {
//       mode: 'multi',
//       startDate: '2025-04-24T06:21:06.347Z',
//       endDate: '2025-04-20T06:21:11.710Z'
//     },
//     sendToUser: true
//   }

// const organization = {
//     id,
//     logo,
//     name,
//     createdBy,
//     createdAt,
//     updatedAt,
//     updatedBy,
//     taxAndFeeRates: [],
//     tag,
// }

// Job Document:
// const jobDocument = {
//     id,
//     organizationId,
//     createdBy,
//     createdAt,
//     updatedAt,
//     statusCode: 0,
//     subtotal,
//     taxAndFeesTotal,
//     totalPrice,
//     invoiceNumber,
//     customer: {
//         customerId,
//         firstName,
//         lastName,
//         username,
//         email,
//         phoneNumber
//     },
//     location: {
//         street,
//         unitNumber,
//         city,
//         province,
//         postalCode,
//         country
//     },
//     services: [
//         {
//             name,
//             description,
//             taxAndFees: [],
//             quantity,
//             price,
//             rate
//             total
//         }
//     ],
//     date: {
//         mode,
//         startDate,
//         endDate
//     },
//     emailSentToUser
// }
