import React from 'react';
import PillNav from '@/components/ui/PillNav';
import LampDemo from '@/components/ui/lamp';
import CurrencyConverter from '@/components/ui/CurrencyConverter';
import reactLogo from '@/assets/react.svg';

const Home = () => {
  // Navigation items for PillNav
  const navItems = [
    {
      href: '/',
      label: 'HOME',
      ariaLabel: 'Go to home page'
    },
    {
      href: '/about',
      label: 'ABOUT',
      ariaLabel: 'Go to about section'
    },
    {
      href: '/contact',
      label: 'CONTACT',
      ariaLabel: 'Go to contact section'
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      {/* PillNav Component - Centered */}
      <PillNav
        logo={reactLogo}
        logoAlt="Logo"
        items={navItems}
        activeHref="/"
        baseColor="#fff"
        pillColor="#060010"
        hoveredPillTextColor="#060010"
        pillTextColor="#fff"
        className="centered"
      />

      {/* Hero Section with Lamp Component */}
      <div className="relative w-full">
        <LampDemo />
      </div>

      {/* Currency Converter Form */}
      <div className="relative z-10 -mt-32 md:-mt-40 pb-20 px-4">
        <CurrencyConverter />
      </div>
    </div>
  );
};

export default Home;

