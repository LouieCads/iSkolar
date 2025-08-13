import { Metadata } from "next";
import { getPlatformDetails } from "@/lib/getPlatformDetails";

export async function generateMetadata(): Promise<Metadata> {
  const { name: platformName } = await getPlatformDetails();
  return {
    title: `${platformName} | Create Scholarship`,
    description: `A blockchain-powered scholarship startup that connects Filipino university students and sponsors through transparent fund disbursement, credential-based applications, and wallet-to-wallet tuition payments.`,
  };
}

export default function CreateScholarshipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}