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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// UserTable Component
const UserTable = ({ users, onEdit, onDelete, onToggleSuspend }) => {
  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case "student":
        return <GraduationCap className="w-3 h-3 text-blue-600" />;
      case "sponsor":
        return <Users className="w-3 h-3 text-green-600" />;
      case "school":
        return <Building className="w-3 h-3 text-purple-600" />;
      case "admin":
        return <Shield className="w-3 h-3 text-yellow-600" />;
      default:
        return <Users className="w-3 h-3 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-1.5 py-0.5 rounded-full text-xs font-medium";
    if (status === "Active") {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (status === "Suspended") {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  const getVerifiedBadge = (isVerified) => {
    const baseClasses = "ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-medium";
    return isVerified
      ? `${baseClasses} bg-blue-100 text-blue-800`
      : `${baseClasses} bg-yellow-100 text-yellow-800`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-3 font-medium text-gray-700 text-sm">Email</th>
            <th className="text-left p-3 font-medium text-gray-700 text-sm">Role</th>
            <th className="text-left p-3 font-medium text-gray-700 text-sm">Status</th>
            <th className="text-left p-3 font-medium text-gray-700 text-sm">Date Joined</th>
            <th className="text-left p-3 font-medium text-gray-700 text-sm">Last Login</th>
            <th className="text-left p-3 font-medium text-gray-700 text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-3">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(user.role)}
                  <span className="font-medium text-gray-900 text-sm">{user.email}</span>
                </div>
              </td>
              <td className="p-3">
                <div className="flex flex-col">
                  <span className="text-gray-900 text-sm">{user.role}</span>
                  {user.role.toLowerCase() === "sponsor" && user.subRole && (
                    <span className="text-xs text-green-600 font-medium mt-0.5">{user.subRole}</span>
                  )}
                  {user.role.toLowerCase() === "admin" && user.adminLevel && (
                    <span className="text-xs text-yellow-600 font-medium mt-0.5">{user.adminLevel === "super_admin" ? "Super Admin" : "Admin"}</span>
                  )}
                </div>
              </td>
              <td className="p-3">
                <span className={getStatusBadge(user.status)}>{user.status}</span>
                <span className={getVerifiedBadge(user.isVerified)}>
                  {user.isVerified ? "Verified" : "Unverified"}
                </span>
              </td>
              <td className="p-3 text-gray-600 text-sm">{user.dateJoined}</td>
              <td className="p-3 text-gray-600 text-sm">{user.lastLogin}</td>
              <td className="p-3">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onEdit(user)}
                    className="p-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded cursor-pointer"
                    title="Edit User"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggleSuspend(user)}
                    className={`p-1 rounded cursor-pointer ${
                      user.status === "Active"
                        ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
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
                    className="p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded cursor-pointer"
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
    email: "",
    password: "",
    role: "Student",
    subRole: "",
    status: "Active",
    isVerified: false,
    adminLevel: "admin", 
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        password: "",
        role: user.role || "Student",
        subRole: user.subRole ? user.subRole.toLowerCase() : (user.role === "sponsor" ? "individual" : ""),
        status: user.status || "Active",
        isVerified: user.role && user.role.toLowerCase() === "admin" ? true : (user.isVerified || false),
        adminLevel: user.adminLevel || "admin", 
      });
    } else {
      setFormData({
        email: "",
        password: "",
        role: "Student",
        subRole: "",
        status: "Active",
        isVerified: false,
        adminLevel: "admin", 
      });
    }
  }, [user, isOpen]);

  useEffect(() => {
    // Always set isVerified to true for Admins
    if (formData.role && formData.role.toLowerCase() === "admin") {
      setFormData(prev => ({ ...prev, isVerified: true }));
    }
    if (formData.role === "sponsor" && !formData.subRole) {
      setFormData(prev => ({ ...prev, subRole: "individual" }));
    }
  }, [formData.role]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user && !formData.password) {
      alert("Password is required for new users.");
      return;
    }
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

  // Handler for clicking outside the modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-md p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-gray-900">
            {user ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Password input for new users */}
            {!user && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="student">Student</option>
                <option value="sponsor">Sponsor</option>
                <option value="school">School</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {formData.role === "sponsor" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Sponsor Type
                </label>
                <select
                  name="subRole"
                  value={formData.subRole}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="individual">Individual</option>
                  <option value="corporate">Corporate</option>
                </select>
              </div>
            )}

            {formData.role.toLowerCase() === "admin" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Admin Level
                </label>
                <select
                  name="adminLevel"
                  value={formData.adminLevel || "admin"}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {/* Only show isVerified select for non-admins */}
            {formData.role.toLowerCase() !== "admin" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Verification Status
                </label>
                <select
                  name="isVerified"
                  value={formData.isVerified ? "true" : "false"}
                  onChange={e => setFormData(prev => ({ ...prev, isVerified: e.target.value === "true" }))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1.5 text-sm cursor-pointer"
              >
                <Save className="w-3 h-3" />
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

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
          email: u.email,
          role: u.role,
          subRole: u.subRole || "",
          adminLevel: u.adminLevel || "",
          status: u.status,
          isVerified: u.isVerified,
          dateJoined: u.createdAt ? u.createdAt.split('T')[0] : "",
          lastLogin: u.updatedAt ? u.updatedAt.split('T')[0] : "",
          createdAt: u.createdAt,
        }));
        // Sort users by createdAt descending (latest to oldest)
        mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleSaveUser = async (userData) => {
    try {
      // Ensure status and role are lowercase for backend
      const payload = {
        ...userData,
        role: userData.role.toLowerCase(),
        status: userData.status ? userData.status.toLowerCase() : undefined,
        subRole: userData.role.toLowerCase() === "sponsor" ? (userData.subRole ? userData.subRole.toLowerCase() : undefined) : undefined,
        adminLevel: userData.role.toLowerCase() === "admin" ? (userData.adminLevel || "admin") : undefined,
        isVerified: userData.role.toLowerCase() === "admin" ? true : userData.isVerified,
      };
      if (!editingUser && !payload.password) {
        alert("Password is required for new users.");
        return;
      }
      if (editingUser) {
        delete payload.password;
        await axios.put(`${baseUrl}/user-management/users/${editingUser.id}`, payload);
      } else {
        await axios.post(`${baseUrl}/user-management/users`, payload);
      }
      // Refresh user list
      const res = await axios.get(`${baseUrl}/user-management/users`);
      const mapped = res.data.map(u => ({
        id: u._id,
        email: u.email,
        role: u.role,
        subRole: u.subRole || "",
        adminLevel: u.adminLevel || "",
        status: u.status,
        isVerified: u.isVerified,
        dateJoined: u.createdAt ? u.createdAt.split('T')[0] : "",
        lastLogin: u.updatedAt ? u.updatedAt.split('T')[0] : "",
        createdAt: u.createdAt,
      }));
      // Sort users by createdAt descending (latest to oldest)
      mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUsers(mapped);
      setNotification({
        show: true,
        type: editingUser ? 'update' : 'add',
        message: editingUser ? 'User successfully updated!' : 'User successfully added!'
      });
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    } catch (err) {
      setError("Failed to save user");
    }
  };

  const handleDeleteUser = async (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(`${baseUrl}/user-management/users/${userToDelete.id}`);
      // Refresh user list
      const res = await axios.get(`${baseUrl}/user-management/users`);
      const mapped = res.data.map(u => ({
        id: u._id,
        email: u.email,
        role: u.role,
        subRole: u.subRole || "",
        adminLevel: u.adminLevel || "",
        status: u.status,
        isVerified: u.isVerified,
        dateJoined: u.createdAt ? u.createdAt.split('T')[0] : "",
        lastLogin: u.updatedAt ? u.updatedAt.split('T')[0] : "",
        createdAt: u.createdAt,
      }));
      mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUsers(mapped);
      setNotification({
        show: true,
        type: 'delete',
        message: 'User successfully deleted!'
      });
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    } catch (err) {
      setError("Failed to delete user");
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleToggleSuspend = async (user) => {
    // Use backend status values (lowercase)
    const suspend = user.status === "active";
    try {
      await axios.patch(`${baseUrl}/user-management/users/${user.id}/suspend`, { suspend });
      // Refresh user list
      const res = await axios.get(`${baseUrl}/user-management/users`);
      const mapped = res.data.map(u => ({
        id: u._id,
        email: u.email,
        role: u.role,
        subRole: u.subRole || "",
        adminLevel: u.adminLevel || "",
        status: u.status,
        isVerified: u.isVerified,
        dateJoined: u.createdAt ? u.createdAt.split('T')[0] : "",
        lastLogin: u.updatedAt ? u.updatedAt.split('T')[0] : "",
        createdAt: u.createdAt,
      }));
      // Sort users by createdAt descending (latest to oldest)
      mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUsers(mapped);
    } catch (err) {
      setError("Failed to update user status");
    }
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
    <div className="p-2 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-1">User Management</h1>
          <p className="text-sm text-gray-600">Manage students, sponsors, and schools</p>
        </div>
        {loading && (
          <div className="text-center text-gray-500 py-6 text-sm">Loading users...</div>
        )}
        {error && (
          <div className="text-center text-red-500 py-6 text-sm">{error}</div>
        )}
        {!loading && !error && (
          <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
          {getRoleStats().map((stat, index) => (
            <div key={index} className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.count}</p>
                </div>
                <div className={`p-2 rounded-full bg-gray-100`}>
                  {stat.label === "Students" && <GraduationCap className="w-5 h-5 text-blue-600" />}
                  {stat.label === "Sponsors" && <Users className="w-5 h-5 text-green-600" />}
                  {stat.label === "Schools" && <Building className="w-5 h-5 text-purple-600" />}
                  {stat.label === "Admins" && <Shield className="w-5 h-5 text-yellow-600" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 mb-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex-1 flex gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>

              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="All">All Verification</option>
                <option value="Verified">Verified</option>
                <option value="Unverified">Unverified</option>
              </select>
            </div>

            <button
              onClick={handleAddUser}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1.5 text-sm cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">
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
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full animate-fade-in">
              <div className="flex flex-col items-center">
                <Trash2 className="w-10 h-10 text-red-500 mb-2 animate-bounce" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">Delete User?</h3>
                <p className="text-sm text-gray-600 mb-1 text-center">Are you sure you want to delete <span className="font-semibold text-red-600">{userToDelete?.email}</span>?</p>
                <p className="text-sm text-gray-600 mb-4 text-center">This action cannot be undone.</p>
                <div className="flex gap-3 w-full justify-center">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteUser}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors font-medium cursor-pointer shadow"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Notification */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 1, x: 500 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 500 }}
              transition={{
                type: "spring",
                stiffness: 900,
                damping: 25,
                duration: 0.2,
              }}
              className={`fixed w-[325px] flex justify-end items-center h-[55px] bottom-5 right-5 rounded-[10px] text-[#002828] ${
                notification.type === 'delete' ? 'bg-red-500' : 'bg-[#26D871]'
              } rounded-md shadow-xl z-100`}
            >
              <div className="flex gap-3 items-center w-[320px] h-[55px] bg-gray-50 rounded-[5px] border-white px-3 py-2">
                <div>
                  {notification.type === 'delete' ? (
                    <Trash2 width={23} height={23} className="text-red-500" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="23"
                      height="23"
                      fill="#26D871"
                      className="bi bi-check-square-fill"
                      viewBox="0 0 16 16"
                    >
                      <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-[14px]">Success</p>
                  <p className="text-[12px]">{notification.message}</p>
                </div>
                <button onClick={() => setNotification({ show: false, type: '', message: '' })} className="ml-auto text-gray-400 hover:text-gray-600">&times;</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}