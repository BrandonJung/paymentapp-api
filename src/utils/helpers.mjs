import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

export const isValidEmail = (email) => {
  // TODO: implement this
  return true;
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
