import React, { useEffect, useRef } from 'react';

function ClientOnlyComponent(user) {
  const containerRef = useRef(null);

  // Use the `useEffect` hook to run jQuery code client-side
  useEffect(() => {
    let $; // Declare a variable to hold jQuery

    // Ensure jQuery is only used client-side
    if (typeof window !== "undefined") {

      // Dynamically import the jQueryLoader module
      import('@/jqueryLoader').then(jqueryLoader => {

        // Assign jQuery to the `$` variable for use in the cleanup function
        $ = window.$;

        // Initialize jQuery or Backbone manipulation here
        $(containerRef.current).append('<p>Updated by jQuery</p>');

      });
    }
  

    // Cleanup function to unbind any jQuery events or manipulations
    return () => {
      if ($) {
        $(containerRef.current).unbind();
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div ref={containerRef}>
      {/* Base HTML markup */}
    </div>
  );
};

export default ClientOnlyComponent;