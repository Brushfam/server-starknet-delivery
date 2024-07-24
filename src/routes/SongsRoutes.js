const express = require("express");
const router = express.Router();
const { db } = require("../config");

router.get('/listening', async (req, res) => {
  const { songId, songPlatform } = req.query;

  try {
    const result = await db`
      SELECT month_listening, platform, streams
      FROM song_listening_history
      WHERE song_id = ${songId} AND platform = ${songPlatform}
      ORDER BY song_listening_id ASC;
    `;

    const formattedResult = result.map(row => ({
      month: row.month_listening,
      platform: row.platform,
      streams: row.streams
    }));

    res.status(200).json({ result: formattedResult });
  } catch (error) {
    console.error('Error fetching song listenings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
