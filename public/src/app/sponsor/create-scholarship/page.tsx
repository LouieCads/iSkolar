"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Info, X, Image as ImageIcon, Edit2, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import ScholarshipBanner from "@/components/sponsor/ScholarshipBanner";
import { useScholarshipDetails } from '@/hooks/useScholarshipDetails';

interface FormData {
  title: string;
  description: string;
  scholarshipType: string;
  purpose: string;
  totalScholars: number | string; // Allow both number and string
  amountPerScholar: number | string; // Allow both number and string
  selectedSchool: string;
  selectionMode: "auto" | "manual";
  applicationDeadline: string;
  criteriaTags: string[];
  requiredDocuments: string[];
  bannerImage?: File | null;
  bannerImagePreview?: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  selectedSchool?: string;
  applicationDeadline?: string;
  totalScholars?: string;
  amountPerScholar?: string;
  bannerImage?: string;
  scholarshipType?: string;
  purpose?: string;
}

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

export default function CreateScholarshipPage() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    scholarshipType: "",
    purpose: "",
    totalScholars: "", // Changed from 1 to empty string
    amountPerScholar: "", // Changed from 0 to empty string
    selectedSchool: "",
    selectionMode: "auto",
    applicationDeadline: "",
    criteriaTags: [],
    requiredDocuments: [],
    bannerImage: null,
    bannerImagePreview: "",
  });

  const [newDocument, setNewDocument] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({ show: false, type: 'info', message: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [tempDescription, setTempDescription] = useState(formData.description);
  
  // Use the enhanced scholarship details hook
  const scholarshipDetails = useScholarshipDetails();

  // Show notification helper
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ show: true, type, message });
    if (type === 'error') {
      setTimeout(() => setNotification({ show: false, type: 'info', message: '' }), 3000);
    } else if (type === 'success') {
      setTimeout(() => setNotification({ show: false, type: 'info', message: '' }), 5000);
    }
  };

  // Set default values when data loads
  useEffect(() => {
    if (scholarshipDetails.types.length > 0 && !formData.scholarshipType) {
      setFormData(prev => ({
        ...prev,
        scholarshipType: scholarshipDetails.types[0]
      }));
    }
    if (scholarshipDetails.purposes.length > 0 && !formData.purpose) {
      setFormData(prev => ({
        ...prev,
        purpose: scholarshipDetails.purposes[0]
      }));
    }
  }, [scholarshipDetails.types, scholarshipDetails.purposes, formData.scholarshipType, formData.purpose]);

  // Show error notifications
  useEffect(() => {
    if (scholarshipDetails.error) {
      showNotification('error', scholarshipDetails.error);
    }
  }, [scholarshipDetails.error]);

  const schoolOptions = [
    "University of the Philippines",
    "Ateneo de Manila University",
    "De La Salle University",
    "University of Santo Tomas",
    "Far Eastern University",
    "Polytechnic University of the Philippines",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "totalScholars" || name === "amountPerScholar") {
      // Allow empty string for placeholder, otherwise convert to number
      const numValue = value === "" ? "" : parseFloat(value);
      
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('error', 'Image size must be less than 5MB');
        return;
      }
      if (!file.type.match("image.*")) {
        showNotification('error', 'Please upload an image file');
        return;
      }
      
      // Clean up previous preview URL to prevent memory leaks
      if (formData.bannerImagePreview) {
        URL.revokeObjectURL(formData.bannerImagePreview);
      }
      
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        bannerImage: file,
        bannerImagePreview: previewUrl,
      }));
      setErrors((prev) => ({ ...prev, bannerImage: undefined }));
    }
  };

  const addCriteriaTag = (tag: string) => {
    if (tag && !formData.criteriaTags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        criteriaTags: [...prev.criteriaTags, tag],
      }));
    }
  };

  const removeCriteriaTag = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      criteriaTags: prev.criteriaTags.filter((_, index) => index !== indexToRemove),
    }));
  };

  const addRequiredDocument = (doc: string) => {
    if (doc && !formData.requiredDocuments.includes(doc)) {
      setFormData((prev) => ({
        ...prev,
        requiredDocuments: [...prev.requiredDocuments, doc],
      }));
      setNewDocument("");
    }
  };

  const removeRequiredDocument = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter((_, index) => index !== indexToRemove),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.scholarshipType) newErrors.scholarshipType = "Scholarship type is required";
    if (!formData.purpose) newErrors.purpose = "Purpose is required";
    if (!formData.selectedSchool) newErrors.selectedSchool = "School selection is required";
    if (!formData.applicationDeadline) newErrors.applicationDeadline = "Application deadline is required";
    
    // Updated validation for number fields
    const totalScholars = Number(formData.totalScholars);
    const amountPerScholar = Number(formData.amountPerScholar);
    
    if (!formData.totalScholars || totalScholars < 1) {
      newErrors.totalScholars = "Number of scholars must be at least 1";
    }
    if (!formData.amountPerScholar || amountPerScholar <= 0) {
      newErrors.amountPerScholar = "Amount must be greater than 0";
    }

    const selectedDate = new Date(formData.applicationDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (formData.applicationDeadline && selectedDate <= today) {
      newErrors.applicationDeadline = "Deadline must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification('error', 'Please fill in all required fields');
      return;
    }

    console.log("Creating scholarship:", formData);

    // Clean up the preview URL when form is submitted
    if (formData.bannerImagePreview) {
      URL.revokeObjectURL(formData.bannerImagePreview);
    }

    setFormData({
      title: "",
      description: "",
      scholarshipType: scholarshipDetails.types[0] || "",
      purpose: scholarshipDetails.purposes[0] || "",
      totalScholars: "", // Reset to empty string
      amountPerScholar: "", // Reset to empty string
      selectedSchool: "",
      selectionMode: "auto",
      applicationDeadline: "",
      criteriaTags: [],
      requiredDocuments: [],
      bannerImage: null,
      bannerImagePreview: "",
    });
    setErrors({});
    setNewDocument("");
    showNotification('success', 'Scholarship created successfully!');
  };

  const handleDescriptionDone = () => {
    setFormData((prev) => ({ ...prev, description: tempDescription }));
    if (tempDescription.trim()) {
      setErrors((prev) => ({ ...prev, description: undefined }));
    }
    setIsDescriptionModalOpen(false);
  };

  const handleRemoveImage = () => {
    // Clean up the preview URL
    if (formData.bannerImagePreview) {
      URL.revokeObjectURL(formData.bannerImagePreview);
    }
    
    setFormData((prev) => ({ 
      ...prev, 
      bannerImage: null, 
      bannerImagePreview: "" 
    }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const truncateDescription = (description: string, maxWidth: number) => {
    const charWidth = 8;
    const maxChars = Math.floor(maxWidth / charWidth);
    if (description.length <= maxChars) return description;
    return description.slice(0, maxChars - 3) + "...";
  };

  // Clean up preview URL on component unmount
  useEffect(() => {
    return () => {
      if (formData.bannerImagePreview) {
        URL.revokeObjectURL(formData.bannerImagePreview);
      }
    };
  }, []);

  // Loading state for scholarship types and purposes
  if (scholarshipDetails.isLoading) {
    return (
      <div className="flex flex-1 px-40 items-center justify-center min-h-96">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-lg font-medium text-gray-600">Loading scholarship options...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 px-40 gap-5">
      {/* Notification Toast */}
      <NotificationToast 
        notification={notification}
        onClose={() => setNotification({ show: false, type: 'info', message: '' })}
      />

      {/* Form Section */}
      <div className="flex-1 p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <select
                name="scholarshipType"
                value={formData.scholarshipType}
                onChange={handleInputChange}
                className={`w-full px-2 py-2 cursor-pointer text-xs font-semibold border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.scholarshipType ? "border-red-300" : "border-gray-300"
                }`}
                disabled={scholarshipDetails.isLoading}
              >
                {scholarshipDetails.types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className={`w-full px-2 py-2 cursor-pointer text-xs font-semibold border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.purpose ? "border-red-300" : "border-gray-300"
                }`}
                disabled={scholarshipDetails.isLoading}
              >
                {scholarshipDetails.purposes.map((purpose) => (
                  <option key={purpose} value={purpose}>
                    {purpose}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                name="selectionMode"
                value={formData.selectionMode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 cursor-pointer text-xs font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="manual">Manual</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
          
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image Upload */}
              <div className="w-full md:w-[15rem]">
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400 transition-all aspect-square">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {formData.bannerImagePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={formData.bannerImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <p className="text-xs text-gray-600">Drag and drop an image or click to select</p>
                      <p className="text-xs text-gray-500">(Max 5MB, PNG/JPG/JPEG)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title, Description */}
              <div className="w-full md:w-2/3 space-y-3 flex flex-col justify-between">
                <div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full py-3 text-3xl font-semibold transition-all focus:outline-none focus:border-none ${
                      errors.title ? "border-red-300" : ""
                    }`}
                    placeholder="Scholarship Title"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setIsDescriptionModalOpen(true)}
                    className="flex items-center cursor-pointer gap-1 w-full px-3 py-2 text-xs font-semibold bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    {formData.description ? "Edit Description" : "Add Description"}
                  </button>
                </div>

                <div>
                  <input
                    type="number"
                    name="totalScholars"
                    value={formData.totalScholars}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Total Scholars"
                    className={`w-full px-2 py-2 text-xs font-semibold border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.totalScholars ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <input
                    type="number"
                    name="amountPerScholar"
                    value={formData.amountPerScholar}
                    onChange={handleInputChange}
                    min="0.01"
                    step="0.01"
                    placeholder="Amount per Scholar (PHP)"
                    className={`w-full px-2 py-2 text-xs font-semibold border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.amountPerScholar ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description Modal */}
          {isDescriptionModalOpen && (
            <div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
              role="dialog"
              aria-modal="true"
            >
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Scholarship Description</h2>
                  <button
                    type="button"
                    onClick={() => setIsDescriptionModalOpen(false)}
                    className="text-gray-500 cursor-pointer hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <textarea
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  rows={5}
                  className="w-full px-2 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all resize-y"
                  placeholder="Enter scholarship description"
                />
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={handleDescriptionDone}
                    className="px-3 py-2 cursor-pointer text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Financial Details */}
          <div>
           {Number(formData.totalScholars) > 0 && Number(formData.amountPerScholar) > 0 && (
              <div className="bg-blue-50 p-2 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Total Amount: </span>
                  {new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                  }).format(Number(formData.totalScholars) * Number(formData.amountPerScholar))}
                </p>
              </div>
            )}
          </div>

          {/* School & Deadline */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <select
                  name="selectedSchool"
                  value={formData.selectedSchool}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-2 cursor-pointer text-xs font-semibold border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.selectedSchool ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="" className="text-gray-400" disabled>
                    Select a school
                  </option>
                  {schoolOptions.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleInputChange}
                  placeholder="Application Deadline"
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full px-2 py-2 text-xs cursor-pointer font-semibold border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.applicationDeadline ? "border-red-300" : "border-gray-300"
                  } ${formData.applicationDeadline ? 'text-transparent' : ''}`}
                  style={{ colorScheme: 'light' }}
                />
                {!formData.applicationDeadline && (
                  <div className="absolute inset-0 flex items-center px-2 pointer-events-none">
                    <span className="text-xs font-semibold text-gray-500">Application Deadline</span>
                  </div>
                )}
                {formData.applicationDeadline && (
                  <div className="absolute inset-0 flex items-center px-2 pointer-events-none">
                    <span className="text-xs font-semibold text-gray-900">
                      {new Date(formData.applicationDeadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Criteria Tags */}
          <div className="space-y-6">
            <div className="flex gap-3">
              <select
                onChange={(e) => addCriteriaTag(e.target.value)}
                value=""
                className="flex-1 px-2 py-2 text-xs cursor-pointer font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                disabled={scholarshipDetails.isLoading}
              >
                <option value="" className="text-gray-400" disabled>
                  Select criteria
                </option>
                {scholarshipDetails.criteriaTags.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {formData.criteriaTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.criteriaTags.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeCriteriaTag(index)}
                      className="hover:bg-blue-200 rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Required Documents */}
          <div className="space-y-6">
            <div className="flex gap-3">
              <select
                onChange={(e) => addRequiredDocument(e.target.value)}
                value=""
                className="flex-1 px-2 py-2 text-xs cursor-pointer font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                disabled={scholarshipDetails.isLoading}
              >
                <option value="" className="text-gray-400" disabled>
                  Select documents
                </option>
                {scholarshipDetails.documents.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
            </div>

            {formData.requiredDocuments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.requiredDocuments.map((doc, index) => (
                  <span
                    key={index}
                    className="flex items-center cursor-pointer gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold"
                  >
                    {doc}
                    <button
                      type="button"
                      onClick={() => removeRequiredDocument(index)}
                      className="hover:bg-blue-200 rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={scholarshipDetails.isLoading}
            className="px-3 py-2 w-full cursor-pointer font-bold mt-2 text-sm bg-yellow-500 hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Create Scholarship
          </button>
        </form>
      </div>

      {/* Preview Section */}
      <div className="w-full md:w-[28rem] p-6 bg-gray-50">
        <div className="sticky top-0">
          <div className="flex items-center gap-1 mb-2">
            <Info className="w-3 h-3 text-blue-600" />
            <h3 className="text-xs font-medium text-gray-700">Live Preview</h3>
          </div>

          <ScholarshipBanner
            scholarship={{
              ...formData,
              description: truncateDescription(formData.description, 384),
              // Pass the preview image URL to the banner component
              imageUrl: formData.bannerImagePreview || null,
            }}
            isPreview={true}
          />
        </div>
      </div>
    </div>
  );
}