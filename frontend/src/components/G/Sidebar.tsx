import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import {
  Home, Users,
  FileText, LayoutDashboard,
  Plus, Sparkles, MoreHorizontal,
  Package, Video, CalendarCheck,
  Moon, Sun, ClipboardList, User, Wrench, Settings, Archive, Bell, AlertTriangle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  role: string;
}

// Types pour les badges
interface Badge {
  count: number;
  color?: string;
}

// Types pour les items de navigation
interface NavItemType {
  icon: React.ReactNode;
  text: string;
  suffix?: string;
  path: string;
  badge?: Badge | number | null;
}

// Types pour les sections de menu
interface NavSection {
  type: 'nav';
  items: NavItemType[];
}

interface HeaderSection {
  type: 'header';
  title: string;
}

type MenuSection = NavSection | HeaderSection;

interface MenuType {
  title: string;
  defaultPath: string;
  sections: MenuSection[];
}

// Composant pour les icônes de la sidebar principale
const SidebarIconCollapsed = ({ icon, label, isActive, onClick, badge }: {
  icon: React.ReactNode,
  label: string,
  isActive: boolean,
  onClick: () => void,
  badge?: string | number
}) => {
  return (
    <div className="group relative">
      <div
        className={`flex items-center justify-center p-2 mx-2 rounded-lg cursor-pointer transition-all duration-200  ${isActive
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

// Composant NavItem pour le menu secondaire
const NavItem = ({ icon, text, suffix, path, onClick, isActive, badge }: {
  icon: React.ReactNode,
  text: string,
  suffix?: string,
  path: string,
  onClick?: () => void,
  isActive?: boolean,
  badge?: Badge | number | null
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleClick = () => {
    if (path === 'theme') {
      toggleTheme();
      return;
    }
    if (path === '/logout') {
      logout();
      navigate('/');
      return;
    }
    navigate(path);
    if (onClick) onClick();
  };

  const isThemeToggle = icon === "THEME_TOGGLE";

  return (
    <Link
      to={path}
      className={`flex items-center justify-between px-2 py-1.5 my-1 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900'
        }`}
    >
      <div className="flex items-center gap-2">
        {!isThemeToggle && <span className={isActive ? "text-purple-600" : "text-gray-400"}>{icon}</span>}
        <span className="text-sm font-medium">{text}</span>
      </div>

      {badge && (
        <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-red-200 animate-pulse">
          {typeof badge === 'object' ? badge.count : badge}
        </span>
      )}

      {isThemeToggle ? (
        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'}`}>
          <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      ) : (
        !badge && suffix && <span className="text-sm text-gray-400">{suffix}</span>
      )}
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeMenu, setActiveMenu] = useState('Gestion');
  const [isSecondaryMenuVisible, setIsSecondaryMenuVisible] = useState(true);
  const [plannedMeetingsCount, setPlannedMeetingsCount] = useState(0);
  const [pendingBesoinsCount, setPendingBesoinsCount] = useState(0);
  const [lateCount, setLateCount] = useState(0);
  const [pendingPannesCount, setPendingPannesCount] = useState(0);
  const [newTeacherNeedsCount, setNewTeacherNeedsCount] = useState(0);
  const [resolvedPannesCount, setResolvedPannesCount] = useState(0);
  const [recentInventoryCount, setRecentInventoryCount] = useState(0);

  const getBaseUrl = () => {
    switch (role) {
      case 'Enseignant': return '/enseignant';
      case 'ChefDepartement': return '/chef-departement';
      case 'Technicien': return '/technicien';
      case 'Fournisseur': return '/fournisseur';
      default: return '';
    }
  };

  const baseUrl = getBaseUrl();

  // Configuration des menus en fonction du rôle
  const getSecondaryMenus = (): Record<string, MenuType> => {
    const menus: Record<string, MenuType> = {};

    // Menu Gestion (Different for each role)
    const gestionItems: NavItemType[] = [
      { icon: <LayoutDashboard size={16} />, text: "Tableau de bord", path: `${baseUrl}/dashboard` },
    ];

    if (role === 'Enseignant') {
      gestionItems.push({ icon: <ClipboardList size={16} />, text: "Mes Besoins", path: `${baseUrl}/besoins` });
      gestionItems.push({ icon: <Package size={16} />, text: "Mes Affectations", path: `${baseUrl}/affectations` });
      gestionItems.push({ icon: <AlertTriangle size={16} />, text: "Mes Pannes", path: `${baseUrl}/signalements` });
      gestionItems.push({ icon: <Video size={16} />, text: "Réunions", path: `${baseUrl}/meetings` });
      gestionItems.push({ icon: <CalendarCheck size={16} />, text: "Calendrier", path: `${baseUrl}/meetings/calendar` });
    }

    if (role === 'ChefDepartement') {
      gestionItems.push({ icon: <Users size={16} />, text: "Enseignants", path: `${baseUrl}/enseignants` });
    }

    if (role === 'Technicien') {
      gestionItems.push({
        icon: <Wrench size={16} />,
        text: "Interventions",
        path: `${baseUrl}/interventions`,
        badge: pendingPannesCount > 0 ? pendingPannesCount : undefined
      });
    }

    if (role === 'Fournisseur') {
      gestionItems.push({ icon: <FileText size={16} />, text: "Appels d'offres", path: `${baseUrl}/appels-offres` });
      gestionItems.push({ icon: <Package size={16} />, text: "Mes Soumissions", path: `${baseUrl}/mes-soumissions` });
      gestionItems.push({ icon: <Wrench size={16} />, text: "Service Après-Vente", path: `${baseUrl}/sav` });
    }

    menus['Gestion'] = {
      title: "Gestion",
      defaultPath: `${baseUrl}/dashboard`,
      sections: [
        { type: "nav", items: gestionItems }
      ]
    };

    // Menu Besoins / Activités / Réunions (CHEF: Separate)
    if (role === 'ChefDepartement') {
      menus['Activités'] = {
        title: "Activités",
        defaultPath: `${baseUrl}/besoins`,
        sections: [
          {
            type: "header",
            title: "Ressources"
          },
          {
            type: "nav",
            items: [
              { icon: <ClipboardList size={16} />, text: "Besoins", path: `${baseUrl}/besoins`, badge: newTeacherNeedsCount > 0 ? newTeacherNeedsCount : undefined },
              { icon: <AlertTriangle size={16} />, text: "Mes Pannes", path: `${baseUrl}/signalements`, badge: resolvedPannesCount > 0 ? resolvedPannesCount : undefined },
              { icon: <Archive size={16} />, text: "Inventaire Global", path: `${baseUrl}/inventory`, badge: recentInventoryCount > 0 ? recentInventoryCount : undefined },
              { icon: <Settings size={16} />, text: "Gestion Types", path: `${baseUrl}/types-ressources` }
            ]
          }
        ]
      };

      // Menu Réunions (EXCLUSIF CHEF)
      menus['reunions'] = {
        title: "Réunions",
        defaultPath: `${baseUrl}/meetings`,
        sections: [
          {
            type: "header",
            title: "Suivi des séances"
          },
          {
            type: "nav",
            items: [
              { icon: <Video size={16} />, text: "Liste des réunions", path: `${baseUrl}/meetings` },
              { icon: <CalendarCheck size={16} />, text: "Planning & Calendrier", path: `${baseUrl}/meetings/calendar` }
            ]
          },
          {
            type: "header",
            title: "Administration"
          },
          {
            type: "nav",
            items: [
              { icon: <Plus size={16} />, text: "Programmer une réunion", path: `${baseUrl}/meetings/new` }
            ]
          }
        ]
      };
    }

    // Menu Plus
    menus['plus'] = {
      title: "Plus",
      defaultPath: `${baseUrl}/profile`,
      sections: [
        { type: "header", title: "Profil" },
        {
          type: "nav",
          items: [
            { icon: <User size={16} />, text: "Mon Profil", path: `${baseUrl}/profile` },
            { icon: <Bell size={16} />, text: "Notifications", path: `${baseUrl}/notifications` },
            { icon: "THEME_TOGGLE", text: "Mode Sombre", path: "theme" }
          ]
        }
      ]
    };

    return menus;
  };

  const secondaryMenus = getSecondaryMenus();
  const currentMenu = secondaryMenus[activeMenu as keyof typeof secondaryMenus];

  // Sync with URL
  useEffect(() => {
    const currentPath = location.pathname;
    for (const [menuKey, menu] of Object.entries(secondaryMenus)) {
      for (const section of menu.sections) {
        if (section.type === 'nav') {
          if (section.items.some(item => currentPath.startsWith(item.path))) {
            setActiveMenu(menuKey);
            return;
          }
        }
      }
    }
  }, [location.pathname, role]);

  // Fetch planned meetings and pending needs for badges
  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) return;
      try {
        const userRes = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
          headers: { 'Authorization': `Bearer ${user.accessToken}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          const deptId = userData.departementId;

          if (deptId) {
            // 1. Fetch Meetings Badge
            const meetingsRes = await api.getReunionsByDepartement(deptId);
            if (meetingsRes.ok) {
              const data = await meetingsRes.json();
              setPlannedMeetingsCount(data.filter((m: any) => m.statut === 'PLANIFIEE').length);
            }

            // 2. Fetch Pending Needs Badge (Chef only)
            if (role === 'ChefDepartement') {
              const besoinsRes = await api.getBesoinsByDepartement(deptId);
              if (besoinsRes.ok) {
                const data = await besoinsRes.json();
                setPendingBesoinsCount(data.filter((b: any) => b.statut === 'EN_ATTENTE').length);
                setNewTeacherNeedsCount(data.filter((b: any) => b.statut === 'EN_ATTENTE' && b.enseignantId).length);
              }

              // 3. Fetch Pannes / Signalements Badge (Chef only)
              const pannesRes = await api.getAllSignalements();
              if (pannesRes.ok) {
                const data = await pannesRes.json();
                // Resolved pannes for the department
                setResolvedPannesCount(data.filter((s: any) => s.statut === 'RESOLU').length);
              }

              // 4. Fetch Inventory Badge (Recent resources)
              const inventoryRes = await api.getAllRessources();
              if (inventoryRes.ok) {
                const data = await inventoryRes.json();
                const today = new Date().toISOString().split('T')[0];
                setRecentInventoryCount(data.filter((r: any) => r.dateReception && r.dateReception.toString().includes(today)).length);
              }
            }
          }

          // 3. Fetch Pending Pannes Badge (Technicien only)
          if (role === 'Technicien') {
            const pannesRes = await api.getAllSignalements();
            if (pannesRes.ok) {
              const data = await pannesRes.json();
              setPendingPannesCount(data.filter((s: any) => s.statut === 'SIGNALE').length);
            }
          }
        }
      } catch (error) {
        console.error("Error badges:", error);
      }
    };
    fetchBadges();

    // Refresh badges every 10 seconds
    const interval = setInterval(fetchBadges, 10000);
    return () => clearInterval(interval);
  }, [user, role]);

  const handleMenuClick = (menu: string) => {
    if (activeMenu === menu) {
      setIsSecondaryMenuVisible(!isSecondaryMenuVisible);
    } else {
      setActiveMenu(menu);
      setIsSecondaryMenuVisible(true);
      navigate(secondaryMenus[menu].defaultPath);
    }
  };

  const isPathActive = (path: string) => {
    const currentPath = location.pathname;
    if (currentPath === path) return true;
    if (path.endsWith('/meetings') && currentPath !== path) return false;

    if (currentPath.startsWith(path + '/')) return true;
    return false;
  };

  return (
    <div className="flex h-full bg-gray-50 p-2 rounded-2xl hidden md:flex">
      {/* Primary Sidebar */}
      <div className="w-12 flex-shrink-0 bg-black flex flex-col relative rounded-xl shadow-xl">
        <div className="flex-1 pt-2 pb-1">
          <SidebarIconCollapsed
            icon={<Home size={20} />}
            label="Gestion"
            isActive={activeMenu === 'Gestion'}
            onClick={() => handleMenuClick('Gestion')}
          />

          {role === 'ChefDepartement' && (
            <>
              <div className="mt-2">
                <SidebarIconCollapsed
                  icon={<ClipboardList size={20} />}
                  label="Activités"
                  isActive={activeMenu === 'Activités'}
                  onClick={() => handleMenuClick('Activités')}
                  badge={(newTeacherNeedsCount + resolvedPannesCount + recentInventoryCount) > 0 ? (newTeacherNeedsCount + resolvedPannesCount + recentInventoryCount) : undefined}
                />
              </div>
              <div className="mt-2">
                <SidebarIconCollapsed
                  icon={<Video size={20} />}
                  label="Réunions"
                  isActive={activeMenu === 'reunions'}
                  onClick={() => handleMenuClick('reunions')}
                  badge={plannedMeetingsCount > 0 ? plannedMeetingsCount : undefined}
                />
              </div>
            </>
          )}

          <div className="h-px bg-gray-700 my-3 mx-3"></div>

          <SidebarIconCollapsed
            icon={<MoreHorizontal size={20} />}
            label="Plus"
            isActive={activeMenu === 'plus'}
            onClick={() => handleMenuClick('plus')}
          />
        </div>

        <div className="border-t border-gray-700 p-2">
          <div className="space-y-2">
            <button
              className="flex items-center justify-center w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="flex items-center justify-center w-full py-2 bg-transparent border border-gray-700 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
              onClick={() => navigate(`${baseUrl}/dashboard`)}
            >
              <Sparkles size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Sidebar */}
      {isSecondaryMenuVisible && currentMenu && (
        <div className="w-64 flex-shrink-0 h-full bg-gradient-to-tr from-pink-50 to-blue-100 flex flex-col border border-gray-200 ml-2 mr-0 rounded-r-xl shadow-lg">
          <div className="py-2 px-6 border-b border-gray-200 bg-white/50 rounded-tr-2xl">
            <h1 className="font-semibold text-lg text-gray-900">{currentMenu.title}</h1>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {currentMenu.sections.map((section, idx) => {
              if (section.type === 'header') {
                return (
                  <div key={idx} className="mt-4 mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </div>
                );
              }
              return section.items.map((item, itemIdx) => (
                <NavItem
                  key={itemIdx}
                  icon={item.icon}
                  text={item.text}
                  path={item.path}
                  badge={item.badge}
                  isActive={isPathActive(item.path)}
                />
              ));
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
