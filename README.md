# EVEDEX Points Bot 🤖

A simple bot that automatically opens and closes short positions on BTCUSD with up to 50x leverage to farm points on the EVEDEX exchange.

## Features

- ✅ Opens short positions with 50x leverage
- ✅ Immediately closes positions after opening
- ✅ Configurable interval (default: 3 seconds)
- ✅ Real-time balance and position updates
- ✅ Error handling and retry logic
- ✅ Supports both dev and production environments

## Prerequisites

- Node.js (v16 or higher)
- npm
- wallet with private key
- Sufficient balance for trading

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure the bot by editing `index.js`:

```javascript
const CONFIG = {
  INSTRUMENT: "BTCUSD:DEV", // Change to "BTCUSD" for production
  LEVERAGE: 50,
  ORDER_CASH_QUANTITY: 300, // Adjust based on your account size (in usd)
  INTERVAL_MS: 3000, // 3 seconds between trades
  USE_PRODUCTION: false, // Set to true for production
  WALLET_PRIVATE_KEY: "0x...", // Your wallet private key
};
```

3. **IMPORTANT**: Replace the private key in `index.js` with your own wallet private key.

## Configuration

### Key Parameters

- **INSTRUMENT**: Trading pair (e.g., "BTCUSD:DEV" or "BTCUSD")
- **LEVERAGE**: Leverage multiplier (default: 50x)
- **ORDER_CASH_QUANTITY**: Size of each position in USD (default: 300)
- **INTERVAL_MS**: Time between trades in milliseconds (default: 3000 = 3 seconds)
- **USE_PRODUCTION**: Toggle between dev and production environments

## Usage

### Dev Mode (Testing)

```bash
npm start
```

### Production Mode

1. Set `USE_PRODUCTION: true` in CONFIG
2. Change instrument to production (e.g., "BTCUSD")
3. Run:

```bash
npm run prod
```

### Stopping the Bot

Press `Ctrl+C` to gracefully stop the bot. It will display total trades executed.

## How It Works

1. **Initialization**:

   - Connects to EVEDEX
   - Authenticates with wallet
   - Subscribes to real-time updates

2. **Trading Loop**:

   - Fetches current market price
   - Opens a SHORT position with 50x leverage
   - Immediately closes the position
   - Waits for the configured interval
   - Repeats

3. **Monitoring**:
   - Logs each trade cycle
   - Shows position updates
   - Displays available balance
   - Tracks total trades

## Security Warning

⚠️ **IMPORTANT**: The current code has a hardcoded private key. For security:

1. Never commit private keys to version control
2. Use environment variables for sensitive data
3. Consider using a separate wallet for bot trading

## Disclaimer

This bot is provided for educational purposes. Trading cryptocurrencies involves substantial risk of loss. The authors are not responsible for any financial losses incurred while using this bot. Use at your own risk.

## License

MIT

## Support

For issues with:

- EVEDEX SDK: Check the official documentation
- This bot: Review the code comments and error messages
- Trading questions: Consult with financial advisors

---

**Happy Farming! 🌾**

Remember: Past performance does not guarantee future results. Always trade responsibly.
