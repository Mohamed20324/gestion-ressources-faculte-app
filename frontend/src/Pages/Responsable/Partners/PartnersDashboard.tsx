import { useState, useEffect } from 'react';
import { 
  Users, ShieldAlert, Award, 
  Building2, Star, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, Search,
  Loader, MoreVertical, ChevronRight, Filter
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell,
  Legend
} from 'recharts';
import { api } from '../../../services/api';

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {trend && (
                    <div className="flex items-center gap-1 mt-2 text-red-500">
                        <ShieldAlert size={14} />
                        <span className="text-xs font-medium">{trend} blacklist</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-lg ${bgColor}`}>
                <Icon size={24} className={color} />
            </div>
        </div>
    </div>
);

const PartnersDashboard = () => {
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    activeSuppliers: 0,
    blacklisted: 0,
    topBidders: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.getUsersByRole('FOURNISSEUR');
      const suppliers = await res.json();
      
      setStats({
        totalSuppliers: suppliers.length,
        activeSuppliers: suppliers.length - 1, 
        blacklisted: 1, 
        topBidders: [
          { name: 'ElectroPlus', val: 12 },
          { name: 'OfficeSmart', val: 8 },
          { name: 'TechSupply', val: 5 },
          { name: 'GlobalIT', val: 3 }
        ]
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center h-screen">
              <Loader className="animate-spin text-purple-600" size={48} />
          </div>
      );
  }

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
              <h1 className="text-2xl font-bold text-gray-900">Espace Partenaires</h1>
              <p className="text-gray-500 mt-1">Gestion et performance de vos fournisseurs.</p>
          </div>
          <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input placeholder="Rechercher un fournisseur..." className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
              </div>
              <button className="p-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50">
                  <Filter size={20} className="text-gray-500" />
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
            title="Fournisseurs Totaux" 
            value={stats.totalSuppliers} 
            icon={Users} 
            color="text-purple-600" 
            bgColor="bg-purple-50" 
        />
        <StatCard 
            title="Partenaires Actifs" 
            value={stats.activeSuppliers} 
            icon={CheckCircle} 
            color="text-green-600" 
            bgColor="bg-green-50" 
        />
        <StatCard 
            title="Sur Liste Noire" 
            value={stats.blacklisted} 
            icon={ShieldAlert} 
            trend={stats.blacklisted > 0 ? stats.blacklisted : null}
            color="text-red-600" 
            bgColor="bg-red-50" 
        />
        <StatCard 
            title="Top Partenaire" 
            value="ElectroPlus" 
            icon={Award} 
            color="text-orange-600" 
            bgColor="bg-orange-50" 
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-gray-900">Soumissions par Fournisseur</h3>
              <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={18} />
              </button>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topBidders}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="val" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                  {stats.topBidders.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#93C5FD'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <TrendingUp size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Performance Globale</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold">98%</span>
                <span className="text-green-400 font-bold">Satisfaction</span>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm">
                Le taux de conformité des livraisons a augmenté de 4% ce mois-ci. Les fournisseurs respectent mieux les délais.
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform" />
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Star className="text-orange-500" size={20} />
                    Meilleures Évaluations
                </h3>
            </div>
            <div className="space-y-4">
              {['ElectroPlus', 'OfficeSmart', 'TechSupply'].map((name, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-100">
                      #{i+1}
                    </div>
                    <span className="font-bold text-gray-900">{name}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= (5-i) ? "text-orange-500 fill-current" : "text-gray-200"} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersDashboard;


