import { useState, useEffect } from 'react';
import {
  Video,
  Calendar as CalendarIcon,
  Clock,
  Clock3,
  Loader,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface Reunion {
  id: number;
  date: any;
  heure: string;
  statut: string;
  departementId?: number;
  chefId?: number;
}

const MeetingTimer = ({ date, heure }: { date: any; heure: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
  const [status, setStatus] = useState<'upcoming' | 'ongoing' | 'finished'>('upcoming');

  useEffect(() => {
    const calculateTime = () => {
      let targetDate: Date;
      
      if (Array.isArray(date)) {
        const [y, m, d] = date;
        targetDate = new Date(y, m - 1, d);
      } else {
        targetDate = new Date(date);
      }

      const [h, min] = heure.split(':').map(Number);
      targetDate.setHours(h, min, 0, 0);

      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        // Assume meeting lasts 2 hours for "ongoing" status check, or just mark as finished
        if (distance > -7200000) { // 2 hours
          setStatus('ongoing');
        } else {
          setStatus('finished');
        }
        setTimeLeft(null);
        return;
      }

      setStatus('upcoming');
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [date, heure]);

  if (status === 'finished') return <span className="text-red-500 font-bold text-[10px] uppercase">Terminée</span>;
  if (status === 'ongoing') return <span className="text-green-500 font-bold text-[10px] uppercase animate-pulse">En cours...</span>;
  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
      <Clock size={10} className="animate-pulse" />
      <span>
        {timeLeft.days > 0 ? `${timeLeft.days}j ` : ''}
        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

const MeetingsPage = () => {
  const { user } = useAuth();
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [meetings, setMeetings] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;


  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Obtenir les détails du Chef (pour son departementId)
      let currentDeptId = userData?.departementId;
      if (!currentDeptId) {
        const userRes = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (userRes.ok) {
          const data = await userRes.json();
          setUserData(data);
          currentDeptId = data.departementId;
        }
      }

      if (currentDeptId) {
        const meetingsRes = await api.getReunionsByDepartement(currentDeptId);
        if (meetingsRes.ok) setMeetings(await meetingsRes.json());
      }

    } catch (error) {
      showNotification('error', 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const currentMeetings = meetings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(meetings.length / itemsPerPage);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PLANIFIEE': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'EN_COURS': return 'bg-green-50 text-green-600 border-green-100';
      case 'VALIDEE': return 'bg-gray-50 text-gray-600 border-gray-100';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (Array.isArray(date)) {
      return `${date[2].toString().padStart(2, '0')}/${date[1].toString().padStart(2, '0')}/${date[0]}`;
    }
    try {
      const parts = date.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR');
    } catch (e) {
      return date;
    }
  };

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Video className="text-purple-600" size={32} />
            Mes Réunions de Département
          </h1>
          <p className="text-gray-500 mt-1">Consultez les réunions programmées pour votre département.</p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20 text-purple-600">
          <Loader className="animate-spin" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {currentMeetings.map((meeting) => (
            <div key={meeting.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(meeting.statut)} flex items-center gap-1.5`}>
                  {meeting.statut === 'EN_COURS' ? <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> : <Clock3 size={14} />}
                  {meeting.statut}
                </span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold text-gray-400">ID: #{meeting.id}</span>
                  <MeetingTimer date={meeting.date} heure={meeting.heure} />
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-6 group-hover:text-purple-600 transition-colors">
                Session de Validation
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                    <CalendarIcon size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Date</p>
                    <p className="text-xs font-bold">{formatDate(meeting.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Heure</p>
                    <p className="text-xs font-bold">{meeting.heure}</p>
                  </div>
                </div>
              </div>
              
              {/* Note: Read-only view for ChefDepartement */}
            </div>
          ))}
          {!loading && currentMeetings.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <Video className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-500 font-medium">Aucune réunion programmée pour votre département.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 border border-gray-100 rounded-3xl shadow-sm mb-8">
          <div className="flex-1 flex justify-between sm:hidden">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Précédent</button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="ml-3 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Suivant</button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> à <span className="font-medium">{Math.min(currentPage * itemsPerPage, meetings.length)}</span> sur <span className="font-medium">{meetings.length}</span> réunions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-xl border border-gray-100 transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-purple-600 hover:bg-purple-50'}`}
              >
                <ChevronLeft size={20} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === i + 1 ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-xl border border-gray-100 transition-colors ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-purple-600 hover:bg-purple-50'}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsPage;
