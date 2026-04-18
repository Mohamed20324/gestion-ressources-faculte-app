import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Bell, Settings, Calendar, Clock, ChevronRight } from 'lucide-react';
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
  const [timeLeft, setTimeLeft] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user || (user.role !== 'ENSEIGNANT' && user.role !== 'CHEF_DEPARTEMENT')) return;
      try {
        const userRes = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (!userRes.ok) return;
        const userData = await userRes.json();
        if (!userData.departementId) return;

        const reunionsRes = await api.getReunionsByDepartement(userData.departementId);
        if (reunionsRes.ok) {
          const allReunions = await reunionsRes.json();
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
      } catch (error) {
        console.error("Error fetching meetings for header:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh list every minute
    return () => clearInterval(interval);
  }, [user]);

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

  const upcomingCount = meetings.length;

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
            className={`p-2 rounded-lg transition-all relative ${isNotificationsOpen ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
          >
            <Bell size={18} />
            {upcomingCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {upcomingCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full uppercase">
                  {upcomingCount} Réunion{upcomingCount > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {meetings.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {/* Next Meeting Countdown */}
                    {timeLeft && (
                      <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-purple-700 uppercase">Prochaine réunion</span>
                          <div className="flex items-center gap-1 text-purple-600 animate-pulse">
                            <Clock size={12} />
                            <span className="text-xs font-bold font-mono">
                              {timeLeft.days > 0 ? `${timeLeft.days}j ` : ''}
                              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-gray-700 truncate">
                          Session de Validation #{meetings[0].id}
                        </p>
                      </div>
                    )}

                    {/* All Upcoming Meetings */}
                    <div className="space-y-1">
                      {meetings.map((m, i) => (
                        <div key={m.id} className="p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                              <Calendar size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                                Réunion de Département
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-gray-500">{new Date(m.date).toLocaleDateString('fr-FR')}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="text-[10px] text-gray-500 font-bold">{m.heure}</span>
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-gray-300 mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Bell className="mx-auto text-gray-200 mb-3" size={32} />
                    <p className="text-sm text-gray-500">Aucune réunion programmée</p>
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t border-gray-50 bg-gray-50/30 text-center">
                <button 
                  onClick={() => { 
                    const path = user.role === 'CHEF_DEPARTEMENT' ? '/chef-departement/meetings' : '/enseignant/meetings';
                    navigate(path); 
                    setIsNotificationsOpen(false); 
                  }}
                  className="text-[10px] font-bold text-purple-600 hover:text-purple-700 uppercase tracking-wider"
                >
                  Voir tout l'agenda
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
