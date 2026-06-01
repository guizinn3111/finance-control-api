const pool = require("../config/database");

async function createCategory(req, res) {
  const { name, type } = req.body;
  const userId = req.userId;

  if (!name || !type) {
    return res.status(400).json({ error: "Name and type are required" });
  }

  if (!["income", "expense"].includes(type)) {
    return res.status(400).json({ error: "The type must be either income or expense" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO categories (user_id, name, type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, name, type]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Error creating category" });
  }
}

async function listCategories(req, res) {
  const userId = req.userId;

  try {
    const result = await pool.query(
      "SELECT * FROM categories WHERE user_id = $1 ORDER BY name",
      [userId]
    );

    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: "Error listing categories" });
  }
}

async function deleteCategory(req, res) {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.json({ message: "Category successfully removed" });
  } catch (error) {
    return res.status(500).json({ error: "Error removing category" });
  }
}

module.exports = {
  createCategory,
  listCategories,
  deleteCategory
};