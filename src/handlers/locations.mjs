import { database } from "../../config.mjs";
import { ensureObjectId, getTimeUTC } from "../utils/helpers.mjs";

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

    const newSearch = createSearchString(location);
    const locationObj = {
      address: { street, unitNumber, city, province, postalCode, country },
      search: newSearch,
      organizationId,
      belongsTo: ensureObjectId(customer._id),
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: ensureObjectId(userId),
      updatedBy: ensureObjectId(userId),
      active: true,
    };

    await locationsColl.insertOne(locationObj);

    return locationObj.address;
  } catch (err) {
    console.log(err);
  }
};

export const updateOldLocation = async (
  locationId,
  updatedLocation,
  userId
) => {
  if (!locationId) {
    return null;
  }

  const newLocation = { ...updatedLocation };
  delete newLocation._id;
  const newSearch = createSearchString(newLocation);

  const timestamp = getTimeUTC();

  await locationsColl.updateOne(
    {
      _id: ensureObjectId(locationId),
    },
    {
      $set: {
        address: newLocation,
        search: newSearch,
        updatedBy: ensureObjectId(userId),
        updatedAt: timestamp,
      },
    }
  );

  const updatedLocationRes = await locationsColl.findOne({
    _id: ensureObjectId(locationId),
  });

  return updatedLocationRes;
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
        _id: ensureObjectId(idString),
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
  if (!orgId) {
    return [];
  }

  const retLocations = await locationsColl
    .find({
      organizationId: ensureObjectId(orgId),
      active: true,
    })
    .toArray();
  return retLocations;
};

export const createSearchString = (address) => {
  const { unitNumber, street, city, province } = address;
  return `${
    unitNumber === "" ? "" : `${unitNumber} - `
  }${street}, ${city}, ${province}`;
};
