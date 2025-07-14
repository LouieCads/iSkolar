"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Heart, Building2, User, ArrowLeft, ArrowRight } from 'lucide-react';
import axios from "axios";
import { useRouter } from "next/navigation";

type Role = 'student' | 'sponsor' | 'school' | null;
type SponsorType = 'individual' | 'corporate' | null;

export default function RoleSelection(): React.JSX.Element {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [selectedSponsorType, setSponsorType] = useState<SponsorType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSponsorTypes, setShowSponsorTypes] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Check user profile for role
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const user = response.data.user;
          if (!user.role) {
            router.replace('/auth/role-selection');
          } else {
            // Redirect to respective dashboard
            if (user.role === 'student') router.replace('/student');
            else if (user.role === 'sponsor') router.replace('/sponsor');
            else if (user.role === 'school') router.replace('/university');
            else if (user.role === 'admin') router.replace('/admin');
            else router.replace('/auth/welcome');
          }
        }
      } catch (e) {
        // Ignore errors, stay on sign-in
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleRoleSelect = (role: Role) => {
    if (role === 'sponsor') {
      setSelectedRole(role);
      setShowSponsorTypes(true);
    } else {
      setSelectedRole(role);
      setShowSponsorTypes(false);
    }
  };

  const handleSponsorTypeSelect = (type: SponsorType) => {
    setSponsorType(type);
  };

  const handleBack = () => {
    setShowSponsorTypes(false);
    setSelectedRole(null);
    setSponsorType(null);
  };

  const handleContinue = async () => {
    if (!selectedRole || (selectedRole === "sponsor" && !selectedSponsorType)) return;
    try {
      const token = localStorage.getItem("token");
      const payload: any = { role: selectedRole };
      if (selectedRole === "sponsor") payload.sponsorType = selectedSponsorType;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/select-role`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      // Redirect based on role
      if (selectedRole === "student") router.push("/student");
      else if (selectedRole === "sponsor") router.push("/sponsor");
      else if (selectedRole === "school") router.push("/university");
      else if (selectedRole === "admin") router.push("/admin");
    } catch (error: any) {
      alert(error.response?.data?.message || "Role selection failed");
    }
  };

  const canContinue = selectedRole && (selectedRole !== 'sponsor' || selectedSponsorType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-extrabold text-primary mb-2 tracking-tight font-sans">Welcome to <span className='text-[#1e3a8a]'>iSkolar</span></h1>
          <p className="text-lg text-muted-foreground font-medium">
            {showSponsorTypes 
              ? "Choose your sponsor type to continue" 
              : "Select your role to get started"
            }
          </p>
        </div>

        {!showSponsorTypes ? (
          /* Main Role Selection */
          <div className="grid md:grid-cols-3 gap-8 mb-8 animate-fade-in">
            {/* Student Role */}
            <Card 
              className={`cursor-pointer transition-all duration-300 shadow-lg border-2 border-transparent hover:border-primary hover:shadow-xl hover:-translate-y-1 hover:scale-105 rounded-2xl bg-card/90 ${
                selectedRole === 'student' ? 'border-primary ring-2 ring-primary bg-primary/10 scale-105' : ''
              }`}
              onClick={() => handleRoleSelect('student')}
              tabIndex={0}
              aria-pressed={selectedRole === 'student'}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-primary">iStudent</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto bg-primary/10 text-primary font-semibold">Scholarship Seeker</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base text-muted-foreground font-medium">
                  Apply for scholarships, upload your credentials, and receive financial support for your education journey.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Sponsor Role */}
            <Card 
              className={`cursor-pointer transition-all duration-300 shadow-lg border-2 border-transparent hover:border-green-500 hover:shadow-xl hover:-translate-y-1 hover:scale-105 rounded-2xl bg-card/90 ${
                selectedRole === 'sponsor' ? 'border-green-500 ring-2 ring-green-500 bg-green-50 scale-105' : ''
              }`}
              onClick={() => handleRoleSelect('sponsor')}
              tabIndex={0}
              aria-pressed={selectedRole === 'sponsor'}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-700">iSponsor</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto bg-green-100 text-green-700 font-semibold">Education Supporter</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base text-muted-foreground font-medium">
                  Create scholarship programs, support deserving students, and make a positive impact on education.
                </CardDescription>
              </CardContent>
            </Card>

            {/* School Role */}
            <Card 
              className={`cursor-pointer transition-all duration-300 shadow-lg border-2 border-transparent hover:border-purple-500 hover:shadow-xl hover:-translate-y-1 hover:scale-105 rounded-2xl bg-card/90 ${
                selectedRole === 'school' ? 'border-purple-500 ring-2 ring-purple-500 bg-purple-50 scale-105' : ''
              }`}
              onClick={() => handleRoleSelect('school')}
              tabIndex={0}
              aria-pressed={selectedRole === 'school'}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Building2 className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-purple-700">iSchool</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto bg-purple-100 text-purple-700 font-semibold">Verification Partner</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base text-muted-foreground font-medium">
                  Verify student credentials, review scholarship applications, and facilitate educational partnerships.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Sponsor Type Selection */
          <div className="grid md:grid-cols-2 gap-8 mb-8 max-w-2xl mx-auto animate-fade-in">
            {/* Individual Sponsor */}
            <Card 
              className={`cursor-pointer transition-all duration-300 shadow-lg border-2 border-transparent hover:border-green-500 hover:shadow-xl hover:-translate-y-1 hover:scale-105 rounded-2xl bg-card/90 ${
                selectedSponsorType === 'individual' ? 'border-green-500 ring-2 ring-green-500 bg-green-50 scale-105' : ''
              }`}
              onClick={() => handleSponsorTypeSelect('individual')}
              tabIndex={0}
              aria-pressed={selectedSponsorType === 'individual'}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-700">Individual Sponsor</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto bg-green-100 text-green-700 font-semibold">Personal Giving</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base text-muted-foreground font-medium">
                  Support students as an individual philanthropist with personal contributions to education.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Corporate Sponsor */}
            <Card 
              className={`cursor-pointer transition-all duration-300 shadow-lg border-2 border-transparent hover:border-green-500 hover:shadow-xl hover:-translate-y-1 hover:scale-105 rounded-2xl bg-card/90 ${
                selectedSponsorType === 'corporate' ? 'border-green-500 ring-2 ring-green-500 bg-green-50 scale-105' : ''
              }`}
              onClick={() => handleSponsorTypeSelect('corporate')}
              tabIndex={0}
              aria-pressed={selectedSponsorType === 'corporate'}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Building2 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-700">Corporate Sponsor</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto bg-green-100 text-green-700 font-semibold">Business CSR</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base text-muted-foreground font-medium">
                  Establish corporate scholarship programs as part of your company's social responsibility initiatives.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 animate-fade-in mt-4">
          {showSponsorTypes && (
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="flex items-center gap-2 transition-all duration-200 hover:scale-105 font-semibold text-base px-6 py-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          
          <Button 
            onClick={handleContinue}
            disabled={!canContinue}
            className="flex items-center gap-2 px-8 py-2 text-base font-bold transition-all duration-200 hover:scale-105 disabled:hover:scale-100 bg-primary text-primary-foreground shadow-md"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};