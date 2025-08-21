'use client';

import React, { useState } from 'react';
import { CheckCircle, Building2, MapPin, FileText, Shield, User, X, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKycKybConfiguration } from '@/hooks/useIdentityConfiguration';
import { kycKybService } from '@/services/kycKybService';

const STEPS = [
  { title: 'School Info', icon: Building2, gradient: 'from-indigo-500 to-purple-600' },
  { title: 'Address', icon: MapPin, gradient: 'from-teal-500 to-cyan-600' },
  { title: 'Representative', icon: User, gradient: 'from-violet-500 to-fuchsia-600' },
  { title: 'Documents', icon: FileText, gradient: 'from-amber-500 to-orange-600' },
  { title: 'Declaration', icon: Shield, gradient: 'from-rose-500 to-pink-600' },
];

const INITIAL_FORM_DATA = {
  // School Information
  schoolName: '', 
  schoolType: '', 
  officialEmail: '', 
  website: '',
  contactNumbers: [''], 
  tin: '', 
  schoolIdNumber: '',
  accreditationCertificate: '',
  businessPermit: '',
  
  // Campus Address
  country: '', 
  province: '', 
  city: '', 
  barangay: '', 
  street: '', 
  zipCode: '',
  
  // Authorized Representative
  fullName: '', 
  position: '', 
  email: '', 
  contactNumber: '', 
  nationality: '',
  idType: '', 
  idNumber: '', 
  schoolId: '',
  
  // Documents
  accreditationDoc: null as File | null, 
  businessPermitDoc: null as File | null, 
  birCertificate: null as File | null,
  authorizationLetter: null as File | null, 
  gisDoc: null as File | null,
  
  // Declaration
  consent: false,
};

const REQUIRED_FIELDS = {
  1: ['schoolName', 'schoolType', 'officialEmail', 'tin', 'schoolIdNumber'],
  2: ['country', 'province', 'city', 'barangay', 'street', 'zipCode'],
  3: ['fullName', 'position', 'email', 'contactNumber', 'nationality', 'idType', 'idNumber', 'schoolId'],
  4: ['accreditationDoc', 'businessPermitDoc', 'birCertificate', 'authorizationLetter'],
  5: ['consent'],
};

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
    <span className="ml-2 text-sm text-gray-600">{message}</span>
  </div>
);

interface StepHeaderProps {
  step: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const StepHeader: React.FC<StepHeaderProps> = ({ step, icon: Icon, gradient }) => (
  <div className="text-center mb-4">
    <div className={`w-10 h-10 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center mx-auto mb-2`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800">{step}</h3>
  </div>
);

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}

const FormField: React.FC<FormFieldProps> = ({ label, id, type = "text", required = false, children, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children || (
      <input 
        id={id} 
        type={type} 
        required={required} 
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
        {...props} 
      />
    )}
  </div>
);

interface SelectFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
}

const SelectField: React.FC<SelectFieldProps> = ({ 
  label, 
  id, 
  value, 
  onChange, 
  options, 
  required = false, 
  disabled = false,
  loading = false,
  error = null
}) => (
  <FormField label={label} id={id} required={required}>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled || loading}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
    >
      <option value="">
        {loading ? `Loading ${label.toLowerCase()}...` : 
         error ? `Error loading ${label.toLowerCase()}` : 
         `Select ${label.toLowerCase()}`}
      </option>
      {!loading && !error && options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </FormField>
);

interface FileUploadProps {
  label: string;
  id: string;
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, id, formData, onChange, required = false }) => (
  <div className="border rounded-md p-3 bg-gray-50">
    <label htmlFor={id} className="text-sm font-medium text-gray-800 block mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      type="file"
      name={id}
      onChange={onChange}
      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all bg-white"
      required={required}
    />
    {formData[id] && (
      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
        <p className="text-xs text-green-700 flex items-center">
          <CheckCircle className="w-3 h-3 mr-1" />
          Uploaded: {formData[id].name}
        </p>
      </div>
    )}
  </div>
);

