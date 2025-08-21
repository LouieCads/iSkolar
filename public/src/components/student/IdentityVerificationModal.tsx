'use client';

import React, { useState } from 'react';
import { CheckCircle, User, MapPin, GraduationCap, FileText, Shield, X, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAcademicDetails } from '@/hooks/useAcademicDetails';
import { useKycStatus } from '@/hooks/useIdentityStatus';
import { kycService } from '@/services/kycService';

const STEPS = [
	{ title: 'Student Info', icon: User, gradient: 'from-indigo-500 to-purple-600' },
	{ title: 'Address', icon: MapPin, gradient: 'from-teal-500 to-cyan-600' },
	{ title: 'Education', icon: GraduationCap, gradient: 'from-violet-500 to-fuchsia-600' },
	{ title: 'Documents', icon: FileText, gradient: 'from-amber-500 to-orange-600' },
	{ title: 'Declaration', icon: Shield, gradient: 'from-rose-500 to-pink-600' },
];

const INITIAL_FORM_DATA = {
	firstName: '', middleName: '', lastName: '', email: '', mobileNumber: '',
	gender: '', age: '', civilStatus: '', nationality: '', studentId: '',
	schoolName: '', schoolEmail: '', yearLevel: '', course: '', semestersPerYear: '',
	dateOfBirth: '', placeOfBirth: '', country: '', province: '', city: '',
	barangay: '', street: '', zipCode: '', elementarySchool: '', elementaryYear: '',
	juniorHighSchool: '', juniorHighYear: '', seniorHighSchool: '', seniorHighYear: '',
	college: '', expectedGraduation: '', certificateOfRegistration: null,
	reportOfGrades: null, consent: false,
};

const REQUIRED_FIELDS = {
	1: ['firstName', 'lastName', 'email', 'mobileNumber', 'gender', 'age', 'civilStatus', 'nationality', 'studentId', 'schoolName', 'schoolEmail', 'yearLevel', 'course', 'semestersPerYear', 'dateOfBirth', 'placeOfBirth'],
	2: ['country', 'province', 'city', 'barangay', 'street', 'zipCode'],
	3: ['elementarySchool', 'elementaryYear', 'juniorHighSchool', 'juniorHighYear', 'seniorHighSchool', 'seniorHighYear', 'college', 'expectedGraduation'],
	4: ['certificateOfRegistration', 'reportOfGrades'],
	5: ['consent'],
};

const LoadingSpinner = ({ message = "Loading academic details..." }) => (
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
  [key: string]: any; // For additional props
}

const FormField = ({ label, id, type = "text", required = false, children, ...props }: FormFieldProps) => (
	<div>
		<Label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
			{label} {required && '*'}
		</Label>
		{children || <Input id={id} type={type} required={required} {...props} />}
	</div>
);

const SelectField = ({ label, id, value, onValueChange, options, loading, error, required = false }) => (
	<FormField label={label} id={id} required={required}>
		<Select name={id} value={value} onValueChange={onValueChange} required={required}>
			<SelectTrigger id={id} className="w-full">
				<SelectValue placeholder={`Select ${label.toLowerCase()}`} />
			</SelectTrigger>
			<SelectContent>
				{loading ? (
					<SelectItem value="loading" disabled>Loading {label.toLowerCase()}...</SelectItem>
				) : error ? (
					<SelectItem value="error" disabled>Error loading {label.toLowerCase()}</SelectItem>
				) : options.length === 0 ? (
					<SelectItem value="none" disabled>No {label.toLowerCase()} available</SelectItem>
				) : (
					options.map((option) => (
						<SelectItem key={option} value={option}>{option}</SelectItem>
					))
				)}
			</SelectContent>
		</Select>
	</FormField>
);

const EducationSection = ({ title, schoolField, yearField, formData, onChange }) => (
	<div className="border rounded-md p-3">
		<h4 className="text-sm font-semibold text-gray-800 mb-2">{title}</h4>
		<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
			<FormField
				label="School Name"
				id={schoolField}
				name={schoolField}
				value={formData[schoolField]}
				onChange={onChange}
				placeholder="Enter school name"
				required
			/>
			<FormField
				label="Year Graduated"
				id={yearField}
				name={yearField}
				type="number"
				value={formData[yearField]}
				onChange={onChange}
				placeholder="Enter year"
				required
			/>
		</div>
	</div>
);

