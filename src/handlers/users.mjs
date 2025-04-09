import { ObjectId } from "mongodb";
import { database } from "../../config.mjs";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  getTimeUTC,
  hashPassword,
  hashToken,
} from "../utils/helpers.mjs";

const userColl = database.collection("users");
const refreshTokenAge = 30 * 24 * 60 * 60 * 1000;

export const retrieveUserData = async (req, res) => {
  const {
    userId,
    query: { fields = [] },
  } = req;
  if (!userId) {
    return res.status(400).send({ message: "Invalid user id" });
  }
  try {
    const userProfile = await findUserById(userId, fields);
    console.log("Retrieve User Data", userProfile);
    return res.status(200).send({ message: "hey", user: userProfile });
  } catch (err) {
    console.log(err);
  }
};

export const createUser = async (req, res) => {
  const {
    body: { email, password },
  } = req;
  const hPassword = await hashPassword(password);
  try {
    const foundUser = await findUserByEmail(email);
    if (foundUser) {
      return res.status(400).send({ message: "Email already used" });
    }

    const timestamp = getTimeUTC();

    const userObj = {
      email,
      password: hPassword,
      createdAt: timestamp,
      updatedAt: timestamp,
      emailVerified: false,
      lastLogin: timestamp,
      role: "TO IMPLEMENT",
    };

    const newUser = await userColl.insertOne(userObj);

    const user = await findUserByEmail(email);

    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id }, "30d");

    const hashedRefreshToken = await hashToken(refreshToken);

    const timestamp2 = getTimeUTC();

    const updatedUser = await userColl.updateOne(
      {
        _id: user._id,
      },
      {
        $set: { refreshToken: hashedRefreshToken, updatedAt: timestamp2 },
      }
    );

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: refreshTokenAge,
      })
      .send({ messsage: "User created", userId: user._id, accessToken });
  } catch (err) {
    console.log(err);
  }
};

export const newAccessToken = async (req, res) => {
  const { userId } = req.body;
  console.log("New access token: ", req.body, req.cookies["refreshToken"]);
  const refreshToken = req.cookies["refreshToken"];
  if (!refreshToken) {
    return res.status(401).send({ message: "Invalid refresh token" });
  }

  if (!userId) {
    return res.status(400).send({ message: "No user Id" });
  }

  const user = await findUserById(userId);

  const accessToken = generateAccessToken({ id: user._id });
  const newRefreshToken = generateRefreshToken({ id: user._id }, "30d");

  const hashedRefreshToken = await hashToken(newRefreshToken);

  const timestamp = getTimeUTC();

  const updatedUser = await userColl.updateOne(
    {
      _id: userId,
    },
    {
      $set: { refreshToken: hashedRefreshToken, updatedAt: timestamp },
    }
  );

  return res
    .status(200)
    .cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      maxAge: refreshTokenAge,
    })
    .send({ message: "Token given", accessToken });
};

export const loginUser = async (req, res) => {
  const {
    body: { email, password },
  } = req;
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).send({ message: "User does not exist" });
    }
    const passwordIsCorrect = await comparePassword(password, user.password);
    if (!passwordIsCorrect) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    const timestamp = getTimeUTC();
    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id }, "30d");

    const hashedRefreshToken = await hashToken(refreshToken);

    const updatedUser = await userColl.updateOne(
      { _id: user._id },
      {
        $set: {
          refreshToken: hashedRefreshToken,
          updatedAt: timestamp,
          lastLogin: timestamp,
        },
      }
    );

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: refreshTokenAge,
      })
      .send({ message: "User logged in", userId: user._id, accessToken });
  } catch (err) {
    console.log(err);
  }
};

export const logoutUser = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.sendStatus(400);
  }

  const user = await findUserById(userId);

  if (!user) {
    return res.sendStatus(400);
  }

  const timestamp = getTimeUTC();

  const updatedUser = await userColl.updateOne(
    {
      _id: new ObjectId(userId),
    },
    {
      $unset: { refreshToken: 1 },
    },
    {
      $set: {
        updatedAt: timestamp,
      },
    }
  );

  res.clearCookie("refreshToken", { httpOnly: true });
  return res.status(200).send({ message: "Successfully logged out" });
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

export const findUserByEmail = async (email) => {
  const foundUser = await userColl.findOne({ email: email });
  console.log("Found user by email: ", email, foundUser);
  return foundUser;
};

export const findUserById = async (id, fields) => {
  let retFields = {};
  if (fields && fields.length > 0) {
    let splitFields = fields.split(",");
    for (let field of splitFields) {
      retFields[field] = 1;
    }
  }

  const foundUser = await userColl.findOne(
    {
      _id: ObjectId.createFromHexString(id),
    },
    { projection: retFields }
  );
  console.log("Found user by id: ", foundUser);
  return foundUser;
};
