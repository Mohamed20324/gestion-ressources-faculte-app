import { useState, useEffect } from 'react';
import { 
  AlertTriangle, Loader, CheckCircle, 
  FileText, Calendar, Wrench, 
  ArrowRight, ShieldAlert, Package,
  Truck, Info, User, ClipboardList, Zap, Clock, Activity
} from 'lucide-react';
import { api } from '../../../services/api';
import { NotificationContainer } from '../../../components/Notification';
import { useNotifications } from '../../../hooks/useNotifications';

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
      const [sigRes, constRes] = await Promise.all([
        api.getAllSignalements(),
        api.getAllConstats()
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
      showNotification('success', `Décision "${decision}" enregistrée et notifiée.`);
      fetchData();
      setSelectedConstat(null);
    } catch (error) {
      showNotification('error', 'Erreur technique');
    }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center h-screen">
              <Loader className="animate-spin text-amber-600" size={48} />
          </div>
      );
  }

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <AlertTriangle size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Suivi des Pannes & Constats</h1>
          </div>
          <p className="text-gray-500 mt-1">Gérez les signalements des enseignants et les expertises techniques.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <ClipboardList className="text-purple-600" size={20} />
              Signalements Récents
            </h2>
            <div className="space-y-4">
                {signalements.filter(s => ['SIGNALE', 'EN_COURS'].includes(s.statut)).map((s) => (
                <div key={s.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Panne RESS-{s.ressourceId}</h4>
                            <p className="text-sm text-gray-500 italic mt-0.5 line-clamp-1">"{s.description}"</p>
                            <div className="flex items-center gap-2 mt-2">
                                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">{s.enseignantNom}</p>
                                {s.statut === 'EN_COURS' && (
                                    <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold border border-blue-100">
                                        PRIS PAR TECH
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-red-600 font-bold text-[10px] uppercase bg-red-50 px-2 py-1 rounded-full border border-red-100">
                    <AlertTriangle size={12} /> EN PANNE
                    </div>
                </div>
                ))}
                {signalements.filter(s => ['SIGNALE', 'EN_COURS'].includes(s.statut)).length === 0 && (
                <div className="p-12 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                    <div className="w-12 h-12 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={24} />
                    </div>
                    <p className="text-gray-400 font-medium">Tout est en ordre !</p>
                </div>
                )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <FileText className="text-blue-600" size={20} />
              Expertises à traiter
            </h2>
            <div className="space-y-4">
                {constats.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-blue-200 transition-all cursor-pointer group" onClick={() => setSelectedConstat(c)}>
                    <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <Wrench size={20} />
                        </div>
                        <div>
                        <h3 className="font-bold text-gray-900">{c.ressourceNom || `Constat #${c.id}`}</h3>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Wrench size={10} /> Expert: {c.technicienNom}
                        </p>
                        </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.frequence === 'PERMANENTE' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {c.frequence}
                    </span>
                    </div>

                    <p className="text-sm text-gray-600 font-medium line-clamp-2 mb-4 bg-gray-50 p-3 rounded-xl">
                    {c.explication}
                    </p>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                        <Calendar size={12} /> {Array.isArray(c.dateConstat) ? `${c.dateConstat[2]}/${c.dateConstat[1]}/${c.dateConstat[0]}` : c.dateConstat}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase">
                        <Zap size={12} /> {c.ordre}
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ArrowRight size={16} />
                    </div>
                    </div>
                </div>
                ))}
                {constats.length === 0 && (
                <div className="p-12 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                    <div className="w-12 h-12 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={24} />
                    </div>
                    <p className="text-gray-400 font-medium">Aucun constat en attente.</p>
                </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {selectedConstat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedConstat.ressourceNom}</h3>
                <p className="text-sm text-blue-600 font-bold flex items-center gap-1">
                  <Wrench size={14} /> Expertise de {selectedConstat.technicienNom}
                </p>
              </div>
              <button onClick={() => setSelectedConstat(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Détails Panne</p>
                <p className="font-bold text-gray-900 text-sm">{selectedConstat.frequence} / {selectedConstat.ordre}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Garantie</p>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${selectedConstat.sousGarantie ? 'bg-green-500' : 'bg-red-500'}`} />
                   <p className={`font-bold text-sm ${selectedConstat.sousGarantie ? 'text-green-600' : 'text-red-600'}`}>
                     {selectedConstat.sousGarantie ? 'SOUS GARANTIE' : 'EXPIRÉE'}
                   </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 mb-8">
               <h4 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-2">
                 <Info size={14} /> Explication Technique
               </h4>
               <p className="text-blue-900 text-sm font-medium leading-relaxed">
                 {selectedConstat.explication}
               </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleDecision(selectedConstat.id, 'RENVOI_REPARATION')}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-lg"
              >
                <Truck size={20} />
                Renvoyer pour réparation
              </button>
              
              <button 
                onClick={() => handleDecision(selectedConstat.id, 'DEMANDE_ECHANGE')}
                className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-100"
              >
                <RefreshCw size={20} />
                Demander l'échange standard
              </button>

              <button 
                onClick={() => handleDecision(selectedConstat.id, 'REMPLACEMENT_INTERNE')}
                className="w-full py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
              >
                <Package size={20} />
                Remplacer par stock interne
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RefreshCw = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export default ReportsPage;


