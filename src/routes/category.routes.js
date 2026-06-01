const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.post("/", categoryController.createCategory);
router.get("/", categoryController.listCategories);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;