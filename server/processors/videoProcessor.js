const { google } = require("googleapis");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const videoData = require("../schemas/VideoData.js");
const dotenv = require("dotenv");

dotenv.config();

const drive = google.drive({
  version: "v3",
  auth: process.env.GOOGLE_DRIVE_API_KEY,
});

const videoProcessor = async (job, done) => {
  const { url } = job.data;
  console.log(`Processing video: ${url}`);
  const urlObject = new URL(url);
  const pathname = urlObject.pathname;
  const fileId = pathname.split("/")[3];
  const timestamp = Date.now();
  const { fileName, fileExtension } = await downloadVideo(fileId, timestamp);
  console.log(`File uploaded: ${fileName}`);
  const inputFilePath = `./public/inputs/${fileName}_${timestamp}.${fileExtension}`;
  const outputFilePath = `./public/outputs/${fileName}_${timestamp}.${fileExtension}`;
  const newVideoData = new videoData({
    job_id: job.id,
    input_video_url: url,
    output_video_url: `http://localhost:5000/outputs/${fileName}_${timestamp}.${fileExtension}`,
  });
  await newVideoData.save();
  try {
    await processVideo(inputFilePath, outputFilePath);
    console.log("Audio filters applied successfully.");
    await job.moveToCompleted();
    console.log("Job completed successfully.");
    const doc = await videoData.findOneAndUpdate(
      { job_id: job.id },
      { status: "completed" }
    );
    if (doc) {
      console.log("Data updated successfully:", doc);
    } else {
      console.log("Data not found or update failed");
    }
    done();
  } catch (error) {
    console.error("Error applying audio filters:", error);
    done(error);
  }
};

const downloadVideo = async (fileId, timestamp) => {
  const request = {
    fileId: fileId,
  };

  try {
    const response = await drive.files.get(request);
    const videoContent = response.data;
    const originalFileName = videoContent.name;
    const [fileName, fileExtension] = originalFileName.split(".");
    const filePath = `./public/inputs/${fileName}_${timestamp}.${fileExtension}`;
    const videoData = await drive.files.get(
      { fileId: fileId, alt: "media" },
      { responseType: "stream" }
    );
    const writeStream = fs.createWriteStream(filePath);
    videoData.data
      .on("end", () => {
        console.log("File saved");
        writeStream.close();
      })
      .on("error", (err) => {
        console.error("Error saving file:", err);
      })
      .pipe(writeStream);

    return new Promise((resolve, reject) => {
      writeStream.on("close", () => {
        resolve({ fileName, fileExtension });
      });
      writeStream.on("error", (err) => {
        reject(err);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const processVideo = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioFilter("highpass=f=200")
      .audioFilter("lowpass=f=3000,afftdn=nf=-25")
      .output(outputPath)
      .on("end", () => {
        resolve();
      })
      .on("error", (err) => {
        reject(err);
      })
      .run();
  });
};

module.exports = videoProcessor;
