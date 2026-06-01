const pool = require("../config/database");

async function createGoal(req, res) {
  const { title, target_amount, current_amount, deadline } = req.body;
  const userId = req.userId;

  if (!title || !target_amount || !deadline) {
    return res.status(400).json({
      error: "Title, target amount, and deadline are required"
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO goals 
       (user_id, title, target_amount, current_amount, deadline)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, target_amount, current_amount || 0, deadline]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Error creating goal" });
  }
}

async function listGoals(req, res) {
  const userId = req.userId;

  try {
    const result = await pool.query(
      "SELECT * FROM goals WHERE user_id = $1 ORDER BY deadline",
      [userId]
    );

    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: "Error listing goals" });
  }
}

async function updateGoal(req, res) {
  const { id } = req.params;
  const { title, target_amount, current_amount, deadline } = req.body;
  const userId = req.userId;

  try {
    const result = await pool.query(
      `UPDATE goals
       SET title = $1,
           target_amount = $2,
           current_amount = $3,
           deadline = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [title, target_amount, current_amount, deadline, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Error updating goal" });
  }
}

async function deleteGoal(req, res) {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const result = await pool.query(
      "DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    return res.json({ message: "Goal successfully removed" });
  } catch (error) {
    return res.status(500).json({ error: "Error removing meta tag" });
  }
}

module.exports = {
  createGoal,
  listGoals,
  updateGoal,
  deleteGoal
};