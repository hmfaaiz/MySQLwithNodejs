const { pool } = require("../dbconfig");
const { createTablAccount } = require("../model/account");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { GenerateToken, Authentication } = require("../security/authentication");
const {mailsender}=require("../emailNotification/emailSetup");

const CreateAccount = async (req, res) => {
  try {
    if (
      req.body.id &&
      req.body.first_name &&
      req.body.last_name &&
      req.body.email &&
      validator.isEmail(req.body.email) &&
      req.body.phone &&
      req.body.password &&
      req.body.birthday &&
      validator.isISO8601(req.body.birthday)
    ) {
      const checkTableQuery = `
        SHOW TABLES LIKE 'Account'
      `;

      pool.query(checkTableQuery, (error, results) => {
        if (error) {
          console.error("Error checking for table existence:", error);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
          // Table does not exist, so create it
          console.log("Account table is created");
          pool.query(createTablAccount, (error) => {
            if (error) {
              console.error("Error during creation of table:", error);
              return res
                .status(500)
                .json({ error: "Error during table creation" });
            }
          });
        } else {
          // Table exists, check for existing email or phone
          const checkExistingQuery = `
            SELECT * FROM Account WHERE email = ? OR phone = ?
          `;

          const existingParams = [req.body.email, req.body.phone];

          pool.query(
            checkExistingQuery,
            existingParams,
            async (error, results) => {
              if (error) {
                console.error(
                  "Error checking for existing email/phone:",
                  error
                );
                return res.status(500).json({ error: "Internal Server Error" });
              }

              if (results.length > 0) {
                // Email or phone number already exists
                return res.status(400).json({
                  status: 400,
                  error: "Email or phone number already in use",
                });
              }

           

  
              const truncatedHashedPassword = await bcrypt.hash(
                req.body.password,
                10
              );
              const hashedPassword = truncatedHashedPassword.substring(0, 60);

              const timestampInMilliseconds = req.body.birthday;
              const date = new Date(timestampInMilliseconds);
              const birthdayformattedDate = date.toISOString().slice(0, 10);

              let created_at = Date.now();

              const created_attimestampInMilliseconds = created_at;
              const created_adate = new Date(created_attimestampInMilliseconds);
              const created_adateformattedDatetime = created_adate
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");

              const insertDataQuery = `
              INSERT INTO Account (id, first_name, last_name, email, phone, password, birthday, created_at)
              VALUES (${req.body.id}, "${req.body.first_name}","${req.body.last_name}",
              "${req.body.email}","${req.body.phone}","${hashedPassword}",
              "${birthdayformattedDate}", "${created_adateformattedDatetime}")
            `;

              pool.query(insertDataQuery,async (error, results) => {
                console.log(error, results);
                if (error) {
                  return res
                    .status(500)
                    .json({ error: "Internal Server Error" });
                }
             let emailsend= await mailsender(req.body.first_name)
                res.json({ message: "Data inserted successfully!" });
              });
            }
          );
        }
      });
    } else {
      return res
        .status(404)
        .json({ status: 404, message: "Incomplete data provided" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ status: 500, message: "Internal error", error });
  }
};

const GetAccount = (req, res) => {
  // Extract filters from request query parameters
  try {
    const { id, first_name, last_name, email, phone } = req.query;

    // Build the SQL query based on the provided filters
    let query = "SELECT * FROM Account WHERE 1";
    const values = [];

    if (id) {
      query += " AND id = ?";
      values.push(id);
    }

    if (first_name) {
      query += " AND first_name LIKE ?";
      values.push(`%${first_name}%`);
    }
    if (last_name) {
      query += " AND last_name LIKE ?";
      values.push(`%${last_name}%`);
    }

    if (email) {
      query += " AND email = ?";
      values.push(email);
    }
    if (phone) {
      query += " AND phone = ?";
      values.push(phone);
    }

    // Execute the SQL query
    pool.query(query, values, (error, results, fields) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .json({ status: 500, error: "Internal Server Error", error });
      }

      return res.status(200).json({
        status: 200,
        message: "Account Record",
        Total: results.length,
        data: results,
      });
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ status: 500, message: "Internal error", error });
  }
};

