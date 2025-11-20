import { useAuthStore } from '@/store/modules/auth';

export const authGuard = (to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const userRole = authStore.userRole;
  const requiredRole = to.meta.requiredRole;

  if (requiresAuth && !isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  if (requiresAuth && requiredRole && userRole !== requiredRole) {
    return next({ name: 'forbidden' });
  }

  next();
};

export const publicGuard = (to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  
  if (isAuthenticated && (to.name === 'login' || to.name === 'register')) {
    // Redirect to appropriate dashboard based on role
    const userRole = authStore.userRole;
    const dashboardRoutes = {
      admin: '/admin/dashboard',
      hospital: '/hospital/dashboard',
      doctor: '/doctor/dashboard',
      student: '/student/dashboard',
    };
    return next({ path: dashboardRoutes[userRole] || '/student/dashboard' });
  }
  
  next();
};
