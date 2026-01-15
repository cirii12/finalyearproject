import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { uploadTutorial } from "../../services/api";
import { showLogoutConfirmation } from "../ConfirmationToast";
import NotificationBell from "./NotificationBell";
import "./TutorialAdd.css";

export default function TutorialAdd() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const userType = storedUser.userType?.toLowerCase();

    if (!storedUser.token || userType !== "organization") {
      toast.error("Access denied. Organization login required.");
      navigate("/login");
      return;
    }
    setUser(storedUser);
  }, [navigate]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit check
        toast.warning("Video file is quite large. Upload might take a while.");
      }
      setVideo(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      const url = URL.createObjectURL(file);
      setThumbPreview(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!video) {
      toast.error("Video file is required");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", Number(price));
    formData.append("video", video);
    if (thumbnail) formData.append("thumbnail", thumbnail);

    try {
      await uploadTutorial(formData, user.token);
      toast.success("Tutorial uploaded successfully! It is now live.");

      // Reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setVideo(null);
      setThumbnail(null);
      setVideoPreview(null);
      setThumbPreview(null);

    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    const performLogout = () => {
      sessionStorage.removeItem('user');
      navigate("/login");
    };
    showLogoutConfirmation(performLogout);
  };

  if (!user) return null;

  return (
    <div className="tutorial-add-page">
      {loading && (
        <div className="upload-loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">Uploading Tutorial Assets</div>
          <div className="loading-subtext">Please keep this window open while we process your high-quality video.</div>
        </div>
      )}

      {/* Header */}
      <header className="tutorial-add-header">
        <div className="tutorial-header-content">
          <div className="tutorial-logo-section">
            <h1 className="tutorial-logo" onClick={() => navigate("/adminpanel")} style={{ cursor: 'pointer' }}>
              Lunasu Crochet
            </h1>
            <span className="tutorial-badge">Organization Panel</span>
          </div>
          <div className="tutorial-header-actions">
            <NotificationBell />
            <button className="tutorial-nav-btn" onClick={() => navigate("/adminpanel")}>
              Back to Panel
            </button>
            <button className="tutorial-nav-btn" onClick={() => navigate("/organization-products")}>
              Products
            </button>
            <button className="tutorial-nav-btn" onClick={() => navigate("/organization-orders")}>
              Orders
            </button>
            <button className="tutorial-nav-btn" onClick={() => navigate("/organization-analytics")}>
              Analytics
            </button>
            <button className="tutorial-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="tutorial-add-main">
        <div className="tutorial-form-header">
          <div className="tutorial-form-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <h1>Publish New Tutorial</h1>
          <p>Share your crochet expertise with high-quality video content</p>
        </div>

        <form onSubmit={handleSubmit} className="tutorial-form-card">
          <div className="tutorial-form-section">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              Standard Information
            </h3>

            <div className="tutorial-form-group">
              <label htmlFor="title">Tutorial Title *</label>
              <input
                type="text"
                id="title"
                placeholder="e.g., Advanced Amigurumi Techniques"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="tutorial-form-group">
              <label htmlFor="price">Price (Rs.) *</label>
              <input
                type="number"
                id="price"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="tutorial-form-group">
              <label htmlFor="description">Detailed Description</label>
              <textarea
                id="description"
                placeholder="Explain what the users will learn in this tutorial..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="tutorial-form-section">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Media Content
            </h3>

            <div className="tutorial-upload-row">
              <div className="upload-field">
                <label>Video Tutorial *</label>
                {!videoPreview ? (
                  <div className="drop-zone" onClick={() => document.getElementById('video').click()}>
                    <input
                      type="file"
                      id="video"
                      accept="video/*"
                      onChange={handleVideoChange}
                      required
                      style={{ display: 'none' }}
                    />
                    <div className="upload-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 7l-7 5 7 5V7z" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </svg>
                    </div>
                    <span className="upload-text">Choose Video File</span>
                    <span className="upload-hint">MP4, MOV up to 100MB</span>
                  </div>
                ) : (
                  <div className="preview-container">
                    <video className="video-preview" src={videoPreview} controls />
                    <button type="button" className="remove-file" onClick={() => { setVideo(null); setVideoPreview(null); }}>
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="upload-field">
                <label>Cover Thumbnail (Optional)</label>
                {!thumbPreview ? (
                  <div className="drop-zone" onClick={() => document.getElementById('thumbnail').click()}>
                    <input
                      type="file"
                      id="thumbnail"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      style={{ display: 'none' }}
                    />
                    <div className="upload-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <span className="upload-text">Choose Thumbnail</span>
                    <span className="upload-hint">JPG, PNG recommended</span>
                  </div>
                ) : (
                  <div className="preview-container">
                    <img className="thumbnail-preview" src={thumbPreview} alt="Thumbnail preview" />
                    <button type="button" className="remove-file" onClick={() => { setThumbnail(null); setThumbPreview(null); }}>
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="tutorial-form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate("/adminpanel")}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Processing..." : "Publish Tutorial"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
