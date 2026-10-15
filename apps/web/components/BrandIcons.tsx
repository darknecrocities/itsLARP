import React from "react";

interface BrandIconProps {
  className?: string;
  size?: number;
}

/**
 * Authentic vector brand icons for job platforms and communication tools.
 */

export function GmailIcon({ className = "w-5 h-5", size = 20 }: BrandIconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" fill="#EA4335" fillOpacity="0.1" />
      <path d="M20 4H4C2.9 4 2 4.9 2 6L12 13L22 6C22 4.9 21.1 4 20 4Z" fill="#EA4335" />
      <path d="M2 18V6L12 13L22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18Z" stroke="#EA4335" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 20L10 13.5M20 20L14 13.5" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function OutlookIcon({ className = "w-5 h-5", size = 20 }: BrandIconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="3" fill="#0078D4" fillOpacity="0.15" />
      <rect x="2" y="4" width="20" height="16" rx="3" stroke="#0078D4" strokeWidth="1.5" />
      <path d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z" stroke="#0078D4" strokeWidth="2" />
    </svg>
  );
}

export function NotionIcon({ className = "w-5 h-5", size = 20 }: BrandIconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#000000" />
      <path d="M6 6.5V17.5M6 6.5L13.5 17.5M13.5 17.5V6.5M13.5 17.5H18" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LinkedInIcon({ className = "w-5 h-5", size = 20 }: BrandIconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path d="M6.5 9.5V17.5M6.5 6.5V6.6M11.5 17.5V13.2C11.5 11.5 12.5 10.5 14 10.5C15.5 10.5 16.5 11.5 16.5 13.2V17.5M11.5 17.5H11.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IndeedIcon({ className = "w-5 h-5", size = 20 }: BrandIconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#2164F3" />
      <path d="M11 7C11 5.9 11.9 5 13 5C14.1 5 15 5.9 15 7C15 8.1 14.1 9 13 9C11.9 9 11 8.1 11 7ZM11 11H15V19H11V11Z" fill="#FFFFFF" />
    </svg>
  );
}

export function GlassdoorIcon({ className = "w-5 h-5", size = 20 }: BrandIconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#0CAA41" />
      <path d="M8 8V16H16M8 8H16" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ZipRecruiterIcon({ className = "w-5 h-5", size = 20 }: BrandIconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#2B6B48" />
      <path d="M12 5L7 11H10V18H14V11H17L12 5Z" fill="#FFFFFF" />
    </svg>
  );
}

export function WellfoundIcon({ className = "w-5 h-5", size = 20 }: BrandIconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#FF5A5F" />
      <path d="M6 7L9 17L12 10L15 17L18 7" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
