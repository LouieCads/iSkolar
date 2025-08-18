// app/school/kyc-approvals/page.tsx
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
  GraduationCap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  LogOut,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { schoolKycApprovalService, Verification, QueueItem } from "@/services/schoolKycApprovalService";
import { StudentDetailsCard } from "@/components/school/kyc-approvals/StudentDetailsCard";
import { useRouter } from "next/navigation";

// Types
interface Stats {
  total: number;
  pending: number;
  preApproved: number;
  denied: number;
}

// Unified type for display
interface DisplayItem {
  id: string;
  status: "pending" | "pre_approved" | "denied";
  submittedAt: string;
  studentName: string;
  schoolName: string;
  email?: string;
  phone?: string;
  course?: string;
  yearLevel?: string;
  studentIdNumber?: string;
  verification?: Verification;
}

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pre_approved":
        return { color: "bg-blue-100 text-blue-800", icon: CheckCircle };
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
      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
    </Badge>
  );
};

// Verification Row Component
const VerificationRow = ({
  item,
  onViewDetails,
}: {
  item: DisplayItem;
  onViewDetails: (item: DisplayItem) => void;
}) => {
  const getPersonaDetails = () => {
    return {
      email: item.email || 'N/A',
      phone: item.phone || 'N/A',
      primary: item.schoolName || 'N/A',
      secondary: item.course ? `${item.course}${item.yearLevel ? ` - Year ${item.yearLevel}` : ''}` : 'N/A',
      id: item.studentIdNumber || 'N/A',
    };
  };

  const details = getPersonaDetails();

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
      onClick={() => onViewDetails(item)}
    >
      <div className="p-4">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-3">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 truncate">{item.studentName}</h3>
                <p className="text-sm text-gray-500 capitalize">Student</p>
              </div>
            </div>
          </div>
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
          <div className="col-span-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900 truncate" title={details.primary}>{details.primary}</p>
              <p className="text-sm text-gray-500 truncate" title={details.secondary}>{details.secondary}</p>
            </div>
          </div>
          <div className="col-span-1">
            <p className="text-sm text-gray-600 truncate" title={details.id}>{details.id}</p>
          </div>
          <div className="col-span-1 flex justify-center">
            <StatusBadge status={item.status} />
          </div>
          <div className="col-span-2">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="col-span-1 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(item);
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
        <div className="col-span-2">Date</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>
    </div>
  );
};

