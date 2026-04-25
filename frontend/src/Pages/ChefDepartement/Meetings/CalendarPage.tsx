import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Loader, 
  Clock, 
  Plus, 
  X,
  Video,
  Info,
  Package,
  CheckCircle2,
  User,
  ArrowRight
} from 'lucide-react';
import { api } from '../../../services/api';
import { NotificationContainer } from '../../../components/Notification';
import { useNotifications } from '../../../hooks/useNotifications';
import { useAuth } from '../../../hooks/useAuth';

interface Reunion {
  id: number;
  date: any; 
  heure: string;
  statut: string;
  departementId?: number;
  chefId?: number;
  departementNom?: string;
}

interface Besoin {
  id: number;
  reunionId: number;
  typeRessourceId: number;
  quantite: number;
  statut: string;
  description?: string;
  enseignantId?: number;
  cpu?: string;
  ram?: string;
  disqueDur?: string;
  ecran?: string;
  vitesseImpression?: number;
  resolution?: string;
}

const MeetingCalendarPage = () => {
  const { user } = useAuth();
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [meetings, setMeetings] = useState<Reunion[]>([]);
  const [besoins, setBesoins] = useState<Besoin[]>([]);
  const [typesRessources, setTypesRessources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userData, setUserData] = useState<any>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDayMeetings, setSelectedDayMeetings] = useState<Reunion[]>([]);
  const [selectedDateLabel, setSelectedDateLabel] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    heure: '',
    statut: 'PLANIFIEE'
  });

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Get user details for department info if any
      const userRes = await api.getFournisseurById(user.id); // Reusing getFournisseurById as a generic getUserById
      let depId = null;
      if (userRes.ok) {
        const data = await userRes.json();
        setUserData(data);
        depId = data.departementId;
      }

      // 2. Fetch data based on role
      const isResponsable = user.role === 'RESPONSABLE';
      
      const [meetingsRes, besoinsRes, typesRes, deptsRes] = await Promise.all([
        isResponsable ? api.getAllReunions() : (depId ? api.getReunionsByDepartement(depId) : Promise.resolve({ ok: true, json: () => [] })),
        isResponsable ? api.getAllBesoins() : (depId ? api.getBesoinsByDepartement(depId) : Promise.resolve({ ok: true, json: () => [] })),
        api.getAllTypesRessources(),
        api.getAllDepartements()
      ]);
      
      if (meetingsRes.ok) {
        const meetingsData = await meetingsRes.json();
        setMeetings(meetingsData);
      }
      if (besoinsRes.ok) setBesoins(await besoinsRes.json());
      if (typesRes.ok) setTypesRessources(await typesRes.json());
      
      if (deptsRes.ok) {
        const depts = await deptsRes.json();
        // Add dept names to meetings if missing
        if (isResponsable) {
          setMeetings(prev => prev.map(m => ({
            ...m,
            departementNom: depts.find((d: any) => d.id === m.departementId)?.nom
          })));
        }
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

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isSameDay = (meetingDate: any, d: number, m: number, y: number) => {
    let mDate: Date;
    if (Array.isArray(meetingDate)) {
      mDate = new Date(meetingDate[0], meetingDate[1] - 1, meetingDate[2]);
    } else if (typeof meetingDate === 'string' && meetingDate.includes('-')) {
      const parts = meetingDate.split('-');
      mDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      mDate = new Date(meetingDate);
    }
    return mDate.getDate() === d && mDate.getMonth() === m && mDate.getFullYear() === y;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANIFIEE': return 'bg-blue-600';
      case 'EN_COURS': return 'bg-green-500';
      case 'VALIDEE': return 'bg-gray-500';
      case 'ANNULEE': return 'bg-red-500';
      default: return 'bg-blue-600';
    }
  };

  const handleDayClick = (day: number) => {
    const dayMeetings = meetings.filter(m => isSameDay(m.date, day, month, year));
    if (dayMeetings.length > 0) {
      setSelectedDayMeetings(dayMeetings);
      setSelectedDateLabel(`${day} ${monthNames[month]} ${year}`);
      setIsDetailsModalOpen(true);
    }
  };

  const handleDayDoubleClick = (day: number) => {
    if (user?.role !== 'CHEF_DEPARTEMENT') return;
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setFormData({
      date: dateStr,
      heure: '08:00',
      statut: 'PLANIFIEE'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.departementId) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        departementId: userData.departementId,
        chefId: user.id
      };

      const response = await api.createReunion(payload);
      if (response.ok) {
        showNotification('success', 'Réunion programmée');
        setIsModalOpen(false);
        fetchData();
      } else {
        showNotification('error', 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarIcon className="text-purple-600" size={28} />
            Planning des Réunions
          </h1>
          <p className="text-gray-500 mt-1">Cliquez sur un jour pour voir les détails et les besoins associés.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-600">
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 font-bold text-gray-800 min-w-[150px] text-center">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50/50 border-b border-gray-100">
          {days.map(day => (
            <div key={day} className="h-10 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] p-2 border-r border-b border-gray-50 bg-gray-50/20" />
          ))}

          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dayMeetings = meetings.filter(m => isSameDay(m.date, day, month, year));
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

            return (
              <div 
                key={day} 
                onClick={() => handleDayClick(day)}
                onDoubleClick={() => handleDayDoubleClick(day)}
                className={`min-h-[80px] p-2 border-r border-b border-gray-100 last:border-r-0 relative hover:bg-purple-50/20 transition-colors cursor-pointer group ${isToday ? 'bg-purple-50/30' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-bold ${isToday ? 'bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-400'}`}>
                    {day}
                  </span>
                  {user?.role === 'CHEF_DEPARTEMENT' && (
                    <Plus size={14} className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>

                <div className="mt-2 space-y-1">
                  {dayMeetings.map((m) => {
                    const mBesoins = besoins.filter(b => b.reunionId === m.id);
                    return (
                      <div key={m.id} className={`${getStatusColor(m.statut)} text-white p-1.5 rounded-lg shadow-sm overflow-hidden relative group/item`}>
                        <div className="flex justify-between items-center">
                          <p className="text-[9px] font-bold truncate">#{m.id} {m.departementNom && `- ${m.departementNom}`}</p>
                          {mBesoins.length > 0 && (
                            <div className="flex items-center gap-0.5 bg-white/20 px-1 rounded text-[8px]">
                              <Package size={8} /> {mBesoins.length}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 opacity-90">
                          <Clock size={8} />
                          <span className="text-[8px] font-medium">{m.heure}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {((firstDay + daysInMonth) % 7 !== 0) && [...Array(7 - ((firstDay + daysInMonth) % 7))].map((_, i) => (
            <div key={`empty-end-${i}`} className="min-h-[80px] p-2 border-r border-b border-gray-50 bg-gray-50/20 last:border-r-0" />
          ))}
        </div>
      </div>

      {/* Simplified Details Modal */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Séances du {selectedDateLabel}</h2>
                <p className="text-gray-500 text-xs mt-0.5">{selectedDayMeetings.length} réunion(s) au programme</p>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {selectedDayMeetings.map((m) => {
                const meetingBesoins = besoins.filter(b => b.reunionId === m.id);
                return (
                  <div key={m.id} className="p-4 rounded-2xl border border-gray-100 hover:border-purple-200 transition-all bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(m.statut)}`} />
                        <span className="font-bold text-gray-800">Réunion #{m.id}</span>
                      </div>
                      <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">{m.heure}</span>
                    </div>

                    {meetingBesoins.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Besoins associés</p>
                        <div className="grid gap-2">
                          {meetingBesoins.map(b => {
                            const type = typesRessources.find(t => t.id === b.typeRessourceId);
                            return (
                              <div key={b.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 group/besoin">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Package size={14} className="text-purple-600" />
                                    {type?.libelle || "Ressource"}
                                  </span>
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg text-[10px] font-black">
                                    Qté: {b.quantite}
                                  </span>
                                </div>
                                <div className="text-[11px] text-gray-500 font-medium ml-5 space-y-1">
                                  {b.description && <p className="italic text-gray-400 border-l-2 border-gray-200 pl-2">"{b.description}"</p>}
                                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                                    {b.cpu && <span>CPU: <b className="text-gray-700">{b.cpu}</b></span>}
                                    {b.ram && <span>RAM: <b className="text-gray-700">{b.ram}</b></span>}
                                    {b.disqueDur && <span>Disque: <b className="text-gray-700">{b.disqueDur}</b></span>}
                                    {b.ecran && <span>Écran: <b className="text-gray-700">{b.ecran}</b></span>}
                                    {b.resolution && <span>Résolution: <b className="text-gray-700">{b.resolution}</b></span>}
                                    {b.vitesseImpression && <span>Vitesse: <b className="text-gray-700">{b.vitesseImpression}</b></span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button onClick={() => setIsDetailsModalOpen(false)} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal (Chef Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="text-purple-600" />
                Programmer une Réunion
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Date choisie</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    <input 
                      type="date" 
                      value={formData.date} 
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Heure de la Séance</label>
                  <select
                    value={formData.heure}
                    onChange={(e) => setFormData({...formData, heure: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all cursor-pointer font-medium"
                    required
                  >
                    <option value="">Choisir...</option>
                    <option value="08:30">08:30 - 10:30</option>
                    <option value="10:30">10:30 - 12:30</option>
                    <option value="14:30">14:30 - 16:30</option>
                    <option value="16:30">16:30 - 18:30</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <Loader className="animate-spin" size={18} /> : <Plus size={18} />} Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingCalendarPage;
