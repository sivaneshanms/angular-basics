const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const redis = require("redis");

// PostgreSQL setup
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "ad-hash",
    password: "1100@Post",
    port: 5432,
});

// Redis setup
const redisClient = redis.createClient();

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to cache results
const cache = (req, res, next) => {
    const { type } = req.params;
    redisClient.get(type, (err, data) => {
        if (err) throw err;
        if (data !== null) {
            res.send(JSON.parse(data));
        } else {
            next();
        }
    });
};

// API routes
app.get("/api/:type", async (req, res) => {
    const { type } = req.params;
    console.log('req.query', req.query.make)

    console.log('type', type)

    let query;
    switch (type) {
        case "make":
            query = "SELECT DISTINCT make FROM cars";
            break;
        case "model":
            query = "SELECT DISTINCT model FROM cars WHERE make = $1";
            break;
        case "year":
            query =
                "SELECT DISTINCT year FROM cars WHERE make = $1 AND model = $2";
            break;
        case "trim":
            query =
                "SELECT DISTINCT trim FROM cars WHERE make = $1 AND model = $2 AND year = $3";
            break;
        case "engine":
            query =
                "SELECT DISTINCT engine FROM cars WHERE make = $1 AND model = $2 AND year = $3 AND trim = $4";
            break;
        default:
            res.status(400).send("Invalid type");
            return;
    }

    try {
        const params = Object.values(req.query);
        const { rows } = await pool.query(query, params);

        // Cache the result
        // redisClient.setEx(type, 3600, JSON.stringify(rows));
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

// Clear cache on delete
app.post("/clear-cache", (req, res) => {
    redisClient.flushAll();
    res.send("Cache cleared");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
