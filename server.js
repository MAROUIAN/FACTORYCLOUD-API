const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

// Render يحط DATABASE_URL تلقائيًا
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(bodyParser.json());

// 🔹 اختبار
app.get("/", (req, res) => res.send("FactoryCloud API OK 🚀"));

// 🔹 إضافة طلب
app.post("/orders", async (req, res) => {
  const { order_no, branch, quantity, due_date } = req.body;
  const result = await pool.query(
    "INSERT INTO orders (order_no, branch, quantity, due_date, status) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [order_no, branch, quantity, due_date, "Not Scheduled"]
  );
  res.json(result.rows[0]);
});

// 🔹 عرض الطلبات
app.get("/orders", async (req, res) => {
  const result = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
  res.json(result.rows);
});

app.listen(port, () => console.log(`✅ Server running on port ${port}`));