const FileUpload = ({ label, id, formData, onChange, required = false }) => (
  <div className="border rounded-md p-3 bg-gray-50">
    <Label htmlFor={id} className="text-sm font-medium text-gray-800 block mb-2">
      {label} {required && '*'}
    </Label>
    <input
      id={id}
      type="file"
      name={id}
      onChange={onChange}
      accept=".pdf,.jpg,.jpeg,.png"
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

	const academicDetails = useAcademicDetails();
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

	const handleFileChange = (e) => {
		const { name, files } = e.target;
		setFormData(prev => ({ ...prev, [name]: files[0] }));
	};

	const validateStep = () => {
		const missingFields = REQUIRED_FIELDS[currentStep].filter(
			field => !formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')
		);

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

			const studentData = {
				declarationsAndConsent: formData.consent,
				student: {
					fullName: {
						firstName: formData.firstName,
						middleName: formData.middleName,
						lastName: formData.lastName,
					},
					email: formData.email,
					mobileNumber: formData.mobileNumber,
					gender: formData.gender,
					age: parseInt(formData.age),
					civilStatus: formData.civilStatus,
					nationality: formData.nationality,
					studentIdNumber: formData.studentId,
					schoolName: formData.schoolName,
					schoolEmail: formData.schoolEmail,
					yearLevel: formData.yearLevel,
					course: formData.course,
					semestersPerYear: parseInt(formData.semestersPerYear),
					dateOfBirth: formData.dateOfBirth,
					placeOfBirth: formData.placeOfBirth,
					address: {
						country: formData.country,
						province: formData.province,
						city: formData.city,
						barangay: formData.barangay,
						street: formData.street,
						zipCode: formData.zipCode,
					},
					educationalBackground: {
						elementary: {
							name: formData.elementarySchool,
							yearGraduated: parseInt(formData.elementaryYear),
						},
						juniorHigh: {
							name: formData.juniorHighSchool,
							yearGraduated: parseInt(formData.juniorHighYear),
						},
						seniorHigh: {
							name: formData.seniorHighSchool,
							yearGraduated: parseInt(formData.seniorHighYear),
						},
						college: {
							name: formData.college,
							expectedGraduation: parseInt(formData.expectedGraduation),
						},
					},
				},
				documents: [formData.certificateOfRegistration, formData.reportOfGrades].filter(Boolean),
			};

			const response = await kycService.submitStudentKyc(studentData);
			await refetchKycStatus();
			
			showNotification('success', response.message || 'KYC submitted successfully');
			setTimeout(() => {
      onClose();
      window.location.reload();
    }, 2000);

		} catch (error) {
			console.error('KYC submission error:', error);
			const message = error.response?.data?.message || 
				(error.response?.status === 401 ? 'Please log in again' : 'Error submitting KYC');
			showNotification('error', message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderStudentInfo = () => {
		if (academicDetails.isLoading) return <LoadingSpinner />;
		if (academicDetails.error) {
			return (
				<div className="text-center p-4">
					<p className="text-sm text-red-600">Error loading academic details. Please try again later.</p>
				</div>
			);
		}

		return (
			<div className="space-y-4 animate-fadeIn">
				<StepHeader step="Student Info" icon={User} gradient="from-indigo-500 to-purple-600" />
				
				{/* Name Fields */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<FormField label="First Name" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Enter first name" required />
					<FormField label="Middle Name" id="middleName" name="middleName" value={formData.middleName} onChange={handleInputChange} placeholder="Enter middle name" />
					<FormField label="Last Name" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Enter last name" required />
				</div>

				{/* Contact Fields */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<FormField label="Email" id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email" required />
					<FormField label="Mobile Number" id="mobileNumber" name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleInputChange} placeholder="Enter mobile number" required />
				</div>

				{/* Personal Info */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<SelectField label="Gender" id="gender" value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)} options={['male', 'female']} loading={false} error={false} required />
					<FormField label="Age" id="age" name="age" type="number" value={formData.age} onChange={handleInputChange} placeholder="Enter age" required />
					<SelectField label="Civil Status" id="civilStatus" value={formData.civilStatus} onValueChange={(value) => handleSelectChange('civilStatus', value)} options={['single', 'married', 'divorced', 'widowed']} loading={false} error={false} required />
				</div>

				{/* Additional Info */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<FormField label="Nationality" id="nationality" name="nationality" value={formData.nationality} onChange={handleInputChange} placeholder="Enter nationality" required />
					<FormField label="Student ID" id="studentId" name="studentId" value={formData.studentId} onChange={handleInputChange} placeholder="Enter student ID" required />
				</div>

				{/* Academic Info */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<FormField label="School Name" id="schoolName" name="schoolName" value={formData.schoolName} onChange={handleInputChange} placeholder="Enter school name" required />
					<FormField label="School Email" id="schoolEmail" name="schoolEmail" type="email" value={formData.schoolEmail} onChange={handleInputChange} placeholder="Enter school email" required />
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<SelectField label="Year Level" id="yearLevel" value={formData.yearLevel} onValueChange={(value) => handleSelectChange('yearLevel', value)} options={academicDetails.yearLevel} loading={academicDetails.isLoading} error={academicDetails.error} required />
					<SelectField label="Course" id="course" value={formData.course} onValueChange={(value) => handleSelectChange('course', value)} options={academicDetails.course} loading={academicDetails.isLoading} error={academicDetails.error} required />
					<SelectField label="Semesters/Year" id="semestersPerYear" value={formData.semestersPerYear} onValueChange={(value) => handleSelectChange('semestersPerYear', value)} options={academicDetails.semester} loading={academicDetails.isLoading} error={academicDetails.error} required />
				</div>

				{/* Birth Info */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<FormField label="Date of Birth" id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} required />
					<FormField label="Place of Birth" id="placeOfBirth" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleInputChange} placeholder="Enter place of birth" required />
				</div>
			</div>
		);
	};

	const renderAddress = () => (
		<div className="space-y-4 animate-fadeIn">
			<StepHeader step="Address" icon={MapPin} gradient="from-teal-500 to-cyan-600" />
			
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

	const renderEducationalBackground = () => (
		<div className="space-y-4 animate-fadeIn">
			<StepHeader step="Educational Background" icon={GraduationCap} gradient="from-violet-500 to-fuchsia-600" />
			
			<div className="space-y-4">
				<EducationSection title="Elementary" schoolField="elementarySchool" yearField="elementaryYear" formData={formData} onChange={handleInputChange} />
				<EducationSection title="Junior High" schoolField="juniorHighSchool" yearField="juniorHighYear" formData={formData} onChange={handleInputChange} />
				<EducationSection title="Senior High" schoolField="seniorHighSchool" yearField="seniorHighYear" formData={formData} onChange={handleInputChange} />
				
				<div className="border rounded-md p-3">
					<h4 className="text-sm font-semibold text-gray-800 mb-2">College</h4>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<FormField label="University Name" id="college" name="college" value={formData.college} onChange={handleInputChange} placeholder="Enter university name" required />
						<FormField label="Expected Graduation" id="expectedGraduation" name="expectedGraduation" type="number" value={formData.expectedGraduation} onChange={handleInputChange} placeholder="Enter year" required />
					</div>
				</div>
			</div>
		</div>
	);

	const renderDocuments = () => (
		<div className="space-y-4 animate-fadeIn">
			<StepHeader step="Documents" icon={FileText} gradient="from-amber-500 to-orange-600" />
			
			<div className="space-y-4">
				<FileUpload label="Certificate of Registration / Student ID" id="certificateOfRegistration" formData={formData} onChange={handleFileChange} required />
				<FileUpload label="Latest Report of Grades" id="reportOfGrades" formData={formData} onChange={handleFileChange} required />
			</div>
		</div>
	);

	const renderDeclarationConsent = () => (
		<div className="space-y-4 animate-fadeIn">
			<StepHeader step="Declaration & Consent" icon={Shield} gradient="from-rose-500 to-pink-600" />
			
			<div className="p-3 bg-rose-50 rounded-md">
				<p className="text-xs text-gray-700 mb-3">
					I declare that all information provided is true and accurate. I understand that false information may lead to application rejection. I consent to the collection, processing, and storage of my personal data for KYC verification per applicable laws.
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
					<Label htmlFor="consent" className="text-xs text-gray-700">
						I agree to the terms and conditions *
					</Label>
				</div>
			</div>
		</div>
	);

	if (!isOpen) return null;

	if (kycLoading) return <LoadingSpinner message="Loading KYC status..." />;

	const stepComponents = [
		renderStudentInfo,
		renderAddress,
		renderEducationalBackground,
		renderDocuments,
		renderDeclarationConsent
	];

	return (
		<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
				{/* Header */}
				<div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-4 py-3 text-white flex justify-between items-center">
					<h2 className="text-lg font-semibold">KYC Verification</h2>
					<button onClick={onClose} className="w-7 h-7 rounded-full cursor-pointer bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
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
						disabled={currentStep === 5 && !formData.consent} 
						className={`px-5 py-1.5 text-sm rounded-md transition-all ${
							currentStep === 5 && !formData.consent ? 'bg-gray-300 cursor-pointer text-gray-500 cursor-not-allowed' : 
							'bg-gradient-to-r cursor-pointer from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
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