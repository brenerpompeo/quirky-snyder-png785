import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  Dumbbell,
  Briefcase,
  Palette,
  Flame,
  CheckCircle,
  Plus,
  Trash2,
  Zap,
  Moon,
  Sun,
  Layout,
  Play,
  Pause,
  RotateCcw,
  Save,
  Shield,
  Target,
  Coffee,
  Trophy,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Clock,
  Map,
  List,
  User,
  Settings,
  LogOut,
  BarChart2,
  Search,
  Filter,
  MoreVertical,
  X,
  Edit2,
  ArrowRight,
  GripVertical,
  Star,
  AlertTriangle,
  Maximize2,
  Minimize2,
  FileText,
  Folder,
  CheckSquare,
  RefreshCw,
  Menu,
  ArrowLeft,
} from "lucide-react";

// --- ESTILOS GLOBAIS (SCROLLBARS & ANIMATIONS) ---
const GlobalStyles = () => (
  <style>{`
    /* Scrollbar Customizada (Identidade Visual) */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #0f172a; 
    }
    ::-webkit-scrollbar-thumb {
      background: #334155; 
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #475569; 
    }

    /* Animações Suaves */
    @keyframes breathe {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(0.98); }
    }
    .animate-breathe {
      animation: breathe 4s infinite ease-in-out;
    }
    .glass-panel {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(148, 163, 184, 0.1);
    }
  `}</style>
);

// --- HELPERS ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

const getSprintDates = (sprintId) => {
  const year = new Date().getFullYear();
  const sprintLength = 14;
  const dayOfYearStart = (sprintId - 1) * sprintLength;

  const startDate = new Date(year, 0, 1 + dayOfYearStart);
  const endDate = new Date(year, 0, 1 + dayOfYearStart + 13);

  const options = { day: "numeric", month: "short" };
  return `${startDate.toLocaleDateString(
    "pt-BR",
    options
  )} - ${endDate.toLocaleDateString("pt-BR", options)}`;
};

const getCurrentSprintInfo = () => {
  const dayOfYear = getDayOfYear();
  const sprintLength = 14;
  const currentSprint = Math.ceil(dayOfYear / sprintLength);
  const totalSprints = Math.ceil(365 / sprintLength);
  const dayInSprint = dayOfYear % sprintLength || 14;
  const daysLeft = sprintLength - dayInSprint;
  return { currentSprint, totalSprints, dayInSprint, daysLeft };
};

