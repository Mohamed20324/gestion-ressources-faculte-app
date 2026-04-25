import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import {
  Home, Users,
  FileText, LayoutDashboard,
  Plus, Sparkles, MoreHorizontal,
  Crown, GraduationCap, Wrench, Package, Video, CalendarCheck,
  Moon, Sun, ClipboardList, Truck, ShieldAlert, User, Bell
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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
  badge?: Badge;
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

interface TeamSection {
  type: 'teamSpace';
  name: string;
  color: string;
  defaultPath: string;
  items: NavItemType[];
}

type MenuSection = NavSection | HeaderSection | TeamSection;

interface MenuType {
  title: string;
  defaultPath: string;
  sections: MenuSection[];
}

// Configuration des menus secondaires avec chemins de navigation
const secondaryMenus: Record<string, MenuType> = {
  Gestion: {
    title: "Gestion",
    defaultPath: "/responsable/dashboard",
    sections: [
      {
        type: "nav",
        items: [
          { icon: <LayoutDashboard size={16} />, text: "Tableau de bord", path: "/responsable/dashboard" },
          { icon: <Users size={16} />, text: "Départements", path: "/responsable/departments" },
          { icon: <Crown size={16} />, text: "Chef de département", path: "/responsable/department-heads" },
          { icon: <GraduationCap size={16} />, text: "Enseignants", path: "/responsable/teachers" },
          { icon: <Wrench size={16} />, text: "Technicien", path: "/responsable/technicians" }
        ]
      },
      {
        type: "header",
        title: "Activités"
      },
      {
        type: "nav",
        items: [
          { icon: <LayoutDashboard size={16} />, text: "Signalements", path: "/responsable/reports" },
          { icon: <CalendarCheck size={16} />, text: "Calendrier Réunions", path: "/responsable/meetings/calendar" }
        ]
      }
    ]
  },
  Procurement: {
    title: "Appels d'Offres",
    defaultPath: "/responsable/procurement/dashboard",
    sections: [
      {
        type: "header",
        title: "Demandes & AO"
      },
      {
        type: "nav",
        items: [
          { icon: <LayoutDashboard size={16} />, text: "Tableau de Bord AO", path: "/responsable/procurement/dashboard" },
          {icon: <ClipboardList size={16} />, text: "Besoins Départements", path: "/responsable/needs" },
          { icon: <FileText size={16} />, text: "Marchés & Appels d'offres", path: "/responsable/appels-offres" }
        ]
      }
    ]
  },
  Inventaire: {
    title: "Gestion Inventaire",
    defaultPath: "/responsable/inventory/dashboard",
    sections: [
      {
        type: "header",
        title: "Parc & Livraisons"
      },
      {
        type: "nav",
        items: [
          { icon: <LayoutDashboard size={16} />, text: "Tableau de Bord Parc", path: "/responsable/inventory/dashboard" },
          { icon: <Package size={16} />, text: "Inventaire Global", path: "/responsable/resources" },
          { icon: <Wrench size={16} />, text: "Maintenance", path: "/responsable/maintenance" },
          { icon: <Truck size={16} />, text: "Réception & Livraison", path: "/responsable/reception" }
        ]
      }
    ]
  },

  Partenaires: {
    title: "Fournisseurs",
    defaultPath: "/responsable/partners/dashboard",
    sections: [
      {
        type: "header",
        title: "Gestion Partenaires"
      },
      {
        type: "nav",
        items: [
          { icon: <LayoutDashboard size={16} />, text: "Tableau de Bord Partenaires", path: "/responsable/partners/dashboard" },
          { icon: <Users size={16} />, text: "Liste Fournisseurs", path: "/responsable/suppliers" },
          { icon: <ShieldAlert size={16} />, text: "Liste Noire", path: "/responsable/blacklist" }
        ]
      }
    ]
  },
  plus: {
    title: "Plus",
    defaultPath: "/responsable/profile",
    sections: [
      {
        type: "header",
        title: "Profil"
      },
      {
        type: "nav",
        items: [
          { icon: <User size={16} />, text: "Mon Profil", path: "/responsable/profile" },
          { icon: <Bell size={16} />, text: "Notifications", path: "/responsable/notifications" },
          { icon: <FileText size={16} />, text: "Docs", suffix: "Nouveau", path: "/responsable/apps/docs" },
          { icon: "THEME_TOGGLE", text: "Mode Sombre", path: "theme" }
        ]
      }
    ]
  }
};

// Composant pour les icônes de la sidebar principale avec tooltip au survol
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

      {/* Tooltip au survol */}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none shadow-lg">
        {label}
      </div>
    </div>
  );
};

