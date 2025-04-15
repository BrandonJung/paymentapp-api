import { database } from "../../config.mjs";
import { getTimeUTC } from "../utils/helpers.mjs";

const servicesColl = database.collection("services");

export const createServices = async (
  services,
  organizationId,
  orgTaxAndFeeRates,
  userId
) => {
  try {
    let servicesToCreate = [];
    let serviceToUpdate = [];
    const timestamp = getTimeUTC();
    for (let service of services) {
      const { _id, name, description, taxesAndFees, quantity, price, rate } =
        service;
      const backendPrice = price * 100;
      const searchName = `${name} - $${backendPrice / 100}`;
      const serviceObj = {
        name,
        description,
        taxesAndFees,
        quantity,
        price: backendPrice,
        rate,
        organizationId,
        createdBy: ensureObjectId(userId),
        createdAt: timestamp,
        updatedBy: ensureObjectId(userId),
        updatedAt: timestamp,
        active: true,
        search: searchName,
      };
      if (_id) {
        serviceToUpdate.push(serviceObj);
      } else {
        serviceObj.createdAt = timestamp;
        servicesToCreate.push(serviceObj);
      }
    }
    if (servicesToCreate.length > 0) {
      await servicesColl.insertMany(servicesToCreate);
    }
    if (serviceToUpdate.length > 0) {
      serviceToUpdate.forEach(async (service) => {
        await servicesColl.updateOne(
          {
            _id: service.id,
          },
          {
            $set: service,
          }
        );
      });
    }
    return { status: "success" };
  } catch (err) {
    console.log(err);
  }
};

export const retrieveExistingServices = async (orgId) => {
  if (!orgId) {
    return [];
  }

  const retLocations = await servicesColl
    .find({
      organizationId: ensureObjectId(orgId),
      active: true,
    })
    .toArray();
  return retLocations;
};

export const findServiceById = async (id, fields) => {
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

    const foundService = await servicesColl.findOne(
      {
        _id: ensureObjectId(idString),
      },
      { projection: retFields }
    );
    console.log("Found service by id: ", foundService);
    return foundService;
  } catch (err) {
    console.log(err);
  }
};
