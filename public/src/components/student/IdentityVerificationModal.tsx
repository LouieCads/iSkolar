// public/src/components/student/IdentityVerificationModal.tsx

'use client';

import React, { useState } from 'react';
import { CheckCircle, User, MapPin, FileText, Shield, X, AlertCircle, Loader2, Camera, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useKycStatus } from '@/hooks/useIdentityStatus';
import { kycService } from '@/services/studentIdentityVerificationService';

const STEPS = [
	{ title: 'Personal Info', icon: User, gradient: 'from-indigo-500 to-purple-600' },
	{ title: 'Address', icon: MapPin, gradient: 'from-teal-500 to-cyan-600' },
	{ title: 'ID Details', icon: FileText, gradient: 'from-amber-500 to-orange-600' },
	{ title: 'Selfie', icon: Camera, gradient: 'from-violet-500 to-fuchsia-600' },
	{ title: 'Declaration', icon: Shield, gradient: 'from-rose-500 to-pink-600' },
];

const INITIAL_FORM_DATA = {
	// Personal Info
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

const REQUIRED_FIELDS = {
	1: ['firstName', 'lastName', 'dateOfBirth', 'nationality', 'contactEmail', 'contactNumber'],
	2: ['country', 'stateOrProvince', 'city', 'districtOrBarangay', 'street', 'postalCode'],
	3: ['idType', 'idNumber', 'expiryDate', 'frontImageUrl', 'backImageUrl'],
	4: ['selfiePhotoUrl'],
	5: ['consent'],
};

const ID_TYPES = [
	'Passport',
	'National ID',
	"Driver's License",
	'Student ID',
	'Voters ID',
	'SSS ID',
	'PhilHealth ID',
	'TIN ID',
	'Postal ID',
	'PRC ID'
];

const LoadingSpinner = ({ message = "Loading..." }) => (
	<div className="flex items-center justify-center p-4">
		<Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
		<span className="ml-2 text-sm text-gray-600">{message}</span>
	</div>
);

const StepHeader = ({ step, icon: Icon, gradient }) => (
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

const FormField = ({ label, id, type = "text", required = false, children, ...props }: FormFieldProps) => (
	<div>
		<Label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
			{label} {required && '*'}
		</Label>
		{children || <Input id={id} type={type} required={required} {...props} />}
	</div>
);

const SelectField = ({ label, id, value, onValueChange, options, required = false }) => (
	<FormField label={label} id={id} required={required}>
		<Select name={id} value={value} onValueChange={onValueChange} required={required}>
			<SelectTrigger id={id} className="w-full">
				<SelectValue placeholder={`Select ${label.toLowerCase()}`} />
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => (
					<SelectItem key={option} value={option}>{option}</SelectItem>
				))}
			</SelectContent>
		</Select>
	</FormField>
);

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
      className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all bg-white"
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

