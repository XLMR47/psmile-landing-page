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

function App() {
  return (
    <div className="font-sans min-h-screen text-[#F3F4F6] bg-[#0C0C0C]">
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
    </div>
  );
}

export default App;
