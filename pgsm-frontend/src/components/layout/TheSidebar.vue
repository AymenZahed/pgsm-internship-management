<template>
  <aside class="sidebar" :class="{ 'is-collapsed': isCollapsed }">
    <div class="sidebar-header">
      <div class="logo">
        <router-link to="/" class="logo-link">
          <span v-if="!isCollapsed" class="logo-text">PGSM</span>
          <span v-else class="logo-icon">P</span>
        </router-link>
      </div>
      <button class="collapse-btn" @click="toggleSidebar" :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="isCollapsed" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <div class="sidebar-content">
      <div class="user-info" v-if="!isCollapsed && user">
        <div class="user-avatar">
          <img v-if="user.avatar" :src="user.avatar" :alt="user.name" />
          <span v-else>{{ userInitials }}</span>
        </div>
        <div class="user-details">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-role">{{ userRole }}</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <li v-for="(item, index) in menuItems" :key="index" :class="{ 'has-submenu': item.children }">
            <router-link 
              v-if="!item.children" 
              :to="item.to" 
              class="nav-link"
              :class="{ 'active': isActive(item) }"
            >
              <i :class="item.icon"></i>
              <span class="nav-text">{{ item.title }}</span>
              <span v-if="item.badge" class="badge">{{ item.badge }}</span>
            </router-link>
            
            <a 
              v-else 
              href="#" 
              class="nav-link"
              :class="{ 'active': isSubmenuActive(item) }"
              @click.prevent="toggleSubmenu(index)"
            >
              <i :class="item.icon"></i>
              <span class="nav-text">{{ item.title }}</span>
              <i class="submenu-icon" :class="isSubmenuOpen(index) ? 'icon-chevron-up' : 'icon-chevron-down'"></i>
            </a>
            
            <ul v-if="item.children" class="submenu" :class="{ 'is-open': isSubmenuOpen(index) }">
              <li v-for="(subItem, subIndex) in item.children" :key="subIndex">
                <router-link 
                  :to="subItem.to" 
                  class="submenu-link"
                  :class="{ 'active': $route.path === subItem.to }"
                >
                  {{ subItem.title }}
                  <span v-if="subItem.badge" class="badge">{{ subItem.badge }}</span>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>

    <div class="sidebar-footer">
      <button class="theme-toggle" @click="toggleTheme">
        <i :class="isDarkMode ? 'icon-sun' : 'icon-moon'"></i>
        <span v-if="!isCollapsed">{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'TheSidebar',
  props: {
    user: {
      type: Object,
      default: () => ({
        name: 'John Doe',
        role: 'student',
        avatar: ''
      })
    },
    menuItems: {
      type: Array,
      default: () => []
    },
    collapsed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isCollapsed: this.collapsed,
      openSubmenus: [],
      isDarkMode: false
    };
  },
  computed: {
    userInitials() {
      return this.user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    },
    userRole() {
      return this.user.role ? this.user.role.charAt(0).toUpperCase() + this.user.role.slice(1) : '';
    }
  },
  watch: {
    collapsed(newVal) {
      this.isCollapsed = newVal;
    },
    $route() {
      // Close all submenus when route changes
      this.openSubmenus = [];
    }
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
      this.$emit('toggle', this.isCollapsed);
    },
    toggleSubmenu(index) {
      const submenuIndex = this.openSubmenus.indexOf(index);
      if (submenuIndex === -1) {
        this.openSubmenus.push(index);
      } else {
        this.openSubmenus.splice(submenuIndex, 1);
      }
    },
    isSubmenuOpen(index) {
      return this.openSubmenus.includes(index);
    },
    isActive(item) {
      return this.$route.path === item.to;
    },
    isSubmenuActive(item) {
      if (!item.children) return false;
      return item.children.some(child => this.$route.path.startsWith(child.to));
    },
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    },
    loadTheme() {
      const savedTheme = localStorage.getItem('theme') || 'light';
      this.isDarkMode = savedTheme === 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  },
  mounted() {
    this.loadTheme();
  }
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: #ffffff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 40;
  overflow-y: auto;
}

.sidebar.is-collapsed {
  width: 70px;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  overflow: hidden;
}

.logo-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3182ce;
  letter-spacing: 0.05em;
}

.logo-icon {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3182ce;
}

