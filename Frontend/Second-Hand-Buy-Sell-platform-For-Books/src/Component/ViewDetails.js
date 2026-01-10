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
      const userData = localStorage.getItem('user');
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
    const user = localStorage.getItem('user');
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
    const user = localStorage.getItem('user');
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
      <Navbar />
      <div className="vd-main">
        <div className="vd-left">
          <div className="vd-title-author">
            <h1>{currentProduct.title}<br /><span>-{currentProduct.author}</span></h1>
          </div>
          <img src={getImageUrl(currentProduct.bookImage || currentProduct.image)} alt={currentProduct.title} className="vd-book-img" />
        </div>
        <div className="vd-right">
          <div className="vd-category">
            <span role="img" aria-label="category" style={{ fontSize: '1.5rem', marginRight: 8 }}>🧶</span>
            <b>Category: {currentProduct.category}</b>
          </div>
          <div className="vd-desc">{currentProduct.description}</div>
          <div className="vd-price-row">
            <span className="vd-price-icon" role="img" aria-label="price">💰</span>
            <span className="vd-price">Rs. {currentProduct.price}/=</span>
          </div>
          <div className="vd-offer">*{currentProduct.offer}</div>

          {/* Show warning if user owns the product */}
          {isOwnProductFlag && (
            <div style={{
              background: '#fff3cd',
              color: '#856404',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '15px',
              border: '1px solid #ffeaa7',
              fontSize: '14px'
            }}>
              {/* ⚠️ This is your own product. You cannot purchase it. */}
            </div>
          )}

          <div className="vd-btn-row">
            <button
              className="vd-btn vd-cart-btn"
              onClick={handleAddToCart}
              disabled={isOwnProductFlag}
              style={{
                opacity: isOwnProductFlag ? 0.5 : 1,
                cursor: isOwnProductFlag ? 'not-allowed' : 'pointer'
              }}
            >
              <span role="img" aria-label="cart">🛒</span> Add to Cart
            </button>
            <button
              className="vd-btn vd-buy-btn"
              onClick={handleBuyNow}
              disabled={isOwnProductFlag}
              style={{
                opacity: isOwnProductFlag ? 0.5 : 1,
                cursor: isOwnProductFlag ? 'not-allowed' : 'pointer'
              }}
            >
              Buy Product
            </button>
          </div>
        </div>
      </div>
      <div className="vd-recommend">
        <h2>You might also like this</h2>
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