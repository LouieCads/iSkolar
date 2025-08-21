"use client";

import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Users,
  FileText,
  Download,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { identityApprovalService, Verification, VerificationResponse } from "@/services/identityApprovalService";
import { PersonaDetailsCard } from "@/components/admin/identity-approvals/PersonaDetailsCard";
import { StatsAndFiltersCard } from "@/components/admin/identity-approvals/StatsAndFiltersCard";
import { VerificationTable } from "@/components/admin/identity-approvals/VerificationTable";

// Types
interface Stats {
  total: number;
  unverified: number;
  pending: number;
  verified: number;
  denied: number;
}

// Helper function to get user email safely
const getUserEmail = (verification: Verification): string => {
  if (typeof verification.userId === 'object' && verification.userId?.email) {
    return verification.userId.email;
  }
  return 'N/A';
};

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

// Main Page Component
export default function IdentityApprovalsPage() {
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
        identityApprovalService.getAllVerifications({
          page: currentPage,
          limit: itemsPerPage,
          status: statusFilter !== "all" ? statusFilter : undefined,
          personaType: personaFilter !== "all" ? personaFilter : undefined
        }),
        identityApprovalService.getVerificationStats()
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

  // Filter verifications for search
  const filteredVerifications = verifications.filter((verification) => {
    const matchesSearch =
      getPersonaName(verification).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserEmail(verification).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const paginatedVerifications = filteredVerifications;

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
      await identityApprovalService.updateVerificationStatus(verification._id, { status: "verified" });
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
      await identityApprovalService.updateVerificationStatus(selectedVerification._id, { status: "verified" });
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
      await identityApprovalService.updateVerificationStatus(selectedVerification._id, {
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
      await identityApprovalService.bulkUpdateStatus(selectedIds, {
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
          <Button onClick={fetchData} className="cursor-pointer">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Identity Approvals</h1>
          <p className="text-gray-600">Manage user verification requests and approvals</p>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={() => handleBulkAction("verified")} disabled={processingAction} className="cursor-pointer">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Selected ({selectedIds.length})
            </Button>
            <Button variant="destructive" onClick={() => setIsDenialModalOpen(true)} disabled={processingAction} className="cursor-pointer">
              <XCircle className="h-4 w-4 mr-2" />
              Deny Selected ({selectedIds.length})
            </Button>
          </div>
        )}
      </div>

      {/* Stats and Filters Component */}
      <StatsAndFiltersCard 
        stats={stats}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        personaFilter={personaFilter}
        setPersonaFilter={setPersonaFilter}
      />

      {/* Verification Table Component */}
      <VerificationTable
        verifications={paginatedVerifications}
        onViewDetails={handleViewDetails}
        onApprove={handleRowApprove}
        onDeny={handleRowDeny}
        onSelect={handleSelect}
        selectedIds={selectedIds}
        processingAction={processingAction}
        onSelectAll={handleSelectAll}
        allSelected={selectedIds.length === paginatedVerifications.length && paginatedVerifications.length > 0}
      />

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
              className="cursor-pointer"
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
              className="cursor-pointer"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-8xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedVerification?.personaType === "student" && <GraduationCap className="h-6 w-6 text-blue-600" />}
              {selectedVerification?.personaType === "sponsor" && <Users className="h-6 w-6 text-green-600" />}
              {selectedVerification?.personaType === "school" && <Building className="h-6 w-6 text-purple-600" />}
              <span>Verification Details - {selectedVerification ? getPersonaName(selectedVerification) : ''}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-4">
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
                      <p className="text-gray-900">{getUserEmail(selectedVerification)}</p>
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
                          className="cursor-pointer"
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
                    className="cursor-pointer"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Deny
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={processingAction}
                    className="cursor-pointer"
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
              <Button variant="outline" onClick={() => setIsDenialModalOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedIds.length > 0 ? handleBulkAction("denied") : handleDeny()}
                disabled={!denialReason.trim() || processingAction}
                className="cursor-pointer"
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