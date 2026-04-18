import { Routes, Route } from 'react-router-dom';
import Header from '../../components/G/Header';
import Sidebar from '../../components/G/Sidebar';
import Dashboard from './Dashboard';
import EnseignantsPage from './EnseignantsPage';
import MeetingsPage from './MeetingsPage';
import BesoinsPage from './BesoinsPage';
import TypesRessourcesPage from './TypesRessourcesPage';

const AppContent = () => {
  return (
    <div className='flex flex-col h-screen'>
      <Header title="Espace ChefDepartement" />
      <div className="flex flex-1 bg-white text-sm text-gray-700 font-sans overflow-hidden">
        <Sidebar role="ChefDepartement" />
        <div className="flex-1 flex flex-col h-screen overflow-auto pb-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/enseignants" element={<EnseignantsPage />} />
            <Route path="/meetings" element={<MeetingsPage />} />
            <Route path="/besoins" element={<BesoinsPage />} />
            <Route path="/types-ressources" element={<TypesRessourcesPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const ChefDepartementApp = () => {
  return <AppContent />;
};

export default ChefDepartementApp;
