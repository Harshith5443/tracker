const express = require("express");
const cors = require("cors");
const { Pool } = require("pg"); // ✅ ONLY ONE

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 PostgreSQL (Supabase) connection
const pool = new Pool({
    connectionString: "postgresql://postgres:W0AUfSrhwNrJbIYG@db.qusidxjvyumlistfxqjq.supabase.co:5432/postgres",
    ssl: {
        rejectUnauthorized: false,
    },
});

// ✅ TEST route
app.get("/", (req, res) => {
    res.send("PostgreSQL API working 🚀");
});

// ✅ GET all campaigns
app.get("/campaigns", async(req, res) => {
    try {
        const result = await pool.query("SELECT * FROM campaigns ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch campaigns" });
    }
});

// ✅ ADD campaign
app.post("/campaigns", async(req, res) => {
    try {
        const { name, client, startDate, status } = req.body;

        const result = await pool.query(
            "INSERT INTO campaigns (name, client, startDate, status) VALUES ($1,$2,$3,$4) RETURNING *", [name, client, startDate, status]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to add campaign" });
    }
});

// ✅ UPDATE campaign
app.put("/campaigns/:id", async(req, res) => {
    try {
        const { id } = req.params;
        const { name, client, startDate, status } = req.body;

        await pool.query(
            "UPDATE campaigns SET name=$1, client=$2, startDate=$3, status=$4 WHERE id=$5", [name, client, startDate, status, id]
        );

        res.json({ message: "Updated" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to update" });
    }
});

// ✅ DELETE campaign
app.delete("/campaigns/:id", async(req, res) => {
    try {
        const { id } = req.params;

        await pool.query("DELETE FROM campaigns WHERE id=$1", [id]);

        res.json({ message: "Deleted" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to delete" });
    }
});

// ✅ TEST DB CONNECTION
pool.connect()
    .then(() => console.log("✅ PostgreSQL Connected"))
    .catch(err => console.log("❌ DB Error:", err.message));

// ✅ START SERVER
app.listen(5000, () => {
    console.log("🚀 Server running with PostgreSQL");
});