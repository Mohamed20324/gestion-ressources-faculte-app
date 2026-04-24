import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Loader, CheckCircle, Package, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

const MaintenancePage = () => {
  const { notifications, removeNotification } = useNotifications();
  const [signalements, setSignalements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSignalements = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await api.getSignalementsByFournisseur(user.id);
      if (res.ok) {
        const data = await res.json();
        setSignalements(data.sort((a: any, b: any) => b.id - a.id));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSignalements();
  }, [loadSignalements]);

  if (loading && signalements.length === 0) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader className="animate-spin text-purple-600 mb-4" size={48} />
      <p className="text-gray-500 font-bold">Chargement des demandes de garantie...</p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Package className="text-purple-600" size={36} />
            Service Après-Vente
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Consultez les demandes de réparation et d'échange sous garantie.</p>
        </div>

        <div className="space-y-6">
          {signalements.map((s) => (
            <div key={s.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col md:flex-row justify-between gap-6 group hover:border-purple-200 transition-all">
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-2">
                      Demande N°{s.id}
                      {s.statut === 'FOURNISSEUR' ? (
                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-widest">Réparation</span>
                      ) : (
                        <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-lg uppercase tracking-widest">Échange</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                      <span className="flex items-center gap-1"><Calendar size={14}/> Signalé le {s.dateSignalement}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <AlertTriangle size={14}/> Motif de la demande
                  </h4>
                  <p className="text-gray-700 text-sm font-medium italic">"{s.description}"</p>
                </div>
              </div>

              <div className="flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[250px]">
                  {s.statut === 'ECHANGE' && !s.dateLivraisonEchange ? (
                    <div className="w-full space-y-3">
                      <p className="text-sm text-purple-900 font-black mb-1">Planifier l'échange</p>
                      <div 
                        className="relative group/input cursor-pointer"
                        onClick={(e) => {
                          const input = e.currentTarget.querySelector('input');
                          if (input && 'showPicker' in input) {
                            (input as any).showPicker();
                          }
                        }}
                      >
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 group-hover/input:text-purple-600 transition-colors" size={18} />
                        <input 
                          type="date" 
                          className="w-full pl-10 pr-4 py-3 bg-purple-50/50 border-2 border-purple-100 rounded-2xl focus:border-purple-400 focus:bg-white outline-none text-sm font-black text-purple-900 transition-all cursor-pointer"
                          onChange={(e) => s._tempDate = e.target.value}
                        />
                      </div>
                      <button 
                        onClick={async () => {
                          if (!s._tempDate) return alert("Veuillez choisir une date");
                          const res = await api.programmerEchange(s.id, s._tempDate);
                          if (res.ok) {
                            alert("Échange programmé avec succès !");
                            loadSignalements();
                          }
                        }}
                        className="w-full bg-purple-600 text-white font-black py-3.5 rounded-2xl hover:bg-purple-700 transition-all text-xs uppercase tracking-widest shadow-lg shadow-purple-200 active:scale-95"
                      >
                        Confirmer la livraison
                      </button>
                    </div>
                  ) : s.dateLivraisonEchange ? (
                    <div className="text-center w-full bg-purple-50 p-4 rounded-2xl border border-purple-100">
                      <p className="text-xs font-black text-purple-600 uppercase tracking-widest mb-1">Livraison prévue le</p>
                      <p className="text-lg font-black text-purple-900">{s.dateLivraisonEchange}</p>
                      <p className="text-[10px] font-bold text-purple-400 mt-2">Dossier en attente de réception</p>
                    </div>
                  ) : (
                    <div className="text-center w-full">
                      <p className="text-sm text-gray-900 font-black mb-1">Dossier en cours</p>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">Veuillez traiter cette demande et prendre contact avec le responsable.</p>
                    </div>
                  )}
              </div>
            </div>
          ))}

          {signalements.length === 0 && (
            <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
              <CheckCircle className="mx-auto text-green-200 mb-4" size={64} />
              <p className="text-gray-500 font-bold text-xl">Aucune demande de SAV en cours.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
