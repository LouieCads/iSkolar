'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, User, MapPin, FileText, Shield, X, AlertCircle, Building, Loader2, Camera, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useKycKybConfiguration } from '@/hooks/useIdentityConfiguration';
import { kycKybService } from '@/services/sponsorIdentityVerificationService';

// Types for better clarity
interface FormData {
  [key: string]: string | boolean | File | null;
}

interface StepConfig {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Initial form data structure
const INITIAL_FORM_DATA = {
  // Personal Information
  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: '',
  nationality: '',
  contactEmail: '',
  contactNumber: '',
  
  // Address
  country: '',
  stateOrProvince: '',
  city: '',
  districtOrBarangay: '',
  street: '',
  postalCode: '',
  
  // ID Details
  idType: '',
  idNumber: '',
  expiryDate: '',
  frontImageFile: null,
  backImageFile: null,
  frontImageUrl: '',
  backImageUrl: '',
  
  // Selfie
  selfieFile: null,
  selfiePhotoUrl: '',
  
  // Consent
  consent: false,
};

// Required fields validation per step
const REQUIRED_FIELDS = {
  1: ['firstName', 'lastName', 'dateOfBirth', 'nationality', 'contactEmail', 'contactNumber'],
  2: ['country', 'stateOrProvince', 'city', 'districtOrBarangay', 'street', 'postalCode'],
  3: ['idType', 'idNumber', 'expiryDate', 'frontImageUrl', 'backImageUrl'],
  4: ['selfiePhotoUrl'],
  5: ['consent'],
};

// Step configurations
const STEPS: StepConfig[] = [
  { title: 'Personal Info', icon: User, gradient: 'from-indigo-500 to-purple-600' },
  { title: 'Address', icon: MapPin, gradient: 'from-teal-500 to-cyan-600' },
  { title: 'ID Details', icon: FileText, gradient: 'from-amber-500 to-orange-600' },
  { title: 'Selfie Photo', icon: Camera, gradient: 'from-purple-500 to-pink-600' },
  { title: 'Declaration', icon: Shield, gradient: 'from-rose-500 to-pink-600' },
];

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

// Form Field Component
interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}

const FormField = ({ label, id, type = "text", required = false, children, ...props }: FormFieldProps) => (
  <div>
    <Label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && '*'}
    </Label>
    {children || <Input id={id} type={type} required={required} {...props} />}
  </div>
);

// Select Field Component
const SelectField = ({ label, id, value, onValueChange, options, required = false, isLoading = false, error = null }) => (
  <FormField label={label} id={id} required={required}>
    <Select name={id} value={value} onValueChange={onValueChange} required={required}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
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
  </FormField>
);

