import { useState, useEffect } from 'react';
import { 
  Users, ShieldAlert, Award, 
  Building2, Star, TrendingUp, 
  AlertCircle, CheckCircle, Search
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { api } from '../../services/api';

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
        activeSuppliers: suppliers.length - 2, // Simulated
        blacklisted: 2, // Simulated
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

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Tableau de Bord Partenaires</h1>
        <p className="text-gray-500 font-medium">Gestion et performance des fournisseurs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
            <Users size={24} />
          </div>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Partenaires Totaux</p>
          <h2 className="text-3xl font-black text-gray-900 mt-1">{stats.totalSuppliers}</h2>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-4">
            <CheckCircle size={24} />
          </div>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Actifs</p>
          <h2 className="text-3xl font-black text-gray-900 mt-1">{stats.activeSuppliers}</h2>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-4">
            <ShieldAlert size={24} />
          </div>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Liste Noire</p>
          <h2 className="text-3xl font-black text-gray-900 mt-1">{stats.blacklisted}</h2>
          <div className="flex items-center gap-1 text-red-500 text-xs font-bold mt-2">
            <AlertCircle size={14} /> Attention requise
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
            <Award size={24} />
          </div>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Top Partenaire</p>
          <h2 className="text-3xl font-black text-gray-900 mt-1">ElectroPlus</h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
          <h3 className="text-xl font-black text-gray-900 mb-8">Nombre d'Offres Soumises</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topBidders}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontWeight: 'bold', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontWeight: 'bold', fontSize: 12}} />
              <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="val" fill="#3B82F6" radius={[10, 10, 0, 0]}>
                {stats.topBidders.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#93C5FD'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <TrendingUp className="absolute top-4 right-4 opacity-10" size={120} />
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-4">Performance Globale</h3>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-black">98%</span>
                <span className="text-green-400 font-bold mb-2">Satisfaction</span>
              </div>
              <p className="text-gray-400 font-medium leading-relaxed">
                Le taux de conformité des livraisons est en hausse de 4% par rapport au trimestre dernier.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Star className="text-amber-500" size={24} />
              Partenaires les mieux notés
            </h3>
            <div className="space-y-4">
              {['ElectroPlus', 'OfficeSmart', 'TechSupply'].map((name, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="font-bold text-gray-900">{name}</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= (5-i) ? "text-amber-500 fill-current" : "text-gray-300"} />)}
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
