import { database } from "../../config.mjs";
import {
  comparePassword,
  ensureObjectId,
  generateTokens,
  getTimeUTC,
  hashPassword,
  validateRefreshToken,
} from "../utils/helpers.mjs";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.mjs";

const userColl = database.collection("users");
const refreshTokenAge = 30 * 24 * 60 * 60 * 1000;

export const retrieveUserData = async (req, res, next) => {
  const {
    userId,
    query: { fields = [] },
  } = req;
  if (!userId) {
    return next(new BadRequestError("Invalid user id"));
  }
  try {
    const userProfile = await findUserById(userId, fields);

    if (!userProfile) {
      return next(new NotFoundError("User does not exist"));
    }

    console.log("Retrieve User Data", userProfile);
    return res.status(200).send({ message: "hey", user: userProfile });
  } catch (err) {
    console.log(err);
  }
};

export const createAdminUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const foundUser = await findUserByEmail(email);
    if (foundUser) {
      return next(new BadRequestError("Email already used"));
    }
    if (!password) {
      return next(new BadRequestError("No password provided"));
    }

    const hPassword = await hashPassword(password);
    const timestamp = getTimeUTC();

    const userObj = {
      email,
      password: hPassword,
      createdAt: timestamp,
      updatedAt: timestamp,
      emailVerified: false,
      lastLogin: timestamp,
      roles: ["admin"],
      active: true,
    };

    const { insertedId } = await userColl.insertOne(userObj);

    const user = await findUserById(insertedId.toString());

    if (!user) {
      return next(new NotFoundError("User does not exist"));
    }

    const { accessToken, refreshToken, hashedRefreshToken } =
      await generateTokens(user._id);

    const timestamp2 = getTimeUTC();

    await userColl.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          refreshToken: hashedRefreshToken,
          updatedAt: timestamp2,
          updatedBy: ensureObjectId(user._id),
        },
      }
    );

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: refreshTokenAge,
      })
      .send({
        messsage: "User created",
        userId: user._id,
        accessToken,
        userHasOrg: false,
      });
  } catch (err) {
    next(err);
  }
};

export const newAccessToken = async (req, res, next) => {
  const { userId } = req.body;
  console.log("New access token: ", req.cookies["refreshToken"]);
  const cRefreshToken = req.cookies["refreshToken"];
  if (!cRefreshToken) {
    return next(new UnauthorizedError("No refresh token"));
  }

  if (!userId) {
    return next(new BadRequestError("Invalid user id"));
  }
  try {
    const { valid, expired, decoded } = validateRefreshToken(cRefreshToken);

    if (!valid) {
      return next(new UnauthorizedError("Invalid refresh token"));
    }
    if (expired) {
      return next(new UnauthorizedError("Expired refresh token"));
    }

    const user = await findUserById(userId);

    if (!user) {
      return next(new NotFoundError("User does not exist"));
    }

    const { accessToken, refreshToken, hashedRefreshToken } =
      await generateTokens(userId);

    const timestamp = getTimeUTC();

    await userColl.updateOne(
      {
        _id: userId,
      },
      {
        $set: {
          refreshToken: hashedRefreshToken,
          updatedAt: timestamp,
          updatedBy: ensureObjectId(user._id),
        },
      }
    );

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: refreshTokenAge,
      })
      .send({ message: "Token given", accessToken });
  } catch (err) {
    console.log(err);
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email) {
      return next(new BadRequestError("No email"));
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return next(new BadRequestError("Invalid user id"));
    }
    if (!password) {
      return next(new BadRequestError("No password"));
    }
    const passwordIsCorrect = await comparePassword(password, user.password);
    if (!passwordIsCorrect) {
      return next(new BadRequestError("Invalid credentials"));
    }

    const timestamp = getTimeUTC();

    const { accessToken, refreshToken, hashedRefreshToken } =
      await generateTokens(user._id);

    await userColl.updateOne(
      { _id: user._id },
      {
        $set: {
          refreshToken: hashedRefreshToken,
          updatedAt: timestamp,
          updatedBy: ensureObjectId(user._id),
          lastLogin: timestamp,
        },
      }
    );

    const userHasOrg = user?.organization?.id ? true : false;

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: refreshTokenAge,
      })
      .send({
        message: "User logged in",
        userId: user._id,
        accessToken,
        userHasOrg,
      });
  } catch (err) {
    console.log(err);
  }
};

export const logoutUser = async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new BadRequestError("Invalid user id"));
  }

  try {
    const user = await findUserById(userId);

    if (!user) {
      return next(new NotFoundError("User does not exist"));
    }

    const timestamp = getTimeUTC();

    await userColl.updateOne(
      {
        _id: ensureObjectId(userId),
      },
      {
        $unset: { refreshToken: 1 },
      },
      {
        $set: {
          updatedAt: timestamp,
          updatedBy: ensureObjectId(user._id),
        },
      }
    );

    res.clearCookie("refreshToken", { httpOnly: true });
    return res.status(200).send({ message: "Successfully logged out" });
  } catch (err) {
    console.log(err);
  }
};

export const findUserByEmail = async (email, fields) => {
  if (!email) {
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

    const foundUser = await userColl.findOne(
      { email: email, roles: { $in: ["admin"] } },
      { projection: retFields }
    );
    console.log("Found user by email: ", email, foundUser);
    return foundUser;
  } catch (err) {
    console.log(err);
  }
};

export const findUserById = async (id, fields) => {
  if (!id || id.length !== 24) {
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

    const foundUser = await userColl.findOne(
      {
        _id: ensureObjectId(id),
        roles: { $in: ["admin"] },
      },
      { projection: retFields }
    );
    console.log("Found user by id: ", foundUser);
    return foundUser;
  } catch (err) {
    console.log(err);
  }
};
