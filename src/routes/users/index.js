const express = require("express");
const validateFirebaseToken = require("../../middlewares/validation");
const { db } = require("../../config");
const router = express.Router();
const userLoginInfoRoutes = require("./UsersLoginInfoRoutes")
const usersWalletRoutes = require("./UsersWalletsRoutes");
const usersInfoRoutes = require('./UsersInfoRoutes')
const usersOverviewRoutes = require('./UsersOverviewRoutes')
const invoiceRoutes = require("./UsersInvoiceRoutes");
const activitiesRoutes = require('./UsersActivitiesRoutes')

router.use(validateFirebaseToken);

router.post("/", async (req, res) => {
  const userUid = req.userUid;
  const email = req.body.email;
  const role = req.body.role;

  const existingUsers =
    await db`select * from users where user_id = ${userUid}`;

  try {
    if (existingUsers.length > 0) {
      return res.status(409).send("User is already exist.");
    } else {
      await db`
        insert into users (user_id, email, user_role)
        values (${userUid}, ${email}, ${role})
        `;

      if (role === "investor") {
        await db`
            insert into investors (user_id)
            values (${userUid})
        `;
      } else if (role === "artist") {
        await db`
            insert into artists (user_id)
            values (${userUid})
        `;
      }
    }
  } catch (error) {
    console.error("Error updating Users table: ", error);
    return res.status(500).send("Internal server error");
  }
});

router.get("/role", async (req, res) => {
  const userUid = req.userUid;

  try {
    const result = await db`
      select user_role
      from users
      where user_id = ${userUid}
    `;

    const { user_role } = result[0];
    res.json({ role: user_role });
  } catch (error) {
    console.error("Error fetching user wallets:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/songs", async (req, res) => {
  const userUid = req.userUid;

  try {
    const result = await db`
      SELECT token_amount, purchase_timestamp 
      FROM purchase_history 
      WHERE user_id = ${userUid} AND payment_status = 'COMPLETE'
    `;

    let tokens_sum = 0;

    result.forEach((row) => {
      tokens_sum += parseFloat(row.token_amount);
    });

    // Get the most recent purchase timestamp and format it
    let formattedDate = "";
    const { purchase_timestamp } = result[0] ?? "";
    if (purchase_timestamp) {
      const mostRecentTimestamp = new Date(purchase_timestamp);
      formattedDate = `${mostRecentTimestamp.getDate()}/${mostRecentTimestamp.getMonth() + 1}/${mostRecentTimestamp.getFullYear()}`;
    }

    res.json({ date: formattedDate, tokens: tokens_sum });
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

router.use("/login-info", userLoginInfoRoutes)
router.use("/wallets", usersWalletRoutes);
router.use("/info", usersInfoRoutes)
router.use("/overview", usersOverviewRoutes)
router.use('/invoice', invoiceRoutes)
router.use('/activities', activitiesRoutes)

module.exports = router;
