import "./App.css";

import { useState, useEffect } from "react";

function App() {
  const [data, setData] = useState(null);
  const [videoURL, setVideoURL] = useState("");
  const [jobId, setJobId] = useState("");
  const [inputJobId, setInputJobId] = useState("");
  const [status, setStatus] = useState("");
  const [downloadURL, setDownloadURL] = useState("");
  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(jobId)
      .then(() => {
        alert("Text copied to clipboard. Save it for future reference.");
      })
      .catch((error) => {
        console.error("Error copying text to clipboard:", error);
      });
  };

  const downloadVideo = async (e) => {
    e.preventDefault();
    fetch(`http://localhost:5000/job-status/${inputJobId}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.status !== "completed") {
          setDownloadURL("");
          setStatus(data.status);
        } else {
          setStatus(data.status);
          setDownloadURL(data.url);
        }
      });
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(downloadURL);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "processedvideo.mp4"; // Specify the desired file name for the downloaded file
      downloadLink.click();
    } catch (error) {
      console.error("Error downloading video:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (videoURL === "") {
      alert("Please enter a video URL");
      return;
    } else {
      try {
        fetch("http://localhost:5000/process-video", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ videoURL }),
        })
          .then((res) => res.json())
          .then((data) => {
            setVideoURL("");
            setJobId(data.message);
          });
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className="App">
      {data ? <h1>{data}</h1> : <h1>Loading...</h1>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={videoURL}
          placeholder="Enter google drive link of video to process here"
          onChange={(e) => setVideoURL(e.target.value)}
          className="video-url-input"
        />
        <button type="submit" className="process-btn">
          start processing
        </button>
      </form>
      {jobId ? (
        <div className="display-copy">
          <p>Job ID: <b>{jobId}</b></p>
          <button type="button" className="copy-btn" onClick={handleCopy}>
            copy
          </button>
        </div>
      ) : null}
      <form onSubmit={downloadVideo}>
        <input
          type="text"
          value={inputJobId}
          className="video-url-input"
          placeholder="Enter job ID here"
          onChange={(e) => setInputJobId(e.target.value)}
        />
        <button type="submit" className="process-btn">
          Submit
        </button>
      </form>
      {status ? (
        <div className="display-status">
          <p>Status: <b>{status}</b></p>
        </div>
      ) : null}
      {downloadURL ? (
        <button type="button" className="download-btn" onClick={handleDownload}>
          Download video
        </button>
      ) : null}
    </div>
  );
}

export default App;
