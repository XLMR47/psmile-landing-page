export const EPSD_OPERATIONAL_DEFINITIONS = {
    "COGNITIVO": {
        "Percepción del entorno": [
            {
                "conducta": "Escanea el campo antes de recibir, buscando información.",
                "niveles": {
                    "bajo": "Rara vez observa antes de recibir; recibe sin información del entorno; pierde opciones por falta de visión.",
                    "medio": "Escanea de forma intermitente; a veces recibe preparado, otras no; lectura previa parcial.",
                    "alto": "Escanea sistemáticamente (movimientos de cabeza); recibe orientado y decide con anticipación."
                }
            },
            {
                "conducta": "Anticipa jugadas y reacciones del rival.",
                "niveles": {
                    "bajo": "Reacciona tarde; llega después o queda mal posicionado; poca lectura de intenciones rivales.",
                    "medio": "Anticipa en algunas situaciones; en otras reacciona; lectura adecuada pero inconsistente.",
                    "alto": "Anticipa con frecuencia; intercepta/corta o se posiciona antes; comprensión táctica avanzada."
                }
            }
        ],
        "Toma de decisiones": [
            {
                "conducta": "Toma decisiones acordes al contexto y ritmo del juego.",
                "niveles": {
                    "bajo": "Acciones erráticas o improvisadas; provoca pérdidas frecuentes.",
                    "medio": "Generalmente elige opciones correctas, con alguna lentitud o inconsistencia bajo presión.",
                    "alto": "Decide rápido y con precisión, coherente con la dinámica táctica; optimiza la jugada."
                }
            },
            {
                "conducta": "Corrige errores y ajusta decisiones posteriores de forma consciente.",
                "niveles": {
                    "bajo": "Repite errores; muestra rigidez cognitiva o frustración.",
                    "medio": "Reconoce errores y ajusta parcialmente su comportamiento.",
                    "alto": "Aprende en tiempo real; convierte el error en mejora táctica inmediata."
                }
            }
        ],
        "Control atencional": [
            {
                "conducta": "Mantiene atención sostenida durante el juego.",
                "niveles": {
                    "bajo": "Largos lapsos de desconexión; pierde posicionamiento por despiste.",
                    "medio": "Participación mayoritaria con breves bajones que no comprometen su rol.",
                    "alto": "Atención plena y proactiva durante casi todo el partido; anticipa oportunidades."
                }
            },
            {
                "conducta": "Se recupera rápidamente de distracciones o errores, reenfocando su atención.",
                "niveles": {
                    "bajo": "Permanece distraído o frustrado varios minutos; repite errores.",
                    "medio": "Se recompone tras 1-2 jugadas; leve merma temporal.",
                    "alto": "Recupera foco inmediatamente; aplica señales o rutinas para mantenerse enfocado."
                }
            },
            {
                "conducta": "Mantiene precisión mental en momentos clave del partido.",
                "niveles": {
                    "bajo": "Colapso en presión; decisiones pobres y ejecución imprecisa.",
                    "medio": "Precisión irregular en situaciones críticas; controla parcialmente las emociones.",
                    "alto": "Alta precisión y control en la mayoría de los momentos críticos; desempeño fiable."
                }
            }
        ]
    },
    "EMOCIONAL": {
        "Gestión emocional": [
            {
                "conducta": "Mantiene control emocional ante errores o decisiones arbitrales.",
                "niveles": {
                    "bajo": "Reacciones exageradas (ira prolongada, discusiones); cambia el flujo del juego.",
                    "medio": "Molestia breve y localizada; se recompone en 1-2 jugadas.",
                    "alto": "Mantiene calma; comunica asertivamente y vuelve rápido a la tarea."
                }
            },
            {
                "conducta": "Transforma emociones intensas en comportamientos útiles y funcionales.",
                "niveles": {
                    "bajo": "Emoción domina la conducta (protestas, desorden); no canaliza a la acción.",
                    "medio": "A veces canaliza (esfuerzo, presión) pero sin ajuste constante.",
                    "alto": "Convierte sistemáticamente emoción en energía dirigida y eficaz para el equipo."
                }
            }
        ],
        "Autodiálogo y enfoque mental": [
            {
                "conducta": "Celebra acciones defensivas u ofensivas como refuerzo emocional positivo.",
                "niveles": {
                    "bajo": "No muestra refuerzo positivo tras acciones efectivas; apatía o indiferencia.",
                    "medio": "Celebra algunas acciones exitosas, con expresividad leve o tardía.",
                    "alto": "Celebra con energía y convicción, reforzando su desempeño y contagiando al equipo."
                }
            },
            {
                "conducta": "Usa autoinstrucciones o gestos para reenfocar su mente tras errores o distracciones.",
                "niveles": {
                    "bajo": "Permanece distraído; no evidencia intentos de reenfocar.",
                    "medio": "Se recupera en segundos; usa gestos o respiración para retomar el foco.",
                    "alto": "Reacciona de inmediato; aplica rutinas/auto-instrucciones efectivas y visibles."
                }
            },
            {
                "conducta": "Evita expresiones o autodiálogo negativo que afecten su desempeño.",
                "niveles": {
                    "bajo": "Autocrítica negativa clara (golpes, maldecir, frustración exagerada).",
                    "medio": "Muestra molestia ocasional, pero mantiene control sin afectar su rendimiento.",
                    "alto": "Sin evidencia de diálogo negativo; calma y resiliencia incluso tras errores repetidos."
                }
            }
        ],
        "Autoconfianza y resiliencia": [
            {
                "conducta": "Mantiene seguridad y energía en contextos adversos.",
                "niveles": {
                    "bajo": "Pasividad o temor con marcador adverso; evita participar.",
                    "medio": "Participa con menor iniciativa; esfuerzo sostenido pero limitado.",
                    "alto": "Refuerza protagonismo en la adversidad; energía alta y positiva."
                }
            },
            {
                "conducta": "Persevera tras fallos, manteniendo una actitud estable y optimista.",
                "niveles": {
                    "bajo": "Se frustra y reduce esfuerzo o atención.",
                    "medio": "Se recompone parcialmente y continúa participando.",
                    "alto": "Usa el error como motivación; aumenta concentración y compromiso."
                }
            },
            {
                "conducta": "Se muestra disponible y asume responsabilidad en momentos críticos.",
                "niveles": {
                    "bajo": "Evita roles de responsabilidad en acciones clave.",
                    "medio": "Asume cuando se le solicita; muestra leves signos de tensión.",
                    "alto": "Se ofrece activamente y ejerce liderazgo bajo presión."
                }
            }
        ]
    },
    "SOCIAL": {
        "Comunicación emocional": [
            {
                "conducta": "Se comunica de forma asertiva y respetuosa (gestos, voz o señas).",
                "niveles": {
                    "bajo": "Mensajes hostiles/confusos; gestos descalificadores o tono agresivo.",
                    "medio": "Comunicación generalmente funcional, con ocasionales tonos inadecuados.",
                    "alto": "Comunicación clara, constructiva y respetuosa; favorece vínculo y organización."
                }
            },
            {
                "conducta": "Usa la comunicación para regular el ambiente emocional del equipo.",
                "niveles": {
                    "bajo": "Aumenta tensión con quejas o recriminaciones; no contribuye a regular el clima.",
                    "medio": "Ocasionalmente calma o anima; efecto limitado o intermitente.",
                    "alto": "Actúa activamente para calmar/motivar; visible impacto positivo en el clima."
                }
            }
        ],
        "Vínculo y cohesión": [
            {
                "conducta": "Apoya y respalda emocionalmente a sus compañeros.",
                "niveles": {
                    "bajo": "Ignora o crítica a compañeros tras errores; aislamiento.",
                    "medio": "Ofrece apoyo en algunas situaciones, sin consistencia.",
                    "alto": "Apoyo inmediato y sincero tras errores; refuerza pertenencia y cohesión."
                }
            },
            {
                "conducta": "Celebra y comparte logros colectivos con expresividad positiva.",
                "niveles": {
                    "bajo": "No celebra o lo hace de forma individualista; nula conexión grupal.",
                    "medio": "Celebra de forma moderada; cierta conexión grupal.",
                    "alto": "Celebra activamente con el grupo; refuerza el logro colectivo."
                }
            }
        ],
        "Liderazgo emocional": [
            {
                "conducta": "Mantiene serenidad y transmite calma en momentos de presión o conflicto.",
                "niveles": {
                    "bajo": "Se descompone o contagia nerviosismo; añade inestabilidad.",
                    "medio": "Mantiene relativa calma; contención parcial del grupo.",
                    "alto": "Serenidad ejemplar; es ancla emocional en situaciones críticas."
                }
            },
            {
                "conducta": "Modela comportamientos de autocontrol, respeto y compromiso.",
                "niveles": {
                    "bajo": "Ejemplifica conductas inapropiadas (protestas, falta de respeto, apatía).",
                    "medio": "Cumple normas y muestra respeto en general.",
                    "alto": "Modelo visible de autocontrol y compromiso; eleva el estándar del equipo."
                }
            }
        ]
    }
};
