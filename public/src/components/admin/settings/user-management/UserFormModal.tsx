"use client";

import { useState, useEffect } from "react";
import { X, Save, Users, Building, GraduationCap, Shield } from "lucide-react";

interface User {
  id?: string;
  email: string;
  role: string;
  subRole?: string;
  adminLevel?: string;
  status: string;
  isVerified: boolean;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (userData: {
    email: string;
    password?: string;
    role: string;
    subRole?: string;
    status: string;
    isVerified: boolean;
    adminLevel?: string;
  }) => void;
}

export default function UserFormModal({ isOpen, onClose, user, onSave }: UserFormModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Student",
    subRole: "",
    status: "Active",
    isVerified: false,
    adminLevel: "admin",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        password: "",
        role: user.role || "Student",
        subRole: user.subRole ? user.subRole.toLowerCase() : user.role === "sponsor" ? "individual" : "",
        status: user.status || "Active",
        isVerified: user.role.toLowerCase() === "admin" ? true : user.isVerified || false,
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
    if (formData.role.toLowerCase() === "admin") {
      setFormData((prev) => ({ ...prev, isVerified: true }));
    }
    if (formData.role === "sponsor" && !formData.subRole) {
      setFormData((prev) => ({ ...prev, subRole: "individual" }));
    }
  }, [formData.role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !formData.password) {
      alert("Password is required for new users.");
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "role" && value !== "Sponsor" ? { subRole: "" } : {}),
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {user ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="student">Student</option>
              <option value="sponsor">Sponsor</option>
              <option value="school">School</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {formData.role === "sponsor" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor Type</label>
              <select
                name="subRole"
                value={formData.subRole}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="individual">Individual</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
          )}
          {formData.role.toLowerCase() === "admin" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Level</label>
              <select
                name="adminLevel"
                value={formData.adminLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          {formData.role.toLowerCase() !== "admin" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
              <select
                name="isVerified"
                value={formData.isVerified ? "true" : "false"}
                onChange={(e) => setFormData((prev) => ({ ...prev, isVerified: e.target.value === "true" }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
            >
              <Save className="w-4 h-4" />
              <span>{user ? "Update" : "Create"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}