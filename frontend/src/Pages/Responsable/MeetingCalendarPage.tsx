import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader, Clock } from 'lucide-react';
import { api } from '../../services/api';

interface Reunion {
  id: number;
  date: any; 
  heure: string;
  statut: string;
  departementId?: number;
}

const MeetingCalendarPage = () => {
  const [meetings, setMeetings] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await api.getAllReunions();
      if (response.ok) {
        setMeetings(await response.json());
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
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
      default: return 'bg-blue-600';
    }
  };

  return (
    <div className="p-6 bg-gray-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarIcon className="text-blue-600" size={28} />
            Planning des Réunions
          </h1>
          <p className="text-gray-500 mt-1">Gérez votre emploi du temps et vos concertations</p>
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
            <div key={`empty-${i}`} className="min-h-[80px] p-2 border-r border-b border-gray-50 bg-gray-50/20" />
          ))}

          {/* Actual days */}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dayMeetings = meetings.filter(m => isSameDay(m.date, day, month, year));
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

            return (
              <div key={day} className={`min-h-[80px] p-2 border-r border-b border-gray-200 last:border-r-0 relative hover:bg-blue-50/10 transition-colors ${isToday ? 'bg-blue-50/30' : ''}`}>
                <span className={`text-xs font-bold ${isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-400'}`}>
                  {day}
                </span>

                <div className="mt-2 space-y-1">
                  {dayMeetings.map((m) => (
                    <div
                      key={m.id}
                      className={`${getStatusColor(m.statut)} text-white p-2 rounded-xl shadow-sm cursor-pointer hover:scale-[1.02] transition-transform overflow-hidden`}
                    >
                      <p className="text-[10px] font-bold truncate">Réunion #{m.id}</p>
                      <div className="flex items-center gap-1 mt-0.5 opacity-90">
                        <Clock size={10} />
                        <span className="text-[9px] font-medium">{m.heure}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Empty cells for end of month */}
          {((firstDay + daysInMonth) % 7 !== 0) && [...Array(7 - ((firstDay + daysInMonth) % 7))].map((_, i) => (
            <div key={`empty-end-${i}`} className="min-h-[140px] p-2 border-r border-b border-gray-50 bg-gray-50/20 last:border-r-0" />
          ))}
        </div>
      </div>

      {loading && (
        <div className="fixed bottom-10 right-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <Loader className="animate-spin text-blue-600" size={20} />
          <span className="text-sm font-bold text-gray-600">Mise à jour du calendrier...</span>
        </div>
      )}
    </div>
  );
};

export default MeetingCalendarPage;
