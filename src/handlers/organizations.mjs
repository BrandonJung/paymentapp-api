import { database } from "../../config.mjs";
import { BadRequestError } from "../utils/errors.mjs";
import { getTimeUTC, newValidityObject } from "../utils/helpers.mjs";
import { findUserById } from "./users.mjs";

const orgColl = database.collection("organizations");
const userColl = database.collection("users");

export const createOrganization = async (req, res, next) => {
  const { userId, orgName, orgTaxAndFeeRates, orgTag } = req.body;
  const orgNameIsValid = validateOrgName(orgName);
  if (!orgNameIsValid.valid) {
    return next(new BadRequestError(orgNameIsValid.message));
  }
  const taxAndFeeRatesAreValid = validateTaxAndFees(orgTaxAndFeeRates);
  if (!taxAndFeeRatesAreValid) {
    return next(new BadRequestError(taxAndFeeRatesAreValid.message));
  }

  try {
    const user = await findUserById(userId);
    if (!user) {
      return next(new BadRequestError("User does not exist"));
    }

    const timestamp = getTimeUTC();

    const tag = createOrgTag(orgName, orgTag);

    const taxAndFeeRates = createTaxAndFeeRates(orgTaxAndFeeRates);

    const orgObj = {
      name: orgName,
      createdBy: userId,
      createdAt: timestamp,
      updatedAt: timestamp,
      updatedBy: userId,
      taxAndFeeRates: taxAndFeeRates,
      tag,
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
    return res.status(200).send(insertedId);
  } catch (err) {
    console.log(err);
  }
};

export const updateOrganizationField = async (req, res, next) => {};

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
