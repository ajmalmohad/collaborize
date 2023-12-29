require("dotenv").config();
const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
/**
 * Chat Bot Routes
 */
router.get("/", (req, res) => {
  return res.status(200).json({ message: "Chat Bot Route" });
});

router.post("/ask", async (req, res) => {
  const { prompt, email } = req.body;

  if (prompt == null || email == null) {
    return res.status(404).json({ message: "Query Not Provided" });
  }

  fetch(
    `http://api.brainshop.ai/get?bid=176088&key=${
      process.env.BOT_API_KEY
    }&uid=${email}&msg=${encodeURI(prompt)}`,
  )
    .then(async (data) => {
      answer = await data.json();
      return res
        .status(200)
        .json({ message: answer.cnt ? answer.cnt : "Can you repeat?" });
    })
    .catch((err) => {
      return res.status(500).json({ message: "Unexpected Error Occured" });
    });
});

module.exports = router;
