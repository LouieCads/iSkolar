import { Metadata } from "next";

export const metadata: Metadata = {
  title: "iSkolar | School Details",
  description: "Manage system preferences and configurations for your platform",
};

export default function SchoolDetailsSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}