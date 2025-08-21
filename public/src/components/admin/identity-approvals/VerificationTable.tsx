// components/admin/kyc-kyb-approvals/VerificationTable.tsx

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Clock,
  User,
  GraduationCap,
  Building,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  Check,
  X,
  Users
} from "lucide-react";
import { motion } from "framer-motion";

// Types
interface Verification {
  _id: string;
  userId: {
    _id: string;
    email: string;
    role?: string;
    status?: string;
  } | string; // Can be populated object or just string ID
  personaType: "student" | "sponsor" | "school";
  status: string;
  submittedAt: string;
  student?: any;
  individualSponsor?: any;
  corporateSponsor?: any;
  school?: any;
}

interface VerificationTableProps {
  verifications: Verification[];
  onViewDetails: (verification: Verification) => void;
  onApprove: (verification: Verification) => void;
  onDeny: (verification: Verification) => void;
  onSelect: (id: string) => void;
  selectedIds: string[];
  processingAction: boolean;
  onSelectAll: (select: boolean) => void;
  allSelected: boolean;
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

// Table Header Component
const TableHeader = ({ 
  onSelectAll, 
  allSelected, 
  totalItems 
}: { 
  onSelectAll: (select: boolean) => void; 
  allSelected: boolean; 
  totalItems: number;
}) => {
  return (
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
      <div className="grid grid-cols-14 gap-4 text-xs font-semibold text-gray-700">
        <div className="col-span-1">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={totalItems === 0}
          />
        </div>
        <div className="col-span-1">Type</div>
        <div className="col-span-2">Name</div>
        <div className="col-span-3 text-center">Email</div>
        <div className="col-span-3">Submission Date</div>
        <div className="col-span-1 text-center">Status</div>
        <div className="col-span-3 text-center">Actions</div>
      </div>
    </div>
  );
};

// Helper functions
const getUserEmail = (verification: Verification): string => {
  // First, try to get email from populated userId (this is the correct way)
  if (typeof verification.userId === 'object' && verification.userId?.email) {
    return verification.userId.email;
  }
  
  // Fallback to persona-specific emails if userId is not populated
  if (verification.student?.email) return verification.student.email;
  if (verification.individualSponsor?.email) return verification.individualSponsor.email;
  if (verification.corporateSponsor?.authorizedRepresentative?.email) return verification.corporateSponsor.authorizedRepresentative.email;
  if (verification.school?.officialEmail) return verification.school.officialEmail;
  
  return 'N/A';
};

const getPersonaName = (verification: Verification): string => {
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

// Verification Row Component
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
  const userEmail = getUserEmail(verification);
  const personaName = getPersonaName(verification);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-white border ${isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'} transition-all cursor-pointer`}
      onClick={() => onViewDetails(verification)}
    >
      <div className="p-4">
        <div className="grid grid-cols-14 gap-4 items-center">
          {/* Checkbox - 1 column */}
          <div className="col-span-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(verification._id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
            />
          </div>

          {/* Type - 1 column */}
          <div className="col-span-1">
            <div className="flex items-center">
              {getPersonaIcon(verification.personaType)}
            </div>
          </div>

          {/* Name - 2 columns */}
          <div className="col-span-2">
            <div className="text-xs font-medium text-gray-900 truncate flex items-center space-x-3">         
              {personaName}  
            </div>
          </div>

          {/* Email - 2 columns */}
          <div className="col-span-3">
            <div className="flex items-center text-xs text-gray-600">
              <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
              <span className="truncate" title={userEmail}>{userEmail}</span>
            </div>
          </div>

          {/* Submission Date - 2 columns */}
          <div className="col-span-3">
            <div className="flex items-center text-xs text-gray-600">
              <Calendar className="h-3 w-3 mr-2 flex-shrink-0" />
              <span>{new Date(verification.submittedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Status - 1 column */}
          <div className="col-span-1 flex justify-center">
            <StatusBadge status={verification.status} />
          </div>

          {/* Actions - 3 columns */}
          <div className="col-span-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center space-x-1">
              {/* View Details Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(verification)}
                className="h-8 w-8 p-0 cursor-pointer"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </Button>

              {/* Action buttons only for pending status */}
              {verification.status === "pending" && (
                <>
                  {/* Deny Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeny(verification)}
                    disabled={processingAction}
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                    title="Deny"
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {/* Approve Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onApprove(verification)}
                    disabled={processingAction}
                    className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700 cursor-pointer"
                    title="Approve"
                  >
                    <Check className="h-4 w-4" />
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

// Main VerificationTable Component
export const VerificationTable: React.FC<VerificationTableProps> = ({
  verifications,
  onViewDetails,
  onApprove,
  onDeny,
  onSelect,
  selectedIds,
  processingAction,
  onSelectAll,
  allSelected,
}) => {
  return (
    <Card>
      <TableHeader
        onSelectAll={onSelectAll}
        allSelected={allSelected}
        totalItems={verifications.length}
      />
      <div className="divide-y divide-gray-200">
        {verifications.map((verification) => (
          <VerificationRow
            key={verification._id}
            verification={verification}
            onViewDetails={onViewDetails}
            onApprove={onApprove}
            onDeny={onDeny}
            onSelect={onSelect}
            isSelected={selectedIds.includes(verification._id)}
            processingAction={processingAction}
          />
        ))}
      </div>
    </Card>
  );
};