export default function KycVerificationModal({ isOpen = true, onClose = () => {} }) {
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState(INITIAL_FORM_DATA);
	const [notification, setNotification] = useState({ show: false, type: '', message: '' });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	const { status: kycStatus, loading: kycLoading, refetch: refetchKycStatus } = useKycStatus();

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

	const handleFileChange = async (e) => {
		const { name, files } = e.target;
		const file = files[0];
		
		if (!file) return;

		try {
			setIsUploading(true);
			
			let documentType;
			let urlFieldName; // New variable to determine the correct URL field
			if (name === 'frontImageFile') {
				documentType = 'idFront';
				urlFieldName = 'frontImageUrl';
			} else if (name === 'backImageFile') {
				documentType = 'idBack';
				urlFieldName = 'backImageUrl';
			} else if (name === 'selfieFile') {
				documentType = 'selfie';
				urlFieldName = 'selfiePhotoUrl'; // Use selfiePhotoUrl instead of selfieUrl
			} else {
				showNotification('error', 'Invalid file type');
				return;
			}

			const uploadResult = await kycService.uploadDocument(file, documentType);
			if (!uploadResult.fileUrl) {
				throw new Error('No file URL returned from server');
			}
			
			setFormData(prev => {
				const newFormData = {
					...prev,
					[name]: file,
					[urlFieldName]: uploadResult.fileUrl, // Use the correct URL field name
				};
				console.log('Updated formData:', newFormData); // Debug: Log updated formData
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
		console.log('Missing fields in step', currentStep, ':', missingFields); // Debug: Log missing fields
		console.log('Current formData:', formData); // Debug: Log entire formData

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
			showNotification('error', 'Consent is required to proceed');
			return;
		}

		try {
			setIsSubmitting(true);

			const verificationData = {
				declarationsAndConsent: formData.consent,
				proofOfIdentity: {
					fullName: {
						firstName: formData.firstName,
						middleName: formData.middleName,
						lastName: formData.lastName,
					},
					dateOfBirth: formData.dateOfBirth,
					nationality: formData.nationality,
					contactEmail: formData.contactEmail,
					contactNumber: formData.contactNumber,
					address: {
						country: formData.country,
						stateOrProvince: formData.stateOrProvince,
						city: formData.city,
						districtOrBarangay: formData.districtOrBarangay,
						street: formData.street,
						postalCode: formData.postalCode,
					},
					idDetails: {
						idType: formData.idType,
						frontImageUrl: formData.frontImageUrl,
						backImageUrl: formData.backImageUrl,
						idNumber: formData.idNumber,
						expiryDate: formData.expiryDate,
					},
					selfiePhotoUrl: formData.selfiePhotoUrl,
				},
			};

			const response = await kycService.submitStudentKyc(verificationData);
			await refetchKycStatus();
			
			showNotification('success', response.message || 'Identity verification submitted successfully');
			setTimeout(() => {
				onClose();
				window.location.reload();
			}, 2000);

		} catch (error) {
			console.error('Identity verification submission error:', error);
			const message = error.response?.data?.message || 
				(error.response?.status === 401 ? 'Please log in again' : 'Error submitting identity verification');
			showNotification('error', message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderPersonalInfo = () => (
		<div className="space-y-4 animate-fadeIn">
			<StepHeader step="Personal Information" icon={User} gradient="from-indigo-500 to-purple-600" />
			
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
					placeholder="Enter email address" 
					required 
				/>
				<FormField 
					label="Contact Number" 
					id="contactNumber" 
					name="contactNumber" 
					type="tel" 
					value={formData.contactNumber} 
					onChange={handleInputChange} 
					placeholder="Enter phone number" 
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

	const renderIdDocuments = () => (
		<div className="space-y-4 animate-fadeIn">
			<StepHeader step="ID Details" icon={FileText} gradient="from-amber-500 to-orange-600" />
			
			<div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
				<p className="text-sm text-amber-700">
					<strong>Requirements:</strong> Please upload clear, high-quality images of your government-issued ID. Make sure all text is readable and the images are well-lit.
				</p>
			</div>
			
			{/* ID Type and Details */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<SelectField 
					label="ID Type" 
					id="idType" 
					value={formData.idType} 
					onValueChange={(value) => handleSelectChange('idType', value)} 
					options={ID_TYPES} 
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

	const renderSelfie = () => (
		<div className="space-y-4 animate-fadeIn">
			<StepHeader step="Selfie Photo" icon={Camera} gradient="from-violet-500 to-fuchsia-600" />
			
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
				<div className="flex items-center justify-center p-4 bg-violet-50 rounded-md">
					<Loader2 className="w-4 h-4 animate-spin text-violet-600 mr-2" />
					<span className="text-sm text-violet-600">Uploading photo...</span>
				</div>
			)}
		</div>
	);

	const renderDeclarationConsent = () => (
		<div className="space-y-4 animate-fadeIn">
			<StepHeader step="Declaration & Consent" icon={Shield} gradient="from-rose-500 to-pink-600" />
			
			<div className="space-y-4">
				<div className="p-4 bg-rose-50 border border-rose-200 rounded-md">
					<h4 className="text-sm font-semibold text-rose-800 mb-2">Declaration</h4>
					<p className="text-xs text-rose-700 mb-3">
						I hereby declare that:
					</p>
					<ul className="text-xs text-rose-700 space-y-1 list-disc list-inside">
						<li>All information provided in this application is true, accurate, and complete to the best of my knowledge</li>
						<li>The documents uploaded are authentic and belong to me</li>
						<li>I understand that providing false information may result in rejection of this application</li>
						<li>I consent to the verification of the information and documents provided</li>
					</ul>
				</div>

				<div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
					<h4 className="text-sm font-semibold text-blue-800 mb-2">Data Privacy Consent</h4>
					<p className="text-xs text-blue-700 mb-3">
						By submitting this application, I consent to:
					</p>
					<ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
						<li>The collection, processing, and storage of my personal data for KYC verification purposes</li>
						<li>Data processing in accordance with applicable data protection laws</li>
						<li>Sharing of necessary information with authorized verification partners</li>
						<li>Retention of data for regulatory compliance and audit purposes</li>
					</ul>
				</div>

				<div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
					<div className="flex items-start space-x-3">
						<Checkbox
							id="consent"
							name="consent"
							checked={formData.consent}
							onCheckedChange={(checked) => handleSelectChange('consent', checked)}
							className="h-4 w-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500 mt-0.5"
							required
						/>
						<Label htmlFor="consent" className="text-sm text-gray-700 leading-relaxed">
							<span className="font-medium">I agree to the terms and conditions</span> and confirm that I have read, understood, and accept the declaration and data privacy consent statements above. <span className="text-red-500">*</span>
						</Label>
					</div>
				</div>
			</div>
		</div>
	);

	if (!isOpen) return null;

	if (kycLoading) return <LoadingSpinner message="Loading verification status..." />;

	const stepComponents = [
		renderPersonalInfo,
		renderAddress,
		renderIdDocuments,
		renderSelfie,
		renderDeclarationConsent
	];

	return (
		<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
				{/* Header */}
				<div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-4 py-3 text-white flex justify-between items-center">
					<div>
						<h2 className="text-lg font-semibold">Student Identity Verification</h2>
						<p className="text-xs text-indigo-100">Know Your Customer - Identity Verification</p>
					</div>
					<button onClick={onClose} className="w-7 h-7 rounded-full cursor-pointer bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
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
						disabled={(currentStep === 5 && !formData.consent) || isSubmitting || isUploading} 
						className={`px-5 py-2 text-sm rounded-md transition-all flex items-center ${
							(currentStep === 5 && !formData.consent) || isSubmitting || isUploading ? 
							'bg-gray-300 cursor-not-allowed text-gray-500' : 
							'bg-gradient-to-r cursor-pointer from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg'
						}`}
					>
						{isSubmitting ? (
							<div className='flex items-center justify-center'>
								<Loader2 className="w-4 h-4 animate-spin mr-2" />
								Submitting...
							</div>
						) : isUploading ? (
							<div className='flex items-center justify-center'>
								<Upload className="w-4 h-4 mr-2" />
								Uploading...
							</div>
						) : currentStep === 5 ? (
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