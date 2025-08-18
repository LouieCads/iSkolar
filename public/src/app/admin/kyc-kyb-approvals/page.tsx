// app/public/src/app/admin/kyc-kyb-approvals/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  XCircle,
  AlertCircle,
  Loader2,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { PersonaDetailsCard } from '@/components/admin/kyc-kyb-approvals/PersonaDetailsCard';

// Types
interface Verification {
  _id: string;
  userId: string;
  personaType: "student" | "sponsor" | "school";
  status: "unverified" | "pending" | "pre_approved" | "verified" | "denied";
  submittedAt: string;
  verifiedAt?: string;
  denialReason?: string;
  verifiedBy?: string;
  student?: any;
  individualSponsor?: any;
  corporateSponsor?: any;
  school?: any;
  documents?: any[];
  fileNames?: string[];
  user?: {
    email: string;
  };
}

interface Stats {
  total: number;
  pending: number;
  preApproved: number;
  verified: number;
  denied: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Add authorization header to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "verified":
        return { color: "bg-green-100 text-green-800", icon: CheckCircle };
      case "denied":
        return { color: "bg-red-100 text-red-800", icon: XCircle };
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", icon: Clock };
      case "pre_approved":
        return { color: "bg-blue-100 text-blue-800", icon: CheckCircle };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: Clock };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={`text-xs ${config.color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
    </Badge>
  );
};

// Full-Width Verification Row Component
const VerificationRow = ({ 
  verification, 
  onViewDetails 
}: { 
  verification: Verification; 
  onViewDetails: (verification: Verification) => void; 
}) => {
  const getPersonaIcon = (personaType: string) => {
    switch (personaType) {
      case "student":
        return <GraduationCap className="h-4 w-4 text-blue-600" />;
      case "sponsor":
        return <Users className="h-4 w-4 text-green-600" />;
      case "school":
        return <Building className="h-4 w-4 text-purple-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPersonaName = (verification: Verification) => {
    if (verification.student) {
      const name = verification.student.fullName;
      return `${name?.firstName || ''} ${name?.lastName || ''}`.trim() || 'N/A';
    }
    if (verification.individualSponsor) {
      const name = verification.individualSponsor.fullName;
      return `${name?.firstName || ''} ${name?.lastName || ''}`.trim() || 'N/A';
    }
    if (verification.corporateSponsor) {
      return verification.corporateSponsor.corporateName || 'Corporate Sponsor';
    }
    if (verification.school) {
      return verification.school.schoolName || 'School';
    }
    return 'Unknown';
  };

  const getPersonaDetails = (verification: Verification) => {
    if (verification.student) {
      return {
        email: verification.student.email || 'N/A',
        phone: verification.student.mobileNumber || 'N/A',
        primary: verification.student.schoolName || 'N/A',
        secondary: verification.student.course 
          ? `${verification.student.course}${verification.student.yearLevel ? ` - Year ${verification.student.yearLevel}` : ''}` 
          : 'N/A',
        id: verification.student.studentIdNumber || 'N/A'
      };
    }
    if (verification.individualSponsor) {
      return {
        email: verification.individualSponsor.email || 'N/A',
        phone: verification.individualSponsor.mobileNumber || verification.individualSponsor.telephone || 'N/A',
        primary: verification.individualSponsor.natureOfWork || 'N/A',
        secondary: verification.individualSponsor.employmentType || 'N/A',
        id: verification.individualSponsor.idDetails?.idNumber || 'N/A'
      };
    }
    if (verification.corporateSponsor) {
      return {
        email: verification.corporateSponsor.authorizedRepresentative?.email || 'N/A',
        phone: verification.corporateSponsor.authorizedRepresentative?.contactNumber || 'N/A',
        primary: verification.corporateSponsor.industrySector || 'N/A',
        secondary: verification.corporateSponsor.organizationType || 'N/A',
        id: verification.corporateSponsor.registrationNumber || verification.corporateSponsor.tin || 'N/A'
      };
    }
    if (verification.school) {
      return {
        email: verification.school.officialEmail || 'N/A',
        phone: verification.school.contactNumbers?.[0] || 'N/A',
        primary: verification.school.schoolType || 'N/A',
        secondary: verification.school.authorizedRepresentative?.fullName || 'Representative N/A',
        id: verification.school.businessVerification?.schoolIdNumber || verification.school.businessVerification?.tin || 'N/A'
      };
    }
    return {
      email: 'N/A',
      phone: 'N/A',
      primary: 'N/A',
      secondary: 'N/A',
      id: 'N/A'
    };
  };

  const details = getPersonaDetails(verification);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
      onClick={() => onViewDetails(verification)}
    >
      <div className="p-4">
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Persona Type & Name - 3 columns */}
          <div className="col-span-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {getPersonaIcon(verification.personaType)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 truncate">
                  {getPersonaName(verification)}
                </h3>
                <p className="text-sm text-gray-500 capitalize">
                  {verification.personaType}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info - 2 columns */}
          <div className="col-span-2">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate" title={details.email}>{details.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate" title={details.phone}>{details.phone}</span>
              </div>
            </div>
          </div>

          {/* Primary & Secondary Info - 2 columns */}
          <div className="col-span-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900 truncate" title={details.primary}>
                {details.primary}
              </p>
              <p className="text-sm text-gray-500 truncate" title={details.secondary}>
                {details.secondary}
              </p>
            </div>
          </div>

          {/* ID Number - 1 column */}
          <div className="col-span-1">
            <p className="text-sm text-gray-600 truncate" title={details.id}>
              {details.id}
            </p>
          </div>

          {/* Status - 1 column */}
          <div className="col-span-1 flex justify-center">
            <StatusBadge status={verification.status} />
          </div>

          {/* Documents & Date - 2 columns */}
          <div className="col-span-2">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="h-3 w-3 mr-1" />
                <span>{verification.documents?.length || verification.fileNames?.length || 0} docs</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{new Date(verification.submittedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action - 1 column */}
          <div className="col-span-1 flex justify-end">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(verification);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Table Header Component
const TableHeader = () => {
  return (
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
        <div className="col-span-3">Name & Type</div>
        <div className="col-span-2">Contact Information</div>
        <div className="col-span-2">Primary Details</div>
        <div className="col-span-1">ID Number</div>
        <div className="col-span-1 text-center">Status</div>
        <div className="col-span-2">Documents & Date</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>
    </div>
  );
};

// Stats Cards Component
const StatsCards = ({ stats }: { stats: Stats }) => {
  const statItems = [
    { label: "Total", count: stats.total, color: "text-gray-600", icon: Users },
    { label: "Pending", count: stats.pending, color: "text-yellow-600", icon: Clock },
    { label: "Pre-Approved", count: stats.preApproved, color: "text-blue-600", icon: CheckCircle },
    { label: "Verified", count: stats.verified, color: "text-green-600", icon: CheckCircle },
    { label: "Denied", count: stats.denied, color: "text-red-600", icon: XCircle },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {statItems.map((stat) => (
        <Card key={stat.label} className="p-4">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              </div>
              <div className="p-2 rounded-full bg-gray-100">
                <stat.icon className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Main Page Component
export default function KYCKYBApprovalsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDenialModalOpen, setIsDenialModalOpen] = useState(false);
  const [denialReason, setDenialReason] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [personaFilter, setPersonaFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch verifications
  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/kyc-kyb-verification/all`);
      setVerifications(response.data.verifications || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  // Filter verifications
  const filteredVerifications = verifications.filter((verification) => {
    const matchesSearch = 
      getPersonaName(verification).toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || verification.status === statusFilter;
    const matchesPersona = personaFilter === "all" || verification.personaType === personaFilter;
    
    return matchesSearch && matchesStatus && matchesPersona;
  });

  // Pagination
  const totalPages = Math.ceil(filteredVerifications.length / itemsPerPage);
  const paginatedVerifications = filteredVerifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate stats
  const stats: Stats = {
    total: verifications.length,
    pending: verifications.filter(v => v.status === "pending").length,
    preApproved: verifications.filter(v => v.status === "pre_approved").length,
    verified: verifications.filter(v => v.status === "verified").length,
    denied: verifications.filter(v => v.status === "denied").length,
  };

  // Helper function to get persona name
  function getPersonaName(verification: Verification): string {
    if (verification.student) {
      const name = verification.student.fullName;
      return `${name?.firstName || ''} ${name?.lastName || ''}`.trim();
    }
    if (verification.individualSponsor) {
      const name = verification.individualSponsor.fullName;
      return `${name?.firstName || ''} ${name?.lastName || ''}`.trim();
    }
    if (verification.corporateSponsor) {
      return verification.corporateSponsor.corporateName || 'Corporate Sponsor';
    }
    if (verification.school) {
      return verification.school.schoolName || 'School';
    }
    return 'Unknown';
  }

  // Handle actions
  const handleViewDetails = (verification: Verification) => {
    setSelectedVerification(verification);
    setIsDetailModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedVerification) return;
    
    try {
      setProcessingAction(true);
      await axios.put(`${API_URL}/kyc-kyb-verification/${selectedVerification._id}/status`, {
        status: "verified"
      });
      
      // Update local state
      setVerifications(prev => 
        prev.map(v => 
          v._id === selectedVerification._id 
            ? { ...v, status: "verified", verifiedAt: new Date().toISOString() }
            : v
        )
      );
      
      setIsDetailModalOpen(false);
      setSelectedVerification(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve verification');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeny = async () => {
    if (!selectedVerification || !denialReason.trim()) return;
    
    try {
      setProcessingAction(true);
      await axios.put(`${API_URL}/kyc-kyb-verification/${selectedVerification._id}/status`, {
        status: "denied",
        denialReason: denialReason.trim()
      });
      
      // Update local state
      setVerifications(prev => 
        prev.map(v => 
          v._id === selectedVerification._id 
            ? { ...v, status: "denied", denialReason: denialReason.trim() }
            : v
        )
      );
      
      setIsDetailModalOpen(false);
      setSelectedVerification(null);
      setDenialReason("");
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deny verification');
    } finally {
      setProcessingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading verifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchVerifications}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC/KYB Approvals</h1>
          <p className="text-gray-600">Manage user verification requests and approvals</p>
        </div>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Filters */}
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
                  <SelectItem value="pre_approved">Pre-Approved</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
              <Select value={personaFilter} onValueChange={setPersonaFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Persona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Personas</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="sponsor">Sponsors</SelectItem>
                  <SelectItem value="school">Schools</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verifications Table */}
      <Card>
        <TableHeader />
        <div className="divide-y divide-gray-200">
          {paginatedVerifications.map((verification) => (
            <VerificationRow
              key={verification._id}
              verification={verification}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      </Card>

      {/* Empty State */}
      {paginatedVerifications.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No verifications found</p>
        </div>
      )}

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

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedVerification?.personaType === "student" && <GraduationCap className="h-6 w-6 text-blue-600" />}
              {selectedVerification?.personaType === "sponsor" && <Users className="h-6 w-6 text-green-600" />}
              {selectedVerification?.personaType === "school" && <Building className="h-6 w-6 text-purple-600" />}
              <span>Verification Details - {selectedVerification ? getPersonaName(selectedVerification) : ''}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedVerification && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <p className="text-gray-900">{getPersonaName(selectedVerification)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedVerification.user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <StatusBadge status={selectedVerification.status} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Submitted</label>
                      <p className="text-gray-900">{new Date(selectedVerification.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Persona Specific Information */}
              <PersonaDetailsCard verification={selectedVerification} />

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Submitted Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(selectedVerification.documents || selectedVerification.fileNames || []).map((doc: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-900">
                            {typeof doc === 'string' ? doc : doc.fileName || `Document ${index + 1}`}
                          </span>
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

              {/* Action Buttons */}
              {selectedVerification.status === "pending" && (
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsDenialModalOpen(true)}
                    disabled={processingAction}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Deny
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={processingAction}
                  >
                    {processingAction ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Denial Modal */}
      <Dialog open={isDenialModalOpen} onOpenChange={setIsDenialModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Deny Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Reason for Denial</label>
              <Textarea
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                placeholder="Please provide a reason for denying this verification..."
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDenialModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeny}
                disabled={!denialReason.trim() || processingAction}
              >
                {processingAction ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Confirm Denial
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}