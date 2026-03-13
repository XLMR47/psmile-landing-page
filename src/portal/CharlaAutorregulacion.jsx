import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize } from 'lucide-react';

export default function CharlaAutorregulacion() {
  const navigate = useNavigate();

  const toggleFS = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden flex flex-col">
      {/* Navbar de control para salir */}
      <div className="bg-[#162030] border-b border-[#1e2d3d] p-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/portal/laboratorio')}
            className="bg-[#111827] hover:bg-[#1f2937] border border-[#1e2d3d] text-[#6b8099] hover:text-white p-2 rounded-xl transition-all"
            title="Volver al Laboratorio"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-white font-black text-sm uppercase tracking-wider">Biblioteca de Charlas</h1>
            <p className="text-[#6b8099] text-[10px] font-bold uppercase tracking-[0.2em]">Material de Intervención Psicológica</p>
          </div>
        </div>
        <button 
          onClick={toggleFS}
          className="bg-[#111827] hover:bg-[#1f2937] border border-[#1e2d3d] text-[#6b8099] hover:text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold"
        >
          <Maximize size={14} />
          MODO PRESENTACIÓN (F)
        </button>
      </div>

      {/* El contenido de la charla en un iframe para aislar el CSS y JS original */}
      <div className="flex-1 w-full bg-black relative">
        <iframe 
          src="/material/charla-autorregulacion.html" 
          className="w-full h-full border-none"
          title="Charla Autorregulación Emocional"
        />
      </div>
    </div>
  );
}
