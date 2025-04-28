import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const saltRounds = 10;

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const comparePassword = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed);
};

export const hashToken = async (token) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedToken = await bcrypt.hash(token, salt);
  return hashedToken;
};

export const compareToken = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed);
};

export const getTimeUTC = () => {
  const timestamp = new Date().getTime();
  return timestamp;
};

export const generateAccessToken = (payload = {}, expire = "60s") => {
  const resToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: expire,
  });
  return resToken;
};

export const generateRefreshToken = (payload = {}, expire = "30d") => {
  const resToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: expire,
  });
  return resToken;
};

export const generateTokens = async (
  userId,
  expireAccess = "60s",
  expireRefresh = "30d"
) => {
  const accessToken = generateAccessToken({ id: userId }, expireAccess);
  const refreshToken = generateRefreshToken({ id: userId }, expireRefresh);
  const hashedRefreshToken = await hashToken(refreshToken);

  return { accessToken, refreshToken, hashedRefreshToken };
};

export const validateRefreshToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET_KEY
    );
    return { valid: true, expired: false, decoded };
  } catch (err) {
    return {
      valid: false,
      expired: err.name === "TokenExpiredError",
      decoded: null,
    };
  }
};

export const validateNewCustomer = (newCustomer) => {
  return true;
};

export const validateNewLocation = (newLocation) => {
  return true;
};

export const validateNewServices = (newServices) => {
  return true;
};

export const validateNewDate = (newDate) => {
  return true;
};

export const newValidityObject = (valid = true, message = "") => {
  const ret = { valid, message };
  return ret;
};

export const createDateObj = (passedDate) => {
  if (!passedDate || passedDate === "") {
    return {};
  }
  const date = new Date(passedDate);

  const utcString = date.toUTCString();

  const dateString = date.toDateString();

  return {
    utc: utcString,
    dateString,
  };
};

export const errorHandler = (err, req, res, next) => {
  console.log(`Error: ${req.method} ${req.originalUrl}`, err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).send({ message });
};

export const ensureObjectId = (id) => {
  if (typeof id === "string") {
    return ObjectId.createFromHexString(id);
  } else {
    return id;
  }
};

export const toFixedNumber = (num, digits = 2, base = 10) => {
  const pow = Math.pow(base, digits);
  return Math.round(num * pow) / pow;
};

export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return newValidityObject(false, "Invalid email");
  }
  return newValidityObject(true);
};

export const validatePhone = (phone) => {
  // Example regex for US phone numbers
  const phoneRegex = /^(?:\+1\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

  if (!phoneRegex.test(phone)) {
    return newValidityObject(false, "Invalid phone number");
  }
  return newValidityObject(true);
};

export const convertPriceToDisplay = (price) => {
  if (isNaN(price) || price === null) return price;
  let retPrice = price / 100;
  return retPrice;
};
