// routes/dashboard.js
const express = require("express");
const db = require("../db");
const verifyToken = require("../middlware/auth");

const router = express.Router();

// ✅ DÜZELTİLDİ: Route path'ini düzeltin
// "/dashboard/:userId" yerine sadece "/dashboard" kullanın
// Çünkü userId token'dan geliyor
router.get("/dashboard", verifyToken, async (req, res) => {
  const userId = req.userId;

  console.log("📥 Dashboard isteği alındı, userId:", userId);

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

    console.log("📊 Dashboard Hesaplamaları:", {
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
    console.error("❌ Dashboard Route Hatası:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;


/*const express = require("express");
const db = require("../db");
const verifyToken = require("../middlware/auth");

const router = express.Router();

// Dashboard verileri
router.get("/dashboard/:userId", verifyToken, async (req, res) => {
  const userId = req.userId;

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

    console.log("📊 Dashboard Calculations:", {
      totalIncome,
      totalExpense,
      balance,
      incomeCount: incomes.length,
      expenseCount: expenses.length
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
    console.error("❌ Dashboard Route Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;*/


/*const express = require("express");
const db = require("../db");
const verifyToken = require("../middlware/auth");

const router = express.Router();

// Dashboard verileri
router.get("/dashboard/:userId", verifyToken, async (req, res) => {
  const userId = req.userId; // 👈 token'dan gelen userId (önceden req.user.id idi)

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
      `SELECT * FROM transactions 
       WHERE user_id=? AND type='income' 
       ORDER BY date DESC LIMIT 5`,
      [userId]
    );

    // Son 5 gider
    const [expenses] = await db.promise().query(
      `SELECT * FROM transactions 
       WHERE user_id=? AND type='expense' 
       ORDER BY date DESC LIMIT 5`,
      [userId]
    );

    const totalIncome = incomeRows[0].totalIncome;
    const totalExpense = expenseRows[0].totalExpense;
    const balance = totalIncome - totalExpense;

    res.json({
      success: true,
      totalIncome,
      totalExpense,
      balance,
      incomes,
      expenses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;*/


/*const express = require("express");
const db = require("../db");
const router = express.Router();

// ✅ Dashboard verisi
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    db.query(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC",
      [userId],
      (err, transactions) => {
        if (err) return res.status(500).json({ error: err });

        // Gelir ve giderleri ayır
        const incomes = transactions.filter(tx => tx.type === "income");
        const expenses = transactions.filter(tx => tx.type === "expense");

        // Toplam hesaplar
        const totalIncome = incomes.reduce((acc, i) => acc + parseFloat(i.amount), 0);
        const totalExpense = expenses.reduce((acc, e) => acc + parseFloat(e.amount), 0);
        const balance = totalIncome - totalExpense;

        // ✅ Frontend ile uyumlu JSON
        res.json({
          incomes,
          expenses,
          totalIncome,
          totalExpense,
          balance
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;
/*const express = require("express");
const db = require("../db");
const router = express.Router();

// Dashboard verisi çek
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // Gelirleri çek
    db.query(
      "SELECT * FROM transactions WHERE user_id = ? AND type = 'income' ORDER BY date DESC",
      [userId],
      (err, incomes) => {
        if (err) return res.status(500).json({ error: err });

        // Giderleri çek
        db.query(
          "SELECT * FROM transactions WHERE user_id = ? AND type = 'expense' ORDER BY date DESC",
          [userId],
          (err2, expenses) => {
            if (err2) return res.status(500).json({ error: err2 });

            // Toplam gelir ve gider
            const totalIncome = incomes.reduce((acc, i) => acc + parseFloat(i.amount), 0);
            const totalExpense = expenses.reduce((acc, e) => acc + parseFloat(e.amount), 0);
            const remaining = totalIncome - totalExpense;

            // Günlük harcama trendi (son 7 gün)
            const dailyExpenses = Array(7).fill(0);
            const today = new Date();
            for (let i = 0; i < 7; i++) {
              const day = new Date(today);
              day.setDate(today.getDate() - i);
              const dayStr = day.toISOString().split("T")[0]; // YYYY-MM-DD
              expenses.forEach(e => {
                if (e.date.toISOString().split("T")[0] === dayStr) {
                  dailyExpenses[6 - i] += parseFloat(e.amount);
                }
              });
            }

            res.json({
              incomes,
              expenses,
              income: totalIncome,
              expense: totalExpense,
              remaining,
              budget: totalIncome, // istersen ayrı budget alanı ekleyebilirsin
              dailyExpenses
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router; veritabanında frontende veri çekmiyor en son 1*/
