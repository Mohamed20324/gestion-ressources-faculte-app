import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, FileText, Users,
  Settings, Package, Wrench, Home,
  MoreHorizontal, Moon, Sun, Sparkles, User
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  role: string;
}

const SidebarIconCollapsed = ({ icon, label, isActive, onClick, badge }: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: string | number;
}) => {
  return (
    <div className="group relative">
      <div
        className={`flex items-center justify-center p-2 mx-2 rounded-lg cursor-pointer transition-all duration-200 ${isActive
          ? 'bg-gray-200 text-black'
          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
        onClick={onClick}
      >
        <div className="w-5 h-5 flex items-center justify-center">
          {icon}
        </div>
        {badge && (
          <div className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white px-1">
            {badge}
          </div>
        )}
      </div>
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none shadow-lg">
        {label}
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const [activeMenu, setActiveMenu] = useState('General');
  const [isSecondaryMenuVisible, setIsSecondaryMenuVisible] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const getBaseUrl = () => {
    switch (role) {
      case 'Enseignant': return '/enseignant';
      case 'ChefDepartement': return '/chef-departement';
      case 'Technicien': return '/technicien';
      case 'Fournisseur': return '/fournisseur';
      case 'Responsable': return '/responsable';
      default: return '/dashboard';
    }
  };

  const baseUrl = getBaseUrl();

  const getLinks = () => {
    if (role === 'Fournisseur') {
      return [
        { to: `${baseUrl}/dashboard`, icon: LayoutDashboard, label: 'Tableau de bord' },
        { to: `${baseUrl}/appels-offres`, icon: FileText, label: 'Appels d\'offres' },
        { to: `${baseUrl}/mes-soumissions`, icon: Package, label: 'Mes Soumissions' },
      ];
    }

    if (role === 'Technicien') {
      return [
        { to: `${baseUrl}/dashboard`, icon: LayoutDashboard, label: 'Tableau de bord' },
        { to: `${baseUrl}/interventions`, icon: Wrench, label: 'Interventions' },
      ];
    }

    const baseLinks = [
      { to: `${baseUrl}/dashboard`, icon: LayoutDashboard, label: 'Tableau de bord' },
      { to: `${baseUrl}/besoins`, icon: FileText, label: 'Mes Besoins' },
    ];

    if (role === 'ChefDepartement' || role === 'Enseignant') {
      baseLinks.splice(2, 0, { to: `${baseUrl}/affectations`, icon: Package, label: 'Mes Affectations' });
      if (role === 'ChefDepartement') {
        baseLinks.splice(1, 0, { to: `${baseUrl}/enseignants`, icon: Users, label: 'Enseignants' });
        baseLinks.splice(2, 0, { to: `${baseUrl}/types-ressources`, icon: Settings, label: 'Types Ressources' });
      }
      baseLinks.splice(role === 'ChefDepartement' ? 5 : 2, 0, { to: `${baseUrl}/meetings`, icon: Calendar, label: 'Réunions' });
    }

    return baseLinks;
  };

  const links = getLinks();

  const handleMenuClick = (menu: string) => {
    if (activeMenu === menu) {
      setIsSecondaryMenuVisible(!isSecondaryMenuVisible);
    } else {
      setActiveMenu(menu);
      setIsSecondaryMenuVisible(true);
    }
  };

  return (
    <div className="flex h-full bg-gray-50 p-2 rounded-2xl hidden md:flex">
      {/* Primary Sidebar (Slim, Dark) */}
      <div className="w-12 flex-shrink-0 bg-black flex flex-col relative rounded-xl shadow-xl">
        <div className="flex-1 pt-2 pb-1">
          <div className="mb-2">
            <SidebarIconCollapsed
              icon={<Home size={20} />}
              label="Général"
              isActive={activeMenu === 'General'}
              onClick={() => {
                handleMenuClick('General');
                navigate(`${baseUrl}/dashboard`);
              }}
            />
          </div>
          {/* Add more categories here if needed in the future */}
          <div className="h-px bg-gray-700 my-3 mx-3"></div>
          <SidebarIconCollapsed
            icon={<MoreHorizontal size={20} />}
            label="Plus"
            isActive={activeMenu === 'Plus'}
            onClick={() => {
              handleMenuClick('Plus');
              navigate(`${baseUrl}/profile`);
            }}
          />
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 p-2">
          <div className="space-y-2">
            <div className="group relative">
              <button
                className="flex items-center justify-center w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none shadow-lg">
                {theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}
              </div>
            </div>
            <div className="group relative">
              <button
                className="flex items-center justify-center w-full py-2 bg-transparent border border-gray-700 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                onClick={() => navigate(`${baseUrl}/dashboard`)}
              >
                <Sparkles size={18} />
              </button>
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none shadow-lg">
                Retour
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Sidebar (Wider, Light) */}
      {isSecondaryMenuVisible && (
        <div className="w-64 flex-shrink-0 h-full bg-gradient-to-tr from-pink-50 to-blue-100 flex flex-col border border-gray-200 ml-2 mr-0 rounded-r-xl shadow-lg">
          <div className="py-2 px-6 border-b border-gray-200 bg-white/50 rounded-tr-2xl">
            <h1 className="font-semibold text-lg text-gray-900">
              {role === 'ChefDepartement' ? 'Chef de Départ.' : role}
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {activeMenu === 'General' ? (
              <>
                <div className="mt-4 mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Menu Principal
                </div>
                {links.map((link, idx) => {
                  const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
                  return (
                    <NavLink
                      key={idx}
                      to={link.to}
                      className={`flex items-center gap-2 px-2 py-1.5 my-1 rounded-md cursor-pointer transition-colors ${isActive
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-gray-600 hover:bg-white hover:text-gray-900'
                        }`}
                    >
                      <link.icon size={16} className={isActive ? "text-purple-600" : "text-gray-400"} />
                      <span className="text-sm font-medium">{link.label}</span>
                    </NavLink>
                  );
                })}
              </>
            ) : (
              <>
                <div className="mt-4 mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Paramètres
                </div>
                <NavLink
                  to={`${baseUrl}/profile`}
                  className={({ isActive }) => `flex items-center gap-2 px-2 py-1.5 my-1 rounded-md cursor-pointer transition-colors ${isActive
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  <User size={16} className={location.pathname.endsWith('/profile') ? "text-purple-600" : "text-gray-400"} />
                  <span className="text-sm font-medium">Mon Profil</span>
                </NavLink>
                <div
                  className="flex items-center gap-2 px-2 py-1.5 my-1 rounded-md cursor-pointer transition-colors text-gray-600 hover:bg-white hover:text-gray-900"
                  onClick={toggleTheme}
                >
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-sm font-medium">Mode de l'app</span>
                </div>
              </>
            )}

            <div className="mt-8 p-4 border-t border-gray-200/50">
              <div className="bg-white/60 rounded-xl p-4 border border-white/80 shadow-sm">
                <h4 className="text-xs font-bold text-gray-800 mb-1">Besoin d'aide ?</h4>
                <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">
                  Contactez l'administration pour toute assistance sur la plateforme.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
