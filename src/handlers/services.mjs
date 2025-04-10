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
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      if (_id) {
        serviceToUpdate.push(serviceObj);
      } else {
        servicesToCreate.push(serviceObj);
      }
    }
    await servicesColl.insertMany(servicesToCreate);
    serviceToUpdate.forEach(async (service) => {
      await servicesColl.updateOne(
        {
          _id: service._id,
        },
        {
          $set: service,
        }
      );
    });
    return { status: "success" };
  } catch (err) {
    console.log(err);
  }
};
