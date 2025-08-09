"use client";

import { Edit, Trash2, Shield, ShieldOff, Users, Building, GraduationCap } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: string;
  subRole?: string;
  adminLevel?: string;
  status: string;
  isVerified: boolean;
  dateJoined: string;
  lastLogin: string;
}

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleSuspend: (user: User) => void;
}

export default function UserTable({ users, onEdit, onDelete, onToggleSuspend }: UserTableProps) {
  const getRoleIcon = (role: string) => {
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

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-0.5 rounded-full text-xs font-medium";
    if (status === "Active") {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (status === "Suspended") {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  const getVerifiedBadge = (isVerified: boolean) => {
    const baseClasses = "ml-2 px-2 py-0.5 rounded-full text-xs font-medium";
    return isVerified
      ? `${baseClasses} bg-blue-100 text-blue-800`
      : `${baseClasses} bg-yellow-100 text-yellow-800`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-4 font-medium text-gray-700 text-sm">Email</th>
            <th className="text-left p-4 font-medium text-gray-700 text-sm">Role</th>
            <th className="text-left p-4 font-medium text-gray-700 text-sm">Status</th>
            <th className="text-left p-4 font-medium text-gray-700 text-sm">Date Joined</th>
            <th className="text-left p-4 font-medium text-gray-700 text-sm">Last Login</th>
            <th className="text-left p-4 font-medium text-gray-700 text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(user.role)}
                  <span className="font-medium text-gray-900 text-sm">{user.email}</span>
                </div>
              </td>
              <td className="p-4">
                <div className="flex flex-col">
                  <span className="text-gray-900 text-sm">{user.role}</span>
                  {user.role.toLowerCase() === "sponsor" && user.subRole && (
                    <span className="text-xs text-green-600 font-medium mt-1">{user.subRole}</span>
                  )}
                  {user.role.toLowerCase() === "admin" && user.adminLevel && (
                    <span className="text-xs text-yellow-600 font-medium mt-1">{user.adminLevel === "super_admin" ? "Super Admin" : "Admin"}</span>
                  )}
                </div>
              </td>
              <td className="p-4">
                <span className={getStatusBadge(user.status)}>{user.status}</span>
                <span className={getVerifiedBadge(user.isVerified)}>
                  {user.isVerified ? "Verified" : "Unverified"}
                </span>
              </td>
              <td className="p-4 text-gray-600 text-sm">{user.dateJoined}</td>
              <td className="p-4 text-gray-600 text-sm">{user.lastLogin}</td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg"
                    title="Edit User"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggleSuspend(user)}
                    className={`p-2 rounded-lg ${
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
                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"
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
}