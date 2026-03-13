import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import NotificationBell from '../notifications/NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="flex items-center font-bold text-xl">
              ShiftSync
            </Link>
            <div className="flex space-x-4 items-center">
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Dashboard
              </Link>
              <Link
                to="/schedule"
                className="px-3 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Schedule
              </Link>
              <Link
                to="/availability"
                className="px-3 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Availability
              </Link>
              <Link
                to="/swap-requests"
                className="px-3 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Swap Requests
              </Link>
              <Link
                to="/analytics"
                className="px-3 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Analytics
              </Link>
              {user && (user.role === 'ADMIN' || user.role === 'MANAGER') && (
                <Link
                  to="/audit-log"
                  className="px-3 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Audit Log
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <NotificationBell />
                <span className="text-sm">
                  {user.firstName} {user.lastName} ({user.role})
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-blue-700 rounded-md hover:bg-blue-800 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
