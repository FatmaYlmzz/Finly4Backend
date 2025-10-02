

const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",  // boşsa ""
  database: process.env.DB_NAME || "finance"
});

db.connect(err => {
  if (err) {
    console.error("DB Bağlantı hatası:", err);
  } else {
    console.log("DB Bağlantısı başarılı ✅");
  }
});

module.exports = db;