// Image Upload Component
const ImageUpload = ({ label, id, file, imageUrl, onChange, required = false, accept = "image/*" }) => (
  <div className="border rounded-md p-3 bg-gray-50">
    <Label htmlFor={id} className="text-sm font-medium text-gray-800 block mb-2">
      {label} {required && '*'}
    </Label>
    <input
      id={id}
      type="file"
      name={id}
      onChange={onChange}
      accept={accept}
      className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all bg-white"
      required={required}
    />
    {(file || imageUrl) && (
      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
        <p className="text-xs text-green-700 flex items-center">
          <CheckCircle className="w-3 h-3 mr-1" />
          {file ? `Uploaded: ${file.name}` : 'Image uploaded successfully'}
        </p>
      </div>
    )}
    {imageUrl && (
      <div className="mt-2">
        <img src={imageUrl} alt={label} className="max-w-full h-32 object-cover rounded border" />
      </div>
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

// Authorized Representative Notice Component
const AuthorizedRepresentativeNotice = () => (
  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
    <div className="flex items-start space-x-2">
      <div>
        <p className="text-sm font-semibold text-blue-800 mb-1">
          Authorized Representative
        </p>
        <p className="text-xs text-blue-700">
          As a corporate sponsor, please enter the information of the authorized representative who will be responsible for this verification and compliance matters.
        </p>
      </div>
    </div>
  </div>
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
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    const file = files[0];
    
    if (!file) return;

    try {
      setIsUploading(true);
      
      let documentType;
      let urlFieldName;
      
      if (name === 'frontImageFile') {
        documentType = 'idFront';
        urlFieldName = 'frontImageUrl';
      } else if (name === 'backImageFile') {
        documentType = 'idBack';
        urlFieldName = 'backImageUrl';
      } else if (name === 'selfieFile') {
        documentType = 'selfie';
        urlFieldName = 'selfiePhotoUrl';
      } else {
        showNotification('error', 'Invalid file type');
        return;
      }

      const uploadResult = await kycKybService.uploadDocument(file, documentType);
      if (!uploadResult.fileUrl) {
        throw new Error('No file URL returned from server');
      }
      
      setFormData(prev => {
        const newFormData = {
          ...prev,
          [name]: file,
          [urlFieldName]: uploadResult.fileUrl,
        };
        console.log('Updated formData:', newFormData);
        return newFormData;
      });

      showNotification('success', 'File uploaded successfully');
    } catch (error) {
      console.error('File upload error:', error);
      showNotification('error', error.message || error.response?.data?.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const validateStep = () => {
    const missingFields = REQUIRED_FIELDS[currentStep].filter(
      field => !formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')
    );
    console.log('Missing fields in step', currentStep, ':', missingFields);
    console.log('Current formData:', formData);

    if (missingFields.length > 0) {
      showNotification('error', 'Please fill in all required fields');
      return false;
    }

    setNotification({ show: false, type: '', message: '' });
    return true;
  };

  const handleNext = () => {
  if (validateStep()) {
    if (currentStep === STEPS.length) {
      handleSubmit();
      } else {
      setCurrentStep((curr) => (curr < STEPS.length ? curr + 1 : curr));
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

      // Structure data to match backend proofOfIdentity format
      const proofOfIdentityData = {
        declarationsAndConsent: formData.consent as boolean,
        proofOfIdentity: {
          fullName: {
            firstName: formData.firstName as string,
            middleName: formData.middleName as string || '',
            lastName: formData.lastName as string
          },
          dateOfBirth: formData.dateOfBirth as string,
          nationality: formData.nationality as string,
          contactEmail: formData.contactEmail as string,
          contactNumber: formData.contactNumber as string,
          address: {
            country: formData.country as string,
            stateOrProvince: formData.stateOrProvince as string,
            city: formData.city as string,
            districtOrBarangay: formData.districtOrBarangay as string,
            street: formData.street as string,
            postalCode: formData.postalCode as string
          },
          idDetails: {
            idType: formData.idType as string,
            frontImageUrl: formData.frontImageUrl as string,
            backImageUrl: formData.backImageUrl as string,
            idNumber: formData.idNumber as string,
            expiryDate: formData.expiryDate as string
          },
          selfiePhotoUrl: formData.selfiePhotoUrl as string
        }
      };

      console.log('Submitting Sponsor Data:', proofOfIdentityData);

      // Submit based on subrole
      if (subrole === 'individual') {
        await kycKybService.submitIndividualSponsorKyb(proofOfIdentityData);
      } else {
        await kycKybService.submitCorporateSponsorKyb(proofOfIdentityData);
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

  // Render step components
  const renderPersonalInfo = () => (
    <div className="space-y-4 animate-fadeIn">
      <StepHeader step="Personal Information" icon={User} gradient="from-indigo-500 to-purple-600" />
      
      {/* Show notice only for corporate sponsors */}
      {subrole === 'corporate' && <AuthorizedRepresentativeNotice />}
      
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FormField 
          label="First Name" 
          id="firstName" 
          name="firstName" 
          value={formData.firstName} 
          onChange={handleInputChange} 
          placeholder="Enter first name" 
          required 
        />
        <FormField 
          label="Middle Name" 
          id="middleName" 
          name="middleName" 
          value={formData.middleName} 
          onChange={handleInputChange} 
          placeholder="Enter middle name" 
        />
        <FormField 
          label="Last Name" 
          id="lastName" 
          name="lastName" 
          value={formData.lastName} 
          onChange={handleInputChange} 
          placeholder="Enter last name" 
          required 
        />
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField 
          label="Date of Birth" 
          id="dateOfBirth" 
          name="dateOfBirth" 
          type="date" 
          value={formData.dateOfBirth} 
          onChange={handleInputChange} 
          required 
        />
        <FormField 
          label="Nationality" 
          id="nationality" 
          name="nationality" 
          value={formData.nationality} 
          onChange={handleInputChange} 
          placeholder="Enter nationality" 
          required 
        />
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField 
          label="Contact Email" 
          id="contactEmail" 
          name="contactEmail" 
          type="email" 
          value={formData.contactEmail} 
          onChange={handleInputChange} 
          placeholder={subrole === 'corporate' ? "representative@company.com" : "Enter email address"} 
          required 
        />
        <FormField 
          label="Contact Number" 
          id="contactNumber" 
          name="contactNumber" 
          type="tel" 
          value={formData.contactNumber} 
          onChange={handleInputChange} 
          placeholder={subrole === 'corporate' ? "+63 912 345 6789" : "Enter phone number"} 
          required 
        />
      </div>
    </div>
  );

  const renderAddress = () => (
    <div className="space-y-4 animate-fadeIn">
      <StepHeader step="Address Information" icon={MapPin} gradient="from-teal-500 to-cyan-600" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField 
          label="Country" 
          id="country" 
          name="country" 
          value={formData.country} 
          onChange={handleInputChange} 
          placeholder="Enter country" 
          required 
        />
        <FormField 
          label="State/Province" 
          id="stateOrProvince" 
          name="stateOrProvince" 
          value={formData.stateOrProvince} 
          onChange={handleInputChange} 
          placeholder="Enter state or province" 
          required 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField 
          label="City" 
          id="city" 
          name="city" 
          value={formData.city} 
          onChange={handleInputChange} 
          placeholder="Enter city" 
          required 
        />
        <FormField 
          label="District/Barangay" 
          id="districtOrBarangay" 
          name="districtOrBarangay" 
          value={formData.districtOrBarangay} 
          onChange={handleInputChange} 
          placeholder="Enter district or barangay" 
          required 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField 
          label="Street Address" 
          id="street" 
          name="street" 
          value={formData.street} 
          onChange={handleInputChange} 
          placeholder="Enter street address" 
          required 
        />
        <FormField 
          label="Postal Code" 
          id="postalCode" 
          name="postalCode" 
          value={formData.postalCode} 
          onChange={handleInputChange} 
          placeholder="Enter postal code" 
          required 
        />
      </div>
    </div>
  );

  const renderIdDetails = () => (
    <div className="space-y-4 animate-fadeIn">
      <StepHeader step="ID Details" icon={FileText} gradient="from-amber-500 to-orange-600" />
      
      {/* ID Type and Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SelectField 
          label="ID Type" 
          id="idType" 
          value={formData.idType} 
          onValueChange={(value) => handleSelectChange('idType', value)} 
          options={kycKybConfig.idTypes || []} 
          isLoading={kycKybConfig.isLoading}
          error={kycKybConfig.error}
          required 
        />
        <FormField 
          label="ID Number" 
          id="idNumber" 
          name="idNumber" 
          value={formData.idNumber} 
          onChange={handleInputChange} 
          placeholder="Enter ID number" 
          required 
        />
      </div>

      <FormField 
        label="ID Expiry Date" 
        id="expiryDate" 
        name="expiryDate" 
        type="date" 
        value={formData.expiryDate} 
        onChange={handleInputChange} 
        required 
      />

      {/* Image Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImageUpload 
          label="ID Front Image" 
          id="frontImageFile" 
          file={formData.frontImageFile}
          imageUrl={formData.frontImageUrl}
          onChange={handleFileChange} 
          required 
          accept="image/*,.pdf"
        />
        <ImageUpload 
          label="ID Back Image" 
          id="backImageFile" 
          file={formData.backImageFile}
          imageUrl={formData.backImageUrl}
          onChange={handleFileChange} 
          required 
          accept="image/*,.pdf"
        />
      </div>

      {isUploading && (
        <div className="flex items-center justify-center p-4 bg-amber-50 rounded-md">
          <Loader2 className="w-4 h-4 animate-spin text-amber-600 mr-2" />
          <span className="text-sm text-amber-600">Uploading file...</span>
        </div>
      )}
    </div>
  );

  const renderSelfiePhoto = () => (
    <div className="space-y-4 animate-fadeIn">
      <StepHeader step="Selfie Photo" icon={Camera} gradient="from-purple-500 to-pink-600" />
      
      <div className="p-3 bg-violet-50 border border-violet-200 rounded-md">
				<p className="text-sm text-violet-700">
					<strong>Selfie Guidelines:</strong> Take a clear photo of yourself holding your ID next to your face. Make sure your face and the ID are both clearly visible and well-lit.
				</p>
			</div>
			
			<div className="max-w-md mx-auto">
				<ImageUpload 
					label="Selfie with ID" 
					id="selfieFile" 
					file={formData.selfieFile}
					imageUrl={formData.selfiePhotoUrl}
					onChange={handleFileChange} 
					required 
					accept="image/*"
				/>
			</div>

      {isUploading && (
        <div className="flex items-center justify-center p-4 bg-purple-50 rounded-md">
          <Loader2 className="w-4 h-4 animate-spin text-purple-600 mr-2" />
          <span className="text-sm text-purple-600">Uploading photo...</span>
        </div>
      )}
    </div>
  );

  const renderDeclarationConsent = () => (
    <div className="space-y-4 animate-fadeIn">
      <StepHeader step="Declaration & Consent" icon={Shield} gradient="from-rose-500 to-pink-600" />
      
      <div className="p-4 bg-rose-50 rounded-md">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Terms and Conditions</h4>
        <div className="space-y-2 text-xs text-gray-700 mb-4">
          <p>By proceeding with this verification, I declare that:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>All information provided is true, accurate, and complete</li>
            <li>The identity documents and photos submitted are genuine and belong to me</li>
            {subrole === 'corporate' && (
              <li>I have the proper authority to represent the organization in this verification process</li>
            )}
            <li>I understand that false information may lead to application rejection</li>
            <li>I consent to the collection, processing, and storage of my personal data for KYC/KYB verification purposes</li>
            <li>I understand that my data will be handled in accordance with applicable data protection laws</li>
          </ul>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox
            id="consent"
            name="consent"
            checked={formData.consent === true}
            onCheckedChange={(checked) => handleSelectChange('consent', checked === true)}
            className="h-4 w-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500 mt-0.5"
            required
          />
          <Label htmlFor="consent" className="text-xs text-gray-700 leading-relaxed">
            I agree to the terms and conditions stated above and consent to the processing of my personal data for verification purposes. *
          </Label>
        </div>
      </div>
    </div>
  );

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

  const stepComponents = [
    renderPersonalInfo,
    renderAddress,
    renderIdDetails,
    renderSelfiePhoto,
    renderDeclarationConsent
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-4 py-3 text-white flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {subrole === 'individual' ? 'Individual Sponsor KYC' : 'Corporate Sponsor KYB'} Verification
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
            {STEPS.map((step, index) => {
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
                  {index < STEPS.length - 1 && (
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
          {stepComponents[currentStep - 1]()}
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
						Step {currentStep} of {STEPS.length}
					</p>
					<button
						onClick={handleNext}
						disabled={currentStep === STEPS.length && !formData.consent}
						className={`px-4 py-2 text-sm font-medium rounded-md transition-all border ${
							currentStep === STEPS.length && !formData.consent
								? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
								: 'bg-gradient-to-r from-indigo-500 cursor-pointer to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 border-transparent'
						}`}
						style={{ minWidth: '100px', visibility: 'visible' }}
					>
						{isSubmitting ? (
              <div className='flex items-center justify-center'>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </div>
            ) : currentStep === STEPS.length ? (
              'Submit'
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