import { useState } from "react";
import { Play } from "lucide-react";

const media = [
    {
        category: "PRE-COMPETICIÓN",
        title: "Visualización de Éxito",
        duration: "12:40",
        img: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2727&auto=format&fit=crop"
    },
    {
        category: "ANSIEDAD",
        title: "Control de Pulsaciones",
        duration: "08:30",
        img: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2832&auto=format&fit=crop"
    },
    {
        category: "RUTINAS",
        title: "Protocolo de Vestuario",
        duration: "15:00",
        img: "https://images.unsplash.com/photo-1444312645910-ffa973656eba?q=80&w=2787&auto=format&fit=crop"
    },
    {
        category: "ENFOQUE",
        title: "Foco en el Partido",
        duration: "10:15",
        img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2720&auto=format&fit=crop"
    }
];

export default function Library() {
    const [filter, setFilter] = useState("TODOS");

    const filteredMedia = filter === "TODOS" 
        ? media 
        : media.filter(item => {
            if (filter === "VISUALIZACIÓN") return item.category === "PRE-COMPETICIÓN";
            if (filter === "ENFOQUE") return item.category === "ENFOQUE";
            return true;
        });

    return (
        <section id="libreria" className="py-24 bg-[#0C0C0C]">
            <div className="container mx-auto px-6 lg:px-12 max-w-7xl">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                            Librería de Entrenamiento Mental
                        </h2>
                        <p className="text-[#9CA3AF] text-sm md:text-base">
                            Recursos de audio y video premium para elevar tu juego.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={() => setFilter("TODOS")}
                            className={`${filter === "TODOS" ? "bg-[#0070F3] text-white" : "bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] border-white/5"} px-6 py-2 rounded-full text-xs font-bold transition-all border`}
                        >
                            Todos
                        </button>
                        <button 
                            onClick={() => setFilter("VISUALIZACIÓN")}
                            className={`${filter === "VISUALIZACIÓN" ? "bg-[#0070F3] text-white border-transparent" : "bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] border-white/5"} px-5 py-2 rounded-full border text-xs font-bold transition-all`}
                        >
                            Visualización
                        </button>
                        <button 
                            onClick={() => setFilter("ENFOQUE")}
                            className={`${filter === "ENFOQUE" ? "bg-[#0070F3] text-white border-transparent" : "bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] border-white/5"} px-5 py-2 rounded-full border text-xs font-bold transition-all`}
                        >
                            Enfoque
                        </button>
                    </div>
                </div>

                {/* Media Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[300px]">
                    {filteredMedia.length > 0 ? (
                        filteredMedia.map((item, i) => (
                            <div key={i} className="group cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="relative rounded-xl overflow-hidden mb-4 bg-[#1A1A1A] aspect-[4/3] border border-white/5">
                                    <img
                                        src={item.img}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                                    />

                                    {/* Duration Badge */}
                                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white font-mono">
                                        {item.duration}
                                    </div>

                                    {/* Hover Play Icon */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="w-12 h-12 bg-[#0070F3] rounded-full flex items-center justify-center">
                                            <Play className="text-white fill-current ml-1" size={20} />
                                        </div>
                                    </div>
                                </div>

                                <div className="text-[10px] font-bold text-[#0070F3] tracking-widest uppercase mb-1">
                                    {item.category}
                                </div>
                                <h3 className="text-white font-bold text-lg leading-tight">
                                    {item.title}
                                </h3>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex items-center justify-center py-20 text-[#9CA3AF]">
                            No hay recursos disponibles en esta categoría.
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}
