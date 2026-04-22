import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import {
    BarChart, Bar, ResponsiveContainer,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
    FileText, Package, Video, CheckCircle,
    Clock, TrendingUp, Activity, Loader, Calendar,
    ChevronRight, ArrowUpRight, Zap, Award, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor, gradient }: any) => (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-7 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-24 h-24 ${gradient} opacity-5 rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-500`}></div>
        <div className="flex items-center justify-between relative z-10">
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-gray-900 tracking-tighter">{value}</p>
                    {trend && (
                        <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold">
                            <TrendingUp size={12} />
                            <span>+{trend}%</span>
                        </div>
                    )}
                </div>
            </div>
            <div className={`p-4 rounded-2xl ${bgColor} ${color} shadow-lg shadow-current/5 group-hover:rotate-6 transition-transform`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        needsCount: 0,
        assignmentsCount: 0,
        nextMeeting: null as any,
        needsHistory: [
            { name: 'Jan', count: 2 },
            { name: 'Fév', count: 5 },
            { name: 'Mar', count: 3 },
            { name: 'Avr', count: 8 },
        ]
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const [besoinsRes, affectationsRes, reunionsRes] = await Promise.all([
                    api.getAllBesoins(),
                    api.getAllRessources(),
                    api.getAllReunions()
                ]);

                if (besoinsRes.ok && affectationsRes.ok && reunionsRes.ok) {
                    const besoins = await besoinsRes.json();
                    const affectations = await affectationsRes.json();
                    const reunions = await reunionsRes.json();

                    const myBesoins = besoins.filter((b: any) => b.enseignantId === user.id);
                    const myAffectations = affectations.slice(0, 3);

                    const next = reunions
                        .filter((m: any) => m.statut === 'PLANIFIEE')
                        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

                    setStats(prev => ({
                        ...prev,
                        needsCount: myBesoins.length,
                        assignmentsCount: myAffectations.length,
                        nextMeeting: next
                    }));
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
                <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-gray-400 font-black tracking-widest uppercase text-xs">Préparation de votre espace...</p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50/30 min-h-full pb-10">
            {/* Greeting Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Bonjour, {user?.prenom} 👋</h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Votre tableau de bord académique</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Compte Actif</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <StatCard 
                    title="Mes Demandes" 
                    value={stats.needsCount} 
                    icon={FileText} 
                    color="text-purple-600" 
                    bgColor="bg-purple-50" 
                    gradient="bg-purple-600"
                    trend={15} 
                />
                <StatCard 
                    title="Matériel Affecté" 
                    value={stats.assignmentsCount} 
                    icon={Package} 
                    color="text-blue-600" 
                    bgColor="bg-blue-50" 
                    gradient="bg-blue-600"
                />
                <StatCard 
                    title="Taux de Succès" 
                    value="88%" 
                    icon={Award} 
                    color="text-emerald-600" 
                    bgColor="bg-emerald-50" 
                    gradient="bg-emerald-600"
                />
                <StatCard 
                    title="Prochain RDV" 
                    value={stats.nextMeeting ? "1" : "0"} 
                    icon={Calendar} 
                    color="text-orange-600" 
                    bgColor="bg-orange-50" 
                    gradient="bg-orange-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    {/* Activity Chart */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50">
                        <div className="flex items-center justify-between mb-10">
                           <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                               <Activity className="text-purple-600" size={24} />
                               Historique des Besoins
                           </h3>
                           <div className="px-4 py-1.5 bg-gray-50 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">Derniers 6 mois</div>
                        </div>
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.needsHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold'}} />
                                    <Tooltip 
                                        cursor={{fill: '#F3F4F6', radius: 8}}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Activities List */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <Zap className="text-yellow-500 fill-yellow-500" size={24} />
                                Activités Récentes
                            </h3>
                            <button className="text-xs font-black text-purple-600 uppercase tracking-widest hover:underline flex items-center gap-1 group">
                                Voir Tout <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-2xl hover:bg-white hover:shadow-xl hover:border-purple-100 border border-transparent transition-all group cursor-pointer">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-gray-100 group-hover:rotate-6 transition-transform">
                                            <FileText size={20} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900">Demande de matériel enregistrée</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Matériel : Laptop High Performance</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-lg">Approuvé</p>
                                        <p className="text-[10px] text-gray-400 font-bold mt-1">Il y a 2h</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-10">
                    {/* Next Meeting Feature Card */}
                    <div className="bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-10 tracking-tight">Réunion à Venir</h3>
                            {stats.nextMeeting ? (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-5 bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10">
                                        <Calendar size={28} className="text-purple-200" />
                                        <div>
                                            <p className="text-[10px] font-black text-purple-200 uppercase tracking-widest">Date prévue</p>
                                            <p className="text-lg font-black tracking-tight">{new Date(stats.nextMeeting.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5 bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10">
                                        <Clock size={28} className="text-purple-200" />
                                        <div>
                                            <p className="text-[10px] font-black text-purple-200 uppercase tracking-widest">Heure de session</p>
                                            <p className="text-lg font-black tracking-tight">{stats.nextMeeting.heure}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => navigate('/enseignant/meetings')}
                                        className="w-full mt-4 py-5 bg-white text-indigo-700 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group/btn"
                                    >
                                        Rejoindre / Détails
                                        <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                    </button>
                                </div>
                            ) : (
                                <div className="py-10 text-center">
                                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                       <Activity size={32} className="text-white/40" />
                                    </div>
                                    <p className="text-white/60 font-bold uppercase text-[10px] tracking-widest">Pas de réunion planifiée</p>
                                </div>
                            )}
                        </div>
                        {/* Decorative Background Elements */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    </div>

                    {/* Hardware Status Card */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50">
                        <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-3">
                            <Activity size={20} className="text-orange-500" />
                            Santé du Matériel
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-xs font-black text-gray-700 uppercase tracking-tight">Laptop Pro</span>
                                </div>
                                <span className="text-[10px] font-black text-emerald-700 uppercase">Excellent</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    <span className="text-xs font-black text-gray-700 uppercase tracking-tight">Imprimante</span>
                                </div>
                                <span className="text-[10px] font-black text-orange-700 uppercase">En Maintenance</span>
                            </div>
                        </div>
                        <div className="mt-8 p-6 bg-gray-900 rounded-[1.5rem] text-center">
                            <Star className="text-yellow-400 mx-auto mb-2" size={24} />
                            <p className="text-xs font-black text-white uppercase tracking-[0.2em]">Usage Académique</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-tight">Vérifié par l'administration</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
