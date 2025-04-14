import { ObjectId } from "mongodb";
import { database } from "../../config.mjs";
import { BadRequestError, NotFoundError } from "../utils/errors.mjs";
import { getTimeUTC, newValidityObject } from "../utils/helpers.mjs";
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

    const organization = await findOrganizationById(user.organization.id);
    if (!organization) {
      return next(new NotFoundError("Organization does not exist"));
    }

    const { name, tag, taxesAndFeeRates, _id } = organization;

    return res
      .status(200)
      .send({ details: { name, tag, _id }, taxesAndFeeRates });
  } catch (err) {
    console.log(err);
  }
};

export const createOrganization = async (req, res, next) => {
  const { userId, name, tag, taxesAndFees, _id } = req.body;

  const orgNameIsValid = validateOrgName(name);
  if (!orgNameIsValid.valid) {
    return next(new BadRequestError(orgNameIsValid.message));
  }

  const taxAndFeeRatesAreValid = validateTaxAndFees(taxesAndFees);
  if (!taxAndFeeRatesAreValid) {
    return next(new BadRequestError(taxAndFeeRatesAreValid.message));
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
        tag,
        taxesAndFees,
        userId,
      });
      organizationRes = updatedOrganization;
    } else {
      const timestamp = getTimeUTC();

      const orgTag = createOrgTag(name, tag);

      const taxAndFeeRates = createTaxAndFeeRates(taxesAndFees);

      const orgObj = {
        name,
        createdBy: userId,
        createdAt: timestamp,
        updatedAt: timestamp,
        updatedBy: userId,
        taxesAndFeeRates: taxAndFeeRates,
        tag: orgTag,
      };

      const { insertedId } = await orgColl.insertOne(orgObj);

      await userColl.updateOne(
        {
          _id: user._id,
        },
        {
          $set: {
            organization: {
              id: insertedId,
              tag,
            },
          },
        }
      );
      organizationRes = orgObj;
    }

    const orgRes = {
      details: {
        name: organizationRes.name,
        tag: organizationRes.tag,
        _id: organizationRes._id,
      },
      taxesAndFeeRates: organizationRes.taxesAndFeeRates,
    };

    return res.status(200).send(orgRes);
  } catch (err) {
    console.log(err);
  }
};

export const updateOrganizationField = async (fields) => {
  const { _id, name, tag, taxesAndFees, userId } = fields;

  if (!_id) {
    return null;
  }

  const timestamp = getTimeUTC();

  await orgColl.updateOne(
    {
      _id: ObjectId.createFromHexString(_id),
    },
    {
      $set: {
        name: name,
        tag: tag,
        taxesAndFeeRates: taxesAndFees,
        updatedAt: timestamp,
        updatedBy: userId,
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
    const resTag = `${name.trim().slice(0, 3).toUpperCase()}`;
    return resTag;
  }
};

const createTaxAndFeeRates = (taxAndFeeRates) => {
  let resTaxAndFeeRates = [...taxAndFeeRates];
  resTaxAndFeeRates.map((tf) => {
    tf.code = tf.name.toLowerCase();
    delete tf.id;
  });
  return resTaxAndFeeRates;
};

const findOrganizationById = async (id, fields) => {
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
        _id: ObjectId.createFromHexString(idString),
      },
      { projection: retFields }
    );
    console.log("Found organization by id: ", foundOrg);
    return foundOrg;
  } catch (err) {
    console.log(err);
  }
};
