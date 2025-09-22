import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload } from "lucide-react";
import axios from "axios";
import "./App.css"; // your custom styling

export default function App() {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [breed, setBreed] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState(null);
  const [confidence, setConfidence] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [liveInfo, setLiveInfo] = useState("");

  // Handle file selection
  const handleImageUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setImage(URL.createObjectURL(selectedFile));
      setFile(selectedFile);
      setBreed("");
      setDescription("");
      setDetails(null);
      setConfidence("");
      setErrorMessage("");
      setLiveInfo("");
    }
  };

  // Call /predict endpoint
  const handleBreedRecognition = async () => {
    if (!file) return;
    setLoading(true);
    setBreed("");
    setDescription("");
    setDetails(null);
    setConfidence("");
    setErrorMessage("");
    setLiveInfo("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("http://127.0.0.1:8000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status === "error") {
        setErrorMessage(response.data.message || "Unknown error occurred.");
      } else if (response.data.status === "success") {
        const prediction = response.data.predictions[0];
        setBreed(prediction.breed);
        setDescription(prediction.description || "No description available");
        setDetails(prediction.details || null);
        setConfidence((prediction.confidence * 100).toFixed(2) + "%");

        // 🔹 Fetch live AI info
        fetchLiveInfo(prediction.breed);
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      setErrorMessage("⚠️ Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  // Call /live-info endpoint
  const fetchLiveInfo = async (breedName) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/live-info", { breed: breedName });
      if (response.data.status === "success") {
        setLiveInfo(response.data.ai_info);
      } else {
        setLiveInfo("⚠️ Could not fetch live updates.");
      }
    } catch (err) {
      setLiveInfo("⚠️ Could not fetch live updates.");
    }
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <header className="navbar">
        <h2 className="logo">🚜 AgriTechies</h2>
        <nav>
          <a href="#detector">Detector</a>
          <a href="#features">Features</a>
          <button className="contact-btn">Contact Us</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <motion.h1
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Instantly Identify <span>Cattle Breeds</span> with AI
        </motion.h1>
        <p>
          Upload an image of a cow, and our advanced neural network will detect its breed with
          high accuracy. Simple, fast, and efficient.
        </p>

        {/* Upload Box */}
        <div className="upload-box" id="detector">
          {!image && (
            <label className="upload-label">
              <Upload className="upload-icon" />
              <span>Drag & Drop Your Image Here</span>
              <p>or</p>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              <button className="browse-btn">Browse Files</button>
            </label>
          )}

          {image && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="preview-container"
            >
              <img src={image} alt="Uploaded" className="preview-img" />
              <div className="btn-group">
                <button onClick={handleBreedRecognition} className="classify-btn">
                  Classify
                </button>
                <button onClick={() => setImage(null)} className="reupload-btn">
                  Re-upload
                </button>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="loading-text"
              >
                🔍 Analyzing image...
              </motion.div>
            )}

            {errorMessage && (
              <motion.div
                key="error"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="error-box"
              >
                {errorMessage}
              </motion.div>
            )}

            {breed && (
              <motion.div
                key="result"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="result-box"
              >
                <h2>Breed Identified: {breed}</h2>

                {details ? (
                  <div className="description-list">
                    {Object.entries(details).map(([key, value]) => (
                      <p key={key}>
                        <strong>{key.replace(/_/g, " ")}:</strong> {value}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p>{description}</p>
                )}

                <span className="confidence">Confidence: {confidence}</span>

                {/* 🔹 Live Info Section */}
                {liveInfo && (
                  <motion.div
                    key="live-info"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="live-info-box"
                  >
                    <h3>📡 Live Updates</h3>
                    <p>{liveInfo}</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Features Section */}
        <section id="features" className="features">
          <h2>✨ Features</h2>
          <ul>
            <li>AI-powered cattle breed recognition</li>
            <li>Breed-specific details like milk yield & region</li>
            <li>📡 Live real-time updates about market trends</li>
            <li>Helps farmers save costs & maximize profits</li>
          </ul>
        </section>

        {/* Contact Section */}
        <section id="contact" className="contact">
          <h2>📩 Contact Us</h2>
          <p>Email: agritechies@example.com</p>
          <p>Phone: +91-9876543210</p>
        </section>
      </section>
    </div>
  );
}
