const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // مهم عشان Neon يشتغل
});

// 🟢 Route أساسي للتأكد إن السيرفر شغال
app.get("/", (req, res) => {
  res.send("FactoryCloud API ok 🚀");
});

// 🟢 جلب كل الطلبات
app.get("/orders", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 🟢 إضافة طلب جديد
app.post("/orders", async (req, res) => {
  try {
    const { order_no, branch, quantity, due_date } = req.body;

    const result = await pool.query(
      "INSERT INTO orders (order_no, branch, quantity, due_date) VALUES ($1, $2, $3, $4) RETURNING *",
      [order_no, branch, quantity, due_date]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert failed" });
  }
});

// 🟢 حذف طلب (حسب id)
app.delete("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM orders WHERE id = $1", [id]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// Start server
app.listen(port, () => {
  console.log(🚀 Server running on port ${port});
});
