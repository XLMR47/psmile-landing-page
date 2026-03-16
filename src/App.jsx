import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { clarity } from '@microsoft/clarity';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import MissionVision from './components/MissionVision';
import Methodology from './components/Methodology';
import Comparison from './components/Comparison';
import Library from './components/Library';
import Resources from './components/Resources';
import Expert from './components/Expert';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import LeadForm from './components/LeadForm';
import Footer from './components/Footer';
import Alliances from './components/Alliances';
import WhatsAppButton from './components/WhatsAppButton';

import LoginPage from './portal/LoginPage';
import Dashboard from './portal/Dashboard';
import PlayerDetail from './portal/PlayerDetail';
import ProtectedRoute from './portal/ProtectedRoute';
import EpsdLite from './portal/EpsdLite';
import EpsdHistory from './portal/EpsdHistory';
import PsmileLab from './portal/PsmileLab';
import CharlaAutorregulacion from './portal/CharlaAutorregulacion';
import PlayerSesiones from './components/PlayerSesiones';
import SesionViewer from './components/SesionViewer';
import { LobbyFacilitador, LobbyJugador } from './components/sesiones/SesionLobby';
import FacilitadorPanel from './components/sesiones/FacilitadorPanel';
import JugadorView from './components/sesiones/JugadorView';

// Landing Page (página pública)
function LandingPage() {
  return (
    <div className="font-sans min-h-screen text-[#F3F4F6] bg-[#0C0C0C] overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <About />
        {/* <MissionVision /> - Eliminado temporalmente para agilizar la lectura */}
        <Methodology />
        <Comparison />
        <Expert />
        <Testimonials />
        <Alliances />
        <Pricing />
        {/* <Library /> - Oculto temporalmente, reactivar después */}
        <Resources />
        <LeadForm />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function App() {
  useEffect(() => {
    clarity.init('vwf92gna94');
  }, []);

  return (
    <Routes>
      {/* Landing Page pública */}
      <Route path="/" element={<LandingPage />} />

      {/* Portal de Inteligencia Mental */}
      <Route path="/portal" element={<LoginPage />} />
      <Route
        path="/portal/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/jugador/:id"
        element={
          <ProtectedRoute>
            <PlayerDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/epsd-lite"
        element={
          <ProtectedRoute>
            <EpsdLite />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/epsd-historial"
        element={
          <ProtectedRoute>
            <EpsdHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/laboratorio"
        element={
          <ProtectedRoute>
            <PsmileLab />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/jugador/:id/sesiones"
        element={
          <ProtectedRoute>
            <PlayerSesiones />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/jugador/:id/sesion/:sesionId"
        element={
          <ProtectedRoute>
            <SesionViewer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/charla-autorregulacion"
        element={
          <ProtectedRoute>
            <CharlaAutorregulacion />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/sesion/nueva"
        element={
          <ProtectedRoute>
            <LobbyFacilitador />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/facilitador/:sesionId"
        element={
          <ProtectedRoute>
            <FacilitadorPanel />
          </ProtectedRoute>
        }
      />

      {/* Rutas Públicas de Sala */}
      <Route path="/sala" element={<LobbyJugador />} />
      <Route path="/sala/:sesionId/jugador/:jugadorId" element={<JugadorView />} />
    </Routes>
  );
}

export default App;
