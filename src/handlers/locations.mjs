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
      belongsTo: customer.id,
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
    if (fields && fields.length > 0) {
      let splitFields = fields.split(",");
      for (let field of splitFields) {
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
