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
app.get("/api/:type", cache, async (req, res) => {
    const { type } = req.params;
    console.log("req.query", req.query.make);

    console.log("type", type);

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
                "SELECT DISTINCT trim, engine FROM cars WHERE make = $1 AND model = $2 AND year = $3";
            break;
        case "engine":
            query =
                "SELECT DISTINCT engine FROM cars WHERE make = $1 AND model = $2 AND year = $3";
            break;
        default:
            res.status(400).send("Invalid type");
            return;
    }

    try {
        const params = Object.values(req.query);
        console.log('params', params)
        const { rows } = await pool.query(query, params);

        // Cache the result
        const key = type === 'make' ? type : `${type}-${params.slice(-1)}`
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
