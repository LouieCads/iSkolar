"use client";

import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { Plus, Search, GraduationCap, Users, Building, Shield, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserTable from "@/components/admin/settings/user-management/UserTable";
import UserFormModal from "@/components/admin/settings/user-management/UserFormModal";

export default function UserManagementPage() {
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
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_BASE_URL}/user-management/users`);
        const mapped = res.data.map((u) => ({
          id: u._id,
          email: u.email,
          role: u.role,
          subRole: u.subRole || "",
          adminLevel: u.adminLevel || "",
          status: u.status,
          isVerified: u.isVerified,
          dateJoined: u.createdAt ? u.createdAt.split("T")[0] : "",
          lastLogin: u.updatedAt ? u.updatedAt.split("T")[0] : "",
          createdAt: u.createdAt,
        }));
        mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUsers(mapped);
      } catch (err) {
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [API_BASE_URL]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
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
        await axios.put(`${API_BASE_URL}/user-management/users/${editingUser.id}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/user-management/users`, payload);
      }
      const res = await axios.get(`${API_BASE_URL}/user-management/users`);
      const mapped = res.data.map((u) => ({
        id: u._id,
        email: u.email,
        role: u.role,
        subRole: u.subRole || "",
        adminLevel: u.adminLevel || "",
        status: u.status,
        isVerified: u.isVerified,
        dateJoined: u.createdAt ? u.createdAt.split("T")[0] : "",
        lastLogin: u.updatedAt ? u.updatedAt.split("T")[0] : "",
        createdAt: u.createdAt,
      }));
      mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUsers(mapped);
      setNotification({
        show: true,
        type: editingUser ? "update" : "add",
        message: editingUser ? "User successfully updated!" : "User successfully added!",
      });
      setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
    } catch (err) {
      setError("Failed to save user");
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(`${API_BASE_URL}/user-management/users/${userToDelete.id}`);
      const res = await axios.get(`${API_BASE_URL}/user-management/users`);
      const mapped = res.data.map((u) => ({
        id: u._id,
        email: u.email,
        role: u.role,
        subRole: u.subRole || "",
        adminLevel: u.adminLevel || "",
        status: u.status,
        isVerified: u.isVerified,
        dateJoined: u.createdAt ? u.createdAt.split("T")[0] : "",
        lastLogin: u.updatedAt ? u.updatedAt.split("T")[0] : "",
        createdAt: u.createdAt,
      }));
      mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUsers(mapped);
      setNotification({
        show: true,
        type: "delete",
        message: "User successfully deleted!",
      });
      setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
    } catch (err) {
      setError("Failed to delete user");
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleToggleSuspend = async (user) => {
    const suspend = user.status === "active";
    try {
      await axios.patch(`${API_BASE_URL}/user-management/users/${user.id}/suspend`, { suspend });
      const res = await axios.get(`${API_BASE_URL}/user-management/users`);
      const mapped = res.data.map((u) => ({
        id: u._id,
        email: u.email,
        role: u.role,
        subRole: u.subRole || "",
        adminLevel: u.adminLevel || "",
        status: u.status,
        isVerified: u.isVerified,
        dateJoined: u.createdAt ? u.createdAt.split("T")[0] : "",
        lastLogin: u.updatedAt ? u.updatedAt.split("T")[0] : "",
        createdAt: u.createdAt,
      }));
      mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUsers(mapped);
      setNotification({
        show: true,
        type: "update",
        message: `User ${suspend ? "suspended" : "activated"} successfully!`,
      });
      setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
    } catch (err) {
      setError("Failed to update user status");
    }
  };

  const getRoleStats = () => {
    const stats = users.reduce((acc, user) => {
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
    <div className="min-h-screen bg-gray-100 w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-sm text-gray-600">Manage students, sponsors, schools, and admins</p>
        </div>
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex items-center justify-center h-64">
            <div className="text-gray-500">Loading users...</div>
          </div>
        )}
        {error && (
          <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded z-10 text-sm">
            {error}
          </div>
        )}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {getRoleStats().map((stat, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                    </div>
                    <div className="p-2 rounded-full bg-gray-50">
                      {stat.label === "Students" && <GraduationCap className="w-6 h-6 text-blue-600" />}
                      {stat.label === "Sponsors" && <Users className="w-6 h-6 text-green-600" />}
                      {stat.label === "Schools" && <Building className="w-6 h-6 text-purple-600" />}
                      {stat.label === "Admins" && <Shield className="w-6 h-6 text-yellow-600" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full sm:w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                    className="w-full sm:w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                  <select
                    value={verifiedFilter}
                    onChange={(e) => setVerifiedFilter(e.target.value)}
                    className="w-full sm:w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="All">All Verification</option>
                    <option value="Verified">Verified</option>
                    <option value="Unverified">Unverified</option>
                  </select>
                </div>
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Users ({filteredUsers.length})</h2>
              </div>
              <UserTable
                users={filteredUsers}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onToggleSuspend={handleToggleSuspend}
              />
            </div>

            <UserFormModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              user={editingUser}
              onSave={handleSaveUser}
            />

            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
                  <div className="flex flex-col items-center">
                    <Trash2 className="w-12 h-12 text-red-500 mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User?</h3>
                    <p className="text-sm text-gray-600 mb-2 text-center">
                      Are you sure you want to delete{" "}
                      <span className="font-semibold text-red-600">{userToDelete?.email}</span>?
                    </p>
                    <p className="text-sm text-gray-600 mb-4 text-center">This action cannot be undone.</p>
                    <div className="flex gap-4 w-full justify-center">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmDeleteUser}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                  className="fixed w-[325px] flex justify-end items-center h-[55px] bottom-5 right-5 rounded-[10px] text-[#002828] bg-[#26D871] rounded-md shadow-xl z-[1000]"
                >
                  <div className="flex gap-3 items-center w-[320px] h-[55px] bg-gray-50 rounded-[5px] border-white px-3 py-2">
                    <div>
                      {notification.type === "delete" ? (
                        <Trash2 className="w-6 h-6 text-[#26D871]" />
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
                    <button
                      onClick={() => setNotification({ show: false, type: "", message: "" })}
                      className="ml-auto text-gray-400 hover:text-gray-600"
                      aria-label="Close notification"
                    >
                      &times;
                    </button>
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