import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Award, 
  Activity, 
  Settings, 
  Search, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  Filter, 
  ChevronDown, 
  Calendar, 
  Shield, 
  UserCheck, 
  TrendingUp, 
  MapPin 
} from 'lucide-react';

export default function Dashboard() {
  const auth = useContext(AuthContext) || {};
  const { usuario, logout } = auth;
  const navigate = useNavigate();

  // Estados de navegação e filtros
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtroPeriodo, setFiltroPeriodo] = useState('2026');
  const [filtroModalidade, setFiltroModalidade] = useState('todas');
  const [filtroUnidade, setFiltroUnidade] = useState('todas');

  // Dados estatísticos baseados no sistema JL Gestão
  const [dadosEstatisticos, setDadosEstatisticos] = useState({
    totalAlunos: 1248,
    alunosHomens: 745,
    alunosMulheres: 503,
    modalidades: {
      'Karatê': 420,
      'Judô': 350,
      'Jiu-Jitsu': 288,
      'Muay Thai': 190
    },
    fluxoMensal: [1100, 1150, 1180, 1210, 1230, 1248]
  });

  // Referências para os gráficos Chart.js
  const chartLineRef = useRef(null);
  const chartPieRef = useRef(null);
  const chartBarRef = useRef(null);
  const chartInstanceLine = useRef(null);
  const chartInstancePie = useRef(null);
  const chartInstanceBar = useRef(null);

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!window.Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.async = true;
      script.onload = () => inicializarGraficos();
      document.body.appendChild(script);
    } else {
      inicializarGraficos();
    }

    return () => {
      if (chartInstanceLine.current) chartInstanceLine.current.destroy();
      if (chartInstancePie.current) chartInstancePie.current.destroy();
      if (chartInstanceBar.current) chartInstanceBar.current.destroy();
    };
  }, [dadosEstatisticos, filtroModalidade, filtroUnidade]);

  const inicializarGraficos = () => {
    if (!window.Chart) return;

    if (chartInstanceLine.current) chartInstanceLine.current.destroy();
    if (chartInstancePie.current) chartInstancePie.current.destroy();
    if (chartInstanceBar.current) chartInstanceBar.current.destroy();

    // Gráfico de Linha (Fluxo de Alunos)
    if (chartLineRef.current) {
      const ctxLine = chartLineRef.current.getContext('2d');
      chartInstanceLine.current = new window.Chart(ctxLine, {
        type: 'line',
        data: {
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
          datasets: [{
            label: 'Matriculados Ativos',
            data: dadosEstatisticos.fluxoMensal,
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#ec4899',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#a78bfa' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#a78bfa' } }
          }
        }
      });
    }

    // Gráfico de Rosca (Gênero)
    if (chartPieRef.current) {
      const ctxPie = chartPieRef.current.getContext('2d');
      chartInstancePie.current = new window.Chart(ctxPie, {
        type: 'doughnut',
        data: {
          labels: ['Homens', 'Mulheres'],
          datasets: [{
            data: [dadosEstatisticos.alunosHomens, dadosEstatisticos.alunosMulheres],
            backgroundColor: ['#06b6d4', '#ec4899'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#e2e8f0', boxWidth: 12 } }
          }
        }
      });
    }

    // Gráfico de Barras (Modalidades)
    if (chartBarRef.current) {
      const ctxBar = chartBarRef.current.getContext('2d');
      const modLabels = Object.keys(dadosEstatisticos.modalidades);
      const modValues = Object.values(dadosEstatisticos.modalidades);

      chartInstanceBar.current = new window.Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: modLabels,
          datasets: [{
            label: 'Alunos por Modalidade',
            data: modValues,
            backgroundColor: ['#a855f7', '#06b6d4', '#ec4899', '#10b981'],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#a78bfa' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#a78bfa' } }
          }
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0515] text-slate-100 flex font-sans antialiased selection:bg-purple-500 selection:text-white">
      
      {/* Overlay para dispositivos móveis */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Lateral */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-[#120a22] border-r border-purple-950 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {/* Logo e Nome da Marca: JL Gestão */}
          <div className="p-6 flex items-center justify-between border-b border-purple-900/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 font-extrabold text-lg">
                JL
              </div>
              <div>
                <h1 className="font-bold text-base tracking-wide text-white">JL Gestão</h1>
                <p className="text-[10px] text-purple-400 font-medium">Artes Marciais & Esportes</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-purple-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Links do Menu */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            <a href="#dashboard" className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600/25 to-purple-900/10 border-l-4 border-purple-500 text-white rounded-r-xl font-medium shadow-sm">
              <div className="flex items-center gap-3">
                <LayoutDashboard size={18} className="text-purple-400" />
                <span className="text-sm">Dashboard</span>
              </div>
              <ChevronDown size={14} className="text-purple-400" />
            </a>

            <a href="#alunos" onClick={(e) => { e.preventDefault(); alert('Módulo de Alunos em desenvolvimento!'); }} className="flex items-center justify-between px-4 py-3 text-purple-300/70 hover:text-white hover:bg-purple-950/40 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Users size={18} />
                <span className="text-sm">Alunos / Frequência</span>
              </div>
            </a>

            <a href="#modalidades" onClick={(e) => { e.preventDefault(); alert('Módulo de Modalidades e Turmas!'); }} className="flex items-center justify-between px-4 py-3 text-purple-300/70 hover:text-white hover:bg-purple-950/40 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Award size={18} />
                <span className="text-sm">Modalidades & Graduação</span>
              </div>
            </a>

            <a href="#relatorios" onClick={(e) => { e.preventDefault(); alert('Módulo de Indicadores Esportivos!'); }} className="flex items-center justify-between px-4 py-3 text-purple-300/70 hover:text-white hover:bg-purple-950/40 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Activity size={18} />
                <span className="text-sm">Indicadores Esportivos</span>
              </div>
            </a>

            <a href="#configuracoes" onClick={(e) => { e.preventDefault(); alert('Configurações do Sistema'); }} className="flex items-center justify-between px-4 py-3 text-purple-300/70 hover:text-white hover:bg-purple-950/40 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Settings size={18} />
                <span className="text-sm">Configurações</span>
              </div>
            </a>
          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-purple-900/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-950/50 hover:bg-red-500/20 hover:text-red-400 text-purple-300 rounded-xl transition-colors font-medium text-sm border border-purple-900/30 shadow-inner"
          >
            <LogOut size={16} />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area with fluid constraints */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Topbar */}
        <header className="h-16 bg-[#120a22]/90 backdrop-blur-md border-b border-purple-950 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-purple-300 hover:text-white focus:outline-none"
            >
              <Menu size={24} />
            </button>

            {/* Barra de Pesquisa */}
            <div className="relative w-full max-w-xs hidden sm:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400/60">
                <Search size={15} />
              </span>
              <input
                type="text"
                placeholder="Pesquisar aluno, turma ou projeto..."
                className="w-full pl-9 pr-4 py-1.5 bg-[#180e2b] border border-purple-900/40 rounded-full text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
              />
            </div>
          </div>

          {/* Ações e Perfil */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button className="text-purple-300/70 hover:text-white relative transition-colors">
              <Bell size={18} />
              <span className="absolute top-0 right-0 h-2 w-2 bg-pink-500 rounded-full animate-pulse"></span>
            </button>

            <div className="h-6 w-[1px] bg-purple-900/40 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-semibold text-white">{usuario?.nome || 'Administrador Teste'}</p>
                <p className="text-[10px] text-purple-400 uppercase tracking-wider">{usuario?.perfil || 'ADMIN'}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white shadow-md text-sm">
                {usuario?.nome ? usuario.nome.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content Container with optimized max-width and generous responsive padding */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* Título e Breadcrumb corretos: JL Gestão / Dashboard */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#120a22]/70 border border-purple-900/30 p-5 rounded-2xl backdrop-blur-sm shadow-xl">
            <div>
              <span className="text-[11px] font-semibold text-purple-400/80 tracking-widest uppercase">
                JL GESTÃO <span className="text-purple-500">/</span> DASHBOARD
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 bg-gradient-to-r from-white via-purple-200 to-pink-300 bg-clip-text text-transparent">
                Visão Geral Esportiva
              </h2>
            </div>

            {/* Painel de Filtros Interativos */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 bg-[#180e2b] border border-purple-900/40 px-3 py-2 rounded-xl text-xs text-purple-300">
                <Calendar size={14} className="text-purple-400" />
                <select 
                  value={filtroPeriodo} 
                  onChange={(e) => setFiltroPeriodo(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="2026" className="bg-[#120a22]">Ano 2026</option>
                  <option value="2025" className="bg-[#120a22]">Ano 2025</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#180e2b] border border-purple-900/40 px-3 py-2 rounded-xl text-xs text-purple-300">
                <Filter size={14} className="text-purple-400" />
                <select 
                  value={filtroModalidade} 
                  onChange={(e) => setFiltroModalidade(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="todas" className="bg-[#120a22]">Todas Modalidades</option>
                  <option value="Karate" className="bg-[#120a22]">Karatê</option>
                  <option value="Judo" className="bg-[#120a22]">Judô</option>
                  <option value="Jiu-Jitsu" className="bg-[#120a22]">Jiu-Jitsu</option>
                  <option value="Muay Thai" className="bg-[#120a22]">Muay Thai</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#180e2b] border border-purple-900/40 px-3 py-2 rounded-xl text-xs text-purple-300">
                <MapPin size={14} className="text-purple-400" />
                <select 
                  value={filtroUnidade} 
                  onChange={(e) => setFiltroUnidade(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="todas" className="bg-[#120a22]">Todas Unidades / Polos</option>
                  <option value="centro" className="bg-[#120a22]">Polo Central</option>
                  <option value="zona-norte" className="bg-[#120a22]">Polo Zona Norte</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cartões de Métricas Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Total de Alunos */}
            <div className="bg-[#120a22] border border-purple-900/30 rounded-2xl p-6 flex items-center justify-between shadow-xl relative overflow-hidden group hover:border-purple-500/50 transition-all">
              <div>
                <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Total de Alunos</p>
                <h4 className="text-3xl font-extrabold text-white mt-1">{dadosEstatisticos.totalAlunos}</h4>
                <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                  <TrendingUp size={12} /> +12% este mês
                </p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Users size={26} />
              </div>
            </div>

            {/* Total de Alunos Homens */}
            <div className="bg-[#120a22] border border-purple-900/30 rounded-2xl p-6 flex items-center justify-between shadow-xl relative overflow-hidden group hover:border-cyan-500/50 transition-all">
              <div>
                <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Alunos Homens</p>
                <h4 className="text-3xl font-extrabold text-white mt-1">{dadosEstatisticos.alunosHomens}</h4>
                <p className="text-[11px] text-cyan-300/70 mt-1.5">
                  {Math.round((dadosEstatisticos.alunosHomens / dadosEstatisticos.totalAlunos) * 100)}% do total geral
                </p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <UserCheck size={26} />
              </div>
            </div>

            {/* Total de Alunos Mulheres */}
            <div className="bg-[#120a22] border border-purple-900/30 rounded-2xl p-6 flex items-center justify-between shadow-xl relative overflow-hidden group hover:border-pink-500/50 transition-all">
              <div>
                <p className="text-xs font-semibold text-pink-400 uppercase tracking-wider">Alunas Mulheres</p>
                <h4 className="text-3xl font-extrabold text-white mt-1">{dadosEstatisticos.alunosMulheres}</h4>
                <p className="text-[11px] text-pink-300/70 mt-1.5">
                  {Math.round((dadosEstatisticos.alunosMulheres / dadosEstatisticos.totalAlunos) * 100)}% do total geral
                </p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-pink-600/20 text-pink-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <UserCheck size={26} />
              </div>
            </div>

            {/* Modalidades Ativas */}
            <div className="bg-[#120a22] border border-purple-900/30 rounded-2xl p-6 flex items-center justify-between shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all">
              <div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Modalidades</p>
                <h4 className="text-3xl font-extrabold text-white mt-1">4</h4>
                <p className="text-[11px] text-emerald-300/70 mt-1.5">Turmas ativas e regulares</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Award size={26} />
              </div>
            </div>

          </div>

          {/* Seção de Gráficos (Chart.js Responsivo) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Gráfico 1: Fluxo de Alunos (Linha) */}
            <div className="bg-[#120a22] border border-purple-900/30 rounded-2xl p-6 shadow-xl lg:col-span-2 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Fluxo de Alunos no Projeto</h4>
                  <p className="text-xs text-purple-400/60">Evolução semestral de matriculados ativos</p>
                </div>
                <span className="text-xs text-purple-300 bg-purple-950/60 px-3 py-1 rounded-xl border border-purple-900/40">2026</span>
              </div>
              <div className="h-72 w-full relative">
                <canvas ref={chartLineRef}></canvas>
              </div>
            </div>

            {/* Gráfico 2: Distribuição por Gênero (Rosca) */}
            <div className="bg-[#120a22] border border-purple-900/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Distribuição por Gênero</h4>
                <p className="text-xs text-purple-400/60">Proporção de participantes</p>
              </div>
              <div className="h-60 w-full relative flex items-center justify-center my-2">
                <canvas ref={chartPieRef}></canvas>
              </div>
              <div className="text-[11px] text-purple-300/60 text-center pt-2 border-t border-purple-900/20">
                JL Gestão - Central de Dados
              </div>
            </div>

          </div>

          {/* Seção Inferior: Alunos por Modalidade (Barras) + Atividades recentes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Gráfico 3: Alunos por Modalidade (Barras) */}
            <div className="bg-[#120a22] border border-purple-900/30 rounded-2xl p-6 shadow-xl lg:col-span-2 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Participantes por Modalidade</h4>
                <p className="text-xs text-purple-400/60 mb-4">Distribuição de alunos nas artes marciais oferecidas</p>
              </div>
              <div className="h-64 w-full relative">
                <canvas ref={chartBarRef}></canvas>
              </div>
            </div>

            {/* Atividades & Graduações */}
            <div className="bg-[#120a22] border border-purple-900/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Atividades & Graduações</h4>
                  <Shield size={18} className="text-purple-400" />
                </div>
                
                <div className="space-y-4">
                  <div className="p-3 bg-[#180e2b] rounded-xl border border-purple-900/30">
                    <p className="text-xs font-semibold text-white">Exame de Faixa - Karatê</p>
                    <p className="text-[11px] text-purple-300/70 mt-0.5">Agendado para o próximo sábado às 09:00 no Polo Central.</p>
                  </div>

                  <div className="p-3 bg-[#180e2b] rounded-xl border border-purple-900/30">
                    <p className="text-xs font-semibold text-white">Renovação de Bolsas Esportivas</p>
                    <p className="text-[11px] text-purple-300/70 mt-0.5">94% dos alunos com frequência regular aprovada.</p>
                  </div>

                  <div className="p-3 bg-[#180e2b] rounded-xl border border-purple-900/30">
                    <p className="text-xs font-semibold text-white">Nova Turma de Jiu-Jitsu</p>
                    <p className="text-[11px] text-purple-300/70 mt-0.5">Inscrições abertas com 25 vagas disponíveis.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-purple-900/20 text-center">
                <span className="text-xs text-cyan-400 font-semibold cursor-pointer hover:underline">
                  Ver relatório completo →
                </span>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}