const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const redis = require("redis");
const axios = require("axios");
const cheerio = require("cheerio");

// PostgreSQL setup
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "ad-hash",
    password: "1100@Post",
    port: 5432,
});

// Redis setup
const client = redis.createClient();
// console.log('redisClient', client)

// Handle connection events
client.on('connect', () => {
  console.log('Connected to Redis server');
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

// Connect to the Redis server
client.connect();



const app = express();
app.use(cors());
app.use(express.json());

// Middleware to cache results
const cache = async (req, res, next) => {
    const { type } = req.params;
    console.log('type', type)
    const params = Object.values(req.query);
    console.log('params', params)
    const key = type === "make" ? type : `${type}-${params.slice(-1)}`;
    console.log('key', key)
    const resp = await client.get(key);
    if (resp) {
        console.log('from cache')
        res.send(JSON.parse(resp))
    } else {
        console.log('cache miss')
        next();
    }
};

// task 2 - Web scraping

app.get("/scrap/:url(*)", async (req, res) => {
    // Get the URL from the query parameters
    const url = req.params.url;
    // console.log('url', url)

    if (!url) {
        return res.status(400).send("Error: URL parameter is required");
    }

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const name = $("h2.panel-title span.prodDescriptH2").text();
        const description = $('meta[itemprop="description"]').attr("content");
        const partNumber = $("span.item-part-number strong").text();
        const supersession = $("span.alt-stock-code-text strong").text().trim();

        // Extracting price information
        const price = $('meta[itemprop="price"]').attr("content");
        const currency = $('meta[itemprop="priceCurrency"]').attr("content");
        const msrp = $(".msrpRow").text().replace("MSRP: ", "").trim();
        const discount = $(
            "#ctl00_Content_PageBody_AddToCartControl_savingsLabelDealer"
        )
            .text()
            .replace("All Discounts: ", "")
            .trim();

        // Extracting description and fitment details
        const coverDescription = $(".item-desc p").first().text().trim();

        // Splitting fitment details
        const fitmentModels = $(".item-desc p b").text().trim(); // Vehicle models inside the <b> tag
        const engineSpecs = $(".item-desc p")
            .eq(1)
            .contents()
            .filter(function () {
                return this.nodeType === 3; // Filter out the text nodes (excluding the <b> tag)
            })
            .text()
            .trim();

        // Extracting dealer rating and review count
        const dealerRating = $("#ratingValue").text().trim();
        const reviewCount = $('.dealerReviewCount span[itemprop="reviewCount"]')
            .text()
            .trim();

        // Organize the extracted data into key-value pairs
        const productInfo = {
            name,
            description,
            partNumber,
            supersession,
            price: `${currency} ${price}`,
            msrp,
            discount,
            coverDescription,
            fitment: {
                models: fitmentModels,
                engineSpecs,
            },
            dealerRating,
            reviewCount,
        };

        // Send the response as JSON
        res.json(productInfo);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching product information");
    }
});
// API routes
app.get("/api/:type", async (req, res) => {
    const { type } = req.params;
    let query;
    let params = [];

    switch (type) {
        case "make":
            // Query remains the same since we are selecting distinct makes
            query = "SELECT DISTINCT make FROM cars";
            break;
        case "model":
            // For multiple makes, we use IN clause
            const makes = req.query.make.split(","); // Split comma-separated makes
            query = `SELECT DISTINCT model FROM cars WHERE make IN (${makes
                .map((_, i) => `$${i + 1}`)
                .join(",")})`;
            params = makes;
            break;
        case "year":
            // For multiple makes and models
            const models = req.query.model.split(",");
            const yearsMakes = req.query.make.split(",");
            query = `SELECT DISTINCT year FROM cars WHERE make IN (${yearsMakes
                .map((_, i) => `$${i + 1}`)
                .join(",")}) AND model IN (${models
                .map((_, i) => `$${i + yearsMakes.length + 1}`)
                .join(",")})`;
            params = [...yearsMakes, ...models];
            break;
        case "trim":
            const trimsModels = req.query.model.split(",");
            const trimsMakes = req.query.make.split(",");
            const years = req.query.year.split(",");
            query = `SELECT DISTINCT trim, engine FROM cars WHERE make IN (${trimsMakes
                .map((_, i) => `$${i + 1}`)
                .join(",")}) AND model IN (${trimsModels
                .map((_, i) => `$${i + trimsMakes.length + 1}`)
                .join(",")}) AND year IN (${years
                .map(
                    (_, i) =>
                        `$${i + trimsMakes.length + trimsModels.length + 1}`
                )
                .join(",")})`;
            params = [...trimsMakes, ...trimsModels, ...years];
            break;
        case "engine":
            const enginesModels = req.query.model.split(",");
            const enginesMakes = req.query.make.split(",");
            const enginesYears = req.query.year.split(",");
            const enginesTrim = req.query.trim;
            query = `SELECT DISTINCT trim, engine FROM cars WHERE make IN (${enginesMakes
                .map((_, i) => `$${i + 1}`)
                .join(",")}) AND model IN (${enginesModels
                .map((_, i) => `$${i + enginesMakes.length + 1}`)
                .join(",")}) AND year IN (${enginesYears
                .map(
                    (_, i) =>
                        `$${i + enginesMakes.length + enginesModels.length + 1}`
                )
                .join(",")}) AND trim IN ($${
                enginesMakes.length +
                enginesModels.length +
                enginesYears.length +
                1
            })`;
            params = [
                ...enginesMakes,
                ...enginesModels,
                ...enginesYears,
                enginesTrim,
            ];
            break;
        case "all-filter":
            const filterModels = req.query.model.split(",");
            const filterMakes = req.query.make.split(",");
            const filterYears = req.query.year.split(",");
            const filterTrim = req.query.trim;
            const filterEngine = req.query.engine;
            query = `SELECT DISTINCT trim, engine FROM cars WHERE make IN (${filterMakes
                .map((_, i) => `$${i + 1}`)
                .join(",")}) AND model IN (${filterModels
                .map((_, i) => `$${i + filterMakes.length + 1}`)
                .join(",")}) AND year IN (${filterYears
                .map(
                    (_, i) =>
                        `$${i + filterMakes.length + filterModels.length + 1}`
                )
                .join(",")}) AND trim IN ($${
                filterMakes.length +
                filterModels.length +
                filterYears.length +
                1
            }) AND engine IN ($${
                filterMakes.length +
                filterModels.length +
                filterYears.length +
                2
            })`;
            params = [
                ...filterMakes,
                ...filterModels,
                ...filterYears,
                filterTrim,
                filterEngine
            ];
            break;

        default:
            res.status(400).send("Invalid type");
            return;
    }

    try {
        console.log("query:", query);
        console.log("params:", params);
        const { rows } = await pool.query(query, params);
        console.log('rows', rows)

        // Cache the result
        const key = type === "make" ? type : `${type}-${params.join("-")}`;
        client.set(key, JSON.stringify(rows));

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});


// Clear cache on delete
app.post("/clear-cache", (req, res) => {
    client.flushAll();
    res.send("Cache cleared");
    console.log("Cache cleared");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
