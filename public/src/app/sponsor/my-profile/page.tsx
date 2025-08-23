"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  FileText, 
  Upload, 
  Plus, 
  Eye, 
  Download, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Shield,
  Award,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Types for verifiable credentials
interface VerifiableCredential {
  id: string;
  type: "transcript" | "certificate" | "award" | "diploma" | "other";
  title: string;
  description: string;
  issuer: string;
  issuedAt: string;
  status: "active" | "expired" | "revoked";
  documentHash: string;
  metadataURI: string;
  fileUrl: string;
  fileName: string;
  fileType: "image" | "pdf";
  fileSize: number;
  isVerified: boolean;
  verificationDate?: string;
  verifiedBy?: string;
}

// Mock sponsor profile data
const mockSponsorProfile = {
  name: "Louigie Caminoy",
  email: "user@umak@edu.ph",
  phone: "+63 912 345 6789",
  location: "Makati City, Metro Manila",
  profileImage: "/iSkolar.png"
};

// Mock data for demonstration
const mockCredentials: VerifiableCredential[] = [
  {
    id: "1",
    type: "transcript",
    title: "Academic Transcript",
    description: "Official academic transcript for the current semester",
    issuer: "University of Makati",
    issuedAt: "2024-01-15",
    status: "active",
    documentHash: "0x1234567890abcdef...",
    metadataURI: "ipfs://QmExample...",
    fileUrl: "/documents/transcript.pdf",
    fileName: "transcript.pdf",
    fileType: "pdf",
    fileSize: 2.5,
    isVerified: true,
    verificationDate: "2024-01-16",
    verifiedBy: "University of Makati"
  },
  {
    id: "2",
    type: "certificate",
    title: "Dean's List Certificate",
    description: "Certificate for achieving Dean's List status",
    issuer: "University of Makati",
    issuedAt: "2024-01-10",
    status: "active",
    documentHash: "0xabcdef1234567890...",
    metadataURI: "ipfs://QmExample2...",
    fileUrl: "/documents/deans-list.jpg",
    fileName: "deans-list.jpg",
    fileType: "image",
    fileSize: 1.2,
    isVerified: true,
    verificationDate: "2024-01-11",
    verifiedBy: "University of Makati"
  }
];

// Notification Toast Component (following existing pattern)
const NotificationToast = ({ 
  notification, 
  onClose 
}: { 
  notification: { show: boolean; type: 'success' | 'error' | 'info'; message: string }; 
  onClose: () => void 
}) => (
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

// Credential Upload Modal
const CredentialUploadModal = ({ 
  isOpen, 
  onClose, 
  onUpload 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onUpload: (credential: Omit<VerifiableCredential, 'id' | 'documentHash' | 'metadataURI' | 'isVerified' | 'verificationDate' | 'verifiedBy'>) => void;
}) => {
  const [formData, setFormData] = useState({
    type: "transcript" as VerifiableCredential['type'],
    title: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid file type (JPEG, PNG, or PDF)');
        return;
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !formData.title.trim()) {
      return;
    }

    setIsUploading(true);
    
    // Simulate file upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newCredential = {
      type: formData.type,
      title: formData.title,
      description: formData.description,
      issuer: "University of Makati", // Default issuer
      issuedAt: new Date().toISOString().split('T')[0],
      status: "active" as const,
      fileUrl: URL.createObjectURL(selectedFile),
      fileName: selectedFile.name,
      fileType: selectedFile.type === 'application/pdf' ? 'pdf' as const : 'image' as const,
      fileSize: Math.round(selectedFile.size / (1024 * 1024) * 100) / 100
    };

    onUpload(newCredential);
    setIsUploading(false);
    onClose();
    setFormData({ type: "transcript", title: "", description: "" });
    setSelectedFile(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upload New Credential</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Credential Type</Label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as VerifiableCredential['type'] }))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="transcript">Academic Transcript</option>
              <option value="certificate">Certificate</option>
              <option value="award">Award</option>
              <option value="diploma">Diploma</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter credential title"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Description</Label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter credential description"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Document File *</Label>
            <div className="mt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {selectedFile ? selectedFile.name : "Choose File"}
              </Button>
              {selectedFile && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || !formData.title.trim() || isUploading}
              className="flex-1"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Credential Card Component
