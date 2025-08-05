"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Eye, 
  Clock, 
  User, 
  Building2,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  Users,
  GraduationCap,
  Building,
  CheckCircle,
  XCircle
} from "lucide-react";
import { motion } from "framer-motion";

// Mock data for KYC/KYB verifications
const mockVerifications = [
  {
    id: "1",
    type: "KYC",
    userType: "Student",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "+63 912 345 6789",
    status: "pending",
    submittedDate: "2024-01-15",
    documents: ["Valid ID", "Proof of Enrollment", "Academic Records"],
    personalInfo: {
      fullName: "Maria Santos",
      dateOfBirth: "1999-05-15",
      nationality: "Filipino",
      address: "123 Main Street, Quezon City, Metro Manila",
      idType: "UMID",
      idNumber: "1234-5678-9012"
    },
    academicInfo: {
      school: "University of the Philippines",
      course: "Bachelor of Science in Computer Science",
      yearLevel: "3rd Year",
      gwa: "1.25"
    }
  },
  {
    id: "2",
    type: "KYB",
    userType: "Corporate Sponsor",
    name: "TechCorp Philippines",
    email: "hr@techcorp.ph",
    phone: "+63 2 8123 4567",
    status: "approved",
    submittedDate: "2024-01-10",
    documents: ["Business Registration", "SEC Certificate", "Tax Clearance"],
    businessInfo: {
      companyName: "TechCorp Philippines",
      businessType: "Corporation",
      industry: "Technology",
      registrationNumber: "SEC-2024-001234",
      taxId: "123-456-789-000",
      address: "456 Business District, Makati City",
      contactPerson: "Juan Dela Cruz",
      position: "HR Manager"
    }
  },
  {
    id: "3",
    type: "KYC",
    userType: "Individual Sponsor",
    name: "Dr. Ana Reyes",
    email: "ana.reyes@email.com",
    phone: "+63 923 456 7890",
    status: "denied",
    submittedDate: "2024-01-08",
    documents: ["Valid ID", "Proof of Income", "Bank Statements"],
    personalInfo: {
      fullName: "Dr. Ana Reyes",
      dateOfBirth: "1975-08-20",
      nationality: "Filipino",
      address: "789 Oak Street, Cebu City",
      idType: "Passport",
      idNumber: "P12345678"
    },
    professionalInfo: {
      occupation: "Medical Doctor",
      employer: "Cebu Medical Center",
      monthlyIncome: "150000",
      sourceOfIncome: "Employment"
    }
  },
  {
    id: "4",
    type: "KYC",
    userType: "Student",
    name: "Carlos Mendoza",
    email: "carlos.mendoza@email.com",
    phone: "+63 934 567 8901",
    status: "pending",
    submittedDate: "2024-01-12",
    documents: ["Valid ID", "Proof of Enrollment", "Academic Records"],
    personalInfo: {
      fullName: "Carlos Mendoza",
      dateOfBirth: "2000-03-10",
      nationality: "Filipino",
      address: "321 Pine Street, Davao City",
      idType: "Student ID",
      idNumber: "2020-12345"
    },
    academicInfo: {
      school: "Ateneo de Davao University",
      course: "Bachelor of Science in Business Administration",
      yearLevel: "2nd Year",
      gwa: "1.75"
    }
  },
  {
    id: "5",
    type: "KYB",
    userType: "Corporate Sponsor",
    name: "GreenEnergy Solutions",
    email: "info@greenenergy.ph",
    phone: "+63 2 8234 5678",
    status: "pending",
    submittedDate: "2024-01-14",
    documents: ["Business Registration", "SEC Certificate", "Financial Statements"],
    businessInfo: {
      companyName: "GreenEnergy Solutions Inc.",
      businessType: "Corporation",
      industry: "Energy",
      registrationNumber: "SEC-2024-005678",
      taxId: "987-654-321-000",
      address: "789 Energy Plaza, Taguig City",
      contactPerson: "Maria Garcia",
      position: "Finance Director"
    }
  }
];

