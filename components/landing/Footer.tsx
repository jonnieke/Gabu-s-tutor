import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 px-4 border-t border-gray-200">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-[#4a5568]">
            <span>🔒 Safe</span>
            <span>•</span>
            <span>🎯 Free Forever</span>
            <span>•</span>
            <span>⚡ Instant Access</span>
          </div>
          
          <p className="text-sm text-[#718096]">
            Making learning accessible and fun for every Kenyan student.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;