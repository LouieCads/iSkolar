import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldOff,
  Users,
  Building,
  GraduationCap,
  X,
  Save,
  Filter
} from "lucide-react";

// Mock data for demonstration
// const mockUsers = [
//   {
//     id: 1,
//     name: "John Doe",
//     email: "john.doe@email.com",
//     role: "Student",
//     status: "Active",
//     isVerified: true,
//     dateJoined: "2024-01-15",
//     lastLogin: "2024-03-10"
//   },
//   {
//     id: 2,
//     name: "Jane Smith",
//     email: "jane.smith@sponsor.com",
//     role: "Sponsor",
//     subRole: "Individual",
//     status: "Active",
//     isVerified: false,
//     dateJoined: "2024-02-20",
//     lastLogin: "2024-03-12"
//   },
//   {
//     id: 3,
//     name: "Tech Corp",
//     email: "contact@techcorp.com",
//     role: "Sponsor",
//     subRole: "Corporate",
//     status: "Active",
//     isVerified: true,
//     dateJoined: "2024-01-10",
//     lastLogin: "2024-03-11"
//   },
//   {
//     id: 4,
//     name: "University of Excellence",
//     email: "admin@university.edu",
//     role: "School",
//     status: "Suspended",
//     isVerified: false,
//     dateJoined: "2024-01-05",
//     lastLogin: "2024-03-08"
//   },
//   {
//     id: 5,
//     name: "Alice Johnson",
//     email: "alice.johnson@email.com",
//     role: "Student",
//     status: "Active",
//     isVerified: true,
//     dateJoined: "2024-02-28",
//     lastLogin: "2024-03-12"
//   }
// ];