// Stats Cards Component
const StatsCards = ({ stats }: { stats: Stats }) => {
  const statItems = [
    { label: "Total", count: stats.total, color: "text-gray-600", icon: GraduationCap },
    { label: "Pending", count: stats.pending, color: "text-yellow-600", icon: Clock },
    { label: "Pre-Approved", count: stats.preApproved, color: "text-blue-600", icon: CheckCircle },
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
export default function KYCApprovalsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<DisplayItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDenialModalOpen, setIsDenialModalOpen] = useState(false);
  const [denialReason, setDenialReason] = useState("");
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const itemsPerPage = 10;

  // Fetch school's KYC queue
  const fetchVerifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await schoolKycApprovalService.getSchoolKycQueue();
      console.log("Frontend received API response:", response);
      setVerifications(response.kycVerifications || []);
      setQueue(response.queue || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch student verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  // Reset currentPage when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Combine verifications and queue for display
  const displayItems: DisplayItem[] = verifications.length > 0
    ? verifications.map((v) => ({
        id: v._id,
        status: v.status,
        submittedAt: v.submittedAt,
        studentName: v.student?.fullName
          ? `${v.student.fullName.firstName || ''} ${v.student.fullName.lastName || ''}`.trim()
          : 'Unknown',
        schoolName: v.student?.schoolName || '',
        email: v.student?.email,
        phone: v.student?.mobileNumber,
        course: v.student?.course,
        yearLevel: v.student?.yearLevel,
        studentIdNumber: v.student?.studentIdNumber,
        verification: v,
      }))
    : queue.map((q) => ({
        id: q.verificationId,
        status: q.status,
        submittedAt: q.submittedAt,
        studentName: q.studentName,
        schoolName: q.schoolName,
        email: q.verification?.student?.email,
        phone: q.verification?.student?.mobileNumber,
        course: q.verification?.student?.course,
        yearLevel: q.verification?.student?.yearLevel,
        studentIdNumber: q.verification?.student?.studentIdNumber,
        verification: q.verification,
      }));

  // Filter display items
  const filteredItems = displayItems.filter((item) => {
    const name = item.studentName.toLowerCase();
    const email = item.email?.toLowerCase() || '';
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate stats
  const stats: Stats = {
    total: displayItems.length,
    pending: displayItems.filter(v => v.status === "pending").length,
    preApproved: displayItems.filter(v => v.status === "pre_approved").length,
    denied: displayItems.filter(v => v.status === "denied").length,
  };

  // Handle actions
  const handleViewDetails = (item: DisplayItem) => {
    setSelectedVerification(item);
    setIsDetailModalOpen(true);
  };

  const handlePreApprove = async () => {
    if (!selectedVerification) return;
    try {
      setProcessingAction(true);
      await schoolKycApprovalService.preApproveStudent(selectedVerification.id, { reviewerNotes });
      setVerifications(prev =>
        prev.map(v =>
          v._id === selectedVerification.id
            ? { ...v, status: "pre_approved", verifiedBy: "current_user", updatedAt: new Date().toISOString() }
            : v
        )
      );
      setQueue(prev =>
        prev.map(q =>
          q.verificationId === selectedVerification.id
            ? { ...q, status: "pre_approved", reviewedAt: new Date().toISOString(), reviewerNotes }
            : q
        )
      );
      setIsDetailModalOpen(false);
      setSelectedVerification(null);
      setReviewerNotes("");
    } catch (err: any) {
      setError(err.message || 'Failed to pre-approve student');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeny = async () => {
    if (!selectedVerification || !denialReason.trim()) return;
    try {
      setProcessingAction(true);
      await schoolKycApprovalService.denyStudent(selectedVerification.id, { denialReason, reviewerNotes });
      setVerifications(prev =>
        prev.map(v =>
          v._id === selectedVerification.id
            ? { ...v, status: "denied", denialReason, verifiedBy: "current_user", updatedAt: new Date().toISOString() }
            : v
        )
      );
      setQueue(prev =>
        prev.map(q =>
          q.verificationId === selectedVerification.id
            ? { ...q, status: "denied", denialReason, reviewedAt: new Date().toISOString(), reviewerNotes }
            : q
        )
      );
      setIsDetailModalOpen(false);
      setIsDenialModalOpen(false);
      setSelectedVerification(null);
      setDenialReason("");
      setReviewerNotes("");
    } catch (err: any) {
      setError(err.message || 'Failed to deny student');
    } finally {
      setProcessingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading student verifications...</p>
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
          <div className="flex flex-col gap-2">
            <Button onClick={fetchVerifications} className="flex items-center mx-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            {error.includes("Unauthorized") && (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center mx-auto"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student KYC Approvals</h1>
          <p className="text-gray-600">Review and pre-approve student verification requests</p>
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
                  <SelectItem value="denied">Denied</SelectItem>
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
          {paginatedItems.map((item) => (
            <VerificationRow
              key={item.id}
              item={item}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      </Card>

      {/* Empty State */}
      {displayItems.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No student verifications found</p>
          {queue.length > 0 && verifications.length === 0 && (
            <p className="text-gray-500 text-sm">
              {queue.length} queue entries found but no matching KYC verifications. Contact support to resolve data issues.
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} results
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
      <Dialog open={isDetailModalOpen} onOpenChange={(open) => {
        setIsDetailModalOpen(open);
        if (!open) setSelectedVerification(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <span>Student Verification Details - {selectedVerification?.studentName || 'Unknown'}</span>
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
                      <p className="text-gray-900">{selectedVerification.studentName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedVerification.email || 'N/A'}</p>
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

              {/* Student Details */}
              {selectedVerification.verification ? (
                <StudentDetailsCard verification={selectedVerification.verification} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Student Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Detailed student information is unavailable. Please contact support to resolve data issues.</p>
                  </CardContent>
                </Card>
              )}

              {/* Reviewer Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reviewer Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="Add notes for this verification..."
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              {selectedVerification.status === "pending" && (
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsDenialModalOpen(true)}
                    disabled={processingAction || !selectedVerification.verification}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Deny
                  </Button>
                  <Button
                    onClick={handlePreApprove}
                    disabled={processingAction || !selectedVerification.verification}
                  >
                    {processingAction ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Pre-Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Denial Modal */}
      <Dialog open={isDenialModalOpen} onOpenChange={(open) => {
        setIsDenialModalOpen(open);
        if (!open) {
          setDenialReason("");
          setReviewerNotes("");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Deny Student Verification</DialogTitle>
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
            <div>
              <label className="text-sm font-medium text-gray-700">Reviewer Notes</label>
              <Textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Add any additional notes..."
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
                disabled={!denialReason.trim() || processingAction || !selectedVerification?.verification}
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