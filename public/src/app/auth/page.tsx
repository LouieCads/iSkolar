"use client";
import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import AuthCard from "@/components/ui/AuthCard";

// Types for form values
interface LoginFormValues {
  email: string;
  password: string;
}

interface SignupFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthProps {
  defaultView?: "login" | "signup";
}

// Validation schemas
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    // .min(8, "Password must be at least 8 characters")
    // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number")
});

const signupSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required"),
    // .min(8, "Password must be at least 8 characters")
    // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], "Passwords must match")
    .required("Please confirm your password")
});

export default function Auth({ defaultView = "login" }: AuthProps) {
  const [flipped, setFlipped] = useState<boolean>(defaultView === "signup");
  const [saveLogin, setSaveLogin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSignUpNotification, setShowSignUpNotification] = useState<boolean>(false);
  const [showLoginNotification, setShowLoginNotification] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
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
            router.replace('/auth/welcome');
          } else {
            // Redirect to respective dashboard
            if (user.role === 'student') router.replace('/student');
            else if (user.role === 'sponsor') router.replace('/sponsor');
            else if (user.role === 'school') router.replace('/school');
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

  const handleLogin = async (
    values: LoginFormValues,
    { setSubmitting, setFieldError, setStatus }: FormikHelpers<LoginFormValues> & { setFieldError: (field: string, message: string) => void; setStatus: (status?: any) => void; }
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        email: values.email,
        password: values.password,
        saveLogin: saveLogin
      });
      
      console.log(response.data.message, response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.expiresIn) {
          localStorage.setItem('tokenExpiresIn', response.data.expiresIn);
        }
        // Fetch user profile to check role
        try {
          const profileRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${response.data.token}` }
          });
          const user = profileRes.data.user;
          if (!user.role) {
            router.push('/auth/welcome');
          } else {
            if (user.role === 'student') router.push('/student');
            else if (user.role === 'sponsor') router.push('/sponsor');
            else if (user.role === 'school') router.push('/school');
            else if (user.role === 'admin') router.push('/admin');
            else router.push('/auth/welcome');
          }
        } catch (profileErr) {
          // If profile fetch fails, fallback to welcome page
          router.push('/auth/welcome');
        }
      }

      setShowLoginNotification(true);
      setTimeout(() => {
        setShowLoginNotification(false);
      }, 2000);

    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response?.data?.message) {
        setStatus(error.response.data.message);
      } else {
        setStatus("An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleSignup = async (
    values: SignupFormValues,
    { setSubmitting, setFieldError, setStatus }: FormikHelpers<SignupFormValues> & { setFieldError: (field: string, message: string) => void; setStatus: (status?: any) => void; }
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signup`, {
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword
      });
      
      console.log("Signup successful:", response.data);

      setShowSignUpNotification(true);
      setTimeout(() => {
        setShowSignUpNotification(false);
      }, 2000);
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.response?.data?.message) {
        if (error.response.data.message === "Email already exists") {
          setFieldError("email", "This email is already registered");
        } else {
          setStatus(error.response.data.message);
        }
      } else {
        setStatus("An error occurred during signup. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  // Login form
  const loginForm = (
    <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-[#0054a6] text-center mb-2">Welcome Back</h2>
      
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={loginSchema}
        onSubmit={handleLogin}
      >
        {({ errors, touched, status, isSubmitting }) => (
          <Form className="flex flex-col gap-4">
            {status && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {status}
              </div>
            )}
            
            <div>
              <Label htmlFor="email" className="mb-1">Email</Label>
              <Field
                as={Input}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                className={errors.email && touched.email ? "border-red-500" : ""}
              />
              <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
            </div>
            
            <div>
              <Label htmlFor="password" className="mb-1">Password</Label>
              <div className="relative flex items-center">
                <Field
                  as={Input}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={errors.password && touched.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 h-full flex items-center text-gray-400 hover:text-[#0054a6] focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="19" height="19">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1.5 12s4.5-7.5 10.5-7.5S22.5 12 22.5 12s-4.5 7.5-10.5 7.5S1.5 12 1.5 12z" />
                      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="19" height="19">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M1.5 12s4.5-7.5 10.5-7.5c2.1 0 4.1.6 5.9 1.6M22.5 12s-4.5 7.5-10.5 7.5c-2.1 0-4.1-.6-5.9-1.6" />
                      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  )}
                </button>
              </div>
              <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-checked={saveLogin}
                onClick={() => setSaveLogin((v) => !v)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e96ff] ${saveLogin ? 'bg-[#efa508] border-[#efa508]' : 'bg-white border-gray-300'}`}
                role="checkbox"
                tabIndex={0}
              >
                {saveLogin && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className="text-xs text-gray-700 select-none">Save login</span>
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-2" 
              disabled={isSubmitting || isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </Form>
        )}
      </Formik>
      
      <div className="text-center text-sm mt-2">
        Don't have an account?{' '}
        <button
          className="text-[#0077e6] hover:underline font-medium transition-colors"
          onClick={() => setFlipped(true)}
          type="button"
        >
          Sign up.
        </button>
      </div>
    </div>
  );

  // Signup form
  const signupForm = (
    <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-[#0054a6] text-center mb-2">Create Account</h2>
      
      <Formik
        initialValues={{ email: "", password: "", confirmPassword: "" }}
        validationSchema={signupSchema}
        onSubmit={handleSignup}
      >
        {({ errors, touched, status, isSubmitting }) => (
          <Form className="flex flex-col gap-4">
            {status && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {status}
              </div>
            )}
            
            <div>
              <Label htmlFor="signup-email" className="mb-1">Email</Label>
              <Field
                as={Input}
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                className={errors.email && touched.email ? "border-red-500" : ""}
              />
              <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
            </div>
            
            <div>
              <Label htmlFor="signup-password" className="mb-1">Password</Label>
              <Field
                as={Input}
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={errors.password && touched.password ? "border-red-500" : ""}
              />
              <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
            </div>
            
            <div>
              <Label htmlFor="signup-confirm" className="mb-1">Confirm Password</Label>
              <Field
                as={Input}
                id="signup-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={errors.confirmPassword && touched.confirmPassword ? "border-red-500" : ""}
              />
              <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-2"
              disabled={isSubmitting || isLoading}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </Form>
        )}
      </Formik>
      
      <div className="text-center text-sm mt-2">
        Already have an account?{' '}
        <button
          className="text-[#0077e6] hover:underline font-medium transition-colors"
          onClick={() => setFlipped(false)}
          type="button"
        >
          Log in.
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#e0f0ff] to-white px-2 py-8">
      <AuthCard flipped={flipped} front={loginForm} back={signupForm} />
      <AnimatePresence>
        {showSignUpNotification && (
          <motion.div
            initial={{ opacity: 1, x: 500 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 500 }} // Exit to the right
            transition={{
              type: "spring",
              stiffness: 900,
              damping: 25,
              duration: 0.2,
            }}
            className="fixed w-[325px] flex justify-end items-center h-[55px] bottom-5 right-5 rounded-[10px] text-[#002828] bg-[#26D871] rounded-md shadow-xl z-100"
          >
            <div className="flex gap-3 items-center w-[320px] h-[55px] bg-gray-50 rounded-[5px] border-white px-3 py-2">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="23"
                  height="23"
                  fill="#26D871"
                  className="bi bi-check-square-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[14px]">Success</p>
                <p className="text-[12px]">Signed up successfully!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoginNotification && (
          <motion.div
            initial={{ opacity: 1, x: 500 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 500 }} // Exit to the right
            transition={{
              type: "spring",
              stiffness: 900,
              damping: 25,
              duration: 0.2,
            }}
            className="fixed w-[325px] flex justify-end items-center h-[55px] bottom-5 right-5 rounded-[10px] text-[#002828] bg-[#26D871] rounded-md shadow-xl z-100"
          >
            <div className="flex gap-3 items-center w-[320px] h-[55px] bg-gray-50 rounded-[5px] border-white px-3 py-2">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="23"
                  height="23"
                  fill="#26D871"
                  className="bi bi-check-square-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[14px]">Success</p>
                <p className="text-[12px]">You're logged in!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 