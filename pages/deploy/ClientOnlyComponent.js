import React, { useEffect, useRef } from 'react';
import $ from 'jquery';

const ClientOnlyComponent = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Ensure jQuery is only used client-side
    if (typeof window !== "undefined") {
      // Initialize jQuery or Backbone manipulation here
      $(containerRef.current).html('<p>Updated by jQuery</p>');
    }

    // Cleanup function to unbind any jQuery events or manipulations
    return () => {
      $(containerRef.current).unbind();
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div ref={containerRef}>
      {/* Base HTML markup */}
    </div>
  );
};

export default ClientOnlyComponent;