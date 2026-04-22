import { useState, useEffect } from 'react';
import { 
  FileText, Search, Loader, Calendar, 
  ArrowRight, Clock, Building2, Package, CheckCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AppelOffre {
  id: number;
  reference: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
}

const AppelsOffresPage = () => {
  const [appelsOffres, setAppelsOffres] = useState<AppelOffre[]>([]);
  const [myOffres, setMyOffres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aoRes, myOffresRes] = await Promise.all([
        api.getAllAppelsOffresOuverts(),
        api.getMyOffres(user?.id)
      ]);

      if (aoRes.ok) setAppelsOffres(await aoRes.json());
      if (myOffresRes.ok) setMyOffres(await myOffresRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasSubmitted = (aoId: number) => {
    return myOffres.some(o => o.appelOffreId === aoId);
  };

  const filtered = appelsOffres.filter(ao => 
    ao.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: any) => {
    if (Array.isArray(date)) {
      return `${date[2]}/${date[1]}/${date[0]}`;
    }
    return date;
  };

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Package className="text-purple-600" size={36} />
              Appels d'Offres en cours
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Consultez les opportunités et soumettez vos propositions.</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader className="animate-spin text-purple-600 mb-4" size={48} />
            <p className="text-gray-500 font-bold text-lg">Recherche d'opportunités...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((ao) => (
              <div key={ao.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl hover:shadow-2xl hover:border-purple-200 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col gap-2">
                    <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-black text-xs uppercase tracking-widest border border-purple-100 w-fit">
                      {ao.reference}
                    </div>
                    {hasSubmitted(ao.id) && (
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-lg border border-green-100 animate-pulse">
                        <CheckCircle size={12} />
                        Déjà Soumis
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                    <Clock size={16} />
                    <span className="text-xs font-bold uppercase tracking-tight">Ouvert</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                  Acquisition de ressources informatiques
                </h3>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-gray-500 font-medium">
                    <Calendar size={18} className="text-gray-400" />
                    <span>Début : <span className="text-gray-900">{formatDate(ao.dateDebut)}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 font-medium">
                    <Calendar size={18} className="text-gray-400" />
                    <span>Fin : <span className="text-red-600 font-bold">{formatDate(ao.dateFin)}</span></span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/fournisseur/soumission/${ao.id}`)}
                  className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] shadow-lg ${
                    hasSubmitted(ao.id) 
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-100' 
                    : 'bg-gray-900 hover:bg-purple-600 text-white shadow-gray-200'
                  }`}
                >
                  {hasSubmitted(ao.id) ? (
                    <>
                      <FileText size={20} />
                      Voir ma soumission
                    </>
                  ) : (
                    <>
                      Consulter & Soumettre
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="md:col-span-2 py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                <FileText className="mx-auto text-gray-200 mb-4" size={64} />
                <p className="text-gray-500 font-bold text-xl">Aucun appel d'offre ouvert pour le moment.</p>
                <p className="text-gray-400 mt-2">Revenez plus tard pour de nouvelles opportunités.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppelsOffresPage;
