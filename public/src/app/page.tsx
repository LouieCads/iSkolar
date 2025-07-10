import React from 'react';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Footer from '@/components/landing/Footer';
import Benefits from '@/components/landing/Benefits';
import Sponsors from '@/components/landing/Sponsors';
import FAQ from '@/components/landing/FAQ';
import HowItWorks from '@/components/landing/HowItWorks';

export default function Home(): React.JSX.Element {
  return (
    <div>
      <Header />
      <main className="flex-grow">  
        <Hero />
        <HowItWorks />
        <Benefits />
        <Sponsors />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
