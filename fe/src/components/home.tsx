import React, { useState, useEffect } from "react";
import axios from "axios";
import "./home.css";

const Home = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [conversionInProgress, setConversionInProgress] = useState<boolean>(false);
  const [convertedVideoUrl, setConvertedVideoUrl] = useState<string>("");
  const [uploadedVideoDimensions, setUploadedVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [convertedVideoDimensions, setConvertedVideoDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (selectedFile) {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(selectedFile);
      video.addEventListener('loadedmetadata', () => {
        setUploadedVideoDimensions({ width: video.videoWidth, height: video.videoHeight });
      });
      return () => {
        URL.revokeObjectURL(video.src);
      };
    }
  }, [selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setConvertedVideoUrl("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("video", selectedFile);

    try {
      setConversionInProgress(true);
      const response = await axios.post(
        "http://localhost:8080/convert-video",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
        }
      );
      const convertedVideoBlob = new Blob([response.data], {
        type: "video/mp4",
      });
      const convertedVideoUrl = window.URL.createObjectURL(convertedVideoBlob);
      setConvertedVideoUrl(convertedVideoUrl);
      const video = document.createElement('video');
      video.src = convertedVideoUrl;
      video.addEventListener('loadedmetadata', () => {
        setConvertedVideoDimensions({ width: video.videoWidth, height: video.videoHeight });
      });
  
      return () => {
        URL.revokeObjectURL(video.src);
      };
    } catch (error) {
      console.error("Error converting video:", error);
    } finally {
      setConversionInProgress(false);
    }
  };

  const handleDownload = () => {
    if (convertedVideoUrl) {
      const a = document.createElement("a");
      a.href = convertedVideoUrl;
      a.download = "converted_video.mov";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setSelectedFile(null);
      setConvertedVideoUrl("");
    }
  };
  console.log(uploadedVideoDimensions?.height, uploadedVideoDimensions?.width)
  console.log(convertedVideoDimensions?.height)
  return (
    <div className="container">
      <div className="content">
        <h1>Video Conversion Tool</h1>
        <input type="file" accept="video/mp4" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!selectedFile || conversionInProgress}>
          {conversionInProgress ? "Converting..." : "Convert Video"}
        </button>
        {uploadedVideoDimensions && convertedVideoDimensions && (
          <div className="pixel-boxes">
            <div className="pixel-box uploaded-pixels">
              <h4>Uploaded Video Pixels</h4>
              {`${uploadedVideoDimensions.width} x ${uploadedVideoDimensions.height}`}
            </div>
            <div className="pixel-box converted-pixels">
              <h4>Converted Video Pixels</h4>
              {`${convertedVideoDimensions.width} x ${convertedVideoDimensions.height}`}
            </div>
          </div>
        )}
        {convertedVideoUrl && (
          <button onClick={handleDownload}>Download Converted Video</button>
        )}
      </div>
    </div>
  );
};

export default Home;
