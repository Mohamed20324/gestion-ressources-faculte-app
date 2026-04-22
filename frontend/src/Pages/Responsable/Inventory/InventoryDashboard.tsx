import { useState, useEffect } from 'react';
import { 
  Package, Truck, Wrench, 
  Monitor, Printer, Activity,
  AlertTriangle, CheckCircle, Search,
  Loader, MoreVertical, ChevronRight, Filter,
  Clock, Bell
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from 'recharts';
import { api } from '../../../services/api';

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor, subValue }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
            <div>
                <p className="text-sm text-gray-500 mb-1 font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                {subValue && (
                  <p className="text-xs text-gray-400 mt-1 font-bold">{subValue}</p>
                )}
                {trend && (
                    <div className="flex items-center gap-1 mt-2 text-red-500 bg-red-50 px-2 py-1 rounded-lg w-fit">
                        <AlertTriangle size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{trend}</span>
                    </div>
                )}
            </div>
            <div className={`p-4 rounded-2xl ${bgColor} group-hover:scale-110 transition-transform`}>
                <Icon size={28} className={color} />
            </div>
        </div>
        <div className={`absolute bottom-0 left-0 w-full h-1 ${color.replace('text-', 'bg-')} opacity-20`}></div>
    </div>
);

const InventoryDashboard = () => {
  const [stats, setStats] = useState({
    totalResources: 0,
    operational: 0,
    broken: 0,
    underMaintenance: 0,
    inDelivery: 0,
    delayedDeliveries: 0
  });
  const [loading, setLoading] = useState(true);
  const [reunionsData, setReunionsData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Resources stats
      const res = await api.getAllRessources();
      const resources = await res.json();
      
      // 2. Delivery stats & Delay Check
      const offersRes = await fetch('http://localhost:8081/api/offres', { 
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')!).accessToken}` } 
      });
      let inDeliveryCount = 0;
      let delayCount = 0;
      
      if (offersRes.ok) {
        const allOffres = await offersRes.json();
        const activeDeliveries = allOffres.filter((o: any) => o.statut === 'ACCEPTEE');
        inDeliveryCount = activeDeliveries.length;
        
        // Check for delays
        const today = new Date();
        for (const offer of activeDeliveries) {
          if (offer.dateLivraison) {
            const deliveryDate = Array.isArray(offer.dateLivraison) 
              ? new Date(offer.dateLivraison[0], offer.dateLivraison[1] - 1, offer.dateLivraison[2])
              : new Date(offer.dateLivraison);
            
            if (deliveryDate < today) {
              delayCount++;
              // Auto-inform supplier via notification (simplified logic: ideally check if already sent)
              await api.createNotification({
                titre: "Retard de livraison",
                message: `L'offre #OFR-${offer.id} pour l'appel d'offres ${offer.appelOffreReference} est en retard. Merci de livrer les ressources dès que possible.`,
                date: new Date(),
                lu: false,
                type: "URGENT",
                utilisateurId: offer.fournisseurId
              });
            }
          }
        }
      }
      
      setStats({
        totalResources: resources.length,
        operational: resources.filter((r: any) => r.statut === 'FONCTIONNELLE').length,
        broken: resources.filter((r: any) => r.statut === 'EN_PANNE').length,
        underMaintenance: resources.filter((r: any) => r.statut === 'EN_MAINTENANCE').length,
        inDelivery: inDeliveryCount,
        delayedDeliveries: delayCount
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statusData = [
    { name: 'Opérationnel', value: stats.operational, color: '#10B981' },
    { name: 'En Panne', value: stats.broken, color: '#EF4444' },
    { name: 'Maintenance', value: stats.underMaintenance, color: '#3B82F6' }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader className="animate-spin text-blue-600" size={48} />
        <p className="text-gray-500 font-bold animate-pulse">Synchronisation de l'inventaire...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <Package className="text-blue-600" size={32} />
                Inventaire & Livraisons
              </h1>
              <p className="text-gray-500 mt-2 font-medium">Surveillance du parc, gestion des pannes et suivi logistique.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input placeholder="Rechercher une ressource ou un bon..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all" />
              </div>
              <button className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 shadow-sm transition-colors">
                  <Filter size={22} className="text-gray-500" />
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
            title="Ressources Totales" 
            value={stats.totalResources} 
            icon={Package} 
            color="text-blue-600" 
            bgColor="bg-blue-50" 
            subValue="Enregistrées dans le parc"
        />
        <StatCard 
            title="En Livraison" 
            value={stats.inDelivery} 
            icon={Truck} 
            color="text-orange-600" 
            bgColor="bg-orange-50" 
            subValue="Livraisons attendues"
            trend={stats.delayedDeliveries > 0 ? `${stats.delayedDeliveries} en retard` : null}
        />
        <StatCard 
            title="Opérationnelles" 
            value={stats.operational} 
            icon={CheckCircle} 
            color="text-green-600" 
            bgColor="bg-green-50" 
            subValue={`${Math.round((stats.operational/stats.totalResources)*100) || 0}% de disponibilité`}
        />
        <StatCard 
            title="Critiques / Panne" 
            value={stats.broken} 
            icon={AlertTriangle} 
            trend={stats.broken > 0 ? `${stats.broken} Alertes` : null}
            color="text-red-600" 
            bgColor="bg-red-50" 
            subValue="Nécessite une intervention"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Health Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-8">
            <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Santé du Parc</h3>
            <Activity className="text-gray-300" size={20} />
          </div>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-gray-900">{stats.totalResources}</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 w-full mt-8">
            {statusData.map(item => (
              <div key={item.name} className="flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: item.color}}></div>
                  <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-sm font-black text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Hardware Types */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Répartition Logistique</h3>
              <MoreVertical size={20} className="text-gray-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center gap-5 group hover:bg-blue-50 transition-colors">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-lg shadow-blue-100/50 group-hover:scale-110 transition-transform">
                  <Monitor size={28} />
                </div>
                <div>
                  <p className="text-base font-black text-gray-900">Parc Actif</p>
                  <p className="text-xs text-blue-600 font-black uppercase tracking-widest mt-1">{stats.operational} Unités OK</p>
                </div>
              </div>
              <div className="p-6 bg-orange-50/50 rounded-3xl border border-orange-100 flex items-center gap-5 group hover:bg-orange-50 transition-colors">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-lg shadow-orange-100/50 group-hover:scale-110 transition-transform">
                  <Truck size={28} />
                </div>
                <div>
                  <p className="text-base font-black text-gray-900">En Livraison</p>
                  <p className="text-xs text-orange-600 font-black uppercase tracking-widest mt-1">{stats.inDelivery} En Attente</p>
                </div>
              </div>
              <div className="p-6 bg-red-50/50 rounded-3xl border border-red-100 flex items-center gap-5 group hover:bg-red-50 transition-colors">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-lg shadow-red-100/50 group-hover:scale-110 transition-transform">
                  <AlertTriangle size={28} />
                </div>
                <div>
                  <p className="text-base font-black text-gray-900">Alertes Retard</p>
                  <p className="text-xs text-red-600 font-black uppercase tracking-widest mt-1">{stats.delayedDeliveries} Fournisseurs Relancés</p>
                </div>
              </div>
              <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex items-center gap-5 group hover:bg-indigo-50 transition-colors">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-100/50 group-hover:scale-110 transition-transform">
                  <Bell size={28} />
                </div>
                <div>
                  <p className="text-base font-black text-gray-900">Relances Auto</p>
                  <p className="text-xs text-indigo-600 font-black uppercase tracking-widest mt-1">Activé</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Delays / Receptions */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Suivi des Livraisons Critiques</h3>
                <button className="text-xs text-blue-600 font-black hover:underline flex items-center gap-2 uppercase tracking-widest">
                    Portail Réception <ChevronRight size={16} />
                </button>
            </div>
            <div className="divide-y divide-gray-50">
              {stats.delayedDeliveries > 0 ? (
                <div className="p-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Clock size={32} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-gray-900">{stats.delayedDeliveries} Livraisons en retard</p>
                    <p className="text-sm text-gray-500 font-medium">Les fournisseurs ont été informés automatiquement.</p>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle size={32} />
                  </div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Toutes les livraisons sont dans les délais</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;


