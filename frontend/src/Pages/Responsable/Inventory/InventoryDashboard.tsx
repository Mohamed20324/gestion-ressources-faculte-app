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

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {trend && (
                    <div className="flex items-center gap-1 mt-2 text-red-500 bg-red-50 px-2 py-1 rounded-lg w-fit">
                        <AlertTriangle size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{trend}</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-lg ${bgColor}`}>
                <Icon size={24} className={color} />
            </div>
        </div>
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventaire & Livraisons</h1>
              <p className="text-gray-500 mt-1">Surveillance du parc, gestion des pannes et suivi logistique.</p>
          </div>
          <div className="flex items-center gap-3">
              <button className="p-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <Filter size={20} className="text-gray-500" />
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
            title="Ressources Totales" 
            value={stats.totalResources} 
            icon={Package} 
            color="text-blue-600" 
            bgColor="bg-blue-50" 
        />
        <StatCard 
            title="En Livraison" 
            value={stats.inDelivery} 
            icon={Truck} 
            color="text-orange-600" 
            bgColor="bg-orange-50" 
            trend={stats.delayedDeliveries > 0 ? `${stats.delayedDeliveries} en retard` : null}
        />
        <StatCard 
            title="Opérationnelles" 
            value={stats.operational} 
            icon={CheckCircle} 
            color="text-green-600" 
            bgColor="bg-green-50" 
        />
        <StatCard 
            title="Critiques / Panne" 
            value={stats.broken} 
            icon={AlertTriangle} 
            trend={stats.broken > 0 ? `${stats.broken} Alertes` : null}
            color="text-red-600" 
            bgColor="bg-red-50" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Health Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
          <h3 className="font-bold text-gray-900 mb-8 w-full text-left">Santé du Parc</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-900">{stats.totalResources}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Total</span>
            </div>
          </div>
          <div className="space-y-3 w-full mt-4">
            {statusData.map(item => (
              <div key={item.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-sm font-medium text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Hardware Types */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-gray-900">Répartition Logistique</h3>
              <MoreVertical size={18} className="text-gray-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-4 hover:bg-blue-50 transition-colors">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                  <Monitor size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Parc Actif</p>
                  <p className="text-xs text-blue-600 font-bold">{stats.operational} Unités OK</p>
                </div>
              </div>
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 flex items-center gap-4 hover:bg-orange-50 transition-colors">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-orange-600 shadow-sm">
                  <Truck size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">En Livraison</p>
                  <p className="text-xs text-orange-600 font-bold">{stats.inDelivery} En Attente</p>
                </div>
              </div>
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 flex items-center gap-4 hover:bg-red-50 transition-colors">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-red-600 shadow-sm">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Alertes Retard</p>
                  <p className="text-xs text-red-600 font-bold">{stats.delayedDeliveries} Relances</p>
                </div>
              </div>
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center gap-4 hover:bg-indigo-50 transition-colors">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                  <Bell size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Relances Auto</p>
                  <p className="text-xs text-indigo-600 font-bold">Activé</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Delays / Receptions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Suivi des Livraisons Critiques</h3>
                <button className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1">
                    Portail Réception <ChevronRight size={16} />
                </button>
            </div>
            <div className="divide-y divide-gray-50">
              {stats.delayedDeliveries > 0 ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">{stats.delayedDeliveries} Livraisons en retard</p>
                    <p className="text-sm text-gray-500">Les fournisseurs ont été informés automatiquement.</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center space-y-4">
                  <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle size={24} />
                  </div>
                  <p className="text-sm font-medium text-gray-500">Toutes les livraisons sont dans les délais</p>
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


