import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/T.M.F.K.png";
import "../css/HomeDashboard.css";

const HomeDashboard = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact Us' }
  ];

  const wasteCategories = [
    { 
      title: 'Plastic Recycling', 
      count: '2,480', 
      unit: 'Tons',
      description: 'Processing and repurposing plastic waste materials',
      gradient: 'gradient-blue'
    },
    { 
      title: 'Organic Waste', 
      count: '1,860', 
      unit: 'Tons',
      description: 'Converting organic matter into compost',
      gradient: 'gradient-green'
    },
    { 
      title: 'Electronic Waste', 
      count: '312', 
      unit: 'Tons',
      description: 'Safe disposal of electronic components',
      gradient: 'gradient-purple'
    },
    { 
      title: 'Metal Recycling', 
      count: '1,421', 
      unit: 'Tons',
      description: 'Recovering and processing scrap metals',
      gradient: 'gradient-gray'
    },
    { 
      title: 'Paper & Cardboard', 
      count: '1,895', 
      unit: 'Tons',
      description: 'Recycling paper products and packaging',
      gradient: 'gradient-yellow'
    },
    { 
      title: 'Hazardous Waste', 
      count: '143', 
      unit: 'Tons',
      description: 'Specialized handling of dangerous materials',
      gradient: 'gradient-red'
    }
  ];

  const recentActivities = [
    { 
      title: 'Community Cleanup Drive', 
      location: 'Central Park', 
      date: 'March 15, 2024',
      participants: '245 Volunteers',
      status: 'Completed'
    },
    { 
      title: 'E-Waste Collection Event', 
      location: 'City Center', 
      date: 'March 10, 2024',
      participants: '180 Participants',
      status: 'Completed'
    },
    { 
      title: 'Plastic Recycling Workshop', 
      location: 'Community Hall', 
      date: 'March 5, 2024',
      participants: '95 Attendees',
      status: 'Completed'
    }
  ];

  const services = [
    {
      title: 'Residential Recycling',
      description: 'Comprehensive door-to-door collection and processing of household recyclables with advanced smart sorting technology and real-time tracking.',
      features: ['Weekly Collection', 'Smart Bins', 'Mobile Tracking']
    },
    {
      title: 'Commercial Solutions',
      description: 'Customized waste management plans designed for businesses, offices, and industrial facilities with dedicated support teams.',
      features: ['Custom Scheduling', 'Bulk Processing', 'Compliance Reports']
    },
    {
      title: 'E-Waste Management',
      description: 'Professional collection and responsible recycling of electronic waste with complete data security assurance and certification.',
      features: ['Data Destruction', 'Certified Process', 'Asset Recovery']
    },
    {
      title: 'Educational Programs',
      description: 'Comprehensive workshops, training sessions, and community outreach programs to promote sustainable waste management practices.',
      features: ['School Programs', 'Corporate Training', 'Community Events']
    },
    {
      title: 'Hazardous Waste',
      description: 'Specialized handling and disposal of hazardous materials following strict safety regulations and environmental standards.',
      features: ['Safe Disposal', 'Regulatory Compliance', 'Emergency Response']
    },
    {
      title: 'Waste Analytics',
      description: 'Advanced data-driven insights and comprehensive reporting to optimize waste management strategies and reduce costs.',
      features: ['Real-time Data', 'Cost Analysis', 'Performance Metrics']
    }
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      alert('Message sent successfully! We will contact you soon.');
      setFormData({ name: '', email: '', message: '' });
    }
  };

  const handleAdminLogin = () => {
    navigate('/Login');
  };

  const renderHome = () => (
    <div className="home-content">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background-pattern"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Sustainable Solutions
          </div>
          <h1 className="hero-title">
            Transforming Waste into
            <span className="hero-highlight"> Valuable Resources</span>
          </h1>
          <p className="hero-description">
            Smart waste management solutions for a cleaner, greener tomorrow. 
            Join us in building a sustainable future through innovation and community engagement.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => setActiveSection('services')}>
              <span className="btn-text">Explore Services</span>
              <span className="btn-arrow">→</span>
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveSection('contact')}>
              <span className="btn-text">Get Started</span>
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-number">15K+</div>
            <div className="stat-label">Tons Recycled</div>
            <div className="stat-bar"></div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">850+</div>
            <div className="stat-label">Communities</div>
            <div className="stat-bar"></div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">42</div>
            <div className="stat-label">Partner Cities</div>
            <div className="stat-bar"></div>
          </div>
        </div>
      </section>

      {/* Waste Categories Grid */}
      <section className="categories-section">
        <div className="section-header">
          <div className="section-badge">Categories</div>
          <h2 className="section-title">Waste Management Categories</h2>
          <p className="section-subtitle">Comprehensive solutions for every type of waste material</p>
        </div>
        <div className="categories-grid">
          {wasteCategories.map((category, index) => (
            <div
              key={index}
              className={`category-card ${hoveredCard === index ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`category-gradient ${category.gradient}`}></div>
              <div className="category-content">
                <div className="category-header">
                  <h3 className="category-title">{category.title}</h3>
                  <div className="category-number">{String(index + 1).padStart(2, '0')}</div>
                </div>
                <div className="category-stats">
                  <span className="category-count">{category.count}</span>
                  <span className="category-unit">{category.unit}</span>
                </div>
                <p className="category-description">{category.description}</p>
                <div className="category-footer">
                  <button className="category-btn">
                    <span>View Details</span>
                    <span className="btn-arrow">→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activities */}
      <section className="activities-section">
        <div className="section-header">
          <div className="section-badge">Activities</div>
          <h2 className="section-title">Recent Community Activities</h2>
          <p className="section-subtitle">Making a difference together through collective action</p>
        </div>
        <div className="activities-list">
          {recentActivities.map((activity, index) => (
            <div key={index} className="activity-card">
              <div className="activity-indicator">
                <div className="indicator-pulse"></div>
              </div>
              <div className="activity-content">
                <div className="activity-header">
                  <h3 className="activity-title">{activity.title}</h3>
                  <span className="activity-status">
                    <span className="status-dot"></span>
                    {activity.status}
                  </span>
                </div>
                <div className="activity-details">
                  <div className="activity-detail">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{activity.location}</span>
                  </div>
                  <div className="activity-detail">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">{activity.date}</span>
                  </div>
                  <div className="activity-detail">
                    <span className="detail-label">Participation</span>
                    <span className="detail-value">{activity.participants}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="impact-section">
        <div className="section-header">
          <div className="section-badge">Impact</div>
          <h2 className="section-title">Our Environmental Impact</h2>
          <p className="section-subtitle">Measurable results in sustainability and conservation</p>
        </div>
        <div className="impact-grid">
          <div className="impact-card impact-green">
            <div className="impact-icon-wrapper">
              <div className="impact-circle"></div>
            </div>
            <div className="impact-value">15,000+</div>
            <div className="impact-label">Tons Recycled Annually</div>
            <div className="impact-description">Diverted from landfills through our recycling programs</div>
            <div className="impact-progress">
              <div className="progress-bar" style={{width: '85%'}}></div>
            </div>
          </div>
          <div className="impact-card impact-blue">
            <div className="impact-icon-wrapper">
              <div className="impact-circle"></div>
            </div>
            <div className="impact-value">25,000</div>
            <div className="impact-label">Carbon Tons Reduced</div>
            <div className="impact-description">Equivalent CO₂ emissions prevented each year</div>
            <div className="impact-progress">
              <div className="progress-bar" style={{width: '70%'}}></div>
            </div>
          </div>
          <div className="impact-card impact-yellow">
            <div className="impact-icon-wrapper">
              <div className="impact-circle"></div>
            </div>
            <div className="impact-value">200+</div>
            <div className="impact-label">Green Jobs Created</div>
            <div className="impact-description">Employment opportunities in sustainable sectors</div>
            <div className="impact-progress">
              <div className="progress-bar" style={{width: '60%'}}></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderAbout = () => (
    <div className="about-content">
      <section className="about-hero">
        <div className="hero-background-pattern"></div>
        <h1 className="page-title">About WasteWise</h1>
        <p className="page-subtitle">Leading the revolution in sustainable waste management</p>
      </section>

      <section className="mission-section">
        <div className="mission-card">
          <div className="mission-header">
            <div className="section-badge">Mission</div>
            <h2 className="mission-title">Our Mission</h2>
            <div className="title-underline"></div>
          </div>
          <div className="mission-content">
            <p className="mission-text">
              WasteWise is committed to revolutionizing waste management through innovative solutions 
              that promote sustainability, reduce environmental impact, and create economic opportunities 
              from waste materials. We believe in transforming challenges into opportunities.
            </p>
            <p className="mission-text">
              We believe that waste is not an endpoint, but a valuable resource waiting to be transformed. 
              Our smart waste management systems help communities and businesses turn waste into wealth 
              while protecting our planet for future generations.
            </p>
          </div>
        </div>
      </section>

      <section className="services-overview">
        <div className="section-badge">Services</div>
        <h2 className="section-title">What We Do</h2>
        <div className="services-grid">
          <div className="service-item">
            <div className="service-number">01</div>
            <h3 className="service-title">Smart Collection</h3>
            <p className="service-description">
              AI-powered waste collection routes and smart bins for efficient operations 
              and optimized resource utilization.
            </p>
            <div className="service-line"></div>
          </div>
          <div className="service-item">
            <div className="service-number">02</div>
            <h3 className="service-title">Recycling Solutions</h3>
            <p className="service-description">
              Advanced recycling facilities that process various waste materials 
              effectively with state-of-the-art technology.
            </p>
            <div className="service-line"></div>
          </div>
          <div className="service-item">
            <div className="service-number">03</div>
            <h3 className="service-title">Community Programs</h3>
            <p className="service-description">
              Educational initiatives and community engagement programs for 
              promoting sustainable waste management practices.
            </p>
            <div className="service-line"></div>
          </div>
          <div className="service-item">
            <div className="service-number">04</div>
            <h3 className="service-title">Data Analytics</h3>
            <p className="service-description">
              Comprehensive waste tracking and reporting systems for better 
              decision making and strategic planning.
            </p>
            <div className="service-line"></div>
          </div>
        </div>
      </section>

      <section className="impact-story">
        <div className="impact-card-large">
          <div className="section-badge">Impact</div>
          <h2 className="impact-title">Our Impact Story</h2>
          <div className="title-underline"></div>
          <p className="impact-text">
            Since our inception, WasteWise has helped divert over 15,000 tons of waste from landfills, 
            reduced carbon emissions by 25,000 tons, and created 200+ green jobs in local communities. 
            We partner with municipalities, businesses, and communities to build a circular economy 
            that benefits everyone.
          </p>
          <div className="impact-metrics">
            <div className="metric-item">
              <div className="metric-value">5+</div>
              <div className="metric-label">Years Experience</div>
              <div className="metric-bar"></div>
            </div>
            <div className="metric-item">
              <div className="metric-value">42</div>
              <div className="metric-label">Partner Cities</div>
              <div className="metric-bar"></div>
            </div>
            <div className="metric-item">
              <div className="metric-value">850+</div>
              <div className="metric-label">Active Communities</div>
              <div className="metric-bar"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderServices = () => (
    <div className="services-content">
      <section className="services-hero">
        <div className="hero-background-pattern"></div>
        <h1 className="page-title">Our Services</h1>
        <p className="page-subtitle">Comprehensive waste management solutions tailored to your needs</p>
      </section>

      <section className="services-detailed">
        {services.map((service, index) => (
          <div key={index} className="service-card-detailed">
            <div className="service-card-header">
              <div className="service-index">{String(index + 1).padStart(2, '0')}</div>
              <h3 className="service-card-title">{service.title}</h3>
            </div>
            <p className="service-card-description">{service.description}</p>
            <div className="service-features">
              {service.features.map((feature, idx) => (
                <div key={idx} className="feature-tag">
                  <span className="feature-dot"></span>
                  {feature}
                </div>
              ))}
            </div>
            <button className="service-card-btn">
              <span>Learn More</span>
              <span className="btn-arrow">→</span>
            </button>
          </div>
        ))}
      </section>

      <section className="why-choose">
        <div className="section-badge">Why Us</div>
        <h2 className="section-title">Why Choose WasteWise?</h2>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-number">01</div>
            <h3 className="why-title">Proven Track Record</h3>
            <p className="why-description">
              Over 5 years of demonstrated excellence in sustainable waste management 
              solutions with measurable environmental impact.
            </p>
            <div className="why-line"></div>
          </div>
          <div className="why-card">
            <div className="why-number">02</div>
            <h3 className="why-title">Technology Driven</h3>
            <p className="why-description">
              Smart systems and AI-powered optimization for maximum efficiency 
              and cost-effectiveness in operations.
            </p>
            <div className="why-line"></div>
          </div>
          <div className="why-card">
            <div className="why-number">03</div>
            <h3 className="why-title">Community Focused</h3>
            <p className="why-description">
              Deeply engaged with local communities for lasting impact and 
              sustainable development initiatives.
            </p>
            <div className="why-line"></div>
          </div>
          <div className="why-card">
            <div className="why-number">04</div>
            <h3 className="why-title">Environmental Commitment</h3>
            <p className="why-description">
              Dedicated to reducing landfill waste and carbon footprint through 
              innovative recycling and recovery programs.
            </p>
            <div className="why-line"></div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderContact = () => (
    <div className="contact-content">
      <section className="contact-hero">
        <div className="hero-background-pattern"></div>
        <h1 className="page-title">Contact WasteWise</h1>
        <p className="page-subtitle">Get in touch with our team for inquiries and support</p>
      </section>

      <section className="contact-main">
        <div className="contact-info-card">
          <div className="section-badge">Info</div>
          <h2 className="contact-card-title">Contact Information</h2>
          <div className="contact-details">
            <div className="contact-item">
              <div className="contact-label">Email Address</div>
              <div className="contact-value">contact@wastewise.com</div>
              <div className="contact-line"></div>
            </div>
            <div className="contact-item">
              <div className="contact-label">Phone Number</div>
              <div className="contact-value">+1 (555) 123-WASTE</div>
              <div className="contact-line"></div>
            </div>
            <div className="contact-item">
              <div className="contact-label">Headquarters</div>
              <div className="contact-value">123 Green Street<br/>Eco City, EC 12345</div>
              <div className="contact-line"></div>
            </div>
            <div className="contact-item">
              <div className="contact-label">Business Hours</div>
              <div className="contact-value">
                Monday - Friday: 7:00 AM - 6:00 PM<br/>
                Saturday: 8:00 AM - 4:00 PM
              </div>
              <div className="contact-line"></div>
            </div>
          </div>
        </div>

        <div className="contact-form-card">
          <div className="section-badge">Message</div>
          <h2 className="contact-card-title">Send a Message</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Your Message</label>
              <textarea 
                rows="5" 
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="How can we help you with waste management?"
                required
              ></textarea>
            </div>
            <button type="submit" className="form-submit-btn">
              <span>Send Message</span>
              <span className="btn-arrow">→</span>
            </button>
          </form>
        </div>
      </section>

      <section className="faq-section">
        <div className="section-badge">FAQ</div>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          <div className="faq-item">
            <div className="faq-number">01</div>
            <h3 className="faq-question">What types of waste do you collect?</h3>
            <p className="faq-answer">
              We collect all types of waste including plastic, paper, metal, organic, electronic, 
              and hazardous waste with proper segregation and handling procedures to ensure 
              environmental safety and compliance.
            </p>
          </div>
          <div className="faq-item">
            <div className="faq-number">02</div>
            <h3 className="faq-question">How often is waste collected?</h3>
            <p className="faq-answer">
              Collection frequency depends on your service plan. We offer daily, weekly, and 
              bi-weekly collection schedules for both residential and commercial clients, 
              with flexible options to meet your specific needs.
            </p>
          </div>
          <div className="faq-item">
            <div className="faq-number">03</div>
            <h3 className="faq-question">Do you provide recycling bins?</h3>
            <p className="faq-answer">
              Yes, we provide color-coded recycling bins for proper waste segregation. We also 
              offer smart bins with sensors for optimized collection routes and real-time 
              monitoring of waste levels.
            </p>
          </div>
        </div>
      </section>
    </div>
  );

  const renderContent = () => {
    switch(activeSection) {
      case 'about':
        return renderAbout();
      case 'services':
        return renderServices();
      case 'contact':
        return renderContact();
      default:
        return renderHome();
    }
  };

  return (
    <div className="home-dashboard">
      {/* Scroll Progress Indicator */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }}></div>

      {/* Header Navigation */}
      <header className="main-header">
        <div className="header-container">
          <div className="header-content">
            {/* Logo Section */}
            <div className="logo-section">
              <img src={logo} alt="WasteWise Logo" className="logo-image" />
              <div className="logo-text">
                <h1 className="logo-title">T.M.F.K.</h1>
                <p className="logo-subtitle"> Waste Innovations</p>
              </div>
            </div>
            
            
            <nav className="main-nav">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`nav-button ${activeSection === item.id ? 'active' : ''}`}
                >
                  {item.label}
                  <span className="nav-indicator"></span>
                </button>
              ))}
            </nav>

            {/* Admin Login Button */}
            <button onClick={handleAdminLogin} className="admin-login-btn">
              <span>Admin Login</span>
              <span className="admin-arrow">→</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {renderContent()}
        
        {/* Footer */}
        <footer className="main-footer">
          <div className="footer-pattern"></div>
          <div className="footer-content">
            <p className="footer-text">
              © 2024 WasteWise | Transforming Waste into Resources for a Sustainable Future
            </p>
            <p className="footer-subtext">Smart Solutions for a Cleaner Planet</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default HomeDashboard;