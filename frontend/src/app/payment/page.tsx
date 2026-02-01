"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, Upload, Send, ShieldCheck, Globe, RefreshCw, AlertCircle } from "lucide-react";

const translations: any = {
  en: {
    title: "Choose Your",
    title_highlight: "Plan",
    subtitle: "Unlock access to our AI-powered winning predictions.",
    back: "Back to plans",
    payment_for: "Payment for",
    binance: "Binance ID",
    baridimob: "Baridimob RIP",
    upload: "Upload Receipt Screenshot",
    select_img: "Select an image...",
    tx_id: "Transaction ID / Reference",
    amount_label: "Amount to Recharge (DZD / USDT)",
    amount_placeholder: "Enter amount",
    tx_placeholder: "Paste reference here",
    submit: "Confirm Payment",
    submitting: "Submitting...",
    alert_login: "Please login first!",
    alert_missing: "Please enter Transaction ID and upload Receipt",
    alert_success: "Payment submitted for verification!",
    alert_fail: "Submission failed",
    popular: "MOST POPULAR",
    choose: "Choose Plan",
    or: "or",
    plans: [
      { 
        id: "daily", 
        name: "Daily Access", 
        price_usdt: "5 USDT", 
        price_dzd: "1,250 DZD",
        duration: "24 Hours", 
        features: ["10+ AI Predictions", "High Confidence Tips", "Instant Access"] 
      },
      { 
        id: "5days", 
        name: "5 Days Access", 
        price_usdt: "20 USDT", 
        price_dzd: "5,000 DZD",
        duration: "5 Days", 
        features: ["Full AI Access", "High Accuracy", "Advanced Stats"] 
      },
      { 
        id: "10days", 
        name: "10 Days Access", 
        price_usdt: "40 USDT", 
        price_dzd: "10,000 DZD",
        duration: "10 Days", 
        features: ["Priority Support", "All AI Predictions", "Best Success Rate"],
        popular: true
      },
      { 
        id: "monthly", 
        name: "Monthly Elite", 
        price_usdt: "120 USDT", 
        price_dzd: "30,000 DZD",
        duration: "30 Days", 
        features: ["Full Month Access", "VIP Analysis", "24/7 Support"]
      },
      { 
        id: "yearly", 
        name: "Yearly Pro", 
        price_usdt: "900 USDT", 
        price_dzd: "225,000 DZD",
        duration: "365 Days", 
        features: ["Best Value", "All Premium Features", "Priority Predictions"] 
      }
    ]
  },
  ar: {
    title: "اختر",
    title_highlight: "خطتك",
    subtitle: "افتح الوصول إلى توقعاتنا الرابحة المدعومة بالذكاء الاصطناعي.",
    back: "العودة للخطط",
    payment_for: "دفع لـ",
    binance: "معرف بينانس (Binance ID)",
    baridimob: "رقم الحساب (RIP Baridimob)",
    upload: "رفع صورة وصل الدفع",
    select_img: "اختر صورة...",
    tx_id: "رقم العملية / المرجع",
    amount_label: "المبلغ المراد شحنه (د.ج / USDT)",
    amount_placeholder: "أدخل المبلغ هنا",
    tx_placeholder: "أدخل المرجع هنا",
    submit: "تأكيد الدفع",
    submitting: "جاري الإرسال...",
    alert_login: "يرجى تسجيل الدخول أولاً!",
    alert_missing: "يرجى إدخال رقم العملية ورفع الوصل",
    alert_success: "تم رفع الطلب بنجاح! سيتم التحقق من المعاملة قريباً.",
    alert_fail: "فشل في رفع الطلب، يرجى المحاولة مرة أخرى",
    popular: "الأكثر رواجاً",
    choose: "اختر الخطة",
    or: "أو",
    plans: [
      { 
        id: "daily", 
        name: "وصول يومي", 
        price_usdt: "5 USDT", 
        price_dzd: "1,250 د.ج",
        duration: "24 ساعة", 
        features: ["+10 توقعات ذكية", "توصيات عالية الثقة", "وصول فوري"] 
      },
      { 
        id: "5days", 
        name: "خطة 5 أيام", 
        price_usdt: "20 USDT", 
        price_dzd: "5,000 د.ج",
        duration: "5 أيام", 
        features: ["وصول كامل للذكاء الاصطناعي", "دقة عالية", "إحصائيات متقدمة"] 
      },
      { 
        id: "10days", 
        name: "خطة 10 أيام", 
        price_usdt: "40 USDT", 
        price_dzd: "10,000 د.ج",
        duration: "10 أيام", 
        features: ["دعم فني ذو أولوية", "جميع التوقعات الذكية", "أفضل نسبة نجاح"],
        popular: true
      },
      { 
        id: "monthly", 
        name: "النخبة الشهري", 
        price_usdt: "120 USDT", 
        price_dzd: "30,000 د.ج",
        duration: "30 يوم", 
        features: ["وصول كامل للشهر", "تحليل VIP مفصل", "دعم فني 24/7"]
      },
      { 
        id: "yearly", 
        name: "الاحتراف السنوي", 
        price_usdt: "900 USDT", 
        price_dzd: "225,000 د.ج",
        duration: "365 يوم", 
        features: ["أفضل قيمة توفير", "جميع الميزات المميزة", "أولوية في التوقعات"] 
      }
    ]
  },
  fr: {
    title: "Choisissez Votre",
    title_highlight: "Plan",
    subtitle: "Débloquez l'accès à nos prédictions gagnantes par IA.",
    back: "Retour aux plans",
    payment_for: "Paiement pour",
    binance: "ID Binance",
    baridimob: "RIP Baridimob",
    upload: "Télécharger la capture du reçu",
    select_img: "Sélectionner une image...",
    tx_id: "ID de transaction / Référence",
    amount_label: "Montant à recharger (DZD / USDT)",
    amount_placeholder: "Entrez le montant",
    tx_placeholder: "Collez la référence ici",
    submit: "Confirmer le paiement",
    submitting: "Envoi en cours...",
    alert_login: "Veuillez d'abord vous connecter !",
    alert_missing: "Veuillez entrer l'ID de transaction et télécharger le reçu",
    alert_success: "Paiement soumis pour vérification !",
    alert_fail: "Échec de la soumission",
    popular: "LE PLUS POPULAIRE",
    choose: "Choisir le Plan",
    or: "ou",
    plans: [
      { 
        id: "daily", 
        name: "Accès Journalier", 
        price_usdt: "5 USDT", 
        price_dzd: "1,250 DZD",
        duration: "24 Heures", 
        features: ["10+ Prédictions IA", "Conseils Haute Confiance", "Accès Instantané"] 
      },
      { 
        id: "5days", 
        name: "Pass 5 Jours", 
        price_usdt: "20 USDT", 
        price_dzd: "5,000 DZD",
        duration: "5 Jours", 
        features: ["Accès complet IA", "Haute précision", "Stats avancées"] 
      },
      { 
        id: "10days", 
        name: "Pass 10 Jours", 
        price_usdt: "40 USDT", 
        price_dzd: "10,000 DZD",
        duration: "10 Jours", 
        features: ["Support prioritaire", "Prédictions complètes", "Meilleur taux de réussite"],
        popular: true
      },
      { 
        id: "monthly", 
        name: "Élite Mensuel", 
        price_usdt: "120 USDT", 
        price_dzd: "30,000 DZD",
        duration: "30 Jours", 
        features: ["Accès Mois Complet", "Analyse VIP", "Support 24/7"]
      },
      { 
        id: "yearly", 
        name: "Pro Annuel", 
        price_usdt: "900 USDT", 
        price_dzd: "225,000 DZD",
        duration: "365 Jours", 
        features: ["Meilleure Valeur", "Toutes les Options Premium", "Prédictions Prioritaires"] 
      }
    ]
  }
};

