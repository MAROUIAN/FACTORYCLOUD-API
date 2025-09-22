const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

// 🟢 الاتصال مع PostgreSQL (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(bodyParser.json());

// ✅ فحص السيرفر
app.get("/", (req, res) => {
  res.send("FactoryCloud API OK ✅");
});

// 📥 جلب كل الطلبات
app.get("/orders", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ➕ إضافة طلب جديد
app.post("/orders", async (req, res) => {
  try {
    const { order_no, branch, quantity, due_date } = req.body;
    const result = await pool.query(
      `INSERT INTO orders (order_no, branch, quantity, due_date, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [order_no, branch, quantity, due_date, "Not Scheduled"]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting order:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 🗑 حذف طلب
app.delete("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM orders WHERE id = $1", [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 🚀 تشغيل السيرفر
app.listen(port, () => {
  console.log(✅ Server running on port ${port});
});
