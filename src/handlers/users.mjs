import { ObjectId } from "mongodb";
import { database } from "../../config.mjs";
import { hashPassword } from "../utils/helpers.mjs";

const userColl = database.collection("users");

export const createUser = async (req, res) => {
  const {
    body: { email, password },
  } = req;
  const hPassword = await hashPassword(password);
  try {
    const newUser = await userColl.insertOne({
      email,
      password: hPassword,
    });
    return res.status(200).send({ messsage: "User created", user: newUser });
  } catch (err) {
    console.log(err);
  }
};

export const loginUser = (req, res) => {
  return res.send({ message: "User logged in" });
};

export const logoutUser = (req, res) => {
  if (!req.user) return res.sendStatus(401);
  req.logout((err) => {
    if (err) {
      return res.sendStatus(400);
    }
    res.send(200);
  });
};

export const getUserById = async (req, res) => {
  const {
    query: { id },
  } = req;
  try {
    const foundUser = await findUserById(id);
    if (!foundUser) {
      throw new Error("User not found");
    }
    return res.status(200).send(foundUser);
  } catch (err) {
    console.log(err);
  }
};

export const findUserByEmail = async (email) => {
  const foundUser = await userColl.findOne({ email: email });
  console.log("Found user by email: ", email, foundUser);
  return foundUser;
};

export const findUserById = async (id) => {
  const foundUser = await userColl.findOne({ _id: new ObjectId(id) });
  console.log("Found user by id: ", id, foundUser);
  return foundUser;
};