// UserTable Component
const UserTable = ({ users, onEdit, onDelete, onToggleSuspend }) => {
  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case "student":
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case "sponsor":
        return <Users className="w-4 h-4 text-green-600" />;
      case "school":
        return <Building className="w-4 h-4 text-purple-600" />;
      case "admin":
        return <Shield className="w-4 h-4 text-yellow-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    if (status === "Active") {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (status === "Suspended") {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  const getVerifiedBadge = (isVerified) => {
    const baseClasses = "ml-2 px-2 py-1 rounded-full text-xs font-medium";
    return isVerified
      ? `${baseClasses} bg-blue-100 text-blue-800`
      : `${baseClasses} bg-yellow-100 text-yellow-800`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-4 font-medium text-gray-700">Name</th>
            <th className="text-left p-4 font-medium text-gray-700">Email</th>
            <th className="text-left p-4 font-medium text-gray-700">Role</th>
            <th className="text-left p-4 font-medium text-gray-700">Status</th>
            <th className="text-left p-4 font-medium text-gray-700">Date Joined</th>
            <th className="text-left p-4 font-medium text-gray-700">Last Login</th>
            <th className="text-left p-4 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  {getRoleIcon(user.role)}
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>
              </td>
              <td className="p-4 text-gray-600">{user.email}</td>
              <td className="p-4">
                <div className="flex flex-col">
                  <span className="text-gray-900">{user.role}</span>
                  {user.subRole && (
                    <span className="text-xs text-gray-500">{user.subRole}</span>
                  )}
                </div>
              </td>
              <td className="p-4">
                <span className={getStatusBadge(user.status)}>{user.status}</span>
                <span className={getVerifiedBadge(user.isVerified)}>
                  {user.isVerified ? "Verified" : "Unverified"}
                </span>
              </td>
              <td className="p-4 text-gray-600">{user.dateJoined}</td>
              <td className="p-4 text-gray-600">{user.lastLogin}</td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit User"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggleSuspend(user)}
                    className={`p-1 rounded ${
                      user.status === "Active"
                        ? "text-orange-600 hover:bg-orange-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    title={user.status === "Active" ? "Suspend User" : "Activate User"}
                  >
                    {user.status === "Active" ? (
                      <ShieldOff className="w-4 h-4" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// UserFormModal Component
const UserFormModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Student",
    subRole: "",
    status: "Active",
    isVerified: false
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "Student",
        subRole: user.subRole || "",
        status: user.status || "Active",
        isVerified: user.isVerified || false
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "Student",
        subRole: "",
        status: "Active",
        isVerified: false
      });
    }
  }, [user, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Clear subRole when role changes
      ...(name === "role" && value !== "Sponsor" ? { subRole: "" } : {})
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {user ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="student">Student</option>
              <option value="sponsor">Sponsor</option>
              <option value="school">School</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.role === "sponsor" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sponsor Type
              </label>
              <select
                name="subRole"
                value={formData.subRole}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Type</option>
                <option value="Individual">Individual</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Status
            </label>
            <select
              name="isVerified"
              value={formData.isVerified ? "true" : "false"}
              onChange={e => setFormData(prev => ({ ...prev, isVerified: e.target.value === "true" }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{user ? "Update" : "Create"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main UserManagement Component
export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [verifiedFilter, setVerifiedFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${baseUrl}/user-management/users`);
        // Map backend fields to frontend display fields
        const mapped = res.data.map(u => ({
          id: u._id,
          name: u.email, // No name field in backend, fallback to email
          email: u.email,
          role: u.role,
          status: u.isSuspended ? "Suspended" : "Active",
          isVerified: u.isVerified,
          dateJoined: u.createdAt ? u.createdAt.split('T')[0] : "",
          lastLogin: u.updatedAt ? u.updatedAt.split('T')[0] : ""
        }));
        setUsers(mapped);
      } catch (err) {
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesStatus = statusFilter === "All" || user.status === statusFilter;
      const matchesVerified = verifiedFilter === "All" || (verifiedFilter === "Verified" ? user.isVerified : !user.isVerified);
      return matchesSearch && matchesRole && matchesStatus && matchesVerified;
    });
  }, [users, searchTerm, roleFilter, statusFilter, verifiedFilter]);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = (userData) => {
    if (editingUser) {
      // Update existing user
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? { ...user, ...userData } : user
      ));
    } else {
      // Add new user
      const newUser = {
        ...userData,
        id: Math.max(...users.map(u => u.id)) + 1,
        dateJoined: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [...prev, newUser]);
    }
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const handleToggleSuspend = (user) => {
    const newStatus = user.status === "Active" ? "Suspended" : "Active";
    setUsers(prev => prev.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
  };

  const getRoleStats = () => {
    type RoleStats = { [key: string]: number };
    const stats: RoleStats = users.reduce((acc: RoleStats, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    return [
      { label: "Students", count: stats.student || 0, color: "text-blue-600" },
      { label: "Sponsors", count: stats.sponsor || 0, color: "text-green-600" },
      { label: "Schools", count: stats.school || 0, color: "text-purple-600" },
      { label: "Admins", count: stats.admin || 0, color: "text-yellow-600" },
    ];
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage students, sponsors, and schools</p>
        </div>
        {loading && (
          <div className="text-center text-gray-500 py-8">Loading users...</div>
        )}
        {error && (
          <div className="text-center text-red-500 py-8">{error}</div>
        )}
        {!loading && !error && (
          <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          {getRoleStats().map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100`}>
                  {stat.label === "Students" && <GraduationCap className="w-6 h-6 text-blue-600" />}
                  {stat.label === "Sponsors" && <Users className="w-6 h-6 text-green-600" />}
                  {stat.label === "Schools" && <Building className="w-6 h-6 text-purple-600" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Roles</option>
                <option value="student">Students</option>
                <option value="sponsor">Sponsors</option>
                <option value="school">Schools</option>
                <option value="admin">Admins</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>

              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Verification</option>
                <option value="Verified">Verified</option>
                <option value="Unverified">Unverified</option>
              </select>
            </div>

            <button
              onClick={handleAddUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Users ({filteredUsers.length})
            </h2>
          </div>
          
          <UserTable
            users={filteredUsers}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onToggleSuspend={handleToggleSuspend}
          />
        </div>

        {/* Form Modal */}
        <UserFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={editingUser}
          onSave={handleSaveUser}
        />
          </>
        )}
      </div>
    </div>
  );
}