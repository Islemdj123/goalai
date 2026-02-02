"use client";
import { motion } from "framer-motion";
import { LogOut, RefreshCw, User, Flame, TrendingUp, AlertCircle, ChevronDown, ChevronUp, Goal, Shield, Activity, Lock, ShieldAlert, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Match {
  match: string;
  home_team: string;
  away_team: string;
  home_logo: string;
  away_logo: string;
  winner: string;
  prob: string;
  prob_val: number;
  btts: string;
  btts_prob: string;
  high_conf: boolean;
  time: string;
  reason: string;
  home_stats: {
    avg_scored: number;
    avg_conceded: number;
    form_pts: number;
    strength: number;
  };
  away_stats: {
    avg_scored: number;
    avg_conceded: number;
    form_pts: number;
    strength: number;
  };
}

interface LiveMatch {
  match: string;
  home_team: string;
  away_team: string;
  home_logo: string;
  away_logo: string;
  home_score: number;
  away_score: number;
  minute: string;
  status: string;
  competition: string;
}

const translations: any = {
  en: {
    title: "AI Match Center",
    subtitle: "Real-time Predictions & Live Scores",
    live: "Live Matches",
    upcoming: "Upcoming Predictions",
    premium_locked: "Premium Predictions Locked",
    premium_desc: "Get premium access to unlock accurate predictions, success rates, and AI analysis for every match.",
    upgrade: "Upgrade to Premium",
    conn_error: "Connection Error",
    retry: "Retry Connection",
    status_title: "My Status",
    balance: "Balance",
    premium_active: "PREMIUM ACTIVE",
    expiry: "Expires in",
    days: "days",
    expired: "EXPIRED / RENEW NOW",
    expired_desc: "Your subscription has expired. Please recharge your balance and renew to continue getting AI predictions.",
    pending: "PENDING VERIFICATION",
    free: "FREE ACCOUNT",
    upgrade_btn: "UPGRADE / RENEW",
    logout: "Logout",
    topup: "Top Up Balance",
    matches: "Home Center",
    predictions: "Predictions Only",
    profile: "Account & Subscription",
    refresh: "Refresh",
    reasoning: "AI Reasoning",
    analyzing: "Analyzing upcoming matches...",
    no_matches: "No scheduled matches found for the upcoming days.",
    no_live: "No live matches currently in progress.",
    no_predictions: "No predictions available right now.",
    stats: "Stats",
    avg_scored: "Avg Scored",
    avg_conceded: "Avg Conceded",
    form_pts: "Form Points",
    winner: "Winner",
    confidence: "Confidence",
    btts: "BTTS"
  },
  ar: {
    title: "مركز المباريات الذكي",
    subtitle: "توقعات مباشرة ونتائج حية",
    live: "مباريات مباشرة",
    upcoming: "التوقعات القادمة",
    premium_locked: "التوقعات المميزة مقفلة",
    premium_desc: "احصل على اشتراك مميز لفتح التوقعات الدقيقة، نسب النجاح، وتحليلات الذكاء الاصطناعي لكل مباراة.",
    upgrade: "الترقية للمميز",
    conn_error: "خطأ في الاتصال",
    retry: "إعادة المحاولة",
    status_title: "حالة الحساب",
    balance: "الرصيد",
    premium_active: "اشتراك نشط",
    expiry: "ينتهي بعد",
    days: "يوم",
    expired: "منتهي / جدد الآن",
    expired_desc: "انتهت صلاحية اشتراكك. يرجى شحن حسابك وتجديد الاشتراك لمواصلة الحصول على تنبؤات الذكاء الاصطناعي.",
    pending: "قيد المراجعة",
    free: "حساب مجاني",
    upgrade_btn: "ترقية / تجديد",
    logout: "خروج",
    topup: "شحن الرصيد",
    matches: "الرئيسية",
    predictions: "التنبؤات فقط",
    profile: "معلومات الحساب",
    refresh: "تحديث",
    reasoning: "تحليل الذكاء الاصطناعي",
    analyzing: "جاري تحليل المباريات القادمة...",
    no_matches: "لا توجد مباريات مجدولة للأيام القادمة.",
    no_live: "لا توجد مباريات مباشرة حالياً.",
    no_predictions: "لا يوجد تنبؤات الان.",
    stats: "إحصائيات",
    avg_scored: "معدل التسجيل",
    avg_conceded: "معدل الاستقبال",
    form_pts: "نقاط المستوى",
    winner: "الفائز",
    confidence: "الثقة",
    btts: "التسجيل للطرفين"
  },
  fr: {
    title: "Centre de Matchs IA",
    subtitle: "Prédictions en temps réel et scores en direct",
    live: "Matchs en Direct",
    upcoming: "Prédictions à Venir",
    premium_locked: "Prédictions Premium Verrouillées",
    premium_desc: "Obtenez un accès premium pour débloquer des prédictions précises, des taux de réussite et des analyses IA pour chaque match.",
    upgrade: "Passer au Premium",
    conn_error: "Erreur de Connexion",
    retry: "Réessayer",
    status_title: "Mon Statut",
    balance: "Solde",
    premium_active: "PREMIUM ACTIF",
    expiry: "Expire dans",
    days: "jours",
    expired: "EXPIRÉ / RENOUVELER",
    expired_desc: "Votre abonnement a expiré. Veuillez recharger votre compte et renouveler pour continuer à recevoir les prédictions IA.",
    pending: "VÉRIFICATION EN COURS",
    free: "COMPTE GRATUIT",
    upgrade_btn: "UPGRADER / RENOUVELER",
    logout: "Déconnexion",
    topup: "Recharger Solde",
    matches: "Accueil",
    predictions: "Prédictions Seules",
    profile: "Profil & Abonnement",
    refresh: "Actualiser",
    reasoning: "Analyse IA",
    analyzing: "Analyse des matchs à venir...",
    no_matches: "Aucun match prévu pour les prochains jours.",
    no_live: "Aucun match en direct pour le moment.",
    no_predictions: "Pas de prédictions disponibles pour le moment.",
    stats: "Stats",
    avg_scored: "Moy. Marqués",
    avg_conceded: "Moy. Encaissés",
    form_pts: "Points de Forme",
    winner: "Vainqueur",
    confidence: "Confiance",
    btts: "Les deux marquent"
  }
};

const MatchCountdown = ({ utcDate, lang }: { utcDate: string, lang: string }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const matchTime = new Date(utcDate);
      const diff = matchTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(lang === 'ar' ? "بدأت" : lang === 'fr' ? "Commencé" : "Started");
        return;
      }
// ... (بقيمة الكود)

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else {
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [utcDate, lang]);

  return <span className="tabular-nums font-mono">{timeLeft}</span>;
};