const UserLogin = async (req, res) => {
  try {
    if (
      req.body.email &&
      validator.isEmail(req.body.email) &&
      req.body.password
    ) {
      const userEmail = req.body.email;
      const userPassword = req.body.password;
      const value = [userEmail];
      let query = "SELECT * FROM Account WHERE email=?";
      let user;
      pool.query(query, value, async (error, results, fields) => {
        if (error) {
          console.log(error);
          return res
            .status(500)
            .json({ status: 500, error: "Internal Server Error", error });
        }
        console.log(results);

        user = results;

        if (user.length > 0) {
          //checking password
          console.log("isPa", userPassword, user[0].password);
          let tomatch = user[0].password;
          const isPasswordMatch = await bcrypt.compare(userPassword, tomatch);

          if (isPasswordMatch) {
            const { id, email, first_name, ...other } = user[0];
            const forToken = {
              email,
              email,
              first_name,
              id,
            };
            await GenerateToken(forToken, res);
          } else {
            return res
              .status(404)
              .json({ status: 404, message: "password is wrong" });
          }
        } else {
          return res
            .status(404)
            .json({ status: 404, message: "user does not exist" });
        }
      });
    } else {
      return res
        .status(400)
        .json({ status: 400, message: "please enter your credentials" });
    }
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal error" });
  }
};


const UpdateAccount = async (req, res) => {
  Authentication(req, res, async (user) => {
    try {
      console.log(req.query);
      if (!req.query) {
        return res
          .status(404)
          .json({ status: 404, message: "Invalid data provided" });
      }

      const { first_name, last_name, email } = req.query;

      let query = "UPDATE Account SET ";
      const values = [];

      if (first_name) {
        query += "first_name = ?, ";
        values.push(first_name);
      }

      if (last_name) {
        query += "last_name = ?, ";
        values.push(last_name);
      }

      if (email) {
        query += "email = ?, ";
        values.push(email);
      }

      let updated_at = Date.now();

      const updated_attimestampInMilliseconds = updated_at;
      const updated_atdate = new Date(updated_attimestampInMilliseconds);
      const updated_atdateformattedDatetime = updated_atdate
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      query += "last_modified = ? ";
      values.push(updated_atdateformattedDatetime);

      query += `WHERE id = ${user.id}`;

      // Execute the SQL query
      pool.query(query, values, (error, results, fields) => {
        if (error) {
          console.log(error);
          return res
            .status(500)
            .json({ status: 500, message: "Internal Server Error" });
        }

        return res
          .status(200)
          .json({
            data: results,
            message: "Your Account updated successfully",
          });
      });
    } catch (error) {
      console.error("Error:", error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal error", error });
    }
  });
};



const DeleteAccount = async (req, res) => {
  try {
    Authentication(req, res, async (user) => {
      const { id, first_name, last_name, email } = req.query;

      if(id || first_name ||  last_name || email){
         // Build the SQL query based on the provided filters
      let query = "DELETE FROM Account WHERE ";
      const conditions = [];
      const values = [];

      if (first_name) {
        conditions.push("first_name = ?");
        values.push(first_name);
      }

      if (last_name) {
        conditions.push("last_name = ?");
        values.push(last_name);
      }

      if (id) {
        conditions.push("id = ?");
        values.push(id);
      }

      if (email) {
        conditions.push("email = ?");
        values.push(email);
      }

      query += conditions.join(" AND ");

      // Execute the SQL query
      pool.query(query, values, (error, results, fields) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ error: "Internal Server Error", error });
        }

        return res
          .status(200)
          .json({ data: results, message: "Student Record deleted successfully" });
      });
    
       
      }
      else{
        return res
        .status(404)
        .json({ status: 404, message: "Invalid data provided" });
      }

    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = {
  GetAccount,
  CreateAccount,
  UpdateAccount,
  DeleteAccount,
  UserLogin,
};
