import { createRouter, createWebHistory } from 'vue-router';
import { authGuard, publicGuard } from './guards';

// Import route modules
import publicRoutes from './routes/public';
import studentRoutes from './routes/student';
import hospitalRoutes from './routes/hospital';
import doctorRoutes from './routes/doctor';
import adminRoutes from './routes/admin';

const routes = [
  ...publicRoutes,
  ...studentRoutes,
  ...hospitalRoutes,
  ...doctorRoutes,
  ...adminRoutes,
  // Catch all 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when navigating
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Global navigation guards
router.beforeEach((to, from, next) => {
  // Handle root path redirect immediately
  if (to.path === '/' || to.path === '') {
    return next('/student/dashboard');
  }

  // Set page title
  document.title = to.meta.title 
    ? `${to.meta.title} | PGSM Internship` 
    : 'PGSM Internship Management';

  // Apply public guard for auth pages
  if (to.meta.layout === 'empty') {
    return publicGuard(to, from, next);
  }

  // Apply auth guard for protected routes
  if (to.matched.some(record => record.meta.requiresAuth)) {
    return authGuard(to, from, next);
  }

  next();
});

export default router;
