import React from 'react'

/**
 * Line icons for the homepage quick links, drawn on a 24px grid with the
 * same round-capped stroke so they read as one set.
 */
const paths: Record<string, React.ReactNode> = {
  singlet: (
    <>
      <path d="M8.5 3c0 2 1.6 3.4 3.5 3.4S15.5 5 15.5 3l3 .9c-.5 2.8-.2 5 1.5 6.8V21H4V10.7c1.7-1.8 2-4 1.5-6.8z" />
      <path d="M12 11v6M9.5 13.5h5" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 14.2c2.9.3 5 2.6 5 5.8" />
    </>
  ),
  megaphone: (
    <>
      <path d="M3.5 10.2v3.6c0 .6.4 1 1 1H7l5.5 4.2V5L7 9.2H4.5c-.6 0-1 .4-1 1z" />
      <path d="M15.5 9.3a3.5 3.5 0 0 1 0 5.4M18.2 6.8a7 7 0 0 1 0 10.4" />
    </>
  ),
  hoodie: (
    <>
      <path d="M8.2 4.2 4 6.6 2.8 12l2.7.7.9-2.9V20h11.2V9.8l.9 2.9 2.7-.7L20 6.6l-4.2-2.4" />
      <path d="M8.2 4.2C8.6 6.6 10.1 8 12 8s3.4-1.4 3.8-3.8C14.7 3.4 13.4 3 12 3s-2.7.4-3.8 1.2z" />
      <path d="M9 16h6" />
    </>
  ),
  whistle: (
    <>
      <circle cx="9" cy="14" r="5" />
      <path d="M12.6 10.5 21 8v4.2l-5.6 1.1" />
      <circle cx="9" cy="14" r="1.4" />
      <path d="M6.2 9.8C4.8 7 6 4.5 8.6 4" />
    </>
  ),
  ball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18M5.6 5.6c3.2 3.2 3.2 9.6 0 12.8M18.4 5.6c-3.2 3.2-3.2 9.6 0 12.8" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2" />
    </>
  ),
  document: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4M9 12h6M9 15.5h6M9 9h2" />
    </>
  ),
}

export const QuickLinkIcon: React.FC<{ name?: string | null }> = ({ name }) => (
  <svg
    viewBox="0 0 24 24"
    width="26"
    height="26"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {paths[name || 'ball'] ?? paths.ball}
  </svg>
)
