'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, User, MapPin, Briefcase, FileText, Shield, X, AlertCircle, Building, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useKycKybConfiguration } from '@/hooks/useKycKybConfiguration';
import { kycKybService } from '@/services/kycKybService';
import { Progress } from '@/components/ui/progress';

// Types for better clarity
interface FormData {
  [key: string]: string | boolean | File | null;
}

interface StepConfig {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  fields: Array<{ name: string; label: string; type: string; required?: boolean; options?: string[] }>;
  render?: () => React.JSX.Element;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Loading Spinner Component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
    <span className="ml-2 text-sm text-gray-600">{message}</span>
  </div>
);

// Step Header Component
const StepHeader = ({ step, icon: Icon, gradient }) => (
  <div className="text-center mb-4">
    <div className={`w-10 h-10 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center mx-auto mb-2`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800">{step}</h3>
  </div>
);

// File Upload Progress Component
const FileUploadProgress = ({ progress }: { progress: number }) => (
  progress > 0 && progress < 100 ? (
    <div className="mt-2">
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-gray-500 mt-1">{progress}% uploaded</p>
    </div>
  ) : null
);

// Form Field Component
const FormField = ({
  field,
  value,
  onChange,
  onFileChange,
  options,
  isLoading,
  error,
  uploadProgress,
}: {
  field: { name: string; label: string; type: string; required?: boolean; options?: string[] };
  value: string | boolean | File | null;
  onChange: (name: string, value: string | boolean) => void;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options?: string[];
  isLoading?: boolean;
  error?: string;
  uploadProgress?: number;
}) => (
  <div>
    <Label htmlFor={field.name} className="text-sm font-medium text-gray-700 block mb-2">
      {field.label} {field.required && '*'}
    </Label>
    {field.type === 'select' && options ? (
      <Select name={field.name} value={value as string} onValueChange={(val) => onChange(field.name, val)} required={field.required}>
        <SelectTrigger id={field.name}>
          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>Loading options...</SelectItem>
          ) : error ? (
            <SelectItem value="error" disabled>Error loading options</SelectItem>
          ) : options.length === 0 ? (
            <SelectItem value="none" disabled>No options available</SelectItem>
          ) : (
            options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    ) : field.type === 'file' ? (
      <div className="border rounded-md p-3 bg-gray-50">
        <input
          id={field.name}
          type="file"
          name={field.name}
          onChange={onFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
          className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all bg-white"
          required={field.required}
        />
        {value && value instanceof File && (
          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
            <p className="text-xs text-green-700 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Uploaded: {value.name}
            </p>
          </div>
        )}
        <FileUploadProgress progress={uploadProgress || 0} />
      </div>
    ) : field.type === 'checkbox' ? (
      <Checkbox
        id={field.name}
        name={field.name}
        checked={value as boolean}
        onCheckedChange={(checked) => onChange(field.name, checked)}
        className="h-4 w-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
        required={field.required}
      />
    ) : (
      <Input
        id={field.name}
        name={field.name}
        type={field.type}
        value={value as string}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={`Enter ${field.label.toLowerCase()}`}
        required={field.required}
      />
    )}
  </div>
);

// Notification Toast Component
const NotificationToast = ({ notification, onClose }) => (
  <AnimatePresence>
    {notification.show && (
      <motion.div
        initial={{ opacity: 1, x: 500 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 500 }}
        transition={{ type: 'spring', stiffness: 900, damping: 25, duration: 0.2 }}
        className={`fixed w-[325px] flex justify-end items-center h-[55px] bottom-5 right-5 rounded-[10px] ${
          notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        } rounded-md shadow-xl z-50`}
      >
        <div className="flex gap-3 items-center w-[320px] h-[55px] bg-gray-50 rounded-[5px] border-white px-3 py-2">
          {notification.type === 'success' ? (
            <CheckCircle width={23} height={23} className="text-emerald-500" />
          ) : (
            <AlertCircle width={23} height={23} className="text-red-500" />
          )}
          <div>
            <p className={`font-semibold text-[14px] text-gray-900`}>
              {notification.type === 'success' ? 'Success' : 'Error'}
            </p>
            <p className="text-[12px] text-gray-700">{notification.message}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Main Modal Component
export default function KycKybVerificationModal({ isOpen = true, onClose = () => {} }) {
  const { user } = useAuth();
  const kycKybConfig = useKycKybConfiguration();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subrole, setSubrole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '', middleName: '', lastName: '', email: '', mobileNumber: '', telephoneNumber: '',
    gender: '', age: '', civilStatus: '', placeOfBirth: '', dateOfBirth: '', nationality: '',
    country: '', province: '', city: '', barangay: '', street: '', zipCode: '',
    natureOfWork: '', employmentType: '', sourceOfIncome: '', proofOfIncome: null,
    governmentIdType: '', idNumber: '', governmentIdFront: null, governmentIdBack: null,
    corporateName: '', organizationType: '', industrySector: '', registrationNumber: '',
    tinNumber: '', dateOfIncorporation: '', countryOfRegistration: '',
    repFullName: '', repPosition: '', repEmail: '', repContactNumber: '', repNationality: '',
    repGovernmentIdType: '', repIdNumber: '', repGovernmentIdFront: null, repGovernmentIdBack: null,
    companyLogo: null, certificateOfBusinessRegistration: null, articlesOfIncorporation: null,
    boardResolution: null, generalInformationSheet: null, consent: false,
  });
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch user profile');
        const data = await response.json();
        if (data.user?.persona?.subRole) setSubrole(data.user.persona.subRole);
      } catch (err) {
        setError('Failed to load user profile');
        showNotification('error', 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    if (type === 'error') {
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    }
  };

  // Step configurations
  const individualSteps: StepConfig[] = [
    {
      title: 'Personal Info',
      icon: User,
      gradient: 'from-indigo-500 to-purple-600',
      fields: [
        { name: 'firstName', label: 'First Name', type: 'text', required: true },
        { name: 'middleName', label: 'Middle Name', type: 'text' },
        { name: 'lastName', label: 'Last Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'mobileNumber', label: 'Mobile Number', type: 'tel', required: true },
        { name: 'telephoneNumber', label: 'Telephone Number', type: 'tel' },
        { name: 'gender', label: 'Gender', type: 'select', required: true, options: ['male', 'female', 'other'] },
        { name: 'age', label: 'Age', type: 'number', required: true },
        { name: 'civilStatus', label: 'Civil Status', type: 'select', required: true, options: ['single', 'married', 'divorced', 'widowed'] },
        { name: 'placeOfBirth', label: 'Place of Birth', type: 'text', required: true },
        { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
        { name: 'nationality', label: 'Nationality', type: 'text', required: true },
      ],
    },
    {
      title: 'Address',
      icon: MapPin,
      gradient: 'from-teal-500 to-cyan-600',
      fields: [
        { name: 'country', label: 'Country', type: 'text', required: true },
        { name: 'province', label: 'Province', type: 'text', required: true },
        { name: 'city', label: 'City/Municipality', type: 'text', required: true },
        { name: 'barangay', label: 'Barangay', type: 'text', required: true },
        { name: 'street', label: 'Street', type: 'text', required: true },
        { name: 'zipCode', label: 'Zip Code', type: 'text', required: true },
      ],
    },
    {
      title: 'Employment Info',
      icon: Briefcase,
      gradient: 'from-violet-500 to-fuchsia-600',
      fields: [
        { name: 'natureOfWork', label: 'Nature of Work', type: 'select', required: true, options: kycKybConfig.natureOfWork },
        { name: 'employmentType', label: 'Employment Type', type: 'select', required: true, options: kycKybConfig.employmentType },
        { name: 'sourceOfIncome', label: 'Source of Income', type: 'select', required: true, options: kycKybConfig.sourceOfIncome },
      ],
    },
    {
      title: 'Documents',
      icon: FileText,
      gradient: 'from-amber-500 to-orange-600',
      fields: [
        { name: 'governmentIdType', label: 'Government ID Type', type: 'select', required: true, options: kycKybConfig.idTypes },
        { name: 'idNumber', label: 'ID Number', type: 'text', required: true },
        { name: 'governmentIdFront', label: 'Government ID (Front)', type: 'file', required: true },
        { name: 'governmentIdBack', label: 'Government ID (Back)', type: 'file', required: true },
        { name: 'proofOfIncome', label: 'Proof of Income', type: 'file', required: true },
      ],
    },
    {
      title: 'Declaration',
      icon: Shield,
      gradient: 'from-rose-500 to-pink-600',
      fields: [{ name: 'consent', label: 'I agree to the terms and conditions', type: 'checkbox', required: true }],
      render: () => (
        <div className="space-y-4 animate-fadeIn">
          <StepHeader step="Declaration & Consent" icon={Shield} gradient="from-rose-500 to-pink-600" />
          <div className="p-3 bg-rose-50 rounded-md">
            <p className="text-xs text-gray-700 mb-3">
              I declare that all information provided is true and accurate. I understand that false information may lead to
              application rejection. I consent to the collection, processing, and storage of my personal and/or corporate data
              for KYC/KYB verification per applicable laws.
            </p>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent"
                name="consent"
                checked={formData.consent as boolean}
                onCheckedChange={(checked) => handleChange('consent', checked)}
                className="h-4 w-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                required
              />
              <Label htmlFor="consent" className="text-xs text-gray-700">
                I agree to the terms and conditions *
              </Label>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const corporateSteps: StepConfig[] = [
    {
      title: 'Company Info',
      icon: Building,
      gradient: 'from-indigo-500 to-purple-600',
      fields: [
        { name: 'corporateName', label: 'Corporate Name', type: 'text', required: true },
        { name: 'organizationType', label: 'Organization Type', type: 'select', required: true, options: kycKybConfig.organizationType },
        { name: 'industrySector', label: 'Industry Sector', type: 'select', required: true, options: kycKybConfig.industrySector },
        { name: 'registrationNumber', label: 'Registration Number', type: 'text', required: true },
        { name: 'tinNumber', label: 'TIN Number', type: 'text', required: true },
        { name: 'dateOfIncorporation', label: 'Date of Incorporation', type: 'date', required: true },
        { name: 'countryOfRegistration', label: 'Country of Registration', type: 'text', required: true },
      ],
    },
    {
      title: 'Representative',
      icon: User,
      gradient: 'from-teal-500 to-cyan-600',
      fields: [
        { name: 'repFullName', label: 'Full Name', type: 'text', required: true },
        { name: 'repPosition', label: 'Position', type: 'text', required: true },
        { name: 'repEmail', label: 'Email Address', type: 'email', required: true },
        { name: 'repContactNumber', label: 'Contact Number', type: 'tel', required: true },
        { name: 'repNationality', label: 'Nationality', type: 'text', required: true },
        { name: 'repGovernmentIdType', label: 'Government ID Type', type: 'select', required: true, options: kycKybConfig.idTypes },
        { name: 'repIdNumber', label: 'ID Number', type: 'text', required: true },
      ],
    },
    {
      title: 'Documents',
      icon: FileText,
      gradient: 'from-amber-500 to-orange-600',
      fields: [
        { name: 'repGovernmentIdFront', label: 'Representative Government ID (Front)', type: 'file', required: true },
        { name: 'repGovernmentIdBack', label: 'Representative Government ID (Back)', type: 'file', required: true },
        { name: 'companyLogo', label: 'Company Logo', type: 'file', required: true },
        { name: 'certificateOfBusinessRegistration', label: 'Certificate of Business Registration', type: 'file', required: true },
        { name: 'articlesOfIncorporation', label: 'Articles of Incorporation', type: 'file', required: true },
        { name: 'boardResolution', label: 'Board Resolution', type: 'file', required: true },
        { name: 'generalInformationSheet', label: 'General Information Sheet', type: 'file', required: false },
      ],
    },
    {
      title: 'Declaration',
      icon: Shield,
      gradient: 'from-rose-500 to-pink-600',
      fields: [{ name: 'consent', label: 'I agree to the terms and conditions', type: 'checkbox', required: true }],
      render: () => (
        <div className="space-y-4 animate-fadeIn">
          <StepHeader step="Declaration & Consent" icon={Shield} gradient="from-rose-500 to-pink-600" />
          <div className="p-3 bg-rose-50 rounded-md">
            <p className="text-xs text-gray-700 mb-3">
              I declare that all information provided is true and accurate. I understand that false information may lead to
              application rejection. I consent to the collection, processing, and storage of my personal and/or corporate data
              for KYC/KYB verification per applicable laws.
            </p>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent"
                name="consent"
                checked={formData.consent as boolean}
                onCheckedChange={(checked) => handleChange('consent', checked)}
                className="h-4 w-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                required
              />
              <Label htmlFor="consent" className="text-xs text-gray-700">
                I agree to the terms and conditions *
              </Label>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const steps = subrole === 'individual' ? individualSteps : corporateSteps;

  const handleChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;

    const file = files[0];
    setFormData((prev) => ({ ...prev, [name]: file }));
    
    // Optional: Set progress for visual feedback
    setUploadProgress((prev) => ({ ...prev, [name]: 100 }));
  };

  const validateStep = () => {
    const currentFields = steps[currentStep - 1].fields.filter((field) => field.required);
    const missingFields = currentFields.filter((field) => {
      const value = formData[field.name];
      if (typeof value === 'boolean') {
        return !value;
      }
      if (field.type === 'file') {
        return !value;
      }
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (missingFields.length > 0) {
      showNotification('error', 'Missing required fields');
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

  const handleSubmit = async () => {
    if (!formData.consent) {
      showNotification('error', 'Consent required');
      return;
    }

    try {
      setIsSubmitting(true);

      // First, upload documents if any
      const uploadedDocuments = [];
      
      // Helper function to upload a single document
      // const uploadDocument = async (file: File, documentType: string) => {
      //   if (file) {
      //     try {
      //       const response = await kycKybService.uploadDocument(file, documentType);
      //       return {
      //         type: documentType,
      //         fileName: response.document.fileName,
      //         fileUrl: response.document.fileUrl,
      //         uploadedAt: response.document.uploadedAt
      //       };
      //     } catch (error) {
      //       console.error(`Error uploading ${documentType}:`, error);
      //       throw new Error(`Failed to upload ${documentType}`);
      //     }
      //   }
      //   return null;
      // };

      if (subrole === 'individual') {
        // Upload individual sponsor documents
        // const proofOfIncomeDoc = await uploadDocument(formData.proofOfIncome as File, 'proof_of_income');
        // const idFrontDoc = await uploadDocument(formData.governmentIdFront as File, 'government_id_front');
        // const idBackDoc = await uploadDocument(formData.governmentIdBack as File, 'government_id_back');

        // Filter out null documents
        // const documents = [proofOfIncomeDoc, idFrontDoc, idBackDoc].filter(Boolean);

        // Structure data to match your model exactly
        const individualData = {
          declarationsAndConsent: formData.consent as boolean, // Boolean as per your model
          individualSponsor: {
            fullName: {
              firstName: formData.firstName as string,
              middleName: formData.middleName as string || '',
              lastName: formData.lastName as string
            },
            email: formData.email as string,
            mobileNumber: formData.mobileNumber as string,
            telephone: formData.telephoneNumber as string || '',
            gender: formData.gender as string,
            age: parseInt(formData.age as string),
            civilStatus: formData.civilStatus as string,
            nationality: formData.nationality as string,
            dateOfBirth: formData.dateOfBirth as string,
            placeOfBirth: formData.placeOfBirth as string,
            address: {
              country: formData.country as string,
              province: formData.province as string,
              city: formData.city as string,
              barangay: formData.barangay as string,
              street: formData.street as string,
              zipCode: formData.zipCode as string
            },
            natureOfWork: formData.natureOfWork as string,
            employmentType: formData.employmentType as string,
            sourceOfIncome: formData.sourceOfIncome as string,
            idDetails: {
              idType: formData.governmentIdType as string,
              idNumber: formData.idNumber as string
            }
          },
          // documents: documents
        };

        console.log('Submitting Individual Sponsor Data:', individualData);
        await kycKybService.submitIndividualSponsorKyb(individualData);

      } else {
        // Upload corporate sponsor documents
        // const companyLogoDoc = await uploadDocument(formData.companyLogo as File, 'company_logo');
        // const certBusinessRegDoc = await uploadDocument(formData.certificateOfBusinessRegistration as File, 'business_registration');
        // const articlesIncorpDoc = await uploadDocument(formData.articlesOfIncorporation as File, 'articles_of_incorporation');
        // const boardResolutionDoc = await uploadDocument(formData.boardResolution as File, 'board_resolution');
        // const generalInfoSheetDoc = await uploadDocument(formData.generalInformationSheet as File, 'gis');
        // const repIdFrontDoc = await uploadDocument(formData.repGovernmentIdFront as File, 'government_id_front');
        // const repIdBackDoc = await uploadDocument(formData.repGovernmentIdBack as File, 'government_id_back');

        // Filter out null documents
        // const documents = [
        //   companyLogoDoc,
        //   certBusinessRegDoc,
        //   articlesIncorpDoc,
        //   boardResolutionDoc,
        //   generalInfoSheetDoc,
        //   repIdFrontDoc,
        //   repIdBackDoc
        // ].filter(Boolean);

        // Structure data to match your model exactly
        const corporateData = {
          declarationsAndConsent: formData.consent as boolean, // Boolean as per your model
          corporateSponsor: {
            corporateName: formData.corporateName as string,
            organizationType: formData.organizationType as string,
            industrySector: formData.industrySector as string,
            registrationNumber: formData.registrationNumber as string,
            tin: formData.tinNumber as string,
            dateOfIncorporation: formData.dateOfIncorporation as string,
            countryOfRegistration: formData.countryOfRegistration as string,
            authorizedRepresentative: {
              fullName: formData.repFullName as string,
              position: formData.repPosition as string,
              email: formData.repEmail as string,
              contactNumber: formData.repContactNumber as string,
              nationality: formData.repNationality as string,
              idType: formData.repGovernmentIdType as string,
              idNumber: formData.repIdNumber as string
            }
          },
          // documents: documents
        };

        console.log('Submitting Corporate Sponsor Data:', corporateData);
        await kycKybService.submitCorporateSponsorKyb(corporateData);
      }

      showNotification('success', 'Verification submitted successfully!');
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('KYC/KYB submission error:', error);
      let errorMessage = 'Failed to submit verification';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Please check all required fields and try again.';
      }
      
      showNotification('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = (step: StepConfig) => {
    if (step.render) {
      return step.render();
    }

    return (
      <div className="space-y-4 animate-fadeIn">
        <StepHeader step={step.title} icon={step.icon} gradient={step.gradient} />
        <div className={`grid grid-cols-1 ${step.fields.length > 4 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-3`}>
          {step.fields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={formData[field.name]}
              onChange={handleChange}
              onFileChange={field.type === 'file' ? handleFileChange : undefined}
              options={field.options}
              isLoading={kycKybConfig.isLoading}
              error={kycKybConfig.error}
              uploadProgress={uploadProgress[field.name]}
            />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl">
          <LoadingSpinner message="Loading user profile..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-100 cursor-pointer text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-4 py-3 text-white flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {subrole === 'individual' ? 'KYC Verification' : 'KYB Verification'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 cursor-pointer hover:bg-white/30 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-4 py-3 bg-gray-50">
          <div className="flex justify-center items-center">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > index + 1;
              const isCurrent = currentStep === index + 1;
              
              return (
                <div key={step.title} className="flex items-center">
                  <div className="flex flex-col items-center mx-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 
                      isCurrent ? 'bg-indigo-500 border-indigo-500 text-white animate-pulse' : 
                      'bg-gray-200 border-gray-300 text-gray-600'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                    </div>
                    <p className={`text-xs font-medium text-center ${
                      isCurrent ? 'text-indigo-600' : 
                      isCompleted ? 'text-emerald-600' : 
                      'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-1 rounded-full ${
                      isCompleted || isCurrent ? 'bg-emerald-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
					</div>
				</div>

				{/* Form Content */}
				<div className="px-4 py-4 overflow-y-auto max-h-[60vh]">
					{renderStep(steps[currentStep - 1])}
				</div>

				{/* Footer */}
				<div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center min-h-[60px]">
					<button
						onClick={() => setCurrentStep(curr => curr - 1)}
						disabled={currentStep === 1}
						className={`px-4 py-2 text-sm font-medium rounded-md transition-all border border-blue-500 ${
							currentStep === 1
								? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
								: 'bg-white text-blue-600 cursor-pointer hover:bg-blue-50 hover:border-blue-600'
						}`}
						style={{ minWidth: '100px', visibility: 'visible' }}
					>
						Previous
					</button>
					<p className="text-xs text-gray-500 font-medium">
						Step {currentStep} of {steps.length}
					</p>
					<button
						onClick={handleNext}
						disabled={currentStep === steps.length && !formData.consent}
						className={`px-4 py-2 text-sm font-medium rounded-md transition-all border ${
							currentStep === steps.length && !formData.consent
								? 'bg-gray-300 text-gray-500 cursor-pointer cursor-not-allowed border-gray-300'
								: 'bg-gradient-to-r from-indigo-500 cursor-pointer to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 border-transparent'
						}`}
						style={{ minWidth: '100px', visibility: 'visible' }}
					>
						{isSubmitting ? (
              <div className='flex items-center justify-center'>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </div>
            ) : currentStep === 5 ? (
              <>
                Submit
              </>
            ) : (
              'Continue'
            )}
					</button>
				</div>
			</div>

			<NotificationToast 
				notification={notification}
				onClose={() => setNotification({ show: false, type: '', message: '' })}
			/>
		</div>
	);
}