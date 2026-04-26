import { useState, useEffect } from 'react';
import {
  Wrench, Loader, AlertCircle,
  CheckCircle, FileText, Calendar,
  Clock, Info, ChevronRight, Zap,
  Monitor, HardDrive, Filter
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

const MyInterventionsPage = () => {
  const { user } = useAuth();
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [signalements, setSignalements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showConstatModal, setShowConstatModal] = useState<any>({ 
    show: false, 
    signalement: null,
    isEditing: false,
    constatId: null
  });
  const [constatData, setConstatData] = useState({
    explication: '',
    dateApparition: '',
    frequence: 'RARE',
    ordre: 'MATERIEL'
  });

  useEffect(() => {
    if (user?.id) {
      loadSignalements();
    }
  }, [user?.id]);

  const loadSignalements = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await api.getAllSignalements();
      if (res.ok) {
        const data = await res.json();
        // Ne garder que les pannes assignées à l'utilisateur actuel
        const myTasks = data.filter((s: any) => s.technicienId === user.id);
        setSignalements(myTasks.sort((a: any, b: any) => b.id - a.id));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditConstat = async (s: any) => {
    setLoading(true);
    try {
      const res = await api.getConstatBySignalement(s.id);
      if (res.ok) {
        const data = await res.json();
        setConstatData({
          dateApparition: data.dateApparition ? (Array.isArray(data.dateApparition) ? `${data.dateApparition[0]}-${String(data.dateApparition[1]).padStart(2, '0')}-${String(data.dateApparition[2]).padStart(2, '0')}` : data.dateApparition) : '',
          frequence: data.frequence,
          ordre: data.ordre,
          explication: data.explication
        });
        setShowConstatModal({ 
          show: true, 
          signalement: s, 
          isEditing: true, 
          constatId: data.id 
        });
      } else {
        showNotification('error', 'Impossible de charger le constat existant');
      }
    } catch (error) {
      showNotification('error', 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitConstat = async () => {
    if (!constatData.explication || !constatData.dateApparition) return;
    setLoading(true);
    try {
      const payload = {
        signalementId: showConstatModal.signalement.id,
        technicienId: user.id,
        explication: constatData.explication,
        dateApparition: constatData.dateApparition,
        frequence: constatData.frequence,
        ordre: constatData.ordre,
        dateConstat: new Date().toISOString().split('T')[0],
        envoyeAuResponsable: true
      };

      const res = showConstatModal.isEditing 
        ? await api.updateConstat(showConstatModal.constatId, payload)
        : await api.createConstat(payload);

      if (res.ok) {
        showNotification('success', showConstatModal.isEditing ? 'Constat mis à jour' : 'Constat envoyé au responsable');
        setShowConstatModal({ show: false, signalement: null, isEditing: false, constatId: null });
        setConstatData({ explication: '', dateApparition: '', frequence: 'RARE', ordre: 'MATERIEL' });
        loadSignalements();
      } else {
        const err = await res.json();
        showNotification('error', err.message || 'Erreur technique');
      }
    } catch (error) {
      showNotification('error', 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (signalement: any) => {
    try {
      const res = await api.resoudreSignalement(signalement.id, user.id);
      if (res.ok) {
        showNotification('success', 'Panne marquée comme réparée');
        loadSignalements();
      } else {
        const err = await res.json();
        showNotification('error', err.message || 'Erreur lors de la résolution');
      }
    } catch (err) {
      showNotification('error', 'Erreur de connexion au serveur');
    }
  };

  if (loading && signalements.length === 0) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-gray-500 font-bold">Chargement de vos tâches...</p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <FileText className="text-blue-600" size={36} />
                Mes Interventions
              </h1>
              <p className="text-gray-500 mt-2 font-medium">Liste des pannes qui vous sont personnellement assignées.</p>
            </div>
            <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-100 flex items-center gap-2">
              <Zap size={18} />
              {signalements.filter(s => s.statut !== 'RESOLU').length} Tâches actives
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {signalements.map((s) => (
            <div key={s.id} className={`bg-white rounded-[2.5rem] p-8 border ${
              s.statut === 'RESOLU' ? 'border-green-200 bg-green-50/30' : 
              s.statut === 'CONSTAT' ? 'border-indigo-200 bg-indigo-50/30' :
              'border-blue-400 bg-blue-50/20 ring-2 ring-blue-100'
            } shadow-xl flex flex-col md:flex-row justify-between gap-8 transition-all relative overflow-hidden`}>

              {s.statut === 'CONSTAT' && (
                <div className="absolute top-0 right-10 bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-b-xl shadow-sm z-10">
                  EXPERTISE ENVOYÉE
                </div>
              )}

              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                    s.statut === 'RESOLU' ? 'bg-green-50 text-green-600 border-green-100' : 
                    s.statut === 'CONSTAT' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                    'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-100'
                  }`}>
                    {s.statut === 'RESOLU' ? <CheckCircle size={28} /> : 
                     s.statut === 'CONSTAT' ? <FileText size={28} /> : <AlertCircle size={28} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Panne sur RESS-{s.ressourceId}</h3>
                    <p className="text-gray-500 text-sm font-medium">Signalé le {Array.isArray(s.dateSignalement) ? `${s.dateSignalement[2]}/${s.dateSignalement[1]}/${s.dateSignalement[0]}` : s.dateSignalement}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border italic text-sm ${
                  s.statut === 'RESOLU' ? 'bg-green-50/50 border-green-100 text-green-700' : 
                  s.statut === 'CONSTAT' ? 'bg-indigo-50/50 border-indigo-100 text-indigo-700' :
                  'bg-blue-50/50 border-blue-100 text-blue-800'
                }`}>
                  "{s.description}"
                </div>

                <div className="flex flex-wrap gap-4">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${s.statut === 'RESOLU' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                    {s.statut}
                  </span>
                  {s.enseignantNom && (
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                      <Info size={12} /> Demandé par {s.enseignantNom}
                    </span>
                  )}
                </div>
              </div>

              {s.statut !== 'RESOLU' && s.statut !== 'ENVOYE' && (
                <div className="flex flex-col gap-3 items-center justify-center min-w-[250px]">
                  {s.statut === 'CONSTAT' ? (
                    <div className="w-full p-6 bg-indigo-50 border border-indigo-100 rounded-3xl text-center">
                       <FileText className="mx-auto text-indigo-500 mb-2" size={24} />
                       <p className="text-xs font-black text-indigo-700 uppercase tracking-widest">Expertise envoyée</p>
                       <p className="text-[10px] text-indigo-400 font-bold mt-1 mb-4">En attente de décision</p>
                       
                       <button 
                         onClick={() => handleEditConstat(s)}
                         className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                       >
                         <Zap size={12} /> Modifier mon constat
                       </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowConstatModal({ show: true, signalement: s })}
                        className="w-full px-6 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                      >
                        <FileText size={18} />
                        Constat Technique
                      </button>
                      <button
                        onClick={() => handleResolve(s)}
                        className="w-full px-6 py-4 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl font-black hover:bg-emerald-200 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Réparé & Fermer
                      </button>
                    </>
                  )}
                </div>
              )}

              {s.statut === 'RESOLU' && (
                <div className="flex items-center justify-center min-w-[250px]">
                  <div className="flex items-center gap-2 text-green-600 font-black uppercase tracking-widest text-sm">
                    <CheckCircle size={20} />
                    Terminé
                  </div>
                </div>
              )}
            </div>
          ))}

          {signalements.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
              <CheckCircle className="mx-auto text-green-200 mb-4" size={64} />
              <p className="text-gray-500 font-bold text-xl">Vous n'avez aucune intervention assignée pour le moment.</p>
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
              {showConstatModal.isEditing ? 'Modifier le Constat' : 'Rédiger un Constat'}
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
                      onChange={e => setConstatData({ ...constatData, dateApparition: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold text-gray-700 cursor-pointer appearance-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fréquence</label>
                  <select
                    value={constatData.frequence}
                    onChange={e => setConstatData({ ...constatData, frequence: e.target.value })}
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
                    onChange={e => setConstatData({ ...constatData, ordre: e.target.value })}
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
                onChange={e => setConstatData({ ...constatData, explication: e.target.value })}
                placeholder="Expliquez techniquement la panne..."
                className="w-full h-40 p-6 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-100 font-medium transition-all resize-none"
              />
            </div>

            <div className="flex gap-4">
               <button
                onClick={() => {
                  setShowConstatModal({ show: false, signalement: null, isEditing: false, constatId: null });
                  setConstatData({ explication: '', dateApparition: '', frequence: 'RARE', ordre: 'MATERIEL' });
                }}
                 className="flex-1 py-5 bg-gray-100 text-gray-600 rounded-[1.5rem] font-black hover:bg-gray-200 transition-all"
               >
                 Annuler
               </button>
               <button
                onClick={handleSubmitConstat}
                disabled={!constatData.explication || !constatData.dateApparition || loading}
                 className="flex-1 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
               >
                {showConstatModal.isEditing ? 'Mettre à jour' : 'Valider & Envoyer'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyInterventionsPage;
