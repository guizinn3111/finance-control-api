const express = require("express");
const router = express.Router();

const goalController = require("../controllers/goalController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.post("/", goalController.createGoal);
router.get("/", goalController.listGoals);
router.put("/:id", goalController.updateGoal);
router.delete("/:id", goalController.deleteGoal);

module.exports = router;