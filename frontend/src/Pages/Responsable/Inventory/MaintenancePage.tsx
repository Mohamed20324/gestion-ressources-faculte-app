import { useState, useEffect } from 'react';
import { 
  Wrench, Loader, AlertTriangle, 
  CheckCircle, FileText, Phone,
  Truck, ShieldCheck, ShieldAlert,
  ChevronRight, Info, Search, Building2
} from 'lucide-react';
import { api } from '../../../services/api';
import { NotificationContainer } from '../../../components/Notification';
import { useNotifications } from '../../../hooks/useNotifications';

const MaintenancePage = () => {
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [signalements, setSignalements] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes, rRes] = await Promise.all([
        api.getAllSignalements(),
        fetch('http://localhost:8081/api/constats', { 
          headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')!).accessToken}` } 
        }),
        api.getAllRessources()
      ]);

      if (sRes.ok) setSignalements(await sRes.json());
      if (cRes.ok) setConstats(await cRes.json());
      if (rRes.ok) setResources(await rRes.json());
    } catch (error) {
      showNotification('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const getConstatForSignalement = (sigId: number) => {
    return constats.find(c => c.signalementId === sigId);
  };

  const getResourceForSignalement = (resId: number) => {
    return resources.find(r => r.id === resId);
  };

  const handleContactSupplier = async (sig: any) => {
    try {
      // Logic to "declare to supplier"
      // We could update signalement status to 'EN_REPARATION_EXTERNE'
      const res = await api.updateSignalement(sig.id, { ...sig, statut: 'CONTACT_FOURNISSEUR' });
      if (res.ok) {
        showNotification('success', 'Demande de prise en charge envoyée au fournisseur');
        loadData();
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader className="animate-spin text-red-600 mb-4" size={48} />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Chargement des pannes...</p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Wrench className="text-red-600" size={36} />
            Suivi Maintenance & Garantie
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Gérez les pannes escaladées et les interventions sous garantie.</p>
        </div>

        <div className="grid gap-8">
          {signalements.filter(s => s.statut !== 'RESOLU').map((s) => {
            const constat = getConstatForSignalement(s.id);
            const resource = getResourceForSignalement(s.ressourceId);
            
            const isUnderWarranty = resource?.dateFinGarantie && new Date(resource.dateFinGarantie) > new Date();
            const warrantyDate = resource?.dateFinGarantie || 'N/A';

            return (
              <div key={s.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden group">
                <div className="p-8 flex flex-col lg:flex-row justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100">
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-900">
                          {resource?.marque || 'Ressource'} {resource?.numeroInventaire && `(Inv #${resource.numeroInventaire})`}
                        </h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Signalé par: {s.enseignantNom || 'Enseignant'}</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-4">
                      <p className="text-sm font-medium text-gray-700 italic">"{s.description}"</p>
                    </div>

                    {constat && (
                      <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 mt-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10"><FileText size={48} /></div>
                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <CheckCircle size={14} /> Constat du Technicien
                        </h4>
                        <p className="text-sm font-bold text-blue-900 leading-relaxed mb-2">{constat.explication}</p>
                        <div className="flex items-center gap-4 text-[10px] font-black text-blue-400 uppercase">
                          <span>Origine: {constat.ordre}</span>
                          <span>Frequence: {constat.frequence}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-full lg:w-[300px] flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                    <div className="mb-6">
                      <div className={`flex items-center gap-2 mb-2 ${isUnderWarranty ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isUnderWarranty ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                        <span className="text-sm font-black uppercase tracking-tighter">
                          {isUnderWarranty ? 'Sous Garantie' : 'Garantie Expirée'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Fin : {warrantyDate}</p>
                    </div>

                    <div className="space-y-3">
                      {isUnderWarranty && s.statut !== 'CONTACT_FOURNISSEUR' ? (
                        <button 
                          onClick={() => handleContactSupplier(s)}
                          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-200"
                        >
                          <Phone size={18} />
                          Contacter Fournisseur
                        </button>
                      ) : (
                        <div className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-center text-xs uppercase tracking-widest border border-gray-100">
                          {s.statut === 'CONTACT_FOURNISSEUR' ? 'En attente Fournisseur' : 'Maintenance Interne'}
                        </div>
                      )}
                      <button className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold text-xs hover:bg-gray-50 transition-all">
                        Détails Intervention
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {signalements.filter(s => s.statut !== 'RESOLU').length === 0 && (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
              <CheckCircle className="mx-auto text-green-200 mb-4" size={64} />
              <p className="text-gray-500 font-bold text-xl">Aucun incident critique à signaler.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;


