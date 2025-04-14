import { database } from "../../config.mjs";

const userColl = database.collection("users");
const customerColl = database.collection("customers");
const jobColl = database.collection("jobs");
const locationColl = database.collection("locations");
const orgColl = database.collection("organizations");
const serviceColl = database.collection("services");

export const deleteAllCustomers = async (req, res) => {
  try {
    const deleteRes = await customerColl.deleteMany({});
    return res
      .status(200)
      .send({ message: "All customers deleted", res: deleteRes });
  } catch (err) {
    console.log(err);
  }
};

export const deleteAllJobs = async (req, res) => {
  try {
    const deleteRes = await jobColl.deleteMany({});
    return res
      .status(200)
      .send({ message: "All Jobs deleted", res: deleteRes });
  } catch (err) {
    console.log(err);
  }
};

export const deleteAllLocations = async (req, res) => {
  try {
    const deleteRes = await locationColl.deleteMany({});
    return res
      .status(200)
      .send({ message: "All Locations deleted", res: deleteRes });
  } catch (err) {
    console.log(err);
  }
};

export const deleteAllOrgs = async (req, res) => {
  try {
    const deleteRes = await orgColl.deleteMany({});
    return res
      .status(200)
      .send({ message: "All Orgs deleted", res: deleteRes });
  } catch (err) {
    console.log(err);
  }
};

export const deleteAllServices = async (req, res) => {
  try {
    const deleteRes = await serviceColl.deleteMany({});
    return res
      .status(200)
      .send({ message: "All Services deleted", res: deleteRes });
  } catch (err) {
    console.log(err);
  }
};

export const deleteAllUsers = async (req, res) => {
  try {
    const deleteRes = await userColl.deleteMany({});
    return res
      .status(200)
      .send({ message: "All users deleted", res: deleteRes });
  } catch (err) {
    console.log(err);
  }
};
