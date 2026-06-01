const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/monthly", reportController.getMonthlyReport);
router.get("/category-expenses", reportController.getExpensesByCategory);
router.get("/alerts", reportController.getSpendingAlerts);

module.exports = router;