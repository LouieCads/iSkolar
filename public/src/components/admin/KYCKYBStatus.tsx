import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Users,
  Building,
  GraduationCap,
  Eye,
  Filter,
  RefreshCw,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const mockVerifications = [
  {
    _id: "1",
    userId: { email: "maria.santos@email.com" },
    personaType: "student",
    status: "pending",
    submittedAt: "2024-01-15T10:30:00Z",
    verifiedAt: null,
    denialReason: null,
    documents: [
      { filename: "student_id.jpg", url: "#" },
      { filename: "enrollment_form.pdf", url: "#" }
    ],
    student: {
      firstName: "Maria",
      lastName: "Santos",
      studentId: "2021-001234",
      course: "BS Computer Science",
      yearLevel: "3rd Year",
      gpa: "3.85",
      school: "University of the Philippines"
    }
  },
  {
    _id: "2",
    userId: { email: "juan.delacruz@email.com" },
    personaType: "student",
    status: "verified",
    submittedAt: "2024-01-10T14:20:00Z",
    verifiedAt: "2024-01-12T09:15:00Z",
    denialReason: null,
    documents: [
      { filename: "student_id.jpg", url: "#" },
      { filename: "grades.pdf", url: "#" }
    ],
    student: {
      firstName: "Juan",
      lastName: "Dela Cruz",
      studentId: "2021-005678",
      course: "BS Engineering",
      yearLevel: "4th Year",
      gpa: "3.92",
      school: "Ateneo de Manila University"
    }
  },
  {
    _id: "3",
    userId: { email: "techcorp@business.com" },
    personaType: "sponsor",
    status: "pending",
    submittedAt: "2024-01-14T16:45:00Z",
    verifiedAt: null,
    denialReason: null,
    documents: [
      { filename: "business_license.pdf", url: "#" },
      { filename: "tax_certificate.pdf", url: "#" }
    ],
    sponsor: {
      companyName: "TechCorp Solutions",
      businessType: "Technology",
      registrationNumber: "SEC-123456",
      industry: "Software Development",
      annualRevenue: "₱50M - ₱100M",
      contactPerson: "Ana Reyes"
    }
  },
  {
    _id: "4",
    userId: { email: "john.smith@email.com" },
    personaType: "sponsor",
    status: "verified",
    submittedAt: "2024-01-08T11:30:00Z",
    verifiedAt: "2024-01-09T15:20:00Z",
    denialReason: null,
    documents: [
      { filename: "passport.jpg", url: "#" },
      { filename: "income_tax.pdf", url: "#" }
    ],
    sponsor: {
      firstName: "John",
      lastName: "Smith",
      occupation: "Software Engineer",
      company: "Google Philippines",
      annualIncome: "₱2M - ₱5M",
      sourceOfIncome: "Employment"
    }
  },
  {
    _id: "5",
    userId: { email: "updiliman@edu.ph" },
    personaType: "school",
    status: "verified",
    submittedAt: "2024-01-05T08:15:00Z",
    verifiedAt: "2024-01-06T10:30:00Z",
    denialReason: null,
    documents: [
      { filename: "school_license.pdf", url: "#" },
      { filename: "accreditation.pdf", url: "#" }
    ],
    school: {
      schoolName: "University of the Philippines Diliman",
      schoolType: "State University",
      registrationNumber: "CHED-001",
      address: "Quezon City, Metro Manila",
      contactPerson: "Dr. Maria Garcia",
      studentPopulation: "25000"
    }
  },
  {
    _id: "6",
    userId: { email: "lisa.garcia@email.com" },
    personaType: "student",
    status: "denied",
    submittedAt: "2024-01-12T13:45:00Z",
    verifiedAt: null,
    denialReason: "Incomplete documentation. Please provide valid student ID and current enrollment certificate.",
    documents: [
      { filename: "old_student_id.jpg", url: "#" }
    ],
    student: {
      firstName: "Lisa",
      lastName: "Garcia",
      studentId: "2020-003456",
      course: "BS Business Administration",
      yearLevel: "2nd Year",
      gpa: "3.45",
      school: "De La Salle University"
    }
  },
  {
    _id: "7",
    userId: { email: "startup_inc@business.com" },
    personaType: "sponsor",
    status: "pending",
    submittedAt: "2024-01-16T09:20:00Z",
    verifiedAt: null,
    denialReason: null,
    documents: [
      { filename: "business_registration.pdf", url: "#" },
      { filename: "financial_statement.pdf", url: "#" }
    ],
    sponsor: {
      companyName: "Startup Inc.",
      businessType: "Startup",
      registrationNumber: "SEC-789012",
      industry: "E-commerce",
      annualRevenue: "₱10M - ₱25M",
      contactPerson: "Carlos Mendoza"
    }
  },
  {
    _id: "8",
    userId: { email: "admu@edu.ph" },
    personaType: "school",
    status: "verified",
    submittedAt: "2024-01-03T10:00:00Z",
    verifiedAt: "2024-01-04T14:15:00Z",
    denialReason: null,
    documents: [
      { filename: "school_license.pdf", url: "#" },
      { filename: "accreditation.pdf", url: "#" }
    ],
    school: {
      schoolName: "Ateneo de Manila University",
      schoolType: "Private University",
      registrationNumber: "CHED-002",
      address: "Quezon City, Metro Manila",
      contactPerson: "Fr. Jose Cruz",
      studentPopulation: "15000"
    }
  }
];

