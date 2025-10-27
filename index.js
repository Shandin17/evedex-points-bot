const evedexSdk = require("@evedex/exchange-bot-sdk");
const WebSocket = require("ws");

// Configuration
const CONFIG = {
  INSTRUMENT: "BTCUSD:DEV", // Change to "BTCUSDT:PROD" for production
  LEVERAGE: 50,
  ORDER_CASH_QUANTITY: 300, // Adjust based on your account size
  INTERVAL_MS: 3000, // 3 seconds
  USE_PRODUCTION: false, // Set to true for production
  WALLET_PRIVATE_KEY:
    "0xcb6c44a022478d227783b8dde75caa1d0f8d05e4889129b071904db66d5a519f",
};

// Initialize container
const container = CONFIG.USE_PRODUCTION
  ? new evedexSdk.ProdContainer({
      centrifugeWebSocket: WebSocket,
      wallets: {
        baseAccount: {
          privateKey: CONFIG.WALLET_PRIVATE_KEY,
        },
      },
      apiKeys: {},
    })
  : new evedexSdk.DevContainer(
      {
        centrifugeWebSocket: WebSocket,
        wallets: {
          baseAccount: {
            privateKey: CONFIG.WALLET_PRIVATE_KEY,
          },
        },
        apiKeys: {},
      },
      true
    ); // Debug mode enabled for demo

const gateway = container.gateway();

let account;
let balance;
let isProcessing = false;
let tradeCount = 0;

// Initialize the bot
async function initBot() {
  try {
    console.log("🚀 Initializing farming bot...");

    // Get account
    account = await container.account("baseAccount");

    // Get balance instance
    balance = account.getBalance();

    // Listen to balance updates - await is important to populate cache
    await balance.listen();

    console.log("Account metrics subscription done");

    // Log account info
    const accountInfo = await account.fetchMe();
    console.log("👤 Account:", accountInfo.wallet);

    // Log initial balance using correct method
    const availableBalance = await account.fetchAvailableBalance();
    console.log("💰 Available Balance:", availableBalance);

    // Log funding
    const funding = balance.getFundingQuantity(
      evedexSdk.CollateralCurrency.USDT
    );
    console.log("💵 USDT Funding:", funding);

    console.log("✅ Bot initialized successfully!");
    console.log(
      `📊 Trading ${CONFIG.INSTRUMENT} with ${CONFIG.LEVERAGE}x leverage`
    );
    console.log(
      `⏱️  Opening positions every ${CONFIG.INTERVAL_MS / 1000} seconds`
    );
    console.log("---");

    return true;
  } catch (error) {
    console.error("❌ Error initializing bot:", error.message);
    console.error(error);
    return false;
  }
}

// Get current market price
async function getMarketPrice() {
  try {
    const gateway = container.gateway();
    const orderbook = await gateway.fetchMarketDepth({
      instrument: CONFIG.INSTRUMENT,
      maxLevel: 1,
    });

    if (orderbook.bids.length > 0) {
      return parseFloat(orderbook.bids[0].price);
    }

    throw new Error("No bids available in orderbook");
  } catch (error) {
    console.error("Error fetching market price:", error.message);
    return null;
  }
}

// Open short position
async function openShortPosition() {
  try {
    // Create market order for short position
    const order = await account.createMarketOrderV2({
      instrument: CONFIG.INSTRUMENT,
      cashQuantity: CONFIG.ORDER_CASH_QUANTITY,
      side: evedexSdk.Side.Sell, // Sell = Short
      leverage: CONFIG.LEVERAGE,
      timeInForce: evedexSdk.TimeInForce.IOC,
    });

    console.log(`✅ Position opened: ${order.id}`);
    return order;
  } catch (error) {
    console.error("❌ Error opening position:", error.message);
    return null;
  }
}

// Close position
async function closePosition() {
  try {
    // Wait a bit to ensure position is registered
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get current position from cache
    const position = balance.getPosition(CONFIG.INSTRUMENT);

    if (!position || parseFloat(position.quantity) === 0) {
      console.log("⚠️  No position to close (may have already closed)");
      return;
    }

    console.log(`📈 Closing position: ${position.quantity} @ ${position.side}`);

    // Close the position using market order in opposite direction
    const closeOrder = await account.createClosePositionOrderV2({
      instrument: CONFIG.INSTRUMENT,
      leverage: CONFIG.LEVERAGE,
      quantity: position.quantity,
    });

    console.log(`✅ Position closed: ${closeOrder.id}`);
  } catch (error) {
    console.error("❌ Error closing position:", error.message);
    // Try to fetch and display current positions for debugging
    try {
      const positions = await account.fetchPositions();
      console.log("Current positions:", positions);
    } catch (e) {
      // Ignore
    }
  }
}

// Execute one trade cycle
async function executeTradeCycle() {
  if (isProcessing) {
    console.log("⏳ Previous trade still processing, skipping...");
    return;
  }

  isProcessing = true;
  tradeCount++;

  try {
    console.log(
      `\n🔄 Trade Cycle #${tradeCount} - ${new Date().toLocaleTimeString()}`
    );

    // Open short position
    const order = await openShortPosition();

    if (order) {
      // Immediately close the position
      await closePosition();

      // Log current balance from cache
      const availableBalance = balance.getAvailableBalance();
      console.log(
        `💰 Available Balance: ${availableBalance.quantity} ${availableBalance.currency}`
      );

      // Log current positions
      const positions = balance.getPositionList();
      console.log(`📊 Open Positions: ${positions.length}`);
    }

    console.log(`✓ Cycle #${tradeCount} completed`);
  } catch (error) {
    console.error(`❌ Error in trade cycle #${tradeCount}:`, error.message);
  } finally {
    isProcessing = false;
  }
}

// Main function
async function main() {
  console.log("🤖 EVEDEX Farming Bot");
  console.log("=====================================");

  // Initialize bot
  const initialized = await initBot();

  if (!initialized) {
    console.error("❌ Failed to initialize bot. Exiting...");
    process.exit(1);
  }

  // Subscribe to position updates
  balance.onPositionUpdate((position) => {
    console.log("📊 Position Update:", position);
  });

  // Subscribe to order updates
  balance.onOrderUpdate((order) => {
    console.log("📝 Order Update:", order.status, order.id);
  });

  // Subscribe to funding updates
  balance.onFundingUpdate((funding) => {
    console.log("💵 Funding Update:", funding);
  });

  // Start farming loop
  console.log("\n🎯 Starting farming loop...\n");

  // Execute first trade immediately
  await executeTradeCycle();

  // Set up interval for subsequent trades
  const interval = setInterval(async () => {
    await executeTradeCycle();
  }, CONFIG.INTERVAL_MS);

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n\n⏹️  Stopping farming bot...");
    clearInterval(interval);
    balance.unListen();
    console.log("✅ Bot stopped. Total trades: " + tradeCount);
    process.exit(0);
  });
}

// Run the bot
main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
