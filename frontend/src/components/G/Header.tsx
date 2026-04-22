import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Bell, Settings, Calendar, Clock, CheckCircle, XCircle, Package, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fetchAllNotifications = async () => {
    if (!user) return;

    try {
      // 1. Fetch general notifications from backend (acceptance/rejection)
      const notifRes = await api.getNotifications(user.id);
      let backendNotifs: any[] = [];
      if (notifRes.ok) {
        backendNotifs = await notifRes.json();
      }

      // 2. For FOURNISSEUR: add local notifications for NEW AOs only
      // (acceptance/rejection notifications are already handled by the backend)
      let frontendNotifs: any[] = [];
      if (user.role === 'FOURNISSEUR') {
        const aoRes = await api.getAllAppelsOffresOuverts();

        // New AOs added within the last 3 days
        if (aoRes.ok) {
          const aos = await aoRes.json();
          const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
          const newAos = aos.filter((ao: any) => {
            const d = Array.isArray(ao.dateDebut)
              ? new Date(ao.dateDebut[0], ao.dateDebut[1] - 1, ao.dateDebut[2])
              : new Date(ao.dateDebut);
            return d >= threeDaysAgo;
          });
          newAos.forEach((ao: any) => {
            frontendNotifs.push({
              id: `ao-${ao.id}`,
              type: 'NOUVEL_AO',
              message: `Nouvel appel d'offre disponible : ${ao.reference}`,
              lu: false,
              dateEnvoi: ao.dateDebut,
              link: '/fournisseur/appels-offres'
            });
          });
        }
      }

      // Merge: backend notifications first, then frontend-generated ones
      // Deduplicate: if backend already has an equivalent, skip the local one
      const backendIds = new Set(backendNotifs.map((n: any) => n.id));
      const deduped = frontendNotifs.filter(n => !backendIds.has(n.id));
      setNotifications([...backendNotifs, ...deduped]);

      // 3. Fetch meetings (for specific roles)
      if (user.role === 'ENSEIGNANT' || user.role === 'CHEF_DEPARTEMENT' || user.role === 'RESPONSABLE') {
        let allReunions: any[] = [];
        
        if (user.role === 'RESPONSABLE') {
          const res = await api.getAllReunions();
          if (res.ok) allReunions = await res.json();
        } else {
          const userRes = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${user.accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            if (userData.departementId) {
              const reunionsRes = await api.getReunionsByDepartement(userData.departementId);
              if (reunionsRes.ok) allReunions = await reunionsRes.json();
            }
          }
        }

        if (allReunions.length > 0) {
          const now = new Date();
          const twoDaysFromNow = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));

          const upcoming = allReunions
            .filter((r: any) => r.statut === 'PLANIFIEE')
            .map((r: any) => ({
              ...r,
              dateTime: new Date(`${r.date}T${r.heure.length === 5 ? r.heure + ':00' : r.heure}`)
            }))
            .filter((r: any) => r.dateTime > now && r.dateTime <= twoDaysFromNow)
            .sort((a: any, b: any) => a.dateTime.getTime() - b.dateTime.getTime());
          setMeetings(upcoming);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
    const interval = setInterval(fetchAllNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    if (meetings.length === 0) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = meetings[0].dateTime.getTime() - now;

      if (distance < 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [meetings]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalCount = notifications.filter(n => !n.lu).length + meetings.length;

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
        <div className="hidden sm:flex items-center gap-2 border-r border-gray-100 pr-3 mr-1 relative" ref={dropdownRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`p-2 rounded-lg transition-all relative flex items-center gap-2 ${isNotificationsOpen ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
          >
            {timeLeft && meetings.length > 0 && (
              <span className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100 text-[10px] font-mono font-black animate-in fade-in slide-in-from-right-2">
                <Clock size={12} className="animate-pulse" />
                {timeLeft.days > 0 ? `${timeLeft.days}j ` : ''}
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            )}
            <div className="relative">
              <Bell size={18} />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {totalCount}
                </span>
              )}
            </div>
          </button>

          {isNotificationsOpen && (
            <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">

              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                  {totalCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {totalCount}
                    </span>
                  )}
                </div>
                {notifications.some(n => !n.lu) && (
                  <button
                    onClick={() => notifications.filter(n => !n.lu && typeof n.id === 'number').forEach(n => handleMarkAsRead(n.id))}
                    className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    Tout marquer lu
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="max-h-[380px] overflow-y-auto">
                {(meetings.length === 0 && notifications.length === 0) ? (
                  <div className="py-14 flex flex-col items-center gap-2 text-gray-400">
                    <Bell size={28} className="text-gray-200" />
                    <p className="text-sm font-medium">Aucune notification</p>
                    <p className="text-xs text-gray-300">Tout est à jour</p>
                  </div>
                ) : (
                  <div className="py-2">

                    {/* Upcoming meeting countdown */}
                    {timeLeft && meetings.length > 0 && (
                      <div className="mx-3 mb-1 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                              <Calendar size={14} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-indigo-800">Prochaine réunion</p>
                              <p className="text-[10px] text-indigo-500 truncate max-w-[160px]">Session #{meetings[0].id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-indigo-600 font-mono text-xs font-bold bg-white border border-indigo-100 px-2 py-1 rounded-lg">
                            <Clock size={11} className="animate-pulse" />
                            {timeLeft.days > 0 ? `${timeLeft.days}j ` : ''}
                            {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Meeting list items */}
                    {meetings.map((m) => (
                      <div 
                        key={`meet-${m.id}`} 
                        onClick={() => {
                          const baseUrl = 
                            user?.role === 'RESPONSABLE' ? '/responsable' :
                            user?.role === 'CHEF_DEPARTEMENT' ? '/chef-departement' : '/enseignant';
                          navigate(`${baseUrl}/meetings`);
                          setIsNotificationsOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50/50 cursor-pointer transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Calendar size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800">Réunion de département</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{new Date(m.date).toLocaleDateString('fr-FR')} · {m.heure}</p>
                        </div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full shrink-0 group-hover:scale-125 transition-transform" />
                      </div>
                    ))}

                    {/* Divider between meetings and notifs */}
                    {meetings.length > 0 && notifications.length > 0 && (
                      <hr className="mx-4 my-1 border-gray-100" />
                    )}

                    {/* General & Fournisseur notifications */}
                    {notifications.map((n) => {
                      const isUnread = !n.lu;
                      const iconBg =
                        n.type === 'ACCEPTATION' ? 'bg-green-50 border-green-100 text-green-600' :
                          n.type === 'REJET' || n.type === 'ELIMINATION' ? 'bg-red-50 border-red-100 text-red-500' :
                            n.type === 'NOUVEL_AO' ? 'bg-purple-50 border-purple-100 text-purple-600' :
                              'bg-blue-50 border-blue-100 text-blue-600';
                      const icon =
                        n.type === 'ACCEPTATION' ? <CheckCircle size={14} /> :
                          n.type === 'REJET' || n.type === 'ELIMINATION' ? <XCircle size={14} /> :
                            n.type === 'NOUVEL_AO' ? <Package size={14} /> :
                              <Info size={14} />;
                      const dateStr = n.dateEnvoi
                        ? Array.isArray(n.dateEnvoi)
                          ? `${String(n.dateEnvoi[2]).padStart(2, '0')}/${String(n.dateEnvoi[1]).padStart(2, '0')}/${n.dateEnvoi[0]}`
                          : new Date(n.dateEnvoi).toLocaleDateString('fr-FR')
                        : '';

                      return (
                        <div
                          key={`notif-${n.id}`}
                          onClick={() => {
                            if (typeof n.id === 'number') handleMarkAsRead(n.id);
                            const link = n.link || (user?.role === 'FOURNISSEUR' ? '/fournisseur/mes-soumissions' : undefined);
                            if (link) { navigate(link); setIsNotificationsOpen(false); }
                          }}
                          className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${isUnread ? 'bg-purple-50/60 hover:bg-purple-50' : 'hover:bg-gray-50'
                            }`}
                        >
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-snug ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                              {n.message}
                            </p>
                            {dateStr && <p className="text-[10px] text-gray-400 mt-0.5">{dateStr}</p>}
                          </div>
                          {isUnread && <div className="w-2 h-2 bg-purple-500 rounded-full shrink-0 mt-1.5" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="w-full text-center text-[11px] font-semibold text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

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
