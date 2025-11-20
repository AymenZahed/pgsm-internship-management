const studentRoutes = [
  {
    path: '/student/dashboard',
    name: 'student-dashboard',
    component: () => import('@/views/Student/Dashboard.vue'),
    meta: { 
      title: 'Student Dashboard'
      // Temporarily removed auth requirement for testing
      // requiresAuth: true,
      // requiredRole: 'student'
    }
  },
  {
    path: '/student/profile',
    name: 'student-profile',
    component: () => import('@/views/Student/Profile.vue'),
    meta: { 
      title: 'My Profile', 
      requiresAuth: true,
      requiredRole: 'student'
    }
  },
  {
    path: '/student/internships',
    name: 'student-internships',
    component: () => import('@/views/Student/InternshipsList.vue'),
    meta: { 
      title: 'Available Internships', 
      requiresAuth: true,
      requiredRole: 'student'
    }
  },
  {
    path: '/student/internships/:id',
    name: 'internship-details',
    component: () => import('@/views/Student/InternshipDetails.vue'),
    meta: { 
      title: 'Internship Details', 
      requiresAuth: true,
      requiredRole: 'student'
    }
  },
  {
    path: '/student/applications',
    name: 'my-applications',
    component: () => import('@/views/Student/MyApplications.vue'),
    meta: { 
      title: 'My Applications', 
      requiresAuth: true,
      requiredRole: 'student'
    }
  },
  {
    path: '/student/internships/:id/apply',
    name: 'apply-internship',
    component: () => import('@/views/Student/Apply.vue'),
    meta: { 
      title: 'Apply for Internship', 
      requiresAuth: true,
      requiredRole: 'student'
    }
  },
  {
    path: '/student/my-internships',
    name: 'my-internships',
    component: () => import('@/views/Student/MyInternships.vue'),
    meta: { 
      title: 'My Internships', 
      requiresAuth: true,
      requiredRole: 'student'
    }
  },
  {
    path: '/student/logbook',
    name: 'logbook',
    component: () => import('@/views/Student/Logbook.vue'),
    meta: { 
      title: 'My Logbook', 
      requiresAuth: true,
      requiredRole: 'student'
    }
  },
  {
    path: '/student/attendance',
    name: 'attendance',
    component: () => import('@/views/Student/Attendance.vue'),
    meta: { 
      title: 'My Attendance', 
      requiresAuth: true,
      requiredRole: 'student'
    }
  },
  {
    path: '/student/evaluations',
    name: 'evaluations',
    component: () => import('@/views/Student/Evaluations.vue'),
    meta: { 
      title: 'My Evaluations', 
      requiresAuth: true,
      requiredRole: 'student'
    }
  },
  {
    path: '/student/messages',
    name: 'student-messages',
    component: () => import('@/views/Student/Messages.vue'),
    meta: { 
      title: 'Messages', 
      requiresAuth: true,
      requiredRole: 'student'
    }
  },
  {
    path: '/student/notifications',
    name: 'student-notifications',
    component: () => import('@/views/Student/Notifications.vue'),
    meta: { 
      title: 'Notifications', 
      requiresAuth: true,
      requiredRole: 'student'
    }
  }
];

export default studentRoutes;
