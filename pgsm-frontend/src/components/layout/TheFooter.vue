<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3 class="footer-title">About PGSM Internship</h3>
        <p class="footer-text">Connecting students with the best internship opportunities in the medical field.</p>
        <div class="social-links">
          <a href="#" class="social-link" aria-label="Facebook">
            <i class="icon-facebook"></i>
          </a>
          <a href="#" class="social-link" aria-label="Twitter">
            <i class="icon-twitter"></i>
          </a>
          <a href="#" class="social-link" aria-label="LinkedIn">
            <i class="icon-linkedin"></i>
          </a>
          <a href="#" class="social-link" aria-label="Instagram">
            <i class="icon-instagram"></i>
          </a>
        </div>
      </div>
      
      <div class="footer-section">
        <h3 class="footer-title">Quick Links</h3>
        <ul class="footer-links">
          <li><router-link to="/about" class="footer-link">About Us</router-link></li>
          <li><router-link to="/contact" class="footer-link">Contact</router-link></li>
          <li><router-link to="/faq" class="footer-link">FAQs</router-link></li>
          <li><router-link to="/privacy" class="footer-link">Privacy Policy</router-link></li>
          <li><router-link to="/terms" class="footer-link">Terms of Service</router-link></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3 class="footer-title">Contact Us</h3>
        <address class="contact-info">
          <p><i class="icon-map-pin"></i> 123 Medical Street, Health City, HC 12345</p>
          <p><i class="icon-phone"></i> +1 (555) 123-4567</p>
          <p><i class="icon-mail"></i> info@pgm-internship.com</p>
        </address>
      </div>
      
      <div class="footer-section">
        <h3 class="footer-title">Newsletter</h3>
        <p class="footer-text">Subscribe to our newsletter for the latest updates and opportunities.</p>
        <form @submit.prevent="subscribe" class="newsletter-form">
          <div class="form-group">
            <input 
              type="email" 
              v-model="email" 
              placeholder="Your email address" 
              class="newsletter-input"
              required
            />
            <button type="submit" class="newsletter-button">
              <i class="icon-send"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <div class="footer-bottom">
      <div class="container">
        <p>&copy; {{ currentYear }} PGSM Internship Program. All rights reserved.</p>
        <div class="footer-lang">
          <select v-model="selectedLanguage" class="lang-select">
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'TheFooter',
  data() {
    return {
      email: '',
      selectedLanguage: 'en'
    };
  },
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  },
  methods: {
    subscribe() {
      // Handle newsletter subscription
      console.log('Subscribed with email:', this.email);
      this.email = '';
      // Show success message
      this.$toast.success('Thank you for subscribing to our newsletter!');
    }
  }
};
</script>

<style scoped>
.footer {
  background-color: #2d3748;
  color: #e2e8f0;
  padding: 4rem 0 0;
  margin-top: auto;
  font-size: 0.95rem;
  line-height: 1.6;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
}

.footer-section {
  padding: 0 1rem;
}

.footer-title {
  color: #ffffff;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.75rem;
}

.footer-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 2px;
  background-color: #4299e1;
}

.footer-text {
  margin-bottom: 1.5rem;
  color: #a0aec0;
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  transition: all 0.3s ease;
}

.social-link:hover {
  background-color: #4299e1;
  color: #ffffff;
  transform: translateY(-3px);
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-link {
  color: #a0aec0;
  text-decoration: none;
  transition: color 0.2s ease;
  display: inline-block;
  position: relative;
}

.footer-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: #4299e1;
  transition: width 0.3s ease;
}

.footer-link:hover {
  color: #ffffff;
}

.footer-link:hover::after {
  width: 100%;
}

.contact-info {
  font-style: normal;
  color: #a0aec0;
}

.contact-info p {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.contact-info i {
  margin-right: 0.75rem;
  color: #4299e1;
  margin-top: 0.25rem;
}

.newsletter-form {
  margin-top: 1.5rem;
}

.form-group {
  position: relative;
  display: flex;
  width: 100%;
}

.newsletter-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #4a5568;
  border-radius: 4px;
  background-color: #2d3748;
  color: #e2e8f0;
  font-size: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.newsletter-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
}

.newsletter-button {
  position: absolute;
  right: 0.25rem;
  top: 50%;
  transform: translateY(-50%);
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.newsletter-button:hover {
  background-color: #3182ce;
}

.footer-bottom {
  border-top: 1px solid #4a5568;
  padding: 1.5rem 0;
  text-align: center;
  color: #a0aec0;
  font-size: 0.875rem;
}

.footer-bottom .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.lang-select {
  background-color: #4a5568;
  color: #e2e8f0;
  border: 1px solid #4a5568;
  border-radius: 4px;
  padding: 0.5rem 2rem 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23e2e8f0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px;
  transition: all 0.2s;
}

.lang-select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
}

/* Responsive styles */
@media (max-width: 992px) {
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5rem 1rem;
  }
  
  .footer-section {
    padding: 0;
  }
}

@media (max-width: 768px) {
  .footer {
    padding-top: 3rem;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding-bottom: 2rem;
  }
  
  .footer-bottom .container {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .footer-lang {
    margin-top: 0.5rem;
  }
}

/* Print styles */
@media print {
  .footer {
    display: none;
  }
}
</style>
