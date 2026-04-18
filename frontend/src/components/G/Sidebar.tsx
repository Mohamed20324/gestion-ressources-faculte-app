import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Calendar, FileText, Users, Settings } from 'lucide-react';

interface SidebarProps {
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const getBaseUrl = () => {
    switch (role) {
      case 'Enseignant': return '/enseignant';
      case 'ChefDepartement': return '/chef-departement';
      case 'Technicien': return '/technicien';
      case 'Fournisseur': return '/fournisseur';
      default: return '/dashboard';
    }
  };

  const baseUrl = getBaseUrl();

  const getLinks = () => {
    const baseLinks = [
      { to: `${baseUrl}/dashboard`, icon: LayoutDashboard, label: 'Tableau de bord' },
      { to: `${baseUrl}/besoins`, icon: FileText, label: 'Mes Besoins' },
    ];

    if (role === 'ChefDepartement' || role === 'Enseignant') {
      if (role === 'ChefDepartement') {
        baseLinks.splice(1, 0, { to: `${baseUrl}/enseignants`, icon: Users, label: 'Enseignants' });
        baseLinks.splice(2, 0, { to: `${baseUrl}/types-ressources`, icon: Settings, label: 'Types Ressources' });
      }
      baseLinks.splice(role === 'ChefDepartement' ? 3 : 1, 0, { to: `${baseUrl}/meetings`, icon: Calendar, label: 'Réunions' });
    }

    return baseLinks;
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-[#f8f9fa] border-r border-gray-200 hidden md:flex flex-col h-full">
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <link.icon size={18} className="shrink-0" />
            <span className="truncate">{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <h4 className="text-xs font-bold text-purple-900 mb-1">Besoin d'aide ?</h4>
          <p className="text-[10px] text-purple-600 mb-2 leading-relaxed">
            Contactez l'administration pour toute assistance.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
