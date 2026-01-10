import React from 'react';
import './UsedBooksSection.css';
import { fetchBooks, getImageUrl } from '../services/api';

const UsedBooksSection = () => {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const getItems = async () => {
      try {
        const data = await fetchBooks();
        const allBooks = data.content || data;
        // Take top 5 products for the shelf
        setItems(allBooks.slice(0, 5));
      } catch (error) {
        console.error('Error fetching shelf items:', error);
      } finally {
        setLoading(false);
      }
    };
    getItems();
  }, []);

  return (
    <section className="used-books-section">
      <div className="used-books-content">
        <h2 className="used-books-title">
          <span className="title-icon">✔</span>
          Handcrafted Items Starting at Just <br /> Rs. 150
        </h2>
        <p className="used-books-subtitle">
          Explore a Wide Range of Popular Crochet Items in Excellent Condition.
        </p>
        <button className="explore-books-btn">EXPLORE COLLECTION</button>
      </div>
      <div className="bookshelf-container">
        <div className="items-on-shelf">
          {items.map(item => (
            <img key={item.id} src={getImageUrl(item.bookImage)} alt={item.title} className="item-on-shelf" />
          ))}
        </div>
        <div className="bookshelf"></div>
      </div>
    </section>
  );
};

export default UsedBooksSection; 