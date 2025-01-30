import { Bot } from "grammy";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);
const API_URL = "https://api.coinranking.com/v2/coins";
const API_KEY = process.env.COINRANKING_API_KEY;

async function fetchCoinData(coinName) {
    try {
        const response = await axios.get(API_URL, {
            headers: { "x-access-token": API_KEY }
        });

        const coin = response.data.data.coins.find(c => c.symbol.toLowerCase() === coinName.toLowerCase());

        if (!coin) return null;

        return {
            name: coin.name,
            symbol: coin.symbol,
            price: parseFloat(coin.price).toFixed(2),
            change24h: coin.change,
            athPrice: coin.allTimeHigh.price,
            athDate: coin.allTimeHigh.timestamp,
            marketCap: coin.marketCap,
            volume24h: coin["24hVolume"],
            circulatingSupply: coin.supply.circulating,
            high24h: coin.sparkline[coin.sparkline.length - 1], // Approximation
            low24h: Math.min(...coin.sparkline),
        };
    } catch (error) {
        console.error("API Error:", error.message);
        return null;
    }
}

bot.command("start", (ctx) => ctx.reply("Welcome! Use /price [symbol] to get market info. Example: /price BTC"));

bot.command("price", async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length < 2) return ctx.reply("Usage: /price [symbol]");

    const coinSymbol = args[1].toUpperCase();
    const coinData = await fetchCoinData(coinSymbol);

    if (!coinData) return ctx.reply("Coin not found!");

    const replyText = `
${coinData.name} (${coinData.symbol}) /USDT Market Info

- Price: ${coinData.price} USDT
- 24h Price Change: ${coinData.change24h}%
- 24h High: ${coinData.high24h} USDT
- 24h Low: ${coinData.low24h} USDT
- Market Cap: ${coinData.marketCap} USDT
- 24h Trading Volume: ${coinData.volume24h} USDT
- Circulating Supply: ${coinData.circulatingSupply}
- All-Time High: ${coinData.athPrice} USDT (since ${new Date(coinData.athDate * 1000).toLocaleDateString()})
`;

    ctx.reply(replyText);
});

bot.start();
