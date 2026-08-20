const express = require("express");
const crypto = require("crypto");
const { serve } = require("inngest/express");
const { inngest } = require("./inngest/client");
const { sayHello, makeReport } = require("./inngest/functions");

const app = express();
app.use(express.json());

const { reports } = require("./store");

app.use(
  "/api/inngest",
  serve({ client: inngest, functions: [sayHello, makeReport] }),
);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/reports", async (req, res) => {
  const { topic } = req.body;

  const id = crypto.randomUUID();
  reports.set(id, { id, topic, status: "pending" });

  await inngest.send({ name: "report/requested", data: { id, topic } });

  res.status(202).json({ id, status: "pending" });
});

app.get("/reports/:id", (req, res) => {
  const report = reports.get(req.params.id);

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  res.status(200).json(report);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
