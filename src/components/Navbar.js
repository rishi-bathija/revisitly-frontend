import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { Bookmark, Plus, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, setUser } = useAuth();
  console.log('user', user);


  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      localStorage.removeItem('user');
      setUser(null);

      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Bookmark className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Revisitly</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/add-bookmark"
                  className="flex items-center space-x-2 btn-primary"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Bookmark</span>
                </Link>

                <div className="relative group flex items-center cursor-pointer">
                  <div
                    tabIndex={0}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    {user.profile ? (
                      <img
                        src={user.profile}
                        alt="Profile"
                        className="h-8 w-8 rounded-full border border-gray-300"
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = `https://api.dicebear.com/5.x/initials/svg?seed=${user.name}`;
                        }}
                      />
                    ) : (
                      <User className="h-8 w-8 text-primary-600" />
                    )}
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    <svg
                      className="ml-1 h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div
                    className="absolute right-0 mt-2 w-40 top-[30%] translate-y-[20%] bg-white rounded-md shadow-lg border border-gray-100 z-20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity"
                  >
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-t-md transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-b-md transition-colors"
                    >
                      <span className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </span>
                    </button>
                  </div>
                </div>

                {/* <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <span>Dashboard</span>
                </Link> */}

                {/* {user.profile && (
                  <img
                    src={user.profile || 'N/A'}
                    alt="Profile"
                    className="h-8 w-8 rounded-full"
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = `https://api.dicebear.com/5.x/initials/svg?seed=${user.name}`
                    }}
                  />
                )}
                {user.name && (
                  <span className="text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                )} */}

                {/* <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button> */}
              </>
            ) : (
              <Link to="/login" className="btn-primary">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 