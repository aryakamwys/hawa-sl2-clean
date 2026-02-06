"use client";

import { useEffect, useState } from "react";
import { X, Users, Cpu, Brain, ScrollText, UserCog, Loader2 } from "lucide-react";

type AdminTab = "users" | "devices" | "ai-consume" | "logs" | "account";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: "users", label: "User", icon: <Users size={18} /> },
  { id: "devices", label: "Device IoT", icon: <Cpu size={18} /> },
  { id: "ai-consume", label: "AI Consume", icon: <Brain size={18} /> },
  { id: "logs", label: "Log", icon: <ScrollText size={18} /> },
  { id: "account", label: "Account", icon: <UserCog size={18} /> },
];

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("users");

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
      <div className="relative mx-auto flex min-h-full items-center justify-center !p-6">
        <div className="w-full max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 z-10"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex min-h-[560px]">
              {/* Sidebar */}
              <div className="w-52 border-r border-gray-100 bg-gray-50 !py-4 !px-3">
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
              <div className="flex-1 !p-6 overflow-y-auto">
                <h2 className="text-lg font-semibold text-gray-900 !mb-6">
                  {menuItems.find((item) => item.id === activeTab)?.label}
                </h2>

                {/* Tab Content */}
                {activeTab === "users" && <UsersContent />}
                {activeTab === "devices" && <DevicesContent />}
                {activeTab === "ai-consume" && <AIConsumeContent />}
                {activeTab === "logs" && <LogsContent />}
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
  isActive: boolean;
  createdAt: string;
}

function UsersContent() {
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
        <p className="text-sm text-gray-500">{users.length} users registered</p>
      </div>
      {users.length === 0 ? (
        <div className="text-center !py-8 text-sm text-gray-400">No users found</div>
      ) : (
        <DataTable 
          headers={["#", "Name", "Email", "Role", "Status", "Action"]} 
          data={tableData}
        />
      )}
    </div>
  );
}

function DevicesContent() {
  const devices = [
    ["DEV-001", "Sensor Bandung Utara", "-6.87, 107.61", <StatusBadge key="1" status="Online" type="success" />, "2m ago"],
    ["DEV-002", "Sensor Bandung Selatan", "-6.95, 107.63", <StatusBadge key="2" status="Online" type="success" />, "5m ago"],
    ["DEV-003", "Sensor Cimahi", "-6.88, 107.54", <StatusBadge key="3" status="Offline" type="error" />, "2h ago"],
    ["DEV-004", "Sensor Lembang", "-6.81, 107.62", <StatusBadge key="4" status="Warning" type="warning" />, "15m ago"],
  ];

  return (
    <div>
      <div className="flex items-center justify-between !mb-4">
        <p className="text-sm text-gray-500">Monitor dan kelola perangkat IoT</p>
        <button className="!px-3 !py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition">
          + Tambah Device
        </button>
      </div>
      <DataTable 
        headers={["Device ID", "Nama", "Lokasi", "Status", "Last Sync"]} 
        data={devices}
      />
      <div className="!mt-4 grid grid-cols-3 gap-3">
        <div className="!p-3 bg-green-50 rounded-lg">
          <p className="text-xl font-semibold text-green-600">2</p>
          <p className="text-xs text-green-600">Online</p>
        </div>
        <div className="!p-3 bg-amber-50 rounded-lg">
          <p className="text-xl font-semibold text-amber-600">1</p>
          <p className="text-xs text-amber-600">Warning</p>
        </div>
        <div className="!p-3 bg-red-50 rounded-lg">
          <p className="text-xl font-semibold text-red-600">1</p>
          <p className="text-xs text-red-600">Offline</p>
        </div>
      </div>
    </div>
  );
}

function AIConsumeContent() {
  const usageData = [
    ["2026-02-06", "GPT-4", "1,234", "$2.47"],
    ["2026-02-05", "GPT-4", "987", "$1.97"],
    ["2026-02-04", "GPT-4", "1,567", "$3.13"],
    ["2026-02-03", "GPT-4", "2,100", "$4.20"],
  ];

  return (
    <div>
      <p className="text-sm text-gray-500 !mb-4">Monitor penggunaan AI dan biaya</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3 !mb-4">
        <div className="!p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-lg font-semibold text-gray-800">5,888</p>
          <p className="text-xs text-gray-500">Tokens Today</p>
        </div>
        <div className="!p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-lg font-semibold text-gray-800">$11.77</p>
          <p className="text-xs text-gray-500">Cost/Month</p>
        </div>
        <div className="!p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-lg font-semibold text-gray-800">142</p>
          <p className="text-xs text-gray-500">Requests</p>
        </div>
        <div className="!p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-lg font-semibold text-gray-800">41.4</p>
          <p className="text-xs text-gray-500">Avg/Request</p>
        </div>
      </div>

      <h3 className="text-sm font-medium text-gray-700 !mb-3">Usage History</h3>
      <DataTable 
        headers={["Date", "Model", "Tokens", "Cost"]} 
        data={usageData}
      />
    </div>
  );
}

function LogsContent() {
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
        <p className="text-sm text-gray-500">System activity logs</p>
        <div className="flex gap-2">
          <select className="!px-2 !py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white">
            <option>All Levels</option>
            <option>Info</option>
            <option>Success</option>
            <option>Warning</option>
            <option>Error</option>
          </select>
          <button className="!px-3 !py-1.5 text-gray-600 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            Export
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

function AccountContent() {
  return (
    <div>
      <p className="text-sm text-gray-500 !mb-4">Manage administrator account</p>

      <div className="space-y-4">
        {/* Profile Section */}
        <div className="!p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center text-white text-lg font-semibold">
              A
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Name</label>
                  <p className="text-sm text-gray-800 font-medium">Admin HAWA</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Email</label>
                  <p className="text-sm text-gray-800 font-medium">admin@hawa.com</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Role</label>
                  <p className="text-sm text-gray-800 font-medium">Super Admin</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Last Login</label>
                  <p className="text-sm text-gray-800 font-medium">6 Feb 2026, 12:45</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="!p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
            <h4 className="text-sm font-medium text-gray-800">Change Password</h4>
            <p className="text-xs text-gray-400 !mt-0.5">Update your password</p>
          </button>
          <button className="!p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
            <h4 className="text-sm font-medium text-gray-800">Two-Factor Auth</h4>
            <p className="text-xs text-gray-400 !mt-0.5">Enable 2FA security</p>
          </button>
          <button className="!p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
            <h4 className="text-sm font-medium text-gray-800">API Keys</h4>
            <p className="text-xs text-gray-400 !mt-0.5">Manage API keys</p>
          </button>
          <button className="!p-3 text-left bg-white rounded-lg border border-red-100 hover:border-red-200 hover:bg-red-50 transition-all">
            <h4 className="text-sm font-medium text-red-600">Logout All Sessions</h4>
            <p className="text-xs text-red-400 !mt-0.5">Sign out everywhere</p>
          </button>
        </div>
      </div>
    </div>
  );
}
