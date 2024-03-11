const { pool } = require("../dbconfig");
const { createTablAccount } = require("../model/account");
const validator = require("validator");
const bcrypt = require("bcrypt");

// const GetAllStudent = (req, res) => {
//   pool.query("SELECT * from student where 1", (error, results, fields) => {
//     if (error) {
//       console.log(error);
//       return res.status(500).json({ error: "Internal Server Error", error });
//     }

//     return res.status(200).json({ data: results, message: "Student Record" });
//   });
// };


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
      req.body.birthday
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
              return res.status(500).json({ error: "Error during table creation" });
            }
          });
        } else {
          // Table exists, check for existing email or phone
          const checkExistingQuery = `
            SELECT * FROM Account WHERE email = ? OR phone = ?
          `;

          const existingParams = [req.body.email, req.body.phone];

          pool.query(checkExistingQuery, existingParams, async (error, results) => {
            if (error) {
              console.error("Error checking for existing email/phone:", error);
              return res.status(500).json({ error: "Internal Server Error" });
            }

            if (results.length > 0) {
              // Email or phone number already exists
              return res.status(400).json({ status: 400, error: "Email or phone number already in use" });
            }

            console.log("Further execution");

            const characters =
              "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

            let randomString = "";
            let length = 10;

            for (let i = 0; i < length; i++) {
              const randomIndex = Math.floor(Math.random() * characters.length);
              randomString += characters.charAt(randomIndex);
            }
            const truncatedHashedPassword = await bcrypt.hash(randomString, 10);
            const hashedPassword = truncatedHashedPassword.substring(0, 50);

            const timestampInMilliseconds = req.body.birthday;
            const date = new Date(timestampInMilliseconds);
            const birthdayformattedDate = date.toISOString().slice(0, 10);

            let created_at = Date.now();

            const created_attimestampInMilliseconds = created_at;
            const created_adate = new Date(created_attimestampInMilliseconds);
            const created_adateformattedDatetime = created_adate.toISOString().slice(0, 19).replace("T", " ");

            const insertDataQuery = `
              INSERT INTO Account (id, first_name, last_name, email, phone, password, birthday, created_at)
              VALUES (${req.body.id}, "${req.body.first_name}","${req.body.last_name}",
              "${req.body.email}","${req.body.phone}","${hashedPassword}",
              "${birthdayformattedDate}", "${created_adateformattedDatetime}")
            `;

            pool.query(insertDataQuery, (error, results) => {
              console.log(error, results);
              if (error) {
                return res.status(500).json({ error: "Internal Server Error" });
              }

              res.json({ message: "Data inserted successfully!" });
            });
          });
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

const GetAllStudent = (req, res) => {
  // Extract filters from request query parameters
  const { id, name, age } = req.query;

  // Build the SQL query based on the provided filters
  let query = "SELECT * FROM student WHERE 1";
  const values = [];

  if (id) {
    query += " AND id = ?";
    values.push(id);
  }

  if (name) {
    query += " AND name LIKE ?";
    values.push(`%${name}%`);
  }

  if (age) {
    query += " AND age = ?";
    values.push(age);
  }

  // Execute the SQL query
  pool.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error", error });
    }

    return res.status(200).json({ data: results, message: "Student Record" });
  });
};

const UpdateStudent = (req, res) => {
  // Extract filters from request query parameters
  const { id, name, age } = req.query;

  // Build the SQL query based on the provided filters
  let query = "UPDATE student SET ";
  const values = [];

  if (name) {
    query += "name = ?";
    values.push(name);
  }

  if (age) {
    if (values.length > 0) {
      query += ", ";
    }
    query += "age = ?";
    values.push(age);
  }

  query += " WHERE 1";

  if (id) {
    query += " AND id = ?";
    values.push(id);
  }

  // Execute the SQL query
  pool.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error", error });
    }

    return res
      .status(200)
      .json({ data: results, message: "Student Record updated successfully" });
  });
};

const DeleteStudent = (req, res) => {
  // Extract filters from request query parameters
  const { id, name, age } = req.query;

  // Build the SQL query based on the provided filters
  let query = "DELETE FROM student WHERE ";
  const conditions = [];
  const values = [];

  if (name) {
    conditions.push("name = ?");
    values.push(name);
  }

  if (age) {
    conditions.push("age = ?");
    values.push(age);
  }

  if (id) {
    conditions.push("id = ?");
    values.push(id);
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
};

module.exports = { GetAllStudent, CreateAccount, UpdateStudent, DeleteStudent };
