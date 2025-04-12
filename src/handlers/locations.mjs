import { ObjectId } from "mongodb";
import { database } from "../../config.mjs";
import { getTimeUTC } from "../utils/helpers.mjs";

const locationsColl = database.collection("locations");

export const createLocation = async (
  location,
  organizationId,
  customer,
  userId
) => {
  const { street, unitNumber, city, province, postalCode, country } = location;
  try {
    const timestamp = getTimeUTC();

    const search = `${
      unitNumber === "" ? "" : `${unitNumber} - `
    }${street}, ${province}, ${country}`;
    const locationObj = {
      address: { street, unitNumber, city, province, postalCode, country },
      search,
      organizationId,
      belongsTo: customer._id,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: userId,
      updatedBy: userId,
      active: true,
    };

    await locationsColl.insertOne(locationObj);

    return locationObj.address;
  } catch (err) {
    console.log(err);
  }
};

export const findLocationById = async (id, fields) => {
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

    const foundLocation = await locationsColl.findOne(
      {
        _id: ObjectId.createFromHexString(idString),
      },
      { projection: retFields }
    );
    console.log("Found location by id: ", foundLocation);
    return foundLocation;
  } catch (err) {
    console.log(err);
  }
};

export const retrieveExistingLocations = async (orgId) => {
  const orgIdIsValid = ObjectId.isValid(orgId);

  if (!orgIdIsValid) {
    return [];
  }

  const retLocations = await locationsColl
    .find({
      organizationId: orgId,
      active: true,
    })
    .toArray();
  return retLocations;
};
