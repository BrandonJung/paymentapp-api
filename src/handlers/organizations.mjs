import { database } from "../../config.mjs";
import { BadRequestError, NotFoundError } from "../utils/errors.mjs";
import {
  ensureObjectId,
  getTimeUTC,
  newValidityObject,
  validateEmail,
  validatePhone,
} from "../utils/helpers.mjs";
import { findUserById } from "./users.mjs";

const orgColl = database.collection("organizations");
const userColl = database.collection("users");

export const retrieveOrganization = async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return next(new BadRequestError("User id does not exist"));
  }

  try {
    const user = await findUserById(userId);
    if (!user) {
      return next(new BadRequestError("User does not exist"));
    }

    if (!user.organization) {
      return next(new NotFoundError("No organization on this user"));
    }

    const organization = await findOrganizationById(user.organization._id);
    if (!organization) {
      return next(new NotFoundError("Organization does not exist"));
    }

    const { name, tag, email, phoneNumber, taxesAndFeeRates, _id } =
      organization;

    return res.status(200).send({
      details: { name, tag, email, phoneNumber, _id },
      taxesAndFeeRates,
    });
  } catch (err) {
    console.log(err);
  }
};

export const createOrganization = async (req, res, next) => {
  const { userId, name, tag, email, phoneNumber, taxesAndFees, _id } = req.body;

  const orgNameIsValid = validateOrgName(name);
  if (!orgNameIsValid.valid) {
    return next(new BadRequestError(orgNameIsValid.message));
  }

  const taxesAndFeeRatesAreValid = validateTaxAndFees(taxesAndFees);
  if (!taxesAndFeeRatesAreValid) {
    return next(new BadRequestError(taxesAndFeeRatesAreValid.message));
  }

  const emailIsValid = validateEmail(email);
  if (!emailIsValid) {
    return next(new BadRequestError(emailIsValid.message));
  }
  const phoneNumberIsValid = validatePhone(phoneNumber);
  if (!phoneNumberIsValid) {
    return next(new BadRequestError(phoneNumberIsValid.message));
  }

  try {
    const user = await findUserById(userId);
    if (!user) {
      return next(new BadRequestError("User does not exist"));
    }

    let organizationRes;

    if (_id) {
      const updatedOrganization = await updateOrganizationField({
        _id,
        name,
        email,
        phoneNumber,
        tag,
        taxesAndFees,
        userId,
      });
      organizationRes = updatedOrganization;
    } else {
      const timestamp = getTimeUTC();

      const orgTag = createOrgTag(name, tag);

      const taxesAndFeeRates = createtaxesAndFeeRates(taxesAndFees);

      const orgObj = {
        name,
        email,
        phoneNumber,
        createdBy: ensureObjectId(userId),
        createdAt: timestamp,
        updatedAt: timestamp,
        updatedBy: ensureObjectId(userId),
        taxesAndFeeRates: taxesAndFeeRates,
        tag: orgTag,
      };

      const { insertedId } = await orgColl.insertOne(orgObj);

      await userColl.updateOne(
        {
          _id: ensureObjectId(user._id),
        },
        {
          $set: {
            organization: {
              _id: ensureObjectId(insertedId),
              tag: orgTag,
            },
          },
        }
      );
      organizationRes = orgObj;
    }

    const orgRes = {
      details: {
        email: organizationRes.email,
        phoneNumber: organizationRes.phoneNumber,
        name: organizationRes.name,
        tag: organizationRes.tag,
        _id: ensureObjectId(organizationRes._id),
      },
      taxesAndFeeRates: organizationRes.taxesAndFeeRates,
    };

    return res.status(200).send(orgRes);
  } catch (err) {
    console.log(err);
  }
};

export const updateOrganizationField = async (fields) => {
  const { _id, name, tag, email, phoneNumber, taxesAndFees, userId } = fields;

  if (!_id) {
    return null;
  }

  const resTaxesAndFees = createtaxesAndFeeRates(taxesAndFees);

  const timestamp = getTimeUTC();
  await orgColl.updateOne(
    {
      _id: ensureObjectId(_id),
    },
    {
      $set: {
        name,
        tag,
        email,
        phoneNumber,
        taxesAndFeeRates: resTaxesAndFees,
        updatedAt: timestamp,
        updatedBy: ensureObjectId(userId),
      },
    }
  );

  await userColl.updateOne(
    {
      _id: ensureObjectId(userId),
    },
    {
      $set: {
        updatedAt: timestamp,
        updatedBy: ensureObjectId(userId),
        organization: {
          _id: _id,
          tag: tag,
        },
      },
    }
  );

  const updatedOrganization = await findOrganizationById(_id);
  return updatedOrganization;
};

const validateOrgName = (name) => {
  if (name.length < 3) {
    return newValidityObject(
      false,
      "Organization name must be at least 3 characters"
    );
  }
  return newValidityObject(true);
};

const validateTaxAndFees = (taxAndFees) => {
  for (let tf of taxAndFees) {
    const taxAndFeeFieldsAreValid = validateTaxAndFeeFields(tf);
    if (!taxAndFeeFieldsAreValid.valid) {
      return newValidityObject(false, "Invalid taxes and fees");
    }
  }
  return newValidityObject(true);
};

const validateTaxAndFeeFields = (taxAndFeeObj) => {
  if (!taxAndFeeObj.name) {
    return newValidityObject(false, "Invalid name");
  } else if (!taxAndFeeObj.type) {
    return newValidityObject(false, "No type chosen");
  } else if (taxAndFeeObj.type !== "percent" && taxAndFeeObj.type !== "flat") {
    return newValidityObject(false, "Invalid type");
  } else if (taxAndFeeObj.amount < 0) {
    return newValidityObject(false, "Must be greater than 0");
  }
  return newValidityObject(true);
};

const createOrgTag = (name, tag) => {
  if (tag) {
    const resTag = tag.toUpperCase();
    return resTag;
  } else {
    const trimmedName = name.replaceAll(" ", "");
    const resTag = `${trimmedName.slice(0, 3).toUpperCase()}`;
    return resTag;
  }
};

const createtaxesAndFeeRates = (taxesAndFeeRates) => {
  let restaxesAndFeeRates = [...taxesAndFeeRates];
  restaxesAndFeeRates.map((tf) => {
    tf.code = tf.name.toLowerCase();
    if (tf.type === "flat") {
      tf.amount *= 100;
    }
    delete tf._id;
  });
  return restaxesAndFeeRates;
};

export const findOrganizationById = async (id, fields) => {
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

    const foundOrg = await orgColl.findOne(
      {
        _id: ensureObjectId(idString),
      },
      { projection: retFields }
    );
    console.log("Found organization by id: ", foundOrg);
    return foundOrg;
  } catch (err) {
    console.log(err);
  }
};
