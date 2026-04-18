import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InactiveAccount = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#121216] border border-white/10 p-8 rounded-3xl shadow-2xl text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-4">Compte en attente d'activation</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Votre compte n'a pas encore été activé. Veuillez contacter le responsable de la faculté pour valider votre inscription et activer votre accès.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <ArrowLeft size={18} />
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default InactiveAccount;
