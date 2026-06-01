const pool = require("../config/database");

async function getMonthlyReport(req, res) {
  const userId = req.userId;
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({
      error: "Mês e ano são obrigatórios. Exemplo: ?month=5&year=2026"
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS balance
      FROM transactions
      WHERE user_id = $1
      AND EXTRACT(MONTH FROM transaction_date) = $2
      AND EXTRACT(YEAR FROM transaction_date) = $3
      `,
      [userId, month, year]
    );

    return res.json({
      month: Number(month),
      year: Number(year),
      total_income: Number(result.rows[0].total_income),
      total_expense: Number(result.rows[0].total_expense),
      balance: Number(result.rows[0].balance)
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error generating monthly report"
    });
  }
}

async function getExpensesByCategory(req, res) {
  const userId = req.userId;
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({
      error: "The month and year are required."
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        categories.name AS category,
        SUM(transactions.amount) AS total
      FROM transactions
      LEFT JOIN categories ON categories.id = transactions.category_id
      WHERE transactions.user_id = $1
      AND transactions.type = 'expense'
      AND EXTRACT(MONTH FROM transactions.transaction_date) = $2
      AND EXTRACT(YEAR FROM transactions.transaction_date) = $3
      GROUP BY categories.name
      ORDER BY total DESC
      `,
      [userId, month, year]
    );

    return res.json({
      month: Number(month),
      year: Number(year),
      data: result.rows.map(item => ({
        category: item.category || "whitout category",
        total: Number(item.total)
      }))
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error generating a report by category"
    });
  }
}

async function getSpendingAlerts(req, res) {
  const userId = req.userId;
  const { month, year, limit } = req.query;

  if (!month || !year || !limit) {
    return res.status(400).json({
      error: "Month, year, and limit are required."
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        COALESCE(SUM(amount), 0) AS total_expense
      FROM transactions
      WHERE user_id = $1
      AND type = 'expense'
      AND EXTRACT(MONTH FROM transaction_date) = $2
      AND EXTRACT(YEAR FROM transaction_date) = $3
      `,
      [userId, month, year]
    );

    const totalExpense = Number(result.rows[0].total_expense);
    const spendingLimit = Number(limit);

    if (totalExpense > spendingLimit) {
      return res.json({
        alert: true,
        message: "You have exceeded the spending limit set for this month.",
        total_expense: totalExpense,
        limit: spendingLimit,
        exceeded_by: totalExpense - spendingLimit
      });
    }

    return res.json({
      alert: false,
      message: "Your expenses are within the set limit.",
      total_expense: totalExpense,
      limit: spendingLimit,
      remaining: spendingLimit - totalExpense
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error checking spending alerts."
    });
  }
}

module.exports = {
  getMonthlyReport,
  getExpensesByCategory,
  getSpendingAlerts
};