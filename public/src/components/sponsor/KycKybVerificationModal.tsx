'use client';

import React, { useState } from 'react';
import { CheckCircle, User, MapPin, Briefcase, FileText, Shield, X, AlertCircle, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function KycKybVerificationModal({ isOpen = true, onClose = () => {} }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [subrole, setSubrole] = useState('individual');
  const [formData, setFormData] = useState({
    firstName: '', middleName: '', lastName: '', email: '', mobileNumber: '', telephoneNumber: '',
    gender: '', age: '', civilStatus: '', placeOfBirth: '', dateOfBirth: '', nationality: '',
    country: '', province: '', city: '', barangay: '', street: '', zipCode: '',
    natureOfWork: '', employmentType: '', sourceOfIncome: '',
    proofOfIncome: null, governmentIdType: '', idNumber: '', governmentIdFront: null, governmentIdBack: null,
    corporateName: '', organizationType: '', industrySector: '', registrationNumber: '', tinNumber: '',
    dateOfIncorporation: '', countryOfRegistration: '',
    repFullName: '', repPosition: '', repEmail: '', repContactNumber: '', repNationality: '',
    repGovernmentIdType: '', repIdNumber: '', repGovernmentIdFront: null, repGovernmentIdBack: null,
    companyLogo: null, certificateOfBusinessRegistration: null, articlesOfIncorporation: null,
    boardResolution: null, generalInformationSheet: null,
    consent: false,
  });
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const steps = subrole === 'individual' ? [
    { title: 'Personal Info', icon: User },
    { title: 'Address', icon: MapPin },
    { title: 'Employment Info', icon: Briefcase },
    { title: 'Documents', icon: FileText },
    { title: 'Declaration', icon: Shield },
  ] : [
    { title: 'Company Info', icon: Building },
    { title: 'Representative', icon: User },
    { title: 'Documents', icon: FileText },
    { title: 'Declaration', icon: Shield },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };

  const validateStep = () => {
    const requiredFields = subrole === 'individual' ? {
      1: ['firstName', 'lastName', 'email', 'mobileNumber', 'gender', 'age', 'civilStatus', 'placeOfBirth', 'dateOfBirth', 'nationality'],
      2: ['country', 'province', 'city', 'barangay', 'street', 'zipCode'],
      3: ['natureOfWork', 'employmentType', 'sourceOfIncome'],
      4: ['proofOfIncome', 'governmentIdType', 'idNumber', 'governmentIdFront', 'governmentIdBack'],
      5: ['consent'],
    } : {
      1: ['corporateName', 'organizationType', 'industrySector', 'registrationNumber', 'tinNumber', 'dateOfIncorporation', 'countryOfRegistration'],
      2: ['repFullName', 'repPosition', 'repEmail', 'repContactNumber', 'repNationality', 'repGovernmentIdType', 'repIdNumber', 'repGovernmentIdFront', 'repGovernmentIdBack'],
      3: ['companyLogo', 'certificateOfBusinessRegistration', 'articlesOfIncorporation', 'boardResolution'],
      4: ['consent'],
    };

    const missingFields = requiredFields[currentStep].filter(field => 
      !formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')
    );

    if (missingFields.length > 0) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Missing required fields',
      });
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
      return false;
    }
    setNotification({ show: false, type: '', message: '' });
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep === steps.length) {
        handleSubmit();
      } else {
        setCurrentStep((curr) => curr + 1);
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.consent) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Consent required',
      });
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
      return;
    }
    console.log('Form submitted:', formData);
    onClose();
  };

  // Step rendering functions (unchanged from previous)
  const renderPersonalInfo = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="text-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <User className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Personal Info</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name *</Label>
          <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Enter first name" required />
        </div>
        <div>
          <Label htmlFor="middleName" className="text-sm font-medium text-gray-700">Middle Name</Label>
          <Input id="middleName" name="middleName" value={formData.middleName} onChange={handleInputChange} placeholder="Enter middle name" />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name *</Label>
          <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Enter last name" required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email" required />
        </div>
        <div>
          <Label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700">Mobile Number *</Label>
          <Input id="mobileNumber" name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleInputChange} placeholder="Enter mobile number" required />
        </div>
        <div>
          <Label htmlFor="telephoneNumber" className="text-sm font-medium text-gray-700">Telephone Number</Label>
          <Input id="telephoneNumber" name="telephoneNumber" type="tel" value={formData.telephoneNumber} onChange={handleInputChange} placeholder="Enter telephone number" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender *</Label>
          <Select name="gender" value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)} required>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="age" className="text-sm font-medium text-gray-700">Age *</Label>
          <Input id="age" name="age" type="number" value={formData.age} onChange={handleInputChange} placeholder="Enter age" required />
        </div>
        <div>
          <Label htmlFor="civilStatus" className="text-sm font-medium text-gray-700">Civil Status *</Label>
          <Select name="civilStatus" value={formData.civilStatus} onValueChange={(value) => handleSelectChange('civilStatus', value)} required>
            <SelectTrigger id="civilStatus">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label htmlFor="placeOfBirth" className="text-sm font-medium text-gray-700">Place of Birth *</Label>
          <Input id="placeOfBirth" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleInputChange} placeholder="Enter place of birth" required />
        </div>
        <div>
          <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">Date of Birth *</Label>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} required />
        </div>
        <div>
          <Label htmlFor="nationality" className="text-sm font-medium text-gray-700">Nationality *</Label>
          <Input id="nationality" name="nationality" value={formData.nationality} onChange={handleInputChange} placeholder="Enter nationality" required />
        </div>
      </div>
    </div>
  );

  const renderAddress = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="text-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Address</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country *</Label>
          <Input id="country" name="country" value={formData.country} onChange={handleInputChange} placeholder="Enter country" required />
        </div>
        <div>
          <Label htmlFor="province" className="text-sm font-medium text-gray-700">Province *</Label>
          <Input id="province" name="province" value={formData.province} onChange={handleInputChange} placeholder="Enter province" required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="city" className="text-sm font-medium text-gray-700">City/Municipality *</Label>
          <Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="Enter city/municipality" required />
        </div>
        <div>
          <Label htmlFor="barangay" className="text-sm font-medium text-gray-700">Barangay *</Label>
          <Input id="barangay" name="barangay" value={formData.barangay} onChange={handleInputChange} placeholder="Enter barangay" required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="street" className="text-sm font-medium text-gray-700">Street *</Label>
          <Input id="street" name="street" value={formData.street} onChange={handleInputChange} placeholder="Enter street" required />
        </div>
        <div>
          <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">Zip Code *</Label>
          <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="Enter zip code" required />
        </div>
      </div>
    </div>
  );

  const renderEmploymentInfo = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="text-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Employment Info</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label htmlFor="natureOfWork" className="text-sm font-medium text-gray-700">Nature of Work *</Label>
          <Input id="natureOfWork" name="natureOfWork" value={formData.natureOfWork} onChange={handleInputChange} placeholder="Enter nature of work" required />
        </div>
        <div>
          <Label htmlFor="employmentType" className="text-sm font-medium text-gray-700">Employment Type *</Label>
          <Select name="employmentType" value={formData.employmentType} onValueChange={(value) => handleSelectChange('employmentType', value)} required>
            <SelectTrigger id="employmentType">
              <SelectValue placeholder="Select employment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-Time</SelectItem>
              <SelectItem value="part-time">Part-Time</SelectItem>
              <SelectItem value="self-employed">Self-Employed</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sourceOfIncome" className="text-sm font-medium text-gray-700">Source of Income *</Label>
          <Input id="sourceOfIncome" name="sourceOfIncome" value={formData.sourceOfIncome} onChange={handleInputChange} placeholder="Enter source of income" required />
        </div>
      </div>
    </div>
  );

  const renderIndividualDocuments = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="text-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Documents</h3>
      </div>
      <div className="space-y-3">
        <div className="p-3 bg-amber-50 rounded-md">
          <Label htmlFor="proofOfIncome" className="text-sm font-medium text-gray-800">Proof of Income *</Label>
          <input
            id="proofOfIncome"
            type="file"
            name="proofOfIncome"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            required
          />
          {formData.proofOfIncome && <p className="text-xs text-gray-600 mt-1">Uploaded: {formData.proofOfIncome.name}</p>}
        </div>
        <div className="p-3 bg-orange-50 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="governmentIdType" className="text-sm font-medium text-gray-800">Government ID Type *</Label>
              <Select name="governmentIdType" value={formData.governmentIdType} onValueChange={(value) => handleSelectChange('governmentIdType', value)} required>
                <SelectTrigger id="governmentIdType">
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="driverLicense">Driver's License</SelectItem>
                  <SelectItem value="nationalId">National ID</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="idNumber" className="text-sm font-medium text-gray-800">ID Number *</Label>
              <Input id="idNumber" name="idNumber" value={formData.idNumber} onChange={handleInputChange} placeholder="Enter ID number" required />
            </div>
          </div>
        </div>
        <div className="p-3 bg-orange-50 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="governmentIdFront" className="text-sm font-medium text-gray-800">Government ID (Front) *</Label>
              <input
                id="governmentIdFront"
                type="file"
                name="governmentIdFront"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                required
              />
              {formData.governmentIdFront && <p className="text-xs text-gray-600 mt-1">Uploaded: {formData.governmentIdFront.name}</p>}
            </div>
            <div>
              <Label htmlFor="governmentIdBack" className="text-sm font-medium text-gray-800">Government ID (Back) *</Label>
              <input
                id="governmentIdBack"
                type="file"
                name="governmentIdBack"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                required
              />
              {formData.governmentIdBack && <p className="text-xs text-gray-600 mt-1">Uploaded: {formData.governmentIdBack.name}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompanyInfo = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="text-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <Building className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Company Info</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="corporateName" className="text-sm font-medium text-gray-700">Corporate Name *</Label>
          <Input id="corporateName" name="corporateName" value={formData.corporateName} onChange={handleInputChange} placeholder="Enter corporate name" required />
        </div>
        <div>
          <Label htmlFor="organizationType" className="text-sm font-medium text-gray-700">Organization Type *</Label>
          <Select name="organizationType" value={formData.organizationType} onValueChange={(value) => handleSelectChange('organizationType', value)} required>
            <SelectTrigger id="organizationType">
              <SelectValue placeholder="Select organization type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="corporation">Corporation</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="non-profit">Non-Profit</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="industrySector" className="text-sm font-medium text-gray-700">Industry Sector *</Label>
          <Input id="industrySector" name="industrySector" value={formData.industrySector} onChange={handleInputChange} placeholder="Enter industry sector" required />
        </div>
        <div>
          <Label htmlFor="registrationNumber" className="text-sm font-medium text-gray-700">Registration Number *</Label>
          <Input id="registrationNumber" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} placeholder="Enter registration number" required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="tinNumber" className="text-sm font-medium text-gray-700">TIN Number *</Label>
          <Input id="tinNumber" name="tinNumber" value={formData.tinNumber} onChange={handleInputChange} placeholder="Enter TIN number" required />
        </div>
        <div>
          <Label htmlFor="dateOfIncorporation" className="text-sm font-medium text-gray-700">Date of Incorporation *</Label>
          <Input id="dateOfIncorporation" name="dateOfIncorporation" type="date" value={formData.dateOfIncorporation} onChange={handleInputChange} required />
        </div>
      </div>
      <div>
        <Label htmlFor="countryOfRegistration" className="text-sm font-medium text-gray-700">Country of Registration *</Label>
        <Input id="countryOfRegistration" name="countryOfRegistration" value={formData.countryOfRegistration} onChange={handleInputChange} placeholder="Enter country" required />
      </div>
    </div>
  );

  const renderAuthorizedRepresentative = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="text-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <User className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Authorized Representative</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="repFullName" className="text-sm font-medium text-gray-700">Full Name *</Label>
          <Input id="repFullName" name="repFullName" value={formData.repFullName} onChange={handleInputChange} placeholder="Enter full name" required />
        </div>
        <div>
          <Label htmlFor="repPosition" className="text-sm font-medium text-gray-700">Position *</Label>
          <Input id="repPosition" name="repPosition" value={formData.repPosition} onChange={handleInputChange} placeholder="Enter position" required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="repEmail" className="text-sm font-medium text-gray-700">Email Address *</Label>
          <Input id="repEmail" name="repEmail" type="email" value={formData.repEmail} onChange={handleInputChange} placeholder="Enter email" required />
        </div>
        <div>
          <Label htmlFor="repContactNumber" className="text-sm font-medium text-gray-700">Contact Number *</Label>
          <Input id="repContactNumber" name="repContactNumber" type="tel" value={formData.repContactNumber} onChange={handleInputChange} placeholder="Enter contact number" required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="repNationality" className="text-sm font-medium text-gray-700">Nationality *</Label>
          <Input id="repNationality" name="repNationality" value={formData.repNationality} onChange={handleInputChange} placeholder="Enter nationality" required />
        </div>
        <div>
          <Label htmlFor="repGovernmentIdType" className="text-sm font-medium text-gray-700">Government ID Type *</Label>
          <Select name="repGovernmentIdType" value={formData.repGovernmentIdType} onValueChange={(value) => handleSelectChange('repGovernmentIdType', value)} required>
            <SelectTrigger id="repGovernmentIdType">
              <SelectValue placeholder="Select ID type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="driverLicense">Driver's License</SelectItem>
              <SelectItem value="nationalId">National ID</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="repIdNumber" className="text-sm font-medium text-gray-700">ID Number *</Label>
          <Input id="repIdNumber" name="repIdNumber" value={formData.repIdNumber} onChange={handleInputChange} placeholder="Enter ID number" required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="repGovernmentIdFront" className="text-sm font-medium text-gray-800">Government ID (Front) *</Label>
          <input
            id="repGovernmentIdFront"
            type="file"
            name="repGovernmentIdFront"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            required
          />
          {formData.repGovernmentIdFront && <p className="text-xs text-gray-600 mt-1">Uploaded: {formData.repGovernmentIdFront.name}</p>}
        </div>
        <div>
          <Label htmlFor="repGovernmentIdBack" className="text-sm font-medium text-gray-800">Government ID (Back) *</Label>
          <input
            id="repGovernmentIdBack"
            type="file"
            name="repGovernmentIdBack"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            required
          />
          {formData.repGovernmentIdBack && <p className="text-xs text-gray-600 mt-1">Uploaded: {formData.repGovernmentIdBack.name}</p>}
        </div>
      </div>
    </div>
  );

  const renderCorporateDocuments = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="text-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Documents</h3>
      </div>
      <div className="space-y-3">
        <div className="p-3 bg-amber-50 rounded-md">
          <Label htmlFor="companyLogo" className="text-sm font-medium text-gray-800">Company Logo *</Label>
          <input
            id="companyLogo"
            type="file"
            name="companyLogo"
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png"
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            required
          />
          {formData.companyLogo && <p className="text-xs text-gray-600 mt-1">Uploaded: {formData.companyLogo.name}</p>}
        </div>
        <div className="p-3 bg-orange-50 rounded-md">
          <Label htmlFor="certificateOfBusinessRegistration" className="text-sm font-medium text-gray-800">Certificate of Business Registration *</Label>
          <input
            id="certificateOfBusinessRegistration"
            type="file"
            name="certificateOfBusinessRegistration"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            required
          />
          {formData.certificateOfBusinessRegistration && <p className="text-xs text-gray-600 mt-1">Uploaded: {formData.certificateOfBusinessRegistration.name}</p>}
        </div>
        <div className="p-3 bg-orange-50 rounded-md">
          <Label htmlFor="articlesOfIncorporation" className="text-sm font-medium text-gray-800">Articles of Incorporation *</Label>
          <input
            id="articlesOfIncorporation"
            type="file"
            name="articlesOfIncorporation"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            required
          />
          {formData.articlesOfIncorporation && <p className="text-xs text-gray-600 mt-1">Uploaded: {formData.articlesOfIncorporation.name}</p>}
        </div>
        <div className="p-3 bg-orange-50 rounded-md">
          <Label htmlFor="boardResolution" className="text-sm font-medium text-gray-800">Board Resolution *</Label>
          <input
            id="boardResolution"
            type="file"
            name="boardResolution"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            required
          />
          {formData.boardResolution && <p className="text-xs text-gray-600 mt-1">Uploaded: {formData.boardResolution.name}</p>}
        </div>
        <div className="p-3 bg-orange-50 rounded-md">
          <Label htmlFor="generalInformationSheet" className="text-sm font-medium text-gray-800">General Information Sheet (Optional)</Label>
          <input
            id="generalInformationSheet"
            type="file"
            name="generalInformationSheet"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
          />
          {formData.generalInformationSheet && <p className="text-xs text-gray-600 mt-1">Uploaded: {formData.generalInformationSheet.name}</p>}
        </div>
      </div>
    </div>
  );

  const renderDeclarationConsent = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="text-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Declaration & Consent</h3>
      </div>
      <div className="p-3 bg-rose-50 rounded-md">
        <p className="text-xs text-gray-700 mb-3">
          I declare that all information provided is true and accurate. I understand that false information may lead to application rejection. I consent to the collection, processing, and storage of my personal and/or corporate data for KYC/KYB verification per applicable laws.
        </p>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="consent"
            name="consent"
            checked={formData.consent}
            onCheckedChange={(checked) => handleSelectChange('consent', checked)}
            className="h-4 w-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
            required
          />
          <Label htmlFor="consent" className="text-xs text-gray-700">I agree to the terms and conditions *</Label>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-4 py-3 text-white flex justify-between items-center">
          <h2 className="text-lg font-semibold">KYC/KYB Verification</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Temporary toggle for testing subrole */}
        <div className="px-4 py-2 bg-gray-100">
          <Label htmlFor="subrole" className="text-sm font-medium text-gray-700">Sponsor Type (Testing)</Label>
          <Select value={subrole} onValueChange={(value) => { setSubrole(value); setCurrentStep(1); setFormData({ ...formData, consent: false }); }}>
            <SelectTrigger id="subrole">
              <SelectValue placeholder="Select sponsor type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="px-4 py-3 bg-gray-50">
          <div className="flex justify-center items-center">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > index + 1;
              const isCurrent = currentStep === index + 1;
              return (
                <div key={step.title} className="flex items-center">
                  <div className="flex flex-col items-center mx-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : isCurrent ? 'bg-indigo-500 border-indigo-500 text-white animate-pulse' : 'bg-gray-200 border-gray-300 text-gray-600'}`}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                    </div>
                    <p className={`text-xs font-medium text-center ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-emerald-600' : 'text-gray-500'}`}>{step.title}</p>
                  </div>
                  {index < steps.length - 1 && <div className={`w-8 h-1 rounded-full ${isCompleted || isCurrent ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
                </div>
              );
            })}
          </div>
        </div>
        <div className="px-4 py-4 overflow-y-auto max-h-[60vh]">
          {subrole === 'individual' ? (
            <>
              {currentStep === 1 && renderPersonalInfo()}
              {currentStep === 2 && renderAddress()}
              {currentStep === 3 && renderEmploymentInfo()}
              {currentStep === 4 && renderIndividualDocuments()}
              {currentStep === 5 && renderDeclarationConsent()}
            </>
          ) : (
            <>
              {currentStep === 1 && renderCompanyInfo()}
              {currentStep === 2 && renderAuthorizedRepresentative()}
              {currentStep === 3 && renderCorporateDocuments()}
              {currentStep === 4 && renderDeclarationConsent()}
            </>
          )}
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center min-h-[60px]">
          <button
            onClick={() => setCurrentStep((curr) => curr - 1)}
            disabled={currentStep === 1}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all border border-blue-500 ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                : 'bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-600'
            }`}
            style={{ minWidth: '100px', visibility: 'visible' }}
            aria-label="Previous step"
          >
            Previous
          </button>
          <p className="text-xs text-gray-500 font-medium">Step {currentStep} of {steps.length}</p>
          <button
            onClick={handleNext}
            disabled={currentStep === steps.length && !formData.consent}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              currentStep === steps.length && !formData.consent
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 border-transparent'
            } border`}
            style={{ minWidth: '100px', visibility: 'visible' }}
            aria-label={currentStep === steps.length ? 'Complete form' : 'Next step'}
          >
            {currentStep === steps.length ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 1, x: 500 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 500 }}
            transition={{
              type: 'spring',
              stiffness: 900,
              damping: 25,
              duration: 0.2,
            }}
            className="fixed w-[325px] flex justify-end items-center h-[55px] bottom-5 right-5 rounded-[10px] bg-red-500 rounded-md shadow-xl z-50"
          >
            <div className="flex gap-3 items-center w-[320px] h-[55px] bg-gray-50 rounded-[5px] border-white px-3 py-2">
              <div>
                <AlertCircle width={23} height={23} className="text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-[14px] text-gray-900">Error</p>
                <p className="text-[12px] text-gray-700">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification({ show: false, type: '', message: '' })}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
}