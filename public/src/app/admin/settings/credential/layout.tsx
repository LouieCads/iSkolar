import { Metadata } from "next";

export const metadata: Metadata = {
  title: "iSkolar | Credential",
  description: "Manage system preferences and configurations for your platform",
};

export default function CredentialsSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}