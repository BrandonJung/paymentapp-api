import { database } from "../../config.mjs";
import { ensureObjectId, getTimeUTC } from "../utils/helpers.mjs";
import { NotFoundError } from "../utils/errors.mjs";

const customerColl = database.collection("customers");

export const retrieveCustomer = async (req, res, next) => {
  return res.send({ message: "Retrieve customer" });
};

export const retrieveCustomers = async (req, res, next) => {
  return res.send({ message: "Retrieve customers in organization" });
};

export const updateCustomer = async (req, res, next) => {
  return res.send({ message: "Update entire customer" });
};

export const updateOldCustomer = async (
  customerId,
  updatedCustomer,
  userId
) => {
  if (!customerId) {
    return null;
  }

  const newCustomer = { ...updatedCustomer };

  const username = `${newCustomer.firstName} ${newCustomer.lastName}`;
  const label = `${username} - ${newCustomer.email}`;
  delete newCustomer._id;

  const timestamp = getTimeUTC();

  await customerColl.updateOne(
    {
      _id: customerId,
    },
    {
      $set: {
        ...newCustomer,
        username,
        label,
        updatedAt: timestamp,
        updatedBy: ensureObjectId(userId),
      },
    }
  );

  const updatedCustomerRes = await customerColl.findOne({
    _id: ensureObjectId(customerId),
  });

  return updatedCustomerRes;
};

export const updateCustomerFields = async (req, res, next) => {
  return res.send({ message: "Update customer fields" });
};

export const createCustomer = async (customer, organizationId, userId) => {
  const { firstName, lastName, email, phoneNumber } = customer;
  try {
    const username = `${firstName} ${lastName}`;
    const label = `${username} - ${email}`;
    const timestamp = getTimeUTC();
    const customerObj = {
      firstName,
      lastName,
      email,
      phoneNumber,
      username,
      label,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: ensureObjectId(userId),
      updatedBy: ensureObjectId(userId),
      organizationId,
      active: true,
    };

    const { insertedId } = await customerColl.insertOne(customerObj);

    const customerRes = await findCustomerById(insertedId);

    if (!customerRes) {
      return next(new NotFoundError("Customer does not exist'"));
    }

    return customerRes;
  } catch (err) {
    console.log(err);
  }
};

const findCustomerById = async (id, fields) => {
  // Id should be hex string or ObjectId
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

    const foundCustomer = await customerColl.findOne(
      {
        _id: ensureObjectId(idString),
      },
      { projection: retFields }
    );
    console.log("Found customer by id: ", foundCustomer);
    return foundCustomer;
  } catch (err) {
    console.log(err);
  }
};

export const findCustomerByEmail = async (email, fields) => {
  if (!email) {
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

    const foundCustomer = await customerColl.findOne(
      { email: email },
      { projection: retFields }
    );
    console.log("Found customer by email: ", email, foundCustomer);
    return foundCustomer;
  } catch (err) {
    console.log(err);
  }
};

export const retrieveExistingCustomers = async (orgId) => {
  // OrgId can be hex string or ObjectId
  if (!orgId) {
    return [];
  }

  const retLocations = await customerColl
    .find({
      organizationId: ensureObjectId(orgId),
      active: true,
    })
    .toArray();
  return retLocations;
};
