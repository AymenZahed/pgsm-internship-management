const publicRoutes = [
  {
    path: '/',
    redirect: '/student/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Public/Login.vue'),
    meta: { title: 'Login', layout: 'empty' }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/Public/ForgotPassword.vue'),
    meta: { title: 'Forgot Password', layout: 'empty' }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/Public/ResetPassword.vue'),
    meta: { title: 'Reset Password', layout: 'empty' }
  },
  {
    path: '/404',
    name: 'not-found',
    component: () => import('@/views/Error/NotFound404.vue'),
    meta: { title: 'Not Found', layout: 'empty' }
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/Error/Forbidden403.vue'),
    meta: { title: 'Forbidden', layout: 'empty' }
  },
  {
    path: '/500',
    name: 'server-error',
    component: () => import('@/views/Error/ServerError500.vue'),
    meta: { title: 'Server Error', layout: 'empty' }
  },
  {
    path: '/maintenance',
    name: 'maintenance',
    component: () => import('@/views/Error/Maintenance.vue'),
    meta: { title: 'Maintenance', layout: 'empty' }
  }
];

export default publicRoutes;
