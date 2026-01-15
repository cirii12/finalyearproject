import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './ViewDetails.css';
import { useCart } from './CartContext';
import { toast } from 'react-toastify';
import { fetchBooks, getImageUrl } from '../services/api';

const defaultProduct = {
  title: 'Cozy Baby Blanket',
  author: 'Lunasu Crochet',
  bookImage: 'https://images.unsplash.com/photo-1575905188849-01933df71661?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  image: 'https://images.unsplash.com/photo-1575905188849-01933df71661?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  category: 'BLANKET',
  price: 1200,
  offer: 'Limited Edition - Handcrafted with Love',
  description: `Experience the warmth of our handcrafted Cozy Baby Blanket. Made from the softest premium wool, this blanket is perfect for keeping your little one snuggled and warm. Each stitch is carefully crafted to ensure durability and comfort. A beautiful addition to any nursery or a thoughtful gift for new parents.`
};

const recommendations = [
  {
    title: 'Rose Bouquet',
    author: 'Lunasu Crochet',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0fab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    action: 'Buy',
  },
  {
    title: 'Sunflowers Set',
    author: 'Lunasu Crochet',
    image: 'https://images.unsplash.com/photo-1510212330253-9366dfbfc8f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    action: 'Buy',
  },
  {
    title: 'Blue Amigurumi Bear',
    author: 'Lunasu Crochet',
    image: 'https://images.unsplash.com/photo-1559449182-2070387532ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    action: 'Buy',
  },
  {
    title: 'Pink Crochet Dress',
    author: 'Lunasu Crochet',
    image: 'https://images.unsplash.com/photo-1583311818290-7d1c1a9c146e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    action: 'Buy',
  },
];

const ViewDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, cart, getCartTotal } = useCart();
  const [recommendations, setRecommendations] = useState([]);
  const [product, setProduct] = useState(location.state?.book || null);
  const [loading, setLoading] = useState(!product);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!product && id) {
        setLoading(true);
        try {
          // Fetch book by ID from API (assuming this endpoint exists)
          const response = await fetch(`http://localhost:8082/api/books/${id}`);
          if (response.ok) {
            const data = await response.json();
            setProduct(data);
          } else {
            setProduct(defaultProduct);
          }
        } catch (error) {
          console.error('Error fetching product details:', error);
          setProduct(defaultProduct);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProductDetails();
  }, [id, product]);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const data = await fetchBooks();
        const allBooks = data.content || data;
        // Filter out current product and pick up to 4 items
        const filtered = allBooks
          .filter(item => item.id !== (product?.id || id))
          .slice(0, 4);
        setRecommendations(filtered);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      }
    };
    loadRecommendations();
  }, [product?.id, id]);

  // Use fallback if still loading or not found
  const currentProduct = product || defaultProduct;

  // Get current user
  const getCurrentUser = () => {
    try {
      const userData = sessionStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  };

  // Check if current user owns this product
  const isOwnProduct = () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentProduct.user) return false;

    // Check if the product's user ID matches current user's ID
    return currentProduct.user.id === currentUser.userId || currentProduct.userId === currentUser.userId;
  };

  const handleAddToCart = () => {
    const user = sessionStorage.getItem('user');
    if (!user) {
      toast.info('Please login or signup to add items to your cart.');
      navigate('/login');
      return;
    }

    // Check if user is trying to buy their own product
    if (isOwnProduct()) {
      toast.warning('You cannot purchase your own product!');
      return;
    }

    addToCart(currentProduct);
    navigate('/cart');
  };

  const handleBuyNow = async () => {
    const user = sessionStorage.getItem('user');
    if (!user) {
      toast.info('Please login or signup to purchase products.');
      navigate('/login');
      return;
    }

    // Check if user is trying to buy their own product
    if (isOwnProduct()) {
      toast.warning('You cannot purchase your own product!');
      return;
    }

    try {
      toast.info('Processing your request...');
      await addToCart(currentProduct);

      // We navigate to /billing. 
      // Since addToCart updates the global CartContext, 
      // we can calculate the new state or just navigate and let BillingPage handle it.
      // However, BillingPage expects cart and total in location.state.

      // Calculate optimistic total/cart for the billing page
      // (The Context will also update, but state transition is faster)
      navigate('/billing', {
        state: {
          cart: [...cart, { book: currentProduct, quantity: 1, id: 'temp' }], // Fallback for immediate state
          total: getCartTotal() + currentProduct.price
        }
      });
    } catch (error) {
      toast.error('Failed to process purchase: ' + error.message);
    }
  };

  // Check if buttons should be disabled
  const isOwnProductFlag = isOwnProduct();

  if (loading && !product) {
    return (
      <div className="view-details-page">
        <Navbar />
        <div style={{ padding: '100px', textAlign: 'center' }}>Loading product details...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="view-details-page">
      <div className="vd-promo-banner">
        Add 3+ items, get and 25% OFF - Free shipping
      </div>
      <Navbar />
      <div className="vd-container">
        <div className="vd-product-grid">
          {/* Left Section: Images */}
          <div className="vd-images-section">
            <div className="vd-main-image-container">
              <img
                src={getImageUrl(currentProduct.bookImage || currentProduct.image)}
                alt={currentProduct.title}
                className="vd-main-image"
              />
            </div>
            <div className="vd-thumbnails">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`vd-thumb-item ${i === 1 ? 'active' : ''}`}>
                  <img src={getImageUrl(currentProduct.bookImage || currentProduct.image)} alt={`thumb ${i}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Section: Details */}
          <div className="vd-info-section">
            <div className="vd-metadata">
              <span className="vd-stars">★★★★★</span>
              <span className="vd-review-count">(213 Reviews)</span>
            </div>
            <h1 className="vd-title">{currentProduct.title}</h1>
            <p className="vd-author">by {currentProduct.author}</p>

            <div className="vd-price-section">
              <span className="vd-current-price">NPR {currentProduct.price}</span>
              {currentProduct.offer && <span className="vd-offer-tag">Special Offer</span>}
            </div>

            <div className="vd-shipping-note">
              Free Shipping Across the USA
            </div>

            <button
              className="vd-add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={isOwnProductFlag}
            >
              ★ Add To Cart
            </button>

            <div className="vd-extra-info">
              <div className="vd-info-card">
                <div className="vd-card-icon-wrapper">🚀</div>
                <span>Light weight</span>
              </div>
              <div className="vd-info-card">
                <div className="vd-card-icon-wrapper">📅</div>
                <span>Try, Then Decide</span>
              </div>
              <div className="vd-info-card">
                <div className="vd-card-icon-wrapper">🔄</div>
                <span>Easy Returns</span>
              </div>
            </div>

            <div className="vd-collapsible-sections">
              <details>
                <summary>Features <span className="vd-arrow">›</span></summary>
                <div className="vd-details-content">
                  • {currentProduct.offer || "Premium Quality"}<br />
                  • Handcrafted with detail<br />
                  • Durable and long lasting
                </div>
              </details>
              <details>
                <summary>Specifications <span className="vd-arrow">›</span></summary>
                <div className="vd-details-content">
                  Category: {currentProduct.category}<br />
                  Material: Premium Craft<br />
                  Artist: {currentProduct.author}
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Lifestyle Section */}
      <div className="vd-lifestyle-section" style={{ background: '#f8f6fc', padding: '100px 0', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '50px' }}>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>{currentProduct.title} Elevate Your Presence</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>{currentProduct.description.substring(0, 150)}...</p>
            <button className="vd-add-to-cart-btn" style={{ width: 'auto', padding: '15px 40px' }} onClick={handleAddToCart}>
              ★ Add To Cart
            </button>
            <div style={{ marginTop: '20px' }}>
              <span style={{ color: '#ffb800' }}>★★★★★</span> <small>Rated 4.9/5 by 1,000+ Happy Customers</small>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <img
              src={getImageUrl(currentProduct.bookImage || currentProduct.image)}
              alt="Lifestyle"
              style={{ width: '100%', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            />
          </div>
        </div>
      </div>

      <div className="vd-recommend-section">
        <div className="vd-section-header">
          <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Benefits Redefined</h2>
          <p style={{ color: '#888', marginBottom: '40px' }}>Experience the redefined allure with our premium collection</p>
          <div className="vd-divider"></div>
        </div>
        <div className="vd-recommend-list">
          {recommendations.length > 0 ? (
            recommendations.map((rec) => (
              <div
                className="vd-recommend-card"
                key={rec.id}
                onClick={() => {
                  navigate('/view-details', { state: { book: rec } });
                  window.scrollTo(0, 0);
                  setProduct(rec); // Update current view
                }}
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="vd-recommend-cart-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(rec);
                    toast.success(`${rec.title} added to cart!`);
                  }}
                >
                  🛒
                </div>
                <img src={getImageUrl(rec.bookImage)} alt={rec.title} className="vd-recommend-img" />
                <div className="vd-recommend-title">
                  {rec.title}<br />
                  <span>{rec.author}</span>
                  <div style={{ marginTop: '8px', color: '#007bff', fontSize: '14px', fontWeight: 'bold' }}>
                    Rs. {rec.price}/-
                  </div>
                </div>
                <button className="vd-recommend-action">View Details</button>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', width: '100%', color: '#666' }}>No other items to recommend right now.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ViewDetails; 