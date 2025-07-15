"use client";

import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { getPlatformName } from "@/lib/getPlatformName";

interface FAQ {
  question: string;
  answer: string;
}

export default function FAQ(): React.JSX.Element {
  const [platformName, setPlatformName] = useState("iSkolar");
  useEffect(() => {
    getPlatformName().then(setPlatformName);
  }, []);

  const faqs: FAQ[] = [
    {
      question: `What is ${platformName}?`,
      answer:
        `${platformName} is a blockchain-integrated scholarship platform connecting Filipino university students with individual and corporate sponsors. It ensures transparent, secure, and direct scholarship distribution, with funds sent directly to schools on behalf of students.`,
    },
    {
      question: `What makes ${platformName} unique?`,
      answer:
        `${platformName} automatically notifies students who match the criteria and tags of new scholarship banners posted by sponsors. This ensures that eligible students never miss out on opportunities, and sponsors reach the right candidates efficiently, making the scholarship process more targeted and effective for everyone.`,
    },
    {
      question: "How do I get started on iSkolar?",
      answer:
        "Log in via BridgePass, select your role (Student, Sponsor, or School Verifier), and complete the required KYC/KYB process. Once verified, you gain access to your dashboard and platform features relevant to your role.",
    },
    {
      question: "What is KYC/KYB and why is it required?",
      answer:
        "KYC (Know Your Customer) and KYB (Know Your Business) are verification processes to confirm the identity of students, sponsors, and schools. This ensures authenticity, prevents fraud, and is required before accessing full platform features.",
    },
    {
      question: "How are scholarships created and awarded?",
      answer:
        "Sponsors create scholarship banners with specific criteria and select a school to support. Students from that school can apply if eligible. Selection can be Auto (school selects scholars) or Manual (sponsor selects scholars). Funds are sent directly to the school for tuition or allowance purposes.",
    },
    {
      question: "What payment methods are supported for sponsors?",
      answer:
        "Sponsors can deposit funds via stablecoins (PHPC, USDT, USDC) or through local e-wallets (GCash, Maya). All transactions are recorded and funds are held securely until disbursement to schools.",
    },
    {
      question: "How does the fund disbursement process work?",
      answer:
        "After scholars are selected and approved, sponsors send funds directly to the school using the chosen payment method. The school confirms receipt, and the system notifies both the student and sponsor. Funds are never sent directly to students.",
    },
    {
      question: "What is the role of universities or schools?",
      answer:
        "Schools act as verifiers for student KYC, participate in scholar selection (Auto mode), and confirm receipt of tuition payments. They can also generate reports and view transactions from sponsors.",
    },
    {
      question: "Who can become a sponsor?",
      answer:
        "Any individual or corporate entity can become a sponsor by completing the KYC (for individuals) or KYB (for corporates) process. Sponsors can create scholarships, set criteria, and support students at selected schools.",
    },
    {
      question: "What happens if my KYC/KYB is denied?",
      answer:
        "If your KYC/KYB is denied, you may resubmit your documents. After three unsuccessful attempts, you must wait 30 days before trying again. You will be notified of approval or denial via the platform.",
    },
    {
      question: "Is my personal information secure?",
      answer:
        "Yes. iSkolar uses encryption and secure data practices to protect your personal information. Only necessary academic achievements are visible for transparency; sensitive data is kept private and secure.",
    },
  ];

  return (
    <section id="faq" className="bg-white py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-12">
          <h2 className="mb-3 text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#0054a6] to-[#0077e6] text-transparent bg-clip-text">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-[#0054a6]/70">
            Find answers to common questions about {platformName} and how it works.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq: FAQ, index: number) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-[#e0f0ff]"
              >
                <AccordionTrigger className="text-left text-lg sm:text-xl md:text-2xl font-medium text-[#0054a6] hover:text-[#0077e6] py-3 sm:py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#0061c2]/80 text-sm sm:text-base pt-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 max-w-2xl mx-auto text-center">
          <p className="text-[#0061c2] italic text-sm sm:text-base">
            Have more questions? Feel free to reach out to our team at{" "}
            <a
              href="mailto:support@iskolar.io"
              className="text-[#0077e6] underline hover:text-[#0054a6]"
            >
              support@iskolar.io
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}