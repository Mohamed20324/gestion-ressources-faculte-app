import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Loader, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

const SignalementsPage = () => {
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [signalements, setSignalements] = useState<any[]>([]);
  const [filterStatut, setFilterStatut] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadSignalements = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await api.getSignalementsByEnseignant(user.id);
      if (res.ok) {
        const data = await res.json();
        setSignalements(data.sort((a: any, b: any) => b.id - a.id));
      }
    } catch (error) {
      showNotification('error', 'Erreur lors du chargement de vos signalements');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadSignalements();
  }, [loadSignalements]);

  const handleAnnuler = async (id: number) => {
    if (!window.confirm("Voulez-vous vraiment annuler ce signalement ?")) return;
    
    try {
      const res = await api.annulerSignalement(id);
      if (res.ok) {
        showNotification('success', 'Signalement annulé avec succès');
        loadSignalements();
      } else {
        showNotification('error', 'Impossible d\'annuler ce signalement');
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de l\'annulation');
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'SIGNALE':
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-xl text-xs font-black uppercase flex items-center gap-1 w-fit"><Clock size={14} /> En attente</span>;
      case 'EN_COURS':
      case 'CONSTAT':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-xl text-xs font-black uppercase flex items-center gap-1 w-fit"><AlertTriangle size={14} /> En cours de traitement</span>;
      case 'RESOLU':
      case 'FERME':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black uppercase flex items-center gap-1 w-fit"><CheckCircle size={14} /> Réparé</span>;
      case 'FOURNISSEUR':
      case 'ECHANGE':
        return <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-xl text-xs font-black uppercase flex items-center gap-1 w-fit"><Loader className="animate-spin" size={14} /> Chez le fournisseur</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-xl text-xs font-black uppercase flex items-center gap-1 w-fit">{statut}</span>;
    }
  };

  if (loading && signalements.length === 0) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-gray-500 font-bold">Chargement de vos signalements...</p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <AlertTriangle className="text-red-500" size={36} />
              Mes Déclarations de Pannes
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Suivez l'état d'avancement de vos signalements ou annulez-les si la panne est résolue.</p>
          </div>
          
          <select 
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all shadow-sm"
          >
            <option value="ALL">Toutes les déclarations</option>
            <option value="PENDING">En attente / En cours</option>
            <option value="RESOLU">Réparées (Résolu)</option>
            <option value="FOURNISSEUR">Chez le fournisseur</option>
          </select>
        </div>

        <div className="space-y-6">
          {signalements.filter(s => {
            if (filterStatut === 'ALL') return true;
            if (filterStatut === 'PENDING') return ['SIGNALE', 'EN_COURS', 'CONSTAT'].includes(s.statut);
            if (filterStatut === 'RESOLU') return ['RESOLU', 'FERME'].includes(s.statut);
            if (filterStatut === 'FOURNISSEUR') return ['FOURNISSEUR', 'ECHANGE'].includes(s.statut);
            return s.statut === filterStatut;
          }).map((s) => {
            const isFixed = ['RESOLU', 'FERME'].includes(s.statut);
            return (
            <div key={s.id} className={`bg-white p-6 rounded-[2rem] border ${isFixed ? 'border-green-200 bg-green-50/30' : 'border-gray-100'} shadow-xl flex flex-col md:flex-row justify-between gap-6 group hover:border-red-100 transition-all`}>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`text-lg font-black flex items-center gap-2 ${isFixed ? 'text-green-900' : 'text-gray-900'}`}>
                      Panne N°{s.id}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-lg border ${isFixed ? 'text-green-600 bg-green-50 border-green-100' : 'text-gray-400 bg-gray-50 border-gray-100'}`}>
                        Signalée le {s.dateSignalement}
                      </span>
                    </h3>
                  </div>
                  {getStatusBadge(s.statut)}
                </div>

                <div className={`p-4 rounded-2xl border ${isFixed ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                  <p className="text-sm italic">"{s.description}"</p>
                </div>
              </div>

              <div className={`flex flex-col justify-center items-end border-t md:border-t-0 md:border-l ${isFixed ? 'border-green-100' : 'border-gray-100'} pt-4 md:pt-0 md:pl-6 min-w-[200px]`}>
                {s.statut === 'SIGNALE' ? (
                  <button 
                    onClick={() => handleAnnuler(s.id)}
                    className="px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl font-bold transition-all flex items-center gap-2 w-full justify-center"
                  >
                    <Trash2 size={18} />
                    Annuler signalement
                  </button>
                ) : (
                  <div className="text-center w-full">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Action indisponible</p>
                    <p className="text-[10px] text-gray-400 italic">En cours de traitement</p>
                  </div>
                )}
              </div>
            </div>
            );
          })}

          {signalements.filter(s => {
            if (filterStatut === 'ALL') return true;
            if (filterStatut === 'PENDING') return ['SIGNALE', 'EN_COURS', 'CONSTAT'].includes(s.statut);
            if (filterStatut === 'RESOLU') return ['RESOLU', 'FERME'].includes(s.statut);
            if (filterStatut === 'FOURNISSEUR') return ['FOURNISSEUR', 'ECHANGE'].includes(s.statut);
            return s.statut === filterStatut;
          }).length === 0 && (
            <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
              <CheckCircle className="mx-auto text-green-200 mb-4" size={64} />
              <p className="text-gray-500 font-bold text-xl">Vous n'avez aucune déclaration de panne.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignalementsPage;
