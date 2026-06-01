const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const transactionRoutes = require("./routes/transaction.routes");
const goalRoutes = require("./routes/goal.routes");
const reportRoutes = require("./routes/report.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Personal Financial Management API is up and running"
  });
});

module.exports = app;