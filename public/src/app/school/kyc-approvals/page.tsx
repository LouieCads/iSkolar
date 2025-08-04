"use client";

import React, { useState, useEffect } from "react";
import { Eye, Check, X, Calendar, User, GraduationCap, MapPin, FileText, Phone, Mail } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Base API URL from environment variable or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Axios instance with auth header
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const StatusBadge = ({ status, resubmissionCount }) => {
  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pre_approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "denied":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
      </span>
      {resubmissionCount > 0 && (
        <span className="text-xs text-orange-600 font-medium">
          Resubmission #{resubmissionCount}
        </span>
      )}
    </div>
  );
};

const KycModal = ({ student, isOpen, onClose, onApprove, onReject }) => {
  const [rejectReason, setRejectReason] = useState("");
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !student) return null;

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await onApprove(student._id, reviewerNotes);
    } catch (error) {
      throw error; // Handled in parent component
    } finally {
      setIsLoading(false);
      setReviewerNotes("");
    }
  };

  const handleReject = async () => {
    if (rejectReason.trim()) {
      setIsLoading(true);
      try {
        await onReject(student._id, rejectReason, reviewerNotes);
        onClose();
        setRejectReason("");
        setReviewerNotes("");
        setShowRejectForm(false);
      } catch (error) {
        throw error; // Handled in parent component
      } finally {
        setIsLoading(false);
      }
    } else {
      // Trigger error notification
      throw new Error("Please provide a reason for rejection");
    }
  };

  const formatFullName = (fullName) => {
    return `${fullName.firstName} ${fullName.middleName || ""} ${fullName.lastName}`.trim();
  };

  const handleViewDocument = (fileUrl) => {
    window.open(`${API_URL}${fileUrl}`, "_blank");
  };

  // Handler for clicking outside the modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Student KYC Review</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Student Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Student Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-gray-900">{formatFullName(student.student.fullName)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Student ID</label>
                <p className="text-gray-900">{student.student.studentIdNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900 flex items-center gap-1">
                  <Mail size={16} />
                  {student.student.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Mobile</label>
                <p className="text-gray-900 flex items-center gap-1">
                  <Phone size={16} />
                  {student.student.mobileNumber}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Age / Gender</label>
                <p className="text-gray-900">
                  {student.student.age} years old, {student.student.gender}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Nationality</label>
                <p className="text-gray-900">{student.student.nationality}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                <p className="text-gray-900">{new Date(student.student.dateOfBirth).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Place of Birth</label>
                <p className="text-gray-900">{student.student.placeOfBirth}</p>
              </div>
            </div>
          </section>

          {/* Address */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-green-600" />
              Address
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900">
                {student.student.address.street}, {student.student.address.barangay},{" "}
                {student.student.address.city}, {student.student.address.province}{" "}
                {student.student.address.zipCode}, {student.student.address.country}
              </p>
            </div>
          </section>

          {/* Academic Details */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap size={20} className="text-purple-600" />
              Academic Details
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Course</label>
                <p className="text-gray-900">{student.student.course}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Year Level</label>
                <p className="text-gray-900">{student.student.yearLevel}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">School</label>
                <p className="text-gray-900">{student.student.schoolName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Expected Graduation</label>
                <p className="text-gray-900">
                  {student.student.educationalBackground.college.expectedGraduation}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-3">Educational Background</h4>
              <div className="space-y-2">
                {Object.entries(student.student.educationalBackground).map(([level, info]) => (
                  <div
                    key={level}
                    className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                  >
                    <span className="capitalize font-medium text-gray-700">
                      {level.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-gray-600">
                      {} -
                      {level === "college" ? `Expected: ${info}` : "2027"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Documents */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-orange-600" />
              Documents ({student.documents.length})
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {student.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.fileName}</p>
                        <p className="text-sm text-gray-600 capitalize">{doc.type.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDocument(doc.fileUrl)}
                      className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Reviewer Notes */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-gray-600" />
              Reviewer Notes
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Add optional notes for this review..."
              />
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          {showRejectForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isLoading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Processing..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectForm(true)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                disabled={isLoading}
              >
                <X size={18} />
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                disabled={isLoading}
              >
                <Check size={18} />
                {isLoading ? "Processing..." : "Pre-Approve"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function KYCApprovalsPage() {
  const [kycData, setKycData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  // Fetch KYC queue on mount and when activeFilter changes
  useEffect(() => {
    const fetchKycQueue = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await axiosInstance.get("/kyc-kyb-verification/school/queue");
        const queue = response.data.queue || [];
        setKycData(
          queue.map((item) => ({
            _id: item.verificationId._id,
            userId: item.studentId._id,
            personaType: "Student",
            status: item.status,
            resubmissionCount: item.verificationId.resubmissionCount || 0,
            declarationsAndConsent: item.verificationId.declarationsAndConsent,
            submittedAt: item.submittedAt,
            student: item.verificationId.student,
            documents: item.verificationId.documents,
            reviewerNotes: item.reviewerNotes,
            reviewedAt: item.reviewedAt,
          }))
        );
        setNotification({
          show: true,
          type: "fetch",
          message: "KYC queue loaded successfully!",
        });
        setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
      } catch (error) {
        setError(error.response?.data?.message || "Error fetching KYC queue");
        setNotification({
          show: true,
          type: "error",
          message: error.response?.data?.message || "Error fetching KYC queue",
        });
        setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKycQueue();
  }, [activeFilter]);

  const handleRowClick = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleApprove = async (verificationId, reviewerNotes) => {
    try {
      await axiosInstance.post(`/kyc-kyb-verification/pre-approve/${verificationId}`, {
        reviewerNotes,
      });
      setKycData((prev) =>
        prev.map((student) =>
          student._id === verificationId
            ? { ...student, status: "pre_approved", reviewedAt: new Date(), reviewerNotes }
            : student
        )
      );
      setNotification({
        show: true,
        type: "approve",
        message: "Student KYC pre-approved successfully!",
      });
      setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: error.response?.data?.message || "Error pre-approving student",
      });
      setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
      throw error;
    }
  };

  const handleReject = async (verificationId, denialReason, reviewerNotes) => {
    try {
      await axiosInstance.post(`/kyc-kyb-verification/school-deny/${verificationId}`, {
        denialReason,
        reviewerNotes,
      });
      setKycData((prev) =>
        prev.map((student) =>
          student._id === verificationId
            ? {
                ...student,
                status: "denied",
                denialReason,
                reviewerNotes,
                reviewedAt: new Date(),
                resubmissionCount: student.resubmissionCount + 1,
              }
            : student
        )
      );
      setNotification({
        show: true,
        type: "deny",
        message: "Student KYC denied successfully!",
      });
      setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: error.response?.data?.message || "Error denying student",
      });
      setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
      throw error;
    }
  };

  const formatFullName = (fullName) => {
    return `${fullName.firstName} ${fullName.middleName || ""} ${fullName.lastName}`.trim();
  };

  const pendingStudents = kycData.filter((student) => student.status === "pending");
  const preApprovedStudents = kycData.filter((student) => student.status === "pre_approved");
  const deniedStudents = kycData.filter((student) => student.status === "denied");

  const getFilteredStudents = () => {
    switch (activeFilter) {
      case "pending":
        return pendingStudents;
      case "pre_approved":
        return preApprovedStudents;
      case "denied":
        return deniedStudents;
      default:
        return pendingStudents;
    }
  };

  const filteredStudents = getFilteredStudents();

  const getFilterTitle = () => {
    switch (activeFilter) {
      case "pending":
        return "Pending Approvals";
      case "pre_approved":
        return "Pre-Approved Students";
      case "denied":
        return "Denied Applications";
      default:
        return "Students";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-1">KYC Pre-Approvals</h1>
          <p className="text-sm text-gray-600">Review and approve student KYC submissions</p>
        </div>

        {error && (
          <div className="text-center text-red-500 py-6 text-sm">{error}</div>
        )}

        {/* Status Overview Cards */}
        {isLoading ? (
          <div className="text-center text-gray-500 py-6 text-sm">Loading KYC submissions...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
              <div
                className={`bg-white p-3 rounded-md shadow-sm border border-gray-200 cursor-pointer transition-all hover:shadow-md ${
                  activeFilter === "pending" ? "ring-2 ring-yellow-500 ring-opacity-50 bg-yellow-50" : ""
                }`}
                onClick={() => setActiveFilter("pending")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Pending Review</p>
                    <p className="text-xl font-bold text-yellow-600">{pendingStudents.length}</p>
                  </div>
                  <div className="p-2 rounded-full bg-yellow-100">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </div>

              <div
                className={`bg-white p-3 rounded-md shadow-sm border border-gray-200 cursor-pointer transition-all hover:shadow-md ${
                  activeFilter === "pre_approved" ? "ring-2 ring-green-500 ring-opacity-50 bg-green-50" : ""
                }`}
                onClick={() => setActiveFilter("pre_approved")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Pre-Approved</p>
                    <p className="text-xl font-bold text-green-600">{preApprovedStudents.length}</p>
                  </div>
                  <div className="p-2 rounded-full bg-green-100">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Ready for final verification</p>
              </div>

              <div
                className={`bg-white p-3 rounded-md shadow-sm border border-gray-200 cursor-pointer transition-all hover:shadow-md ${
                  activeFilter === "denied" ? "ring-2 ring-red-500 ring-opacity-50 bg-red-50" : ""
                }`}
                onClick={() => setActiveFilter("denied")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Denied</p>
                    <p className="text-xl font-bold text-red-600">{deniedStudents.length}</p>
                  </div>
                  <div className="p-2 rounded-full bg-red-100">
                    <X className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Requires resubmission</p>
              </div>
            </div>

            {/* Main Content Container */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 h-[600px] flex flex-col min-w-[1000px]">
              {/* Filter Tabs */}
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveFilter("pending")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeFilter === "pending"
                        ? "border-yellow-500 text-yellow-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Pending ({pendingStudents.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter("pre_approved")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeFilter === "pre_approved"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Pre-Approved ({preApprovedStudents.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter("denied")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeFilter === "denied"
                        ? "border-red-500 text-red-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Denied ({deniedStudents.length})
                  </button>
                </nav>
              </div>

              {/* Table Header */}
              <div className="p-3 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">
                    {getFilterTitle()} ({filteredStudents.length})
                  </h2>
                  <div className="text-sm text-gray-500">Click on any row to review details</div>
                </div>
              </div>

              {/* Table Content */}
              <div className="flex-1 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto h-full">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="w-1/4 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="w-1/4 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Academic Details
                        </th>
                        <th className="w-1/6 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="w-1/6 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {activeFilter === "pending" ? "Submitted" : activeFilter === "pre_approved" ? "Approved" : "Denied"}
                        </th>
                        <th className="w-1/6 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Documents
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <tr
                            key={student._id}
                            onClick={() => handleRowClick(student)}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User size={20} className="text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {formatFullName(student.student.fullName)}
                                  </div>
                                  <div className="text-sm text-gray-500">{student.student.studentIdNumber}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">{student.student.course}</div>
                                <div className="text-sm text-gray-500">
                                  {student.student.yearLevel} • {student.student.schoolName}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={student.status} resubmissionCount={student.resubmissionCount} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Calendar size={16} />
                                {new Date(student.submittedAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <FileText size={16} />
                                {student.documents.length} files
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center justify-center h-full py-16">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                {activeFilter === "pending" && <Calendar size={24} className="text-gray-400" />}
                                {activeFilter === "pre_approved" && <Check size={24} className="text-gray-400" />}
                                {activeFilter === "denied" && <X size={24} className="text-gray-400" />}
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No {activeFilter.replace("_", " ")} applications
                              </h3>
                              <p className="text-gray-500">
                                {activeFilter === "pending" && "All KYC submissions have been processed."}
                                {activeFilter === "pre_approved" && "No students have been pre-approved yet."}
                                {activeFilter === "denied" && "No applications have been denied."}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <KycModal
              student={selectedStudent}
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedStudent(null);
              }}
              onApprove={handleApprove}
              onReject={handleReject}
            />

            {/* Notification */}
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
                    notification.type === "error" || notification.type === "deny"
                      ? "bg-red-500"
                      : "bg-[#26D871]"
                  } rounded-md shadow-xl z-100`}
                >
                  <div className="flex gap-3 items-center w-[320px] h-[55px] bg-gray-50 rounded-[5px] border-white px-3 py-2">
                    <div>
                      {notification.type === "error" || notification.type === "deny" ? (
                        <X width={23} height={23} className="text-red-500" />
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
                      <p className="font-semibold text-[14px]">
                        {notification.type === "error" ? "Error" : "Success"}
                      </p>
                      <p className="text-[12px]">{notification.message}</p>
                    </div>
                    <button
                      onClick={() => setNotification({ show: false, type: "", message: "" })}
                      className="ml-auto text-gray-400 hover:text-gray-600"
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