"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

interface ProfileFormValues {
  // Student & Individual Sponsor fields
  username?: string;
  gender?: string;
  age?: number;
  
  // Corporate Sponsor fields
  companyName?: string;
  organizationType?: string;
  industrySector?: string;
  
  // School fields
  schoolName?: string;
  schoolType?: string;
  yearEstablished?: number;
  
  // Privacy agreement
  agreeToPrivacy: boolean;
}

export default function ProfileSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [subRole, setSubRole] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get role from URL params or fetch from user profile
    const roleFromUrl = searchParams.get('role');
    const subRoleFromUrl = searchParams.get('subRole');
    
    if (roleFromUrl) {
      setUserRole(roleFromUrl);
      if (subRoleFromUrl) setSubRole(subRoleFromUrl);
    } else {
      // Fetch user profile to get role
      fetchUserProfile();
    }
  }, [searchParams]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const user = response.data.user;
      setUserRole(user.role);
      
      if (user.role === 'sponsor' && user.persona?.subRole) {
        setSubRole(user.persona.subRole);
      }
      
      // If already verified, redirect to dashboard
      if (user.isVerified) {
        redirectToDashboard(user.role);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      router.push('/auth');
    }
  };

  const redirectToDashboard = (role: string) => {
    switch (role) {
      case 'student':
        router.push('/student');
        break;
      case 'sponsor':
        router.push('/sponsor');
        break;
      case 'school':
        router.push('/school');
        break;
      case 'admin':
        router.push('/admin');
        break;
      default:
        router.push('/auth/welcome');
    }
  };

  const getValidationSchema = () => {
    const baseSchema = {
      agreeToPrivacy: Yup.boolean().oneOf([true], 'You must agree to the privacy policy to continue'),
    };

    if (userRole === 'student' || (userRole === 'sponsor' && subRole === 'individual')) {
      return Yup.object().shape({
        ...baseSchema,
        username: Yup.string().required('Username is required'),
        gender: Yup.string().required('Gender is required'),
        age: Yup.number().min(1, 'Age must be greater than 0').required('Age is required'),
      });
    } else if (userRole === 'sponsor' && subRole === 'corporate') {
      return Yup.object().shape({
        ...baseSchema,
        companyName: Yup.string().required('Company name is required'),
        organizationType: Yup.string().required('Organization type is required'),
        industrySector: Yup.string().required('Industry sector is required'),
      });
    } else if (userRole === 'school') {
      return Yup.object().shape({
        ...baseSchema,
        schoolName: Yup.string().required('School name is required'),
        schoolType: Yup.string().required('School type is required'),
        yearEstablished: Yup.number().min(1800, 'Invalid year').max(new Date().getFullYear(), 'Year cannot be in the future').required('Year established is required'),
      });
    }
    return Yup.object().shape(baseSchema);
  };

  const getInitialValues = (): ProfileFormValues => {
    const baseValues = { agreeToPrivacy: false };

    if (userRole === 'student' || (userRole === 'sponsor' && subRole === 'individual')) {
      return {
        ...baseValues,
        username: '',
        gender: '',
        age: undefined,
      };
    } else if (userRole === 'sponsor' && subRole === 'corporate') {
      return {
        ...baseValues,
        companyName: '',
        organizationType: '',
        industrySector: '',
      };
    } else if (userRole === 'school') {
      return {
        ...baseValues,
        schoolName: '',
        schoolType: '',
        yearEstablished: undefined,
      };
    }
    return baseValues;
  };

  const handleSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { agreeToPrivacy, ...profileData } = values;
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/setup-profile`,
        { profileData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.user) {
        redirectToDashboard(userRole);
      }
    } catch (error: any) {
      console.error('Profile setup error:', error);
      alert(error.response?.data?.message || 'Profile setup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormFields = () => {
    if (userRole === 'student' || (userRole === 'sponsor' && subRole === 'individual')) {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username *</Label>
            <Field as={Input} id="username" name="username" placeholder="Enter username" className="mt-1" />
            <ErrorMessage name="username" component="div" className="text-red-500 text-xs mt-1" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender *</Label>
              <Field name="gender">
                {({ field, form }: any) => (
                  <Select onValueChange={(value) => form.setFieldValue('gender', value)} value={field.value}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </Field>
              <ErrorMessage name="gender" component="div" className="text-red-500 text-xs mt-1" />
            </div>
            <div>
              <Label htmlFor="age" className="text-sm font-medium text-gray-700">Age *</Label>
              <Field as={Input} id="age" name="age" type="number" placeholder="Age" className="mt-1" />
              <ErrorMessage name="age" component="div" className="text-red-500 text-xs mt-1" />
            </div>
          </div>
        </div>
      );
    } else if (userRole === 'sponsor' && subRole === 'corporate') {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">Company Name *</Label>
            <Field as={Input} id="companyName" name="companyName" placeholder="Enter company name" className="mt-1" />
            <ErrorMessage name="companyName" component="div" className="text-red-500 text-xs mt-1" />
          </div>
          
          <div>
            <Label htmlFor="organizationType" className="text-sm font-medium text-gray-700">Organization Type *</Label>
            <Field name="organizationType">
              {({ field, form }: any) => (
                <Select onValueChange={(value) => form.setFieldValue('organizationType', value)} value={field.value}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="non-profit">Non-Profit</SelectItem>
                    <SelectItem value="foundation">Foundation</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </Field>
            <ErrorMessage name="organizationType" component="div" className="text-red-500 text-xs mt-1" />
          </div>
          
          <div>
            <Label htmlFor="industrySector" className="text-sm font-medium text-gray-700">Industry Sector *</Label>
            <Field as={Input} id="industrySector" name="industrySector" placeholder="e.g., Technology, Healthcare, Finance" className="mt-1" />
            <ErrorMessage name="industrySector" component="div" className="text-red-500 text-xs mt-1" />
          </div>
        </div>
      );
    } else if (userRole === 'school') {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="schoolName" className="text-sm font-medium text-gray-700">School Name *</Label>
            <Field as={Input} id="schoolName" name="schoolName" placeholder="Enter school name" className="mt-1" />
            <ErrorMessage name="schoolName" component="div" className="text-red-500 text-xs mt-1" />
          </div>
          
          <div>
            <Label htmlFor="schoolType" className="text-sm font-medium text-gray-700">School Type *</Label>
            <Field name="schoolType">
              {({ field, form }: any) => (
                <Select onValueChange={(value) => form.setFieldValue('schoolType', value)} value={field.value}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select school type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public School</SelectItem>
                    <SelectItem value="private">Private School</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="vocational">Vocational School</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </Field>
            <ErrorMessage name="schoolType" component="div" className="text-red-500 text-xs mt-1" />
          </div>
          
          <div>
            <Label htmlFor="yearEstablished" className="text-sm font-medium text-gray-700">Year Established *</Label>
            <Field as={Input} id="yearEstablished" name="yearEstablished" type="number" placeholder="e.g., 1995" className="mt-1" />
            <ErrorMessage name="yearEstablished" component="div" className="text-red-500 text-xs mt-1" />
          </div>
        </div>
      );
    }
    return null;
  };

  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-sm border-0 bg-white">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Complete Your Profile
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Please provide the required information to continue
          </p>
        </CardHeader>
        
        <CardContent>
          <Formik
            initialValues={getInitialValues()}
            validationSchema={getValidationSchema()}
            onSubmit={handleSubmit}
          >
            {({ values, isSubmitting }) => (
              <Form className="space-y-6">
                {renderFormFields()}
                
                <div className="border-t pt-4">
                  <Field name="agreeToPrivacy">
                    {({ field, form }: any) => (
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="agreeToPrivacy"
                          checked={field.value}
                          onCheckedChange={(checked) => form.setFieldValue('agreeToPrivacy', checked)}
                          className="mt-1"
                        />
                        <div>
                          <label
                            htmlFor="agreeToPrivacy"
                            className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                          >
                            I agree to the{' '}
                            <a href="/privacy-policy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                              Privacy Policy
                            </a>
                            {' '}and{' '}
                            <a href="/terms-of-service" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                              Terms of Service
                            </a>
                          </label>
                          <ErrorMessage name="agreeToPrivacy" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                      </div>
                    )}
                  </Field>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting || isLoading || !values.agreeToPrivacy}
                >
                  {isLoading ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}