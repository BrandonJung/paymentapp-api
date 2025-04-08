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
  const resToken = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: expire,
  });
  return resToken;
};

export const generateRefreshToken = (payload = {}, expire = "30d") => {
  const resToken = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: expire,
  });
  return resToken;
};
