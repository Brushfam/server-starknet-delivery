const express = require("express");
const { db } = require("../../config");
const router = express.Router();

async function getUserById(userUid) {
  const result = await db`
    SELECT user_id, email, user_role
    FROM users
    WHERE user_id = ${userUid}
  `;
  return result[0];
}

async function getInvestorInfo(user_id) {
  try {
    const result = await db`
      SELECT
        token_amount,
        token_price * token_amount as money_amount
      FROM
        purchase_history
      WHERE
        user_id = ${user_id} AND
        payment_status = 'COMPLETE'
    `;
    const totalTokensAmount = result.reduce((sum, row) => Number(sum) + Number(row.token_amount), 0);
    const totalInvestedAmount = result.reduce((sum, row) => Number(sum) + Number(row.money_amount), 0);

    if (result.length > 0) {
      return {
        totalInvestedAmount: totalInvestedAmount,
        totalTokensAmount: totalTokensAmount,
      };
    } else {
      return {
        totalInvestedAmount: 0,
        totalTokensAmount: 0,
      };
    }
  } catch (error) {
    console.error("Error fetching investor info:", error);
    throw new Error("Unable to fetch investor info");
  }
}

router.get("/", async (req, res) => {
  try {
    const userUid = req.userUid;
    const user = await getUserById(userUid);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.user_role === "investor") {
      const { totalInvestedAmount, totalTokensAmount } =
        await getInvestorInfo(userUid);
      res
        .status(200)
        .json({
          totalInvestedAmount: totalInvestedAmount,
          totalTokensAmount: totalTokensAmount,
        });
    } else if (user.user_role === "artist") {
      return res
        .status(200)
        .json({ totalInvestedAmount: 0, totalTokensAmount: 0 });
    } else {
      return res.status(400).json({ error: "Invalid user role" });
    }

    res.status(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
