// import * as validator from "express-validator";
// import * as helpers from "../utils/helpers";
// const {
//   getUserByIdHandler,
//   createUserHandler,
// } = require("../handlers/users.mjs");
// const { mockUsers } = require("../utils/constants.mjs");

// jest.mock("express-validator", () => ({
//   validationResult: jest.fn(() => ({
//     isEmpty: jest.fn(() => false),
//     array: jest.fn(() => [{ message: "Invalid Field" }]),
//   })),
//   matchedData: jest.fn(() => ({
//     username: "test",
//     password: "password",
//     displayName: "test_name",
//   })),
// }));

// jest.mock("../utils/helpers", () => ({
//   hashPassword: jest.fn((password) => `hashed_${password}`),
// }));

// const mockRequest = {
//   findUserIndex: 1,
// };

// const mockResponse = {
//   sendStatus: jest.fn(),
//   send: jest.fn(),
//   status: jest.fn(() => mockResponse),
// };

// describe("get users", () => {
//   //   beforeEach(() => {
//   //     jest.clearAllMocks();
//   //   });

//   it("should get users by id", () => {
//     getUserByIdHandler(mockRequest, mockResponse);
//     expect(mockResponse.send).toHaveBeenCalled();
//     expect(mockResponse.send).toHaveBeenCalledWith(mockUsers[[1]]);
//     expect(mockResponse.send).toHaveBeenCalledTimes(1);
//   });

//   it("should call sendStatus with 404 when user not found", () => {
//     const copyMockRequest = { ...mockRequest, findUserIndex: 100 };
//     getUserByIdHandler(copyMockRequest, mockResponse);
//     expect(mockResponse.sendStatus).toHaveBeenCalled();
//     expect(mockResponse.sendStatus).toHaveBeenCalledWith(404);
//     expect(mockResponse.sendStatus).toHaveBeenCalledTimes(1);
//     expect(mockResponse.send).not.toHaveBeenCalled();
//   });
// });

// describe("create users", () => {
//   const mockRequest = {};

//   it("should return status 400 when there are errors", async () => {
//     await createUserHandler(mockRequest, mockResponse);
//     expect(validator.validationResult).toHaveBeenCalled();
//     expect(validator.validationResult).toHaveBeenCalledWith(mockRequest);
//     expect(mockResponse.status).toHaveBeenCalledWith(400);
//     expect(mockResponse.send).toHaveBeenCalledWith([
//       { message: "Invalid Field" },
//     ]);
//   });

//   it("should return status of 201 and the user created", async () => {
//     jest.spyOn(validator, "validationResult").mockImplementationOnce(() => ({
//       isEmpty: jest.fn(() => true),
//     }));
//     await createUserHandler(mockRequest, mockResponse);
//     expect(validator.matchedData).toHaveBeenCalledWith(mockRequest);
//     expect(helpers.hashPassword).toHaveBeenCalledWith("password");
//     expect(helpers.hashPassword).toHaveReturnedWith(`hashed_password`);
//   });
// });
