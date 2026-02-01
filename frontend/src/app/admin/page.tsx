"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Users, Settings, DollarSign, Check, X, Edit, 
  Search, Shield, LogOut, RefreshCw, Eye, Calendar,
  Trash2, Ban
} from "lucide-react";

interface AdminUser {
  email: string;
  username: string;
  status: string;
  has_paid: boolean;
  payment_status: string;
  plan: string;
  balance: number;
  pending_amount: number;
  expiry_date: string;
  txid: string;
  receipt_path: string;
}

interface Transaction {
  id: number;
  user_email: string;
  amount: number;
  txid: string;
  receipt_path: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const API_BASE = typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:8000" : "/api";
  
  const [activeTab, setActiveTab] = useState<"users" | "transactions" | "settings">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState({ binance_id: "", baridimob_id: "" });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<{path: string, email: string, amount: number} | null>(null);

  const checkAdmin = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.is_admin) {
        setIsAdmin(true);
        fetchUsers();
        fetchTransactions();
        fetchSettings();
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      router.push("/login");
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/admin/transactions`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) { console.error(err); }
  };

  const fetchSettings = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  const handleApprove = async (email: string, plan: string) => {
    const token = localStorage.getItem("token");
    let days = 1;
    if (plan === "5-day") days = 5;
    else if (plan === "10-day") days = 10;
    else if (plan === "monthly") days = 30;
    else if (plan === "yearly") days = 365;

    const formData = new FormData();
    formData.append("email", email);
    formData.append("days", days.toString());

    await fetch(`${API_BASE}/admin/approve-payment`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    fetchUsers();
  };

  const handleApproveTx = async (txId: number) => {
    const days = prompt("Enter number of days for this plan:", "30");
    if (!days) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("tx_id", txId.toString());
    formData.append("days", days);

    await fetch(`${API_BASE}/admin/approve-transaction`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    fetchTransactions();
    fetchUsers();
  };

  const handleRejectTx = async (txId: number) => {
    if (!confirm("Reject this transaction?")) return;
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("tx_id", txId.toString());

    await fetch(`${API_BASE}/admin/reject-transaction`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    fetchTransactions();
    fetchUsers();
  };

  const handleReject = async (email: string) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("email", email);

    await fetch(`${API_BASE}/admin/reject-payment`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    fetchUsers();
  };

  const handleCancelSubscription = async (email: string) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("email", email);

    await fetch(`${API_BASE}/admin/cancel-subscription`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    fetchUsers();
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete user ${email}?`)) return;
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("email", email);

    await fetch(`${API_BASE}/admin/delete-user`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    fetchUsers();
  };

  const handleRenew = async (email: string) => {
    const days = prompt("Enter number of days to add:", "30");
    if (!days) return;
    
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("email", email);
    formData.append("days", days);

    await fetch(`${API_BASE}/admin/approve-payment`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    fetchUsers();
  };

  const updateBalance = async (email: string, currentBalance: number) => {
    const newBalance = prompt("Enter new balance:", currentBalance.toString());
    if (newBalance === null) return;
    
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("email", email);
    formData.append("balance", newBalance);

    await fetch(`${API_BASE}/admin/update-balance`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    fetchUsers();
  };

  const updateExpiry = async (email: string, currentExpiry: string) => {
    const newExpiry = prompt("Enter new expiry date (YYYY-MM-DDTHH:MM:SS):", currentExpiry || new Date().toISOString());
    if (newExpiry === null) return;
    
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("email", email);
    formData.append("expiry_date", newExpiry);

    await fetch(`${API_BASE}/admin/update-expiry`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    fetchUsers();
  };

  const updateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("binance_id", settings.binance_id);
    formData.append("baridimob_id", settings.baridimob_id);

    await fetch(`${API_BASE}/admin/update-settings`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    alert("Settings updated!");
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin || loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/50">
              <Shield className="text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black italic">ADMIN PANEL</h1>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Management System</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-2 border border-white/5 transition-all"
            >
              <Eye size={18} />
              <span>View Predictions</span>
            </button>
            <button 
              onClick={() => { localStorage.removeItem("token"); router.push("/login"); }}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl flex items-center gap-2 border border-red-500/20 transition-all"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-2xl w-fit border border-white/5">
          <button 
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "users" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:text-white"}`}
          >
            <Users size={16} /> Users Management
          </button>
          <button 
            onClick={() => setActiveTab("transactions")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "transactions" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:text-white"}`}
          >
            <DollarSign size={16} /> Transactions
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "settings" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:text-white"}`}
          >
            <Settings size={16} /> Payment Settings
          </button>
        </div>

        {activeTab === "users" ? (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search by email or username..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 focus:border-blue-500/50 outline-none transition-all"
              />
            </div>

            {/* Users Table */}
            <div className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-500 font-black">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Balance</th>
                      <th className="px-6 py-4">Subscription</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((u) => (
                      <tr key={u.email} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold">{u.username || "No Name"}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          {u.payment_status === "pending" ? (
                            <div className="flex flex-col gap-1">
                              <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-lg text-[10px] font-black uppercase border border-yellow-500/20 animate-pulse">Pending Review</span>
                              <span className="text-[10px] font-bold text-yellow-500/80">Requested: ${u.pending_amount}</span>
                            </div>
                          ) : u.has_paid ? (
                            <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-lg text-[10px] font-black uppercase border border-green-500/20">Active</span>
                          ) : (
                            <span className="bg-white/5 text-gray-500 px-2 py-1 rounded-lg text-[10px] font-black uppercase">Unpaid</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-blue-500 font-bold">
                          ${u.balance?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-white/80">{u.plan || "N/A"}</div>
                          <div className="text-[10px] text-gray-500">Exp: {u.expiry_date?.split('T')[0] || "Never"}</div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {u.receipt_path && (
                            <button 
                              onClick={() => setSelectedReceipt({path: u.receipt_path, email: u.email, amount: u.pending_amount})}
                              className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-all"
                              title="View Receipt"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => updateBalance(u.email, u.balance)}
                            className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-all"
                            title="Edit Balance"
                          >
                            <DollarSign size={16} />
                          </button>
                          <button 
                            onClick={() => updateExpiry(u.email, u.expiry_date)}
                            className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-all"
                            title="Edit Expiry"
                          >
                            <Calendar size={16} />
                          </button>
                          {u.has_paid && (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleCancelSubscription(u.email)}
                                className="p-2 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500/20 transition-all"
                                title="Cancel Subscription"
                              >
                                <Ban size={16} />
                              </button>
                              <button 
                                onClick={() => handleRenew(u.email)}
                                className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all"
                                title="Renew/Add Days"
                              >
                                <RefreshCw size={16} />
                              </button>
                            </div>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(u.email)}
                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                          {u.payment_status === "pending" && (
                            <>
                              <button 
                                onClick={() => handleApprove(u.email, u.plan)}
                                className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all"
                                title="Approve"
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                onClick={() => handleReject(u.email)}
                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
                                title="Reject"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "transactions" ? (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-500 font-black">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">TX ID</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-sm">{tx.user_email}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-blue-500 font-bold">
                          ${tx.amount?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400">
                          {tx.txid}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border ${
                            tx.status === "approved" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                            tx.status === "rejected" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                            "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse"
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => setSelectedReceipt({path: tx.receipt_path, email: tx.user_email, amount: tx.amount})}
                            className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-all"
                            title="View Receipt"
                          >
                            <Eye size={16} />
                          </button>
                          {tx.status === "pending" && (
                            <>
                              <button 
                                onClick={() => handleApproveTx(tx.id)}
                                className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all"
                                title="Approve"
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                onClick={() => handleRejectTx(tx.id)}
                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
                                title="Reject"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl bg-white/5 rounded-3xl border border-white/5 p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <DollarSign className="text-blue-500" /> Payment Details
            </h2>
            <form onSubmit={updateSettings} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">Binance ID</label>
                <input 
                  type="text" 
                  value={settings.binance_id}
                  onChange={(e) => setSettings({...settings, binance_id: e.target.value})}
                  className="w-full bg-black/50 border border-white/5 rounded-xl py-3 px-4 focus:border-blue-500/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">Baridimob RIP</label>
                <input 
                  type="text" 
                  value={settings.baridimob_id}
                  onChange={(e) => setSettings({...settings, baridimob_id: e.target.value})}
                  className="w-full bg-black/50 border border-white/5 rounded-xl py-3 px-4 focus:border-blue-500/50 outline-none transition-all"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="max-w-3xl w-full bg-[#111] rounded-3xl border border-white/10 p-4 relative">
            <button 
              onClick={() => setSelectedReceipt(null)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all z-10"
            >
              <X size={20} />
            </button>
            <div className="p-4 overflow-auto max-h-[80vh]">
              <img 
                src={`${API_BASE}/${selectedReceipt.path}`} 
                alt="Payment Receipt" 
                className="w-full h-auto rounded-xl"
              />
            </div>
            <div className="mt-4 p-4 text-center border-t border-white/5">
              <p className="text-blue-500 font-black text-xl mb-1">${selectedReceipt.amount?.toFixed(2)}</p>
              <p className="text-gray-400 text-sm font-bold">{selectedReceipt.email}</p>
              <p className="text-gray-500 text-[10px] mt-2 uppercase tracking-widest">Reviewing payment receipt for verification</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
