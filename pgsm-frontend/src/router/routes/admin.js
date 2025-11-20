const adminRoutes = [
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('@/views/Admin/Dashboard.vue'),
    meta: { 
      title: 'Admin Dashboard', 
      requiresAuth: true,
      requiredRole: 'admin'
    }
  },
  {
    path: '/admin/users',
    name: 'users-management',
    component: () => import('@/views/Admin/UsersList.vue'),
    meta: { 
      title: 'Users Management', 
      requiresAuth: true,
      requiredRole: 'admin'
    }
  },
  {
    path: '/admin/users/create',
    name: 'user-create',
    component: () => import('@/views/Admin/UserCreate.vue'),
    meta: { 
      title: 'Create User', 
      requiresAuth: true,
      requiredRole: 'admin'
    }
  },
  {
    path: '/admin/users/:id/edit',
    name: 'user-edit',
    component: () => import('@/views/Admin/UserEdit.vue'),
    meta: { 
      title: 'Edit User', 
      requiresAuth: true,
      requiredRole: 'admin'
    }
  },
  {
    path: '/admin/students',
    name: 'students-management',
    component: () => import('@/views/Admin/StudentsManagement.vue'),
    meta: { 
      title: 'Students Management', 
      requiresAuth: true,
      requiredRole: 'admin'
    }
  },
  {
    path: '/admin/hospitals',
    name: 'hospitals-management',
    component: () => import('@/views/Admin/HospitalsManagement.vue'),
    meta: { 
      title: 'Hospitals Management', 
      requiresAuth: true,
      requiredRole: 'admin'
    }
  },
  {
    path: '/admin/internships',
    name: 'internships-overview',
    component: () => import('@/views/Admin/InternshipsOverview.vue'),
    meta: { 
      title: 'Internships Overview', 
      requiresAuth: true,
      requiredRole: 'admin'
    }
  },
  {
    path: '/admin/statistics',
    name: 'admin-statistics',
    component: () => import('@/views/Admin/Statistics.vue'),
    meta: { 
      title: 'System Statistics', 
      requiresAuth: true,
      requiredRole: 'admin'
    }
  },
  {
    path: '/admin/reports',
    name: 'reports',
    component: () => import('@/views/Admin/Reports.vue'),
    meta: { 
      title: 'Reports', 
      requiresAuth: true,
      requiredRole: 'admin'
    }
  },
  {
    path: '/admin/configuration',
    name: 'configuration',
    component: () => import('@/views/Admin/Configuration.vue'),
    meta: { 
      title: 'System Configuration', 
      requiresAuth: true,
      requiredRole: 'admin'
    }
  },
  {
    path: '/admin/logs',
    name: 'system-logs',
    component: () => import('@/views/Admin/Logs.vue'),
    meta: { 
      title: 'System Logs', 
      requiresAuth: true,
      requiredRole: 'admin'
    }
  },
  {
    path: '/admin/support',
    name: 'admin-support',
    component: () => import('@/views/Admin/Support.vue'),
    meta: { 
      title: 'Support', 
      requiresAuth: true,
      requiredRole: 'admin'
    }
  }
];

export default adminRoutes;