export default function App() {
  // --- STATE MANAGEMENT ---
  const loadState = (key, defaultValue) => {
    if (typeof window === "undefined") return defaultValue;
    const saved = localStorage.getItem(`siddha_v10_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  // Global
  const [activeRoute, setActiveRoute] = useState("dashboard");
  const [xp, setXp] = useState(() => loadState("xp", 3650));
  const [level, setLevel] = useState(() => loadState("level", 20));
  const [gems, setGems] = useState(() => loadState("gems", 520));

  // Dados Core
  const [tasks, setTasks] = useState(() => loadState("tasks", []));
  const [rituals, setRituals] = useState(() =>
    loadState("rituals", [
      {
        id: "r1",
        text: "Hidratação (500ml)",
        type: "daily",
        period: "morning",
        done: false,
      },
      {
        id: "r2",
        text: "Sem celular na 1ª hora",
        type: "daily",
        period: "morning",
        done: false,
      },
      {
        id: "r3",
        text: "Meditação (15min)",
        type: "daily",
        period: "morning",
        done: false,
      },
      {
        id: "r4",
        text: "Treino Físico",
        type: "daily",
        period: "morning",
        done: false,
      },
      {
        id: "r5",
        text: "Revisão Semanal",
        type: "weekly",
        period: "any",
        done: false,
      },
      {
        id: "r6",
        text: "Curadoria de Estilo",
        type: "weekly",
        period: "any",
        done: false,
      },
    ])
  );
  const [sprintReports, setSprintReports] = useState(() =>
    loadState("reports", [])
  );
  const [brainDump, setBrainDump] = useState(() => loadState("brainDump", ""));

  // Estado Volátil (UI)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRitualModalOpen, setIsRitualModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // Novo Modal de Relatório
  const [currentTask, setCurrentTask] = useState(null);
  const [currentRitual, setCurrentRitual] = useState(null);

  // Estado Brain (Mobile)
  const [showBrainEditor, setShowBrainEditor] = useState(false); // Mobile toggle

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState("focus"); // focus, short, long

  const [sprintInfo, setSprintInfo] = useState(getCurrentSprintInfo());
  const [selectedSprintView, setSelectedSprintView] = useState(
    getCurrentSprintInfo().currentSprint
  );
  const [ritualTab, setRitualTab] = useState("daily");

  // Dados do Relatório Temporário
  const [reportDraft, setReportDraft] = useState({
    wins: "",
    obstacles: "",
    learn: "",
  });

  // --- PERSISTÊNCIA AUTOMÁTICA ---
  useEffect(() => {
    localStorage.setItem("siddha_v10_xp", JSON.stringify(xp));
  }, [xp]);
  useEffect(() => {
    localStorage.setItem("siddha_v10_tasks", JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem("siddha_v10_rituals", JSON.stringify(rituals));
  }, [rituals]);
  useEffect(() => {
    localStorage.setItem("siddha_v10_reports", JSON.stringify(sprintReports));
  }, [sprintReports]);
  useEffect(() => {
    localStorage.setItem("siddha_v10_brainDump", JSON.stringify(brainDump));
  }, [brainDump]);

  // --- CRUD RITUAIS ---
  const openRitualModal = (ritual = null) => {
    if (ritual) {
      setCurrentRitual({ ...ritual });
    } else {
      setCurrentRitual({
        id: generateId(),
        text: "",
        type: ritualTab,
        period: "morning",
        done: false,
      });
    }
    setIsRitualModalOpen(true);
  };

  const saveRitual = () => {
    if (!currentRitual.text.trim()) return;
    setRituals((prev) => {
      const index = prev.findIndex((r) => r.id === currentRitual.id);
      if (index >= 0) {
        const newRituals = [...prev];
        newRituals[index] = currentRitual;
        return newRituals;
      } else {
        return [...prev, currentRitual];
      }
    });
    setIsRitualModalOpen(false);
  };

  const deleteRitual = (id) => {
    if (window.confirm("Remover este protocolo?")) {
      setRituals(rituals.filter((r) => r.id !== id));
      setIsRitualModalOpen(false);
    }
  };

  const toggleRitual = (id) => {
    setRituals(
      rituals.map((r) => {
        if (r.id === id) {
          if (!r.done) addXp(10);
          return { ...r, done: !r.done };
        }
        return r;
      })
    );
  };

  // --- CRUD TAREFAS ---
  const openTaskModal = (task = null, sprintOverride = null) => {
    if (task) {
      setCurrentTask({ ...task });
    } else {
      setCurrentTask({
        id: generateId(),
        text: "",
        pillar: "wealth",
        status: "todo",
        priority: "medium",
        notes: "",
        date: new Date().toISOString().split("T")[0],
        time: "09:00",
        sprintId: sprintOverride || sprintInfo.currentSprint,
      });
    }
    setIsModalOpen(true);
  };

  const saveTask = () => {
    if (!currentTask.text.trim()) return;
    setTasks((prev) => {
      const index = prev.findIndex((t) => t.id === currentTask.id);
      if (index >= 0) {
        const newTasks = [...prev];
        newTasks[index] = currentTask;
        return newTasks;
      } else {
        addXp(15);
        return [...prev, currentTask];
      }
    });
    setIsModalOpen(false);
  };

  const deleteTask = (id) => {
    if (window.confirm("Confirmar exclusão?")) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setIsModalOpen(false);
    }
  };

  const toggleTaskStatus = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newStatus = t.status === "done" ? "todo" : "done";
          if (newStatus === "done") {
            addXp(50);
            setGems((g) => g + 5);
          }
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  // --- GAMIFICATION ---
  const addXp = (amount) => {
    setXp((prev) => {
      const newXp = prev + amount;
      const newLevel = Math.floor(newXp / 1000) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
      }
      return newXp;
    });
  };

  // --- RELATÓRIO SPRINT ---
  const finalizeSprintReport = () => {
    const tasksInSprint = tasks.filter(
      (t) => t.sprintId === sprintInfo.currentSprint
    );
    const completed = tasksInSprint.filter((t) => t.status === "done").length;
    const total = tasksInSprint.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const reportContent =
      `# RELATÓRIO DE ENCERRAMENTO: SPRINT ${sprintInfo.currentSprint}\n` +
      `**Período:** ${getSprintDates(sprintInfo.currentSprint)}\n` +
      `**Performance Técnica:** ${pct}% (${completed}/${total} missões)\n` +
      `----------------------------------------\n` +
      `\n## 🏆 VITÓRIAS E CONQUISTAS\n${reportDraft.wins}\n` +
      `\n## ⚠️ OBSTÁCULOS E TRAVAS\n${reportDraft.obstacles}\n` +
      `\n## 📝 PLANO DE AÇÃO (PRÓXIMO CICLO)\n${reportDraft.learn}`;

    const report = {
      id: generateId(),
      title: `Report S-${
        sprintInfo.currentSprint
      } (${new Date().toLocaleDateString()})`,
      content: reportContent,
      date: new Date().toISOString(),
      sprintId: sprintInfo.currentSprint,
      type: "report",
    };

    setSprintReports([report, ...sprintReports]);
    setBrainDump(reportContent); // Carrega no editor principal também
    setActiveRoute("brain"); // Leva o usuário para o Segundo Cérebro
    setShowBrainEditor(true);
    setIsReportModalOpen(false);
    addXp(150); // Grande bônus por fechar ciclo
    setReportDraft({ wins: "", obstacles: "", learn: "" }); // Reset
  };

  // --- POMODORO ENGINE ---
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      addXp(100);
      if (isFocusMode) setIsFocusMode(false);
      alert("Ciclo Completo! Respire.");
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // --- HELPERS VISUAIS ---
  const getPillarColor = (p) =>
    ({
      body: "text-red-400 border-red-400/30 bg-red-400/10",
      mind: "text-blue-400 border-blue-400/30 bg-blue-400/10",
      wealth: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
      spirit: "text-amber-400 border-amber-400/30 bg-amber-400/10",
      creative: "text-purple-400 border-purple-400/30 bg-purple-400/10",
    }[p] || "text-slate-400");

  // --- COMPONENTES DE UI ---

  const FocusOverlay = () => {
    if (!isFocusMode) return null;
    return (
      <div className="fixed inset-0 z-[100] bg-[#0f172a] flex flex-col items-center justify-center animate-in fade-in duration-700">
        <div className="absolute top-8 right-8">
          <button
            onClick={() => setIsFocusMode(false)}
            className="text-slate-500 hover:text-white p-4 rounded-full hover:bg-white/10 transition-all"
          >
            <Minimize2 size={32} />
          </button>
        </div>
        <div className="text-center space-y-8 relative z-10 px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20 animate-pulse">
              <Target size={48} className="text-red-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-300 uppercase tracking-[0.3em]">
              Modo Hiperfoco
            </h2>
          </div>
          <div className="text-[25vw] md:text-[15vw] font-mono font-bold text-white leading-none tracking-tighter tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            {formatTime(timeLeft)}
          </div>
          <div className="flex justify-center gap-8">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-24 h-24 md:w-32 md:h-32 rounded-[2rem] flex items-center justify-center text-white transition-all shadow-2xl transform hover:scale-105 active:scale-95 ${
                isRunning
                  ? "bg-slate-800 hover:bg-slate-700 border border-slate-600"
                  : "bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 shadow-red-900/50"
              }`}
            >
              {isRunning ? (
                <Pause size={40} fill="currentColor" />
              ) : (
                <Play size={40} fill="currentColor" className="ml-2" />
              )}
            </button>
          </div>
          <p className="text-slate-500 font-mono text-sm md:text-lg max-w-md mx-auto">
            Uma coisa de cada vez. Apenas isso importa agora.
          </p>
        </div>
      </div>
    );
  };

  const TaskCard = ({ task, showDate = false, compact = false }) => (
    <div
      onClick={() => openTaskModal(task)}
      className={`group bg-slate-800/40 p-4 rounded-xl border border-slate-700 hover:border-purple-500/50 hover:bg-slate-800 transition-all cursor-pointer relative overflow-hidden ${
        task.status === "done" ? "opacity-50 grayscale" : "shadow-sm"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {task.priority === "high" && (
            <Flame size={14} className="text-red-500 fill-red-500/20" />
          )}
          {showDate && (
            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
              <Calendar size={10} />{" "}
              {new Date(task.date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          )}
          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
            <Clock size={10} /> {task.time}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTaskStatus(task.id);
          }}
          className={`w-8 h-8 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            task.status === "done"
              ? "bg-emerald-500 border-emerald-500 scale-110"
              : "border-slate-500 hover:border-emerald-400 hover:scale-110 group-hover:border-slate-400"
          }`}
        >
          {task.status === "done" && (
            <CheckCircle size={16} className="text-slate-900" strokeWidth={3} />
          )}
        </button>
      </div>
      <h4
        className={`text-base md:text-sm font-medium text-slate-200 mb-3 ${
          task.status === "done" ? "line-through decoration-slate-500" : ""
        }`}
      >
        {task.text}
      </h4>
      {!compact && (
        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${getPillarColor(
              task.pillar
            )}`}
          >
            {task.pillar}
          </span>
          {task.notes && <FileText size={14} className="text-slate-500" />}
        </div>
      )}
    </div>
  );

  const TaskModal = () => {
    if (!isModalOpen || !currentTask) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/90 backdrop-blur-sm md:p-4 animate-in fade-in duration-200">
        <div className="bg-[#1e293b] w-full md:max-w-lg rounded-t-2xl md:rounded-2xl border-t md:border border-slate-700 shadow-2xl overflow-hidden h-[90vh] md:h-auto flex flex-col">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 shrink-0">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit2 size={18} className="text-purple-400" />{" "}
              {currentTask.id ? "Editar Missão" : "Nova Missão"}
            </h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Objetivo Principal
              </label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white text-lg focus:border-purple-500 outline-none transition-colors placeholder:text-slate-600"
                value={currentTask.text}
                onChange={(e) =>
                  setCurrentTask({ ...currentTask, text: e.target.value })
                }
                placeholder="Título da missão..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Pilar
                </label>
                <select
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-purple-500"
                  value={currentTask.pillar}
                  onChange={(e) =>
                    setCurrentTask({ ...currentTask, pillar: e.target.value })
                  }
                >
                  <option value="wealth">Renda</option>
                  <option value="body">Corpo</option>
                  <option value="mind">Mente</option>
                  <option value="spirit">Espiritualidade</option>
                  <option value="creative">Arte</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Prioridade
                </label>
                <select
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-purple-500"
                  value={currentTask.priority}
                  onChange={(e) =>
                    setCurrentTask({ ...currentTask, priority: e.target.value })
                  }
                >
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Data
                </label>
                <input
                  type="date"
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-purple-500"
                  value={currentTask.date}
                  onChange={(e) =>
                    setCurrentTask({ ...currentTask, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Hora
                </label>
                <input
                  type="time"
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-purple-500"
                  value={currentTask.time}
                  onChange={(e) =>
                    setCurrentTask({ ...currentTask, time: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Notas Táticas
              </label>
              <textarea
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-sm text-slate-300 h-32 resize-none outline-none focus:border-purple-500 custom-scrollbar"
                placeholder="Detalhes..."
                value={currentTask.notes}
                onChange={(e) =>
                  setCurrentTask({ ...currentTask, notes: e.target.value })
                }
              />
            </div>
          </div>
          <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-between items-center pb-8 md:pb-4 shrink-0">
            {currentTask.id && (
              <button
                onClick={() => deleteTask(currentTask.id)}
                className="text-red-400 hover:text-red-300 text-sm flex gap-2 items-center px-4 py-3 hover:bg-red-900/20 rounded-xl transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
            <div className="flex gap-3 ml-auto w-full md:w-auto">
              <button
                onClick={() => setIsModalOpen(false)}
                className="hidden md:block text-slate-400 hover:text-white text-sm px-4 py-2 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={saveTask}
                className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg flex justify-center items-center gap-2"
              >
                <Save size={20} /> Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RitualModal = () => {
    if (!isRitualModalOpen || !currentRitual) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/90 backdrop-blur-sm md:p-4 animate-in fade-in duration-200">
        <div className="bg-[#1e293b] w-full md:max-w-md rounded-t-2xl md:rounded-2xl border-t md:border border-slate-700 shadow-2xl h-auto">
          <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckSquare size={18} /> Protocolo
            </h3>
            <button onClick={() => setIsRitualModalOpen(false)}>
              <X size={24} className="text-slate-400 hover:text-white" />
            </button>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Descrição
              </label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white focus:border-amber-500 outline-none text-base"
                value={currentRitual.text}
                onChange={(e) =>
                  setCurrentRitual({ ...currentRitual, text: e.target.value })
                }
                placeholder="Ex: Leitura 20 min..."
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Frequência
              </label>
              <select
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500 bg-transparent"
                value={currentRitual.type}
                onChange={(e) =>
                  setCurrentRitual({ ...currentRitual, type: e.target.value })
                }
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
          </div>
          <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-between pb-8 md:pb-4">
            {currentRitual.id && (
              <button
                onClick={() => deleteRitual(currentRitual.id)}
                className="text-red-400 hover:bg-red-900/20 px-4 py-3 rounded-xl text-sm"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button
              onClick={saveRitual}
              className="flex-1 md:flex-none ml-4 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ReportModal = () => {
    if (!isReportModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-[#1e293b] w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-slate-700 bg-slate-800/50 rounded-t-2xl">
            <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
              <FileText size={24} className="text-indigo-400" /> Relatório de
              Missão: Sprint {sprintInfo.currentSprint}
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              A análise é a chave da evolução. Seja brutalmente honesto.
            </p>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-emerald-400 tracking-widest flex items-center gap-2">
                <Trophy size={14} /> Vitórias (O que deu certo?)
              </label>
              <textarea
                className="w-full bg-slate-900/50 border border-emerald-900/30 rounded-xl p-4 text-slate-200 h-32 focus:border-emerald-500 outline-none resize-none"
                placeholder="Liste suas conquistas..."
                value={reportDraft.wins}
                onChange={(e) =>
                  setReportDraft({ ...reportDraft, wins: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-red-400 tracking-widest flex items-center gap-2">
                <AlertTriangle size={14} /> Obstáculos (O que travou?)
              </label>
              <textarea
                className="w-full bg-slate-900/50 border border-red-900/30 rounded-xl p-4 text-slate-200 h-32 focus:border-red-500 outline-none resize-none"
                placeholder="Seja específico sobre as travas..."
                value={reportDraft.obstacles}
                onChange={(e) =>
                  setReportDraft({ ...reportDraft, obstacles: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-blue-400 tracking-widest flex items-center gap-2">
                <Brain size={14} /> Aprendizados (Próximos Passos)
              </label>
              <textarea
                className="w-full bg-slate-900/50 border border-blue-900/30 rounded-xl p-4 text-slate-200 h-32 focus:border-blue-500 outline-none resize-none"
                placeholder="Como melhorar no próximo ciclo?"
                value={reportDraft.learn}
                onChange={(e) =>
                  setReportDraft({ ...reportDraft, learn: e.target.value })
                }
              />
            </div>
          </div>

          <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-4 rounded-b-2xl">
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="text-slate-400 hover:text-white px-4 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={finalizeSprintReport}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
            >
              <Save size={18} /> Arquivar no Segundo Cérebro
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- VIEWS ---

  const DashboardView = () => {
    const today = new Date().toISOString().split("T")[0];
    const todaysTasks = tasks.filter(
      (t: any) => t.date === today && t.status !== "done"
    );
    const doneToday = tasks.filter(
      (t: any) => t.date === today && t.status === "done"
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in pb-20 lg:pb-0">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-5 space-y-6">
          {/* POMODORO */}
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold uppercase text-slate-400 flex gap-2">
                <Target size={16} className="text-red-500" /> Hiperfoco
              </h2>
              <button
                onClick={() => setIsFocusMode(true)}
                className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-lg transition-colors"
              >
                <Maximize2 size={16} />
              </button>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-6xl md:text-7xl font-mono font-bold text-white tracking-tighter tabular-nums mb-8 drop-shadow-xl">
                {formatTime(timeLeft)}
              </div>
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex-1 h-14 rounded-xl flex items-center justify-center text-white transition-all shadow-lg active:scale-95 font-bold gap-2 ${
                    isRunning
                      ? "bg-slate-700 hover:bg-slate-600"
                      : "bg-red-600 hover:bg-red-500 shadow-red-900/40"
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause size={20} /> Pausar
                    </>
                  ) : (
                    <>
                      <Play size={20} /> Iniciar
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsRunning(false);
                    setTimeLeft(25 * 60);
                  }}
                  className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white border border-slate-700 transition-all"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* RITUALS */}
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/30">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <Sun size={14} /> Protocolos
              </h3>
              <button
                onClick={() => openRitualModal()}
                className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-700 bg-slate-900/50">
              {["daily", "weekly", "monthly"].map((tab) => {
                const count = rituals.filter(
                  (r: any) => r.type === tab && !r.done
                ).length;
                return (
                  <button
                    key={tab}
                    onClick={() => setRitualTab(tab)}
                    className={`py-3 text-[10px] uppercase font-bold transition-all relative ${
                      ritualTab === tab
                        ? "text-amber-400 bg-slate-800/50"
                        : "text-slate-500"
                    }`}
                  >
                    {tab === "daily"
                      ? "Diário"
                      : tab === "weekly"
                      ? "Semanal"
                      : "Mês"}
                    {count > 0 && (
                      <span className="ml-1 bg-slate-700 text-slate-300 px-1.5 rounded-full">
                        {count}
                      </span>
                    )}
                    {ritualTab === tab && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500"></div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="p-4 space-y-2">
              {rituals
                .filter((r: any) => r.type === ritualTab)
                .map((r: any) => (
                  <div
                    key={r.id}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-transparent hover:border-slate-700 transition-all"
                  >
                    <div
                      onClick={() => toggleRitual(r.id)}
                      className={`shrink-0 w-6 h-6 rounded border flex items-center justify-center cursor-pointer ${
                        r.done
                          ? "bg-amber-500 border-amber-500"
                          : "border-slate-600"
                      }`}
                    >
                      {r.done && (
                        <CheckCircle
                          size={14}
                          className="text-slate-900"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                    <span
                      onClick={() => openRitualModal(r)}
                      className={`flex-1 text-sm ${
                        r.done
                          ? "line-through text-slate-600"
                          : "text-slate-300"
                      }`}
                    >
                      {r.text}
                    </span>
                  </div>
                ))}
              {rituals.filter((r: any) => r.type === ritualTab).length ===
                0 && (
                <div className="text-center py-4 text-xs text-slate-600">
                  Sem protocolos.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 h-full flex flex-col shadow-lg min-h-[400px]">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/30">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <List size={20} className="text-blue-400" /> Missões
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date().toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
              <button
                onClick={() => openTaskModal()}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg active:scale-95"
              >
                <Plus size={18} />{" "}
                <span className="hidden md:inline">Adicionar</span>
              </button>
            </div>
            <div className="p-5 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              {todaysTasks.length === 0 && doneToday.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl m-4">
                  <p className="font-medium text-sm">
                    Dia livre. Adicione uma missão.
                  </p>
                </div>
              ) : (
                <>
                  {todaysTasks.map((task: any) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {doneToday.length > 0 && (
                    <div className="pt-4 border-t border-slate-800 mt-4">
                      <h4 className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest mb-3 pl-1">
                        Concluído ({doneToday.length})
                      </h4>
                      <div className="space-y-2 opacity-60">
                        {doneToday.map((task: any) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SprintsView = () => {
    const viewSprintTasks = tasks.filter(
      (t: any) => t.sprintId === selectedSprintView
    );
    const isCurrentSprint = selectedSprintView === sprintInfo.currentSprint;
    const dates = getSprintDates(selectedSprintView);

    const cols = [
      { id: "todo", label: "A Fazer" },
      { id: "in_progress", label: "Fazendo" },
      { id: "done", label: "Feito" },
    ];

    return (
      <div className="h-full flex flex-col space-y-6 animate-in fade-in pb-24 lg:pb-0">
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Map className="text-emerald-400" /> Sprints
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm font-bold text-white bg-slate-800 px-3 py-1 rounded border border-slate-700">
                  SPRINT {selectedSprintView}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {dates}
                </span>
                {isCurrentSprint && (
                  <span className="text-[10px] bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold animate-pulse">
                    ATUAL
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 self-end md:self-auto">
              {isCurrentSprint && (
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2"
                >
                  <FileText size={14} /> Fechar Ciclo
                </button>
              )}
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
                <button
                  onClick={() =>
                    setSelectedSprintView(Math.max(1, selectedSprintView - 1))
                  }
                  className="p-2 text-slate-400 hover:text-white"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() =>
                    setSelectedSprintView(
                      Math.min(sprintInfo.totalSprints, selectedSprintView + 1)
                    )
                  }
                  className="p-2 text-slate-400 hover:text-white"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
          {/* Timeline Heatmap */}
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {Array.from({ length: 26 }).map((_, i) => {
              const s = i + 1;
              const isSelected = s === selectedSprintView;
              const sprintTasks = tasks.filter((t: any) => t.sprintId === s);
              const done = sprintTasks.filter(
                (t: any) => t.status === "done"
              ).length;
              const percent =
                sprintTasks.length > 0 ? done / sprintTasks.length : 0;
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSprintView(s)}
                  className={`shrink-0 w-10 h-14 rounded border flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? "bg-emerald-900/40 border-emerald-500 scale-105"
                      : "bg-slate-800 border-slate-700"
                  }`}
                >
                  <span
                    className={`text-[8px] font-bold ${
                      isSelected ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    S{s}
                  </span>
                  <div className="h-1 w-6 bg-slate-900 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isSelected ? "bg-emerald-500" : "bg-slate-600"
                      }`}
                      style={{ width: `${percent * 100}%` }}
                    ></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kanban Mobile/Desktop */}
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-4 min-w-max h-full px-1">
            {cols.map((col) => (
              <div
                key={col.id}
                className="w-72 md:w-80 flex flex-col bg-[#1e293b] rounded-xl border border-slate-700 h-full max-h-[60vh] lg:max-h-[600px] shadow-lg"
              >
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/30 sticky top-0 z-10">
                  <span className="font-bold text-slate-200 text-xs uppercase tracking-wide">
                    {col.label}
                  </span>
                  <span className="bg-slate-700 text-slate-400 text-[10px] px-2 py-0.5 rounded-full">
                    {
                      viewSprintTasks.filter(
                        (t: any) =>
                          t.status === col.id ||
                          (col.id === "todo" && !t.status)
                      ).length
                    }
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-900/20">
                  {viewSprintTasks
                    .filter(
                      (t: any) =>
                        t.status === col.id ||
                        (col.id === "todo" &&
                          (!t.status || t.status === "todo"))
                    )
                    .map((task: any) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        showDate={true}
                        compact={true}
                      />
                    ))}
                  {col.id === "todo" && (
                    <button
                      onClick={() => openTaskModal(null, selectedSprintView)}
                      className="w-full py-3 border border-dashed border-slate-700 text-slate-500 hover:text-emerald-400 rounded-xl text-xs flex items-center justify-center gap-2"
                    >
                      <Plus size={14} /> Add ao Sprint {selectedSprintView}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const BrainView = () => (
    <div className="h-full flex flex-col animate-in fade-in pb-20 lg:pb-0 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Brain className="text-blue-400" /> Gnose
        </h2>
        <div className="text-xs text-slate-500 flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
          <RefreshCw size={12} className="animate-spin-slow" />{" "}
          <span className="hidden md:inline">Sincronizado</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] overflow-hidden">
        {/* Mobile List Toggle */}
        <div
          className={`lg:w-1/3 flex flex-col bg-[#1e293b] border border-slate-700 rounded-2xl p-4 ${
            showBrainEditor ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="space-y-3 overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">
              Arquivos
            </h3>
            <div
              onClick={() => {
                setShowBrainEditor(true);
              }}
              className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl hover:bg-blue-900/20 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Brain size={16} className="text-blue-400" />
                <span className="font-bold text-slate-200">
                  Brain Dump Principal
                </span>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase px-1">
                Relatórios
              </h3>
              {sprintReports.map((rep: any) => (
                <div
                  key={rep.id}
                  onClick={() => {
                    setBrainDump(rep.content);
                    setShowBrainEditor(true);
                  }}
                  className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={14} className="text-purple-400" />
                    <span className="text-xs font-bold text-slate-300 truncate">
                      {rep.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 pl-6">
                    {new Date(rep.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div
          className={`lg:w-2/3 bg-[#1e293b] border border-slate-700 rounded-2xl flex flex-col relative ${
            !showBrainEditor
              ? "hidden lg:flex"
              : "flex fixed inset-0 z-30 m-0 rounded-none lg:static lg:m-0 lg:rounded-2xl"
          }`}
        >
          <div className="bg-slate-900/80 p-3 border-b border-slate-700 flex justify-between items-center backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBrainEditor(false)}
                className="lg:hidden p-2 text-slate-400 hover:text-white"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Edit2 size={12} />{" "}
                <span className="text-slate-200 font-bold">Editor</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {brainDump.length} chars
            </span>
          </div>
          <textarea
            className="flex-1 bg-[#1e293b] p-6 text-slate-300 focus:outline-none resize-none font-mono text-sm leading-relaxed custom-scrollbar w-full"
            placeholder="Escreva livremente..."
            value={brainDump}
            onChange={(e) => setBrainDump(e.target.value)}
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );

  // --- MAIN LAYOUT ---
  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-purple-500 selection:text-white overflow-hidden">
      <GlobalStyles />
      {/* GLOBAL OVERLAYS */}
      <FocusOverlay />
      <TaskModal />
      <RitualModal />
      <ReportModal />

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-[#1e293b] border-r border-slate-700 flex-col z-20 shadow-2xl">
        <div className="p-6 flex items-center gap-3 border-b border-slate-700/50 h-20">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-xl shadow-lg">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-black tracking-widest text-sm text-white">
              SIDDHA V10
            </h1>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              God Mode
            </span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: "dashboard", icon: Layout, label: "Cockpit" },
            { id: "sprints", icon: Map, label: "Sprints" },
            { id: "brain", icon: Brain, label: "Gnose" },
            { id: "analytics", icon: BarChart2, label: "Stats" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveRoute(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeRoute === item.id
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              <item.icon size={20} />{" "}
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl font-bold text-white">
              {level}
            </div>
            <div className="w-full">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-white">Nv. {level}</span>
                <span className="text-slate-400">{xp % 1000}/1k</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500"
                  style={{ width: `${(xp % 1000) / 10}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1e293b] border-t border-slate-700 z-40 pb-safe flex justify-around items-center h-16 px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {[
          { id: "dashboard", icon: Layout, label: "Home" },
          { id: "sprints", icon: Map, label: "Sprints" },
          { id: "brain", icon: Brain, label: "Gnose" },
          { id: "analytics", icon: BarChart2, label: "Stats" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveRoute(item.id)}
            className={`flex flex-col items-center justify-center w-16 h-full gap-1 ${
              activeRoute === item.id ? "text-purple-400" : "text-slate-500"
            }`}
          >
            <item.icon
              size={22}
              strokeWidth={activeRoute === item.id ? 2.5 : 2}
            />
            <span className="text-[9px] font-bold uppercase">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 lg:h-20 bg-[#1e293b]/90 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
          <h2 className="text-lg lg:text-xl font-bold text-slate-200 capitalize tracking-wide">
            {activeRoute === "dashboard" ? "Centro de Comando" : activeRoute}
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-bold text-purple-300 shadow-inner">
              <Star size={14} className="fill-current" /> {gems}
            </div>
            <button
              onClick={() => openTaskModal()}
              className="lg:hidden bg-purple-600 text-white p-2 rounded-lg shadow-lg"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => openTaskModal()}
              className="hidden lg:flex bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg items-center gap-2 hover:shadow-purple-500/20 transition-all active:scale-95"
            >
              <Plus size={16} /> Nova Missão
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth w-full">
          <div className="max-w-7xl mx-auto h-full">
            {activeRoute === "dashboard" && <DashboardView />}
            {activeRoute === "sprints" && <SprintsView />}
            {activeRoute === "brain" && <BrainView />}
            {activeRoute === "analytics" && (
              <div className="flex items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl text-sm">
                Módulo Analytics em breve.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
