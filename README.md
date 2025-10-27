# eve-points-bot

A simple JavaScript bot using [@evedex/exchange-bot-sdk](https://www.npmjs.com/package/@evedex/exchange-bot-sdk) to open and immediately close BTC trades on Evedex exchange for farming points.

## Features

- 🤖 Automated trading on Evedex exchange
- 📈 Opens a market buy order for BTC
- 📉 Immediately closes the position
- ⚡ Designed for points farming
- 🔒 Secure - uses wallet private key authentication

## Prerequisites

- Node.js (v14 or higher)
- An Evedex exchange account
- Wallet private key with USDT balance

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Shandin17/eve-points-bot.git
cd eve-points-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Edit `.env` and add your wallet private key:
```
WALLET_PRIVATE_KEY=0x...your_private_key_here
```

## Configuration

You can configure the bot by setting environment variables in the `.env` file:

- `WALLET_PRIVATE_KEY` (required): Your wallet private key starting with `0x`
- `INSTRUMENT` (optional): Trading instrument (default: `BTCUSDT:DEMO`)
- `LEVERAGE` (optional): Leverage multiplier (default: `1`)
- `QUANTITY` (optional): Trade quantity in BTC (default: `0.001`)

## Usage

Run the bot:

```bash
npm start
```

Or with custom environment variables:

```bash
INSTRUMENT=BTCUSDT:DEMO QUANTITY=0.002 npm start
```

## How It Works

1. **Initialize**: Connects to Evedex exchange using the SDK
2. **Open Position**: Creates a market buy order for the specified BTC quantity
3. **Close Position**: Immediately closes the position using a market close order
4. **Repeat**: You can run this script multiple times to farm points

## Demo vs Production

By default, the bot uses `DemoContainer` which connects to the demo/test environment. To use the production environment:

1. Change `DemoContainer` to `ProdContainer` in `bot.js`
2. Use production instrument format (e.g., `BTCUSDT:PROD` instead of `BTCUSDT:DEMO`)

## Getting Test Funds

For the demo environment:
1. Register on [https://exchange.evedex.com](https://exchange.evedex.com)
2. You'll automatically receive 1000 USDT on first registration
3. Use the "Request Demo Funds" button on the exchange for additional funds

## Security Warning

⚠️ **Never commit your `.env` file or share your private key!**

The `.gitignore` file is configured to exclude sensitive files.

## Troubleshooting

- **"WALLET_PRIVATE_KEY environment variable is required"**: Make sure you've created a `.env` file with your private key
- **Insufficient balance**: Ensure you have enough USDT in your account to open a position
- **Order fails**: Check that the instrument name matches the exchange format (e.g., `BTCUSDT:DEMO`)

## License

ISC

## Disclaimer

This bot is for educational purposes. Use at your own risk. Always test with small amounts first.
