import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Loader, 
  Clock, 
  Plus, 
  X, 
  Building2,
} from 'lucide-react';
import { api } from '../../../services/api';
import { NotificationContainer } from '../../../components/Notification';
import { useNotifications } from '../../../hooks/useNotifications';

interface Reunion {
  id: number;
  date: any; 
  heure: string;
  statut: string;
  departementId?: number;
  chefId?: number;
}

interface Departement {
  id: number;
  nom: string;
}

interface User {
  id: number;
  nom: string;
  prenom: string;
  role: string;
  departementId?: number;
}

const MeetingCalendarPage = () => {
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [meetings, setMeetings] = useState<Reunion[]>([]);
  const [departments, setDepartments] = useState<Departement[]>([]);
  const [chefs, setChefs] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    heure: '',
    departementId: '',
    chefId: '',
    statut: 'PLANIFIEE'
  });

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [meetingsRes, deptsRes, chefsRes] = await Promise.all([
        api.getAllReunions(),
        api.getAllDepartements(),
        api.getUsersByRole('CHEF_DEPARTEMENT')
      ]);

      if (meetingsRes.ok) setMeetings(await meetingsRes.json());
      if (deptsRes.ok) setDepartments(await deptsRes.json());
      if (chefsRes.ok) setChefs(await chefsRes.json());

    } catch (error) {
      showNotification('error', 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calendar logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start
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

  const handleDayDoubleClick = (day: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace('h', ':');
    
    setFormData({
      date: dateStr,
      heure: now,
      departementId: '',
      chefId: '',
      statut: 'PLANIFIEE'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.heure || !formData.departementId || !formData.chefId) {
      showNotification('error', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const [hourStr, minStr] = formData.heure.split(':');
    const hour = parseInt(hourStr);
    
    if (hour < 8 || hour >= 18) {
      showNotification('error', 'Les réunions doivent être programmées entre 08:00 et 18:00');
      return;
    }

    const fDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (fDate < today) {
      showNotification('error', 'Impossible de programmer une réunion à une date passée');
      return;
    }

    const [h2, min2] = formData.heure.split(':').map(Number);
    const time2 = h2 * 60 + min2;

    // Validation: 1-hour separation and Chef availability
    const conflict = meetings.find(m => {
      // Check if same day
      let mDate: Date;
      if (Array.isArray(m.date)) {
        mDate = new Date(m.date[0], m.date[1] - 1, m.date[2]);
      } else if (typeof m.date === 'string' && m.date.includes('-')) {
        const parts = m.date.split('-');
        mDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        mDate = new Date(m.date);
      }
      
      const fDate = new Date(formData.date);
      const isSameDay = mDate.getFullYear() === fDate.getFullYear() && 
                        mDate.getMonth() === fDate.getMonth() && 
                        mDate.getDate() === fDate.getDate();

      if (!isSameDay) return false;

      const [h1, min1] = m.heure.split(':').map(Number);
      const time1 = h1 * 60 + min1;
      const diff = Math.abs(time1 - time2);

      if (diff < 60) {
        // If it's the same chef or same department
        if (m.chefId === parseInt(formData.chefId)) return true;
        if (m.departementId === parseInt(formData.departementId)) return true;
      }
      return false;
    });

    if (conflict) {
      showNotification('error', 'Conflit d\'horaire : Une réunion est déjà prévue pour ce département ou ce chef dans cet intervalle (minimum 1h d\'écart).');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        departementId: parseInt(formData.departementId),
        chefId: parseInt(formData.chefId)
      };

      const response = await api.createReunion(payload);

      if (response.ok) {
        showNotification('success', 'Réunion programmée avec succès');
        setIsModalOpen(false);
        fetchData();
      } else {
        const error = await response.json();
        showNotification('error', error.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      showNotification('error', 'Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarIcon className="text-blue-600" size={28} />
            Planning des Réunions
          </h1>
          <p className="text-gray-500 mt-1">Double-cliquez sur un jour pour programmer une réunion</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-600"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 font-bold text-gray-800 min-w-[150px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-600"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 bg-gray-50/50 border-b border-gray-100">
          {days.map(day => (
            <div key={day} className="py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells for start of month */}
          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px] p-2 border-r border-b border-gray-50 bg-gray-50/20" />
          ))}

          {/* Actual days */}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dayMeetings = meetings.filter(m => isSameDay(m.date, day, month, year));
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

            return (
              <div 
                key={day} 
                onDoubleClick={() => {
                  const selectedDate = new Date(year, month, day);
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  if (selectedDate < today) {
                    showNotification('error', 'Impossible de programmer une réunion à une date passée');
                    return;
                  }
                  handleDayDoubleClick(day);
                }}
                className={`min-h-[90px] p-2 border-r border-b border-gray-200 last:border-r-0 relative hover:bg-blue-50/20 transition-colors cursor-pointer group ${isToday ? 'bg-blue-50/30' : ''}`}
                title="Double-clic pour ajouter une réunion"
              >
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-bold ${isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-400'}`}>
                    {day}
                  </span>
                  {!isToday && new Date(year, month, day) < new Date() ? null : (
                    <Plus size={14} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>

                <div className="mt-2 space-y-1">
                  {dayMeetings.map((m) => (
                    <div
                      key={m.id}
                      className={`${getStatusColor(m.statut)} text-white p-1.5 rounded-lg shadow-sm hover:scale-[1.02] transition-transform overflow-hidden`}
                    >
                      <p className="text-[9px] font-bold truncate">Réunion #{m.id}</p>
                      <div className="flex items-center gap-1 mt-0.5 opacity-90">
                        <Clock size={8} />
                        <span className="text-[8px] font-medium">{m.heure}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Empty cells for end of month */}
          {((firstDay + daysInMonth) % 7 !== 0) && [...Array(7 - ((firstDay + daysInMonth) % 7))].map((_, i) => (
            <div key={`empty-end-${i}`} className="min-h-[90px] p-2 border-r border-b border-gray-50 bg-gray-50/20 last:border-r-0" />
          ))}
        </div>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="text-blue-600" />
                Programmer une Réunion
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Date</label>
                  <div className="relative group">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 group-hover:text-blue-600 transition-colors pointer-events-none" size={18} />
                    <input 
                      type="date" 
                      value={formData.date}
                      readOnly
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Heure</label>
                  <div className="relative group">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 group-hover:text-blue-600 transition-colors pointer-events-none" size={18} />
                    <input 
                      type="time" 
                      value={formData.heure}
                      min="08:00"
                      max="18:00"
                      onChange={(e) => setFormData({...formData, heure: e.target.value})}
                      onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">Département</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" size={18} />
                  <select 
                    value={formData.departementId}
                    onChange={(e) => {
                      const deptId = e.target.value;
                      const matchingChef = chefs.find(c => c.departementId?.toString() === deptId);
                      setFormData({ 
                        ...formData, 
                        departementId: deptId,
                        chefId: matchingChef ? matchingChef.id.toString() : ''
                      });
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                    required
                  >
                    <option value="">Sélectionner un département</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">Chef de Département</label>
                <div className="relative">
                  <X className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" size={18} style={{ display: 'none' }} /> {/* Placeholder for consistency */}
                  <select 
                    value={formData.chefId}
                    onChange={(e) => setFormData({...formData, chefId: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed outline-none transition-all appearance-none text-gray-500"
                    disabled
                    required
                  >
                    <option value="">Sélectionner le chef responsable</option>
                    {chefs.map(c => (
                      <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <Loader className="animate-spin" size={18} /> : <Plus size={18} />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && meetings.length === 0 && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center">
          <Loader className="animate-spin text-blue-600" size={48} />
        </div>
      )}
    </div>
  );
};

export default MeetingCalendarPage;
