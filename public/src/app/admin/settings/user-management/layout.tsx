import { Metadata } from "next";

export const metadata: Metadata = {
  title: "iSkolar | Users",
  description: "Manage system preferences and configurations for your platform",
};

export default function UserManagementSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}