import { useState, useEffect } from 'react';
import { 
  Package, Loader, CheckCircle, 
  Clock, Info, ChevronRight, Monitor, 
  Cpu, HardDrive, Zap, Printer, AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

const AffectationsPage = () => {
  const { user } = useAuth();
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [currentAffectations, setCurrentAffectations] = useState<any[]>([]);
  const [plannedAffectations, setPlannedAffectations] = useState<any[]>([]);
  const [typesRessources, setTypesRessources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [signalementModal, setSignalementModal] = useState({ show: false, resId: null as number | null });
  const [panneDescription, setPanneDescription] = useState('');

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const handleSignalement = async () => {
    if (!signalementModal.resId || !panneDescription) return;
    setLoading(true);
    try {
      const res = await api.createSignalement({
        ressourceId: signalementModal.resId,
        enseignantId: user.id,
        description: panneDescription,
        dateSignalement: new Date().toISOString().split('T')[0]
      });
      if (res.ok) {
        showNotification('success', 'Panne signalée avec succès au technicien.');
        setSignalementModal({ show: false, resId: null });
        setPanneDescription('');
      } else {
        showNotification('error', 'Erreur lors du signalement.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [affRes, besRes, typesRes] = await Promise.all([
        api.getAffectationsByEnseignant(user.id),
        api.getBesoinsByEnseignant(user.id),
        api.getAllTypesRessources()
      ]);

      if (affRes.ok) setCurrentAffectations(await affRes.json());
      if (besRes.ok) {
        const needs = await besRes.json();
        // Planned are needs that are VALIDE or ENVOYE (AO in progress)
        setPlannedAffectations(needs.filter((n: any) => n.statut === 'VALIDE' || n.statut === 'ENVOYE'));
      }
      if (typesRes.ok) setTypesRessources(await typesRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeName = (id: number) => typesRessources.find(t => t.id === id)?.libelle || 'Inconnu';

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader className="animate-spin text-purple-600 mb-4" size={48} />
      <p className="text-gray-500 font-bold">Chargement de vos ressources...</p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Package className="text-purple-600" size={36} />
            Mes Affectations de Ressources
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Consultez votre matériel actuel et les acquisitions prévues.</p>
        </div>

        {/* Planned Affectations (Future) */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Clock size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Affectations Prévues (En cours d'acquisition)</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plannedAffectations.map((p) => (
              <div key={p.id} className="bg-white rounded-[2rem] p-6 border border-blue-100 shadow-lg shadow-blue-50/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500"></div>
                
                <div className="relative">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {p.statut}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">#PLAN-{p.id}</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-4">{getTypeName(p.typeRessourceId)}</h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Zap size={14} className="text-blue-500" />
                      <span>Quantité : <span className="font-bold">{p.quantite}</span></span>
                    </div>
                    {p.marque && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Info size={14} className="text-blue-500" />
                        <span>Marque souhaitée : <span className="font-bold">{p.marque}</span></span>
                      </div>
                    )}
                    {p.categorie === 'ORDINATEUR' && (
                      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          <Cpu size={12} /> {p.cpu}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          <Monitor size={12} /> {p.ram} RAM
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {plannedAffectations.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 py-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium italic">Aucune acquisition prévue pour le moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* Current Affectations */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <CheckCircle size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Affectations Actuelles (Matériel en votre possession)</h2>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Matériel</th>
                  <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Date d'Affectation</th>
                  <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Type</th>
                  <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentAffectations.map((aff) => (
                   <tr key={aff.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 border border-green-100">
                          <Package size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{aff.ressourceMarque || 'Matériel'}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Inv: {aff.ressourceNumeroInventaire}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-gray-600">
                      {Array.isArray(aff.dateAffectation) ? `${aff.dateAffectation[2]}/${aff.dateAffectation[1]}/${aff.dateAffectation[0]}` : aff.dateAffectation}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider w-fit ${
                          aff.affectationCollective ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {aff.affectationCollective ? 'Stock Département' : 'Individuel'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium italic">{aff.ressourceCategorie}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSignalementModal({ show: true, resId: aff.ressourceId })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-1 text-xs font-bold"
                          title="Signaler une panne"
                        >
                          <AlertTriangle size={16} />
                          Signaler
                        </button>
                        <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {currentAffectations.length === 0 && (
              <div className="py-24 text-center">
                <Package className="mx-auto text-gray-200 mb-4" size={64} />
                <p className="text-gray-500 font-bold">Aucun matériel affecté pour le moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* Signalement Modal */}
        {signalementModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <AlertTriangle className="text-red-600" />
                Signaler une Panne
              </h3>
              
              <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-xs font-bold text-red-700">Ressource : RESS-{signalementModal.resId}</p>
              </div>

              <textarea 
                value={panneDescription}
                onChange={(e) => setPanneDescription(e.target.value)}
                placeholder="Décrivez le problème rencontré..."
                className="w-full h-32 p-6 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-medium transition-all mb-8 resize-none"
              />

              <div className="flex gap-4">
                <button 
                  onClick={() => setSignalementModal({ show: false, resId: null })}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSignalement}
                  disabled={!panneDescription || loading}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50"
                >
                  Signaler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AffectationsPage;
