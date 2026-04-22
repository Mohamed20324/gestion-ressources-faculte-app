import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import {
    BarChart, Bar, LineChart, Line, ResponsiveContainer,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
    FileText, Package, Video, CheckCircle,
    Clock, TrendingUp, Activity, Loader, Calendar,
    ChevronRight, ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {trend && (
                    <div className="flex items-center gap-1 mt-2 text-green-500">
                        <TrendingUp size={14} />
                        <span className="text-xs font-medium">+{trend}% ce mois</span>
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
                // Fetch needs and assignments for this teacher
                const [besoinsRes, affectationsRes, reunionsRes] = await Promise.all([
                    api.getAllBesoins(), // Should filter by enseignantId on backend or here
                    api.getAllRessources(), // Mocking assignments for now if no specific endpoint
                    api.getAllReunions()
                ]);

                if (besoinsRes.ok && affectationsRes.ok && reunionsRes.ok) {
                    const besoins = await besoinsRes.json();
                    const affectations = await affectationsRes.json();
                    const reunions = await reunionsRes.json();

                    const myBesoins = besoins.filter((b: any) => b.enseignantId === user.id);
                    // Mocking myAffectations for now
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
                console.error("Error fetching enseignant dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader className="animate-spin text-purple-600" size={40} />
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50/30 min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Bonjour, {user?.nom}</h1>
                <p className="text-gray-500">Voici un aperçu de vos besoins et affectations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Mes Besoins" 
                    value={stats.needsCount} 
                    icon={FileText} 
                    color="text-purple-600" 
                    bgColor="bg-purple-50" 
                    trend={15} 
                />
                <StatCard 
                    title="Mes Affectations" 
                    value={stats.assignmentsCount} 
                    icon={Package} 
                    color="text-blue-600" 
                    bgColor="bg-blue-50" 
                />
                <StatCard 
                    title="Taux de Validation" 
                    value="75%" 
                    icon={CheckCircle} 
                    color="text-green-600" 
                    bgColor="bg-green-50" 
                />
                <StatCard 
                    title="Réunions" 
                    value="2" 
                    icon={Video} 
                    color="text-orange-600" 
                    bgColor="bg-orange-50" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6">Évolution de mes besoins</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.needsHistory}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900">Activités Récentes</h3>
                            <button className="text-sm text-purple-600 font-medium hover:underline flex items-center gap-1">
                                Tout voir <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                            <FileText size={18} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Nouvelle demande de matériel</p>
                                            <p className="text-xs text-gray-500">Ordinateur Portable - En attente</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium">Il y a 2h</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-6">Prochaine Réunion</h3>
                            {stats.nextMeeting ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={20} className="text-purple-200" />
                                        <span className="font-medium">{new Date(stats.nextMeeting.date).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock size={20} className="text-purple-200" />
                                        <span className="font-medium">{stats.nextMeeting.heure}</span>
                                    </div>
                                    <button 
                                        onClick={() => navigate('/enseignant/meetings')}
                                        className="w-full mt-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        Voir les détails
                                        <ArrowUpRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <p className="text-white/60">Aucune réunion prévue.</p>
                            )}
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Activity size={18} className="text-orange-500" />
                            Statut du matériel
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Ordinateur</span>
                                <span className="text-sm font-bold text-green-500">Opérationnel</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Imprimante</span>
                                <span className="text-sm font-bold text-orange-500">Maintenance</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