interface NotificationToastProps {
  notification: {
    show: boolean;
    type: string;
    message: string;
  };
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => (
  <AnimatePresence>
    {notification.show && (
      <motion.div
        initial={{ opacity: 1, x: 500 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 500 }}
        transition={{ type: 'spring', stiffness: 900, damping: 25, duration: 0.2 }}
        className={`fixed w-[325px] flex justify-end items-center h-[55px] bottom-5 right-5 rounded-[10px] ${
          notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        } shadow-xl z-50`}
      >
        <div className="flex gap-3 items-center w-[320px] h-[55px] bg-gray-50 rounded-[5px] border-white px-3 py-2">
          {notification.type === 'success' ? (
            <CheckCircle width={23} height={23} className="text-emerald-500" />
          ) : (
            <AlertCircle width={23} height={23} className="text-red-500" />
          )}
          <div>
            <p className="font-semibold text-[14px] text-gray-900">
              {notification.type === 'success' ? 'Success' : 'Error'}
            </p>
            <p className="text-[12px] text-gray-700">{notification.message}</p>
          </div>
          <button onClick={onClose} className="ml-auto cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

interface SchoolKybVerificationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SchoolKybVerificationModal({ 
  isOpen = true, 
  onClose = () => {} 
}: SchoolKybVerificationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const kycKybConfig = useKycKybConfiguration();

  const showNotification = (type: string, message: string) => {
    setNotification({ show: true, type, message });
    if (type === 'error') {
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleContactNumberChange = (index: number, value: string) => {
    const updatedNumbers = [...formData.contactNumbers];
    updatedNumbers[index] = value;
    setFormData(prev => ({ ...prev, contactNumbers: updatedNumbers }));
  };

  const addContactNumber = () => {
    setFormData(prev => ({ 
      ...prev, 
      contactNumbers: [...prev.contactNumbers, ''] 
    }));
  };

  const removeContactNumber = (index: number) => {
    if (formData.contactNumbers.length > 1) {
      const updatedNumbers = formData.contactNumbers.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, contactNumbers: updatedNumbers }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files?.[0] || null }));
  };

  const validateStep = () => {
    const requiredFields = REQUIRED_FIELDS[currentStep as keyof typeof REQUIRED_FIELDS];
    
    // Special validation for contact numbers in step 1
    if (currentStep === 1) {
      const hasValidContactNumber = formData.contactNumbers.some(num => num.trim().length > 0);
      if (!hasValidContactNumber) {
        showNotification('error', 'At least one contact number is required');
        return false;
      }
    }

    const missingFields = requiredFields.filter(field => {
      const value = formData[field as keyof typeof formData];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (missingFields.length > 0) {
      showNotification('error', 'Please fill in all required fields');
      return false;
    }

    setNotification({ show: false, type: '', message: '' });
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep === 5) {
        handleSubmit();
      } else {
        setCurrentStep(curr => curr + 1);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.consent) {
      showNotification('error', 'Please agree to the terms and conditions');
      return;
    }

    try {
      setIsSubmitting(true);

      // Filter out empty contact numbers and prepare documents
      const contactNumbers = formData.contactNumbers.filter(num => num.trim());
      const documents = [
        formData.accreditationDoc,
        formData.businessPermitDoc,
        formData.birCertificate,
        formData.authorizationLetter,
        formData.gisDoc,
      ].filter(Boolean).map(doc => doc?.name || ''); // Convert File objects to file names

      const schoolData = {
        declarationsAndConsent: formData.consent,
        school: {
          schoolName: formData.schoolName,
          schoolType: formData.schoolType,
          campusAddress: {
            country: formData.country,
            province: formData.province,
            city: formData.city,
            barangay: formData.barangay,
            street: formData.street,
            zipCode: formData.zipCode,
          },
          officialEmail: formData.officialEmail,
          contactNumbers: contactNumbers,
          website: formData.website || '',
          businessVerification: {
            accreditationCertificate: formData.accreditationCertificate || '',
            businessPermit: formData.businessPermit || '',
            tin: formData.tin,
            schoolIdNumber: formData.schoolIdNumber,
          },
          authorizedRepresentative: {
            fullName: formData.fullName,
            position: formData.position,
            email: formData.email,
            contactNumber: formData.contactNumber,
            nationality: formData.nationality,
            idType: formData.idType,
            idNumber: formData.idNumber,
            schoolId: formData.schoolId,
          },
        },
        documents: documents, // This will be an array of file names (strings)
      };

      console.log('Submitting school data:', schoolData);
      const response = await kycKybService.submitSchoolKyb(schoolData);

      showNotification('success', response.message || 'School KYB submitted successfully');
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('School KYB submission error:', error);
      showNotification('error', error.message || 'Error submitting School KYB');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSchoolInfo = () => {
    if (kycKybConfig.isLoading) return <LoadingSpinner message="Loading school configuration..." />;
    
    if (kycKybConfig.error) {
      return (
        <div className="text-center p-4">
          <p className="text-sm text-red-600">Error loading configuration. Please try again later.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <StepHeader step="School Information" icon={Building2} gradient="from-indigo-500 to-purple-600" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField 
            label="School Name" 
            id="schoolName" 
            name="schoolName" 
            value={formData.schoolName} 
            onChange={handleInputChange} 
            placeholder="Enter official school name" 
            required 
          />
          <SelectField 
            label="School Type" 
            id="schoolType" 
            value={formData.schoolType} 
            onChange={handleInputChange} 
            options={kycKybConfig.schoolType || []} 
            required 
            loading={kycKybConfig.isLoading}
            error={kycKybConfig.error}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField 
            label="Official Email" 
            id="officialEmail" 
            name="officialEmail" 
            type="email" 
            value={formData.officialEmail} 
            onChange={handleInputChange} 
            placeholder="school@example.edu.ph" 
            required 
          />
          <FormField 
            label="Website" 
            id="website" 
            name="website" 
            value={formData.website} 
            onChange={handleInputChange} 
            placeholder="https://www.schoolname.edu.ph" 
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Contact Numbers <span className="text-red-500">*</span>
          </label>
          {formData.contactNumbers.map((number, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="tel"
                value={number}
                onChange={(e) => handleContactNumberChange(index, e.target.value)}
                placeholder="Enter contact number (e.g., +63 912 345 6789)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {formData.contactNumbers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContactNumber(index)}
                  className="px-3 py-2 text-red-600 border cursor-pointer border-red-300 rounded-md hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addContactNumber}
            className="px-3 py-1 text-sm text-indigo-600 border cursor-pointer border-indigo-300 rounded-md hover:bg-indigo-50 transition-colors"
          >
            + Add Contact Number
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField 
            label="TIN" 
            id="tin" 
            name="tin" 
            value={formData.tin} 
            onChange={handleInputChange} 
            placeholder="Enter Tax Identification Number" 
            required 
          />
          <FormField 
            label="School ID Number" 
            id="schoolIdNumber" 
            name="schoolIdNumber" 
            value={formData.schoolIdNumber} 
            onChange={handleInputChange} 
            placeholder="Enter school registration ID" 
            required 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField 
            label="Accreditation Certificate No." 
            id="accreditationCertificate" 
            name="accreditationCertificate" 
            value={formData.accreditationCertificate} 
            onChange={handleInputChange} 
            placeholder="Enter certificate number" 
          />
          <FormField 
            label="Business Permit No." 
            id="businessPermit" 
            name="businessPermit" 
            value={formData.businessPermit} 
            onChange={handleInputChange} 
            placeholder="Enter permit number" 
          />
        </div>
      </div>
    );
  };

  const renderAddress = () => (
    <div className="space-y-4">
      <StepHeader step="Campus Address" icon={MapPin} gradient="from-teal-500 to-cyan-600" />
      
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
          label="Province/State" 
          id="province" 
          name="province" 
          value={formData.province} 
          onChange={handleInputChange} 
          placeholder="Enter province or state" 
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
          label="Barangay/District" 
          id="barangay" 
          name="barangay" 
          value={formData.barangay} 
          onChange={handleInputChange} 
          placeholder="Enter barangay or district" 
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
          label="ZIP/Postal Code" 
          id="zipCode" 
          name="zipCode" 
          value={formData.zipCode} 
          onChange={handleInputChange} 
          placeholder="Enter ZIP or postal code" 
          required 
        />
      </div>
    </div>
  );

  const renderAuthorizedRepresentative = () => {
    if (kycKybConfig.isLoading) return <LoadingSpinner message="Loading configuration..." />;
    
    if (kycKybConfig.error) {
      return (
        <div className="text-center p-4">
          <p className="text-sm text-red-600">Error loading configuration. Please try again later.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <StepHeader step="Authorized Representative" icon={User} gradient="from-violet-500 to-fuchsia-600" />
        
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> The authorized representative must be an official of the school with authority to submit this verification on behalf of the institution.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField 
            label="Full Name" 
            id="fullName" 
            name="fullName" 
            value={formData.fullName} 
            onChange={handleInputChange} 
            placeholder="Enter representative's full name" 
            required 
          />
          <FormField 
            label="Position/Title" 
            id="position" 
            name="position" 
            value={formData.position} 
            onChange={handleInputChange} 
            placeholder="Enter position (e.g., Principal, Dean)" 
            required 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField 
            label="Email Address" 
            id="email" 
            name="email" 
            type="email" 
            value={formData.email} 
            onChange={handleInputChange} 
            placeholder="representative@school.edu.ph" 
            required 
          />
          <FormField 
            label="Contact Number" 
            id="contactNumber" 
            name="contactNumber" 
            type="tel" 
            value={formData.contactNumber} 
            onChange={handleInputChange} 
            placeholder="Enter contact number" 
            required 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField 
            label="Nationality" 
            id="nationality" 
            name="nationality" 
            value={formData.nationality} 
            onChange={handleInputChange} 
            placeholder="Enter nationality" 
            required 
          />
          <FormField 
            label="School Employee ID" 
            id="schoolId" 
            name="schoolId" 
            value={formData.schoolId} 
            onChange={handleInputChange} 
            placeholder="Enter employee ID number" 
            required 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SelectField 
            label="ID Type" 
            id="idType" 
            value={formData.idType} 
            onChange={handleInputChange} 
            options={kycKybConfig.idTypes || []} 
            required 
            loading={kycKybConfig.isLoading}
            error={kycKybConfig.error}
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
      </div>
    );
  };

  const renderDocuments = () => (
    <div className="space-y-4">
      <StepHeader step="Required Documents" icon={FileText} gradient="from-amber-500 to-orange-600" />
      
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
        <p className="text-sm text-amber-700">
          <strong>Document Requirements:</strong> Please upload clear, legible copies of all required documents. Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB each).
        </p>
      </div>
      
      <div className="space-y-4">
        <FileUpload 
          label="Accreditation Certificate" 
          id="accreditationDoc" 
          formData={formData} 
          onChange={handleFileChange} 
          required 
        />
        <FileUpload 
          label="Business Permit" 
          id="businessPermitDoc" 
          formData={formData} 
          onChange={handleFileChange} 
          required 
        />
        <FileUpload 
          label="BIR Certificate of Registration" 
          id="birCertificate" 
          formData={formData} 
          onChange={handleFileChange} 
          required 
        />
        <FileUpload 
          label="Authorization Letter from Board/Owner" 
          id="authorizationLetter" 
          formData={formData} 
          onChange={handleFileChange} 
          required 
        />
        <FileUpload 
          label="General Information Sheet (GIS)" 
          id="gisDoc" 
          formData={formData} 
          onChange={handleFileChange} 
        />
      </div>
    </div>
  );

  const renderDeclarationConsent = () => (
    <div className="space-y-4">
      <StepHeader step="Declaration & Consent" icon={Shield} gradient="from-rose-500 to-pink-600" />
      
      <div className="space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-md">
          <h4 className="text-sm font-semibold text-rose-800 mb-2">Declaration</h4>
          <p className="text-xs text-rose-700 mb-3">
            I, as the authorized representative of the school, hereby declare that:
          </p>
          <ul className="text-xs text-rose-700 space-y-1 list-disc list-inside">
            <li>All information provided in this application is true, accurate, and complete to the best of my knowledge</li>
            <li>I have the proper authority to submit this verification on behalf of the school</li>
            <li>The school is in good standing and complies with all applicable laws and regulations</li>
            <li>I understand that providing false information may result in rejection of this application</li>
            <li>The school agrees to cooperate with any verification processes that may be required</li>
          </ul>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Data Privacy Consent</h4>
          <p className="text-xs text-blue-700 mb-3">
            By submitting this application, the school consents to:
          </p>
          <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
            <li>The collection, processing, and storage of the school's data for KYB verification purposes</li>
            <li>Data processing in accordance with applicable data protection laws</li>
            <li>Sharing of necessary information with authorized verification partners</li>
            <li>Retention of data for regulatory compliance and audit purposes</li>
          </ul>
        </div>

        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              checked={formData.consent}
              onChange={handleInputChange}
              className="h-4 w-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500 mt-0.5"
              required
            />
            <label htmlFor="consent" className="text-sm text-gray-700 leading-relaxed">
              <span className="font-medium">I agree to the terms and conditions</span> and confirm that I have read, understood, and accept the declaration and data privacy consent statements above. <span className="text-red-500">*</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  const stepComponents = [
    renderSchoolInfo,
    renderAddress,
    renderAuthorizedRepresentative,
    renderDocuments,
    renderDeclarationConsent
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-4 py-3 text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">School KYB Verification</h2>
            <p className="text-xs text-indigo-100">Know Your Business - School Registration</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-full bg-white/20 cursor-pointer hover:bg-white/30 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-4 py-3 bg-gray-50 border-b">
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
                    <p className={`text-xs font-medium text-center mt-1 ${
                      isCurrent ? 'text-indigo-600' : 
                      isCompleted ? 'text-emerald-600' : 
                      'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-8 h-1 rounded-full ${
                      isCompleted || (isCurrent && index < currentStep - 1) ? 'bg-emerald-500' : 'bg-gray-200'
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
        <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
          <button 
            onClick={() => setCurrentStep(curr => curr - 1)} 
            disabled={currentStep === 1} 
            className={`px-4 py-2 text-sm rounded-md transition-all ${
              currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
              'bg-white text-gray-700 border cursor-pointer border-gray-300 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Step {currentStep} of {STEPS.length}</span>
            <div className="flex space-x-1">
              {STEPS.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index + 1 <= currentStep ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleNext} 
            disabled={(currentStep === 5 && !formData.consent) || isSubmitting} 
            className={`px-5 py-2 text-sm rounded-md transition-all flex items-center ${
              (currentStep === 5 && !formData.consent) || isSubmitting ? 
              'bg-gray-300 cursor-not-allowed text-gray-500' : 
              'bg-gradient-to-r cursor-pointer from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg'
            }`}
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