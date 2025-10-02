/*require('dotenv').config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");


const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Rotalar
app.use("/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

app.use("/dashboard", require("./routes/dashboard"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor 🚀`);
}); son 1*/

require('dotenv').config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Rotalar
app.use("/auth", authRoutes);
app.use("/api", transactionRoutes); // artık tüm transaction route'ları /api/... altında
app.use("/api", dashboardRoutes); // dashboard da /api/dashboard altında

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor 🚀`);
});
