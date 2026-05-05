import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-indigo-500 text-white shadow-md p-4 relative overflow-hidden">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="z-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">*TOEFL iBT.</h1>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white">Speaking Scoring Guide</h2>
          <p className="text-xl md:text-2xl font-semibold text-indigo-200 mt-1">Listen and Repeat</p>
        </div>
        <div className="absolute top-0 right-0 -mt-16 -mr-16 md:-mt-20 md:-mr-20 w-48 h-48 md:w-64 md:h-64 bg-lime-300 transform rotate-45 opacity-50 z-0"></div>
        <div className="absolute top-0 right-0 -mt-8 -mr-8 md:-mt-12 md:-mr-12 w-32 h-32 md:w-48 md:h-48 bg-lime-400 transform rotate-12 opacity-50 z-0"></div>
      </div>
    </header>
  );
};

export default Header;