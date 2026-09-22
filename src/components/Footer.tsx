import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-14 sm:py-16 px-4 sm:px-8 lg:px-10 border-t border-[#224347]/20 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 max-w-[1400px] mx-auto relative z-10">
      <div>
        <div className="font-syne text-sm font-bold uppercase tracking-wider text-[#224347] mb-1.5">
          Nashville Studios
        </div>
        <p className="text-xs text-[#224347]/70 font-inter font-normal">
          © 2026 Nashville Studios. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
