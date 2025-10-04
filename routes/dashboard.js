
const express = require("express");
const db = require("../db");
const verifyToken = require("../middlware/auth");

const router = express.Router();


router.get("/dashboard", verifyToken, async (req, res) => {
  const userId = req.userId;

  console.log(" Dashboard isteği alındı, userId:", userId);

  try {
    // Toplam gelir
    const [incomeRows] = await db.promise().query(
      `SELECT IFNULL(SUM(amount), 0) as totalIncome 
       FROM transactions WHERE user_id=? AND type='income'`,
      [userId]
    );

    // Toplam gider
    const [expenseRows] = await db.promise().query(
      `SELECT IFNULL(SUM(amount), 0) as totalExpense 
       FROM transactions WHERE user_id=? AND type='expense'`,
      [userId]
    );

    // Son 5 gelir
    const [incomes] = await db.promise().query(
      `SELECT id, title, amount, currency, date, note 
       FROM transactions 
       WHERE user_id=? AND type='income' 
       ORDER BY date DESC LIMIT 5`,
      [userId]
    );

    // Son 5 gider
    const [expenses] = await db.promise().query(
      `SELECT id, title, amount, currency, date, note, category
       FROM transactions 
       WHERE user_id=? AND type='expense' 
       ORDER BY date DESC LIMIT 5`,
      [userId]
    );

    const totalIncome = parseFloat(incomeRows[0].totalIncome) || 0;
    const totalExpense = parseFloat(expenseRows[0].totalExpense) || 0;
    const balance = totalIncome - totalExpense;

    console.log(" Dashboard Hesaplamaları:", {
      totalIncome,
      totalExpense,
      balance,
      gelirSayisi: incomes.length,
      giderSayisi: expenses.length
    });

    res.json({
      success: true,
      totalIncome,
      totalExpense,
      balance,
      incomes,
      expenses,
    });
  } catch (err) {
    console.error(" Dashboard Route Hatası:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

