// components/school/kyc-approvals/StudentDetailsCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, MapPin, Calendar } from 'lucide-react';
import { Verification } from '@/services/schoolKycApprovalService';

interface StudentDetailsCardProps {
  verification: Verification;
}

export const StudentDetailsCard: React.FC<StudentDetailsCardProps> = ({ verification }) => {
  const renderStudentDetails = () => {
    if (!verification.student) return null;
    const student = verification.student;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <p className="text-gray-900">
              {student.fullName?.firstName} {student.fullName?.middleName || ''} {student.fullName?.lastName}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Student ID</label>
            <p className="text-gray-900">{student.studentIdNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{student.email || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Mobile Number</label>
            <p className="text-gray-900">{student.mobileNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Gender</label>
            <p className="text-gray-900 capitalize">{student.gender || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Age</label>
            <p className="text-gray-900">{student.age || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Civil Status</label>
            <p className="text-gray-900 capitalize">{student.civilStatus || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Nationality</label>
            <p className="text-gray-900">{student.nationality || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Date of Birth</label>
            <p className="text-gray-900">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Place of Birth</label>
            <p className="text-gray-900">{student.placeOfBirth || 'N/A'}</p>
          </div>
        </div>

        {/* Academic Information */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <GraduationCap className="h-4 w-4 mr-2" />
            Academic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">School</label>
              <p className="text-gray-900">{student.schoolName || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">School Email</label>
              <p className="text-gray-900">{student.schoolEmail || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Course</label>
              <p className="text-gray-900">{student.course || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Year Level</label>
              <p className="text-gray-900">{student.yearLevel || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Semesters per Year</label>
              <p className="text-gray-900">{student.semestersPerYear || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Address Information */}
        {student.address && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Address Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Country</label>
                <p className="text-gray-900">{student.address.country || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Province</label>
                <p className="text-gray-900">{student.address.province || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">City</label>
                <p className="text-gray-900">{student.address.city || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Barangay</label>
                <p className="text-gray-900">{student.address.barangay || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Street</label>
                <p className="text-gray-900">{student.address.street || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">ZIP Code</label>
                <p className="text-gray-900">{student.address.zipCode || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Educational Background */}
        {student.educationalBackground && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Educational Background</h4>
            <div className="space-y-3">
              {student.educationalBackground.elementary && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700">Elementary</h5>
                  <p className="text-gray-900">{student.educationalBackground.elementary.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Graduated: {student.educationalBackground.elementary.yearGraduated || 'N/A'}</p>
                </div>
              )}
              {student.educationalBackground.juniorHigh && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700">Junior High School</h5>
                  <p className="text-gray-900">{student.educationalBackground.juniorHigh.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Graduated: {student.educationalBackground.juniorHigh.yearGraduated || 'N/A'}</p>
                </div>
              )}
              {student.educationalBackground.seniorHigh && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700">Senior High School</h5>
                  <p className="text-gray-900">{student.educationalBackground.seniorHigh.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Graduated: {student.educationalBackground.seniorHigh.yearGraduated || 'N/A'}</p>
                </div>
              )}
              {student.educationalBackground.college && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700">College</h5>
                  <p className="text-gray-900">{student.educationalBackground.college.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Expected Graduation: {student.educationalBackground.college.expectedGraduation || 'N/A'}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
          Student Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderStudentDetails()}
      </CardContent>
    </Card>
  );
};