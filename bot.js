import { Bot } from "grammy";
import axios from "axios";
import { createChart } from "./chart.js";  // Chart generation
import dotenv from "dotenv";
dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);

// Function to fetch crypto details from CryptoCompare API
async function getCryptoDetails(symbol) {
    const url = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${symbol}&tsyms=USDT`;
    
    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Apikey ${process.env.CRYPTOCOMPARE_API_KEY}` }
        });
        
        const data = response.data.RAW[symbol.toUpperCase()].USDT;
        
        return {
            price: data.PRICE.toFixed(2),
            change_24h: data.CHANGE24H.toFixed(2),
            change_7d: data.CHANGE7D.toFixed(2),
            change_30d: data.CHANGE30D.toFixed(2),
            high_24h: data.HIGH24H.toFixed(2),
            low_24h: data.LOW24H.toFixed(2),
            volume_24h: data.VOLUME24H.toFixed(2),
            market_cap: data.MKTCAP.toFixed(2),
            circulating_supply: data.SUPPLY.toFixed(2),
            all_time_high: data.ALLTIMEHIGH.toFixed(2),
            ath_days: Math.floor((Date.now() - new Date(data.ALLTIMEHIGH_TIMESTAMP * 1000)) / (1000 * 60 * 60 * 24)),
            all_time_low: data.ALLTIMEMIN.toFixed(2),
            atl_days: Math.floor((Date.now() - new Date(data.ALLTIMEMIN_TIMESTAMP * 1000)) / (1000 * 60 * 60 * 24))
        };
    } catch (error) {
        console.error("Error fetching crypto details:", error);
        return null;
    }
}

// Command to fetch crypto details
bot.command("p", async (ctx) => {
    const symbol = ctx.match?.toUpperCase() || "BTC";
    
    const crypto = await getCryptoDetails(symbol);
    if (!crypto) {
        return ctx.reply("❌ Failed to fetch crypto details.");
    }

    // Generate chart for the symbol
    const chartPath = await createChart(symbol);

    // Format the response message
    const message = `
📊 *${symbol}/USDT Market Info*

  - *Price:* ${crypto.price} USDT
  - *24h Price Change:* ${crypto.change_24h}%
  - *7d Price Change:* ${crypto.change_7d}%
  - *30d Price Change:* ${crypto.change_30d}%
  - *24h High:* ${crypto.high_24h} USDT
  - *24h Low:* ${crypto.low_24h} USDT
  - *24h Volume:* ${crypto.volume_24h} USDT
  - *All Time High:* ${crypto.all_time_high} USDT | ${crypto.ath_days} days ago
  - *All Time Low:* ${crypto.all_time_low} USDT | ${crypto.atl_days} days ago

📈 *Statistics*:
  - *Market Cap:* ${crypto.market_cap} USDT
  - *Trading Volume:* ${crypto.volume_24h} USDT
  - *Circulating Supply:* ${crypto.circulating_supply}
  `;

    // Send message and image
    await ctx.replyWithPhoto({ source: chartPath }, { caption: message, parse_mode: "Markdown" });
});

bot.start();
