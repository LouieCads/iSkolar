import React, { useState, ChangeEvent, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePlatform } from "@/hooks/use-platform";
import { motion, AnimatePresence } from "framer-motion";

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
    })
});

export default function General(): React.JSX.Element {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState<boolean>(false);
  const { platform, loading, error, updating, updatePlatform } = usePlatform();

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex items-center justify-center h-64">
        <div className="text-gray-500">Loading platform settings...</div>
      </div>
    );
  }

  return (
    <div className="relative">
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
                <p className="text-[12px]">Platform settings updated!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-10">
          {error}
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row items-stretch w-full max-w-5xl mx-auto mt-10">
        <div className="flex-1 flex flex-col md:pr-8 border-b md:border-b-0 md:border-r border-gray-200 pb-8 md:pb-0">
          <Label htmlFor="platformName" className="mb-3 text-blue-900">Platform Name</Label>
          <Input
            id="platformName"
            name="platformName"
            type="text"
            placeholder="Enter platform name"
            value={formik.values.platformName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={formik.touched.platformName && !!formik.errors.platformName}
            className={formik.touched.platformName && formik.errors.platformName ? "border-red-500" : ""}
          />
          {formik.touched.platformName && formik.errors.platformName && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.platformName}</div>
          )}
          <Label htmlFor="email" className="mb-3 mt-6 text-blue-900">Platform Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter platform email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={formik.touched.email && !!formik.errors.email}
            className={formik.touched.email && formik.errors.email ? "border-red-500" : ""}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
          )}
          <Label htmlFor="phoneNumber" className="mb-3 mt-6 text-blue-900">Platform Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="text"
            placeholder="Enter platform phone number"
            value={formik.values.phoneNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={formik.touched.phoneNumber && !!formik.errors.phoneNumber}
            className={formik.touched.phoneNumber && formik.errors.phoneNumber ? "border-red-500" : ""}
          />
          {formik.touched.phoneNumber && formik.errors.phoneNumber && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.phoneNumber}</div>
          )}
          <Label htmlFor="facebook" className="mb-3 mt-6 text-blue-900">Facebook Link</Label>
          <Input
            id="facebook"
            name="facebook"
            type="url"
            placeholder="Enter Facebook link"
            value={formik.values.facebook}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={formik.touched.facebook && !!formik.errors.facebook}
            className={formik.touched.facebook && formik.errors.facebook ? "border-red-500" : ""}
          />
          {formik.touched.facebook && formik.errors.facebook && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.facebook}</div>
          )}
          <Label htmlFor="twitter" className="mb-3 mt-6 text-blue-900">Twitter Link</Label>
          <Input
            id="twitter"
            name="twitter"
            type="url"
            placeholder="Enter Twitter link"
            value={formik.values.twitter}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={formik.touched.twitter && !!formik.errors.twitter}
            className={formik.touched.twitter && formik.errors.twitter ? "border-red-500" : ""}
          />
          {formik.touched.twitter && formik.errors.twitter && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.twitter}</div>
          )}
          <Label htmlFor="instagram" className="mb-3 mt-6 text-blue-900">Instagram Link</Label>
          <Input
            id="instagram"
            name="instagram"
            type="url"
            placeholder="Enter Instagram link"
            value={formik.values.instagram}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={formik.touched.instagram && !!formik.errors.instagram}
            className={formik.touched.instagram && formik.errors.instagram ? "border-red-500" : ""}
          />
          {formik.touched.instagram && formik.errors.instagram && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.instagram}</div>
          )}
          <Label htmlFor="linkedin" className="mb-3 mt-6 text-blue-900">LinkedIn Link</Label>
          <Input
            id="linkedin"
            name="linkedin"
            type="url"
            placeholder="Enter LinkedIn link"
            value={formik.values.linkedin}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={formik.touched.linkedin && !!formik.errors.linkedin}
            className={formik.touched.linkedin && formik.errors.linkedin ? "border-red-500" : ""}
          />
          {formik.touched.linkedin && formik.errors.linkedin && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.linkedin}</div>
          )}
        </div>
        <div className="flex-1 flex flex-col md:pl-5 pt-8 md:pt-0">
          <Label htmlFor="logo" className="mb-3 text-blue-900">Platform Logo</Label>
          <div className="w-full cursor-pointer flex flex-col items-center gap-3">
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/png, image/jpeg, image/svg+xml"
              onChange={handleLogoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {formik.touched.logo && formik.errors.logo && (
            <div className="text-red-500 text-xs">{formik.errors.logo as string}</div>
          )}
        </div>
        <div className="w-30 h-30 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden mt-3">
          {logoPreview ? (
            <img src={logoPreview} alt="Logo Preview" className="object-contain w-full h-full" />
          ) : (
            <span className="text-gray-400 text-xs">No logo selected</span>
          )}
        </div>
      </div>
      <div className="w-full flex justify-end mt-8">
        <Button 
          type="button"
          onClick={() => formik.handleSubmit()}
          className="w-full md:w-auto px-8 py-3 text-base"
          disabled={updating}
        >
          {updating ? "Updating..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}