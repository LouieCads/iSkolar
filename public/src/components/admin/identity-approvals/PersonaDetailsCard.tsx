import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProofOfIdentity, Verification } from "@/services/identityApprovalService";
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Users, Building, MapPin, AlertCircle, User, CreditCard } from 'lucide-react';

interface PersonaDetailsCardProps {
  verification: Verification;
}

export const PersonaDetailsCard: React.FC<PersonaDetailsCardProps> = ({ verification }) => {
  const proof = verification.proofOfIdentity;

  if (!proof) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-gray-400" />
            Identity Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">No identity verification details available</p>
        </CardContent>
      </Card>
    );
  }

  const getPersonaIcon = () => {
    switch (verification.personaType) {
      case 'student': return <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />;
      case 'sponsor': return <Users className="h-5 w-5 mr-2 text-green-600" />;
      case 'school': return <Building className="h-5 w-5 mr-2 text-purple-600" />;
      default: return <User className="h-5 w-5 mr-2 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          {getPersonaIcon()}
          {verification.personaType.charAt(0).toUpperCase() + verification.personaType.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Personal Info */}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center"><User className="h-4 w-4 mr-2" /> Personal Info</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-gray-700">First Name</label><p>{proof.fullName.firstName || ''}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Middle Name</label><p>{proof.fullName.middleName || ''}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Last Name</label><p>{proof.fullName.lastName || ''}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Date of Birth</label><p>{proof.dateOfBirth ? new Date(proof.dateOfBirth).toLocaleDateString() : ''}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Nationality</label><p>{proof.nationality || ''}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Email</label><p>{proof.contactEmail || ''}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Contact Number</label><p>{proof.contactNumber || ''}</p></div>
          </div>
        </div>

        {/* Address */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center"><MapPin className="h-4 w-4 mr-2" />Address</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-gray-700">Country</label><p>{proof.address?.country || ''}</p></div>
            <div><label className="text-sm font-medium text-gray-700">State/Province</label><p>{proof.address?.stateOrProvince || ''}</p></div>
            <div><label className="text-sm font-medium text-gray-700">City</label><p>{proof.address?.city || ''}</p></div>
            <div><label className="text-sm font-medium text-gray-700">District/Barangay</label><p>{proof.address?.districtOrBarangay || ''}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Street</label><p>{proof.address?.street || ''}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Postal Code</label><p>{proof.address?.postalCode || ''}</p></div>
          </div>
        </div>

        {/* ID Details */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center"><CreditCard className="h-4 w-4 mr-2" />ID Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-gray-700">ID Type</label><p>{proof.idDetails?.idType || ''}</p></div>
            <div><label className="text-sm font-medium text-gray-700">ID Number</label><p>{proof.idDetails?.idNumber || ''}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Expiry Date</label><p>{proof.idDetails?.expiryDate ? new Date(proof.idDetails.expiryDate).toLocaleDateString() : ''}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Front Image File</label><p>{proof.idDetails?.frontImageUrl || 'N/A'}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Back Image File</label><p>{proof.idDetails?.backImageUrl || 'N/A'}</p></div>
            <div><label className="text-sm font-medium text-gray-700">Selfie File</label><p>{proof.selfiePhotoUrl || 'N/A'}</p></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
