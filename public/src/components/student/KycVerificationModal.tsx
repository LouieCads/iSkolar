'use client';

import React, { useState } from 'react';
import { CheckCircle, User, MapPin, GraduationCap, FileText, Shield, X, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAcademicDetails } from '@/hooks/useAcademicDetails';
import { useKycStatus } from '@/hooks/useKycStatus';
import { kycService } from '@/services/kycService';

const steps = [
	{ title: 'Student Info', icon: User },
	{ title: 'Address', icon: MapPin },
	{ title: 'Education', icon: GraduationCap },
	{ title: 'Documents', icon: FileText },
	{ title: 'Declaration', icon: Shield },
];

const LoadingSpinner = () => (
	<div className="flex items-center justify-center p-4">
		<Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
		<span className="ml-2 text-sm text-gray-600">Loading academic details...</span>
	</div>
);

export default function KycVerificationModal({ isOpen = true, onClose = () => {} }) {
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState({
		firstName: '',
		middleName: '',
		lastName: '',
		email: '',
		mobileNumber: '',
		gender: '',
		age: '',
		civilStatus: '',
		nationality: '',
		studentId: '',
		schoolName: '',
		schoolEmail: '',
		yearLevel: '',
		course: '',
		semestersPerYear: '',
		dateOfBirth: '',
		placeOfBirth: '',
		country: '',
		province: '',
		city: '',
		barangay: '',
		street: '',
		zipCode: '',
		elementarySchool: '',
		elementaryYear: '',
		juniorHighSchool: '',
		juniorHighYear: '',
		seniorHighSchool: '',
		seniorHighYear: '',
		college: '',
		expectedGraduation: '',
		certificateOfRegistration: null,
		reportOfGrades: null,
		consent: false,
	});
	const [notification, setNotification] = useState({ show: false, type: '', message: '' });
	const academicDetails = useAcademicDetails();
	const { status: kycStatus, loading: kycLoading, refetch: refetchKycStatus } = useKycStatus();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

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

	// Add file upload handling
	const handleFileUpload = async (file: File, type: string) => {
		try {
			setUploadProgress((prev) => ({ ...prev, [type]: 0 }));
			const response = await kycService.uploadDocument(file, type);

			setFormData((prev) => ({
				...prev,
				[type]: response.document,
			}));

			setUploadProgress((prev) => ({ ...prev, [type]: 100 }));

			setNotification({
				show: true,
				type: 'success',
				message: 'Document uploaded successfully',
			});
		} catch (error: any) {
			setNotification({
				show: true,
				type: 'error',
				message: error.message || 'Error uploading document',
			});
		} finally {
			setTimeout(() => {
				setUploadProgress((prev) => {
					const newProgress = { ...prev };
					delete newProgress[type];
					return newProgress;
				});
			}, 1000);
		}
	};

	const validateStep = () => {
		const requiredFields = {
			1: [
				'firstName',
				'lastName',
				'email',
				'mobileNumber',
				'gender',
				'age',
				'civilStatus',
				'nationality',
				'studentId',
				'schoolName',
				'schoolEmail',
				'yearLevel',
				'course',
				'semestersPerYear',
				'dateOfBirth',
				'placeOfBirth',
			],
			2: ['country', 'province', 'city', 'barangay', 'street', 'zipCode'],
			3: [
				'elementarySchool',
				'elementaryYear',
				'juniorHighSchool',
				'juniorHighYear',
				'seniorHighSchool',
				'seniorHighYear',
				'college',
				'expectedGraduation',
			],
			4: ['certificateOfRegistration', 'reportOfGrades'],
			5: ['consent'],
		};

		const missingFields = requiredFields[currentStep].filter((field) => !formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === ''));

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
			if (currentStep === 5) {
				handleSubmit();
			} else {
				setCurrentStep((curr) => curr + 1);
			}
		}
	};

	// Modified submit handler
	const handleSubmit = async () => {
		if (!formData.consent) {
			setNotification({
				show: true,
				type: 'error',
				message: 'Consent required',
			});
			return;
		}

		try {
			setIsSubmitting(true);

			// Transform form data to match backend structure
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
			
			setNotification({
				show: true,
				type: 'success',
				message: response.message || 'KYC submitted successfully',
			});

			setTimeout(() => {
				onClose();
			}, 2000);

		} catch (error: any) {
			console.error('KYC submission error:', error);
			setNotification({
				show: true,
				type: 'error',
				message: error.response?.data?.message || 
						 (error.response?.status === 401 ? 'Please log in again' : 'Error submitting KYC'),
			});

			// If unauthorized, you might want to handle the session expiry
			if (error.response?.status === 401) {
				// Optionally redirect to login or refresh token
				// window.location.href = '/login';
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderStudentInfo = () => {
		if (academicDetails.isLoading) {
			return <LoadingSpinner />;
		}

		if (academicDetails.error) {
			return (
				<div className="text-center p-4">
					<p className="text-sm text-red-600">
						Error loading academic details. Please try again later.
					</p>
				</div>
			);
		}

		return (
			<div className="space-y-4 animate-fadeIn">
				<div className="text-center mb-4">
					<div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
						<User className="w-5 h-5 text-white" />
					</div>
					<h3 className="text-lg font-semibold text-gray-800">Student Info</h3>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<div>
						<Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
							First Name *
						</Label>
						<Input 
							id="firstName" 
							name="firstName" 
							value={formData.firstName} 
							onChange={handleInputChange} 
							placeholder="Enter first name" 
							required 
						/>
					</div>
					<div>
						<Label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
							Middle Name
						</Label>
						<Input 
							id="middleName" 
							name="middleName" 
							value={formData.middleName} 
							onChange={handleInputChange} 
							placeholder="Enter middle name" 
						/>
					</div>
					<div>
						<Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
							Last Name *
						</Label>
						<Input 
							id="lastName" 
							name="lastName" 
							value={formData.lastName} 
							onChange={handleInputChange} 
							placeholder="Enter last name" 
							required 
						/>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div>
						<Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
							Email *
						</Label>
						<Input 
							id="email" 
							name="email" 
							type="email" 
							value={formData.email} 
							onChange={handleInputChange} 
							placeholder="Enter email" 
							required 
						/>
					</div>
					<div>
						<Label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
							Mobile Number *
						</Label>
						<Input 
							id="mobileNumber" 
							name="mobileNumber" 
							type="tel" 
							value={formData.mobileNumber} 
							onChange={handleInputChange} 
							placeholder="Enter mobile number" 
							required 
						/>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<div>
						<Label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
							Gender *
						</Label>
						<Select 
							name="gender" 
							value={formData.gender} 
							onValueChange={(value) => handleSelectChange('gender', value)} 
							required
						>
							<SelectTrigger id="gender" className="w-full">
								<SelectValue placeholder="Select gender" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="male">Male</SelectItem>
								<SelectItem value="female">Female</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
							Age *
						</Label>
						<Input 
							id="age" 
							name="age" 
							type="number" 
							value={formData.age} 
							onChange={handleInputChange} 
							placeholder="Enter age" 
							required 
						/>
					</div>
					<div>
						<Label htmlFor="civilStatus" className="block text-sm font-medium text-gray-700 mb-1">
							Civil Status *
						</Label>
						<Select 
							name="civilStatus" 
							value={formData.civilStatus} 
							onValueChange={(value) => handleSelectChange('civilStatus', value)} 
							required
						>
							<SelectTrigger id="civilStatus" className="w-full">
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
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div>
						<Label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">
							Nationality *
						</Label>
						<Input 
							id="nationality" 
							name="nationality" 
							value={formData.nationality} 
							onChange={handleInputChange} 
							placeholder="Enter nationality" 
							required 
						/>
					</div>
					<div>
						<Label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
							Student ID *
						</Label>
						<Input 
							id="studentId" 
							name="studentId" 
							value={formData.studentId} 
							onChange={handleInputChange} 
							placeholder="Enter student ID" 
							required 
						/>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div>
						<Label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-1">
							School Name *
						</Label>
						<Select
							name="schoolName"
							value={formData.schoolName}
							onValueChange={(value) => handleSelectChange('schoolName', value)}
							required
						>
							<SelectTrigger id="schoolName" className="w-full">
								<SelectValue placeholder="Select school" />
							</SelectTrigger>
							<SelectContent>
								{academicDetails.isLoading ? (
									<SelectItem value="loading" disabled>
										Loading schools...
									</SelectItem>
								) : academicDetails.error ? (
									<SelectItem value="error" disabled>
										Error loading schools
									</SelectItem>
								) : academicDetails.school.length === 0 ? (
									<SelectItem value="none" disabled>
										No schools available
									</SelectItem>
								) : (
									academicDetails.school.map((school) => (
										<SelectItem key={school} value={school}>
											{school}
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label htmlFor="schoolEmail" className="block text-sm font-medium text-gray-700 mb-1">
							School Email *
						</Label>
						<Input
							id="schoolEmail"
							name="schoolEmail"
							type="email"
							value={formData.schoolEmail}
							onChange={handleInputChange}
							placeholder="Enter school email"
							required
						/>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<div>
						<Label htmlFor="yearLevel" className="text-sm font-medium text-gray-700">
							Year Level *
						</Label>
						<Select
							name="yearLevel"
							value={formData.yearLevel}
							onValueChange={(value) => handleSelectChange('yearLevel', value)}
							required
						>
							<SelectTrigger id="yearLevel">
								<SelectValue placeholder="Select year level" />
							</SelectTrigger>
							<SelectContent>
								{academicDetails.isLoading ? (
									<SelectItem value="loading" disabled>
										Loading year levels...
									</SelectItem>
								) : academicDetails.error ? (
									<SelectItem value="error" disabled>
										Error loading year levels
									</SelectItem>
								) : academicDetails.yearLevel.length === 0 ? (
									<SelectItem value="none" disabled>
										No year levels available
									</SelectItem>
								) : (
									academicDetails.yearLevel.map((level) => (
										<SelectItem key={level} value={level}>
											{level}
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label htmlFor="course" className="text-sm font-medium text-gray-700">
							Course *
						</Label>
						<Select
							name="course"
							value={formData.course}
							onValueChange={(value) => handleSelectChange('course', value)}
							required
						>
							<SelectTrigger id="course">
								<SelectValue placeholder="Select course" />
							</SelectTrigger>
							<SelectContent>
								{academicDetails.isLoading ? (
									<SelectItem value="loading" disabled>
										Loading courses...
									</SelectItem>
								) : academicDetails.error ? (
									<SelectItem value="error" disabled>
										Error loading courses
									</SelectItem>
								) : academicDetails.course.length === 0 ? (
									<SelectItem value="none" disabled>
										No courses available
									</SelectItem>
								) : (
									academicDetails.course.map((course) => (
										<SelectItem key={course} value={course}>
											{course}
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label htmlFor="semestersPerYear" className="text-sm font-medium text-gray-700">
							Semesters/Year *
						</Label>
						<Select
							name="semestersPerYear"
							value={formData.semestersPerYear}
							onValueChange={(value) => handleSelectChange('semestersPerYear', value)}
							required
						>
							<SelectTrigger id="semestersPerYear">
								<SelectValue placeholder="Select semesters" />
							</SelectTrigger>
							<SelectContent>
								{academicDetails.isLoading ? (
									<SelectItem value="loading" disabled>
										Loading semesters...
									</SelectItem>
								) : academicDetails.error ? (
									<SelectItem value="error" disabled>
										Error loading semesters
									</SelectItem>
								) : academicDetails.semester.length === 0 ? (
									<SelectItem value="none" disabled>
										No semesters available
									</SelectItem>
								) : (
									academicDetails.semester.map((sem) => (
										<SelectItem key={sem} value={sem}>
											{sem}
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div>
						<Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
							Date of Birth *
						</Label>
						<Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} required />
					</div>
					<div>
						<Label htmlFor="placeOfBirth" className="text-sm font-medium text-gray-700">
							Place of Birth *
						</Label>
						<Input id="placeOfBirth" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleInputChange} placeholder="Enter place of birth" required />
					</div>
				</div>
			</div>
		);
	};

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
					<Label htmlFor="country" className="text-sm font-medium text-gray-700">
						Country *
					</Label>
					<Input id="country" name="country" value={formData.country} onChange={handleInputChange} placeholder="Enter country" required />
				</div>
				<div>
					<Label htmlFor="province" className="text-sm font-medium text-gray-700">
						Province *
					</Label>
					<Input id="province" name="province" value={formData.province} onChange={handleInputChange} placeholder="Enter province" required />
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<div>
					<Label htmlFor="city" className="text-sm font-medium text-gray-700">
						City *
					</Label>
					<Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="Enter city" required />
				</div>
				<div>
					<Label htmlFor="barangay" className="text-sm font-medium text-gray-700">
						Barangay *
					</Label>
					<Input id="barangay" name="barangay" value={formData.barangay} onChange={handleInputChange} placeholder="Enter barangay" required />
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<div>
					<Label htmlFor="street" className="text-sm font-medium text-gray-700">
						Street *
					</Label>
					<Input id="street" name="street" value={formData.street} onChange={handleInputChange} placeholder="Enter street" required />
				</div>
				<div>
					<Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
						Zip Code *
					</Label>
					<Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="Enter zip code" required />
				</div>
			</div>
		</div>
	);

	const renderEducationalBackground = () => (
		<div className="space-y-4 animate-fadeIn">
			<div className="text-center mb-4">
				<div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-full flex items-center justify-center mx-auto mb-2">
					<GraduationCap className="w-5 h-5 text-white" />
				</div>
				<h3 className="text-lg font-semibold text-gray-800">Educational Background</h3>
			</div>
			<div className="space-y-4">
				<div className="border rounded-md p-3">
					<h4 className="text-sm font-semibold text-gray-800 mb-2">Elementary</h4>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<Label htmlFor="elementarySchool" className="text-sm font-medium text-gray-700">
								School Name *
							</Label>
							<Input id="elementarySchool" name="elementarySchool" value={formData.elementarySchool} onChange={handleInputChange} placeholder="Enter school name" required />
						</div>
						<div>
							<Label htmlFor="elementaryYear" className="text-sm font-medium text-gray-700">
								Year Graduated *
							</Label>
							<Input id="elementaryYear" name="elementaryYear" type="number" value={formData.elementaryYear} onChange={handleInputChange} placeholder="Enter year" required />
						</div>
					</div>
				</div>
				<div className="border rounded-md p-3">
					<h4 className="text-sm font-semibold text-gray-800 mb-2">Junior High</h4>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<Label htmlFor="juniorHighSchool" className="text-sm font-medium text-gray-700">
								School Name *
							</Label>
							<Input id="juniorHighSchool" name="juniorHighSchool" value={formData.juniorHighSchool} onChange={handleInputChange} placeholder="Enter school name" required />
						</div>
						<div>
							<Label htmlFor="juniorHighYear" className="text-sm font-medium text-gray-700">
								Year Graduated *
							</Label>
							<Input id="juniorHighYear" name="juniorHighYear" type="number" value={formData.juniorHighYear} onChange={handleInputChange} placeholder="Enter year" required />
						</div>
					</div>
				</div>
				<div className="border rounded-md p-3">
					<h4 className="text-sm font-semibold text-gray-800 mb-2">Senior High</h4>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<Label htmlFor="seniorHighSchool" className="text-sm font-medium text-gray-700">
								School Name *
							</Label>
							<Input id="seniorHighSchool" name="seniorHighSchool" value={formData.seniorHighSchool} onChange={handleInputChange} placeholder="Enter school name" required />
						</div>
						<div>
							<Label htmlFor="seniorHighYear" className="text-sm font-medium text-gray-700">
								Year Graduated *
							</Label>
							<Input id="seniorHighYear" name="seniorHighYear" type="number" value={formData.seniorHighYear} onChange={handleInputChange} placeholder="Enter year" required />
						</div>
					</div>
				</div>
				<div className="border rounded-md p-3">
					<h4 className="text-sm font-semibold text-gray-800 mb-2">College</h4>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<Label htmlFor="college" className="text-sm font-medium text-gray-700">
								University Name *
							</Label>
							<Input id="college" name="college" value={formData.college} onChange={handleInputChange} placeholder="Enter university name" required />
						</div>
						<div>
							<Label htmlFor="expectedGraduation" className="text-sm font-medium text-gray-700">
								Expected Graduation *
							</Label>
							<Input id="expectedGraduation" name="expectedGraduation" type="number" value={formData.expectedGraduation} onChange={handleInputChange} placeholder="Enter year" required />
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	const renderDocuments = () => (
		<div className="space-y-4 animate-fadeIn">
			<div className="text-center mb-4">
				<div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
					<FileText className="w-5 h-5 text-white" />
				</div>
				<h3 className="text-lg font-semibold text-gray-800">Documents</h3>
			</div>
			<div className="space-y-4">
				<div className="border rounded-md p-3">
					<Label htmlFor="certificateOfRegistration" className="text-sm font-medium text-gray-800">
						Certificate of Registration / Student ID *
					</Label>
					<input
						id="certificateOfRegistration"
						type="file"
						name="certificateOfRegistration"
						onChange={handleFileChange}
						accept=".pdf,.jpg,.jpeg,.png"
						className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
						required
					/>
					{formData.certificateOfRegistration && <p className="text-xs text-gray-600 mt-1">Uploaded: {formData.certificateOfRegistration.name}</p>}
				</div>
				<div className="border rounded-md p-3">
					<Label htmlFor="reportOfGrades" className="text-sm font-medium text-gray-800">
						Latest Report of Grades *
					</Label>
					<input
						id="reportOfGrades"
						type="file"
						name="reportOfGrades"
						onChange={handleFileChange}
						accept=".pdf,.jpg,.jpeg,.png"
						className="w-full px-2.5 py-1.5 text-sm rounded-md border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
						required
					/>
					{formData.reportOfGrades && <p className="text-xs text-gray-600 mt-1">Uploaded: {formData.reportOfGrades.name}</p>}
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

	// Add status check in render
	if (kycLoading) {
		return <LoadingSpinner />;
	}

	if (kycStatus?.status === 'pending') {
		return (
			<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
				<div className="bg-white rounded-xl p-6 max-w-md text-center">
					<div className="mb-4">
						<Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
					</div>
					<h3 className="text-lg font-semibold mb-2">KYC Verification Pending</h3>
					<p className="text-gray-600 mb-4">Your KYC verification is currently under review.</p>
					<button
						onClick={onClose}
						className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
					>
						Close
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
				<div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-4 py-3 text-white flex justify-between items-center">
					<h2 className="text-lg font-semibold">KYC Verification</h2>
					<button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
						<X className="w-4 h-4" />
					</button>
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
					{currentStep === 1 && renderStudentInfo()}
					{currentStep === 2 && renderAddress()}
					{currentStep === 3 && renderEducationalBackground()}
					{currentStep === 4 && renderDocuments()}
					{currentStep === 5 && renderDeclarationConsent()}
				</div>
				<div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
					<button onClick={() => setCurrentStep((curr) => curr - 1)} disabled={currentStep === 1} className={`px-3 py-1.5 text-sm rounded-md ${currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}>
						Previous
					</button>
					<p className="text-xs text-gray-500">
						Step {currentStep} of {steps.length}
					</p>
					<button onClick={handleNext} disabled={currentStep === 5 && !formData.consent} className={`px-5 py-1.5 text-sm rounded-md transition-all ${currentStep === 5 && !formData.consent ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'}`}>
						{currentStep === 5 ? 'Complete' : 'Continue'}
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
		</div>
	);
}