.collapse-btn {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.collapse-btn:hover {
  background-color: #f7fafc;
  color: #2d3748;
}

.user-info {
  padding: 1.5rem 1rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.125rem;
}

.user-role {
  font-size: 0.75rem;
  color: #718096;
  text-transform: capitalize;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #4a5568;
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
}

.nav-link:hover {
  background-color: #f7fafc;
  color: #2d3748;
}

.nav-link.active {
  background-color: #ebf8ff;
  color: #3182ce;
  font-weight: 500;
  border-right: 3px solid #3182ce;
}

.nav-link i {
  margin-right: 0.75rem;
  font-size: 1.25rem;
  width: 20px;
  text-align: center;
}

.nav-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  background-color: #e53e3e;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  margin-left: 0.5rem;
}

.submenu-icon {
  margin-left: auto;
  font-size: 0.75rem;
  transition: transform 0.2s;
}

.submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  background-color: #f8fafc;
}

.submenu.is-open {
  max-height: 500px;
}

.submenu-link {
  display: block;
  padding: 0.625rem 1.5rem 0.625rem 3.5rem;
  color: #4a5568;
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
}

.submenu-link:hover {
  background-color: #edf2f7;
  color: #2d3748;
}

.submenu-link.active {
  color: #3182ce;
  font-weight: 500;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #f0f0f0;
}

.theme-toggle {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem;
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
  justify-content: center;
}

.theme-toggle:hover {
  background-color: #f7fafc;
  color: #2d3748;
}

.theme-toggle i {
  margin-right: 0.5rem;
}

/* Collapsed state */
.sidebar.is-collapsed .nav-text,
.sidebar.is-collapsed .user-details,
.sidebar.is-collapsed .submenu,
.sidebar.is-collapsed .theme-toggle span {
  display: none;
}

.sidebar.is-collapsed .nav-link {
  justify-content: center;
  padding: 0.75rem;
}

.sidebar.is-collapsed .nav-link i {
  margin-right: 0;
  font-size: 1.5rem;
}

.sidebar.is-collapsed .user-info {
  justify-content: center;
  padding: 1rem 0;
}

.sidebar.is-collapsed .user-avatar {
  margin-right: 0;
}

/* Dark mode */
[data-theme="dark"] .sidebar {
  background-color: #2d3748;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .sidebar-header,
[data-theme="dark"] .user-info,
[data-theme="dark"] .sidebar-footer {
  border-color: #4a5568;
}

[data-theme="dark"] .nav-link {
  color: #cbd5e0;
}

[data-theme="dark"] .nav-link:hover {
  background-color: #4a5568;
  color: #ffffff;
}

[data-theme="dark"] .nav-link.active {
  background-color: #2c5282;
  color: #ffffff;
  border-right-color: #63b3ed;
}

[data-theme="dark"] .user-name {
  color: #f7fafc;
}

[data-theme="dark"] .user-role {
  color: #a0aec0;
}

[data-theme="dark"] .submenu {
  background-color: #2d3748;
}

[data-theme="dark"] .submenu-link {
  color: #a0aec0;
}

[data-theme="dark"] .submenu-link:hover {
  background-color: #4a5568;
  color: #ffffff;
}

[data-theme="dark"] .submenu-link.active {
  color: #63b3ed;
}

[data-theme="dark"] .theme-toggle {
  border-color: #4a5568;
  color: #cbd5e0;
}

[data-theme="dark"] .theme-toggle:hover {
  background-color: #4a5568;
  color: #ffffff;
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.is-mobile-open {
    transform: translateX(0);
  }
  
  .sidebar.is-collapsed {
    width: 250px;
  }
  
  .sidebar.is-collapsed .nav-text,
  .sidebar.is-collapsed .user-details,
  .sidebar.is-collapsed .theme-toggle span {
    display: block;
  }
  
  .sidebar.is-collapsed .submenu {
    display: block;
  }
  
  .sidebar.is-collapsed .nav-link {
    justify-content: flex-start;
    padding: 0.75rem 1.5rem;
  }
  
  .sidebar.is-collapsed .nav-link i {
    margin-right: 0.75rem;
    font-size: 1.25rem;
  }
  
  .sidebar.is-collapsed .user-info {
    justify-content: flex-start;
    padding: 1.5rem 1rem;
  }
  
  .sidebar.is-collapsed .user-avatar {
    margin-right: 0.75rem;
  }
}
</style>
