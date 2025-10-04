

const express = require("express");
const db = require("../db");
const verifyToken = require("../middlware/auth");

const router = express.Router();


//  Gelir ekleme
router.post("/transactions/incomes", verifyToken, async (req, res) => {
  const { title, amount, currency, date, note } = req.body;
  const userId = req.userId;

  console.log("📥 Income request:", { userId, title, amount, currency, date, note });

  try {
    const [result] = await db.promise().query(
      `INSERT INTO transactions (user_id, type, title, amount, currency, date, note)
       VALUES (?, 'income', ?, ?, ?, ?, ?)`,
      [userId, title, amount, currency, date, note]
    );

    console.log(" Income inserted:", result);

    res.status(201).json({
      success: true,
      incomeId: result.insertId,
    });
  } catch (err) {
    console.error(" DB Insert Error (Income):", err);
    res.status(500).json({ success: false, error: "DB error" });
  }
});

// Gider ekleme
router.post("/transactions/expenses", verifyToken, async (req, res) => {
  const { title, category, amount, currency, date, note } = req.body;
  const userId = req.userId;

  try {
    const [result] = await db.promise().query(
      `INSERT INTO transactions (user_id, type, category, title, amount, currency, date, note)
       VALUES (?, 'expense', ?, ?, ?, ?, ?, ?)`,
      [userId, category, title, amount, currency, date, note]
    );
    res.json({ success: true, expenseId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Transaction listesi (opsiyonel kategori veya type)
router.get("/transactions", verifyToken, async (req, res) => {
  const userId = req.userId;
  const { category, type } = req.query;

  try {
    let sql = `SELECT * FROM transactions WHERE user_id=?`;
    const params = [userId];

    if (type) {
      sql += ` AND type=?`;
      params.push(type);
    }
    if (category) {
      sql += ` AND category=?`;
      params.push(category);
    }

    const [transactions] = await db.promise().query(sql, params);
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// backend/routes/transactions.js - Silme endpoint'ini ekleyin
router.delete("/transactions/:id", verifyToken, async (req, res) => {
  const transactionId = req.params.id;
  const userId = req.userId;

  console.log(" Silme isteği:", { transactionId, userId });

  try {
    // Önce işlemin kullanıcıya ait olup olmadığını kontrol et
    const [transaction] = await db.promise().query(
      `SELECT * FROM transactions WHERE id = ? AND user_id = ?`,
      [transactionId, userId]
    );

    if (transaction.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "İşlem bulunamadı veya yetkiniz yok" 
      });
    }

    // İşlemi sil
    const [result] = await db.promise().query(
      `DELETE FROM transactions WHERE id = ? AND user_id = ?`,
      [transactionId, userId]
    );

    console.log("İşlem silindi:", result);

    res.json({ 
      success: true, 
      message: "İşlem başarıyla silindi",
      deletedId: transactionId 
    });
  } catch (err) {
    console.error(" Silme hatası:", err);
    res.status(500).json({ success: false, error: "İşlem silinemedi: " + err.message });
  }
});

router.get("/transactions/search", verifyToken, async (req, res) => {
  try {
    const { q, type, category, startDate, endDate } = req.query;
    const userId = req.userId;

    console.log("Arama sorgusu:", { q, type, category, startDate, endDate, userId });

    let sql = `SELECT * FROM transactions WHERE user_id = ?`;
    const params = [userId];

    // Metin araması
    if (q) {
      sql += ` AND (title LIKE ? OR category LIKE ? OR note LIKE ?)`;
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Diğer filtreler
    if (type) {
      sql += ` AND type = ?`;
      params.push(type);
    }
    
    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }
    
    if (startDate && endDate) {
      sql += ` AND date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    sql += ` ORDER BY date DESC LIMIT 50`;

    console.log("SQL sorgusu:", sql);
    console.log("SQL parametreleri:", params);

    const [transactions] = await db.promise().query(sql, params);

    console.log("Arama sonuçları:", transactions.length, "kayıt bulundu");

    res.json({ 
      success: true, 
      transactions,
      count: transactions.length 
    });
    
  } catch (error) {
    console.error('Arama hatası:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Arama sırasında hata oluştu: ' + error.message 
    });
  }
});


module.exports = router;

