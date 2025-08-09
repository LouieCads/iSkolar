import { Metadata } from "next";

export const metadata: Metadata = {
  title: "iSkolar | General",
  description: "Manage system preferences and configurations for your platform",
};

export default function GeneralSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}