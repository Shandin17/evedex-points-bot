const evedexSdk = require("@evedex/exchange-bot-sdk");
const { WebSocket } = require("ws");

// Configuration
const INSTRUMENT = process.env.INSTRUMENT || "BTCUSDT:DEMO";
const LEVERAGE = parseInt(process.env.LEVERAGE) || 1;
const QUANTITY = parseFloat(process.env.QUANTITY) || 0.001; // Small quantity for testing

async function main() {
  console.log("🤖 Starting EVE Points Bot...");
  console.log(`📊 Trading ${INSTRUMENT} with leverage ${LEVERAGE}x`);

  // Check for required environment variables
  if (!process.env.WALLET_PRIVATE_KEY) {
    console.error("❌ Error: WALLET_PRIVATE_KEY environment variable is required");
    process.exit(1);
  }

  // Initialize container
  const container = new evedexSdk.DemoContainer({
    centrifugeWebSocket: WebSocket,
    wallets: {
      mainWallet: {
        privateKey: process.env.WALLET_PRIVATE_KEY,
      },
    },
    apiKeys: {},
  });

  try {
    // Initialize account
    const account = await container.account("mainWallet");
    console.log("✅ Account initialized");

    // Fetch account info
    const accountInfo = await account.fetchMe();
    console.log(`👤 Account: ${accountInfo.name || accountInfo.wallet}`);

    // Fetch available balance
    const balance = account.getBalance();
    await balance.listen();
    const availableBalance = await account.fetchAvailableBalance();
    console.log(`💰 Available balance: ${availableBalance.availableBalance} USDT`);

    // Step 1: Open a market order (buy)
    console.log(`\n📈 Opening BUY position for ${QUANTITY} ${INSTRUMENT}...`);
    const buyOrder = await account.createMarketOrderV2({
      instrument: INSTRUMENT,
      side: evedexSdk.Side.Buy,
      leverage: LEVERAGE,
      quantity: QUANTITY,
      timeInForce: evedexSdk.TimeInForce.IOC,
    });
    console.log(`✅ Order created: ${buyOrder.id}`);
    console.log(`   Status: ${buyOrder.status}`);

    // Wait a moment for the order to be processed
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Fetch current position
    const positions = await account.fetchPositions();
    const position = positions.find((p) => p.instrument === INSTRUMENT);
    
    if (position && position.quantity > 0) {
      console.log(`✅ Position opened: ${position.quantity} ${INSTRUMENT}`);
      console.log(`   Entry price: ${position.avgPrice}`);

      // Step 2: Close the position immediately
      console.log(`\n📉 Closing position...`);
      const closeOrder = await account.createClosePositionOrderV2({
        instrument: INSTRUMENT,
        leverage: LEVERAGE,
        quantity: position.quantity,
      });
      console.log(`✅ Close order created: ${closeOrder.id}`);
      console.log(`   Status: ${closeOrder.status}`);

      // Wait for position to close
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify position is closed
      const updatedPositions = await account.fetchPositions();
      const updatedPosition = updatedPositions.find((p) => p.instrument === INSTRUMENT);

      if (!updatedPosition || updatedPosition.quantity === 0) {
        console.log("✅ Position successfully closed!");
      } else {
        console.log(`⚠️  Position still open: ${updatedPosition.quantity}`);
      }
    } else {
      console.log("⚠️  No position found after order execution");
    }

    console.log("\n✨ Bot execution completed!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    process.exit(1);
  } finally {
    // Clean up
    container.closeWsConnection();
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
