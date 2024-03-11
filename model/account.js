
const createTablAccount = `
CREATE TABLE IF NOT EXISTS Account (
  id INT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(16) UNIQUE NOT NULL,
  password VARCHAR(60) NOT NULL,
  birthday Date NOT NULL,
  created_at DATETIME NOT NULL,
  last_modified DATETIME
  
)
`;

module.exports={createTablAccount}