// Composant NavItem pour le menu secondaire avec navigation
const NavItem = ({ icon, text, suffix, path, onClick, isActive, badge }: {
  icon: React.ReactNode,
  text: string,
  suffix?: string,
  path: string,
  onClick?: () => void,
  isActive?: boolean,
  badge?: number | null
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
    <div
      className={`flex items-center justify-between px-2 py-1.5 my-1 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900'
        }`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        {!isThemeToggle && <span className={isActive ? "text-purple-600" : "text-gray-400"}>{icon}</span>}
        <span className="text-sm font-medium">{text}</span>
      </div>

      {badge && (
        <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-red-200 animate-pulse">
          {badge}
        </span>
      )}

      {isThemeToggle ? (
        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'}`}>
          <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      ) : (
        suffix && <span className="text-sm text-gray-400">{suffix}</span>
      )}
    </div>
  );
};

// Fonction pour obtenir le premier chemin d'un menu
const getFirstPathFromMenu = (menuKey: string): string => {
  const menu = secondaryMenus[menuKey as keyof typeof secondaryMenus];
  if (!menu) return "/";

  for (const section of menu.sections) {
    if (section.type === 'nav' && section.items.length > 0) {
      return section.items[0].path;
    }
    if (section.type === 'teamSpace') {
      return section.defaultPath;
    }
  }

  return menu.defaultPath || "/";
};

// Badges dynamiques (simulés, à remplacer par des données réelles)
const getDynamicBadges = () => {
  return {
    ressources: 0,
    tasks: 12,
    pendingInvites: 2
  };
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('Gestion');
  const [isSecondaryMenuVisible, setIsSecondaryMenuVisible] = useState(true);
  const [newNeedsCount, setNewNeedsCount] = useState(0);
  const [lateCount, setLateCount] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);
  const [pendingPannesCount, setPendingPannesCount] = useState(0);
  const [unassignedResourcesCount, setUnassignedResourcesCount] = useState(0);
  const [completedMaintenanceCount, setCompletedMaintenanceCount] = useState(0);
  const [newSubmissionsCount, setNewSubmissionsCount] = useState(0);
  const [plannedMeetingsCount, setPlannedMeetingsCount] = useState(0);

  const { theme, toggleTheme } = useTheme();

  const badges = getDynamicBadges();
  const currentMenu = secondaryMenus[activeMenu as keyof typeof secondaryMenus];

  // Badges dynamiques
  const getBadgeForItem = (path: string) => {
    if (path === '/responsable/needs') return newNeedsCount;
    if (path === '/responsable/reception') return lateCount;
    if (path === '/responsable/maintenance') return completedMaintenanceCount;
    if (path === '/responsable/resources') return unassignedResourcesCount;
    if (path === '/responsable/submissions') return newSubmissionsCount;
    if (path === '/responsable/meetings/calendar') return plannedMeetingsCount;
    return 0;
  };

  const getSectionBadgeSum = (menuKey: string) => {
    const menu = secondaryMenus[menuKey];
    if (!menu) return 0;
    let sum = 0;
    menu.sections.forEach(section => {
      if (section.type === 'nav') {
        section.items.forEach(item => {
          sum += getBadgeForItem(item.path);
        });
      }
    });
    return sum;
  };

  // Synchroniser le menu actif avec l'URL au chargement
  useEffect(() => {
    const currentPath = location.pathname;

    for (const [menuKey, menu] of Object.entries(secondaryMenus)) {
      let found = false;

      for (const section of menu.sections) {
        if (section.type === 'nav') {
          if (section.items.some(item => currentPath.startsWith(item.path))) {
            setActiveMenu(menuKey);
            found = true;
            break;
          }
        } else if (section.type === 'teamSpace') {
          if (section.items.some(item => currentPath.startsWith(item.path)) ||
            (section.defaultPath && currentPath.startsWith(section.defaultPath))) {
            setActiveMenu(menuKey);
            found = true;
            break;
          }
        }
      }

      if (found) break;
    }
  }, [location.pathname]);

  // Fetch new needs for badge (status: ENVOYE)
  useEffect(() => {
    const fetchNewNeedsCount = async () => {
      try {
        const res = await api.getAllBesoins();
        if (res.ok) {
          const data = await res.json();
          const count = data.filter((b: any) => (b.statut === 'ENVOYE' || b.statut === 'VALIDE') && !b.appelOffreId).length;
          setNewNeedsCount(count);
        }
      } catch (error) {
        console.error("Error fetching needs badge:", error);
      }
    };

    fetchNewNeedsCount();

    const fetchPendingDeliveriesCount = async () => {
        try {
          const res = await api.getAllOffres();
          if (res.ok) {
            const data = await res.json();
            // Count offers that are accepted but not yet delivered
            const count = data.filter((o: any) => o.statut === 'ACCEPTEE').length;
            setLateCount(count); 
          }
        } catch (e) { console.error(e); }
      };

    const fetchPendingPannesCount = async () => {
      try {
        const res = await api.getAllSignalements();
        if (res.ok) {
          const data = await res.json();
          // "Non traité" for Responsable = technician sent constat OR no technician yet
          const count = data.filter((s: any) => s.statut === 'CONSTAT' || s.statut === 'SIGNALE').length;
          setPendingPannesCount(count);
        }
      } catch (e) { console.error(e); }
    };

    const fetchInventoryCounts = async () => {
      try {
        const res = await api.getAllRessources();
        if (res.ok) {
          const data = await res.json();
          // 1. Unassigned resources
          setUnassignedResourcesCount(data.filter((r: any) => r.statut === 'DISPONIBLE').length);
        }
      } catch (e) { console.error(e); }
    };

    const fetchMaintenanceCounts = async () => {
      try {
        const res = await api.getAllSignalements();
        if (res.ok) {
          const data = await res.json();
          // 2. Completed maintenance (RESOLU)
          setCompletedMaintenanceCount(data.filter((s: any) => s.statut === 'RESOLU').length);
        }
      } catch (e) { console.error(e); }
    };

    const fetchSubmissionsCount = async () => {
      try {
        const res = await api.getAllOffres();
        if (res.ok) {
          const data = await res.json();
          // New submissions are in status SOUMISE
          setNewSubmissionsCount(data.filter((o: any) => o.statut === 'SOUMISE').length);
        }
      } catch (e) { console.error(e); }
    };

    const fetchPlannedMeetingsCount = async () => {
      try {
        const res = await api.getAllReunions();
        if (res.ok) {
          const data = await res.json();
          setPlannedMeetingsCount(data.filter((m: any) => m.statut === 'PLANIFIEE').length);
        }
      } catch (e) { console.error(e); }
    };

    fetchNewNeedsCount();
    fetchPendingDeliveriesCount();
    fetchInventoryCounts();
    fetchMaintenanceCounts();
    fetchSubmissionsCount();
    fetchPlannedMeetingsCount();

    const interval = setInterval(() => {
      fetchNewNeedsCount();
      fetchPendingDeliveriesCount();
      fetchInventoryCounts();
      fetchMaintenanceCounts();
      fetchSubmissionsCount();
      fetchPlannedMeetingsCount();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);



  const handleMenuClick = (menu: string) => {
    if (activeMenu === menu) {
      setIsSecondaryMenuVisible(!isSecondaryMenuVisible);
    } else {
      const firstPath = getFirstPathFromMenu(menu);
      setActiveMenu(menu);
      setIsSecondaryMenuVisible(true);
      navigate(firstPath);
    }
  };

  // Vérifier si un chemin est actif
  const isPathActive = (path: string) => {
    const currentPath = location.pathname;
    if (currentPath === path) return true;

    // Si le chemin est un préfixe (ex: /meetings est préfixe de /meetings/calendar)
    if (currentPath.startsWith(path + '/')) {
      // On vérifie si un autre item dans le menu actuel est un match plus précis
      const menu = secondaryMenus[activeMenu as keyof typeof secondaryMenus];
      if (menu) {
        for (const section of menu.sections) {
          const sectionItems = section.type === 'nav' ? section.items : (section.type === 'teamSpace' ? section.items : []);
          const hasMoreSpecificMatch = sectionItems.some(item =>
            item.path !== path &&
            item.path.startsWith(path) &&
            (currentPath === item.path || currentPath.startsWith(item.path + '/'))
          );
          if (hasMoreSpecificMatch) return false;
        }
      }
      return true;
    }
    return false;
  };

  const renderSecondaryMenu = () => {
    if (!currentMenu || !isSecondaryMenuVisible) return null;

    return (
      <div className="w-64 flex-shrink-0 h-full bg-gradient-to-tr from-pink-50 to-blue-100 flex flex-col border border-gray-200 ml-2 mr-0 rounded-r-xl shadow-lg">
        {/* LARGEUR FIXE - ne change jamais */}
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

            if (section.type === 'nav') {
              return section.items.map((item, itemIdx) => (
                <NavItem
                  key={itemIdx}
                  icon={item.icon}
                  text={item.text}
                  suffix={item.suffix}
                  path={item.path}
                  isActive={isPathActive(item.path)}
                  badge={getBadgeForItem(item.path) || undefined}
                />
              ));
            }

            if (section.type === 'teamSpace') {
              return (
                <div key={idx} className="mt-2">
                  <div
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-gray-800 font-medium hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      navigate(section.defaultPath || "/teams");
                      setIsSecondaryMenuVisible(true);
                    }}
                  >
                    <div className={`w-6 h-6 ${section.color} rounded text-white flex items-center justify-center text-xs font-bold`}>
                      {section.name.charAt(0)}
                    </div>
                    <span className="text-sm">{section.name}</span>
                  </div>
                  <div className="ml-6 pl-3 border-l border-gray-200 space-y-1 mt-1">
                    {section.items.map((item, itemIdx) => (
                      <NavItem
                        key={itemIdx}
                        icon={item.icon}
                        text={item.text}
                        suffix={item.suffix}
                        path={item.path}
                        isActive={isPathActive(item.path)}
                      />
                    ))}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full bg-gray-50 p-2 rounded-2xl">
      {/* Sidebar Principale - Largeur fixe 48px */}
      <div className="w-12 flex-shrink-0 bg-black flex flex-col relative rounded-xl shadow-xl">

        <div className="flex-1 pt-2 pb-1">

          {/* Home / Gestion */}
          <div className="mb-2">
            <SidebarIconCollapsed
              icon={<Home size={20} />}
              label="Gestion"
              isActive={activeMenu === 'Gestion'}
              onClick={() => handleMenuClick('Gestion')}
            />
          </div>

          {/* Appels d'Offres */}
          <div className="mb-2">
            <SidebarIconCollapsed
              icon={<ClipboardList size={20} />}
              label="Appels d'Offres"
              isActive={activeMenu === 'Procurement'}
              onClick={() => handleMenuClick('Procurement')}
              badge={getSectionBadgeSum('Procurement') || undefined}
            />
          </div>

          {/* Inventaire */}
          <div className="mb-2">
            <SidebarIconCollapsed
              icon={<Package size={20} />}
              label="Inventaire"
              isActive={activeMenu === 'Inventaire'}
              onClick={() => handleMenuClick('Inventaire')}
              badge={getSectionBadgeSum('Inventaire') || undefined}
            />
          </div>



          {/* Fournisseurs */}
          <div className="mb-2">
            <SidebarIconCollapsed
              icon={<Users size={20} />}
              label="Fournisseurs"
              isActive={activeMenu === 'Partenaires'}
              onClick={() => handleMenuClick('Partenaires')}
            />
          </div>



          {/* Divider */}
          <div className="h-px bg-gray-700 my-3 mx-3"></div>

          {/* Bouton Plus */}
          <SidebarIconCollapsed
            icon={<MoreHorizontal size={20} />}
            label="Plus"
            isActive={activeMenu === 'plus'}
            onClick={() => handleMenuClick('plus')}
          />
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 p-2">
          <div className="space-y-2">
            {/* Bouton Mode Sombre/Clair */}
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

            {/* Bouton Mettre à niveau */}
            <div className="group relative">
              <button
                className="flex items-center justify-center w-full py-2 bg-transparent border border-gray-700 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                onClick={() => navigate('/responsable/upgrade')}
              >
                <Sparkles size={18} />
              </button>
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none shadow-lg">
                Mettre à niveau
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Secondaire - Largeur fixe 256px (w-64) */}
      {renderSecondaryMenu()}
    </div>
  );
};

export default Sidebar;