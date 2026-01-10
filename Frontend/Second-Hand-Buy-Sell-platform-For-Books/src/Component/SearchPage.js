import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './SearchPage.css';
import './HomePage.css';
import { fetchBooks, getImageUrl } from '../services/api';

const suggestions = [
  'Blankets',
  'Bouquets',
  'Flowers',
  'Amigurumi',
  'Keyrings',
  'Dress',
  'Handmade',
  'Crochet Art',
  'Gift Items',
  'Accessories'
];

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [selectedPriceRange, setSelectedPriceRange] = useState([]);
  const [sortBy, setSortBy] = useState('Featured');
  const booksPerPage = 12;

  const categories = [
    'All Products',
    'Blanket',
    'Bouquet',
    'Flowers',
    'Amigurumi',
    'Keyrings',
    'Dress',
    'Handmade',
    'Crochet Art',
    'Gift Items',
    'Accessories'
  ];

  const priceRanges = [
    { label: 'Under Rs. 500', value: 'under-500' },
    { label: 'Rs. 500 - Rs. 1000', value: '500-1000' },
    { label: 'Rs. 1000 - Rs. 2000', value: '1000-2000' },
    { label: 'Over Rs. 2000', value: 'over-2000' }
  ];

  const handlePriceRangeChange = (value) => {
    setSelectedPriceRange(prev =>
      prev.includes(value)
        ? prev.filter(p => p !== value)
        : [...prev, value]
    );
  };

  // Calculate paginated books
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const paginatedBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on new search/filter
  }, [filteredBooks]);

  useEffect(() => {
    const getBooks = async () => {
      setLoading(true);
      try {
        const data = await fetchBooks();
        setBooks(data.content || data);
        setFilteredBooks(data.content || data);
      } catch (error) {
        setBooks([]);
        setFilteredBooks([]);
      } finally {
        setLoading(false);
      }
    };
    getBooks();
  }, []);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    } else {
      setSearchQuery('');
    }
    // eslint-disable-next-line
  }, [searchParams]);

  const filterAndSortBooks = () => {
    let filtered = [...books];

    // 1. Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(book =>
        (book.title && book.title.toLowerCase().includes(searchLower)) ||
        (book.author && book.author.toLowerCase().includes(searchLower)) ||
        (book.category && book.category.toLowerCase().includes(searchLower)) ||
        (book.description && book.description.toLowerCase().includes(searchLower))
      );
    }

    // 2. Category filter
    if (selectedCategory !== 'All Products') {
      filtered = filtered.filter(book =>
        book.category && (
          book.category.toUpperCase() === selectedCategory.toUpperCase() ||
          book.category.toUpperCase() === selectedCategory.toUpperCase().replace(/S$/, '') // Handle plural/singular
        )
      );
    }

    // 3. Price Range filter
    if (selectedPriceRange.length > 0) {
      filtered = filtered.filter(book => {
        return selectedPriceRange.some(range => {
          const price = parseFloat(book.price);
          if (range === 'under-500') return price < 500;
          if (range === '500-1000') return price >= 500 && price <= 1000;
          if (range === '1000-2000') return price >= 1000 && price <= 2000;
          if (range === 'over-2000') return price > 2000;
          return true;
        });
      });
    }

    // 4. Sorting
    if (sortBy === 'Price Low to High') {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'Price High to Low') {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === 'Newest') {
      filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    setFilteredBooks(filtered);
  };

  useEffect(() => {
    filterAndSortBooks();
    // Reset to first page when any filter changes
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedPriceRange, sortBy, books]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Logic already handled by useEffect since searchQuery state is updated
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
  };

  const handleViewDetails = (book) => {
    navigate('/view-details', { state: { book } });
  };

  return (
    <div className="search-page shop-page">
      <Navbar />
      <main className="shop-main-container">
        {/* Breadcrumbs */}
        <div className="shop-breadcrumbs">
          <span className="breadcrumb-icon">🏠</span>
          <span onClick={() => navigate('/')} className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator"> &gt; </span>
          <span className="breadcrumb-current">Shop</span>
        </div>

        {/* Page Title and Subtitle */}
        <div className="shop-page-header">
          <h1 className="shop-page-title">Our Collection</h1>
          <p className="shop-page-subtitle">Discover beautiful handcrafted crochet items</p>
        </div>

        {/* Main Content with Sidebar */}
        <div className="shop-content-wrapper">
          {/* Left Sidebar - Categories */}
          <aside className="shop-sidebar">
            <div className="sidebar-categories-card">
              <h2 className="sidebar-categories-title">Categories</h2>
              <ul className="sidebar-categories-list">
                {categories.map((category) => (
                  <li
                    key={category}
                    className={`sidebar-category-item ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSearchQuery(''); // Clear search when a category is selected
                    }}
                  >
                    {category}
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range Filter */}
            <div className="sidebar-price-range-card">
              <h2 className="sidebar-categories-title">Price Range</h2>
              <ul className="sidebar-price-range-list">
                {priceRanges.map((range) => (
                  <li key={range.value} className="sidebar-price-range-item">
                    <label className="price-range-label">
                      <input
                        type="checkbox"
                        checked={selectedPriceRange.includes(range.value)}
                        onChange={() => handlePriceRangeChange(range.value)}
                        className="price-range-checkbox"
                      />
                      <span>{range.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Right Main Content */}
          <div className="shop-main-content">
            {/* Results Header with Sort */}
            <div className="shop-results-header">
              <span className="showing-products-text">
                Showing {filteredBooks.length} products
              </span>
              <div className="shop-sort-container">
                <span className="sort-label">Sort by:</span>
                <select
                  className="sort-dropdown"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="Featured">Featured</option>
                  <option value="Price Low to High">Price Low to High</option>
                  <option value="Price High to Low">Price High to Low</option>
                  <option value="Newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Book Grid */}
            {loading ? (
              <div className="no-results"><h3>Loading...</h3></div>
            ) : filteredBooks.length === 0 ? (
              <div className="no-results">
                <h3>No match found</h3>
                <p>Try a different search or browse popular categories above.</p>
              </div>
            ) : (
              <>
                <div className="book-grid">
                  {paginatedBooks.map((book, idx) => (
                    <div className="book-card" key={book.id || idx}>
                      <div
                        className="product-image-placeholder"
                        onClick={() => handleViewDetails(book)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img src={getImageUrl(book.bookImage)} alt={book.title} className="book-image" />
                      </div>
                      <h3>{book.title}</h3>
                      <div className="star-rating">
                        <span className="star">⭐</span>
                        <span className="star">⭐</span>
                        <span className="star">⭐</span>
                        <span className="star">⭐</span>
                        <span className="star">⭐</span>
                      </div>
                      <p className="price">Rs. {book.price}/-</p>
                      <button className="details-button" onClick={() => handleViewDetails(book)}>View Detail</button>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="pagination-controls">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage; 