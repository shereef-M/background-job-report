const { inngest } = require("./client");
const { reports } = require("../store");

const sayHello = inngest.createFunction(
  { id: "say-hello", triggers: [{ event: "test/hello" }] },
  async ({ step }) => {
    await step.sleep("wait-a-bit", "5s");
    return "Hello from the background!";
  },
);

const makeReport = inngest.createFunction(
  { id: "make-report", triggers: [{ event: "report/requested" }], retries: 2 },
  async ({ event, step }) => {
    const { id, topic } = event.data;

    await step.sleep("do-the-slow-work", "8s");

    await step.run("build-report", async () => {
      if (topic === "fail") {
        throw new Error("The report oven is broken!");
      }

      const report = reports.get(id);
      report.status = "done";
      report.result = `Here is your report about ${topic}.`;
    });
  },
);

const heartbeat = inngest.createFunction(
  { id: "heartbeat", triggers: [{ cron: "* * * * *" }] },
  async ({ step }) => {
    await step.run("log-summary", async () => {
      let pending = 0;
      let done = 0;
      let failed = 0;

      for (const report of reports.values()) {
        if (report.status === "pending") pending++;
        else if (report.status === "done") done++;
        else if (report.status === "failed") failed++;
      }

      console.log(
        `Heartbeat: ${pending} pending, ${done} done, ${failed} failed`,
      );
    });
  },
);

module.exports = { sayHello, makeReport, heartbeat };
