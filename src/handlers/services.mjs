import { ObjectId } from "mongodb";
import { database } from "../../config.mjs";
import { getTimeUTC } from "../utils/helpers.mjs";

const servicesColl = database.collection("services");

export const createServices = async (
  services,
  organizationId,
  taxAndFeeRates,
  userId
) => {
  try {
    let servicesToCreate = [];
    let serviceToUpdate = [];
    const timestamp = getTimeUTC();
    for (let service of services) {
      const { _id, name, description, taxAndFees, quantity, price, rate } =
        service;
      const searchName = `${name} - $${price / 100}`;
      const serviceObj = {
        name,
        description,
        taxAndFees,
        quantity,
        price,
        rate,
        organizationId,
        createdBy: userId,
        updatedBy: userId,
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
  const orgIdIsValid = ObjectId.isValid(orgId);

  if (!orgIdIsValid) {
    return [];
  }

  const retLocations = await servicesColl
    .find({
      organizationId: orgId,
      active: true,
    })
    .toArray();
  return retLocations;
};
