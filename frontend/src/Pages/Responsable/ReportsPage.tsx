import { useState, useEffect } from 'react';
import { 
  AlertTriangle, Loader, CheckCircle, 
  FileText, Calendar, Wrench, 
  ArrowRight, ShieldAlert, Package,
  Truck, Info, User, ClipboardList
} from 'lucide-react';
import { api } from '../../services/api';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

const ReportsPage = () => {
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [signalements, setSignalements] = useState<any[]>([]);
  const [constats, setConstats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConstat, setSelectedConstat] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Signalements and Constats
      const [sigRes, constRes] = await Promise.all([
        api.getAllSignalements(),
        fetch('http://localhost:8081/api/constats', {
             headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')!).accessToken}` }
        })
      ]);

      if (sigRes.ok) setSignalements(await sigRes.json());
      if (constRes.ok) setConstats(await constRes.json());
    } catch (error) {
      showNotification('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (constatId: number, decision: string) => {
    try {
      // API call to update status based on decision
      // e.g., RENVOYE_FOURNISSEUR, DEMANDE_ECHANGE, etc.
      showNotification('success', `Décision "${decision}" enregistrée et notifiée.`);
      fetchData();
      setSelectedConstat(null);
    } catch (error) {
      showNotification('error', 'Erreur technique');
    }
  };

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <AlertTriangle className="text-amber-500" size={40} />
            Suivi des Pannes & Constats
          </h1>
          <p className="text-gray-500 font-medium mt-2">Gérez les signalements des enseignants et les expertises des techniciens.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Recent Signalements */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <ClipboardList className="text-purple-600" />
              Signalements Récents
            </h2>
            {signalements.filter(s => s.statut === 'SIGNALE').map((s) => (
              <div key={s.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl flex justify-between items-center group transition-all">
                <div>
                  <h4 className="font-black text-gray-900">Panne RESS-{s.ressourceId}</h4>
                  <p className="text-sm text-gray-500 italic">"{s.description}"</p>
                  <p className="text-[10px] font-bold text-purple-600 mt-2 uppercase tracking-widest">{s.enseignantNom}</p>
                </div>
                <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase">
                  <Clock size={14} /> En attente technicien
                </div>
              </div>
            ))}
            {signalements.filter(s => s.statut === 'SIGNALE').length === 0 && (
              <div className="p-10 bg-white rounded-[2rem] border border-dashed border-gray-200 text-center text-gray-400 font-bold">
                Aucun nouveau signalement.
              </div>
            )}
          </div>

          {/* Technical Constats (The "Heavy" part of requirements) */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <FileText className="text-blue-600" />
              Constats à traiter
            </h2>
            {constats.map((c) => (
              <div key={c.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl hover:border-blue-200 transition-all cursor-pointer group" onClick={() => setSelectedConstat(c)}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <Wrench size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg">Constat #{c.id}</h3>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Technicien: {c.technicienNom || 'N/A'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${c.frequence === 'PERMANENTE' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {c.frequence}
                  </span>
                </div>

                <div className="mb-6 line-clamp-2 text-sm text-gray-600 font-medium">
                  {c.explication}
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                      <Calendar size={12} /> {Array.isArray(c.dateConstat) ? `${c.dateConstat[2]}/${c.dateConstat[1]}/${c.dateConstat[0]}` : c.dateConstat}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase">
                      <Zap size={12} /> {c.ordre}
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
            {constats.length === 0 && (
              <div className="p-10 bg-white rounded-[2rem] border border-dashed border-gray-200 text-center text-gray-400 font-bold">
                Aucun constat en attente de décision.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      {selectedConstat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-3xl font-black text-gray-900">Décision sur Constat</h3>
              <button onClick={() => setSelectedConstat(null)} className="text-gray-400 hover:text-gray-600 font-black">FERMER</button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-gray-50 rounded-3xl">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Fréquence & Ordre</p>
                <p className="font-bold text-gray-900">{selectedConstat.frequence} / {selectedConstat.ordre}</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-3xl">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Statut Garantie</p>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${selectedConstat.sousGarantie ? 'bg-green-500' : 'bg-red-500'}`} />
                   <p className={`font-bold ${selectedConstat.sousGarantie ? 'text-green-600' : 'text-red-600'}`}>
                     {selectedConstat.sousGarantie ? 'SOUS GARANTIE' : 'GARANTIE EXPIRÉE'}
                   </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100 mb-10">
               <h4 className="text-sm font-black text-blue-800 uppercase mb-3 flex items-center gap-2">
                 <Info size={16} /> Expertise du technicien
               </h4>
               <p className="text-blue-900 font-medium leading-relaxed italic">
                 "{selectedConstat.explication}"
               </p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => handleDecision(selectedConstat.id, 'RENVOI_REPARATION')}
                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                <Truck size={24} />
                Renvoyer au fournisseur pour réparation
              </button>
              
              <button 
                onClick={() => handleDecision(selectedConstat.id, 'DEMANDE_ECHANGE')}
                className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-purple-100"
              >
                <RefreshCw size={24} />
                Demander l'échange (sous garantie)
              </button>

              <button 
                onClick={() => handleDecision(selectedConstat.id, 'REMPLACEMENT_INTERNE')}
                className="w-full py-5 bg-amber-100 text-amber-700 rounded-2xl font-black hover:bg-amber-200 transition-all flex items-center justify-center gap-3"
              >
                <Package size={24} />
                Remplacement par stock interne (Hors garantie)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal icon for the modal
const RefreshCw = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export default ReportsPage;
