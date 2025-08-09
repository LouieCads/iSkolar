import { Metadata } from "next";

export const metadata: Metadata = {
  title: "iSkolar | Academic Details",
  description: "Manage system preferences and configurations for your platform",
};

export default function AcademicDetailsSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}