const LiveMinute = ({ status, initialMinute }: { status: string, initialMinute: string }) => {
  const [minute, setMinute] = useState(initialMinute);

  useEffect(() => {
    setMinute(initialMinute); // التحديث عند تغير القيمة القادمة من السيرفر
  }, [initialMinute]);

  useEffect(() => {
    if (status !== "IN_PLAY") return;

    const interval = setInterval(() => {
      setMinute(prev => {
        if (prev.includes("'")) {
          const mins = parseInt(prev);
          if (!isNaN(mins)) return `${mins + 1}'`;
        }
        return prev;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [status]);

  return <span>{minute}</span>;
};

export default function Dashboard() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const [view, setView] = useState<"matches" | "profile" | "predictions">("matches");
  const [lang, setLang] = useState<"en" | "ar" | "fr">("en");
  const [user, setUser] = useState<{email: string, username: string, has_paid: boolean, status: string, days_left?: number, expiry_date?: string, balance?: number, is_admin?: boolean, pending_amount?: number} | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPaymentError, setIsPaymentError] = useState(false);
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as "en" | "ar" | "fr";
    if (savedLang) setLang(savedLang);
  }, []);

  const changeLang = (l: "en" | "ar" | "fr") => {
    setLang(l);
    localStorage.setItem("lang", l);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    setIsPaymentError(false);
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // 1. Fetch User Info
      const meRes = await fetch(`${API_BASE}/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (meRes.ok) {
        const userData = await meRes.json();
        setUser(userData);
      } else if (meRes.status === 401) {
        router.push("/login");
        return;
      }

      // 2. Fetch Live Matches
      try {
        const liveRes = await fetch(`${API_BASE}/live-matches`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (liveRes.ok) {
          const liveData = await liveRes.json();
          setLiveMatches(liveData.results || []);
        } else if (liveRes.status === 402) {
          setLiveMatches([]);
          setIsPaymentError(true);
        }
      } catch (e) {
        console.error("Live matches fetch failed");
      }

      // 3. Fetch Predictions
      try {
        const response = await fetch(`${API_BASE}/predictions?lang=${lang}&t=${Date.now()}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setMatches(data.results || []);
          setIsPaymentError(data.is_locked || false);
        } else {
          const errorData = await response.json();
          console.error("Predictions error:", errorData);
          setError("فشل الخادم في معالجة التوقعات. الرجاء المحاولة لاحقاً.");
        }
      } catch (e) {
        setError("تعذر الاتصال بخادم التنبؤات. تأكد من تشغيل الـ Backend.");
      }
    } catch (err: any) {
      setError("خطأ في الاتصال بالسيرفر الرئيسي.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000); // تحديث كل 20 ثانية لضمان سرعة ظهور الأهداف
    return () => clearInterval(interval);
  }, [lang]);

  return (
    <div className="flex min-h-screen bg-[#050505] relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/dashboard_bg.jpg" 
          alt="Background" 
          className="w-full h-full object-cover opacity-70 object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
      </div>

      {/* Mobile AppBar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex items-center justify-between shadow-2xl">
        <div className="text-xl font-black italic text-blue-500">GOALAI</div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setView("matches"); setSidebarOpen(false); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === "matches" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 text-white/50"}`}
          >
            <Activity size={14} />
            <span>{t.matches}</span>
          </button>
          <button 
            onClick={() => { setView("predictions"); setSidebarOpen(false); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === "predictions" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 text-white/50"}`}
          >
            <TrendingUp size={14} />
            <span>{t.predictions}</span>
          </button>
          <button 
            onClick={() => { setView("profile"); setSidebarOpen(false); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === "profile" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 text-white/50"}`}
          >
            <User size={14} />
            <span>{t.profile}</span>
          </button>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-white/10 rounded-xl text-white/80"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 ${lang === 'ar' ? 'right-0' : 'left-0'} z-40 w-72 bg-black/95 backdrop-blur-2xl border-white/10 p-6 flex flex-col items-start transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')} md:translate-x-0 md:flex ${lang === 'ar' ? 'border-l' : 'border-r'}`}>
        <div className="text-2xl font-black italic text-blue-500 mb-12">GOALAI</div>

        <nav className="space-y-6 flex-grow w-full">
          <SidebarItem 
            icon={<Activity />} 
            label={t.matches} 
            active={view === "matches"} 
            onClick={() => { setView("matches"); setSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<TrendingUp />} 
            label={t.predictions} 
            active={view === "predictions"} 
            onClick={() => { setView("predictions"); setSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<User />} 
            label={t.profile} 
            active={view === "profile"} 
            onClick={() => { setView("profile"); setSidebarOpen(false); }} 
          />

          {user?.is_admin && (
            <SidebarItem 
              icon={<ShieldAlert className="text-blue-500" />} 
              label="Admin Panel" 
              active={false} 
              onClick={() => router.push("/admin")} 
            />
          )}

          {/* Language Selector */}
          <div className="pt-8 border-t border-white/5 space-y-4 w-full">
            <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">Language</p>
            <div className="flex gap-2">
              {['en', 'ar', 'fr'].map((l) => (
                <button
                  key={l}
                  onClick={() => { changeLang(l as any); setSidebarOpen(false); }}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-colors ${lang === l ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 w-full">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">{t.balance}</p>
                <p className="text-xs font-black text-blue-500 tabular-nums">${user?.balance?.toFixed(2) || "0.00"}</p>
              </div>
              {(user?.pending_amount || 0) > 0 && (
                <div className="mb-4 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <p className="text-[8px] uppercase tracking-tighter text-yellow-500 font-black mb-1">{t.pending}</p>
                  <p className="text-[10px] font-bold text-white">${user?.pending_amount?.toFixed(2)}</p>
                </div>
              )}
              <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">{t.status_title}</p>
              {user?.has_paid ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-green-500 text-xs font-bold">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    {t.premium_active}
                  </div>
                  {user.days_left !== undefined && (
                    <p className="text-[9px] text-gray-400 font-medium">
                      {t.expiry}: <span className="text-white">{user.days_left}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    {t.free}
                  </div>
                  <button 
                    onClick={() => { router.push("/payment"); setSidebarOpen(false); }}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-xl text-[10px] font-bold transition-colors shadow-lg shadow-blue-600/10"
                  >
                    {t.upgrade_btn}
                  </button>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => { fetchData(); setSidebarOpen(false); }} 
            className="flex items-center gap-4 text-white/60 hover:text-white transition-colors w-full px-2 mt-4"
          >
            <div className={`p-2 rounded-lg ${loading ? 'animate-spin' : ''}`}>
              <RefreshCw size={20} />
            </div>
            <span className="font-medium">{t.refresh}</span>
          </button>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 text-red-500 hover:text-red-400 transition-colors w-full px-2 mt-4 pt-4 border-t border-white/5"
          >
            <div className="p-2 rounded-lg">
              <LogOut size={20} />
            </div>
            <span className="font-medium">{t.logout}</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto relative z-10 pt-24 md:pt-10">
        {view === "matches" || view === "predictions" ? (
          <>
            <header className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-3xl font-bold">{view === "predictions" ? t.predictions : t.title}</h1>
                <p className="text-white/50">{view === "predictions" ? t.subtitle : t.subtitle}</p>
              </div>
              {view === "matches" && (
                <button 
                  onClick={() => setView("predictions")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
                >
                  <TrendingUp size={16} />
                  {t.predictions}
                </button>
              )}
              {view === "predictions" && (
                <button 
                  onClick={() => setView("matches")}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
                >
                  <Activity size={16} />
                  {t.matches}
                </button>
              )}
            </header>

            {user?.status === "expired" && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-500">{t.expired}</h3>
                    <p className="text-xs text-gray-400">{t.expired_desc}</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push("/payment")}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 whitespace-nowrap"
                >
                  {t.upgrade_btn}
                </button>
              </motion.div>
            )}

            {view === "matches" && (
              <section className="mb-12">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
                  <span className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]">{t.live}</span>
                </h2>
                {liveMatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {liveMatches.map((live, idx) => (
                      <div key={idx} className="bg-black/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 flex flex-col gap-6 relative overflow-hidden group hover:border-green-400 transition-all shadow-2xl hover:shadow-green-500/20 active:scale-[0.98]">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className={`relative flex h-2 w-2 ${live.status === 'FINISHED' ? 'hidden' : ''}`}>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                              </span>
                              <span className={`text-[10px] font-black uppercase tracking-tighter ${live.status === 'FINISHED' ? 'text-gray-500' : 'text-green-500'}`}>
                                {live.status === 'FINISHED' ? 'FINISHED' : 'LIVE'}
                              </span>
                            </div>
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold max-w-[150px] truncate mt-1">{live.competition}</span>
                          </div>
                          <div className="bg-green-500/20 px-3 py-1 rounded-full text-[10px] font-black text-green-500 border border-green-500/20 flex items-center gap-1 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                            <Activity size={10} className="animate-pulse" />
                            <LiveMinute status={live.status} initialMinute={live.minute} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center p-3 group-hover:bg-white/10 transition-colors">
                              <img src={live.home_logo} className="w-full h-full object-contain" alt="" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/50?text=?'} />
                            </div>
                            <span className="text-[11px] font-bold text-center line-clamp-2 h-8 leading-tight w-full">{live.home_team}</span>
                          </div>

                          <div className="flex flex-col items-center justify-center">
                            <div className="text-4xl font-black flex items-center gap-4 tabular-nums text-white">
                              <span>{live.home_score}</span>
                              <span className="text-blue-500 font-black">-</span>
                              <span>{live.away_score}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center p-3 group-hover:bg-white/10 transition-colors">
                              <img src={live.away_logo} className="w-full h-full object-contain" alt="" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/50?text=?'} />
                            </div>
                            <span className="text-[11px] font-bold text-center line-clamp-2 h-8 leading-tight w-full">{live.away_team}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/5 rounded-3xl p-8 text-center">
                    <p className="text-gray-500 font-bold">{t.no_live}</p>
                  </div>
                )}
              </section>
            )}

            <h2 className="text-xl font-bold mb-6">{t.upcoming}</h2>

            {loading && matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500">{t.analyzing}</p>
              </div>
            ) : error && matches.length === 0 ? (
              <div className="glass-morphism p-10 rounded-3xl border border-red-500/20 text-center max-w-2xl mx-auto">
                <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                <h2 className="text-xl font-bold mb-2">{t.conn_error}</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <button 
                  onClick={fetchData}
                  className="bg-white/10 px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center gap-2 mx-auto"
                >
                  <RefreshCw size={18} /> {t.retry}
                </button>
              </div>
            ) : matches.length === 0 ? (
              <div className="bg-white/5 border border-white/5 rounded-3xl p-12 text-center">
                <p className="text-gray-500 font-bold">{t.no_predictions}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {matches.map((match: any, idx) => {
                  const confColor = match.prob_val < 0.7 ? "#00d4ff" : match.prob_val < 0.85 ? "#00ff00" : "#ffbc00";
                  const isExpanded = expandedMatch === idx;
                  const isLocked = match.is_locked;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => !isLocked && setExpandedMatch(isExpanded ? null : idx)}
                      className={`bg-black/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 transition-all group overflow-hidden flex flex-col relative cursor-pointer ${isLocked ? 'grayscale-[0.5] opacity-80' : 'hover:border-green-400 hover:shadow-[0_0_60px_rgba(34,197,94,0.5)] shadow-2xl active:shadow-green-400/80 active:scale-[0.98]'}`}
                    >
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                           <Lock className="text-blue-500 mb-4" size={32} />
                           <h3 className="font-black text-sm uppercase tracking-widest mb-2">{t.premium_locked}</h3>
                           <button 
                             onClick={() => router.push("/payment")}
                             className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl text-[10px] font-bold transition-all shadow-lg shadow-blue-600/20"
                           >
                             {t.upgrade_btn}
                           </button>
                        </div>
                      )}
                      <div className="p-8">
                        <div className="flex justify-between items-start mb-8">
                          <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase flex flex-col gap-1">
                            <span>{new Date(match.time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded w-fit">
                              <MatchCountdown utcDate={match.time} lang={lang} />
                            </span>
                          </div>
                          {match.high_conf && (
                            <div className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-orange-500/20">
                              <Flame size={12} fill="currentColor" />
                              HIGH CONFIDENCE
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center mb-10">
                          <div className="flex flex-col items-center w-5/12 gap-3">
                            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors p-4 border border-white/5">
                              <img src={match.home_logo} alt={match.home_team} className="w-full h-full object-contain" />
                            </div>
                            <span className="text-sm font-black text-center h-10 line-clamp-2 text-white">{match.home_team}</span>
                          </div>

                          <div className="text-4xl font-black text-blue-500 px-4">-</div>

                          <div className="flex flex-col items-center w-5/12 gap-3">
                            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors p-4 border border-white/5">
                              <img src={match.away_logo} alt={match.away_team} className="w-full h-full object-contain" />
                            </div>
                            <span className="text-sm font-black text-center h-10 line-clamp-2 text-white">{match.away_team}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                          <StatBox label={t.winner} value={match.winner} highlight color="#00ff00" />
                          <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5 group-hover:border-green-500/30 transition-colors">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">{t.confidence}</p>
                            <p className="text-sm font-bold" style={{ color: confColor }}>{match.prob}</p>
                            <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                              <div className="h-full transition-all duration-1000" style={{ width: match.prob, backgroundColor: confColor }} />
                            </div>
                          </div>
                          <StatBox label={t.btts} value={`${match.btts} (${match.btts_prob})`} />
                        </div>

                        <div 
                          className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-gray-400 flex items-center justify-center gap-2 transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          {isExpanded ? (lang === 'ar' ? "إخفاء التحليل" : lang === 'fr' ? "Masquer l'analyse" : "Hide Analysis") : (lang === 'ar' ? "عرض تحليل الذكاء الاصطناعي" : lang === 'fr' ? "Voir l'analyse IA" : "Show AI Analysis")}
                        </div>
                      </div>

                      {isExpanded && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="px-8 pb-8 border-t border-white/5 bg-white/[0.02]"
                        >
                          <div className="pt-8 grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-tighter text-blue-500 flex items-center gap-2">
                                <img src={match.home_logo} className="w-4 h-4" alt="" />
                                {match.home_team} {t.stats}
                              </h4>
                              <AnalysisRow icon={<Goal size={12} />} label={t.avg_scored} value={match.home_stats.avg_scored.toFixed(2)} />
                              <AnalysisRow icon={<Shield size={12} />} label={t.avg_conceded} value={match.home_stats.avg_conceded.toFixed(2)} />
                              <AnalysisRow icon={<Activity size={12} />} label={t.form_pts} value={match.home_stats.form_pts.toString()} />
                            </div>
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-tighter text-blue-500 flex items-center gap-2">
                                <img src={match.away_logo} className="w-4 h-4" alt="" />
                                {match.away_team} {t.stats}
                              </h4>
                              <AnalysisRow icon={<Goal size={12} />} label={t.avg_scored} value={match.away_stats.avg_scored.toFixed(2)} />
                              <AnalysisRow icon={<Shield size={12} />} label={t.avg_conceded} value={match.away_stats.avg_conceded.toFixed(2)} />
                              <AnalysisRow icon={<Activity size={12} />} label={t.form_pts} value={match.away_stats.form_pts.toString()} />
                            </div>
                          </div>
                          <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                            <p className="text-xs leading-relaxed text-gray-300">
                              <span className="font-bold text-blue-500 uppercase text-[10px] mr-2">{t.reasoning}:</span>
                              {match.reason}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="max-w-2xl">
            <header className="mb-10">
              <h1 className="text-3xl font-bold">{t.profile}</h1>
              <p className="text-white/50">{lang === 'ar' ? "إدارة حسابك واشتراكك" : lang === 'fr' ? "Gérer votre compte et abonnement" : "Manage your account and subscription"}</p>
            </header>

            <div className="bg-black/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                  <User size={40} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{user?.username || "Loading..."}</h2>
                  <p className="text-white/50">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/5 p-8 rounded-3xl border border-blue-500/10 shadow-lg shadow-blue-500/5">
                  <p className="text-[10px] uppercase tracking-widest text-blue-500 font-black mb-3">{t.balance}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white tabular-nums">${user?.balance?.toFixed(2) || "0.00"}</span>
                    <span className="text-sm font-bold text-white/40 uppercase">USD</span>
                  </div>
                  <button 
                    onClick={() => router.push("/payment")}
                    className="mt-6 w-full bg-white/5 hover:bg-white/10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    + {t.topup}
                  </button>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">{lang === 'ar' ? "حالة الاشتراك" : lang === 'fr' ? "Statut de l'abonnement" : "Subscription Status"}</p>
                  <div className="flex flex-col gap-1">
                    {user?.has_paid ? (
                      <>
                        <span className="text-green-500 font-bold flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          {t.premium_active}
                        </span>
                        {user.expiry_date && (
                          <span className="text-[10px] text-white/50">
                            {t.expiry}: {new Date(user.expiry_date).toLocaleDateString(lang)} ({user.days_left} {t.days})
                          </span>
                        )}
                      </>
                    ) : user?.status === "pending" ? (
                      <span className="text-yellow-500 font-bold flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        {t.pending}
                      </span>
                    ) : (
                      <span className="text-red-500 font-bold flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        {user?.status === "expired" ? t.expired : t.free}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!user?.has_paid && user?.status !== "pending" && (
                <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold mb-1">{t.upgrade}</h3>
                    <p className="text-xs text-gray-400">{t.premium_desc}</p>
                  </div>
                  <button 
                    onClick={() => router.push("/payment")}
                    className="bg-blue-600 px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    {lang === 'ar' ? "عرض الخطط" : lang === 'fr' ? "Voir les plans" : "View Plans"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-4 cursor-pointer group transition-colors p-2 rounded-2xl w-full ${active ? 'bg-blue-500/10 text-blue-500 border border-blue-500/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
    >
      <div className={`p-1 rounded-lg`}>{icon}</div>
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </div>
  );
}

function StatBox({ label, value, highlight = false, color = "#3b82f6" }: { label: string, value: string, highlight?: boolean, color?: string }) {
  return (
    <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5 group-hover:border-white/10 transition-colors">
      <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-1">{label}</p>
      <p className={`text-sm font-bold`} style={{ color: highlight ? color : 'white' }}>{value}</p>
    </div>
  );
}

function AnalysisRow({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <div className="flex items-center gap-2 text-white/60">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
