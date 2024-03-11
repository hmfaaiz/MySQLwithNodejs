const express = require("express");
const route = express.Router();

const {
  GetUser,
  CreateAccount,
  UpdateUser,
  DeleteUser,
} = require("../controller/account");

route.get("/", (req, res) => {
//   GetUser(req, res);
 res.send("Welcome  to Account")
});

route.post("/CreateAccount", (req, res) => {
  CreateAccount(req, res);
});

route.put("/UpdateUser", (req, res) => {
  UpdateUser(req, res);
});

route.delete("/DeleteUser", (req, res) => {
  DeleteUser(req, res);
});

module.exports = route;
