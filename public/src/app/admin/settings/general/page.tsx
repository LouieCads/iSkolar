"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePlatform } from "@/hooks/use-platform";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface FormValues {
  platformName: string;
  email: string;
  phoneNumber: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  logo: File | null;
}

const validationSchema = Yup.object({
  platformName: Yup.string()
    .min(3, "Platform name must be at least 3 characters")
    .max(32, "Platform name must be at most 32 characters")
    .required("Platform name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phoneNumber: Yup.string()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .required("Phone number is required"),
  facebook: Yup.string().url("Invalid Facebook URL").required("Facebook link is required"),
  twitter: Yup.string().url("Invalid Twitter URL").required("Twitter link is required"),
  instagram: Yup.string().url("Invalid Instagram URL").required("Instagram link is required"),
  linkedin: Yup.string().url("Invalid LinkedIn URL").required("LinkedIn link is required"),
  logo: Yup.mixed<File>()
    .nullable()
    .optional()
    .test("fileSize", "Logo is too large (max 2MB)", (value: File | null | undefined) => {
      if (!value) return true;
      return value.size <= 2 * 1024 * 1024;
    })
    .test("fileType", "Unsupported file format", (value: File | null | undefined) => {
      if (!value) return true;
      return ["image/png", "image/jpeg", "image/svg+xml"].includes(value.type);
    }),
});

export default function GeneralSettingsPage(): React.JSX.Element {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState<boolean>(false);
  const { platform, loading, error, updating, updatePlatform, uploadLogo, refetch } = usePlatform();

  const formik = useFormik<FormValues>({
    initialValues: {
      platformName: "",
      email: "",
      phoneNumber: "",
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
      logo: null,
    },
    validationSchema,
    onSubmit: async (values: FormValues) => {
      try {
        setShowSuccessNotification(false);
        await updatePlatform({
          name: values.platformName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          facebook: values.facebook,
          twitter: values.twitter,
          instagram: values.instagram,
          linkedin: values.linkedin,
        });
        setShowSuccessNotification(true);
        setTimeout(() => setShowSuccessNotification(false), 3000);
      } catch (error) {
        // Error is already handled by the hook
      }
    },
  });

  useEffect(() => {
    if (platform && !loading) {
      formik.setFieldValue("platformName", platform.name || "");
      formik.setFieldValue("email", platform.email || "");
      formik.setFieldValue("phoneNumber", platform.phoneNumber || "");
      formik.setFieldValue("facebook", platform.facebook || "");
      formik.setFieldValue("twitter", platform.twitter || "");
      formik.setFieldValue("instagram", platform.instagram || "");
      formik.setFieldValue("linkedin", platform.linkedin || "");
    }
  }, [platform, loading]);

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.currentTarget.files?.[0] || null;
    formik.setFieldValue("logo", file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setShowSuccessNotification(false);
      if (formik.values.logo) {
        await uploadLogo(formik.values.logo);
        await refetch();
        setLogoPreview(null);
        formik.setFieldValue("logo", null);
      }
      await updatePlatform({
        name: formik.values.platformName,
        email: formik.values.email,
        phoneNumber: formik.values.phoneNumber,
        facebook: formik.values.facebook,
        twitter: formik.values.twitter,
        instagram: formik.values.instagram,
        linkedin: formik.values.linkedin,
      });
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex items-center justify-center h-64">
        <div className="text-gray-500">Loading platform settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4">
      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">General Settings</h1>
          <p className="text-sm text-gray-600">Manage system preferences and configurations</p>
        </div>
        <AnimatePresence>
          {showSuccessNotification && (
            <motion.div
              initial={{ opacity: 1, x: 500 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 500 }}
              transition={{
                type: "spring",
                stiffness: 900,
                damping: 25,
                duration: 0.2,
              }}
              className="fixed w-[325px] flex justify-end items-center h-[55px] bottom-5 right-5 rounded-[10px] text-[#002828] bg-[#26D871] rounded-md shadow-xl z-[1000]"
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
                  <p className="text-[12px]">Platform settings updated!</p>
                </div>
                <button
                  onClick={() => setShowSuccessNotification(false)}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                  aria-label="Close notification"
                >
                  &times;
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {error && (
          <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded z-10 text-sm">
            {error}
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-stretch w-full">
          <div className="flex-1 flex flex-col md:pr-6 border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0">
            <Label htmlFor="platformName" className="mb-2 text-blue-900 text-sm">
              Platform Name
            </Label>
            <Input
              id="platformName"
              name="platformName"
              type="text"
              placeholder="Enter platform name"
              value={formik.values.platformName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={formik.touched.platformName && !!formik.errors.platformName}
              className={`text-sm ${formik.touched.platformName && formik.errors.platformName ? "border-red-500" : ""}`}
            />
            {formik.touched.platformName && formik.errors.platformName && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.platformName}</div>
            )}
            <Label htmlFor="email" className="mb-2 mt-4 text-blue-900 text-sm">
              Platform Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter platform email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={formik.touched.email && !!formik.errors.email}
              className={`text-sm ${formik.touched.email && formik.errors.email ? "border-red-500" : ""}`}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
            )}
            <Label htmlFor="phoneNumber" className="mb-2 mt-4 text-blue-900 text-sm">
              Platform Phone Number
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="text"
              placeholder="Enter platform phone number"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={formik.touched.phoneNumber && !!formik.errors.phoneNumber}
              className={`text-sm ${formik.touched.phoneNumber && formik.errors.phoneNumber ? "border-red-500" : ""}`}
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.phoneNumber}</div>
            )}
            <Label htmlFor="facebook" className="mb-2 mt-4 text-blue-900 text-sm">
              Facebook Link
            </Label>
            <Input
              id="facebook"
              name="facebook"
              type="url"
              placeholder="Enter Facebook link"
              value={formik.values.facebook}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={formik.touched.facebook && !!formik.errors.facebook}
              className={`text-sm ${formik.touched.facebook && formik.errors.facebook ? "border-red-500" : ""}`}
            />
            {formik.touched.facebook && formik.errors.facebook && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.facebook}</div>
            )}
            <Label htmlFor="twitter" className="mb-2 mt-4 text-blue-900 text-sm">
              Twitter Link
            </Label>
            <Input
              id="twitter"
              name="twitter"
              type="url"
              placeholder="Enter Twitter link"
              value={formik.values.twitter}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={formik.touched.twitter && !!formik.errors.twitter}
              className={`text-sm ${formik.touched.twitter && formik.errors.twitter ? "border-red-500" : ""}`}
            />
            {formik.touched.twitter && formik.errors.twitter && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.twitter}</div>
            )}
            <Label htmlFor="instagram" className="mb-2 mt-4 text-blue-900 text-sm">
              Instagram Link
            </Label>
            <Input
              id="instagram"
              name="instagram"
              type="url"
              placeholder="Enter Instagram link"
              value={formik.values.instagram}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={formik.touched.instagram && !!formik.errors.instagram}
              className={`text-sm ${formik.touched.instagram && formik.errors.instagram ? "border-red-500" : ""}`}
            />
            {formik.touched.instagram && formik.errors.instagram && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.instagram}</div>
            )}
            <Label htmlFor="linkedin" className="mb-2 mt-4 text-blue-900 text-sm">
              LinkedIn Link
            </Label>
            <Input
              id="linkedin"
              name="linkedin"
              type="url"
              placeholder="Enter LinkedIn link"
              value={formik.values.linkedin}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={formik.touched.linkedin && !!formik.errors.linkedin}
              className={`text-sm ${formik.touched.linkedin && formik.errors.linkedin ? "border-red-500" : ""}`}
            />
            {formik.touched.linkedin && formik.errors.linkedin && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.linkedin}</div>
            )}
          </div>
          <div className="flex-1 flex flex-col md:pl-6 pt-6 md:pt-0">
            <Label htmlFor="logo" className="mb-2 text-blue-900 text-sm">
              Platform Logo
            </Label>
            <div className="w-full cursor-pointer flex flex-col items-center gap-2">
              <input
                id="logo"
                name="logo"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoChange}
                className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {formik.touched.logo && formik.errors.logo && (
              <div className="text-red-500 text-xs mt-2">{formik.errors.logo as string}</div>
            )}
            <div className="w-28 h-28 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden mt-4">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Logo Preview"
                  width={112}
                  height={112}
                  className="object-contain w-full h-full"
                />
              ) : platform?.logoUrl ? (
                <Image
                  src={platform.logoUrl}
                  alt="Current Logo"
                  width={112}
                  height={112}
                  className="object-contain w-full h-full"
                />
              ) : (
                <span className="text-gray-400 text-xs">No logo selected</span>
              )}
            </div>
          </div>
        </div>
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 text-sm bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg"
            disabled={updating}
          >
            {updating ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}