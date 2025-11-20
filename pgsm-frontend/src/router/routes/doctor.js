const doctorRoutes = [
  {
    path: '/doctor/dashboard',
    name: 'doctor-dashboard',
    component: () => import('@/views/Doctor/Dashboard.vue'),
    meta: { 
      title: 'Doctor Dashboard', 
      requiresAuth: true,
      requiredRole: 'doctor'
    }
  },
  {
    path: '/doctor/profile',
    name: 'doctor-profile',
    component: () => import('@/views/Doctor/Profile.vue'),
    meta: { 
      title: 'My Profile', 
      requiresAuth: true,
      requiredRole: 'doctor'
    }
  },
  {
    path: '/doctor/students',
    name: 'doctor-students',
    component: () => import('@/views/Doctor/Students.vue'),
    meta: { 
      title: 'My Students', 
      requiresAuth: true,
      requiredRole: 'doctor'
    }
  },
  {
    path: '/doctor/attendance',
    name: 'attendance-validation',
    component: () => import('@/views/Doctor/AttendanceValidation.vue'),
    meta: { 
      title: 'Validate Attendance', 
      requiresAuth: true,
      requiredRole: 'doctor'
    }
  },
  {
    path: '/doctor/logbooks',
    name: 'logbook-validation',
    component: () => import('@/views/Doctor/LogbookValidation.vue'),
    meta: { 
      title: 'Validate Logbooks', 
      requiresAuth: true,
      requiredRole: 'doctor'
    }
  },
  {
    path: '/doctor/evaluations',
    name: 'doctor-evaluations',
    component: () => import('@/views/Doctor/Evaluations.vue'),
    meta: { 
      title: 'Student Evaluations', 
      requiresAuth: true,
      requiredRole: 'doctor'
    }
  },
  {
    path: '/doctor/evaluations/:id',
    name: 'evaluation-form',
    component: () => import('@/views/Doctor/EvaluationForm.vue'),
    meta: { 
      title: 'Evaluation Form', 
      requiresAuth: true,
      requiredRole: 'doctor'
    }
  },
  {
    path: '/doctor/messages',
    name: 'doctor-messages',
    component: () => import('@/views/Doctor/Messages.vue'),
    meta: { 
      title: 'Messages', 
      requiresAuth: true,
      requiredRole: 'doctor'
    }
  }
];

export default doctorRoutes;
