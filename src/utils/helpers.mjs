import bcrypt from "bcrypt";

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
