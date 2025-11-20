const hospitalRoutes = [
  {
    path: '/hospital/dashboard',
    name: 'hospital-dashboard',
    component: () => import('@/views/Hospital/Dashboard.vue'),
    meta: { 
      title: 'Hospital Dashboard', 
      requiresAuth: true,
      requiredRole: 'hospital'
    }
  },
  {
    path: '/hospital/profile',
    name: 'hospital-profile',
    component: () => import('@/views/Hospital/Profile.vue'),
    meta: { 
      title: 'Hospital Profile', 
      requiresAuth: true,
      requiredRole: 'hospital'
    }
  },
  {
    path: '/hospital/services',
    name: 'hospital-services',
    component: () => import('@/views/Hospital/Services.vue'),
    meta: { 
      title: 'Hospital Services', 
      requiresAuth: true,
      requiredRole: 'hospital'
    }
  },
  {
    path: '/hospital/offers',
    name: 'hospital-offers',
    component: () => import('@/views/Hospital/OffersList.vue'),
    meta: { 
      title: 'Internship Offers', 
      requiresAuth: true,
      requiredRole: 'hospital'
    }
  },
  {
    path: '/hospital/offers/create',
    name: 'create-offer',
    component: () => import('@/views/Hospital/OfferCreate.vue'),
    meta: { 
      title: 'Create Offer', 
      requiresAuth: true,
      requiredRole: 'hospital'
    }
  },
  {
    path: '/hospital/offers/:id/edit',
    name: 'edit-offer',
    component: () => import('@/views/Hospital/OfferEdit.vue'),
    meta: { 
      title: 'Edit Offer', 
      requiresAuth: true,
      requiredRole: 'hospital'
    }
  },
  {
    path: '/hospital/applications',
    name: 'hospital-applications',
    component: () => import('@/views/Hospital/ApplicationsList.vue'),
    meta: { 
      title: 'Applications', 
      requiresAuth: true,
      requiredRole: 'hospital'
    }
  },
  {
    path: '/hospital/applications/:id',
    name: 'application-details',
    component: () => import('@/views/Hospital/ApplicationDetails.vue'),
    meta: { 
      title: 'Application Details', 
      requiresAuth: true,
      requiredRole: 'hospital'
    }
  },
  {
    path: '/hospital/students',
    name: 'hospital-students',
    component: () => import('@/views/Hospital/StudentsList.vue'),
    meta: { 
      title: 'Students', 
      requiresAuth: true,
      requiredRole: 'hospital'
    }
  },
  {
    path: '/hospital/statistics',
    name: 'hospital-statistics',
    component: () => import('@/views/Hospital/Statistics.vue'),
    meta: { 
      title: 'Statistics', 
      requiresAuth: true,
      requiredRole: 'hospital'
    }
  },
  {
    path: '/hospital/tutors',
    name: 'hospital-tutors',
    component: () => import('@/views/Hospital/Tutors.vue'),
    meta: { 
      title: 'Tutors', 
      requiresAuth: true,
      requiredRole: 'hospital'
    }
  }
];

export default hospitalRoutes;
