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
  Calendar,
  Check,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { kycKybApprovalService, Verification, VerificationResponse } from "@/services/kycKybApprovalService";
import { PersonaDetailsCard } from "@/components/admin/kyc-kyb-approvals/PersonaDetailsCard";

// Types
interface Stats {
  total: number;
  unverified: number;
  pending: number;
  verified: number;
  denied: number;
}

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
      default:
        return { color: "bg-gray-100 text-gray-800", icon: Clock };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={`text-xs ${config.color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Verification Row Component - Simplified
const VerificationRow = ({
  verification,
  onViewDetails,
  onApprove,
  onDeny,
  onSelect,
  isSelected,
  processingAction
}: {
  verification: Verification;
  onViewDetails: (verification: Verification) => void;
  onApprove: (verification: Verification) => void;
  onDeny: (verification: Verification) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  processingAction: boolean;
}) => {
  const getPersonaIcon = (personaType: string) => {
    switch (personaType) {
      case "student":
        return <GraduationCap className="h-6 w-6 text-blue-600" />;
      case "sponsor":
        return <Users className="h-6 w-6 text-green-600" />;
      case "school":
        return <Building className="h-6 w-6 text-purple-600" />;
      default:
        return <User className="h-6 w-6 text-gray-600" />;
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

  const getEmail = () => {
    if (verification.student?.email) return verification.student.email;
    if (verification.individualSponsor?.email) return verification.individualSponsor.email;
    if (verification.corporateSponsor?.authorizedRepresentative?.email) return verification.corporateSponsor.authorizedRepresentative.email;
    if (verification.school?.officialEmail) return verification.school.officialEmail;
    if (verification.user?.email) return verification.user.email;
    return 'N/A';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-white border ${isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'} transition-all`}
    >
      <div className="p-4">
        <div className="grid grid-cols-13 gap-4 items-center">
          {/* Checkbox - 1 column */}
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(verification._id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          {/* Name & Type - 3 columns */}
          <div className="col-span-2">
            <div className="flex items-center">
                {getPersonaIcon(verification.personaType)}
                
            </div>
          </div>

          <div className="col-span-2">
            <div className="text-sm font-medium text-gray-900 truncate flex items-center space-x-3">         
                {getPersonaName(verification)}  
            </div>
          </div>

          {/* Email - 3 columns */}
          <div className="col-span-2">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
              <span className="truncate" title={getEmail()}>{getEmail()}</span>
            </div>
          </div>

          {/* Submission Date - 2 columns */}
          <div className="col-span-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-3 w-3 mr-2 flex-shrink-0" />
              <span>{new Date(verification.submittedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Status - 1 column */}
          <div className="col-span-1 flex justify-center">
            <StatusBadge status={verification.status} />
          </div>

          {/* Actions - 2 columns */}
          <div className="col-span-2">
            <div className="flex items-center justify-end space-x-2">
              {/* View Details Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(verification)}
                className="h-8 w-8 p-0"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </Button>

              {/* Action buttons only for pending status */}
              {verification.status === "pending" && (
                <>
                  {/* Approve Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onApprove(verification)}
                    disabled={processingAction}
                    className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                    title="Approve"
                  >
                    <Check className="h-4 w-4" />
                  </Button>

                  {/* Deny Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeny(verification)}
                    disabled={processingAction}
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                    title="Deny"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Table Header Component - Updated
const TableHeader = ({ onSelectAll, allSelected, totalItems }: { onSelectAll: (select: boolean) => void; allSelected: boolean; totalItems: number }) => {
  return (
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
      <div className="grid grid-cols-13 gap-4 text-sm font-medium text-gray-700">
        <div className="col-span-1">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={totalItems === 0}
          />
        </div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Name</div>
        <div className="col-span-2">Email</div>
        <div className="col-span-2">Submission Date</div>
        <div className="col-span-1 text-center">Status</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>
    </div>
  );
};

// Stats Cards Component
const StatsCards = ({ stats }: { stats: Stats }) => {
  const statItems = [
    { label: "Total", count: stats.total, color: "text-gray-600", icon: Users },
    { label: "Pending", count: stats.pending, color: "text-yellow-600", icon: Clock },
    { label: "Verified", count: stats.verified, color: "text-green-600", icon: CheckCircle },
    { label: "Denied", count: stats.denied, color: "text-red-600", icon: XCircle },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
  const [stats, setStats] = useState<Stats>({ total: 0, unverified: 0, pending: 0, verified: 0, denied: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDenialModalOpen, setIsDenialModalOpen] = useState(false);
  const [denialReason, setDenialReason] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [personaFilter, setPersonaFilter] = useState("all");

  // Fetch verifications and stats
  const fetchData = async () => {
    try {
      setLoading(true);
      const [verificationsResponse, statsResponse] = await Promise.all([
        kycKybApprovalService.getAllVerifications({
          page: currentPage,
          limit: itemsPerPage,
          status: statusFilter !== "all" ? statusFilter : undefined,
          personaType: personaFilter !== "all" ? personaFilter : undefined
        }),
        kycKybApprovalService.getVerificationStats()
      ]);

      setVerifications(verificationsResponse.verifications);
      setTotalPages(verificationsResponse.totalPages);
      setStats({
        total: statsResponse.overall.total,
        unverified: statsResponse.overall.unverified,
        pending: statsResponse.overall.pending,
        verified: statsResponse.overall.verified,
        denied: statsResponse.overall.denied
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, statusFilter, personaFilter]);

  // Filter verifications for search
  const filteredVerifications = verifications.filter((verification) => {
    const matchesSearch =
      getPersonaName(verification).toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const paginatedVerifications = filteredVerifications;

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

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (select: boolean) => {
    if (select) {
      setSelectedIds(paginatedVerifications.map((v) => v._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleRowApprove = async (verification: Verification) => {
    try {
      setProcessingAction(true);
      await kycKybApprovalService.updateVerificationStatus(verification._id, { status: "verified" });
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve verification');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRowDeny = (verification: Verification) => {
    setSelectedVerification(verification);
    setIsDenialModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedVerification) return;
    try {
      setProcessingAction(true);
      await kycKybApprovalService.updateVerificationStatus(selectedVerification._id, { status: "verified" });
      await fetchData();
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
      await kycKybApprovalService.updateVerificationStatus(selectedVerification._id, {
        status: "denied",
        denialReason: denialReason.trim()
      });
      await fetchData();
      setIsDetailModalOpen(false);
      setSelectedVerification(null);
      setDenialReason("");
      setIsDenialModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deny verification');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleBulkAction = async (status: "verified" | "denied") => {
    if (selectedIds.length === 0) return;
    try {
      setProcessingAction(true);
      await kycKybApprovalService.bulkUpdateStatus(selectedIds, {
        status,
        ...(status === "denied" && denialReason.trim() ? { denialReason: denialReason.trim() } : {})
      });
      await fetchData();
      setSelectedIds([]);
      setDenialReason("");
      setIsDenialModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to bulk ${status} verifications`);
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
          <Button onClick={fetchData}>Retry</Button>
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
        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={() => handleBulkAction("verified")} disabled={processingAction}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Selected ({selectedIds.length})
            </Button>
            <Button variant="destructive" onClick={() => setIsDenialModalOpen(true)} disabled={processingAction}>
              <XCircle className="h-4 w-4 mr-2" />
              Deny Selected ({selectedIds.length})
            </Button>
          </div>
        )}
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
        <TableHeader
          onSelectAll={handleSelectAll}
          allSelected={selectedIds.length === paginatedVerifications.length && paginatedVerifications.length > 0}
          totalItems={paginatedVerifications.length}
        />
        <div className="divide-y divide-gray-200">
          {paginatedVerifications.map((verification) => (
            <VerificationRow
              key={verification._id}
              verification={verification}
              onViewDetails={handleViewDetails}
              onApprove={handleRowApprove}
              onDeny={handleRowDeny}
              onSelect={handleSelect}
              isSelected={selectedIds.includes(verification._id)}
              processingAction={processingAction}
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
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
                    {selectedVerification.denialReason && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-700">Denial Reason</label>
                        <p className="text-gray-900">{selectedVerification.denialReason}</p>
                      </div>
                    )}
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
                          {typeof doc !== 'string' && doc.type && (
                            <span className="text-sm text-gray-500">({doc.type})</span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}${doc.fileUrl}`, '_blank')}
                        >
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
            <DialogTitle>Deny Verification{selectedIds.length > 0 ? 's' : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Reason for Denial</label>
              <Textarea
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                placeholder="Please provide a reason for denying the verification(s)..."
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDenialModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedIds.length > 0 ? handleBulkAction("denied") : handleDeny()}
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