# Revisitly Frontend

A modern, responsive React application for the Revisitly bookmark reminder SaaS platform.

## Features

- 🎨 **Modern UI/UX** - Beautiful, responsive design with Tailwind CSS
- 🔐 **Authentication** - Firebase Auth with Google OAuth and email/password
- 📚 **Bookmark Management** - Add, view, and organize bookmarks
- ⏰ **Smart Reminders** - Set custom reminder schedules for bookmarks
- 🏷️ **Tagging System** - Organize bookmarks with custom tags
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ⚡ **Fast & Lightweight** - Optimized for performance

## Tech Stack

- **React 19** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase Auth** - Authentication service
- **Lucide React** - Beautiful icons
- **Headless UI** - Accessible UI components

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd revisitly-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:3001
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # React components
│   ├── AddBookmark.js   # Add new bookmarks
│   ├── Dashboard.js     # Main dashboard
│   ├── Home.js          # Landing page
│   ├── LoadingSpinner.js # Loading component
│   ├── Login.js         # Authentication
│   └── Navbar.js        # Navigation
├── context/             # React context
│   └── AuthContext.js   # Authentication state
├── utils/               # Utility functions
│   ├── api.js           # API calls
│   └── firebase.js      # Firebase configuration
├── App.js               # Main app component
└── index.js             # Entry point
```

## Key Components

### Home
- Attractive landing page with feature highlights
- Call-to-action buttons for sign up/login
- Responsive design for all devices

### Login
- Email/password authentication
- Google OAuth integration
- Form validation and error handling
- Toggle between login and signup

### Dashboard
- Display all user bookmarks
- Search and filter functionality
- Delete bookmarks
- Responsive grid layout

### AddBookmark
- Form to add new bookmarks
- URL validation
- Custom tags support
- Reminder scheduling
- Quick reminder presets

## API Integration

The frontend communicates with the backend through RESTful APIs:

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/social-login` - Social authentication
- `GET /api/bookmarks/get` - Fetch user bookmarks
- `POST /api/bookmarks/add` - Add new bookmark
- `POST /api/bookmarks/delete/:id` - Delete bookmark

## Styling

The app uses Tailwind CSS for styling with custom components:

- `.btn-primary` - Primary action buttons
- `.btn-secondary` - Secondary action buttons
- `.card` - Card containers
- `.input-field` - Form input fields

## Authentication Flow

1. **Email/Password**: Users can register and login with email/password
2. **Google OAuth**: Users can sign in with their Google account
3. **Token Management**: JWT tokens are stored in localStorage
4. **Protected Routes**: Authentication is required for dashboard and bookmark management

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
Update the `.env` file with your production backend URL:
```env
REACT_APP_API_URL=https://your-backend-url.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@revisitly.com or create an issue in the repository.
