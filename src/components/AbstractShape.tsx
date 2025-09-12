import React from 'react';

const AbstractShape: React.FC = () => {
  return (
    <div className="relative w-full h-32 overflow-hidden">
      {/* Main Orange Element (Left Side) */}
      <div 
        className="absolute top-0 left-0 w-3/5 h-full"
        style={{
          background: '#FF5C00',
          clipPath: 'polygon(0% 0%, 60% 0%, 40% 30%, 70% 50%, 30% 80%, 0% 100%)'
        }}
      />
      
      {/* First Black Layer (Behind Orange) */}
      <div 
        className="absolute top-0 left-0 w-3/5 h-full"
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
          clipPath: 'polygon(0% 0%, 65% 0%, 45% 30%, 75% 50%, 35% 80%, 0% 100%)',
          zIndex: 1
        }}
      />
      
      {/* Second Black Layer (Top-Middle) */}
      <div 
        className="absolute top-0 right-0 w-2/5 h-1/3"
        style={{
          background: 'linear-gradient(135deg, #2a2a2a 0%, #0a0a0a 100%)',
          clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)',
          zIndex: 2
        }}
      />
      
      {/* White and Grey 3D Block (Bottom-Middle) */}
      <div 
        className="absolute top-1/2 right-1/4 w-1/3 h-1/2"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #2a2a2a 50%, #1a1a1a 100%)',
          clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 0% 100%)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          zIndex: 3
        }}
      />
      
      {/* Additional accent elements for depth */}
      <div 
        className="absolute top-1/4 right-1/3 w-16 h-8"
        style={{
          background: 'linear-gradient(45deg, #FF7A29 0%, #FF5C00 100%)',
          clipPath: 'polygon(0% 0%, 100% 0%, 80% 100%, 0% 100%)',
          zIndex: 4
        }}
      />
      
      {/* Subtle shadow overlay for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, rgba(0, 0, 0, 0.1) 50%, transparent 100%)',
          zIndex: 5
        }}
      />
    </div>
  );
};

export default AbstractShape;
