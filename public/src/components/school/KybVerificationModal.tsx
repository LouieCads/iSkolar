'use client';

import React, { useState } from 'react';
import { useKycKybConfiguration } from '@/hooks/useKycKybConfiguration';
import { CheckCircle, Building2, MapPin, FileText, Shield, User, X, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { title: 'School Info', icon: Building2, gradient: 'from-indigo-500 to-purple-600' },
  { title: 'Address', icon: MapPin, gradient: 'from-teal-500 to-cyan-600' },
  { title: 'Representative', icon: User, gradient: 'from-violet-500 to-fuchsia-600' },
  { title: 'Documents', icon: FileText, gradient: 'from-amber-500 to-orange-600' },
  { title: 'Declaration', icon: Shield, gradient: 'from-rose-500 to-pink-600' },
];

const INITIAL_FORM_DATA = {
  // School Information
  schoolName: '', schoolType: '', officialEmail: '', website: '',
  contactNumbers: [''], tin: '', schoolIdNumber: '',
  
  // Campus Address
  country: '', province: '', city: '', barangay: '', street: '', zipCode: '',
  
  // Authorized Representative
  fullName: '', position: '', email: '', contactNumber: '', nationality: '',
  idType: '', idNumber: '', schoolId: '',
  
  // Business Verification
  accreditationCertificate: '', businessPermit: '',
  
  // Documents
  accreditationDoc: null, businessPermitDoc: null, birCertificate: null,
  authorizationLetter: null, gisDoc: null,
  
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

const SCHOOL_TYPES = [
  'Public Elementary School',
  'Public High School',
  'Public University/College',
  'Private Elementary School',
  'Private High School',
  'Private University/College',
  'Technical/Vocational School',
  'Graduate School',
  'Seminary/Religious School'
];

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
      {label} {required && '*'}
    </label>
    {children || <input id={id} type={type} required={required} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" {...props} />}
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
}

const SelectField: React.FC<SelectFieldProps> = ({ label, id, value, onChange, options, required = false, disabled = false }) => (
  <FormField label={label} id={id} required={required}>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((option) => (
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
  <div className="border rounded-md p-3">
    <label htmlFor={id} className="text-sm font-medium text-gray-800">
      {label} {required && '*'}
    </label>
    <input
      id={id}
      type="file"
      name={id}
      onChange={onChange}
      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all mt-1"
      required={required}
    />
    {formData[id] && (
      <p className="text-xs text-gray-600 mt-1">
        Uploaded: {formData[id].name}
      </p>
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

interface SchoolKybVerificationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SchoolKybVerificationModal({ isOpen = true, onClose = () => {} }: SchoolKybVerificationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const kycKybConfig = useKycKybConfiguration();
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const missingFields = REQUIRED_FIELDS[currentStep as keyof typeof REQUIRED_FIELDS].filter(
      field => !formData[field as keyof typeof formData] || (typeof formData[field as keyof typeof formData] === 'string' && (formData[field as keyof typeof formData] as string).trim() === '')
    );

    // Special validation for contact numbers
    if (currentStep === 1 && formData.contactNumbers.every(num => !num.trim())) {
      showNotification('error', 'At least one contact number is required');
      return false;
    }

    if (missingFields.length > 0) {
      showNotification('error', 'Missing required fields');
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
      showNotification('error', 'Consent required');
      return;
    }

    try {
      setIsSubmitting(true);

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
          contactNumbers: formData.contactNumbers.filter(num => num.trim()),
          website: formData.website,
          businessVerification: {
            accreditationCertificate: formData.accreditationCertificate,
            businessPermit: formData.businessPermit,
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
        documents: [
          formData.accreditationDoc,
          formData.businessPermitDoc,
          formData.birCertificate,
          formData.authorizationLetter,
          formData.gisDoc,
        ].filter(Boolean),
      };

      // Here you would call your API
      console.log('School KYB Data:', schoolData);

      showNotification('success', 'School KYB submitted successfully');
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('School KYB submission error:', error);
      showNotification('error', 'Error submitting School KYB');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSchoolInfo = () => (
    <div className="space-y-4 animate-fadeIn">
      <StepHeader step="School Information" icon={Building2} gradient="from-indigo-500 to-purple-600" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField 
          label="School Name" 
          id="schoolName" 
          name="schoolName" 
          value={formData.schoolName} 
          onChange={handleInputChange} 
          placeholder="Enter school name" 
          required 
        />
        <SelectField 
          label="School Type" 
          id="schoolType" 
          value={formData.schoolType} 
          onChange={handleInputChange} 
          options={SCHOOL_TYPES} 
          required 
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
          placeholder="school@example.edu" 
          required 
        />
        <FormField 
          label="Website" 
          id="website" 
          name="website" 
          value={formData.website} 
          onChange={handleInputChange} 
          placeholder="https://school.edu.ph" 
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Contact Numbers *
        </label>
        {formData.contactNumbers.map((number, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="tel"
              value={number}
              onChange={(e) => handleContactNumberChange(index, e.target.value)}
              placeholder="Enter contact number"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {formData.contactNumbers.length > 1 && (
              <button
                type="button"
                onClick={() => removeContactNumber(index)}
                className="px-3 py-2 text-red-600 cursor-pointer border border-red-300 rounded-md hover:bg-red-50"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addContactNumber}
          className="px-3 py-1 text-sm cursor-pointer text-indigo-600 border border-indigo-300 rounded-md hover:bg-indigo-50"
        >
          Add Contact Number
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField 
          label="TIN" 
          id="tin" 
          name="tin" 
          value={formData.tin} 
          onChange={handleInputChange} 
          placeholder="Enter TIN" 
          required 
        />
        <FormField 
          label="School ID Number" 
          id="schoolIdNumber" 
          name="schoolIdNumber" 
          value={formData.schoolIdNumber} 
          onChange={handleInputChange} 
          placeholder="Enter school ID number" 
          required 
        />
      </div>
    </div>
  );

  const renderAddress = () => (
    <div className="space-y-4 animate-fadeIn">
      <StepHeader step="Campus Address" icon={MapPin} gradient="from-teal-500 to-cyan-600" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField label="Country" id="country" name="country" value={formData.country} onChange={handleInputChange} placeholder="Enter country" required />
        <FormField label="Province" id="province" name="province" value={formData.province} onChange={handleInputChange} placeholder="Enter province" required />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField label="City" id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="Enter city" required />
        <FormField label="Barangay" id="barangay" name="barangay" value={formData.barangay} onChange={handleInputChange} placeholder="Enter barangay" required />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField label="Street" id="street" name="street" value={formData.street} onChange={handleInputChange} placeholder="Enter street" required />
        <FormField label="Zip Code" id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="Enter zip code" required />
      </div>
    </div>
  );

  const renderAuthorizedRepresentative = () => (
    <div className="space-y-4 animate-fadeIn">
      <StepHeader step="Authorized Representative" icon={User} gradient="from-violet-500 to-fuchsia-600" />
      
      {/* Show loading state while fetching configuration */}
      {kycKybConfig.isLoading && (
        <LoadingSpinner message="Loading configuration..." />
      )}
      
      {/* Show error state if configuration failed to load */}
      {kycKybConfig.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <p className="text-sm text-红-700">
              Error loading configuration: {kycKybConfig.error}
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField label="Full Name" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter full name" required />
        <FormField label="Position" id="position" name="position" value={formData.position} onChange={handleInputChange} placeholder="Enter position" required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField label="Email" id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email" required />
        <FormField label="Contact Number" id="contactNumber" name="contactNumber" type="tel" value={formData.contactNumber} onChange={handleInputChange} placeholder="Enter contact number" required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField label="Nationality" id="nationality" name="nationality" value={formData.nationality} onChange={handleInputChange} placeholder="Enter nationality" required />
        <FormField label="School ID" id="schoolId" name="schoolId" value={formData.schoolId} onChange={handleInputChange} placeholder="Enter school ID" required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SelectField 
          label="ID Type" 
          id="idType" 
          value={formData.idType} 
          onChange={handleInputChange} 
          options={kycKybConfig.idTypes} 
          required 
          disabled={kycKybConfig.isLoading || !!kycKybConfig.error}
        />
        <FormField label="ID Number" id="idNumber" name="idNumber" value={formData.idNumber} onChange={handleInputChange} placeholder="Enter ID number" required />
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4 animate-fadeIn">
      <StepHeader step="Documents" icon={FileText} gradient="from-amber-500 to-orange-600" />
      
      <div className="space-y-4">
        <FileUpload label="Accreditation Certificate" id="accreditationDoc" formData={formData} onChange={handleFileChange} required />
        <FileUpload label="Business Permit" id="businessPermitDoc" formData={formData} onChange={handleFileChange} required />
        <FileUpload label="BIR Certificate" id="birCertificate" formData={formData} onChange={handleFileChange} required />
        <FileUpload label="Authorization Letter" id="authorizationLetter" formData={formData} onChange={handleFileChange} required />
        <FileUpload label="General Information Sheet (GIS)" id="gisDoc" formData={formData} onChange={handleFileChange} />
      </div>
    </div>
  );

  const renderDeclarationConsent = () => (
    <div className="space-y-4 animate-fadeIn">
      <StepHeader step="Declaration & Consent" icon={Shield} gradient="from-rose-500 to-pink-600" />
      
      <div className="p-3 bg-rose-50 rounded-md">
        <p className="text-xs text-gray-700 mb-3">
          I declare that all information provided is true and accurate. I understand that false information may lead to application rejection. I consent to the collection, processing, and storage of my school's data for KYB verification per applicable laws. As an authorized representative, I have the authority to submit this verification on behalf of the school.
        </p>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="consent"
            name="consent"
            checked={formData.consent}
            onChange={handleInputChange}
            className="h-4 w-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
            required
          />
          <label htmlFor="consent" className="text-xs text-gray-700">
            I agree to the terms and conditions *
          </label>
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
          <h2 className="text-lg font-semibold">School KYB Verification</h2>
          <button onClick={onClose} className="w-7 h-7 cursor-pointer rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
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
        <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
          <button 
            onClick={() => setCurrentStep(curr => curr - 1)} 
            disabled={currentStep === 1} 
            className={`px-3 py-1.5 text-sm rounded-md ${
              currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
              'bg-white text-gray-700 border cursor-pointer hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <p className="text-xs text-gray-500">Step {currentStep} of {STEPS.length}</p>
          <button 
            onClick={handleNext} 
            disabled={(currentStep === 5 && !formData.consent) || isSubmitting} 
            className={`px-5 py-1.5 text-sm rounded-md transition-all flex items-center ${
              (currentStep === 5 && !formData.consent) || isSubmitting ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 
              'bg-gradient-to-r cursor-pointer from-indigo-500 cursor-pointer to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                Submitting...
              </>
            ) : currentStep === 5 ? 'Complete' : 'Continue'}
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