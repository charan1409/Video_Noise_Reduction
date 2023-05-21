const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Queue = require("bull");
const dotenv = require("dotenv");

require("./processors/index.js");
require("./utils/Redis.js");
const VideoData = require("./schemas/VideoData.js");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const videoProcessorQueue = new Queue(
  "video-processing",
  "redis://127.0.0.1:6379"
);

mongoose
  .connect(
    process.env.MONGO_DB,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("MongoDb  Connected...");
    startJobProcessing();
  })
  .catch((err) => console.log(err));

app.use(express.static("public"));

app.post("/process-video", async (req, res) => {
  const jobId = uuidv4();
  const videoURL = req.body.videoURL;
  const job = await videoProcessorQueue.add({ url: videoURL }, { jobId });
  res.json({ message: jobId });
});

app.get("/job-status/:id", async (req, res) => {
  const { id } = req.params;
  const job = await VideoData.findOne({ job_id: id });
  console.log(job)
  if (job) {
    res.json({ status: job.status, url: job.output_video_url });
  } else {
    res.json({ status: "failed" });
  }
});

app.get("/empty-queue", async (req, res) => {
  await videoProcessorQueue.empty();
  res.json({ message: "Queue emptied" });
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the video processing server!" });
});

app.listen(5000, () => {
  console.log("Server listening on port 5000");
});

async function startJobProcessing() {
  const jobs = await videoProcessorQueue.getJobs(["waiting", "delayed"]);
  if (jobs.length > 0) {
    console.log(`Processing ${jobs.length} remaining unprocessed videos...`);
    jobs.forEach(async (job) => {
      await job.process();
    });
  }
}
