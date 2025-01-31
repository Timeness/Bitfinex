import { createCanvas } from "canvas";
import fs from "fs";
import axios from "axios";

// Function to create the chart
export async function createChart(symbol) {
    const width = 600, height = 300;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Fetch 1-minute historical price data from CryptoCompare API
    const url = `https://min-api.cryptocompare.com/data/histominute?fsym=${symbol}&tsym=USDT&limit=60`;
    const response = await axios.get(url, {
        headers: { 'Authorization': `Apikey ${process.env.CRYPTOCOMPARE_API_KEY}` }
    });

    const prices = response.data.Data.map(p => p.close);

    // Draw chart background
    ctx.fillStyle = "#1E1E1E";
    ctx.fillRect(0, 0, width, height);

    // Draw line graph for the prices
    ctx.strokeStyle = "#4CAF50";
    ctx.lineWidth = 2;
    ctx.beginPath();

    prices.forEach((price, index) => {
        const x = (index / prices.length) * width;
        const y = height - (price / Math.max(...prices)) * height;
        ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Save chart as image
    const path = `chart_${symbol}.png`;
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(path, buffer);

    return path;
}
