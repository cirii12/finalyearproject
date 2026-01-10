import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useCart } from './CartContext';
import './Booklist.css';
import { toast } from 'react-toastify';
import { fetchBooks, getImageUrl } from '../services/api';

const categories = ['All', 'Blanket', 'Bouquet', 'Flowers', 'Amigurumi', 'Keyrings', 'Dress', 'Other'];

const BookList = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const getBooks = async () => {
      setLoading(true);
      try {
        const data = await fetchBooks();
        setBooks(data.content || data); // handle paginated or array response
        setFilteredBooks(data.content || data);
      } catch (error) {
        toast.error('Failed to fetch books.');
      } finally {
        setLoading(false);
      }
    };
    getBooks();
  }, []);

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
      filterBooks(search, activeCategory);
    } else {
      setSearchQuery('');
      filterBooks('', activeCategory);
    }
    // eslint-disable-next-line
  }, [searchParams, activeCategory, books]);

  const filterBooks = (search, category) => {
    let filtered = books;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(book =>
        (book.title && book.title.toLowerCase().includes(searchLower)) ||
        (book.author && book.author.toLowerCase().includes(searchLower)) ||
        (book.category && book.category.toLowerCase().includes(searchLower)) ||
        (book.description && book.description.toLowerCase().includes(searchLower))
      );
    }
    if (category !== 'All') {
      filtered = filtered.filter(book => book.category === category.toUpperCase());
    }
    setFilteredBooks(filtered);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    filterBooks(searchQuery, category);
  };

  const handlePurchase = async (book) => {
    const user = localStorage.getItem('user');
    if (!user) {
      toast.info('Please login or signup to add items to your cart.');
      navigate('/login');
      return;
    }

    // Check if user is trying to buy their own book
    const currentUser = JSON.parse(user);
    const isOwnBook = book.user && (book.user.id === currentUser.userId || book.userId === currentUser.userId);

    if (isOwnBook) {
      toast.warning('You cannot purchase your own book!');
      return;
    }

    try {
      await addToCart(book);
      toast.success('Book added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add book to cart. Please try again.');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setFilteredBooks(books);
    navigate('/book-list');
  };

  return (
    <div className="booklist-page">
      <Navbar />
      <main className="booklist-main">
        <h1 className="booklist-title">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Explore our Handcrafted Items'}
        </h1>
        {(searchQuery || activeCategory !== 'All') && (
          <div className="search-info">
            <p>
              {searchQuery && `Searching for: "${searchQuery}"`}
              {searchQuery && activeCategory !== 'All' && ' and '}
              {activeCategory !== 'All' && `Category: ${activeCategory}`}
            </p>
            <button onClick={clearSearch} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        )}
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="no-results"><h3>Loading books...</h3></div>
        ) : filteredBooks.length === 0 ? (
          <div className="no-results">
            <h3>No items found</h3>
            <p>Try adjusting your search terms or category filter</p>
            <button onClick={clearSearch} className="clear-filters-btn">
              Show All Books
            </button>
          </div>
        ) : (
          <div className="book-grid">
            {filteredBooks.map(book => (
              <div key={book.id} className="book-card-item">
                <img src={getImageUrl(book.bookImage)} alt={book.title} className="book-card-image" />
                <div className="book-card-content">
                  <h3 className="book-card-title">{book.title}</h3>
                  <p className="book-card-author">{book.author}</p>
                  <p className="book-card-description">{book.description}</p>
                  <div className="book-card-footer">
                    <p className="book-card-price">Rs. {book.price}</p>
                    <button onClick={() => handlePurchase(book)} className="purchase-btn">Purchase</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BookList; 