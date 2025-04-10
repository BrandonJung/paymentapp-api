import { ObjectId } from "mongodb";
import { database } from "../../config.mjs";
import { getTimeUTC } from "../utils/helpers.mjs";
import { NotFoundError } from "../utils/errors.mjs";

const userColl = database.collection("users");

export const retrieveCustomer = async (req, res, next) => {
  return res.send({ message: "Retrieve customer" });
};

export const retrieveCustomers = async (req, res, next) => {
  return res.send({ message: "Retrieve customers in organization" });
};

export const updateCustomer = async (req, res, next) => {
  return res.send({ message: "Update entire customer" });
};

export const updateCustomerFields = async (req, res, next) => {
  return res.send({ message: "Update customer fields" });
};

export const createCustomer = async (customer, organizationId, userId) => {
  const { firstName, lastName, email, phoneNumber } = customer;
  try {
    const username = `${firstName} ${lastName}`;
    const timestamp = getTimeUTC();
    const customerObj = {
      firstName,
      lastName,
      email,
      phoneNumber,
      username,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: userId,
      updatedBy: userId,
      roles: ["customer"],
      organizationId,
      active: true,
    };

    const { insertedId } = await userColl.insertOne(customerObj);

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
  if (!id) {
    return null;
  }
  const idString = id.toString();
  if (idString.length !== 24) {
    return null;
  }
  try {
    let retFields = {};
    if (fields && fields.length > 0) {
      let splitFields = fields.split(",");
      for (let field of splitFields) {
        retFields[field] = 1;
      }
    }

    const foundCustomer = await userColl.findOne(
      {
        _id: ObjectId.createFromHexString(idString),
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
    if (fields && fields.length > 0) {
      let splitFields = fields.split(",");
      for (let field of splitFields) {
        retFields[field] = 1;
      }
    }

    const foundCustomer = await userColl.findOne(
      { email: email, roles: { $in: ["customer"] } },
      { projection: retFields }
    );
    console.log("Found customer by email: ", email, foundCustomer);
    return foundCustomer;
  } catch (err) {
    console.log(err);
  }
};

// user: {
//       firstName: 'Test',
//       lastName: 'Name3',
//       email: 'test3@example.com',
//       phoneNumber: '3333333333'
//     },
