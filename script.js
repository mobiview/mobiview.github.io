// ============================================
// Mobile Viewer Io - Main JavaScript
// ============================================

// ============================================
// Theme Management
// ============================================
const ThemeManager = {
  init() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    }
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = current === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
};

// ============================================
// Navigation & Menu Management
// ============================================
const NavManager = {
  init() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const navLinks = document.querySelectorAll('.nav-mobile-link');

    if (menuToggle) {
      menuToggle.addEventListener('click', () => this.toggleMenu());
    }

    // Close menu when clicking nav links
    navLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Update active nav link
    this.updateActiveLink();
    window.addEventListener('scroll', () => this.updateActiveLink());
  },

  toggleMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    
    menuToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
  },

  closeMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    
    menuToggle.classList.remove('active');
    mobileNav.classList.remove('active');
  },

  updateActiveLink() {
    const links = document.querySelectorAll('.nav-link, .nav-mobile-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    links.forEach(link => {
      const href = link.getAttribute('href').split('/').pop();
      if (href === currentPage || (!currentPage && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
};

// ============================================
// Sidebar Management
// ============================================
const SidebarManager = {
  init() {
    const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
    const sidebar = document.getElementById('mainSidebar');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (sidebarClose) {
      sidebarClose.addEventListener('click', () => this.closeSidebar());
    }

    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => this.closeSidebar());
    }
  },

  openSidebar() {
    const sidebar = document.getElementById('mainSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
  },

  closeSidebar() {
    const sidebar = document.getElementById('mainSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
  }
};

// ============================================
// Component Loader
// ============================================
const ComponentLoader = {
  async loadComponent(selector, filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Failed to load ${filePath}`);
      const html = await response.text();
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.innerHTML = html;
      });
      return true;
    } catch (error) {
      console.error('Error loading component:', error);
      return false;
    }
  },

  async loadAll() {
    await this.loadComponent('#header-placeholder', 'components/header.html');
    await this.loadComponent('#footer-placeholder', 'components/footer.html');
    await this.loadComponent('#sidebar-placeholder', 'components/sidebar.html');
  }
};

// ============================================
// Mobile Viewer Application
// ============================================
const MobileViewer = {
  currentDevice: 'mobile',
  currentURL: 'https://google.com',
  currentZoom: 1,
  deviceSizes: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 800 }
  },

  init() {
    // Device buttons
    const deviceButtons = document.querySelectorAll('[data-device]');
    deviceButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.switchDevice(e.target.dataset.device));
    });

    // URL input
    const urlInput = document.getElementById('urlInput');
    const loadBtn = document.getElementById('loadBtn');
    
    if (loadBtn) {
      loadBtn.addEventListener('click', () => this.loadURL());
    }

    if (urlInput) {
      urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.loadURL();
      });
    }

    // Screen size selector
    const screenSize = document.getElementById('screenSize');
    if (screenSize) {
      screenSize.addEventListener('change', () => this.updateScreenSize());
    }

    // Zoom controls
    const zoomIn = document.getElementById('zoomIn');
    const zoomOut = document.getElementById('zoomOut');
    
    if (zoomIn) zoomIn.addEventListener('click', () => this.zoomIn());
    if (zoomOut) zoomOut.addEventListener('click', () => this.zoomOut());

    this.loadURL();
  },

  switchDevice(device) {
    this.currentDevice = device;
    
    // Update button states
    document.querySelectorAll('[data-device]').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-device="${device}"]`).classList.add('active');

    // Update frame size
    this.updateFrameSize();
  },

  updateScreenSize() {
    this.updateFrameSize();
  },

  updateFrameSize() {
    const frame = document.getElementById('previewFrame');
    const screenSize = document.getElementById('screenSize');
    
    if (!frame) return;

    let width = this.deviceSizes[this.currentDevice].width;
    let height = this.deviceSizes[this.currentDevice].height;

    if (screenSize && screenSize.value) {
      const [w, h] = screenSize.value.split('x');
      width = parseInt(w);
      height = parseInt(h);
    }

    // Set frame dimensions and container centering
    const container = frame.parentElement;
    frame.style.width = width + 'px';
    frame.style.height = height + 'px';
    frame.style.transform = `scale(${this.currentZoom})`;
  },

  loadURL() {
    const urlInput = document.getElementById('urlInput');
    if (!urlInput) return;

    let url = urlInput.value.trim();
    
    if (!url) {
      this.loadDefaultContent();
      return;
    }

    // Add https if no protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    this.currentURL = url;
    const frame = document.getElementById('previewFrame');
    
    if (frame) {
      // Use srcdoc for local content or data: for external
      try {
        frame.src = url;
      } catch (error) {
        console.error('Error loading URL:', error);
        this.loadDefaultContent();
      }
    }
  },

  loadDefaultContent() {
    const frame = document.getElementById('previewFrame');
    if (!frame) return;

    // Load a default page with srcdoc
    const defaultHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mobile Viewer Preview</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              min-height: 100vh; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              padding: 20px; 
            }
            .container { 
              background: white; 
              border-radius: 20px; 
              padding: 40px; 
              text-align: center; 
              box-shadow: 0 20px 60px rgba(0,0,0,0.3); 
              max-width: 100%; 
            }
            h1 { color: #2d3748; margin-bottom: 10px; font-size: 24px; }
            p { color: #718096; margin-bottom: 20px; font-size: 14px; }
            .feature { margin: 20px 0; padding: 15px; background: #f7fafc; border-radius: 10px; }
            .emoji { font-size: 40px; }
            h3 { font-size: 18px; margin: 10px 0; color: #2d3748; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to Mobile Viewer</h1>
            <p>Enter a URL above to preview any website</p>
            <div class="feature">
              <div class="emoji">📱</div>
              <h3>Mobile Preview</h3>
              <p>Test responsive designs</p>
            </div>
            <div class="feature">
              <div class="emoji">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Instant loading and switching</p>
            </div>
            <div class="feature">
              <div class="emoji">🎨</div>
              <h3>Beautiful UI</h3>
              <p>Modern, clean interface</p>
            </div>
          </div>
        </body>
      </html>
    `;

    frame.srcdoc = defaultHTML;
    this.updateFrameSize();
  },

  zoomIn() {
    this.currentZoom = Math.min(this.currentZoom + 0.1, 2);
    this.updateZoomDisplay();
    this.updateFrameSize();
  },

  zoomOut() {
    this.currentZoom = Math.max(this.currentZoom - 0.1, 0.5);
    this.updateZoomDisplay();
    this.updateFrameSize();
  },

  updateZoomDisplay() {
    const zoomLevel = document.getElementById('zoomLevel');
    if (zoomLevel) {
      zoomLevel.textContent = Math.round(this.currentZoom * 100) + '%';
    }
  }
};

// ============================================
// Notifications
// ============================================
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// Newsletter form handler
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('input[type="email"]').value;
  
  if (!email) return;
  
  // Simulate API call
  setTimeout(() => {
    showNotification(`Thank you! Check your email at ${email}`, 'success');
    form.reset();
  }, 500);
}

// ============================================
// Scroll Animations
// ============================================
const ScrollAnimations = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .feature-card, .pricing-card').forEach(el => {
      el.style.opacity = '0';
      observer.observe(el);
    });
  }
};

// ============================================
// Smooth Scroll for Anchor Links
// ============================================
document.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    const href = e.target.getAttribute('href');
    if (href && href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
});

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  NavManager.init();
  SidebarManager.init();
  ScrollAnimations.init();

  // Load components
  ComponentLoader.loadAll().then(() => {
    // Re-initialize after components load
    ThemeManager.init();
    NavManager.init();
    SidebarManager.init();
  });

  // Initialize Mobile Viewer if on viewer page
  if (document.getElementById('previewFrame')) {
    MobileViewer.init();
  }
});

// Add CSS animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    @keyframes slideIn {
      from {
        transform: translateX(300px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  }
`;
document.head.appendChild(style);
