import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import './About.css';

const About = () => {
  const { isAuthenticated } = useAuthContext();

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <h1>About Financial Planning for Individuals</h1>
            <p>Empowering individuals to take control of their financial future through smart planning and informed decisions.</p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <h2>Our Mission</h2>
              <p>
                We believe that everyone deserves access to powerful financial planning tools that can help them achieve their goals. 
                Our platform is designed to make financial management simple, intuitive, and effective for individuals at every stage of their financial journey.
              </p>
              <p>
                Whether you're just starting to save, planning for retirement, or looking to optimize your investments, 
                our comprehensive suite of tools provides the insights and guidance you need to make confident financial decisions.
              </p>
            </div>
            <div className="mission-stats">
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">$2M+</div>
                <div className="stat-label">Assets Tracked</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">User Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title">Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🔒</div>
              <h3>Security First</h3>
              <p>Your financial data is protected with bank-level security and encryption. We never compromise on your privacy.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🎯</div>
              <h3>User-Centric Design</h3>
              <p>Every feature is designed with our users in mind, ensuring an intuitive and enjoyable experience.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">📊</div>
              <h3>Data-Driven Insights</h3>
              <p>We provide actionable insights based on real data to help you make informed financial decisions.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Transparency</h3>
              <p>We believe in complete transparency about how we handle your data and provide our services.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🚀</div>
              <h3>Innovation</h3>
              <p>We continuously innovate to provide cutting-edge financial planning tools and features.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">💡</div>
              <h3>Education</h3>
              <p>We're committed to financial literacy and helping users understand their financial health.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2 className="section-title">Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">
                <span>👨‍💼</span>
              </div>
              <h3>John Smith</h3>
              <p className="member-role">CEO & Founder</p>
              <p className="member-bio">
                Passionate about democratizing financial planning tools and making them accessible to everyone.
              </p>
            </div>
            <div className="team-member">
              <div className="member-avatar">
                <span>👩‍💻</span>
              </div>
              <h3>Sarah Johnson</h3>
              <p className="member-role">CTO</p>
              <p className="member-bio">
                Leading our technical vision and ensuring our platform remains cutting-edge and secure.
              </p>
            </div>
            <div className="team-member">
              <div className="member-avatar">
                <span>👨‍🎨</span>
              </div>
              <h3>Mike Chen</h3>
              <p className="member-role">Head of Design</p>
              <p className="member-bio">
                Creating beautiful, intuitive user experiences that make financial planning enjoyable.
              </p>
            </div>
            <div className="team-member">
              <div className="member-avatar">
                <span>👩‍💼</span>
              </div>
              <h3>Emily Davis</h3>
              <p className="member-role">Head of Product</p>
              <p className="member-bio">
                Ensuring our product meets the real needs of our users and delivers exceptional value.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>Our Story</h2>
              <p>
                Financial Planning for Individuals was born from a simple observation: most people struggle with managing their finances, 
                not because they lack the desire to do better, but because they lack the right tools and guidance.
              </p>
              <p>
                Founded in 2024, our platform started as a simple expense tracker and has evolved into a comprehensive financial planning 
                solution that helps individuals track income, manage expenses, set goals, and build wealth.
              </p>
              <p>
                Today, we're proud to serve thousands of users who trust us with their financial data and rely on our platform 
                to make better financial decisions every day.
              </p>
            </div>
            <div className="story-image">
              <div className="story-graphic">
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>2024</h4>
                      <p>Platform Launch</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>2024</h4>
                      <p>10K+ Users</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>Future</h4>
                      <p>Expanding Features</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="cta-purple-bg">
          <div className="cta-content">
            <h2>Ready to Start Your Financial Journey?</h2>
            <p>Join thousands of users who are already taking control of their finances with our platform.</p>
            <div className="cta-buttons">
              {!isAuthenticated && (
                <Link to="/register" className="btn btn-primary btn-large">
                  Get Started Free
                </Link>
              )}
              <Link to="/contact" className="btn btn-secondary btn-large">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 