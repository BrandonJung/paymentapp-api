import { database } from "../../config.mjs";
import { BadRequestError } from "../utils/errors.mjs";
import { getTimeUTC } from "../utils/helpers.mjs";
import { findUserById } from "./users.mjs";

const orgColl = database.collection("organizations");
const userColl = database.collection("users");

export const createOrganization = async (req, res, next) => {
  const { userId, orgName } = req.body;
  const orgNameIsValid = validateOrgName(orgName);
  if (!orgNameIsValid.valid) {
    return next(new BadRequestError(orgNameIsValid.message));
  }
  try {
    const user = await findUserById(userId);
    if (!user) {
      return next(new BadRequestError("User does not exist"));
    }

    const timestamp = getTimeUTC();

    const tag = `${orgName.trim().slice(0, 3)}`;

    const orgObj = {
      name: orgName,
      createdBy: userId,
      createdAt: timestamp,
      updatedAt: timestamp,
      updatedBy: userId,
      taxAndFeeRates: [],
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
    return {
      valid: false,
      message: "Organization name must be at least 3 characters",
    };
  }
  return { valid: true };
};
