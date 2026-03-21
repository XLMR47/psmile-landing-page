/**
 * epsdRecomendaciones.js
 * Módulo de recomendaciones automatizadas para la interpretación del ePsD.
 * Dominios: Cognitivo, Emocional, Social/Conductual.
 * Actores: DT, Jugador, Psicólogo, Familia.
 */

export const RECOMENDACIONES_EPSD = {
  'Percepción del entorno': {
    bajo: {
      dt: {
        entrenamiento: "Utilizar rondos reducidos (ej. 3v1 o 4v2) en espacios muy delimitados donde la única regla sea perfilarse antes de recibir. Reducir la complejidad táctica para evitar la sobrecarga cognitiva.",
        partido: "Asignarle un rol con marcas fijas o carriles específicos que limiten la cantidad de estímulos a procesar. Evitar pedirle que lea zonas alejadas del balón.",
        comunicacion: "Dar indicaciones cortas, directas y enfocadas en un solo estímulo a la vez (ej. 'mira tu espalda' o 'busca al lateral')."
      },
      jugador: {
        ejercicios: "Antes de recibir un pase, oblígate a girar la cabeza para mirar por encima de tus dos hombros (escaneo). Cuenta cuántos rivales tienes cerca.",
        rutina: "En el calentamiento, pasa el balón y nombra el color de los botines del compañero que te lo devuelve para forzar a levantar la vista.",
        autogestión: "Usa la palabra clave 'cabeza arriba' cada vez que el balón esté lejos de ti."
      },
      psicologo: {
        evaluacionesComplementarias: ["Test de Toulouse-Piéron", "Trail Making Test (TMT)"],
        tipoIntervencion: "Individual y en campo.",
        tecnicas: ["Entrenamiento visual perceptivo", "Neurofeedback para ondas Beta", "Video-feedback de sus propios partidos centrando la atención en el escaneo visual."],
        frecuencia: "2 veces por semana (1 sesión clínica, 1 observación en campo)."
      },
      familia: {
        como_acompañar: "Ayudarle a entender que el fútbol es como un ajedrez en movimiento; animarle a ver partidos en la televisión fijándose en lo que hacen los jugadores que no tienen el balón.",
        que_evitar: "Gritarle desde la grada '¡pásala!' o '¡tira!', ya que esto interrumpe su propio proceso de lectura del juego y le genera confusión.",
        entorno_apoyo: "Fomentar videojuegos o juegos de mesa que requieran visión periférica y atención dividida de forma lúdica."
      }
    },
    medio: {
      dt: {
        entrenamiento: "Implementar juegos de posición con comodines interiores y reglas de progresión (ej. conectar de zona A a C pasando por B). Obligar a buscar el tercer hombre.",
        partido: "Incentivar la lectura de los espacios libres en transiciones ofensivas. Pedirle que escanee la zona débil del rival.",
        comunicacion: "Utilizar el descubrimiento guiado: '¿Dónde viste el espacio libre antes de recibir?' en lugar de decirle directamente dónde estaba."
      },
      jugador: {
        ejercicios: "Practica el 'mirar lejos' antes de que te llegue el balón. Identifica dónde está el compañero más alejado para tener la opción del cambio de frente.",
        rutina: "Durante los rondos de calentamiento, intenta dar el pase siempre al primer toque, lo que te obligará a escanear antes de recibir.",
        autogestión: "Antes del partido, visualiza mentalmente el campo como un radar, mapeando dónde suelen ubicarse tus rivales directos."
      },
      psicologo: {
        evaluacionesComplementarias: ["CPRD (Cuestionario de Características Psicológicas Relacionadas con el Rendimiento Deportivo)"],
        tipoIntervencion: "Individual.",
        tecnicas: ["Entrenamiento en toma de decisiones mediante software de simulación", "Ejercicios de atención dividida en fatiga"],
        frecuencia: "Quincenal."
      },
      familia: {
        como_acompañar: "Al final del partido, preguntarle sobre situaciones de juego: '¿Cómo viste al rival por tu banda hoy?'.",
        que_evitar: "Juzgar su rendimiento únicamente por goles o asistencias, omitiendo su lectura táctica del juego.",
        entorno_apoyo: "Mantener un ambiente sin presión orientada al resultado, valorando la inteligencia con la que juega."
      }
    },
    alto: {
      dt: {
        entrenamiento: "Diseñar escenarios de alta complejidad (juegos condicionados con superioridad/inferioridad numérica dinámica y comodines cambiantes).",
        partido: "Otorgarle libertad posicional en zona de creación o mediocentro organizador. Darle la responsabilidad de ser el termómetro táctico del equipo.",
        comunicacion: "Tratarlo como un asistente técnico en el campo. Preguntarle qué está viendo que el banquillo no percibe."
      },
      jugador: {
        ejercicios: "Comienza a anticipar no solo el movimiento del rival directo, sino el de la línea completa para encontrar líneas de pase profundas.",
        rutina: "Observar videos de mediocentros de élite analizando sus movimientos de cuello (head-scanning) milisegundos antes de recibir.",
        autogestión: "Usa tu lectura periférica para ordenar a los compañeros que tienen una visión más reducida (ej. centrales ordenando a volantes)."
      },
      psicologo: {
        evaluacionesComplementarias: ["No requiere batería clínica prioritaria; enfoque en optimización."],
        tipoIntervencion: "Mentoring.",
        tecnicas: ["Ensayo mental avanzado", "Establecimiento de micro-metas de anticipación perceptiva"],
        frecuencia: "Mensual o a demanda del jugador."
      },
      familia: {
        como_acompañar: "Disfrutar de su capacidad de juego y animarle a que comparta sus opiniones tácticas si le apetece.",
        que_evitar: "Crear falsas expectativas de llegar rápidamente al profesionalismo solo por su inteligencia táctica; recordar que el desarrollo es multifactorial.",
        entorno_apoyo: "Fomentar su descanso visual y mental en casa, desconectando del fútbol para evitar el agotamiento cognitivo."
      }
    }
  },
  'Toma de decisiones': {
    bajo: {
      dt: {
        entrenamiento: "Diseñar tareas de finalización o pase con opciones binarias (A o B). Reducir el tiempo de posesión para forzar decisiones instintivas simples.",
        partido: "Simplificar sus tareas tácticas: pedirle que juegue a 1 o 2 toques y apoye de frente. Evitar que asuma riesgos en salida de balón.",
        comunicacion: "Reforzar la decisión rápida, independientemente de si el gesto técnico falló. Decir: 'Bien decidido, la ejecución ya mejorará'."
      },
      jugador: {
        ejercicios: "Prioriza jugar fácil. Si tienes dudas, busca siempre el pase de seguridad al compañero que tienes de frente.",
        rutina: "Haz una pausa mental de un segundo cuando el balón salga fuera. Respira y decide tu próxima acción antes de que se reanude el juego.",
        autogestión: "Repítete: 'Juego simple, juego rápido'. No intentes la jugada más difícil para compensar un error previo."
      },
      psicologo: {
        evaluacionesComplementarias: ["CETD (Cuestionario de Estilo de Toma de Decisiones en el Deporte)"],
        tipoIntervencion: "Individual.",
        tecnicas: ["Video-feedback reflexivo para identificar opciones no vistas", "Terapia Cognitivo-Conductual para reducir el miedo al fallo (parálisis por análisis)."],
        frecuencia: "Semanal."
      },
      familia: {
        como_acompañar: "Entender que está en una fase de inseguridad al elegir. Apoyar incondicionalmente sus decisiones, incluso si terminan en pérdidas de balón.",
        que_evitar: "Darle indicaciones tácticas contradictorias a las del entrenador (ej. el DT pide toque y el familiar pide regate).",
        entorno_apoyo: "Proporcionar tranquilidad. En casa, permitirle tomar decisiones familiares simples para fomentar su autonomía."
      }
    },
    medio: {
      dt: {
        entrenamiento: "Crear situaciones de ataque vs defensa (ej. 3v2 o 4v3) donde deba elegir entre fijar y soltar, o definir.",
        partido: "Animarle a arriesgar en zonas de finalización (último tercio), manteniendo la seguridad en zonas de iniciación.",
        comunicacion: "Preguntar: '¿Por qué decidiste hacer el pase ahí y no el cambio de orientación?'. Ayudarle a razonar su acción."
      },
      jugador: {
        ejercicios: "Antes de recibir, dibuja dos opciones en tu cabeza. Si la opción A está cubierta por el rival, ejecuta inmediatamente la opción B.",
        rutina: "Evalúa tus propias decisiones en el post-partido: anota 2 buenas decisiones que tomaste y 1 que podrías haber mejorado.",
        autogestión: "Entiende que el error es información. Si decides mal, asume la pérdida y activa la transición defensiva sin lamentos."
      },
      psicologo: {
        evaluacionesComplementarias: ["CSAI-2R (evaluar si la ansiedad cognitiva interfiere en la decisión)"],
        tipoIntervencion: "Individual y Grupal (para roles tácticos).",
        tecnicas: ["Entrenamiento en focalización atencional", "Simulación mental de escenarios tácticos pre-partido"],
        frecuencia: "Quincenal."
      },
      familia: {
        como_acompañar: "Fomentar un análisis constructivo: 'Te vi dudar en esa jugada, ¿qué opciones tenías?'.",
        que_evitar: "El reproche inmediato ante un error visible (un pase interceptado o un tiro errado).",
        entorno_apoyo: "Celebrar la valentía y la creatividad al intentar jugadas nuevas."
      }
    },
    alto: {
      dt: {
        entrenamiento: "Implementar tareas de fatiga física extrema combinada con toma de decisiones cognitivas (ej. transición rápida tras circuito metabólico).",
        partido: "Darle la llave del tempo del partido. Confiar en su criterio para acelerar transiciones o dormir la posesión.",
        comunicacion: "Feedback simétrico y de igual a igual. Validar su interpretación del juego táctico."
      },
      jugador: {
        ejercicios: "Asume el liderazgo cognitivo: ayuda a los compañeros a tomar decisiones ordenándoles desde tu posición privilegiada.",
        rutina: "Identifica en los primeros 10 minutos del partido los patrones defensivos del rival para adaptar tu estilo de pases.",
        autogestión: "Confía plenamente en tu instinto táctico. Tu primera decisión suele ser la correcta, no la dudes."
      },
      psicologo: {
        evaluacionesComplementarias: ["No prioritaria."],
        tipoIntervencion: "Mentoring.",
        tecnicas: ["Estrategias de mantenimiento del 'Flow' (estado de fluidez)", "Práctica imaginada de máxima complejidad"],
        frecuencia: "A demanda."
      },
      familia: {
        como_acompañar: "Ayudarle a mantener los pies en la tierra, valorando que su talento al decidir se potencie con el trabajo en equipo.",
        que_evitar: "Elogiarlo como el 'cerebro' del equipo menospreciando a sus compañeros.",
        entorno_apoyo: "Un entorno tranquilo que favorezca la recuperación cognitiva después de los fines de semana de alta tensión."
      }
    }
  },
  'Control atencional': {
    bajo: {
      dt: {
        entrenamiento: "Tareas de corta duración y alta intensidad (ej. series de 3 minutos). Cambiar de ejercicio frecuentemente para evitar la desconexión.",
        partido: "Usarlo en periodos cortos o darle descansos programados. Asignarle marcas personales que le obliguen a estar concentrado en un solo estímulo.",
        comunicacion: "Llamarlo por su nombre antes de darle una instrucción para 'anclar' su atención. Contacto visual obligatorio."
      },
      jugador: {
        ejercicios: "Cuando notes que te distraes con el público o el árbitro, aprieta los puños, suéltalos y mira el balón fijo.",
        rutina: "Rutina pre-ejecución cerrada: antes de sacar de banda o tirar, haz siempre exactamente los mismos 3 movimientos (ej. botar, mirar, respirar).",
        autogestión: "Usa la palabra 'AQUÍ' o 'AHORA' en voz alta para devolver tu cabeza al presente cuando te vayas mentalmente."
      },
      psicologo: {
        evaluacionesComplementarias: ["Test d2 de Atención", "Stroop Test"],
        tipoIntervencion: "Individual.",
        tecnicas: ["Entrenamiento en anclajes (Focusing)", "Técnicas de centramiento", "Mindfulness (MBSR adaptado al deporte)"],
        frecuencia: "Semanal."
      },
      familia: {
        como_acompañar: "Ayudar a establecer rutinas de sueño y alimentación ordenadas, fundamentales para la concentración.",
        que_evitar: "Darle el celular o pantallas justo antes del partido, ya que agotan la reserva atencional.",
        entorno_apoyo: "Crear hábitos estructurados en casa (horarios de estudio, descanso) para educar la capacidad de sostener la atención."
      }
    },
    medio: {
      dt: {
        entrenamiento: "Introducir distractores en las tareas (ej. ruido, indicaciones cambiantes del DT) para que aprenda a inhibir estímulos irrelevantes.",
        partido: "Exigirle mantener la posición táctica durante fases de asedio del rival sin perder de vista la línea del fuera de juego.",
        comunicacion: "Utilizar palabras clave tácticas compartidas por el equipo (ej. 'bascula', 'cierre') para activarlo rápido."
      },
      jugador: {
        ejercicios: "Trabaja la atención dividida: concéntrate en la posición del balón y, simultáneamente, en tu marca a la espalda.",
        rutina: "Durante los balones muertos (faltas, córners), realiza una respiración diafragmática rápida para 'resetear' la concentración.",
        autogestión: "Aprende a diferenciar cuándo tener atención amplia (ej. para defender) y atención estrecha (ej. para rematar a puerta)."
      },
      psicologo: {
        evaluacionesComplementarias: ["POMS (evaluar fatiga mental/vigor)"],
        tipoIntervencion: "Individual y en campo.",
        tecnicas: ["Entrenamiento en cambio de foco atencional (Nideffer)", "Asociación de estímulos (Cue words)"],
        frecuencia: "Quincenal."
      },
      familia: {
        como_acompañar: "Comprender que tras un partido intenso puede estar mentalmente exhausto e irritable.",
        que_evitar: "Interrogarlo excesivamente sobre errores específicos inmediatamente después de subir al coche.",
        entorno_apoyo: "Proporcionar un ambiente relajado y silencioso tras las competiciones."
      }
    },
    alto: {
      dt: {
        entrenamiento: "Ejercicios de doble tarea (dual-task) donde deba ejecutar acciones motrices complejas mientras resuelve problemas matemáticos o tácticos verbales.",
        partido: "Darle la tarea de reordenar a sus compañeros distraídos, especialmente en los minutos críticos (final de cada tiempo).",
        comunicacion: "Delegar en él la activación atencional del grupo durante los parones de hidratación o lesiones."
      },
      jugador: {
        ejercicios: "Entrena entrar en estado de fluidez ('Zone'). Confía en tus automatismos y deja que tu cuerpo actúe sin pensar demasiado los movimientos.",
        rutina: "Utiliza tu alta concentración para anticiparte a las jugadas a balón parado del equipo contrario.",
        autogestión: "Sé el 'despertador' del equipo. Usa tu voz de mando si notas que el grupo está bajando la intensidad mental."
      },
      psicologo: {
        evaluacionesComplementarias: ["No prioritaria."],
        tipoIntervencion: "Seguimiento.",
        tecnicas: ["Programa MAC (Mindfulness-Acceptance-Commitment) para potenciar el estado de Flow."],
        frecuencia: "Mensual."
      },
      familia: {
        como_acompañar: "Valorar su capacidad de enfoque y resiliencia en los momentos determinantes de los partidos.",
        que_evitar: "Pensar que porque es altamente concentrado en el fútbol, no necesita apoyo emocional.",
        entorno_apoyo: "Fomentar actividades de ocio activo que no estén relacionadas con el fútbol para oxigenar su mente."
      }
    }
  },
  'Gestión emocional': {
    bajo: {
      dt: {
        entrenamiento: "Evitar penalizar el error con castigos físicos desproporcionados (flexiones/vueltas) para no elevar la frustración. Fomentar el refuerzo positivo sistemático.",
        partido: "Sustituirlo estratégicamente si se le ve sobrepasado o con riesgo de expulsión por ira, explicándole asertivamente que es para protegerlo, no por su nivel.",
        comunicacion: "Tono de voz calmado. 'Te veo frustrado, respira, olvida la jugada anterior y vuelve a meterte en el partido'."
      },
      jugador: {
        ejercicios: "Si fallas un pase o te hacen una falta, no agites los brazos. Agáchate, toca el césped, respira hondo y date la vuelta.",
        rutina: "Aplica la regla de los 3 segundos: tienes 3 segundos para enojarte por un error, luego la jugada ya es historia.",
        autogestión: "El enojo nubla tu visión y vuelve lento tu cuerpo. Controlar tu rabia es ganar milisegundos frente al rival."
      },
      psicologo: {
        evaluacionesComplementarias: ["TMMS-24 (Inteligencia Emocional)", "STAI (Ansiedad Estado-Rasgo)"],
        tipoIntervencion: "Individual profunda y posible asesoramiento familiar.",
        tecnicas: ["Reestructuración cognitiva (Terapia Racional Emotiva de Ellis)", "Técnicas de respiración y relajación (Jacobson adaptado)", "Control de la activación"],
        frecuencia: "Semanal."
      },
      familia: {
        como_acompañar: "Validar sus emociones en casa: 'Es normal que te sientas frustrado por el partido, pero hablemos de cómo reaccionaste'.",
        que_evitar: "Criticar fuertemente al árbitro, rivales o entrenadores en presencia del jugador, ya que legitima sus estallidos de ira.",
        entorno_apoyo: "Ser un modelo de control emocional en la grada. Si los padres pierden el control, el jugador de categorías de base también lo hará."
      }
    },
    medio: {
      dt: {
        entrenamiento: "Introducir adversidad controlada: pitar faltas injustas deliberadamente en los interescuadras para evaluar y entrenar su tolerancia a la frustración.",
        partido: "Darle feedback funcional (técnica del sándwich: positivo - corrección - positivo) para mantener su ego estable y enfocado en la mejora.",
        comunicacion: "Fomentar el diálogo: '¿Cómo te estás sintiendo de piernas y de cabeza en este tramo?'."
      },
      jugador: {
        ejercicios: "Identifica tus 'gatillos' (lo que te hace enojar: el árbitro, un golpe, fallar un gol). Cuando ocurra el gatillo, usa una palabra interruptora como 'Calma'.",
        rutina: "En el vestuario, antes de salir, cierra los ojos 1 minuto visualizando el peor escenario posible (ej. ir perdiendo 1-0) y visualízate reaccionando positivamente.",
        autogestión: "Utiliza la energía de la frustración para realizar esfuerzos físicos defensivos útiles (presión tras pérdida) en vez de protestar."
      },
      psicologo: {
        evaluacionesComplementarias: ["CSAI-2R (Ansiedad somática, cognitiva y autoconfianza)"],
        tipoIntervencion: "Individual.",
        tecnicas: ["Autorregistro de emociones", "Establecimiento de zonas individuales de funcionamiento óptimo (IZOF)"],
        frecuencia: "Quincenal."
      },
      familia: {
        como_acompañar: "Ayudarle a separar su identidad personal de su rendimiento deportivo ('eres más que un futbolista').",
        que_evitar: "Minimizar sus sentimientos diciendo 'solo es un juego' cuando para él es algo vital.",
        entorno_apoyo: "Fomentar conversaciones sobre cómo manejaron ellos (los padres) la frustración en sus propios trabajos o vidas."
      }
    },
    alto: {
      dt: {
        entrenamiento: "Plantearle escenarios de liderazgo, poniéndolo a arbitrar un partido reducido o dirigir una tarea para que experimente empatía.",
        partido: "Darle el rol de 'pacificador'. Pedirle que intervenga cuando un compañero está perdiendo los estribos para calmarlo.",
        comunicacion: "Reconocer públicamente su madurez: 'Excelente cómo gestionaste esa entrada dura sin entrar en la provocación'."
      },
      jugador: {
        ejercicios: "Modela a tus compañeros. Tu lenguaje corporal sereno tras recibir un gol en contra le dirá al resto del equipo que aún se puede ganar.",
        rutina: "Canaliza tu estabilidad para realizar la última arenga motivacional justa antes de saltar al campo.",
        autogestión: "Sigue perfeccionando tu ecuanimidad. Eres el ancla emocional del equipo en escenarios visitantes o adversos."
      },
      psicologo: {
        evaluacionesComplementarias: ["Ninguna requerida; perfil protector alto."],
        tipoIntervencion: "Preventiva/Grupal (puede actuar como co-facilitador o ejemplo).",
        tecnicas: ["Consolidación de rutinas de Flow", "Mentoring en inteligencia emocional grupal"],
        frecuencia: "Mensual o bimensual."
      },
      familia: {
        como_acompañar: "Valorar y elogiar expresamente su nivel de madurez y señorío deportivo frente a las provocaciones.",
        que_evitar: "Ignorar que, aunque sea maduro, también necesita desahogarse de vez en cuando.",
        entorno_apoyo: "Mantener el soporte familiar para que su inteligencia emocional en el campo se refleje en su crecimiento como ser humano adulto."
      }
    }
  },
  'Autodiálogo y enfoque mental': {
    bajo: {
      dt: {
        entrenamiento: "Evitar sarcasmos o ironías ('hoy viniste a caminar'). Dar indicaciones técnico-tácticas 100% enfocadas en la tarea, no en el rasgo ('apoya más cerca' vs 'eres muy lento').",
        partido: "Reforzar visible y auditivamente las buenas acciones simples. Retirarlo de situaciones donde su espiral de negatividad hunda al equipo.",
        comunicacion: "Prohibirle verbalizar quejas en voz alta sobre sí mismo ('qué malo soy'). Exigir lenguaje corporal erguido."
      },
      jugador: {
        ejercicios: "Técnica de la 'Bofetada mental': cada vez que te digas 'no puedo' o 'soy un desastre', imagínate una señal de STOP roja y cambia la frase por 'voy a la siguiente'.",
        rutina: "Escribe 3 afirmaciones positivas sobre tu juego (ej. 'soy rápido', 'tengo buen pase') y léelas en el celular camino al estadio.",
        autogestión: "Trátate a ti mismo como tratarías a tu mejor amigo si hubiera fallado ese mismo pase."
      },
      psicologo: {
        evaluacionesComplementarias: ["Self-Talk Questionnaire (S-TQ)", "Inventario de Depresión de Beck (BDI) si hay sospecha clínica severa."],
        tipoIntervencion: "Individual.",
        tecnicas: ["Detención del pensamiento (Thought Stopping)", "Reestructuración cognitiva (identificación de distorsiones: pensamiento dicotómico, catastrofización)."],
        frecuencia: "Semanal."
      },
      familia: {
        como_acompañar: "Vigilar el lenguaje que usan en casa. Fomentar una cultura donde el error es un paso necesario para el aprendizaje.",
        que_evitar: "Utilizar lenguaje castigador tras un mal partido ('qué vergüenza cómo jugaste hoy').",
        entorno_apoyo: "Reforzar sus talentos fuera del campo escolar o familiar para fortalecer su autoesquema global."
      }
    },
    medio: {
      dt: {
        entrenamiento: "Forzar escenarios donde falle repetidamente (ej. definición en fatiga con portero en superioridad) para evaluar cómo se repone mentalmente.",
        partido: "Darle pautas claras de enfoque: 'Tu trabajo hoy es ganar la espalda del cinco, si no sale a la primera, sigue insistiendo'.",
        comunicacion: "Preguntar de forma asertiva: '¿Qué te estás diciendo a ti mismo ahora mismo?' cuando se le vea desconcentrado."
      },
      jugador: {
        ejercicios: "Usa el autodiálogo instruccional. En vez de decir 'tengo que meter el gol' (resultado), dite a ti mismo 'cuerpo sobre el balón y golpeo con el empeine' (proceso).",
        rutina: "Desarrolla una rutina post-error: aplaudir una vez para resetear y decir en voz baja 'ya pasó, foco'.",
        autogestión: "Convierte tus nervios en activación útil. Si te dices 'estoy nervioso', cámbialo por 'estoy preparado y mi cuerpo está listo'."
      },
      psicologo: {
        evaluacionesComplementarias: ["CPRD (factor de Control del Estrés)"],
        tipoIntervencion: "Individual.",
        tecnicas: ["Entrenamiento en Autodiálogo Instruccional vs Motivacional", "Técnicas de ensayo mental (PETTLEP model)"],
        frecuencia: "Quincenal."
      },
      familia: {
        como_acompañar: "Escuchar empáticamente cuando relate sus errores, ayudándole a encuadrarlos objetivamente ('¿de verdad jugaste tan mal o solo fue esa jugada?').",
        que_evitar: "Darle sermones de positividad tóxica ('tú eres el mejor, no llores').",
        entorno_apoyo: "Proveer un refugio seguro donde pueda expresar sus dudas sin temor a defraudar expectativas familiares."
      }
    },
    alto: {
      dt: {
        entrenamiento: "Usarlo como modelo para jugadores más jóvenes; pedirle que vocalice su autodiálogo en las tareas para que otros aprendan.",
        partido: "Asignarle la responsabilidad de lanzar penales decisivos o asumir la salida de balón en momentos de altísima presión.",
        comunicacion: "Feedback estratégico, focalizado netamente en ajustes tácticos complejos, confiando en que su psique ya está equilibrada."
      },
      jugador: {
        ejercicios: "Usa el autodiálogo motivacional en momentos de fatiga muscular extrema (minuto 85): 'Estoy entero, un esfuerzo más'.",
        rutina: "Sigue perfeccionando tu preparación mental. Visualiza escenarios imprevistos (lesiones tempranas, arbitrajes injustos) para tener respuestas pre-programadas.",
        autogestión: "Identifica a compañeros que estén sufriendo un diálogo interno destructivo e intervén: dales una indicación clara para sacarlos de su negatividad."
      },
      psicologo: {
        evaluacionesComplementarias: ["No requiere."],
        tipoIntervencion: "Mantenimiento.",
        tecnicas: ["Optimización de rutinas pre-competitivas", "Potenciación de habilidades de afrontamiento (Coping skills)"],
        frecuencia: "A demanda."
      },
      familia: {
        como_acompañar: "Alimentar su curiosidad e interés por la psicología deportiva y el bienestar mental si muestra inclinación a ello.",
        que_evitar: "Dar por sentado que es 'indestructible' mentalmente; mantenerse atentos a signos sutiles de sobrecarga.",
        entorno_apoyo: "Celebrar su fortaleza mental tanto como un gol o una victoria."
      }
    }
  },
  'Autoconfianza y resiliencia': {
    bajo: {
      dt: {
        entrenamiento: "Diseñar tareas de 'éxito garantizado' (ej. definición sin portero, ruedas de pase sin oposición fuerte) para que experimente la sensación de acierto y reconstruya su autoeficacia.",
        partido: "Garantizar minutos de calidad en contextos favorables (partidos resueltos o rivales accesibles). No exponerlo de titular en partidos de altísima tensión si no está listo.",
        comunicacion: "Reforzar su esfuerzo y su intención, no solo el resultado. 'Me encantó cómo te atreviste a intentar el regate, a la próxima te sale'."
      },
      jugador: {
        ejercicios: "Lleva un 'Diario de Logros'. Cada noche escribe 3 cosas que hiciste bien en el entrenamiento. Oblígate a buscar lo positivo.",
        rutina: "Antes de salir al campo, recuerda vívidamente tu mejor partido. Recuerda cómo se sentía tu cuerpo, qué escuchabas, qué veías.",
        autogestión: "Entiende que la confianza no es la ausencia de miedo, es atreverse a hacer las cosas a pesar del miedo."
      },
      psicologo: {
        evaluacionesComplementarias: ["CSAI-2R (específicamente subescala de Autoconfianza)", "Escala de Resiliencia de Connor-Davidson (CD-RISC)"],
        tipoIntervencion: "Individual clínica.",
        tecnicas: ["Desensibilización sistemática (si hay traumas deportivos)", "Terapia de Aceptación y Compromiso (ACT)", "Modelado (Bandura)"],
        frecuencia: "Semanal."
      },
      familia: {
        como_acompañar: "Aislar el amor y la valía personal del rendimiento en el campo. Transmitir: 'Te quiero exactamente igual juegues bien o mal'.",
        que_evitar: "Compararlo con otros compañeros de equipo que destacan más ('¿por qué no vas al choque como Pedro?').",
        entorno_apoyo: "Fomentar un entorno hogareño seguro, mostrando ejemplos de ídolos suyos que pasaron por malas rachas y se recuperaron."
      }
    },
    medio: {
      dt: {
        entrenamiento: "Graduar la dificultad. Iniciar tareas con superioridad ofensiva (3v2) y terminar con igualdad (3v3) exigiendo que asuma duelos 1v1.",
        partido: "Animarle a liderar acciones específicas en las que tiene talento (ej. pedirle que sea el único encargado de los saques de esquina).",
        comunicacion: "Utilizar el efecto Pigmalión positivo: mostrar expectativas altas y realistas sobre su capacidad ('Sé que puedes frenar a su extremo')."
      },
      jugador: {
        ejercicios: "Cuando falles, adopta una postura corporal expansiva (pecho afuera, cabeza alta). La postura del cuerpo envía señales de confianza al cerebro.",
        rutina: "Visualiza la adversidad. Imagina que empiezas el partido jugando mal, y visualiza cómo paso a paso recuperas tu nivel con acciones sencillas.",
        autogestión: "Aplica la mentalidad de crecimiento: 'Aún no me sale este gesto técnico, pero estoy en proceso de aprenderlo'."
      },
      psicologo: {
        evaluacionesComplementarias: ["Cuestionario de Orientación a la Tarea/Ego (TEOSQ)"],
        tipoIntervencion: "Individual.",
        tecnicas: ["Establecimiento de objetivos (SMART) orientados al proceso, no al resultado", "Entrenamiento en Autoeficacia"],
        frecuencia: "Quincenal."
      },
      familia: {
        como_acompañar: "Reforzar su resiliencia tras pequeñas derrotas. Ayudarle a analizar qué aprendió del partido que perdieron.",
        que_evitar: "Dar excusas externas a sus fracasos ('el árbitro los robó', 'el entrenador te tiene manía'). Enseñar responsabilidad.",
        entorno_apoyo: "Promover la independencia. Dejar que prepare su mochila, asuma sus responsabilidades escolares y deportivas."
      }
    },
    alto: {
      dt: {
        entrenamiento: "Llevarlo al límite. Ponerlo a defender en inferioridad o pitar en su contra para retar su resiliencia bajo presión simulada.",
        partido: "Delegan en él la función de sostener mentalmente al equipo cuando el marcador es adverso. Es el 'jugador franquicia' en lo mental.",
        comunicacion: "Hablarle sobre mantener la consistencia. Cuidar que su alta autoconfianza no se convierta en arrogancia o suficiencia."
      },
      jugador: {
        ejercicios: "Trabaja la autocrítica constructiva. Ser muy confiado es bueno, pero revisa siempre videos de tus partidos buscando el 1% de mejora continua.",
        rutina: "Conviértete en el escudo de los jugadores más jóvenes o con menos confianza. Absorbe la presión mediática o de la grada para liberarlos a ellos.",
        autogestión: "Mantente humilde. Recuerda siempre de dónde vienes y que la resiliencia es un músculo que debe ejercitarse todos los días."
      },
      psicologo: {
        evaluacionesComplementarias: ["No requiere, pero vigilar niveles de Narcisismo o Ego excesivo."],
        tipoIntervencion: "Mentoring.",
        tecnicas: ["Prevención del exceso de confianza (Overconfidence)", "Estrategias de anclaje a la tarea"],
        frecuencia: "A demanda."
      },
      familia: {
        como_acompañar: "Mantenerlo con los pies en la tierra. En el alto rendimiento formativo, los elogios externos sobrarán; la familia debe aportar normalidad.",
        que_evitar: "Alimentar un ego desmedido fomentando que se crea imprescindible para el club.",
        entorno_apoyo: "Exigir el mismo nivel de excelencia y esfuerzo en sus estudios académicos o desarrollo personal fuera del césped."
      }
    }
  },
  'Comunicación emocional': {
    bajo: {
      dt: {
        entrenamiento: "Obligarlo a interactuar mediante dinámicas condicionadas: el pase no vale si no grita el nombre de a quién se la pasa.",
        partido: "No saturarle con exigencias de mando vocal. Dejar que su comunicación en el campo sea primero exclusivamente táctica (indicaciones básicas).",
        comunicacion: "Llamarlo en privado, lejos del grupo, para darle feedback. En público se sentirá expuesto y cohibido."
      },
      jugador: {
        ejercicios: "Empieza por lo no verbal: choca la mano de un compañero tras un buen corte o una buena parada. El contacto físico rompe el hielo.",
        rutina: "Antes de empezar el entrenamiento, oblígate a saludar mirando a los ojos a tres compañeros y al cuerpo técnico.",
        autogestión: "Entiende que no tienes que ser el que más grita. Comunicar con eficacia es hablar poco pero justo en el momento adecuado."
      },
      psicologo: {
        evaluacionesComplementarias: ["Test de Habilidades Sociales (ej. EHS de Gismero)", "Sociograma deportivo"],
        tipoIntervencion: "Individual y progresivamente Grupal.",
        tecnicas: ["Entrenamiento en Asertividad y Habilidades Sociales", "Técnicas de Role-playing", "Reestructuración de la fobia social (si la hay)"],
        frecuencia: "Semanal."
      },
      familia: {
        como_acompañar: "Fomentar la expresión de emociones en la mesa: '¿Qué fue lo mejor y lo peor de tu día?'.",
        que_evitar: "Obligarle a ser extrovertido ('anda, háblales, no seas tímido') generándole mayor ansiedad social.",
        entorno_apoyo: "Respetar su introversión, proporcionando un ambiente empático donde pueda hablar a su ritmo."
      }
    },
    medio: {
      dt: {
        entrenamiento: "Darle el rol de 'capitán de tarea'. Que sea el encargado de explicar un ejercicio conocido al resto del grupo.",
        partido: "Animarle a dar indicaciones desde su posición a la línea que tiene por delante (ej. portero a defensas, defensas a medios).",
        comunicacion: "Preguntarle en las charlas del descanso frente a todos: '¿Cómo ves el marcaje por la derecha?', validando su opinión públicamente."
      },
      jugador: {
        ejercicios: "Mejora tu comunicación asertiva. En vez de gritar '¡baja a defender!', usa '¡ayúdame en la cobertura!'.",
        rutina: "Observa a los líderes de equipos profesionales cómo usan sus manos y su postura para comunicar calma o intensidad a sus compañeros.",
        autogestión: "La comunicación emocional también es escuchar. Cuando un compañero falla y se frustra, acércate y dile 'tranquilo, estamos juntos en esto'."
      },
      psicologo: {
        evaluacionesComplementarias: ["CPRD (Subescala de Cohesión de Equipo)"],
        tipoIntervencion: "Grupal/Dinámicas de equipo.",
        tecnicas: ["Comunicación No Violenta (CNV)", "Análisis de video-feedback de interacciones no verbales en partido"],
        frecuencia: "Mensual."
      },
      familia: {
        como_acompañar: "Animarlo a que asuma pequeños roles de liderazgo comunicativo en su círculo de amigos o en trabajos del colegio.",
        que_evitar: "Criticar cómo se dirigen a él sus compañeros sin entender las dinámicas propias del vestuario.",
        entorno_apoyo: "Celebrar cuando tome la iniciativa de organizar reuniones o salidas con sus compañeros de equipo."
      }
    },
    alto: {
      dt: {
        entrenamiento: "Utilizarlo como el 'eco' del entrenador en el campo. Que transmita la intensidad y las correcciones de forma constructiva al grupo.",
        partido: "Darle libertad para organizar corrillos previos al partido o al descanso. Es un catalizador emocional del vestuario.",
        comunicacion: "Tener reuniones privadas periódicas con él para sondear el 'clima del vestuario', utilizándolo como termómetro social."
      },
      jugador: {
        ejercicios: "Aprende a modular tu comunicación según el perfil del compañero: algunos necesitan un grito fuerte de alerta, otros un consejo tranquilo al oído.",
        rutina: "Hazte cargo de integrar comunicativamente a los jugadores nuevos, tímidos o a los que acaban de subir de categoría.",
        autogestión: "Cuidado con la sobre-comunicación (hablar demasiado). Aprende a usar el silencio también como una herramienta de concentración."
      },
      psicologo: {
        evaluacionesComplementarias: ["No requiere."],
        tipoIntervencion: "Mentoring.",
        tecnicas: ["Liderazgo transformacional", "Técnicas de mediación y resolución de conflictos"],
        frecuencia: "A demanda (trabajo conjunto para gestionar el clima del equipo)."
      },
      familia: {
        como_acompañar: "Brindar espacios para que descanse de su rol de mediador o líder comunicativo que asume en el fútbol.",
        que_evitar: "Permitir que la presión de ser el portavoz del equipo afecte su propia tranquilidad emocional.",
        entorno_apoyo: "Reconocer y valorar sus habilidades sociales que, sin duda, le servirán enormemente para su vida profesional y personal futura."
      }
    }
  },
  'Vínculo y cohesión': {
    bajo: {
      dt: {
        entrenamiento: "Plantear ejercicios lúdicos o juegos de cooperación obligatoria (ej. rondo agarrados de las manos) para romper barreras físicas y psicológicas.",
        partido: "Integrarlo progresivamente. Si entra de cambio, que sea acompañado por un jugador de su confianza. Fomentar celebraciones conjuntas.",
        comunicacion: "Mostrar cercanía y empatía. Interesarse por su vida fuera del fútbol (estudios, hobbies) para generar un vínculo de confianza DT-jugador."
      },
      jugador: {
        ejercicios: "Intenta identificar un interés en común (música, videojuegos, equipo favorito) con al menos un compañero diferente cada semana.",
        rutina: "Quédate 5 minutos más después del entrenamiento practicando tiros libres o estirando con alguien del equipo.",
        autogestión: "Nadie te pide que seas el alma de la fiesta, pero el fútbol es un deporte de equipo. Sentirte parte del grupo mejorará tu rendimiento individual."
      },
      psicologo: {
        evaluacionesComplementarias: ["Sociograma (identificar si es un jugador aislado/rechazado)", "Test de Clima Motivacional (PMCSQ-2)"],
        tipoIntervencion: "Individual y mediación con el DT.",
        tecnicas: ["Entrevistas motivacionales", "Dinámicas de Team Building guiadas", "Identificación de intereses comunes"],
        frecuencia: "Semanal."
      },
      familia: {
        como_acompañar: "Animarlo a participar en los 'terceros tiempos' o comidas de equipo, sin forzarlo si le genera rechazo frontal.",
        que_evitar: "Fomentar un individualismo extremo ('tú juega para ti y lúcete, los demás no importan').",
        entorno_apoyo: "Invitar ocasionalmente a algún compañero de su equipo a la casa para facilitar la socialización en un terreno seguro para él."
      }
    },
    medio: {
      dt: {
        entrenamiento: "Fomentar ejercicios en grupos de 3 o 4 donde deban resolver un problema táctico y llegar a un acuerdo juntos antes de ejecutar.",
        partido: "Animarle a que asuma responsabilidad en la recuperación de un compañero tras un error ('ve y levántalo').",
        comunicacion: "Reforzar el concepto de 'familia' o 'manada'. Resaltar sus aportes al funcionamiento del grupo (asistencias, coberturas)."
      },
      jugador: {
        ejercicios: "En el partido, si haces un gol, ve primero a abrazar a quien te dio la asistencia. Valora el trabajo invisible de los demás.",
        rutina: "Involúcrate en los rituales del equipo (el saludo, el grito final, la música en el vestuario).",
        autogestión: "Entiende que en un equipo hay diferentes personalidades. No necesitas ser amigo íntimo de todos, pero sí respetarlos a todos en el campo."
      },
      psicologo: {
        evaluacionesComplementarias: ["GEQ (Group Environment Questionnaire) adaptado al español."],
        tipoIntervencion: "Grupal.",
        tecnicas: ["Dinámicas de establecimiento de la Identidad del Equipo", "Creación de Misión y Valores compartidos"],
        frecuencia: "Mensual."
      },
      familia: {
        como_acompañar: "Apoyar la cultura del club. Si hay eventos solidarios o institucionales, motivar su participación activa.",
        que_evitar: "Criticar constantemente al DT o a compañeros frente a él, lo cual fisura el vínculo del jugador con el grupo.",
        entorno_apoyo: "Fomentar la camaradería de los padres en la grada para proyectar una cohesión similar hacia el terreno de juego."
      }
    },
    alto: {
      dt: {
        entrenamiento: "Nombrarlo embajador de la cultura del equipo. Utilizarlo para que enseñe a los juveniles los valores y reglas del vestuario.",
        partido: "Confiar en él para cohesionar las líneas en el campo (que la defensa no se hunda, que el ataque presione). Es el pegamento táctico e interpersonal.",
        comunicacion: "Tratarlo como un líder integrador. Pedirle ayuda explícita para recuperar anímicamente a jugadores que están pasando por un mal momento."
      },
      jugador: {
        ejercicios: "Presta atención a los detalles: nota si un compañero llega cabizbajo al entrenamiento y pregúntale cómo está antes de empezar.",
        rutina: "Promueve y protege los códigos del vestuario. Si hay roces o clanes (grupos divididos), sé el puente que los une.",
        autogestión: "Mantén la equidad. Tu rol como conector del grupo exige que trates con el mismo respeto al jugador estrella y al que menos minutos juega."
      },
      psicologo: {
        evaluacionesComplementarias: ["No requiere."],
        tipoIntervencion: "Mentoring.",
        tecnicas: ["Mantenimiento del clima grupal", "Asesoramiento en resolución de conflictos de vestuario"],
        frecuencia: "A demanda."
      },
      familia: {
        como_acompañar: "Disfrutar de la madurez y la capacidad de empatía que ha desarrollado gracias al entorno de equipo.",
        que_evitar: "Dejar que la familia se involucre en los problemas del vestuario que él mismo ya tiene capacidad de gestionar.",
        entorno_apoyo: "Respaldar su sentido de pertenencia y lealtad institucional como un valor positivo para su vida."
      }
    }
  },
  'Liderazgo emocional': {
    bajo: {
      dt: {
        entrenamiento: "No forzar la asunción de roles de liderazgo (ej. no darle el gafete de capitán). Permitirle liderarse primero a sí mismo y focalizarse en su tarea.",
        partido: "Quitarle peso organizativo. Su única responsabilidad es cumplir con su rol táctico y esforzarse al máximo.",
        comunicacion: "Validar el 'liderazgo desde el ejemplo'. 'No hace falta que hables mucho, con tu entrega hoy marcaste el camino al resto'."
      },
      jugador: {
        ejercicios: "El liderazgo empieza por uno mismo: lidera tu propia actitud, llega puntual, no te quejes de los ejercicios, sé el primero en correr.",
        rutina: "Observa a los capitanes o líderes de tu equipo. Identifica qué hacen bien para inspirar a otros y trata de imitar un detalle pequeño.",
        autogestión: "No te frustres si no te sale ser el 'alfa' del grupo. El equipo también necesita soldados y trabajadores silenciosos y efectivos."
      },
      psicologo: {
        evaluacionesComplementarias: ["LJI-2 (Indicador de Estilos de Liderazgo)", "Test de Personalidad (ej. EPI o BFQ)"],
        tipoIntervencion: "Individual enfocada en el Autoliderazgo.",
        tecnicas: ["Identificación de fortalezas personales", "Role-playing de situaciones de influencia de baja intensidad"],
        frecuencia: "Quincenal."
      },
      familia: {
        como_acompañar: "Aceptar su perfil sin presionarlo a que sea el 'capitán'. Valorar el rol que cumple dentro de la maquinaria del equipo.",
        que_evitar: "Comentarios como 'tienes que hacerte respetar', 'manda tú', que le exigen un comportamiento que choca con su naturaleza.",
        entorno_apoyo: "Fomentar el liderazgo personal en áreas donde se sienta cómodo (estudios, organización de sus tareas en casa)."
      }
    },
    medio: {
      dt: {
        entrenamiento: "Asignarle el liderazgo de pequeños subgrupos (ej. líder de la defensa en ejercicios de basculación).",
        partido: "Animarle a que corrija posiciones de compañeros cercanos durante el partido, asumiendo su cuota de responsabilidad.",
        comunicacion: "Reforzar su influencia: 'Cuando tú subes la intensidad, el resto del equipo te sigue. Necesito que inicies esa chispa hoy'."
      },
      jugador: {
        ejercicios: "Da el salto. Cuando el equipo esté pasando un mal momento físico o táctico en el entrenamiento, lanza un mensaje de ánimo general.",
        rutina: "Asume responsabilidades pequeñas: ayudar a recoger el material, organizar el calentamiento táctico si el profe no ha llegado.",
        autogestión: "Entiende que el liderazgo no es imponer; es servir. Lideras cuando le facilitas el trabajo al compañero."
      },
      psicologo: {
        evaluacionesComplementarias: ["Evaluación 360 grados (feedback de compañeros y DT)"],
        tipoIntervencion: "Grupal/Individual.",
        tecnicas: ["Desarrollo de estilos de Liderazgo Transformacional", "Técnicas de comunicación directiva vs empática"],
        frecuencia: "Mensual."
      },
      familia: {
        como_acompañar: "Alentar sus iniciativas para proponer ideas o actividades dentro del grupo, fortaleciendo su seguridad.",
        que_evitar: "Fomentar actitudes de superioridad sobre sus compañeros a medida que adquiere estatus en el equipo.",
        entorno_apoyo: "Elogiar su capacidad de influencia positiva en la vida de los demás, conectando el deporte con habilidades para el futuro laboral."
      }
    },
    alto: {
      dt: {
        entrenamiento: "Involucrarlo en decisiones del equipo. Pedirle su opinión sobre el estado físico y anímico del grupo para ajustar cargas de trabajo.",
        partido: "Otorgarle autoridad en el campo (brazalete de capitán, si corresponde). Confiar en su lectura para gestionar ventajas o desventajas en el marcador.",
        comunicacion: "Trato de extensión del cuerpo técnico. 'Maneja tú los ritmos ahora, si ves que están cansados, baja el bloque'."
      },
      jugador: {
        ejercicios: "El verdadero líder crea otros líderes. Identifica a compañeros con potencial y guíalos, dales responsabilidades para que crezcan a tu lado.",
        rutina: "Sé impecable en la gestión de conflictos. Si hay roces tras el partido, gestiona la situación en el vestuario antes de que se haga un problema grande.",
        autogestión: "El líder también se agota. Aprende a delegar y apóyate en tus sub-capitanes o en el DT cuando sientas que la carga emocional del equipo te supera."
      },
      psicologo: {
        evaluacionesComplementarias: ["No requiere. Monitorear estrés o Burnout asociado al rol."],
        tipoIntervencion: "Mentoring Ejecutivo/Deportivo.",
        tecnicas: ["Gestión del desgaste por empatía (Fatiga por compasión)", "Espacio de descarga emocional segura"],
        frecuencia: "A demanda (esencial para evitar el 'Burnout del líder')."
      },
      familia: {
        como_acompañar: "Proveer un espacio de desconexión absoluta en casa, ya que sostiene una alta carga de responsabilidad y presión sobre sus hombros.",
        que_evitar: "Cargarle más responsabilidades 'adultas' en casa bajo el pretexto de que 'como es el capitán, él puede con todo'.",
        entorno_apoyo: "Ser su refugio emocional; un lugar donde pueda permitirse ser vulnerable, fallar y no tener que liderar a nadie por unas horas."
      }
    }
  }
};

/**
 * Obtiene las recomendaciones completas para una subdimensión y nivel específicos.
 * @param {string} subescala - Nombre de la subdimensión (ej. 'Percepción del entorno').
 * @param {string} nivel - Nivel de la puntuación ('bajo', 'medio', 'alto').
 * @returns {Object|null}
 */
export function getRecomendaciones(subescala, nivel) {
  return RECOMENDACIONES_EPSD[subescala]?.[nivel] || null;
}

/**
 * Obtiene las recomendaciones específicas para un actor, subdimensión y nivel.
 * @param {string} subescala - Nombre de la subdimensión.
 * @param {string} nivel - Nivel de la puntuación ('bajo', 'medio', 'alto').
 * @param {string} actor - Actor objetivo ('dt', 'jugador', 'psicologo', 'familia').
 * @returns {Object|null}
 */
export function getRecomendacionesPorActor(subescala, nivel, actor) {
  return RECOMENDACIONES_EPSD[subescala]?.[nivel]?.[actor] || null;
}
