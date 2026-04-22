import { Routes, Route } from 'react-router-dom';
import Header from '../../components/G/Header';
import Sidebar from '../../components/G/Sidebar';
import Dashboard from './Dashboard';
import AppelsOffresPage from './AppelsOffresPage';
import SoumettreOffrePage from './SoumettreOffrePage';
import MesSoumissionsPage from './MesSoumissionsPage';
import DossiersTraitesPage from './DossiersTraitesPage';
import ProfilePage from '../Common/ProfilePage';

const AppContent = () => {
  return (
    <div className='flex flex-col h-screen'>
      <Header title="Espace Fournisseur" />
      <div className="flex flex-1 bg-white text-sm text-gray-700 font-sans overflow-hidden">
        <Sidebar role="Fournisseur" />
        <div className="flex-1 overflow-y-auto pb-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/appels-offres" element={<AppelsOffresPage />} />
            <Route path="/mes-soumissions" element={<MesSoumissionsPage />} />
            <Route path="/dossiers-traites" element={<DossiersTraitesPage />} />
            <Route path="/soumission/:id" element={<SoumettreOffrePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const FournisseurApp = () => {
  return <AppContent />;
};

export default FournisseurApp;
