import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CreditCard, Globe, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/', label: 'Projects', icon: LayoutDashboard },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/domains', label: 'Domains', icon: Globe },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[92px]">
          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <img src="/logo.png" alt="FreelanceFlow" className="h-[60px] w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
            >
              {user?.profilePic ? (
                <img src={`http://localhost:5000${user.profilePic}`} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-300 font-medium">{user?.displayName || user?.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 px-3 py-2 rounded-xl hover:bg-red-500/5 transition-all duration-200"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 px-4 py-4 space-y-1 animate-fade-in">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(link.to)
                  ? 'bg-primary-500/10 text-primary-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <link.icon size={16} />
              {link.label}
            </Link>
          ))}
          <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5"
            >
              {user?.profilePic ? (
                <img src={`http://localhost:5000${user.profilePic}`} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-300">{user?.displayName || user?.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 px-3 py-2 rounded-xl hover:bg-red-500/5 transition-all"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
