// components/admin/kyc-kyb-approvals/PersonaDetailsCard.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Users, Building, MapPin, Phone, Mail, Calendar, User, Briefcase } from 'lucide-react';

interface Verification {
  _id: string;
  personaType: "student" | "sponsor" | "school";
  student?: any;
  individualSponsor?: any;
  corporateSponsor?: any;
  school?: any;
}

interface PersonaDetailsCardProps {
  verification: Verification;
}

export const PersonaDetailsCard: React.FC<PersonaDetailsCardProps> = ({ verification }) => {
  const renderStudentDetails = () => {
    if (!verification.student) return null;
    const student = verification.student;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <p className="text-gray-900">
              {student.fullName?.firstName} {student.fullName?.middleName} {student.fullName?.lastName}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Student ID</label>
            <p className="text-gray-900">{student.studentIdNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{student.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Mobile Number</label>
            <p className="text-gray-900">{student.mobileNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Gender</label>
            <p className="text-gray-900 capitalize">{student.gender}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Age</label>
            <p className="text-gray-900">{student.age}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Civil Status</label>
            <p className="text-gray-900 capitalize">{student.civilStatus}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Nationality</label>
            <p className="text-gray-900">{student.nationality}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Date of Birth</label>
            <p className="text-gray-900">{new Date(student.dateOfBirth).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Place of Birth</label>
            <p className="text-gray-900">{student.placeOfBirth}</p>
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
              <p className="text-gray-900">{student.schoolName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">School Email</label>
              <p className="text-gray-900">{student.schoolEmail}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Course</label>
              <p className="text-gray-900">{student.course}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Year Level</label>
              <p className="text-gray-900">{student.yearLevel}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Semesters per Year</label>
              <p className="text-gray-900">{student.semestersPerYear}</p>
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
                <p className="text-gray-900">{student.address.country}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Province</label>
                <p className="text-gray-900">{student.address.province}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">City</label>
                <p className="text-gray-900">{student.address.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Barangay</label>
                <p className="text-gray-900">{student.address.barangay}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Street</label>
                <p className="text-gray-900">{student.address.street}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">ZIP Code</label>
                <p className="text-gray-900">{student.address.zipCode}</p>
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
                  <p className="text-gray-900">{student.educationalBackground.elementary.name}</p>
                  <p className="text-sm text-gray-600">Graduated: {student.educationalBackground.elementary.yearGraduated}</p>
                </div>
              )}
              {student.educationalBackground.juniorHigh && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700">Junior High School</h5>
                  <p className="text-gray-900">{student.educationalBackground.juniorHigh.name}</p>
                  <p className="text-sm text-gray-600">Graduated: {student.educationalBackground.juniorHigh.yearGraduated}</p>
                </div>
              )}
              {student.educationalBackground.seniorHigh && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700">Senior High School</h5>
                  <p className="text-gray-900">{student.educationalBackground.seniorHigh.name}</p>
                  <p className="text-sm text-gray-600">Graduated: {student.educationalBackground.seniorHigh.yearGraduated}</p>
                </div>
              )}
              {student.educationalBackground.college && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700">College</h5>
                  <p className="text-gray-900">{student.educationalBackground.college.name}</p>
                  <p className="text-sm text-gray-600">Expected Graduation: {student.educationalBackground.college.expectedGraduation}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderIndividualSponsorDetails = () => {
    if (!verification.individualSponsor) return null;
    const sponsor = verification.individualSponsor;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <p className="text-gray-900">
              {sponsor.fullName?.firstName} {sponsor.fullName?.middleName} {sponsor.fullName?.lastName}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{sponsor.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Mobile Number</label>
            <p className="text-gray-900">{sponsor.mobileNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Telephone</label>
            <p className="text-gray-900">{sponsor.telephone || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Gender</label>
            <p className="text-gray-900 capitalize">{sponsor.gender}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Age</label>
            <p className="text-gray-900">{sponsor.age}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Civil Status</label>
            <p className="text-gray-900 capitalize">{sponsor.civilStatus}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Nationality</label>
            <p className="text-gray-900">{sponsor.nationality}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Date of Birth</label>
            <p className="text-gray-900">{new Date(sponsor.dateOfBirth).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Place of Birth</label>
            <p className="text-gray-900">{sponsor.placeOfBirth}</p>
          </div>
        </div>

        {/* Employment Information */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <Briefcase className="h-4 w-4 mr-2" />
            Employment Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nature of Work</label>
              <p className="text-gray-900">{sponsor.natureOfWork}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Employment Type</label>
              <p className="text-gray-900">{sponsor.employmentType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Source of Income</label>
              <p className="text-gray-900">{sponsor.sourceOfIncome}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">ID Type</label>
              <p className="text-gray-900">{sponsor.idDetails?.idType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">ID Number</label>
              <p className="text-gray-900">{sponsor.idDetails?.idNumber}</p>
            </div>
          </div>
        </div>

        {/* Address Information */}
        {sponsor.address && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Address Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Country</label>
                <p className="text-gray-900">{sponsor.address.country}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Province</label>
                <p className="text-gray-900">{sponsor.address.province}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">City</label>
                <p className="text-gray-900">{sponsor.address.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Barangay</label>
                <p className="text-gray-900">{sponsor.address.barangay}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Street</label>
                <p className="text-gray-900">{sponsor.address.street}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">ZIP Code</label>
                <p className="text-gray-900">{sponsor.address.zipCode}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCorporateSponsorDetails = () => {
    if (!verification.corporateSponsor) return null;
    const sponsor = verification.corporateSponsor;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Corporate Name</label>
            <p className="text-gray-900">{sponsor.corporateName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Organization Type</label>
            <p className="text-gray-900">{sponsor.organizationType}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Industry Sector</label>
            <p className="text-gray-900">{sponsor.industrySector}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Registration Number</label>
            <p className="text-gray-900">{sponsor.registrationNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">TIN</label>
            <p className="text-gray-900">{sponsor.tin}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Date of Incorporation</label>
            <p className="text-gray-900">{new Date(sponsor.dateOfIncorporation).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Country of Registration</label>
            <p className="text-gray-900">{sponsor.countryOfRegistration}</p>
          </div>
        </div>

        {/* Authorized Representative */}
        {sponsor.authorizedRepresentative && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Authorized Representative
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <p className="text-gray-900">{sponsor.authorizedRepresentative.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Position</label>
                <p className="text-gray-900">{sponsor.authorizedRepresentative.position}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{sponsor.authorizedRepresentative.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Contact Number</label>
                <p className="text-gray-900">{sponsor.authorizedRepresentative.contactNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nationality</label>
                <p className="text-gray-900">{sponsor.authorizedRepresentative.nationality}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">ID Type</label>
                <p className="text-gray-900">{sponsor.authorizedRepresentative.idType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">ID Number</label>
                <p className="text-gray-900">{sponsor.authorizedRepresentative.idNumber}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSchoolDetails = () => {
    if (!verification.school) return null;
    const school = verification.school;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">School Name</label>
            <p className="text-gray-900">{school.schoolName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">School Type</label>
            <p className="text-gray-900">{school.schoolType}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Official Email</label>
            <p className="text-gray-900">{school.officialEmail}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Website</label>
            <p className="text-gray-900">{school.website || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">TIN</label>
            <p className="text-gray-900">{school.businessVerification?.tin}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">School ID Number</label>
            <p className="text-gray-900">{school.businessVerification?.schoolIdNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Accreditation Certificate</label>
            <p className="text-gray-900">{school.businessVerification?.accreditationCertificate || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Business Permit</label>
            <p className="text-gray-900">{school.businessVerification?.businessPermit || 'N/A'}</p>
          </div>
        </div>

        {/* Contact Numbers */}
        {school.contactNumbers && school.contactNumbers.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Contact Numbers
            </h4>
            <div className="space-y-2">
              {school.contactNumbers.map((number: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Contact {index + 1}:</span>
                  <span className="text-gray-900">{number}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campus Address */}
        {school.campusAddress && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Campus Address
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Country</label>
                <p className="text-gray-900">{school.campusAddress.country}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Province</label>
                <p className="text-gray-900">{school.campusAddress.province}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">City</label>
                <p className="text-gray-900">{school.campusAddress.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Barangay</label>
                <p className="text-gray-900">{school.campusAddress.barangay}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Street</label>
                <p className="text-gray-900">{school.campusAddress.street}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">ZIP Code</label>
                <p className="text-gray-900">{school.campusAddress.zipCode}</p>
              </div>
            </div>
          </div>
        )}

        {/* Authorized Representative */}
        {school.authorizedRepresentative && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Authorized Representative
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <p className="text-gray-900">{school.authorizedRepresentative.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Position</label>
                <p className="text-gray-900">{school.authorizedRepresentative.position}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{school.authorizedRepresentative.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Contact Number</label>
                <p className="text-gray-900">{school.authorizedRepresentative.contactNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nationality</label>
                <p className="text-gray-900">{school.authorizedRepresentative.nationality}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">ID Type</label>
                <p className="text-gray-900">{school.authorizedRepresentative.idType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">ID Number</label>
                <p className="text-gray-900">{school.authorizedRepresentative.idNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">School Employee ID</label>
                <p className="text-gray-900">{school.authorizedRepresentative.schoolId}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getPersonaTitle = () => {
    switch (verification.personaType) {
      case "student":
        return "Student Information";
      case "sponsor":
        return "Sponsor Information";
      case "school":
        return "School Information";
      default:
        return "Information";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          {verification.personaType === "student" && <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />}
          {verification.personaType === "sponsor" && <Users className="h-5 w-5 mr-2 text-green-600" />}
          {verification.personaType === "school" && <Building className="h-5 w-5 mr-2 text-purple-600" />}
          {getPersonaTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {verification.personaType === "student" && renderStudentDetails()}
        {verification.personaType === "sponsor" && renderIndividualSponsorDetails()}
        {verification.personaType === "school" && renderSchoolDetails()}
      </CardContent>
    </Card>
  );
};

