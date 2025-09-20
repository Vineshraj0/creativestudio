
import React from 'react';

const PaletteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="10.5" cy="11.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.668 0-.437-.18-.835-.47-1.125-.29-.289-.68-.467-1.128-.467-.828 0-1.5.672-1.5 1.5 0 .208.04.406.11.588.07.182.18.347.3.494.12.147.28.26.45.33.17.07.36.1.55.1.828 0 1.5-.672 1.5-1.5 0-.208-.04-.406-.11-.588-.07-.182-.18-.347-.3-.494a1.5 1.5 0 0 0-2.05-2.05c-.147-.12-.312-.23-.494-.3-.182-.07-.38-.11-.588-.11-.828 0-1.5.672-1.5 1.5 0 .208.04.406.11.588.07.182.18.347.3.494.12.147.28.26.45.33.17.07.36.1.55.1.828 0 1.5-.672 1.5-1.5 0-.208-.04-.406-.11-.588-.07-.182-.18-.347-.3-.494A1.5 1.5 0 0 0 12 2Z" />
  </svg>
);

export default PaletteIcon;
