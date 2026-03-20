import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { X, Printer } from 'lucide-react';

export default function EpsdEliteReport({ playerData, evalData, previousEval, aiData, historicalAvg, onClose }) {
  const comparisonChartRef = useRef(null);
  const radarChartRef = useRef(null);
  const comparisonChartInstance = useRef(null);
  const radarChartInstance = useRef(null);

  // Helper matching robusto para subescalas
  const getSubKeys = (evalObj, sub) => {
    return Object.keys(evalObj.respuestas || {}).filter(k => 
      k.toLowerCase().includes(sub.toLowerCase()) || 
      (sub === "Percepción del entorno" && (k.includes("COGNITIVO-0") || k.includes("Percepción"))) ||
      (sub === "Toma de decisiones" && (k.includes("COGNITIVO-1") || k.includes("Toma"))) ||
      (sub === "Control atencional" && (k.includes("COGNITIVO-2") || k.includes("Atención"))) ||
      (sub === "Gestión emocional" && (k.includes("EMOCIONAL-0") || k.includes("Gestión"))) ||
      (sub === "Autodiálogo y enfoque mental" && (k.includes("EMOCIONAL-1") || k.includes("Autodiálogo"))) ||
      (sub === "Autoconfianza y resiliencia" && (k.includes("EMOCIONAL-2") || k.includes("Autoconfianza"))) ||
      (sub === "Comunicación emocional" && (k.includes("SOCIAL-0") || k.includes("CONDUCTUAL-0") || k.includes("Comunicación"))) ||
      (sub === "Vínculo y cohesión" && (k.includes("SOCIAL-1") || k.includes("CONDUCTUAL-1") || k.includes("Vínculo"))) ||
      (sub === "Liderazgo emocional" && (k.includes("SOCIAL-2") || k.includes("CONDUCTUAL-2") || k.includes("Liderazgo")))
    );
  };

  const getSubScore = (evalObj, sub) => {
    if (!evalObj || !evalObj.respuestas) return 0;
    const keys = getSubKeys(evalObj, sub);
    let sumaAvg = 0, cont = 0;
    keys.forEach(k => {
      const data = evalObj.respuestas[k];
      if (!data) return;
      let sN = 0, cN = 0;
      ["0-25", "26-45", "45-70", "71-90"].forEach(int => {
        if (data[int]?.nivel) { sN += data[int].nivel; cN++; }
      });
      if (cN > 0) { sumaAvg += (sN / cN); cont++; }
    });
    return (cont > 0 ? (sumaAvg / cont) * 20 : 0);
  };

  const getDomainScore = (evalObj, domainName) => {
    if (!evalObj) return 0;
    
    // Tabla oficial de pesos por posición
    const POSITION_WEIGHTS = {
      "ARQ": {
        "Percepción del entorno": 10, "Toma de decisiones": 10, "Control atencional": 20,
        "Gestión emocional": 15, "Autodiálogo y enfoque mental": 10, "Autoconfianza y resiliencia": 15,
        "Comunicación emocional": 12, "Vínculo y cohesión": 3, "Liderazgo emocional": 5
      },
      "DEF": {
        "Percepción del entorno": 18, "Toma de decisiones": 12, "Control atencional": 15,
        "Gestión emocional": 8, "Autodiálogo y enfoque mental": 10, "Autoconfianza y resiliencia": 12,
        "Comunicación emocional": 15, "Vínculo y cohesión": 5, "Liderazgo emocional": 5
      },
      "MC": {
        "Percepción del entorno": 22, "Toma de decisiones": 20, "Control atencional": 10,
        "Gestión emocional": 8, "Autodiálogo y enfoque mental": 10, "Autoconfianza y resiliencia": 10,
        "Comunicación emocional": 8, "Vínculo y cohesión": 7, "Liderazgo emocional": 5
      },
      "DL": {
        "Percepción del entorno": 12, "Toma de decisiones": 18, "Control atencional": 10,
        "Gestión emocional": 10, "Autodiálogo y enfoque mental": 15, "Autoconfianza y resiliencia": 20,
        "Comunicación emocional": 5, "Vínculo y cohesión": 5, "Liderazgo emocional": 5
      }
    };

    const weights = evalObj.configWeights || POSITION_WEIGHTS[evalObj.posicion] || {
      "Percepción del entorno": 15, "Toma de decisiones": 15, "Control atencional": 15,
      "Gestión emocional": 10, "Autodiálogo y enfoque mental": 10, "Autoconfianza y resiliencia": 10,
      "Comunicación emocional": 10, "Vínculo y cohesión": 8, "Liderazgo emocional": 7
    };
    const structure = {
      "COGNITIVO": ["Percepción del entorno", "Toma de decisiones", "Control atencional"],
      "EMOCIONAL": ["Gestión emocional", "Autodiálogo y enfoque mental", "Autoconfianza y resiliencia"],
      "SOCIAL": ["Comunicación emocional", "Vínculo y cohesión", "Liderazgo emocional"]
    };
    
    const subs = structure[domainName === 'CONDUCTUAL-SOCIAL' ? 'SOCIAL' : domainName] || [];
    let totalDominio = 0, weightSum = 0;
    subs.forEach(sub => {
      const w = weights[sub] || 0;
      weightSum += w;
      const score = getSubScore(evalObj, sub);
      totalDominio += (score * w) / 100;
    });
    return weightSum > 0 ? Math.min(100, (totalDominio / weightSum) * 100) : 0;
  };

  useEffect(() => {
    if (comparisonChartInstance.current) comparisonChartInstance.current.destroy();
    if (radarChartInstance.current) radarChartInstance.current.destroy();

    const subLabelsFull = [
        "Percepción del entorno", "Toma de decisiones", "Control atencional",
        "Gestión emocional", "Autodiálogo y enfoque mental", "Autoconfianza y resiliencia",
        "Comunicación emocional", "Vínculo y cohesión", "Liderazgo emocional"
    ];
    const subLabelsShort = ['Percepción','Decisiones','Atención','Gestión\nEmocional','Autodiálogo','Autoconfianza','Comunicación','Vínculo','Liderazgo'];

    const currentScores = subLabelsFull.map(l => getSubScore(evalData, l));
    const prevScores = previousEval ? subLabelsFull.map(l => getSubScore(previousEval, l)) : [];

    if (comparisonChartRef.current) {
        const datasets = [];
        
        if (isInitial) {
          // Un solo dataset para inicial
          datasets.push({
            label: 'Rendimiento Actual',
            data: currentScores,
            backgroundColor: 'rgba(0, 217, 192, 0.3)',
            borderColor: 'rgba(0, 217, 192, 1)',
            borderWidth: 2,
          });
        } else {
          // Comparativa P1 vs P2
          datasets.push({
            label: `P1: ${previousEval?.contexto?.torneo || 'Previa'}`,
            data: prevScores,
            backgroundColor: 'rgba(168,189,208,0.3)',
            borderColor: 'rgba(168,189,208,0.8)',
            borderWidth: 2,
          });
          datasets.push({
            label: `P2: ${evalData.contexto?.torneo || 'Actual'}`,
            data: currentScores,
            backgroundColor: 'rgba(232,68,68,0.3)',
            borderColor: 'rgba(232,68,68,1)',
            borderWidth: 2,
          });
        }

        comparisonChartInstance.current = new Chart(comparisonChartRef.current, {
          type: 'bar',
          data: {
            labels: subLabelsShort,
            datasets: datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true, max: 100,
                grid: { color: 'rgba(255,255,255,.06)' },
                ticks: { color: '#A8BDD0', font: { size: 11, family: 'Barlow' }, callback: v => v + '%' },
                border: { color: 'rgba(255,255,255,.1)' }
              },
              x: {
                grid: { display: false },
                ticks: { color: '#FFFFFF', font: { size: 10, family: 'Barlow', weight: '500' } },
                border: { color: 'rgba(255,255,255,.1)' }
              }
            },
            plugins: {
              legend: {
                display: true, position: 'bottom',
                labels: { color: '#A8BDD0', font: { size: 12, family: 'Barlow' }, padding: 15 }
              },
              tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.raw.toFixed(1)}%` } }
            }
          }
        });
    }

    if (radarChartRef.current) {
        radarChartInstance.current = new Chart(radarChartRef.current, {
          type: 'radar',
          data: {
            labels: subLabelsShort,
            datasets: [{
              label: isInitial ? 'Perfil Actual' : 'Perfil P2',
              data: currentScores,
              backgroundColor: isInitial ? 'rgba(0, 217, 192, 0.15)' : 'rgba(232,68,68,0.15)',
              borderColor: isInitial ? 'rgba(0, 217, 192, 0.9)' : 'rgba(232,68,68,0.9)',
              borderWidth: 2,
              pointBackgroundColor: isInitial ? 'rgba(0, 217, 192, 1)' : 'rgba(232,68,68,1)',
              pointBorderColor: '#fff',
              pointRadius: 5,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                beginAtZero: true, max: 100, min: 0,
                ticks: { stepSize: 25, color: 'rgba(168,189,208,.6)', font: { size: 10, family: 'Barlow' }, backdropColor: 'transparent', display: false },
                grid: { color: 'rgba(255,255,255,.08)' },
                angleLines: { color: 'rgba(255,255,255,.08)' },
                pointLabels: { color: '#A8BDD0', font: { size: 11, family: 'Barlow', weight: '500' } }
              }
            },
            plugins: { legend: { display: false } }
          }
        });
    }

    return () => {
        if (comparisonChartInstance.current) comparisonChartInstance.current.destroy();
        if (radarChartInstance.current) radarChartInstance.current.destroy();
    };
  }, [evalData, previousEval]);

  // Robust check for initial vs comparative/longitudinal
  const isInitial = (!previousEval) && 
                    (!aiData?.comparativa?.etiqueta?.includes('vs')) && 
                    (!aiData?.comparativa?.etiqueta?.includes('Longitudinal')) &&
                    (!aiData?.comparativa?.etiqueta?.includes('Evolución'));

  const styles = `
    .elite-report-container {
      --bg:        ${isInitial ? '#0B0E11' : '#0D1B2A'};
      --card:      ${isInitial ? '#14181D' : '#1A2E45'};
      --border:    ${isInitial ? '#252B33' : 'rgba(255,255,255,.06)'};
      --teal:      #00D9C0;
      --teal-dim:  #00A08E;
      --navy:      #0D1B2A;
      --accent:    ${isInitial ? '#00D9C0' : '#4CC9FE'};
      --accent-dim: ${isInitial ? '#00A08E' : '#3B82F6'};
      --green:     #00FF94;
      --amber:     #FFB800;
      --red:       #FF3B5C;
      --white:     #FFFFFF;
      --gray:      #8B95A0;
      --muted:     #A8BDD0;
      
      background: var(--bg);
      color: var(--white);
      font-family: 'Barlow', sans-serif;
      font-size: 15px;
      line-height: 1.6;
      min-height: 100vh;
      width: 100%;
      text-align: left;
    }

    @media print {
      .elite-report-container { background:#fff !important; color:#111 !important; }
      .no-print { display:none !important; }
      .card, .list-card, .chart-card, .rec-card, .alert-box, .conclusion-box { background:#f5f7fa !important; border:1px solid #ddd !important; color: #111 !important; }
      .header { -webkit-print-color-adjust:exact; print-color-adjust:exact; border-bottom: 3px solid var(--teal) !important; background: ${isInitial ? '#14181D' : '#0D1B2A'} !important; }
      .domain-card { -webkit-print-color-adjust:exact; print-color-adjust:exact; background:#f5f7fa !important; border: 1px solid #ddd !important; }
      .domain-score { color: #111 !important; }
      .section-title { color: var(--teal-dim) !important; border-bottom: 1px solid #ddd !important; }
    }

    .wrapper { max-width:980px; margin:0 auto; padding:0 20px 60px; }

    /* HEADER */
    .header {
      background: ${isInitial ? 'var(--card)' : 'linear-gradient(135deg, #0D1B2A 0%, #1a2e45 100%)'};
      border-bottom: 3px solid var(--accent);
      padding: 48px 20px 40px;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content:'';
      position:absolute; top:-80px; right:-80px;
      width:340px; height:340px; border-radius:50%;
      background: radial-gradient(circle, rgba(0,217,192,.1) 0%, transparent 70%);
    }
    .header-inner {
      max-width:980px; margin:0 auto;
      display:flex; align-items:center; justify-content:space-between;
      gap:24px; flex-wrap:wrap; position:relative; z-index:1;
    }
    .badge {
      display:inline-block;
      background: var(--accent); color: #000;
      font-family:'Barlow Condensed',sans-serif; font-weight:700;
      font-size:11px; letter-spacing:2px; text-transform:uppercase;
      padding:4px 12px; border-radius:2px; margin-bottom:12px;
    }
    .header h1 {
      font-family:'Barlow Condensed',sans-serif;
      font-size:52px; font-weight:900; line-height:1; letter-spacing:-1px;
      margin: 0;
    }
    .header h1 span { color: var(--teal); }
    .header-sub { font-size:14px; color:var(--muted); margin-top:8px; font-weight:300; }
    .header-meta { display:flex; gap:14px; flex-wrap:wrap; }
    .meta-pill {
      background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
      border-radius:6px; padding:10px 16px; text-align:center; min-width:100px;
    }
    .meta-pill .label { font-size:10px; color:var(--muted); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:4px; }
    .meta-pill .value { font-family:'Barlow Condensed',sans-serif; font-size:17px; font-weight:700; line-height:1.2; color: #fff; }

    /* INITIAL INDEX CIRCLE */
    .initial-hero {
      display: flex; align-items: center; justify-content: center;
      padding: 60px 0; gap: 60px; flex-wrap: wrap;
    }
    .index-circle {
      width: 220px; height: 220px; border-radius: 50%;
      border: 8px solid var(--teal);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: radial-gradient(circle, rgba(0,217,192,0.1) 0%, transparent 70%);
      box-shadow: 0 0 40px rgba(0,217,192,0.2);
    }
    .index-val { font-size: 72px; font-weight: 900; color: var(--teal); line-height: 1; }
    .index-label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: var(--muted); margin-top: 5px; }

    /* SECTION TITLE */
    .section-title {
      font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:800;
      letter-spacing:1px; text-transform:uppercase; color:var(--teal);
      margin:48px 0 20px; padding-bottom:10px;
      border-bottom:1px solid rgba(0,217,192,.2);
      display:flex; align-items:center; gap:10px;
    }
    .section-title::before {
      content:''; display:inline-block; width:4px; height:22px;
      background:var(--teal); border-radius:2px; flex-shrink:0;
    }

    /* CARD */
    .card { background:var(--card); border-radius:10px; padding:24px; border:1px solid var(--border); }

    /* DOMAIN CARDS */
    .domains-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:32px; }
    .domain-card {
      background:var(--card); border-radius:10px; padding:22px 20px;
      border-left:4px solid; position:relative; overflow:hidden;
      border: 1px solid var(--border);
    }
    .domain-card.red    { border-left-color:var(--red); }
    .domain-card.amber  { border-left-color:var(--amber); }
    .domain-card.verde  { border-left-color:var(--green); }
    .domain-card .domain-name { font-family:'Barlow Condensed',sans-serif; font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
    .domain-card .domain-score { font-family:'Barlow Condensed',sans-serif; font-size:42px; font-weight:900; line-height:1; margin-bottom:4px; }
    .domain-card.red   .domain-score { color:var(--red); }
    .domain-card.amber .domain-score { color:var(--amber); }
    .domain-card.verde .domain-score { color:var(--green); }
    .domain-card .domain-pct  { font-size:11px; color:var(--muted); margin-bottom:10px; }
    .domain-card .domain-label { font-size:11px; font-weight:600; color:var(--white); background:rgba(255,255,255,.07); padding:4px 8px; border-radius:4px; display:inline-block; line-height:1.4; }

    /* PARENT ANALYSIS SECTION */
    .parent-card {
      background: linear-gradient(135deg, rgba(0,217,192,0.05) 0%, transparent 100%);
      border: 1px solid rgba(0,217,192,0.2);
      border-radius: 12px; padding: 24px; margin-bottom: 32px;
    }
    .parent-card h4 { color: var(--teal); font-family: 'Barlow Condensed', sans-serif; font-size: 18px; text-transform: uppercase; margin-bottom: 15px; }
    .parent-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 15px; }
    .parent-item { font-size: 13px; color: var(--muted); line-height: 1.5; }
    .parent-item strong { color: var(--teal); display: block; margin-bottom: 4px; }

    /* TREND BOX */
    .trend-box {
      background:rgba(255,255,255,.05); border-radius:8px; padding:16px 20px; margin-bottom:24px;
      border-left:3px solid var(--red);
    }
    .trend-box .trend-title {
      font-family:'Barlow Condensed',sans-serif; font-size:13px; font-weight:700;
      letter-spacing:1.5px; text-transform:uppercase; color:var(--red); margin-bottom:8px;
    }
    .trend-items { display:flex; gap:20px; flex-wrap:wrap; }
    .trend-item { display:flex; align-items:center; gap:8px; }
    .trend-arrow { font-size:20px; }
    .trend-label { font-size:13px; color:var(--muted); }
    .trend-value { font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:700; }
    .down-red { color:var(--red); }
    .up-green { color:var(--green); }

    /* CHARTS */
    .charts-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:32px; }
    .chart-card { background:var(--card); border-radius:10px; padding:24px; border:1px solid var(--border); }
    .chart-card h3 { font-family:'Barlow Condensed',sans-serif; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:var(--muted); margin-bottom:20px; }
    .chart-wrap { position:relative; height:280px; }

    /* ALERT BOXES */
    .alert {
      border-radius:10px; padding:18px 20px; margin-bottom:20px;
      display:flex; align-items:flex-start; gap:14px; border-left:4px solid;
      text-align: left;
    }
    .alert.teal   { background:rgba(0,217,192,.08); border-color:var(--teal); }
    .alert.amber  { background:rgba(255,184,0,.08); border-color:var(--amber); }
    .alert.red    { background:rgba(255,59,92,.08); border-color:var(--red); }
    .alert-icon { font-size:24px; line-height:1; flex-shrink:0; }

    /* LIST ITEMS */
    .list-card { background:var(--card); border-radius:10px; padding:24px; margin-bottom:24px; border:1px solid var(--border); }
    .list-item { display:flex; align-items:flex-start; gap:14px; padding:16px 0; border-bottom:1px solid var(--border); }
    .list-item:last-child { border:none; padding-bottom:0; }
    .list-icon { font-size:20px; line-height:1; flex-shrink:0; width:40px; height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center; }
    .icon-green { background:rgba(0,255,148,.15); }
    .icon-red   { background:rgba(255,59,92,.15); }
    .icon-amber { background:rgba(255,184,0,.15); }
    .list-item p { flex:1; font-size:14px; line-height:1.6; margin: 0; }
    .list-item strong { display:block; font-weight:600; margin-bottom:4px; color: #fff; }

    /* REC CARDS */
    .rec-cards { display:grid; grid-template-columns:1fr; gap:16px; }
    .rec-card {
      background:var(--card); border-radius:10px; padding:22px 24px;
      border-left:4px solid; border:1px solid var(--border);
      text-align: left;
    }
    .rec-card.teal  { border-left:4px solid var(--teal); }
    .rec-card.amber { border-left:4px solid var(--amber); }
    .rec-num {
      font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:700;
      letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-bottom:10px;
    }
    .rec-card h4 {
      font-family:'Barlow Condensed',sans-serif; font-size:18px; font-weight:700;
      margin: 0 0 10px 0; color:var(--white);
    }
    .rec-card p { font-size:14px; line-height:1.6; color:rgba(255,255,255,.85); margin: 0; }

    /* CONCLUSION BOX */
    .conclusion-box {
      background:var(--card); border-radius:10px; padding:28px 32px;
      border:1px solid rgba(255,59,92,.3); margin-bottom:32px;
      text-align: left;
    }
    .conclusion-box h3 {
      font-family:'Barlow Condensed',sans-serif; font-size:20px; font-weight:800;
      letter-spacing:1px; color:var(--red); margin-bottom:16px;
      margin-top: 0;
    }
    .conclusion-box p { font-size:14px; line-height:1.7; margin-bottom:14px; color: #fff; }

    /* FOOTER */
    .footer {
      text-align:center; padding:24px; font-size:12px; color:var(--muted);
      border-top:1px solid var(--border); margin-top:60px;
    }

    .print-btn {
      position:fixed; bottom:30px; right:30px; z-index:9999;
      background:var(--teal); color:#000; border:none; border-radius:8px;
      padding:14px 24px; font-family:'Barlow',sans-serif; font-size:15px; font-weight:700;
      cursor:pointer; box-shadow:0 4px 20px rgba(0,217,192,.3);
      transition:all 0.2s;
    }
    .print-btn:hover { background:#00f0d5; transform:translateY(-2px); }
    .close-btn {
      position: absolute; top: 16px; right: 20px;
      background: rgba(255,255,255,0.1); border-radius: 50%;
      padding: 8px; cursor: pointer; z-index: 50; border: none; color: #fff;
    }
    .close-btn:hover { background: var(--red); }

    @media (max-width: 768px) {
      .domains-grid, .parent-grid, .charts-grid { grid-template-columns:1fr; }
      .header h1 { font-size:36px; }
      .initial-hero { flex-direction: column; gap: 30px; }
    }
  `;

  // Calcular dominios
  const currentDomCognitivo = getDomainScore(evalData, 'COGNITIVO');
  const currentDomEmocional = getDomainScore(evalData, 'EMOCIONAL');
  const currentDomSocial = getDomainScore(evalData, 'CONDUCTUAL-SOCIAL');
  const globalScore = (currentDomCognitivo + currentDomEmocional + currentDomSocial) / 3;

  const prevDomCognitivo = previousEval ? getDomainScore(previousEval, 'COGNITIVO') : 0;
  const prevDomEmocional = previousEval ? getDomainScore(previousEval, 'EMOCIONAL') : 0;
  const prevDomSocial = previousEval ? getDomainScore(previousEval, 'CONDUCTUAL-SOCIAL') : 0;

  const getDiffLabel = (curr, prev) => {
    if (isInitial) return "Nivel Base";
    const diff = curr - prev;
    const arrow = diff >= 0 ? '▲' : '▼';
    return `${arrow} ${Math.abs(diff).toFixed(0)}%`;
  };

  const getDiffColor = (curr, prev) => {
    if (isInitial) return "verde";
    const diff = curr - prev;
    if (diff > 5) return "verde";
    if (diff < -5) return "red";
    return "amber";
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/80 backdrop-blur-sm p-4 md:p-10">
      <style>{styles}</style>
      <div className="elite-report-container rounded-3xl overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="close-btn no-print">
          <X size={24} />
        </button>

        <div className="header">
          <div className="header-inner">
            <div>
              <div className="badge">
                {aiData?.comparativa?.etiqueta || (isInitial ? 'Evaluación Base' : 'Análisis Comparativo')}
              </div>
              <h1>
                {playerData.nombre.toUpperCase()}: <span>
                  {isInitial 
                    ? 'DIAGNÓSTICO INICIAL' 
                    : (aiData?.comparativa?.etiqueta?.includes('Longitudinal') 
                        ? 'DIAGNÓSTICO EVOLUTIVO' 
                        : `${previousEval.contexto?.torneo || 'P1'} vs ${evalData.contexto?.torneo || 'P2'}`)}
                </span>
              </h1>
              <div className="header-sub">Instrumento ePsD · PSMILE Method · {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</div>
            </div>
            <div className="header-meta">
              <div className="meta-pill">
                <div className="label">Posición</div>
                <div className="value">{playerData.posicion}</div>
              </div>
              <div className="meta-pill">
                <div className="label">Categoría</div>
                <div className="value">{playerData.categoria}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="wrapper">
          <div className="initial-hero">
             <div className="index-circle">
                <div className="index-val">{globalScore.toFixed(0)}</div>
                <div className="index-label">Índice Global</div>
             </div>
             <div className="flex-1 max-w-md">
                <div className="section-title">Enfoque del Diagnóstico</div>
                <p className="text-gray-400 text-sm italic">
                  {isInitial 
                    ? '"Este primer análisis establece la \'huella neurocognitiva\' del atleta. En lugar de compararlo con otros, definimos su hardware visual y software emocional actual para optimizar su toma de decisiones en cancha."' 
                    : '"Este diagnóstico integra la trayectoria histórica del atleta para identificar patrones de rendimiento estables y áreas de vulnerabilidad bajo presión, optimizando la intervención técnica."'}
                </p>
             </div>
          </div>
          
          <div className="section-title">{isInitial ? 'Métricas por Dominio' : (aiData?.comparativa?.etiqueta?.includes('Longitudinal') ? 'Evolución Histórica' : `Evolución ${previousEval.contexto?.torneo || 'P1'} → ${evalData.contexto?.torneo || 'P2'}`)}</div>
          <div className="domains-grid">
            <div className={`domain-card ${getDiffColor(currentDomCognitivo, prevDomCognitivo)}`}>
              <div className="domain-name">Cognitivo</div>
              <div className="domain-score">{getDiffLabel(currentDomCognitivo, prevDomCognitivo)}</div>
              <div className="domain-pct">{!isInitial ? `${prevDomCognitivo.toFixed(0)}% → ` : ''}{currentDomCognitivo.toFixed(0)}%</div>
              <div className="domain-label">{aiData?.comparativa?.cognitivo?.label || 'Analizando...'}</div>
            </div>
            <div className={`domain-card ${getDiffColor(currentDomEmocional, prevDomEmocional)}`}>
              <div className="domain-name">Emocional</div>
              <div className="domain-score">{getDiffLabel(currentDomEmocional, prevDomEmocional)}</div>
              <div className="domain-pct">{!isInitial ? `${prevDomEmocional.toFixed(0)}% → ` : ''}{currentDomEmocional.toFixed(0)}%</div>
              <div className="domain-label">{aiData?.comparativa?.emocional?.label || 'Analizando...'}</div>
            </div>
            <div className={`domain-card ${getDiffColor(currentDomSocial, prevDomSocial)}`}>
              <div className="domain-name">Conductual-Social</div>
              <div className="domain-score">{getDiffLabel(currentDomSocial, prevDomSocial)}</div>
              <div className="domain-pct">{!isInitial ? `${prevDomSocial.toFixed(0)}% → ` : ''}{currentDomSocial.toFixed(0)}%</div>
              <div className="domain-label">{aiData?.comparativa?.social?.label || 'Analizando...'}</div>
            </div>
          </div>

          {/* PARENT-FRIENDLY ANALYSIS */}
          {aiData?.analisis_cuantitativo && (
            <div className="parent-card">
              <h4>🔍 Análisis para el Entorno del Atleta</h4>
              <p className="text-sm text-white mb-4 leading-relaxed">{aiData.analisis_cuantitativo.resumen_general}</p>
              <div className="parent-grid">
                 <div className="parent-item"><strong>Cerebro Deportivo:</strong> {aiData.analisis_cuantitativo.dominios.cognitivo}</div>
                 <div className="parent-item"><strong>Estabilidad Mental:</strong> {aiData.analisis_cuantitativo.dominios.emocional}</div>
                 <div className="parent-item"><strong>Impacto Grupal:</strong> {aiData.analisis_cuantitativo.dominios.social}</div>
              </div>
            </div>
          )}

          {aiData?.cambios_dramaticos?.length > 0 && (
            <div className="trend-box">
              <div className="trend-title">⚠️ Cambios más dramáticos</div>
              <div className="trend-items">
                {aiData.cambios_dramaticos.map((change, i) => (
                  <div className="trend-item" key={i}>
                    <span className="trend-label">{change.label}:</span>
                    <span className={`trend-arrow ${change.trend === 'down' ? 'down-red' : 'up-green'}`}>
                      {change.trend === 'down' ? '▼' : '▲'}
                    </span>
                    <span className={`trend-value ${change.trend === 'down' ? 'down-red' : 'up-green'}`}>{change.diff}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="alert red">
            <div className="alert-icon">🚨</div>
            <div><strong>Hallazgo estratégico:</strong> {aiData?.hallazgo_central || 'No hay hallazgo central definido.'}</div>
          </div>

          <div className="section-title">Análisis Visual ePsD</div>
          <div className="charts-grid">
            <div className="chart-card">
              <h3>{isInitial ? 'Mapa de Subescalas' : 'Comparación Directa'}</h3>
              <div className="chart-wrap">
                <canvas ref={comparisonChartRef}></canvas>
              </div>
            </div>
            <div className="chart-card">
              <h3>Huella de Rendimiento</h3>
              <div className="chart-wrap">
                <canvas ref={radarChartRef}></canvas>
              </div>
            </div>
          </div>

          <div className="section-title">{isInitial ? 'Análisis de Atributos' : 'Detección de Caídas'}</div>
          <div className="list-card">
            {aiData?.detalles_caida?.map((item, i) => (
              <div className="list-item" key={i}>
                <div className="list-icon icon-red">{item.icono || '⚡'}</div>
                <p><strong>{item.titulo}: {item.subtitulo}</strong>{item.descripcion}</p>
              </div>
            ))}
          </div>

          <div className="section-title">Fortalezas Destacadas</div>
          <div className="list-card">
            {aiData?.lo_que_resistio?.map((item, i) => (
              <div className="list-item" key={i}>
                <div className="list-icon icon-amber">{item.icono || '🛡️'}</div>
                <p><strong>{item.titulo}: {item.subtitulo}</strong>{item.descripcion}</p>
              </div>
            ))}
          </div>

          <div className="section-title">Diagnóstico Psicodeportológico</div>
          <div className="alert amber" style={{ marginBottom: '32px' }}>
            <div className="alert-icon">🧠</div>
            <div><strong>Explicación neuro-cognitiva:</strong> {aiData?.explicacion_central || 'Pendiente.'}</div>
          </div>

          <div className="section-title">Protocolo de Optimización</div>
          <div className="rec-cards" style={{ marginBottom: '32px' }}>
            {aiData?.plan_accion?.map((plan, i) => (
              <div className={`rec-card ${plan.priority === '1' ? 'teal' : 'amber'}`} key={i}>
                <div className="rec-num">Prioridad {plan.priority} · {plan.priority === '1' ? 'FOCO PRINCIPAL' : 'REFORZAMIENTO'}</div>
                <h4>{plan.titulo}</h4>
                <p>{plan.descripcion}</p>
              </div>
            ))}
          </div>

          <div className="conclusion-box">
            <h3>Visión para el Cuerpo Técnico</h3>
            <p>{aiData?.conclusion_dt || 'Pendiente.'}</p>
          </div>
        </div>

        <div className="footer">
          PSMILE METHOD · Instrumento ePsD · {isInitial ? 'Diagnóstico Base' : 'Análisis Evolutivo'} · {new Date().getFullYear()}
        </div>

        <button className="print-btn no-print" onClick={() => window.print()}>🖨 Imprimir / PDF</button>
      </div>
    </div>
  );
}