export default function Payment() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const [lang, setLang] = useState<"en" | "ar" | "fr">("en");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [txId, setTxId] = useState("");
  const [amount, setAmount] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [settings, setSettings] = useState({ binance_id: "Loading...", baridimob_id: "Loading..." });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as any;
    if (savedLang) setLang(savedLang);

    fetch(`${API_BASE}/payment-settings`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Failed to load settings"));
  }, []);

  const t = translations[lang];

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMsg(t.alert_login);
      setStatus("error");
      router.push("/login");
      return;
    }
    
    if (!txId || !receipt || !amount) {
      setErrorMsg(t.alert_missing);
      setStatus("error");
      return;
    }

    setSubmitting(true);
    setStatus("idle");
    setErrorMsg("");
    
    const formData = new FormData();
    formData.append("plan_id", selectedPlan.id);
    formData.append("tx_id", txId);
    formData.append("amount", amount);
    formData.append("receipt", receipt);

    try {
      const res = await fetch(`${API_BASE}/submit-payment`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 3000);
      } else {
        const errorData = await res.json();
        setErrorMsg(errorData.detail || t.alert_fail);
        setStatus("error");
      }
    } catch (err) {
      setErrorMsg("Connection Error");
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  const isRTL = lang === 'ar';

  if (selectedPlan) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism p-8 md:p-10 rounded-[2.5rem] border border-white/5 max-w-md w-full relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-50" />
          
          <button onClick={() => setSelectedPlan(null)} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-sm font-bold">
            <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} /> {t.back}
          </button>
          
          <h2 className="text-2xl font-black mb-2">{t.payment_for} <span className="text-blue-500">{selectedPlan.name}</span></h2>
          
          {status === "success" && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl mb-6 text-center">
              <ShieldCheck className="text-green-500 mx-auto mb-2" size={32} />
              <p className="text-green-500 font-bold text-sm">{t.alert_success}</p>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-6 text-center">
              <AlertCircle className="text-red-500 mx-auto mb-2" size={32} />
              <p className="text-red-500 font-bold text-sm">{errorMsg}</p>
            </motion.div>
          )}
          <div className="flex items-center gap-3 mb-8">
            <p className="text-white font-black text-2xl tabular-nums">{selectedPlan.price_usdt}</p>
            <span className="text-gray-600 font-bold">{t.or}</span>
            <p className="text-blue-500/80 font-bold tabular-nums italic">{selectedPlan.price_dzd}</p>
          </div>
          
          <div className="space-y-6">
            <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">{t.binance}</p>
                <img src="https://cryptologos.cc/logos/binance-coin-bnb-logo.png" alt="Binance" className="w-6 h-6 object-contain" />
              </div>
              <div className="flex justify-between items-center">
                <p className="font-mono text-lg text-white font-bold">{settings.binance_id}</p>
                <ShieldCheck size={16} className="text-blue-500/50" />
              </div>
            </div>
            
            <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">{t.baridimob}</p>
                <div className="w-8 h-5 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-sm flex items-center justify-center shadow-lg shadow-yellow-500/20">
                   <div className="w-1.5 h-1.5 bg-black/20 rounded-full" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-mono text-lg text-white font-bold">{settings.baridimob_id}</p>
                <ShieldCheck size={16} className="text-blue-500/50" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">{t.upload}</label>
              <div className="relative group">
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex items-center gap-4 group-hover:border-blue-500/50 transition-all group-hover:bg-white/[0.05]">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                    <Upload size={20} />
                  </div>
                  <span className="text-gray-400 text-sm font-medium truncate">
                    {receipt ? receipt.name : t.select_img}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">{t.amount_label}</label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all text-white font-medium"
                placeholder={t.amount_placeholder}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">{t.tx_id}</label>
              <input 
                type="text"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all text-white font-medium"
                placeholder={t.tx_placeholder}
              />
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 disabled:opacity-50 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
            >
              {submitting ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <><Send size={18} /> {t.submit}</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] py-20 px-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto text-center mb-20">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-blue-500 text-xs font-black uppercase tracking-widest mb-6"
        >
          <Globe size={14} />
          {lang.toUpperCase()} Version
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
          {t.title} <span className="text-blue-500">{t.title_highlight}</span>
        </h1>
        <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {t.plans.map((plan: any) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -10 }}
            className={`glass-morphism p-10 rounded-[3rem] border flex flex-col relative transition-all duration-500 ${plan.popular ? 'border-blue-500/50 bg-blue-500/[0.02] shadow-blue-500/10 shadow-2xl scale-105 z-10' : 'border-white/5'}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase shadow-lg shadow-blue-600/30">
                {t.popular}
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-3xl font-black mb-1">{plan.name}</h3>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">{plan.duration}</p>
            </div>
            
            <div className="mb-10 flex flex-col gap-1">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black tabular-nums">{plan.price_usdt.split(' ')[0]}</span>
                <span className="text-xl font-bold text-gray-500 uppercase">{plan.price_usdt.split(' ')[1]}</span>
              </div>
              <span className="text-blue-500/60 font-black text-sm italic tabular-nums">{plan.price_dzd}</span>
            </div>

            <div className="w-full h-px bg-white/5 mb-10" />

            <ul className="space-y-5 mb-12 flex-grow">
              {plan.features.map((f: string) => (
                <li key={f} className="flex items-center text-gray-400 gap-4 text-sm font-medium">
                  <div className="w-5 h-5 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 shrink-0">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => setSelectedPlan(plan)}
              className={`w-full py-5 rounded-[1.8rem] font-black uppercase tracking-widest text-xs transition-all ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 active:scale-95' : 'bg-white/5 hover:bg-white/10 text-white active:scale-95'}`}
            >
              {t.choose}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
