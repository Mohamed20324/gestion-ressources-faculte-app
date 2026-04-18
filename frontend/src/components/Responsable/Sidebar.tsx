import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Home, Users,
  FileText, LayoutDashboard, PenTool,
  UserPlus, Plus, Sparkles, MoreHorizontal, Settings, HelpCircle, LogOut,
  Crown, GraduationCap, Wrench, Package, Video, CalendarCheck
} from 'lucide-react';

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
          { icon: <Sparkles size={16} />, text: "Nouveau besoin", path: "/responsable/needs/new" },
          { icon: <LayoutDashboard size={16} />, text: "Signalements", path: "/responsable/reports" }
        ]
      }
    ]
  },
  ressources: {
    title: "Ressources",
    defaultPath: "/responsable/resources",
    sections: [
      {
        type: "header",
        title: "Inventaire & Stocks"
      },
      {
        type: "nav",
        items: [
          { icon: <Package size={16} />, text: "Gestion des ressources", path: "/responsable/resources" },
          { icon: <FileText size={16} />, text: "Marchés & Appels d'offres", path: "/responsable/tenders" }
        ]
      }
    ]
  },
  reunions: {
    title: "Réunions",
    defaultPath: "/responsable/meetings",
    sections: [
      {
        type: "header",
        title: "Suivi des séances"
      },
      {
        type: "nav",
        items: [
          { icon: <Video size={16} />, text: "Liste des réunions", path: "/responsable/meetings" },
          { icon: <CalendarCheck size={16} />, text: "Planning & Calendrier", path: "/responsable/meetings/calendar" }
        ]
      },
      {
        type: "header",
        title: "Administration"
      },
      {
        type: "nav",
        items: [
          { icon: <Plus size={16} />, text: "Programmer une réunion", path: "/responsable/meetings/new" },
          { icon: <FileText size={16} />, text: "Comptes-rendus & Archives", path: "/responsable/meetings/archives" }
        ]
      }
    ]
  },
  equipes: {
    title: "Équipes",
    defaultPath: "/responsable/teams/design",
    sections: [
      {
        type: "header",
        title: "Mes équipes"
      },
      {
        type: "teamSpace",
        name: "Équipe Design",
        color: "bg-purple-500",
        defaultPath: "/responsable/teams/design",
        items: [
          { icon: <Users size={14} />, text: "Membres (8)", suffix: "3 actifs", path: "/responsable/teams/design/members" },
          { icon: <FileText size={14} />, text: "Projets", suffix: "4", path: "/responsable/teams/design/projects" }
        ]
      },
      {
        type: "teamSpace",
        name: "Équipe Dev",
        color: "bg-blue-500",
        defaultPath: "/responsable/teams/dev",
        items: [
          { icon: <Users size={14} />, text: "Membres (12)", suffix: "5 actifs", path: "/responsable/teams/dev/members" },
          { icon: <FileText size={14} />, text: "Projets", suffix: "6", path: "/responsable/teams/dev/projects" }
        ]
      },
      {
        type: "header",
        title: "Invitations"
      },
      {
        type: "nav",
        items: [
          { icon: <UserPlus size={16} />, text: "En attente", suffix: "2", path: "/responsable/invitations/pending" }
        ]
      }
    ]
  },
  plus: {
    title: "Plus",
    defaultPath: "/responsable/apps/docs",
    sections: [
      {
        type: "header",
        title: "Applications"
      },
      {
        type: "nav",
        items: [
          { icon: <FileText size={16} />, text: "Docs", suffix: "Nouveau", path: "/responsable/apps/docs" },
          { icon: <LayoutDashboard size={16} />, text: "Tableaux de bord", path: "/responsable/apps/dashboards" },
          { icon: <PenTool size={16} />, text: "Whiteboards", path: "/responsable/apps/whiteboards" }
        ]
      },
      {
        type: "header",
        title: "Paramètres"
      },
      {
        type: "nav",
        items: [
          { icon: <Settings size={16} />, text: "Gestion utilisateurs", path: "/responsable/settings/users" },
          { icon: <Sparkles size={16} />, text: "Préférences", path: "/responsable/settings/preferences" },
          { icon: <HelpCircle size={16} />, text: "Aide", path: "/responsable/help" },
          { icon: <LogOut size={16} />, text: "Déconnexion", path: "/logout" }
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
const NavItem = ({ icon, text, suffix, path, onClick, isActive }: {
  icon: React.ReactNode,
  text: string,
  suffix?: string,
  path: string,
  onClick?: () => void,
  isActive?: boolean
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleClick = () => {
    if (path === '/logout') {
      logout();
      navigate('/');
      return;
    }
    navigate(path);
    if (onClick) onClick();
  };

  return (
    <div
      className={`flex items-center justify-between px-2 py-1.5 my-1 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-800'
        }`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm">{text}</span>
      </div>
      {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
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
    meetings: 4,
    pendingInvites: 2
  };
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('Gestion');
  const [isSecondaryMenuVisible, setIsSecondaryMenuVisible] = useState(true);

  const badges = getDynamicBadges();
  const currentMenu = secondaryMenus[activeMenu as keyof typeof secondaryMenus];

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

          <div className="flex-1 pb-1">
            {/* Ressources avec badge dynamique */}
            <div className="mb-2">
              <SidebarIconCollapsed
                icon={<Package size={20} />}
                label="Ressources"
                isActive={activeMenu === 'ressources'}
                onClick={() => handleMenuClick('ressources')}
              />
            </div>

            <div className="flex-1 pb-1">
              {/* Réunions */}
              <SidebarIconCollapsed
                icon={<Video size={20} />}
                label="Réunions"
                isActive={activeMenu === 'reunions'}
                onClick={() => handleMenuClick('reunions')}
                badge={badges.meetings}
              />
            </div>

            <div className="flex-1 pt-1">
              {/* Équipes avec badge pour invitations */}
              <SidebarIconCollapsed
                icon={<Users size={20} />}
                label="Équipes"
                isActive={activeMenu === 'equipes'}
                onClick={() => handleMenuClick('equipes')}
                badge={badges.pendingInvites > 0 ? badges.pendingInvites : undefined}
              />
            </div>
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
            {/* Bouton Inviter */}
            <div className="group relative">
              <button
                className="flex items-center justify-center w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                onClick={() => navigate('/responsable/invite')}
              >
                <UserPlus size={18} />
              </button>
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none shadow-lg">
                Inviter
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