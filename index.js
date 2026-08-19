const express = require("express");
const { serve } = require("inngest/express");
const { inngest } = require("./inngest/client");
const { sayHello } = require("./inngest/functions");

const app = express();          // <-- app must be created here first
app.use(express.json());

app.use("/api/inngest", serve({ client: inngest, functions: [sayHello] }));  // <-- then used here

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});