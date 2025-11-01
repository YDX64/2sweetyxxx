import React from 'react';

interface FlagIconProps {
  code: string;
  className?: string;
}

const flagComponents: Record<string, React.FC<{ className?: string }>> = {
  tr: ({ className }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="16" fill="#E30A17"/>
      <circle cx="8.5" cy="8" r="3.5" fill="white"/>
      <circle cx="9.5" cy="8" r="2.8" fill="#E30A17"/>
      <path d="M10.5 6.5L11.5 8L10.5 9.5L12 8.5L13 10L12.5 8L14 7L12.5 8L12 6L11.5 8L10.5 6.5Z" fill="white"/>
    </svg>
  ),
  en: ({ className }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="16" fill="#012169"/>
      <path d="M0 0L24 16M24 0L0 16" stroke="white" strokeWidth="3"/>
      <path d="M0 0L24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1.5"/>
      <rect x="8" width="8" height="16" fill="white"/>
      <rect y="6" width="24" height="4" fill="white"/>
      <rect x="9.6" width="4.8" height="16" fill="#C8102E"/>
      <rect y="6.4" width="24" height="3.2" fill="#C8102E"/>
    </svg>
  ),
  de: ({ className }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="5.33" fill="#000000"/>
      <rect y="5.33" width="24" height="5.33" fill="#DD0000"/>
      <rect y="10.67" width="24" height="5.33" fill="#FFCE00"/>
    </svg>
  ),
  fr: ({ className }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="8" height="16" fill="#002654"/>
      <rect x="8" width="8" height="16" fill="white"/>
      <rect x="16" width="8" height="16" fill="#ED2939"/>
    </svg>
  ),
  es: ({ className }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="4" fill="#C60B1E"/>
      <rect y="4" width="24" height="8" fill="#FFC400"/>
      <rect y="12" width="24" height="4" fill="#C60B1E"/>
    </svg>
  ),
  it: ({ className }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="8" height="16" fill="#009246"/>
      <rect x="8" width="8" height="16" fill="white"/>
      <rect x="16" width="8" height="16" fill="#CE2B37"/>
    </svg>
  ),
  pt: ({ className }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="16" fill="#006847"/>
      <rect x="7" width="10" height="16" fill="#FFD700"/>
      <circle cx="12" cy="8" r="3" fill="#006847"/>
    </svg>
  ),
  ru: ({ className }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="5.33" fill="white"/>
      <rect y="5.33" width="24" height="5.33" fill="#0039A6"/>
      <rect y="10.67" width="24" height="5.33" fill="#D52B1E"/>
    </svg>
  ),
  zh: ({ className }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="16" fill="#DE2910"/>
      <path d="M6 4L7.5 7.5L11 6L8 8.5L9.5 12L6 9.5L2.5 12L4 8.5L1 6L4.5 7.5L6 4Z" fill="#FFDE00"/>
      <path d="M12 2L12.3 2.9L13.2 2.6L12.9 3.5L13.8 3.8L12.9 4.1L13.2 5L12.3 4.7L12 5.6L11.7 4.7L10.8 5L11.1 4.1L10.2 3.8L11.1 3.5L10.8 2.6L11.7 2.9L12 2Z" fill="#FFDE00"/>
      <path d="M15 4L15.3 4.9L16.2 4.6L15.9 5.5L16.8 5.8L15.9 6.1L16.2 7L15.3 6.7L15 7.6L14.7 6.7L13.8 7L14.1 6.1L13.2 5.8L14.1 5.5L13.8 4.6L14.7 4.9L15 4Z" fill="#FFDE00"/>
      <path d="M15 9L15.3 9.9L16.2 9.6L15.9 10.5L16.8 10.8L15.9 11.1L16.2 12L15.3 11.7L15 12.6L14.7 11.7L13.8 12L14.1 11.1L13.2 10.8L14.1 10.5L13.8 9.6L14.7 9.9L15 9Z" fill="#FFDE00"/>
      <path d="M12 11L12.3 11.9L13.2 11.6L12.9 12.5L13.8 12.8L12.9 13.1L13.2 14L12.3 13.7L12 14.6L11.7 13.7L10.8 14L11.1 13.1L10.2 12.8L11.1 12.5L10.8 11.6L11.7 11.9L12 11Z" fill="#FFDE00"/>
    </svg>
  ),
  ja: ({ className }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="16" fill="white"/>
      <circle cx="12" cy="8" r="4.8" fill="#BC002D"/>
    </svg>
  ),
  ko: ({ className }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="16" fill="white"/>
      <circle cx="12" cy="8" r="4" fill="#CD2E3A"/>
      <rect x="12" y="4" width="4" height="8" fill="#0047A0"/>
      <path d="M7 2L8 3M8 3L9 2M8 3V4M16 2L17 3M17 3L18 2M17 3V4M7 13L8 12M8 12L9 13M8 12V11M16 13L17 12M17 12L18 13M17 12V11" stroke="black" strokeWidth="0.5"/>
    </svg>
  ),
  ar: ({ className }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="16" fill="#006C35"/>
      <path d="M5 4H8L6.5 6.5L8 9L5 9L6.5 6.5L5 4Z" fill="white"/>
      <text x="12" y="11" fill="white" fontSize="8" fontFamily="Arial">الله</text>
    </svg>
  ),
  nl: ({ className }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="5.33" fill="#AE1C28"/>
      <rect y="5.33" width="24" height="5.33" fill="white"/>
      <rect y="10.67" width="24" height="5.33" fill="#21468B"/>
    </svg>
  ),
  da: ({ className }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="16" fill="#C60C30"/>
      <rect x="6" width="3" height="16" fill="white"/>
      <rect y="6" width="24" height="4" fill="white"/>
    </svg>
  ),
  fi: ({ className }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="16" fill="white"/>
      <rect x="6" width="4" height="16" fill="#003580"/>
      <rect y="6" width="24" height="4" fill="#003580"/>
    </svg>
  ),
  no: ({ className }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="16" fill="#BA0C2F"/>
      <rect x="6" width="3" height="16" fill="white"/>
      <rect y="6" width="24" height="4" fill="white"/>
      <rect x="7" width="1" height="16" fill="#00205B"/>
      <rect y="7" width="24" height="2" fill="#00205B"/>
    </svg>
  ),
  sv: ({ className }) => (
    <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="16" fill="#006AA7"/>
      <rect x="6" width="3" height="16" fill="#FECC00"/>
      <rect y="6" width="24" height="4" fill="#FECC00"/>
    </svg>
  ),
};

// Fallback for flags not defined
const FallbackFlag: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`${className} bg-gray-300 rounded-sm`} />
);

export const FlagIcon: React.FC<FlagIconProps> = ({ code, className = "w-5 h-3.5" }) => {
  const FlagComponent = flagComponents[code] || FallbackFlag;
  return <FlagComponent className={className} />;
};