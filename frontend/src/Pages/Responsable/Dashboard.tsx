import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    TrendingUp, TrendingDown, Users, CheckSquare, Clock,
    Calendar, Download, RefreshCw, MoreVertical, Star,
    Activity, Briefcase, Award, FileText, Loader, Zap,
    ShieldCheck, Database, Globe, ChevronRight
} from 'lucide-react';

// Données pour les graphiques
const weeklyData = [
    { name: 'Lun', tâches: 12, complétées: 8, enCours: 4 },
    { name: 'Mar', tâches: 15, complétées: 10, enCours: 5 },
    { name: 'Mer', tâches: 18, complétées: 14, enCours: 4 },
    { name: 'Jeu', tâches: 14, complétées: 11, enCours: 3 },
    { name: 'Ven', tâches: 20, complétées: 16, enCours: 4 },
    { name: 'Sam', tâches: 8, complétées: 6, enCours: 2 },
    { name: 'Dim', tâches: 5, complétées: 4, enCours: 1 },
];

const teamPerformance = [
    { name: 'Expl.', tâches: 24, complétées: 22, efficacité: 92 },
    { name: 'Opt.', tâches: 28, complétées: 26, efficacité: 93 },
    { name: 'Maint.', tâches: 20, complétées: 18, efficacité: 90 },
    { name: 'Dev.', tâches: 32, complétées: 30, efficacité: 94 },
    { name: 'Log.', tâches: 26, complétées: 24, efficacité: 92 },
];

