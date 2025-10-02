/*const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Kullanıcı Kayıt
router.post("/register", (req, res) => {
  const { name, email, phone, password } = req.body;

  // Önce email veya telefon var mı kontrol et
  db.query(
    "SELECT * FROM users WHERE email = ? OR phone = ?",
    [email, phone],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Sunucu hatası" });
      if (results.length > 0) {
        return res.status(400).json({ error: "Bu email veya telefon zaten kayıtlı" });
      }

      // Şifre hashle
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: "Şifre hashlenemedi" });

        db.query(
          "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)",
          [name, email, phone, hashedPassword],
          (err2) => {
            if (err2) {
              return res.status(400).json({ error: "Kayıt başarısız", details: err2 });
            }
            res.json({ message: "Kayıt başarılı!" });
          }
        );
      });
    }
  );
});

// ✅ Kullanıcı Giriş
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Sunucu hatası" });
    if (results.length === 0) return res.status(401).json({ error: "Kullanıcı bulunamadı" });

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Şifre hatalı" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Giriş başarılı",
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
    });
  });
});

module.exports = router;*/


/*require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
console.log("JWT_SECRET in auth.js:", JWT_SECRET);

router.post("/register", (req, res) => {
  const { name, email, phone, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)",
    [name, email, phone, hashedPassword],
    (err, result) => {
      if (err) return res.status(400).json({ error: "Kayıt başarısız", details: err });
      res.json({ message: "Kayıt başarılı!" });
    }
  );
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Sunucu hatası" });
    if (results.length === 0) return res.status(401).json({ error: "Kullanıcı bulunamadı" });

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) return res.status(401).json({ error: "Şifre hatalı" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Giriş başarılı",
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  });
});

module.exports = router;*/


require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const verifyToken = require("../middlware/auth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
console.log("JWT_SECRET in auth.js:", JWT_SECRET);

router.post("/register", (req, res) => {
  const { name, email, phone, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)",
    [name, email, phone, hashedPassword],
    (err, result) => {
      if (err) return res.status(400).json({ error: "Kayıt başarısız", details: err });
      res.json({ message: "Kayıt başarılı!" });
    }
  );
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Sunucu hatası" });
    if (results.length === 0) return res.status(401).json({ error: "Kullanıcı bulunamadı" });

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) return res.status(401).json({ error: "Şifre hatalı" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Giriş başarılı",
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
    });
  });
});

// ✅ PROFİL GÜNCELLEME ENDPOINT'İ EKLENDİ
router.put("/profile", verifyToken, async (req, res) => {
  const userId = req.userId;
  const { name, email, phone } = req.body;

  console.log("📝 Profil güncelleme isteği:", { userId, name, email, phone });

  try {
    // E-posta başka bir kullanıcı tarafından kullanılıyor mu kontrol et
    if (email) {
      const [existingUser] = await db.promise().query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, userId]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor"
        });
      }
    }

    // Kullanıcı bilgilerini güncelle
    const [result] = await db.promise().query(
      "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?",
      [name, email, phone, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Kullanıcı bulunamadı"
      });
    }

    // Güncellenmiş kullanıcı bilgilerini getir
    const [users] = await db.promise().query(
      "SELECT id, name, email, phone FROM users WHERE id = ?",
      [userId]
    );

    const updatedUser = users[0];

    res.json({
      success: true,
      message: "Profil başarıyla güncellendi",
      user: updatedUser
    });

  } catch (err) {
    console.error("❌ Profil güncelleme hatası:", err);
    res.status(500).json({
      success: false,
      error: "Profil güncellenirken bir hata oluştu"
    });
  }
});

// ✅ PROFİL BİLGİLERİNİ GETİRME ENDPOINT'İ
router.get("/profile", verifyToken, async (req, res) => {
  const userId = req.userId;

  try {
    const [users] = await db.promise().query(
      "SELECT id, name, email, phone, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Kullanıcı bulunamadı"
      });
    }

    const user = users[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at
      }
    });

  } catch (err) {
    console.error("❌ Profil getirme hatası:", err);
    res.status(500).json({
      success: false,
      error: "Profil bilgileri alınamadı"
    });
  }
});

// ✅ ŞİFRE DEĞİŞTİRME ENDPOINT'İ
router.put("/change-password", verifyToken, async (req, res) => {
  const userId = req.userId;
  const { currentPassword, newPassword } = req.body;

  try {
    // Mevcut kullanıcıyı getir
    const [users] = await db.promise().query(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Kullanıcı bulunamadı"
      });
    }

    const user = users[0];

    // Mevcut şifreyi kontrol et
    const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: "Mevcut şifre hatalı"
      });
    }

    // Yeni şifreyi hash'le ve güncelle
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    
    await db.promise().query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedNewPassword, userId]
    );

    res.json({
      success: true,
      message: "Şifre başarıyla değiştirildi"
    });

  } catch (err) {
    console.error("❌ Şifre değiştirme hatası:", err);
    res.status(500).json({
      success: false,
      error: "Şifre değiştirilirken bir hata oluştu"
    });
  }
});

module.exports = router;

