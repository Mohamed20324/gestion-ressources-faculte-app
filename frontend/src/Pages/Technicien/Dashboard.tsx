import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import {
    AreaChart, Area, ResponsiveContainer,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
    Wrench, Package, AlertCircle, CheckCircle, 
    Activity, Loader, ChevronRight, Settings,
    Search, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {trend && (
                    <div className="flex items-center gap-1 mt-2 text-red-500">
                        <AlertCircle size={14} />
                        <span className="text-xs font-medium">{trend} critiques</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-lg ${bgColor}`}>
                <Icon size={24} className={color} />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalResources: 0,
        pendingInterventions: 0,
        faultyResources: 0,
        maintenanceHistory: [
            { name: 'Jan', count: 4 },
            { name: 'Fév', count: 7 },
            { name: 'Mar', count: 5 },
            { name: 'Avr', count: 12 },
            { name: 'Mai', count: 8 },
        ]
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ressourcesRes] = await Promise.all([
                    api.getAllRessources()
                ]);

                if (ressourcesRes.ok) {
                    const ressources = await ressourcesRes.json();
                    
                    // Simple logic for stats based on inventory
                    setStats(prev => ({
                        ...prev,
                        totalResources: ressources.length,
                        faultyResources: ressources.filter((r: any) => r.panne).length,
                        pendingInterventions: 5 // Mocking interventions
                    }));
                }
            } catch (error) {
                console.error("Error fetching technicien dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50/30 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Espace Technique</h1>
                    <p className="text-gray-500">Gestion de la maintenance et du parc informatique.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <Search size={20} className="text-gray-500" />
                    </button>
                    <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <Filter size={20} className="text-gray-500" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Parc Total" 
                    value={stats.totalResources} 
                    icon={Package} 
                    color="text-blue-600" 
                    bgColor="bg-blue-50" 
                />
                <StatCard 
                    title="En Panne" 
                    value={stats.faultyResources} 
                    icon={AlertCircle} 
                    color="text-red-600" 
                    bgColor="bg-red-50" 
                    trend={stats.faultyResources > 5 ? stats.faultyResources : null}
                />
                <StatCard 
                    title="Interventions" 
                    value={stats.pendingInterventions} 
                    icon={Wrench} 
                    color="text-orange-600" 
                    bgColor="bg-orange-50" 
                />
                <StatCard 
                    title="Taux Disponibilité" 
                    value="92%" 
                    icon={CheckCircle} 
                    color="text-green-600" 
                    bgColor="bg-green-50" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-gray-900">Maintenance et Réparations</h3>
                                <p className="text-sm text-gray-500">Suivi des interventions mensuelles</p>
                            </div>
                        </div>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.maintenanceHistory}>
                                    <defs>
                                        <linearGradient id="colorMaintenance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="count" stroke="#3B82F6" fillOpacity={1} fill="url(#colorMaintenance)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Dernières Alertes</h3>
                            <button className="text-sm text-blue-600 font-medium hover:underline">Voir l'historique</button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                                            <AlertCircle size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Panne signalée - Imprimante LaserJet</p>
                                            <p className="text-xs text-gray-500">Département Informatique - Bloc A</p>
                                        </div>
                                    </div>
                                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                        <Settings size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Activity size={18} className="text-green-500" />
                            Santé du Système
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-500 uppercase">Utilisation CPU</span>
                                    <span className="text-xs font-bold text-gray-900">24%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full w-[24%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-500 uppercase">Stockage Libre</span>
                                    <span className="text-xs font-bold text-gray-900">68%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full w-[68%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-4">Besoin d'aide ?</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Consultez la documentation technique ou contactez le support administrateur.
                            </p>
                            <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                Contacter le support
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Wrench size={100} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
