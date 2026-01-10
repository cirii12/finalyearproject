import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './BookExchange.css';
import { toast } from 'react-toastify';

const BookExchange = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productTitle: '',
    authorBrand: '',
    category: '',
    condition: '',
    desiredCategory: '',
    description: '',
    images: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast.success('Exchange request submitted successfully!');
      setFormData({
        productTitle: '',
        authorBrand: '',
        category: '',
        condition: '',
        desiredCategory: '',
        description: '',
        images: []
      });
      setLoading(false);
      navigate('/search');
    }, 2000);
  };

  return (
    <div className="book-form-page">
      <Navbar />

      <main className="book-form-main">
        <div className="form-header">
          <div className="form-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 16L3 12L7 8M17 8L21 12L17 16M14 4L10 20" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1>Exchange Your Item</h1>
          <p>Swap your crochet item for another one from our community</p>
        </div>

        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-section">
            <h3>Product Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="productTitle">Product Title *</label>
                <input
                  type="text"
                  id="productTitle"
                  name="productTitle"
                  value={formData.productTitle}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter product title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="authorBrand">Author/Brand *</label>
                <input
                  type="text"
                  id="authorBrand"
                  name="authorBrand"
                  value={formData.authorBrand}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter brand or artisan name"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="BLANKET">Blanket</option>
                  <option value="BOUQUET">Bouquet</option>
                  <option value="FLOWERS">Flowers</option>
                  <option value="AMIGURUMI">Amigurumi</option>
                  <option value="KEYRINGS">Keyrings</option>
                  <option value="DRESS">Dress</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="condition">Product Condition *</label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Exchange Preferences</h3>
            <div className="form-group">
              <label htmlFor="desiredCategory">Desired Category</label>
              <select
                id="desiredCategory"
                name="desiredCategory"
                value={formData.desiredCategory}
                onChange={handleInputChange}
              >
                <option value="">Select preferred category</option>
                <option value="BLANKET">Blanket</option>
                <option value="BOUQUET">Bouquet</option>
                <option value="FLOWERS">Flowers</option>
                <option value="AMIGURUMI">Amigurumi</option>
                <option value="KEYRINGS">Keyrings</option>
                <option value="DRESS">Dress</option>
                <option value="OTHER">Other</option>
                <option value="Any">Any Category</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                placeholder="Describe your item's condition, what you're looking for in exchange, any specific preferences..."
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Product Images</h3>
            <div className="form-group">
              <label htmlFor="images">Upload Images</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                />
                <div className="upload-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#9CA3AF" />
                  </svg>
                  <p>Click to upload images or drag and drop</p>
                  <span>Upload up to 5 images (product shots, details, etc.)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Submitting Request...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 16L3 12L7 8M17 8L21 12L17 16M14 4L10 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Submit Exchange Request
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default BookExchange; 