// Composant Carte statistique premium
const StatCard = ({ title, value, icon: Icon, trend, colorClass, gradient }: any) => (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-7 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-24 h-24 ${gradient} opacity-10 rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-500`}></div>
        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-gray-900 tracking-tighter">{value}</p>
                    {trend && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {trend > 0 ? '+' : ''}{trend}%
                        </span>
                    )}
                </div>
                <div className="mt-4 flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${trend > 0 ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Mise à jour réelle</p>
                </div>
            </div>
            <div className={`p-4 rounded-2xl ${colorClass} shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

// Composant Graphique à barres premium
const BarChartComponent = () => (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-8 border border-gray-100 h-full">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                   <Activity className="text-purple-600" size={20} />
                   Activité Hebdomadaire
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Analyse des flux de travail</p>
            </div>
            <div className="flex gap-2">
                <button className="p-2 bg-gray-50 text-gray-400 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all border border-gray-100"><Download size={16} /></button>
                <button className="p-2 bg-gray-900 text-white hover:bg-gray-800 rounded-xl transition-all shadow-lg shadow-gray-200"><RefreshCw size={16} /></button>
            </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#6366F1" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                    cursor={{fill: '#F3F4F6', radius: 8}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}} />
                <Bar dataKey="tâches" fill="url(#barGradient)" name="Assigné" radius={[6, 6, 0, 0]} barSize={20} />
                <Bar dataKey="complétées" fill="url(#barGradientActive)" name="Terminé" radius={[6, 6, 0, 0]} barSize={20} />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

// Composant Graphique circulaire premium
const PersonnelPieChart = ({ stats }: { stats: any }) => {
    const data = [
        { name: 'Enseignants', value: stats.totalTeachers, color: '#8B5CF6' },
        { name: 'Chefs Dépt.', value: stats.totalChefs, color: '#3B82F6' },
        { name: 'Techniciens', value: stats.totalTechnicians, color: '#10B981' },
        { name: 'Admin', value: stats.totalDepartements, color: '#F59E0B' },
    ];

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-8 border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Users className="text-blue-600" size={20} />
                        Répartition Effectifs
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Structure organisationnelle</p>
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
                <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                            strokeWidth={0}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                    </PieChart>
                </ResponsiveContainer>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-all">
                            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight truncate">{item.name}</p>
                                <p className="text-sm font-black text-gray-900">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Composant Besoins Récents premium
const RecentTasks = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRecentBesoins = async () => {
            try {
                const response = await api.getAllBesoins();
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setTasks(data.slice(-6).reverse());
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadRecentBesoins();
    }, []);

    return (
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-10 border border-gray-100">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Zap className="text-yellow-500 fill-yellow-500" size={24} />
                        Dernières Demandes
                    </h3>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Flux de procurement en temps réel</p>
                </div>
                <button className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">Tout gérer</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-10"><Loader className="animate-spin text-blue-600" size={32} /></div>
                ) : tasks.map((task) => (
                    <div key={task.id} className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/5 rounded-bl-[2rem] group-hover:bg-blue-600/10 transition-colors"></div>
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-md border border-gray-100 group-hover:scale-110 transition-transform">
                                <FileText size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">ID #{task.id}</span>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                        task.statut === 'VALIDE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>{task.statut}</span>
                                </div>
                                <h4 className="text-sm font-black text-gray-900 truncate mb-1">{task.typeRessource || 'Equipement'}</h4>
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} className="text-gray-400" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{task.departementNom || 'Dpt Info'}</span>
                                    </div>
                                    <span className="text-xs font-black text-gray-900">x{task.quantite}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalBesoins: 0,
        completedBesoins: 0,
        totalRessources: 0,
        totalDepartements: 0,
        totalTeachers: 0,
        totalChefs: 0,
        totalTechnicians: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const safeFetch = async (apiCall: any) => {
                    try {
                        const res = await apiCall();
                        if (res.ok) return await res.json();
                        return [];
                    } catch (e) { return []; }
                };

                const [besoins, ressources, depts, teachers, chefs, techs] = await Promise.all([
                    safeFetch(() => api.getAllBesoins()),
                    safeFetch(() => api.getAllRessources()),
                    safeFetch(() => api.getAllDepartements()),
                    safeFetch(() => api.getUsersByRole('ENSEIGNANT')),
                    safeFetch(() => api.getUsersByRole('CHEF_DEPARTEMENT')),
                    safeFetch(() => api.getUsersByRole('TECHNICIEN'))
                ]);

                setStats({
                    totalBesoins: besoins.length,
                    completedBesoins: besoins.filter((b: any) => b.valider).length,
                    totalRessources: ressources.length,
                    totalDepartements: depts.length,
                    totalTeachers: teachers.length,
                    totalChefs: chefs.length,
                    totalTechnicians: techs.length,
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-6">
                <div className="relative">
                    <div className="w-20 h-20 border-8 border-gray-100 border-t-purple-600 rounded-full animate-spin"></div>
                    <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-600" size={28} />
                </div>
                <p className="text-gray-400 font-black tracking-widest uppercase text-xs">Synchronisation des données...</p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50/30 min-h-full pb-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Tableau de Bord</h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                        <Globe size={14} className="text-blue-500" />
                        Infrastructure & Ressources
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-white p-3 rounded-[1.5rem] border border-gray-100 shadow-xl shadow-gray-200/40">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Système</p>
                        <p className="text-sm font-black text-gray-900">Sécurisé & Optimisé</p>
                    </div>
                    <div className="h-10 w-px bg-gray-100 mx-2"></div>
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><ChevronRight size={20} /></button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <StatCard
                    title="Besoins Actifs"
                    value={stats.totalBesoins}
                    icon={FileText}
                    trend={12}
                    colorClass="bg-purple-600 text-white"
                    gradient="bg-purple-600"
                />
                <StatCard
                    title="Procurements"
                    value={stats.completedBesoins}
                    icon={CheckSquare}
                    trend={8}
                    colorClass="bg-emerald-500 text-white"
                    gradient="bg-emerald-500"
                />
                <StatCard
                    title="Inventaire Total"
                    value={stats.totalRessources}
                    icon={Database}
                    trend={-2}
                    colorClass="bg-blue-600 text-white"
                    gradient="bg-blue-600"
                />
                <StatCard
                    title="Départements"
                    value={stats.totalDepartements}
                    icon={Briefcase}
                    trend={5}
                    colorClass="bg-orange-500 text-white"
                    gradient="bg-orange-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                <div className="lg:col-span-8">
                    <BarChartComponent />
                </div>
                <div className="lg:col-span-4">
                    <PersonnelPieChart stats={stats} />
                </div>
            </div>

            {/* Recent Items Section */}
            <RecentTasks />

            {/* Premium Footer Metrics */}
            <div className="mt-12 bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 border border-white/10 backdrop-blur-md">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Efficacité Globale</p>
                            <p className="text-xl font-black">{stats.totalBesoins > 0 ? Math.round((stats.completedBesoins / stats.totalBesoins) * 100) : 0}% <span className="text-xs text-blue-400 font-bold ml-1">Excellent</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-5 border-l border-white/5 pl-8">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-purple-400 border border-white/10 backdrop-blur-md">
                            <Star size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score de l'équipe</p>
                            <p className="text-xl font-black">9.8 <span className="text-xs text-purple-400 font-bold ml-1">/ 10</span></p>
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        <button className="px-10 py-4 bg-white text-gray-900 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl shadow-black/20 active:scale-95">Exporter le Rapport</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;