import { useState, useEffect } from 'react';
import { 
  Wrench, Loader, AlertCircle, 
  CheckCircle, FileText, Calendar,
  Clock, Info, ChevronRight, Zap,
  Monitor, HardDrive
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const TechnicienInterventionsPage = () => {
  const { user } = useAuth();
  const [signalements, setSignalements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showConstatModal, setShowConstatModal] = useState({ show: false, signalement: null as any });
  const [constatData, setConstatData] = useState({
    explication: '',
    dateApparition: '',
    frequence: 'RARE',
    ordre: 'MATERIEL'
  });

  useEffect(() => {
    loadSignalements();
  }, []);

  const loadSignalements = async () => {
    setLoading(true);
    try {
      const res = await api.getAllSignalements();
      if (res.ok) {
        const data = await res.json();
        // Technicians see all for now, or filter by assigned
        setSignalements(data.filter((s: any) => s.statut === 'SIGNALE' || s.statut === 'EN_COURS'));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConstat = async () => {
    if (!constatData.explication || !constatData.dateApparition) return;
    setLoading(true);
    try {
      const res = await api.createConstat({
        signalementId: showConstatModal.signalement.id,
        technicienId: user.id,
        explication: constatData.explication,
        dateApparition: constatData.dateApparition,
        frequence: constatData.frequence,
        ordre: constatData.ordre,
        dateConstat: new Date().toISOString().split('T')[0],
        envoyeAuResponsable: true
      });
      if (res.ok) {
        alert('Constat rédigé et envoyé au responsable');
        setShowConstatModal({ show: false, signalement: null });
        loadSignalements();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && signalements.length === 0) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-gray-500 font-bold">Chargement des interventions...</p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Wrench className="text-blue-600" size={36} />
            Interventions Maintenance
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Gérez les pannes signalées et rédigez les constats techniques.</p>
        </div>

        <div className="grid gap-6">
          {signalements.map((s) => (
            <div key={s.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl flex flex-col md:flex-row justify-between gap-8 group hover:border-blue-200 transition-all">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 border border-red-100">
                    <AlertCircle size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Panne sur RESS-{s.ressourceId}</h3>
                    <p className="text-gray-500 text-sm font-medium">Signalé le {Array.isArray(s.dateSignalement) ? `${s.dateSignalement[2]}/${s.dateSignalement[1]}/${s.dateSignalement[0]}` : s.dateSignalement}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-600 text-sm">
                   "{s.description}"
                </div>

                <div className="flex gap-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    {s.statut}
                  </span>
                  {s.enseignantNom && (
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                      <Info size={12} /> Demandé par {s.enseignantNom}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center">
                <button 
                  onClick={() => setShowConstatModal({ show: true, signalement: s })}
                  className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-gray-200"
                >
                  <FileText size={20} />
                  Rédiger un Constat
                </button>
              </div>
            </div>
          ))}

          {signalements.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
              <CheckCircle className="mx-auto text-green-200 mb-4" size={64} />
              <p className="text-gray-500 font-bold text-xl">Aucune panne en attente de traitement.</p>
            </div>
          )}
        </div>
      </div>

      {/* Constat Modal */}
      {showConstatModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <FileText className="text-blue-600" />
              Constat Technique
            </h3>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date d'apparition</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 group-hover:text-blue-600 transition-colors pointer-events-none" size={18} />
                    <input 
                      type="date"
                      value={constatData.dateApparition}
                      onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                      onChange={e => setConstatData({...constatData, dateApparition: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold text-gray-700 cursor-pointer appearance-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fréquence</label>
                  <select 
                    value={constatData.frequence}
                    onChange={e => setConstatData({...constatData, frequence: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold text-gray-700"
                  >
                    <option value="RARE">Rare</option>
                    <option value="FREQUENTE">Fréquente</option>
                    <option value="PERMANENTE">Permanente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ordre de la panne</label>
                  <select 
                    value={constatData.ordre}
                    onChange={e => setConstatData({...constatData, ordre: e.target.value})}
                    disabled={showConstatModal.signalement?.ressourceType === 'IMPRIMANTE'}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold text-gray-700 disabled:opacity-70"
                  >
                    <option value="MATERIEL">Matériel</option>
                    {!showConstatModal.signalement?.ressourceType?.includes('IMPRIMANTE') && (
                      <option value="LOGICIEL">Logiciel</option>
                    )}
                  </select>
                  {showConstatModal.signalement?.ressourceType?.includes('IMPRIMANTE') && (
                    <p className="text-[10px] text-amber-600 font-bold mt-1 italic">
                      Note: Les pannes d'imprimantes sont uniquement d'ordre matériel.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1 mb-10">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Explication détaillée</label>
              <textarea 
                value={constatData.explication}
                onChange={e => setConstatData({...constatData, explication: e.target.value})}
                placeholder="Expliquez techniquement la panne..."
                className="w-full h-40 p-6 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-100 font-medium transition-all resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowConstatModal({ show: false, signalement: null })}
                className="flex-1 py-5 bg-gray-100 text-gray-600 rounded-[1.5rem] font-black hover:bg-gray-200 transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={handleCreateConstat}
                disabled={!constatData.explication || !constatData.dateApparition || loading}
                className="flex-1 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
              >
                Valider & Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicienInterventionsPage;