const CredentialCard = ({ 
  credential, 
  onView, 
  onDownload, 
  onDelete 
}: { 
  credential: VerifiableCredential; 
  onView: (credential: VerifiableCredential) => void; 
  onDownload: (credential: VerifiableCredential) => void; 
  onDelete: (credential: VerifiableCredential) => void; 
}) => {
  const getTypeIcon = (type: VerifiableCredential['type']) => {
    switch (type) {
      case 'transcript': return <FileText className="w-5 h-5" />;
      case 'certificate': return <Award className="w-5 h-5" />;
      case 'award': return <Award className="w-5 h-5" />;
      case 'diploma': return <GraduationCap className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: VerifiableCredential['type']) => {
    switch (type) {
      case 'transcript': return 'text-blue-600 bg-blue-50';
      case 'certificate': return 'text-green-600 bg-green-50';
      case 'award': return 'text-purple-600 bg-purple-50';
      case 'diploma': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView(credential)}
    >
      {/* File Preview */}
      <div className="mb-4">
        {credential.fileType === 'pdf' ? (
          <div className="w-full h-32 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
        ) : (
          <div className="w-full h-32 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={credential.fileUrl}
              alt={credential.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Credential Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${getTypeColor(credential.type)}`}>
              {getTypeIcon(credential.type)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{credential.title}</h3>
              <p className="text-xs text-gray-500">{credential.issuer}</p>
            </div>
          </div>
          {credential.isVerified && (
            <div className="p-1 bg-emerald-50 rounded-full" title="Verified">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
          )}
        </div>

        {credential.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{credential.description}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDownload(credential)}
          className="flex-1 text-xs"
        >
          <Download className="w-3 h-3 mr-1" />
          Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(credential)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

// Credential Viewer Modal
const CredentialViewerModal = ({ 
  credential, 
  isOpen, 
  onClose 
}: { 
  credential: VerifiableCredential | null; 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  if (!isOpen || !credential) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Credential Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Preview */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Document Preview</h3>
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              {credential.fileType === 'pdf' ? (
                <div className="text-center py-8">
                  <FileText className="w-20 h-20 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium">{credential.fileName}</p>
                  <p className="text-xs text-gray-500 mb-4">PDF Document</p>
                  <Button
                    variant="outline"
                    onClick={() => window.open(credential.fileUrl, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Open PDF
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <img
                    src={credential.fileUrl}
                    alt={credential.title}
                    className="max-w-full h-auto rounded-lg shadow-sm mx-auto"
                  />
                  <p className="text-xs text-gray-500 mt-3">{credential.fileName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Credential Information */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Title</Label>
                  <p className="text-sm text-gray-900 font-medium">{credential.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Type</Label>
                  <p className="text-sm text-gray-900 capitalize">{credential.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Issued Date</Label>
                  <p className="text-sm text-gray-900">{new Date(credential.issuedAt).toLocaleDateString()}</p>
                </div>
                {credential.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <p className="text-sm text-gray-900">{credential.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Details */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Verification Details</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Verification Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {credential.isVerified ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-emerald-600 font-medium">Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600 font-medium">Not Verified</span>
                      </>
                    )}
                  </div>
                </div>
                {credential.verifiedBy && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Verified By</Label>
                    <p className="text-sm text-gray-900 font-medium">{credential.verifiedBy}</p>
                  </div>
                )}
                {credential.verificationDate && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Verified On</Label>
                    <p className="text-sm text-gray-900">{new Date(credential.verificationDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Blockchain Details */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Blockchain Details</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Document Hash</Label>
                  <p className="text-sm text-gray-900 font-mono break-all bg-gray-50 p-2 rounded text-xs">{credential.documentHash}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Metadata URI</Label>
                  <p className="text-sm text-gray-900 font-mono break-all bg-gray-50 p-2 rounded text-xs">{credential.metadataURI}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SponsorMyProfilePage() {
  const [credentials, setCredentials] = useState<VerifiableCredential[]>(mockCredentials);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<VerifiableCredential | null>(null);
  const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error' | 'info'; message: string }>({ show: false, type: 'success', message: '' });

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
  };

  const handleUploadCredential = (newCredential: Omit<VerifiableCredential, 'id' | 'documentHash' | 'metadataURI' | 'isVerified' | 'verificationDate' | 'verifiedBy'>) => {
    const credential: VerifiableCredential = {
      ...newCredential,
      id: Date.now().toString(),
      documentHash: `0x${Math.random().toString(16).substr(2, 64)}...`,
      metadataURI: `ipfs://Qm${Math.random().toString(16).substr(2, 64)}...`,
      isVerified: false
    };

    setCredentials(prev => [credential, ...prev]);
    showNotification('success', 'Credential uploaded successfully!');
  };

  const handleViewCredential = (credential: VerifiableCredential) => {
    setSelectedCredential(credential);
    setIsViewerModalOpen(true);
  };

  const handleDownloadCredential = (credential: VerifiableCredential) => {
    // In a real app, this would trigger a download
    showNotification('success', `Downloading ${credential.fileName}...`);
  };

  const handleDeleteCredential = (credential: VerifiableCredential) => {
    if (confirm(`Are you sure you want to delete "${credential.title}"?`)) {
      setCredentials(prev => prev.filter(c => c.id !== credential.id));
      showNotification('success', 'Credential deleted successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center text-center">
            {/* Profile Image */}
            <div className="w-30 h-30 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
              <img
                src={mockSponsorProfile.profileImage}
                alt={mockSponsorProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Profile Info */}
            <h1 className="text-lg font-bold text-gray-900 mb-2">{mockSponsorProfile.name}</h1>
            {/* <p className="text-gray-600 text-sm mb-1">{mockSponsorProfile}</p>
            <p className="text-gray-600 text-sm mb-3">{mockSponsorProfile} • {mockSponsorProfile}</p> */}
            
            {/* Contact Info */}
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{mockSponsorProfile.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{mockSponsorProfile.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{mockSponsorProfile.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credentials Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Header */}
        <div className="flex items-center justify-end mb-6">
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-600 text-sm hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Upload
          </Button>
        </div>

        {/* Separator Line */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Credentials Grid */}
        {credentials.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No credentials yet</h3>
            <p className="text-gray-600 mb-4">Start building your academic portfolio by uploading your first credential</p>
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Your First Credential
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {credentials.map((credential) => (
              <CredentialCard
                key={credential.id}
                credential={credential}
                onView={handleViewCredential}
                onDownload={handleDownloadCredential}
                onDelete={handleDeleteCredential}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CredentialUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadCredential}
      />

      <CredentialViewerModal
        credential={selectedCredential}
        isOpen={isViewerModalOpen}
        onClose={() => {
          setIsViewerModalOpen(false);
          setSelectedCredential(null);
        }}
      />

      {/* Notification Toast */}
      <NotificationToast
        notification={notification}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}