const mockStats = {
  overall: {
    total: 8,
    pending: 3,
    verified: 4,
    denied: 1,
    suspended: 0
  },
  byPersonaType: [
    {
      _id: "student",
      count: 3,
      verified: 1,
      pending: 1,
      denied: 1
    },
    {
      _id: "sponsor",
      count: 3,
      verified: 1,
      pending: 2,
      denied: 0
    },
    {
      _id: "school",
      count: 2,
      verified: 2,
      pending: 0,
      denied: 0
    }
  ]
};

// VerificationTable Component
const VerificationTable = ({ verifications, onView, onApprove, onDeny, onToggleSuspend }) => {
  const getPersonaIcon = (personaType) => {
    switch (personaType?.toLowerCase()) {
      case "student":
        return <GraduationCap className="w-3 h-3 text-blue-600" />;
      case "sponsor":
        return <Users className="w-3 h-3 text-green-600" />;
      case "school":
        return <Building className="w-3 h-3 text-purple-600" />;
      default:
        return <Users className="w-3 h-3 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "verified":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "pre-approved":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "denied":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "unverified":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-3 font-medium text-gray-700 text-sm">User</th>
            <th className="text-left p-3 font-medium text-gray-700 text-sm">Persona</th>
            <th className="text-left p-3 font-medium text-gray-700 text-sm">Status</th>
            <th className="text-left p-3 font-medium text-gray-700 text-sm">Submitted</th>
            <th className="text-left p-3 font-medium text-gray-700 text-sm">Verified</th>
            <th className="text-left p-3 font-medium text-gray-700 text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {verifications.map((verification) => (
            <tr key={verification._id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-3">
                <div className="flex items-center space-x-2">
                  {getPersonaIcon(verification.personaType)}
                  <span className="font-medium text-gray-900 text-sm">
                    {verification.userId?.email || "N/A"}
                  </span>
                </div>
              </td>
              <td className="p-3">
                <span className="text-gray-900 text-sm capitalize">
                  {verification.personaType}
                </span>
              </td>
              <td className="p-3">
                <span className={getStatusBadge(verification.status)}>
                  {verification.status.replace('-', ' ')}
                </span>
              </td>
              <td className="p-3 text-gray-600 text-sm">
                {formatDate(verification.submittedAt)}
              </td>
              <td className="p-3 text-gray-600 text-sm">
                {verification.verifiedAt ? formatDate(verification.verifiedAt) : "N/A"}
              </td>
              <td className="p-3">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onView(verification)}
                    className="p-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {verification.status === "pending" && (
                    <>
                      <button
                        onClick={() => onApprove(verification)}
                        className="p-1 bg-green-50 text-green-600 hover:bg-green-100 rounded cursor-pointer"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeny(verification)}
                        className="p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded cursor-pointer"
                        title="Deny"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onToggleSuspend(verification)}
                    className={`p-1 rounded cursor-pointer ${
                      verification.status === "verified"
                        ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                    title={verification.status === "verified" ? "Suspend" : "Activate"}
                  >
                    {verification.status === "verified" ? (
                      <ShieldOff className="w-4 h-4" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
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

// VerificationDetailModal Component
const VerificationDetailModal = ({ isOpen, onClose, verification }) => {
  if (!isOpen || !verification) return null;

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
      <div className="bg-white rounded-md p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Verification Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <p className="text-sm text-gray-900">{verification.userId?.email || "N/A"}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Persona Type</label>
              <p className="text-sm text-gray-900 capitalize">{verification.personaType}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <p className="text-sm text-gray-900 capitalize">{verification.status}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Submitted At</label>
              <p className="text-sm text-gray-900">
                {verification.submittedAt ? new Date(verification.submittedAt).toLocaleString() : "N/A"}
              </p>
            </div>
          </div>

          {verification.denialReason && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Denial Reason</label>
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{verification.denialReason}</p>
            </div>
          )}

          {verification.documents && verification.documents.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Documents</label>
              <div className="space-y-2">
                {verification.documents.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{doc.filename}</span>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display persona-specific data */}
          {verification.student && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Student Information</label>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <pre className="whitespace-pre-wrap">{JSON.stringify(verification.student, null, 2)}</pre>
              </div>
            </div>
          )}

          {verification.sponsor && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Sponsor Information</label>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <pre className="whitespace-pre-wrap">{JSON.stringify(verification.sponsor, null, 2)}</pre>
              </div>
            </div>
          )}

          {verification.school && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">School Information</label>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <pre className="whitespace-pre-wrap">{JSON.stringify(verification.school, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// DenialModal Component
const DenialModal = ({ isOpen, onClose, verification, onConfirm }) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please provide a denial reason");
      return;
    }
    onConfirm(reason);
    setReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Deny Verification</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Denial Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Please provide a reason for denial..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Deny Verification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main KYCKYBStatus Component
export function KYCKYBStatus() {
  const [verifications, setVerifications] = useState(mockVerifications);
  const [stats, setStats] = useState(mockStats);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [personaFilter, setPersonaFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDenialModalOpen, setIsDenialModalOpen] = useState(false);
  const [verificationToDeny, setVerificationToDeny] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Mock data operations
  const updateVerificationStatus = (verificationId, newStatus, denialReason = null) => {
    setVerifications(prev => 
      prev.map(verification => 
        verification._id === verificationId 
          ? { 
              ...verification, 
              status: newStatus,
              verifiedAt: newStatus === "verified" ? new Date().toISOString() : verification.verifiedAt,
              denialReason: denialReason || verification.denialReason
            }
          : verification
      )
    );
  };

  const updateStats = () => {
    const newStats = {
      overall: {
        total: verifications.length,
        pending: verifications.filter(v => v.status === "pending").length,
        verified: verifications.filter(v => v.status === "verified").length,
        denied: verifications.filter(v => v.status === "denied").length,
        suspended: verifications.filter(v => v.status === "suspended").length
      },
      byPersonaType: [
        {
          _id: "student",
          count: verifications.filter(v => v.personaType === "student").length,
          verified: verifications.filter(v => v.personaType === "student" && v.status === "verified").length,
          pending: verifications.filter(v => v.personaType === "student" && v.status === "pending").length,
          denied: verifications.filter(v => v.personaType === "student" && v.status === "denied").length
        },
        {
          _id: "sponsor",
          count: verifications.filter(v => v.personaType === "sponsor").length,
          verified: verifications.filter(v => v.personaType === "sponsor" && v.status === "verified").length,
          pending: verifications.filter(v => v.personaType === "sponsor" && v.status === "pending").length,
          denied: verifications.filter(v => v.personaType === "sponsor" && v.status === "denied").length
        },
        {
          _id: "school",
          count: verifications.filter(v => v.personaType === "school").length,
          verified: verifications.filter(v => v.personaType === "school" && v.status === "verified").length,
          pending: verifications.filter(v => v.personaType === "school" && v.status === "pending").length,
          denied: verifications.filter(v => v.personaType === "school" && v.status === "denied").length
        }
      ]
    };
    setStats(newStats);
  };

  useEffect(() => {
    updateStats();
  }, [verifications]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, personaFilter, searchTerm]);

  const fetchData = () => {
    // Mock refresh - just update stats
    updateStats();
  };

  const handleView = (verification) => {
    setSelectedVerification(verification);
    setIsDetailModalOpen(true);
  };

  const handleApprove = (verification) => {
    updateVerificationStatus(verification._id, "verified");
    
    setNotification({
      show: true,
      type: 'success',
      message: 'Verification approved successfully!'
    });
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const handleDeny = (verification) => {
    setVerificationToDeny(verification);
    setIsDenialModalOpen(true);
  };

  const handleConfirmDenial = (reason) => {
    updateVerificationStatus(verificationToDeny._id, "denied", reason);
    
    setNotification({
      show: true,
      type: 'success',
      message: 'Verification denied successfully!'
    });
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const handleToggleSuspend = (verification) => {
    const newStatus = verification.status === "verified" ? "suspended" : "verified";
    updateVerificationStatus(verification._id, newStatus);
    
    setNotification({
      show: true,
      type: 'success',
      message: `Verification ${newStatus} successfully!`
    });
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const filteredVerifications = useMemo(() => {
    let filtered = verifications.filter(verification => {
      const matchesSearch = verification.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || verification.status === statusFilter;
      const matchesPersona = personaFilter === "All" || verification.personaType === personaFilter;
      
      return matchesSearch && matchesStatus && matchesPersona;
    });

    // Calculate pagination
    const itemsPerPage = 10;
    const totalItems = filtered.length;
    const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Update total pages state
    if (calculatedTotalPages !== totalPages) {
      setTotalPages(calculatedTotalPages);
    }
    
    // Reset to first page if current page is out of bounds
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(1);
    }
    
    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return filtered.slice(startIndex, endIndex);
  }, [verifications, searchTerm, statusFilter, personaFilter, currentPage, totalPages]);

  const getStatusStats = () => {
    const { overall } = stats;
    return [
      { label: "Total", count: (overall as any)?.total || 0, color: "text-gray-600", icon: Users },
      { label: "Pending", count: (overall as any)?.pending || 0, color: "text-yellow-600", icon: Clock },
      { label: "Verified", count: (overall as any)?.verified || 0, color: "text-green-600", icon: CheckCircle },
      { label: "Denied", count: (overall as any)?.denied || 0, color: "text-red-600", icon: XCircle },
    ];
  };

  const getPersonaStats = () => {
    return stats.byPersonaType?.map(persona => ({
      label: persona._id,
      count: persona.count,
      verified: persona.verified,
      pending: persona.pending,
      color: persona._id === "student" ? "text-blue-600" : 
             persona._id === "sponsor" ? "text-green-600" : "text-purple-600"
    })) || [];
  };

  const getTotalFilteredCount = () => {
    return verifications.filter(v => {
      const matchesSearch = v.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || v.status === statusFilter;
      const matchesPersona = personaFilter === "All" || v.personaType === personaFilter;
      return matchesSearch && matchesStatus && matchesPersona;
    }).length;
  };

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-1">KYC/KYB Verification Status</h1>
          <p className="text-sm text-gray-600">Manage verification requests for students, sponsors, and schools</p>
        </div>

        {loading && (
          <div className="text-center text-gray-500 py-6 text-sm">Loading verification data...</div>
        )}

        {error && (
          <div className="text-center text-red-500 py-6 text-sm">{error}</div>
        )}

        {!loading && !error && (
          <>
            {/* Overall Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
              {getStatusStats().map((stat, index) => (
                <div key={index} className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                      <p className={`text-xl font-bold ${stat.color}`}>{stat.count}</p>
                    </div>
                    <div className="p-2 rounded-full bg-gray-100">
                      <stat.icon className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Persona Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
              {getPersonaStats().map((persona, index) => (
                <div key={index} className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-600 capitalize">{persona.label}</p>
                    <div className={`p-1 rounded-full ${persona.color.replace('text-', 'bg-')} bg-opacity-10`}>
                      {persona.label === "student" && <GraduationCap className="w-4 h-4 text-blue-600" />}
                      {persona.label === "sponsor" && <Users className="w-4 h-4 text-green-600" />}
                      {persona.label === "school" && <Building className="w-4 h-4 text-purple-600" />}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total: {persona.count}</span>
                    <span className="text-green-600">Verified: {persona.verified}</span>
                    <span className="text-yellow-600">Pending: {persona.pending}</span>
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
                      placeholder="Search by email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="All">All Status</option>
                    <option value="unverified">Unverified</option>
                    <option value="pending">Pending</option>
                    <option value="pre-approved">Pre-approved</option>
                    <option value="verified">Verified</option>
                    <option value="denied">Denied</option>
                  </select>

                  <select
                    value={personaFilter}
                    onChange={(e) => setPersonaFilter(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="All">All Personas</option>
                    <option value="student">Students</option>
                    <option value="sponsor">Sponsors</option>
                    <option value="school">Schools</option>
                  </select>
                </div>

                <button
                  onClick={fetchData}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1.5 text-sm cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Verifications Table */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200">
              <div className="p-3 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">
                  Verifications ({getTotalFilteredCount()})
                </h2>
              </div>
              
              <VerificationTable
                verifications={filteredVerifications}
                onView={handleView}
                onApprove={handleApprove}
                onDeny={handleDeny}
                onToggleSuspend={handleToggleSuspend}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Detail Modal */}
            <VerificationDetailModal
              isOpen={isDetailModalOpen}
              onClose={() => setIsDetailModalOpen(false)}
              verification={selectedVerification}
            />

            {/* Denial Modal */}
            <DenialModal
              isOpen={isDenialModalOpen}
              onClose={() => setIsDenialModalOpen(false)}
              verification={verificationToDeny}
              onConfirm={handleConfirmDenial}
            />

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
                  className="fixed w-[325px] flex justify-end items-center h-[55px] bottom-5 right-5 rounded-[10px] text-[#002828] bg-[#26D871] rounded-md shadow-xl z-100"
                >
                  <div className="flex gap-3 items-center w-[320px] h-[55px] bg-gray-50 rounded-[5px] border-white px-3 py-2">
                    <div>
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
