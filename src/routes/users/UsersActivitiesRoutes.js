const express = require("express");
const { db } = require("../../config");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userUid = req.userUid;

    const purchaseHistory = await db`
      SELECT token_amount, token_price, currency, purchase_timestamp, payment_status
      FROM purchase_history
      WHERE user_id = ${userUid}
    `;

    res.status(200).json({purchaseHistory: purchaseHistory});
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
