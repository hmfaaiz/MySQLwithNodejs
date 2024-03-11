const express = require("express");
const route = express.Router();

const {
  GetAccount,
  CreateAccount,
  UpdateAccount,
  DeleteAccount,UserLogin
} = require("../controller/account");

route.get("/", (req, res) => {
//   GetUser(req, res);
 res.send("Welcome  to Account")
});

route.get("/GetAccount", (req, res) => {
  GetAccount(req, res);
});
route.post("/CreateAccount", (req, res) => {
  CreateAccount(req, res);
});

route.put("/UpdateAccount", (req, res) => {
  UpdateAccount(req, res);
});

route.delete("/DeleteAccount", (req, res) => {
  DeleteAccount(req, res);
});

route.post("/UserLogin", (req, res) => {
  UserLogin(req, res);
});

module.exports = route;
