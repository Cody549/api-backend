const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "shortline.proxy.rlwy.net",
  user: "root",
  password: "NYMfnRcZOhmgICOjKyHVyfsSjINVoGns",
  database: "railway",
  port: 54595,
});

connection.connect((err) => {
  if (err) {
    console.error("Error de conexión:", err);
  } else {
    console.log("Conectado a MySQL 🚀");
  }
});

module.exports = connection;