const VerificationTable = ({ 
  verifications, 
  onViewDetails, 
  onApprove, 
  onDeny 
}: {
  verifications: typeof mockVerifications;
  onViewDetails: (verification: typeof mockVerifications[0]) => void;
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "denied":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "denied":
        return <XCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Submitted</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {verifications.map((verification) => (
            <motion.tr
              key={verification.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <td className="py-4 px-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {verification.userType === "Student" ? (
                      <User className="h-8 w-8 text-blue-600 bg-blue-100 p-1.5 rounded-full" />
                    ) : (
                      <Building2 className="h-8 w-8 text-green-600 bg-green-100 p-1.5 rounded-full" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{verification.name}</div>
                    <div className="text-sm text-gray-500">{verification.email}</div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {verification.type}
                  </Badge>
                  <span className="text-sm text-gray-600">({verification.userType})</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(verification.status)}
                  <Badge className={`text-xs ${getStatusColor(verification.status)}`}>
                    {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                  </Badge>
                </div>
              </td>
              <td className="py-4 px-4 text-sm text-gray-600">
                {new Date(verification.submittedDate).toLocaleDateString()}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(verification)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {verification.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onApprove(verification.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeny(verification.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Deny
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const VerificationDetailModal = ({ 
  verification, 
  isOpen, 
  onClose 
}: {
  verification: typeof mockVerifications[0] | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!verification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {verification.userType === "Student" ? (
              <User className="h-6 w-6 text-blue-600" />
            ) : (
              <Building2 className="h-6 w-6 text-green-600" />
            )}
            <span>Verification Details - {verification.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900">{verification.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{verification.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{verification.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Verification Type</label>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{verification.type}</Badge>
                    <span className="text-sm text-gray-600">({verification.userType})</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal/Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {verification.type === "KYC" ? "Personal Information" : "Business Information"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verification.type === "KYC" && verification.personalInfo ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="text-gray-900">{verification.personalInfo.dateOfBirth}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nationality</label>
                    <p className="text-gray-900">{verification.personalInfo.nationality}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <p className="text-gray-900">{verification.personalInfo.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">ID Type</label>
                    <p className="text-gray-900">{verification.personalInfo.idType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">ID Number</label>
                    <p className="text-gray-900">{verification.personalInfo.idNumber}</p>
                  </div>
                </div>
              ) : verification.businessInfo ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Business Type</label>
                    <p className="text-gray-900">{verification.businessInfo.businessType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Industry</label>
                    <p className="text-gray-900">{verification.businessInfo.industry}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Registration Number</label>
                    <p className="text-gray-900">{verification.businessInfo.registrationNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tax ID</label>
                    <p className="text-gray-900">{verification.businessInfo.taxId}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Business Address</label>
                    <p className="text-gray-900">{verification.businessInfo.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Contact Person</label>
                    <p className="text-gray-900">{verification.businessInfo.contactPerson}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Position</label>
                    <p className="text-gray-900">{verification.businessInfo.position}</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Academic/Professional Information */}
          {(verification.academicInfo || verification.professionalInfo) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {verification.academicInfo ? "Academic Information" : "Professional Information"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {verification.academicInfo ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">School</label>
                      <p className="text-gray-900">{verification.academicInfo.school}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Course</label>
                      <p className="text-gray-900">{verification.academicInfo.course}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Year Level</label>
                      <p className="text-gray-900">{verification.academicInfo.yearLevel}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">GWA</label>
                      <p className="text-gray-900">{verification.academicInfo.gwa}</p>
                    </div>
                  </div>
                ) : verification.professionalInfo ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Occupation</label>
                      <p className="text-gray-900">{verification.professionalInfo.occupation}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Employer</label>
                      <p className="text-gray-900">{verification.professionalInfo.employer}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Monthly Income</label>
                      <p className="text-gray-900">₱{parseInt(verification.professionalInfo.monthlyIncome).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Source of Income</label>
                      <p className="text-gray-900">{verification.professionalInfo.sourceOfIncome}</p>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submitted Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {verification.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-900">{doc}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DenialModal = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Deny Verification</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Reason for Denial</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Please provide a reason for denying this verification..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirm}
              disabled={!reason.trim()}
            >
              Confirm Denial
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function KYCKYBApprovalsPage() {
  const [verifications, setVerifications] = useState(mockVerifications);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedVerification, setSelectedVerification] = useState<typeof mockVerifications[0] | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDenialModalOpen, setIsDenialModalOpen] = useState(false);
  const [denialTargetId, setDenialTargetId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [personaDropdown, setPersonaDropdown] = useState("all");

  // Persona options
  const personaOptions = [
    { value: "all", label: "All Personas" },
    { value: "student", label: "Student" },
    { value: "sponsor", label: "Sponsor" },
    { value: "school", label: "School" }
  ];

  const filteredVerifications = useMemo(() => {
    return verifications.filter((verification) => {
      const matchesSearch = 
        verification.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verification.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || verification.status === statusFilter;
      const matchesType = typeFilter === "all" || verification.type === typeFilter;
      const matchesPersona = personaDropdown === "all" ||
        (personaDropdown === "student" && verification.userType === "Student") ||
        (personaDropdown === "sponsor" && verification.userType.includes("Sponsor")) ||
        (personaDropdown === "school" && verification.userType === "School");
      
      return matchesSearch && matchesStatus && matchesType && matchesPersona;
    });
  }, [verifications, searchTerm, statusFilter, typeFilter, personaDropdown]);

  const paginatedVerifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVerifications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVerifications, currentPage]);

  const totalPages = Math.ceil(filteredVerifications.length / itemsPerPage);

  const handleViewDetails = (verification: typeof mockVerifications[0]) => {
    setSelectedVerification(verification);
    setIsDetailModalOpen(true);
  };

  const handleApprove = (id: string) => {
    setVerifications(prev => 
      prev.map(v => 
        v.id === id ? { ...v, status: "approved" as const } : v
      )
    );
  };

  const handleDeny = (id: string) => {
    setDenialTargetId(id);
    setIsDenialModalOpen(true);
  };

  const handleConfirmDenial = (reason: string) => {
    if (denialTargetId) {
      setVerifications(prev => 
        prev.map(v => 
          v.id === denialTargetId ? { ...v, status: "denied" as const } : v
        )
      );
      console.log(`Denied verification ${denialTargetId} with reason: ${reason}`);
    }
  };

  // Persona stats logic (always 3 cards, even if 0)
  const personaStats = [
    {
      label: "student",
      count: verifications.filter(v => v.userType === "Student").length,
      verified: verifications.filter(v => v.userType === "Student" && v.status === "approved").length,
      pending: verifications.filter(v => v.userType === "Student" && v.status === "pending").length,
      color: "text-blue-600"
    },
    {
      label: "sponsor",
      count: verifications.filter(v => v.userType.includes("Sponsor")).length,
      verified: verifications.filter(v => v.userType.includes("Sponsor") && v.status === "approved").length,
      pending: verifications.filter(v => v.userType.includes("Sponsor") && v.status === "pending").length,
      color: "text-green-600"
    },
    {
      label: "school",
      count: 0, // No school in mock data
      verified: 0,
      pending: 0,
      color: "text-purple-600"
    }
  ];

  // Filter persona stats for dropdown
  const filteredPersonaStats = personaDropdown === "all"
    ? personaStats
    : personaStats.filter(p => p.label === personaDropdown);

  // Minimized overall stats
  const overallStats = [
    { label: "Total", count: verifications.length, color: "text-gray-600", icon: Users },
    { label: "Pending", count: verifications.filter(v => v.status === "pending").length, color: "text-yellow-600", icon: Clock },
    { label: "Verified", count: verifications.filter(v => v.status === "approved").length, color: "text-green-600", icon: CheckCircle },
    { label: "Denied", count: verifications.filter(v => v.status === "denied").length, color: "text-red-600", icon: XCircle },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC/KYB Approvals</h1>
          <p className="text-gray-600">Manage user verification requests and approvals</p>
        </div>
      </div>

      {/* Minimized Overall Stats */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        {overallStats.map((stat) => (
          <div key={stat.label} className="bg-white p-3 rounded-md shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.count}</p>
            </div>
            <div className="p-2 rounded-full bg-gray-100">
              <stat.icon className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        ))}
      </div>

      {/* Persona Stats (filtered by dropdown) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        {filteredPersonaStats.map((persona) => (
          <div key={persona.label} className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
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

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="KYC">KYC</SelectItem>
                  <SelectItem value="KYB">KYB</SelectItem>
                </SelectContent>
              </Select>
              <Select value={personaDropdown} onValueChange={setPersonaDropdown}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Persona" />
                </SelectTrigger>
                <SelectContent>
                  {personaOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <VerificationTable
            verifications={paginatedVerifications}
            onViewDetails={handleViewDetails}
            onApprove={handleApprove}
            onDeny={handleDeny}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredVerifications.length)} of {filteredVerifications.length} results
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <VerificationDetailModal
        verification={selectedVerification}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
      
      <DenialModal
        isOpen={isDenialModalOpen}
        onClose={() => setIsDenialModalOpen(false)}
        onConfirm={handleConfirmDenial}
      />
    </div>
  );
}
