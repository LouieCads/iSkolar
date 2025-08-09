import { Metadata } from "next";

export const metadata: Metadata = {
  title: "iSkolar | Token & Payment",
  description: "Manage system preferences and configurations for your platform",
};

export default function TokenPaymentSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}