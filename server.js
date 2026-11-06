require("dotenv").config();
const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "gelae",
      waitForConnections: true,
      connectionLimit: 10,
      decimalNumbers: true
    });
  }
  return pool;
}

app.get("/api/health", async (_req, res) => {
  try {
    await getPool().query("SELECT 1");
    res.json({ ok: true, database: "mysql" });
  } catch (error) {
    res.status(503).json({ ok: false, database: "offline", message: "Configure o MySQL no arquivo .env." });
  }
});

app.get("/api/stores", async (_req, res) => {
  try {
    const [rows] = await getPool().query("SELECT * FROM stores ORDER BY is_open DESC, name");
    res.json(rows);
  } catch (error) {
    res.status(503).json({ error: "Não foi possível consultar os depósitos no MySQL." });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const params = [];
    let sql = `SELECT p.*, s.name AS store_name FROM products p JOIN stores s ON s.id=p.store_id WHERE p.active=1`;
    if (req.query.store_id) { sql += " AND p.store_id=?"; params.push(req.query.store_id); }
    if (req.query.category) { sql += " AND p.category=?"; params.push(req.query.category); }
    sql += " ORDER BY p.name";
    const [rows] = await getPool().query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(503).json({ error: "Não foi possível consultar os produtos no MySQL." });
  }
});

app.post("/api/orders", async (req, res) => {
  const { storeId, customerName, customerPhone, address, payment, items } = req.body || {};
  if (!storeId || !customerName || !address || !payment || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: "Preencha os dados do pedido." });
  }
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const [storeRows] = await conn.query("SELECT id, delivery_fee FROM stores WHERE id=? AND is_open=1 FOR UPDATE", [storeId]);
    if (!storeRows.length) throw new Error("Depósito indisponível.");
    const ids = items.map(i => Number(i.id));
    const [products] = await conn.query(
      `SELECT id, name, price FROM products WHERE store_id=? AND active=1 AND id IN (${ids.map(() => "?").join(",")})`,
      [storeId, ...ids]
    );
    if (products.length !== ids.length) throw new Error("Um ou mais produtos não estão disponíveis.");
    let subtotal = 0;
    const normalized = items.map(item => {
      const product = products.find(p => p.id === Number(item.id));
      const quantity = Math.max(1, Math.min(99, Number(item.quantity) || 1));
      subtotal += product.price * quantity;
      return { ...product, quantity };
    });
    const fee = Number(storeRows[0].delivery_fee);
    const total = subtotal + fee;
    const [order] = await conn.query(
      `INSERT INTO orders (store_id,customer_name,customer_phone,delivery_address,payment_method,subtotal,delivery_fee,total)
       VALUES (?,?,?,?,?,?,?,?)`,
      [storeId, customerName, customerPhone || null, address, payment, subtotal, fee, total]
    );
    for (const item of normalized) {
      await conn.query(
        "INSERT INTO order_items (order_id,product_id,product_name,quantity,unit_price) VALUES (?,?,?,?,?)",
        [order.insertId, item.id, item.name, item.quantity, item.price]
      );
    }
    await conn.commit();
    res.status(201).json({ id: order.insertId, status: "Recebido", total });
  } catch (error) {
    await conn.rollback();
    res.status(400).json({ error: error.message || "Erro ao registrar pedido." });
  } finally {
    conn.release();
  }
});

app.get("/api/orders", async (_req, res) => {
  try {
    const [rows] = await getPool().query(
      `SELECT o.*, s.name AS store_name,
       (SELECT COUNT(*) FROM order_items i WHERE i.order_id=o.id) AS item_count
       FROM orders o JOIN stores s ON s.id=o.store_id ORDER BY o.created_at DESC LIMIT 100`
    );
    res.json(rows);
  } catch (error) {
    res.status(503).json({ error: "Não foi possível consultar os pedidos." });
  }
});

app.patch("/api/orders/:id/status", async (req, res) => {
  const allowed = ["Confirmado", "Preparando", "Saiu para entrega", "Entregue", "Cancelado"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error: "Status inválido." });
  try {
    const [result] = await getPool().query("UPDATE orders SET status=? WHERE id=?", [req.body.status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Pedido não encontrado." });
    res.json({ ok: true });
  } catch (error) {
    res.status(503).json({ error: "Não foi possível atualizar o pedido." });
  }
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`GELAÊ disponível em http://localhost:${port}`));
