# PGSM Frontend

Vue.js 3 frontend application for the PGSM Internship Management Platform.

## Features

- ✅ User authentication (Login, Register, Password Reset)
- ✅ Role-based access control (Admin, Hospital, Doctor, Student)
- ✅ Dashboard for each user role
- ✅ Responsive layout with sidebar navigation
- ✅ Pinia state management
- ✅ Vue Router with route guards
- ✅ API integration with axios

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/       # Reusable Vue components
│   ├── common/      # Base components (Button, Input, etc.)
│   └── layout/     # Layout components (Navbar, Sidebar, Footer)
├── views/          # Page components
│   ├── Public/     # Public pages (Login, Register)
│   ├── Student/    # Student pages
│   ├── Hospital/   # Hospital pages
│   ├── Doctor/     # Doctor pages
│   └── Admin/      # Admin pages
├── router/         # Vue Router configuration
├── store/          # Pinia stores
├── services/       # API services
└── utils/          # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## User Roles

- **Student**: Browse internships, apply, track applications, manage logbook
- **Hospital**: Post internships, manage applications, view students
- **Doctor**: Validate logbooks, track attendance, evaluate students
- **Admin**: Manage users, hospitals, view statistics and reports

## Notes

- The frontend expects a backend API running on `http://localhost:3000/api`
- Authentication uses JWT tokens stored in localStorage
- Routes are protected based on user roles
- The application uses Tailwind CSS for styling
