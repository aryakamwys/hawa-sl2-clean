"use client";

import { useEffect, useState } from "react";
import { X, Users, Cpu, Brain, ScrollText, UserCog, Loader2, Phone, MapPin, FileText, Bell, CheckCircle2, UserCircle } from "lucide-react";
import NotificationSettings from "./notifications/NotificationSettings";

type AdminTab = "users" | "devices" | "ai-consume" | "logs" | "account" | "profile" | "notifications";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import { useLanguage } from "@/hooks/useLanguage";

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTab>("account");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const allMenuItems: { id: AdminTab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { id: "users", label: t.settings.tabs.users, icon: <Users size={18} />, adminOnly: true },
    { id: "devices", label: t.settings.tabs.devices, icon: <Cpu size={18} />, adminOnly: true },
    { id: "ai-consume", label: t.settings.tabs.aiConsume, icon: <Brain size={18} />, adminOnly: true },
    { id: "logs", label: t.settings.tabs.logs, icon: <ScrollText size={18} />, adminOnly: true },
    { id: "profile", label: t.settings.tabs.profile, icon: <UserCircle size={18} /> },
    { id: "notifications", label: t.settings.tabs.notifications, icon: <Bell size={18} /> },
    { id: "account", label: t.settings.tabs.account, icon: <UserCog size={18} /> },
  ];

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setUserRole(data.user?.role || "USER");
        if (data.user?.role === "ADMIN") {
          setActiveTab("users");
        }
      } catch {
        setUserRole("USER");
      }
    };
    if (isOpen) {
      fetchUserRole();
    }
  }, [isOpen]);

  const menuItems = userRole === "ADMIN" 
    ? allMenuItems 
    : allMenuItems.filter(item => !item.adminOnly);

  // UX: ESC close + lock scroll
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <button
        aria-label="Close modal backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Dialog */}
      <div className="relative mx-auto flex min-h-full items-center justify-center !p-4 md:!p-6">
        <div className="w-full max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 z-10"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden !px-4 !py-3 border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <span>{menuItems.find((item) => item.id === activeTab)?.label}</span>
                <svg className={`h-4 w-4 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Mobile Dropdown Menu */}
              {mobileMenuOpen && (
                <div className="mt-2 space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 !px-3 !py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === item.id
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                      }`}
                    >
                      <span className={activeTab === item.id ? "text-gray-700" : "text-gray-400"}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-1 min-h-0">
              {/* Sidebar - Desktop Only */}
              <div className="hidden lg:block w-52 border-r border-gray-100 bg-gray-50 !py-4 !px-3 overflow-y-auto">
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 !px-3 !py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === item.id
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                      }`}
                    >
                      <span className={activeTab === item.id ? "text-gray-700" : "text-gray-400"}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 !p-4 md:!p-6 overflow-y-auto">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 !mb-4 md:!mb-6">
                  {menuItems.find((item) => item.id === activeTab)?.label}
                </h2>

                {/* Tab Content */}
                {activeTab === "users" && <UsersContent />}
                {activeTab === "devices" && <DevicesContent />}
                {activeTab === "ai-consume" && <AIConsumeContent />}
                {activeTab === "logs" && <LogsContent />}
                {activeTab === "profile" && <ProfileContent />}
                {activeTab === "notifications" && <NotificationsContent />}
                {activeTab === "account" && <AccountContent />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Table component
function DataTable({ 
  headers, 
  data 
}: { 
  headers: string[]; 
  data: (string | React.ReactNode)[][] 
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {headers.map((header, i) => (
              <th key={i} className="!px-4 !py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="!px-4 !py-2.5 text-sm text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Status badge
function StatusBadge({ status, type }: { status: string; type: "success" | "warning" | "error" | "info" }) {
  const colors = {
    success: "bg-green-50 text-green-600",
    warning: "bg-amber-50 text-amber-600",
    error: "bg-red-50 text-red-600",
    info: "bg-blue-50 text-blue-600",
  };

  return (
    <span className={`inline-flex !px-2 !py-0.5 rounded text-xs font-medium ${colors[type]}`}>
      {status}
    </span>
  );
}

// Tab Contents
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  language?: string;
  isActive?: boolean;
}

function UsersContent() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to fetch users");
        return;
      }
      
      setUsers(data.users);
    } catch {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (userId: string) => {
    setToggling(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "Failed to update user");
        return;
      }
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isActive: data.user.isActive } : u
      ));
    } catch {
      alert("Failed to update user");
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center !py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center !py-12">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  const tableData = users.map((user, index) => [
    String(index + 1),
    user.name,
    user.email,
    user.role,
    <StatusBadge key={`status-${user.id}`} status={user.isActive ? "Active" : "Inactive"} type={user.isActive ? "success" : "warning"} />,
    <button
      key={`action-${user.id}`}
      onClick={() => toggleUserStatus(user.id)}
      disabled={toggling === user.id}
      className={`!px-2 !py-1 text-xs font-medium rounded transition ${
        user.isActive
          ? "text-red-600 hover:bg-red-50"
          : "text-green-600 hover:bg-green-50"
      } disabled:opacity-50`}
    >
      {toggling === user.id ? "..." : user.isActive ? "Deactivate" : "Activate"}
    </button>,
  ]);

  return (
    <div>
      <div className="!mb-4">
        <p className="text-sm text-gray-500">{users.length} {t.settings.usersRegistered}</p>
      </div>
      {users.length === 0 ? (
        <div className="text-center !py-8 text-sm text-gray-400">{t.settings.noUsers}</div>
      ) : (
        <DataTable 
          headers={["#", "Name", "Email", "Role", "Status", "Action"]} 
          data={tableData}
        />
      )}
    </div>
  );
}

interface Device {
  no: string;
  timestamp: string;
  pm25Raw: string;
  pm25Density: string;
  pm10Density: string;
  airQualityLevel: string;
  temperature: string;
  humidity: string;
  pressure: string;
  altitudeEstimate: string;
  deviceId: string;
}

function DevicesContent() {
  const { t } = useLanguage();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch("/api/admin/devices");
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || "Failed to fetch devices");
          return;
        }
        
        setDevices(data.devices);
      } catch {
        setError("Failed to fetch devices");
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center !py-12">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center !py-8">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const getStatusType = (airQuality: string): "success" | "warning" | "error" => {
    const level = airQuality.toUpperCase();
    if (level === "GOOD") return "success";
    if (level === "MODERATE") return "warning";
    return "error";
  };

  // Pagination
  const totalPages = Math.ceil(devices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDevices = devices.slice(startIndex, endIndex);

  const tableData = paginatedDevices.map((device) => [
    device.no,
    device.timestamp,
    device.pm25Raw,
    device.pm25Density,
    device.pm10Density,
    <StatusBadge key={device.no} status={device.airQualityLevel} type={getStatusType(device.airQualityLevel)} />,
    device.temperature,
    device.humidity,
    device.pressure,
    device.altitudeEstimate,
    device.deviceId,
  ]);

  return (
    <div>
      <div className="flex items-center justify-between !mb-4">
        <p className="text-sm text-gray-500">{devices.length} {t.settings.recordsTotal}</p>
      </div>
      {devices.length === 0 ? (
        <div className="text-center !py-8 text-sm text-gray-400">{t.settings.noData}</div>
      ) : (
        <>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg">
            <DataTable 
              headers={["No", "Timestamp", "PM2.5 raw", "PM2.5 density", "PM10 density", "Air quality", "Temp (°C)", "Humidity (%)", "Pressure", "Altitude", "Device ID"]} 
              data={tableData}
            />
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 !mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="!px-3 !py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.common.prev}
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="!px-3 !py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.common.next}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AIConsumeContent() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ tokensToday: 0, costMonth: 0, totalRequests: 0, avgTokensPerRequest: 0 });
  const [dailyUsage, setDailyUsage] = useState<{ date: string; model: string; totalTokens: number; totalCost: number; requestCount: number }[]>([]);
  const [recentLogs, setRecentLogs] = useState<{ id: string; userName: string; userEmail: string; model: string; totalTokens: number; cost: number; createdAt: string }[]>([]);
  const [dailyPage, setDailyPage] = useState(1);
  const [recentPage, setRecentPage] = useState(1);
  const PAGE_SIZE = 5;

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch("/api/admin/ai-usage");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch AI usage");
          return;
        }

        setStats(data.stats);
        setDailyUsage(data.dailyUsage);
        setRecentLogs(data.recentLogs);
      } catch {
        setError("Failed to fetch AI usage data");
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center !py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center !py-12">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  const dailyData = dailyUsage.map((row) => [
    row.date,
    row.model,
    row.totalTokens.toLocaleString(),
    `$${row.totalCost.toFixed(6)}`,
    String(row.requestCount),
  ]);

  const recentData = recentLogs.map((log) => [
    new Date(log.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }),
    log.userName,
    log.model,
    log.totalTokens.toLocaleString(),
    `$${log.cost.toFixed(6)}`,
  ]);

  const dailyTotalPages = Math.ceil(dailyData.length / PAGE_SIZE);
  const dailyPaged = dailyData.slice((dailyPage - 1) * PAGE_SIZE, dailyPage * PAGE_SIZE);

  const recentTotalPages = Math.ceil(recentData.length / PAGE_SIZE);
  const recentPaged = recentData.slice((recentPage - 1) * PAGE_SIZE, recentPage * PAGE_SIZE);

  return (
    <div>
      <p className="text-sm text-gray-500 !mb-4">{t.settings.aiMonitor}</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3 !mb-4">
        <div className="!p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-lg font-semibold text-gray-800">{stats.tokensToday.toLocaleString()}</p>
          <p className="text-xs text-gray-500">{t.settings.stats.tokensToday}</p>
        </div>
        <div className="!p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-lg font-semibold text-gray-800">${stats.costMonth.toFixed(4)}</p>
          <p className="text-xs text-gray-500">{t.settings.stats.costMonth}</p>
        </div>
        <div className="!p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-lg font-semibold text-gray-800">{stats.totalRequests.toLocaleString()}</p>
          <p className="text-xs text-gray-500">{t.settings.stats.totalRequests}</p>
        </div>
        <div className="!p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-lg font-semibold text-gray-800">{stats.avgTokensPerRequest}</p>
          <p className="text-xs text-gray-500">{t.settings.stats.avgTokens}</p>
        </div>
      </div>

      {/* Daily Usage */}
      <h3 className="text-sm font-medium text-gray-700 !mb-3">{t.settings.headers.dailyUsage}</h3>
      {dailyData.length === 0 ? (
        <div className="text-center !py-6 text-sm text-gray-400 border border-gray-200 rounded-lg !mb-4">{t.settings.noUsage}</div>
      ) : (
        <div className="!mb-4">
          <div className="overflow-y-auto max-h-[280px]">
            <DataTable
              headers={["Date", "Model", "Tokens", "Cost", "Requests"]}
              data={dailyPaged}
            />
          </div>
          {dailyTotalPages > 1 && (
            <div className="flex items-center justify-between !mt-2 !px-1">
              <p className="text-xs text-gray-400">{dailyData.length} {t.settings.totalEntries}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDailyPage((p) => Math.max(1, p - 1))}
                  disabled={dailyPage === 1}
                  className="!px-2.5 !py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {t.common.prev}
                </button>
                <span className="text-xs text-gray-500">{dailyPage} / {dailyTotalPages}</span>
                <button
                  onClick={() => setDailyPage((p) => Math.min(dailyTotalPages, p + 1))}
                  disabled={dailyPage === dailyTotalPages}
                  className="!px-2.5 !py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {t.common.next}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Requests */}
      <h3 className="text-sm font-medium text-gray-700 !mb-3">{t.settings.headers.recentRequests}</h3>
      {recentData.length === 0 ? (
        <div className="text-center !py-6 text-sm text-gray-400 border border-gray-200 rounded-lg">{t.settings.noRequests}</div>
      ) : (
        <div>
          <div className="overflow-y-auto max-h-[280px]">
            <DataTable
              headers={["Time", "User", "Model", "Tokens", "Cost"]}
              data={recentPaged}
            />
          </div>
          {recentTotalPages > 1 && (
            <div className="flex items-center justify-between !mt-2 !px-1">
              <p className="text-xs text-gray-400">{recentData.length} {t.settings.totalEntries}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRecentPage((p) => Math.max(1, p - 1))}
                  disabled={recentPage === 1}
                  className="!px-2.5 !py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {t.common.prev}
                </button>
                <span className="text-xs text-gray-500">{recentPage} / {recentTotalPages}</span>
                <button
                  onClick={() => setRecentPage((p) => Math.min(recentTotalPages, p + 1))}
                  disabled={recentPage === recentTotalPages}
                  className="!px-2.5 !py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {t.common.next}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LogsContent() {
  const { t } = useLanguage();
  const logs = [
    ["12:45:32", "INFO", "User login: arya@example.com", <StatusBadge key="1" status="Info" type="info" />],
    ["12:44:15", "SUCCESS", "Device DEV-001 synced", <StatusBadge key="2" status="Success" type="success" />],
    ["12:42:08", "WARNING", "Device DEV-004 battery low", <StatusBadge key="3" status="Warning" type="warning" />],
    ["12:40:22", "ERROR", "Device DEV-003 disconnected", <StatusBadge key="4" status="Error" type="error" />],
    ["12:38:55", "INFO", "AI prediction generated", <StatusBadge key="5" status="Info" type="info" />],
    ["12:35:10", "SUCCESS", "New user registered", <StatusBadge key="6" status="Success" type="success" />],
  ];

  return (
    <div>
      <div className="flex items-center justify-between !mb-4">
        <p className="text-sm text-gray-500">{t.settings.logsDesc}</p>
        <div className="flex gap-2">
          <select className="!px-2 !py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white">
            <option>{t.settings.allLevels}</option>
            <option>Info</option>
            <option>Success</option>
            <option>Warning</option>
            <option>Error</option>
          </select>
          <button className="!px-3 !py-1.5 text-gray-600 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            {t.settings.export}
          </button>
        </div>
      </div>
      <DataTable
        headers={["Time", "Level", "Message", "Status"]}
        data={logs}
      />
    </div>
  );
}

function ProfileContent() {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ageGroup, setAgeGroup] = useState<"" | "ANAK" | "REMAJA" | "DEWASA" | "LANSIA">("");
  const [gender, setGender] = useState<"" | "MALE" | "FEMALE" | "OTHER">("");
  const [customNotes, setCustomNotes] = useState("");
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [district, setDistrict] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user info
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      setUser(userData.user);

      // Fetch profile
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();

      if (profileData.profile) {
        setProfile(profileData.profile);
        setPhoneNumber(profileData.profile.phoneNumber || "");
        setAgeGroup(profileData.profile.ageGroup || "");
        setGender(profileData.profile.gender || "");
        setCustomNotes(profileData.profile.customNotes || "");
        setNotifEnabled(profileData.profile.notifEnabled || false);
        setDistrict(profileData.profile.district || "");
      }
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    if (!ageGroup || !gender) {
      setError(t.settings.profileError);
      setSaving(false);
      return;
    }

    const body = {
      phoneNumber,
      ageGroup,
      gender,
      customNotes,
      notifEnabled,
      district,
    };

    try {
      const endpoint = profile ? "/api/profile" : "/api/profile";
      const method = profile ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || t.common.error);
        return;
      }

      setSuccess(true);
      setProfile(data.profile);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError(t.common.networkError);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center !py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 !mb-4">{t.settings.profileDesc}</p>

      {success && (
        <div className="!mb-4 rounded-xl border border-green-200 bg-green-50 !px-4 !py-3 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 size={16} />
          {t.settings.profileSuccess}
        </div>
      )}

      {error && (
        <div className="!mb-4 rounded-xl border border-red-200 bg-red-50 !px-4 !py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* User Info Card */}
      <div className="!p-4 bg-gray-50 rounded-lg !mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#005AE1] flex items-center justify-center text-white text-lg font-semibold">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <span className="!px-3 !py-1 text-xs font-medium rounded-full bg-blue-50 text-[#005AE1]">
            {user?.role === "ADMIN" ? "Admin" : "User"}
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone Number */}
        <div>
          <label className="!mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Phone size={16} className="text-gray-400" />
            {t.settings.form.phoneNumber}
            <span className="text-xs font-normal text-gray-400">{t.settings.form.optional}</span>
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+62812345678"
            className="w-full rounded-xl bg-gray-50 !px-4 !py-3 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-[#005AE1]/25 focus:bg-white transition"
          />
        </div>

        {/* Age Group */}
        <div>
          <label className="!mb-2 block text-sm font-semibold text-gray-800">
            {t.settings.form.ageGroup} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: "ANAK", label: t.settings.form.options?.ageGroup?.child || "Child" },
              { value: "REMAJA", label: t.settings.form.options?.ageGroup?.teen || "Teen" },
              { value: "DEWASA", label: t.settings.form.options?.ageGroup?.adult || "Adult" },
              { value: "LANSIA", label: t.settings.form.options?.ageGroup?.elderly || "Elderly" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setAgeGroup(item.value as any)}
                className={`rounded-xl border-2 !py-3 text-sm font-semibold transition ${
                  ageGroup === item.value
                    ? "border-[#005AE1] bg-[#005AE1] text-white"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="!mb-2 block text-sm font-semibold text-gray-800">
            {t.settings.form.gender} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "MALE", label: t.settings.form.options?.gender?.male || "Male" },
              { value: "FEMALE", label: t.settings.form.options?.gender?.female || "Female" },
              { value: "OTHER", label: t.settings.form.options?.gender?.other || "Other" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setGender(item.value as any)}
                className={`rounded-xl border-2 !py-3 text-sm font-semibold transition ${
                  gender === item.value
                    ? "border-[#005AE1] bg-[#005AE1] text-white"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* District */}
        <div>
          <label className="!mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <MapPin size={16} className="text-gray-400" />
            {t.settings.form.district}
            <span className="text-xs font-normal text-gray-400">{t.settings.form.optional}</span>
          </label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder={t.settings.form.districtPlaceholder}
            className="w-full rounded-xl bg-gray-50 !px-4 !py-3 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-[#005AE1]/25 focus:bg-white transition"
          />
        </div>

        {/* Custom Notes */}
        <div>
          <label className="!mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FileText size={16} className="text-gray-400" />
            {t.settings.form.healthNotes}
            <span className="text-xs font-normal text-gray-400">{t.settings.form.optional}</span>
          </label>
          <textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder={t.settings.form.healthNotesPlaceholder}
            rows={3}
            className="w-full rounded-xl bg-gray-50 !px-4 !py-3 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-[#005AE1]/25 focus:bg-white transition resize-none"
          />
          <p className="!mt-1 text-xs text-gray-500">
            {t.settings.form.healthNotesDesc}
          </p>
        </div>

        {/* Notification Toggle */}
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 !px-4 !py-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <Bell size={18} className="text-[#005AE1]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{t.settings.form.notifications}</p>
              <p className="text-xs text-gray-500">{t.settings.form.notificationsDesc}</p>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={notifEnabled}
              onChange={(e) => setNotifEnabled(e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#005AE1] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl border-0 bg-[#005AE1] !py-3 text-sm font-semibold text-white hover:bg-[#004BB8] disabled:opacity-60 transition"
        >
          {saving ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              {t.settings.form.saving}
            </span>
          ) : profile ? (
            t.settings.form.updateProfile
          ) : (
            t.settings.form.saveProfile
          )}
        </button>
      </form>
    </div>
  );
}

function NotificationsContent() {
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        setPhoneNumber(data.profile?.phoneNumber);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center !py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return <NotificationSettings phoneNumber={phoneNumber} />;
}

function AccountContent() {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"EN" | "ID">("EN");
  const [savingLanguage, setSavingLanguage] = useState(false);
  const [languageMessage, setLanguageMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setUser(data.user);
        setLanguage(data.user?.language || "EN");
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleLanguageChange = async (newLang: "EN" | "ID") => {
    setSavingLanguage(true);
    setLanguageMessage(null);
    try {
      const res = await fetch("/api/user/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: newLang }),
      });
      const data = await res.json();
      if (res.ok) {
        setLanguage(newLang);
        if (user) setUser({ ...user, language: newLang });
        setLanguageMessage({ type: "success", text: t.settings.languageUpdateSuccess });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setLanguageMessage({ type: "error", text: data.error || t.settings.languageUpdateFailed });
      }
    } catch {
      setLanguageMessage({ type: "error", text: t.settings.languageUpdateFailed });
    } finally {
      setSavingLanguage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center !py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 !mb-4">{t.settings.form.manageAccount}</p>

      <div className="space-y-4">
        {/* Language Selector */}
        <div className="!p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <UserCog size={18} className="text-[#005AE1]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{t.settings.language}</p>
              <p className="text-xs text-gray-500">{t.settings.languageDescription}</p>
            </div>
          </div>
          <div className="!mt-3 flex gap-2">
            <button
              onClick={() => !savingLanguage && handleLanguageChange("EN")}
              disabled={savingLanguage}
              className={`flex-1 !px-4 !py-2.5 rounded-xl text-sm font-semibold transition-all ${
                language === "EN"
                  ? "bg-[#005AE1] text-white border-2 border-[#005AE1]"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300"
              }`}
            >
              🇺🇸 {t.settings.english}
            </button>
            <button
              onClick={() => !savingLanguage && handleLanguageChange("ID")}
              disabled={savingLanguage}
              className={`flex-1 !px-4 !py-2.5 rounded-xl text-sm font-semibold transition-all ${
                language === "ID"
                  ? "bg-[#005AE1] text-white border-2 border-[#005AE1]"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300"
              }`}
            >
              🇮🇩 {t.settings.indonesian}
            </button>
          </div>
          {languageMessage && (
            <div className={`!mt-2 text-xs ${languageMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {languageMessage.text}
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className="!p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#005AE1] flex items-center justify-center text-white text-lg font-semibold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">{t.settings.form.name}</label>
                  <p className="text-sm text-gray-800 font-medium">{user?.name || "-"}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">{t.settings.form.email}</label>
                  <p className="text-sm text-gray-800 font-medium">{user?.email || "-"}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">{t.settings.form.role}</label>
                  <p className="text-sm text-gray-800 font-medium">{user?.role === "ADMIN" ? "Administrator" : "User"}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">{t.settings.form.status}</label>
                  <p className="text-sm text-gray-800 font-medium">{t.settings.form.active}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="!p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
            <h4 className="text-sm font-medium text-gray-800">{t.settings.form.changePassword}</h4>
            <p className="text-xs text-gray-400 !mt-0.5">{t.settings.form.changePasswordDesc}</p>
          </button>
          <button className="!p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
            <h4 className="text-sm font-medium text-gray-800">{t.settings.form.twoFactor}</h4>
            <p className="text-xs text-gray-400 !mt-0.5">{t.settings.form.twoFactorDesc}</p>
          </button>
          {user?.role === "ADMIN" && (
            <>
              <button className="!p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                <h4 className="text-sm font-medium text-gray-800">{t.settings.form.apiKeys}</h4>
                <p className="text-xs text-gray-400 !mt-0.5">{t.settings.form.apiKeysDesc}</p>
              </button>
            </>
          )}
          <button className="!p-3 text-left bg-white rounded-lg border border-red-100 hover:border-red-200 hover:bg-red-50 transition-all">
            <h4 className="text-sm font-medium text-red-600">{t.settings.form.logoutAll}</h4>
            <p className="text-xs text-red-400 !mt-0.5">{t.settings.form.logoutAllDesc}</p>
          </button>
        </div>
      </div>
    </div>
  );
}
