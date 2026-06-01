const pool = require("../config/database");

async function createTransaction(req, res) {
  const { title, amount, type, category_id, transaction_date } = req.body;
  const userId = req.userId;

  if (!title || !amount || !type || !transaction_date) {
    return res.status(400).json({
      error: "Title, amount, type, and date are required"
    });
  }

  if (!["income", "expense"].includes(type)) {
    return res.status(400).json({
      error: "The type must be either “income” or “expense”"
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO transactions 
      (user_id, category_id, title, amount, type, transaction_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [userId, category_id || null, title, amount, type, transaction_date]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Error registering transaction" });
  }
}

async function listTransactions(req, res) {
  const userId = req.userId;

  try {
    const result = await pool.query(
      `SELECT 
        transactions.id,
        transactions.title,
        transactions.amount,
        transactions.type,
        transactions.transaction_date,
        categories.name AS category
      FROM transactions
      LEFT JOIN categories ON categories.id = transactions.category_id
      WHERE transactions.user_id = $1
      ORDER BY transactions.transaction_date DESC`,
      [userId]
    );

    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: "Error listing transactions" });
  }
}

async function updateTransaction(req, res) {
  const { id } = req.params;
  const { title, amount, type, category_id, transaction_date } = req.body;
  const userId = req.userId;

  try {
    const result = await pool.query(
      `UPDATE transactions
       SET title = $1,
           amount = $2,
           type = $3,
           category_id = $4,
           transaction_date = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title, amount, type, category_id || null, transaction_date, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Error updating transaction" });
  }
}

async function deleteTransaction(req, res) {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const result = await pool.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res.json({ message: "Transaction successfully removed" });
  } catch (error) {
    return res.status(500).json({ error: "Error removing transaction" });
  }
}

module.exports = {
  createTransaction,
  listTransactions,
  updateTransaction,
  deleteTransaction
};