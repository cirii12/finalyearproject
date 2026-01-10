import React from "react";
import { useNavigate } from 'react-router-dom';
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Aboutus.css";

const AboutUs = () => {
    const navigate = useNavigate();
  return (
    <div className="about-page">
      <Navbar />

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-inner container">
          <div className="about-hero-text">
            <p className="eyebrow">Our Story of</p>
            <h1>
              <span className="hero-title-main">lunasu</span>
            </h1>
            <p className="hero-description">
              Founded in 2024, Lunasu began as a passion project in a small
              home studio. Today, we are a community of artisans dedicated to creating beautiful, handmade crochet items that bring joy families worldwide.

            </p>
            <button className="primary-btn"  onClick={() => navigate('/shop')}>Shop Our Collection</button>
          </div>

          <div className="about-hero-card">
            <div className="hero-card-inner">
              <span className="hero-image-placeholder"></span>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="section-heading">
            <h2>Our Values</h2>
            <p>
              Every exchange is guided by our core values of accessibility,
              sustainability, and community.
            </p>
          </div>

          <div className="values-row">
            <div className="value-card">
              <div className="value-icon">❤️</div>
              <h3>Made with Love</h3>
              <p>
                Every item is carefully handcrafted so that each piece feels
                special for its new owner.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">⭐</div>
              <h3>Premium Quality</h3>
              <p>
                We use the finest materials so products arrive exactly as
                expected.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Community Focused</h3>
              <p>
                We connect artisans and customers through our shared love for handmade crafts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-heading">
            <h2>Meet Our Team</h2>
            <p>The people working behind the scenes to keep Lunasu Crochet alive.</p>
          </div>

          <div className="team-row">
            <div className="team-card">
              <div className="team-avatar"></div>
              <h3>Sarah Johnson</h3>
              <p className="team-role">Founder &amp; Lead Designer</p>
              <p className="team-bio">
                Started Lunasu Crochet to make beautiful handmade art accessible to everyone.
              </p>
            </div>
            <div className="team-card">
              <div className="team-avatar"></div>
              <h3>Emily Chen</h3>
              <p className="team-role">Product Lead</p>
              <p className="team-bio">
                Crafts seamless user experiences so it&apos;s easy to discover and purchase unique items.
              </p>
            </div>
            <div className="team-card">
              <div className="team-avatar"></div>
              <h3>Maria Rodriguez</h3>
              <p className="team-role">Community Specialist</p>
              <p className="team-bio">
                Builds partnerships with local artisans and student
                communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process-section">
        <div className="container">
          <div className="section-heading">
            <h2>Our Process</h2>
            <p>
              From creation to delivery, every step is designed to be simple,
              transparent, and secure.
            </p>
          </div>

          <div className="process-row">
            <div className="process-step">
              <div className="process-icon">🧶</div>
              <h3>List</h3>
              <p>Upload handmade items with clear photos and details.</p>
            </div>
            <div className="process-step">
              <div className="process-icon">✨</div>
              <h3>Match</h3>
              <p>
                Customers discover the right item through search, filters, and
                smart suggestions.
              </p>
            </div>
            <div className="process-step">
              <div className="process-icon">✅</div>
              <h3>Quality Check</h3>
              <p>Every item is inspected to ensure what you see is what you get.</p>
            </div>
            <div className="process-step">
              <div className="process-icon">🚚</div>
              <h3>Deliver</h3>
              <p>
                Items are packaged and shipped with care so they reach safely
                and on time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <div className="about-cta-inner">
            <h2>Ready to Experience Lunasu Crochet?</h2>
            <p>
              Explore hundreds of handcrafted items or find the perfect gift for your loved ones.
            </p>
            <div className="cta-actions">
              <button className="primary-btn light"onClick={() => navigate('/shop')} >Shop Now</button>
              <button className="secondary-btn light"onClick={() => navigate('/contact')} >Contact Us</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;