const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(bodyParser.json());

// Home route
app.get("/", (req, res) => {
  res.send("FactoryCloud API OK 🚀");
});

// Get orders
app.get("/orders", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching orders");
  }
});

// Add order
app.post("/orders", async (req, res) => {
  const { order_no, branch, quantity, due_date } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO orders (order_no, branch, quantity, due_date, status) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [order_no, branch, quantity, due_date, "not scheduled"]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding order");
  }
});

app.listen(port, () => {
  console.log(🚀 Server running on port ${port});
});
