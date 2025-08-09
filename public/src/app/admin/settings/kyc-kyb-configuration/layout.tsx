import { Metadata } from "next";

export const metadata: Metadata = {
  title: "iSkolar | KYC/KYB Configuration",
  description: "Manage system preferences and configurations for your platform",
};

export default function KycKybConfigurationSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}