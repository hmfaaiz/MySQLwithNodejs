
const createTablAccount = `
CREATE TABLE IF NOT EXISTS Account (
  id INT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(16) NOT NULL,
  password VARCHAR(50) NOT NULL,
  birthday Date NOT NULL,
  created_at DATETIME NOT NULL,
  last_modified DATETIME
  
)
`;

module.exports={createTablAccount}