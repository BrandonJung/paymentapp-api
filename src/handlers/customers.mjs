export const createCustomer = async (req, res, next) => {
  return res.send({ message: "Create customer" });
};

export const updateCustomer = async (req, res, next) => {
  return res.send({ message: "Update entire customer" });
};

export const updateCustomerFields = async (req, res, next) => {
  return res.send({ message: "Update customer fields" });
};
