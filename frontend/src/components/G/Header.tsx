import React from 'react';
import { LogOut, Bell, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0 shadow-sm relative z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <span className="text-xs font-bold">FH</span>
          </div>
          <h2 className="text-sm font-semibold text-gray-800 hidden md:block">{title}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 border-r border-gray-100 pr-3 mr-1">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Bell size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Settings size={18} />
          </button>
        </div>

        {user && (
          <div className="flex items-center gap-3 pl-2">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-medium text-gray-900">{user.nom} {user.prenom}</span>
              <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">{user.role}</span>
            </div>
            <div className="w-9 h-9 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 overflow-hidden">
              <span className="text-sm font-bold">{user.nom?.charAt(0)}{user.prenom?.charAt(0)}</span>
            </div>
          </div>
        )}

        <button 
          onClick={handleLogout}
          className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group relative"
          title="Déconnexion"
        >
          <LogOut size={18} />
          <span className="absolute top-full right-0 mt-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Déconnexion
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
