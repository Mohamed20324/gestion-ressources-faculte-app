import { useState, useEffect } from 'react';
import { 
  Wrench, Loader, FileText, CheckCircle, 
  Send, RefreshCw, AlertTriangle, Box, ShieldCheck, ShieldAlert,
  Package
} from 'lucide-react';
import { api } from '../../../services/api';
import { NotificationContainer } from '../../../components/Notification';
import { useNotifications } from '../../../hooks/useNotifications';

const MaintenancePage = () => {
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [signalements, setSignalements] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [constats, setConstats] = useState<any[]>([]);
  const [techniciens, setTechniciens] = useState<any[]>([]);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [filterStatut, setFilterStatut] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, rRes, cRes] = await Promise.all([
        api.getAllSignalements(),
        api.getAllRessources(),
        api.getAllConstats()
      ]);

      if (sRes.ok) {
        const data = await sRes.json();
        setSignalements(data.sort((a: any, b: any) => b.id - a.id));
      }
      if (rRes.ok) setResources(await rRes.json());
      if (cRes.ok) setConstats(await cRes.json());

      const techRes = await fetch('http://localhost:8081/api/utilisateurs/role/TECHNICIEN', {
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').accessToken}` }
      });
      if (techRes.ok) {
        setTechniciens(await techRes.json());
      }

      const fRes = await api.getUsersByRole('FOURNISSEUR');
      if (fRes.ok) {
        setFournisseurs(await fRes.json());
      }
    } catch (error) {
      console.error(error);
      showNotification('error', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleEnvoyerFournisseur = async (constatId: number) => {
    try {
      const res = await api.envoyerAuFournisseur(constatId);
      if (res.ok) {
        showNotification('success', 'Ressource envoyée au fournisseur. Il a été notifié.');
        loadData();
      }
    } catch (error) {
      console.error(error);
      showNotification('error', 'Erreur lors de l\'envoi');
    }
  };

  const handleDemanderEchange = async (constatId: number) => {
    try {
      const res = await api.demanderEchange(constatId);
      if (res.ok) {
        showNotification('success', 'Demande d\'échange envoyée au fournisseur.');
        loadData();
      }
    } catch (error) {
      console.error(error);
      showNotification('error', 'Erreur lors de la demande d\'échange');
    }
  };

  if (loading && signalements.length === 0) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader className="animate-spin text-purple-600 mb-4" size={48} />
      <p className="text-gray-500 font-bold">Chargement des rapports de maintenance...</p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Wrench className="text-purple-600" size={36} />
              Suivi Global Maintenance
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Suivez toutes les pannes, incluant les réparées et les demandes d'échange.</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all shadow-sm"
            >
              <option value="ALL">Toutes les pannes</option>
              <option value="PENDING">En attente / En cours</option>
              <option value="RESOLU">Réparées (Résolu)</option>
              <option value="FOURNISSEUR">Chez le fournisseur (En attente / Échange)</option>
            </select>
            <button 
              onClick={loadData}
              className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all text-gray-600 shadow-sm"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {signalements.filter(s => {
            if (filterStatut === 'ALL') return true;
            if (filterStatut === 'PENDING') return ['SIGNALE', 'EN_COURS', 'CONSTAT'].includes(s.statut);
            if (filterStatut === 'RESOLU') return ['RESOLU', 'FERME'].includes(s.statut);
            if (filterStatut === 'FOURNISSEUR') return ['FOURNISSEUR', 'ECHANGE'].includes(s.statut);
            return s.statut === filterStatut;
          }).map((s) => {
            const resource = resources.find(r => r.id === s.ressourceId);
            const constat = constats.find(c => c.signalementId === s.id);
            const isGarantieValide = resource?.dateFinGarantie && (
              Array.isArray(resource.dateFinGarantie)
                ? new Date(resource.dateFinGarantie[0], resource.dateFinGarantie[1] - 1, resource.dateFinGarantie[2]) >= new Date()
                : new Date(resource.dateFinGarantie) >= new Date()
            );
            
            const isFixedOrChanged = s.statut === 'RESOLU' || s.statut === 'ECHANGE';

            return (
              <div 
                key={s.id} 
                className={`rounded-[2.5rem] p-8 border shadow-xl flex flex-col md:flex-row justify-between gap-8 transition-all ${
                  isFixedOrChanged 
                    ? 'bg-emerald-50 border-emerald-200 shadow-emerald-100/50' 
                    : 'bg-white border-gray-100 hover:border-purple-200'
                }`}
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                        isFixedOrChanged ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-purple-50 text-purple-600 border-purple-100'
                      }`}>
                        {isFixedOrChanged ? <CheckCircle size={28} /> : <AlertTriangle size={28} />}
                      </div>
                      <div>
                        <h3 className={`text-lg font-black ${isFixedOrChanged ? 'text-emerald-900' : 'text-gray-900'}`}>
                          {resource?.marque || 'Ressource'} (Inv: {resource?.numeroInventaire})
                        </h3>
                        <p className={`text-sm font-medium ${isFixedOrChanged ? 'text-emerald-700' : 'text-gray-500'}`}>
                          Signalé le {Array.isArray(s.dateSignalement) ? `${s.dateSignalement[2]}/${s.dateSignalement[1]}/${s.dateSignalement[0]}` : s.dateSignalement}
                        </p>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                      s.statut === 'RESOLU' && s.statutEchange === 'ACCEPTEE' 
                        ? 'bg-blue-200 text-blue-800' 
                        : (isFixedOrChanged ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-100 text-gray-700')
                    }`}>
                      {s.statut === 'RESOLU' && s.statutEchange === 'ACCEPTEE' ? 'ÉCHANGE ACCEPTÉ' : s.statut}
                    </span>
                  </div>
                  
                  <div className={`p-4 rounded-2xl border italic text-sm ${
                    isFixedOrChanged ? 'bg-emerald-100/50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-100 text-gray-600'
                  }`}>
                     "{s.description}"
                  </div>

                  {constat && (() => {
                    const tech = techniciens.find(t => t.id === constat.technicienId);
                    const techName = tech ? `${tech.nom} ${tech.prenom}` : `Technicien #${constat.technicienId}`;
                    return (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-900">
                      <h4 className="text-xs font-black uppercase mb-2 flex items-center justify-between gap-2 text-blue-600">
                        <span className="flex items-center gap-2"><FileText size={14}/> Constat du Technicien</span>
                        <span className="text-[10px] bg-blue-100 px-2 py-1 rounded-md">Par : {techName}</span>
                      </h4>
                      <p className="text-sm italic mb-2">"{constat.explication}"</p>
                      <div className="flex gap-4 text-[10px] font-black uppercase">
                        <span>Fréquence: {constat.frequence}</span>
                        <span>Ordre: {constat.ordre}</span>
                      </div>
                    </div>
                  )})()}
                  
                  {resource && (
                    <div className="flex flex-wrap items-center gap-4">
                      <div className={`flex items-center gap-2 text-xs font-bold ${isGarantieValide ? 'text-green-600' : 'text-red-500'}`}>
                        {isGarantieValide ? <ShieldCheck size={16}/> : <ShieldAlert size={16}/>}
                        Garantie : {isGarantieValide ? 'Valide' : 'Expirée'} 
                        (Fin: {Array.isArray(resource.dateFinGarantie) ? `${resource.dateFinGarantie[2]}/${resource.dateFinGarantie[1]}/${resource.dateFinGarantie[0]}` : resource.dateFinGarantie || 'N/A'})
                      </div>
                      {(resource.fournisseurNom || fournisseurs.find(f => f.id === resource.fournisseurId)) && (
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                           <Package size={14} />
                           Fournisseur: {resource.fournisseurNom || fournisseurs.find(f => f.id === resource.fournisseurId)?.nomSociete || fournisseurs.find(f => f.id === resource.fournisseurId)?.nom}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {s.statut === 'CONSTAT' && constat && (
                  <div className="flex flex-col gap-3 justify-center min-w-[250px] border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                    <p className="text-xs text-center font-bold text-gray-400 uppercase tracking-widest mb-2">Actions Requises</p>
                    <button 
                      onClick={() => handleEnvoyerFournisseur(constat.id)}
                      className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200 w-full"
                    >
                      <Send size={18} />
                      Renvoyer réparation
                    </button>
                    <button 
                      onClick={() => handleDemanderEchange(constat.id)}
                      disabled={!isGarantieValide}
                      title={!isGarantieValide ? "La garantie est expirée" : ""}
                      className="px-6 py-4 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw size={18} />
                      Demander Échange
                    </button>
                    {!isGarantieValide && (
                      <p className="text-[10px] text-center text-red-500 font-bold mt-1">Échange impossible (Garantie expirée)</p>
                    )}
                  </div>
                )}
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
            <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
              <CheckCircle className="mx-auto text-green-200 mb-4" size={64} />
              <p className="text-gray-500 font-bold text-xl">Aucune panne répertoriée.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;


