import React from 'react'

/** Club mark used on the admin login screen and in the admin sidebar. */
export const AdminLogo: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/logo.png" alt="" width={56} height={56} style={{ display: 'block' }} />
    <div style={{ lineHeight: 1.05 }}>
      <div
        style={{
          fontWeight: 800,
          fontSize: 22,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        Wildcats
      </div>
      <div style={{ fontSize: 12, letterSpacing: '0.22em', color: '#D2312E' }}>THE BASIN</div>
    </div>
  </div>
)

export const AdminIcon: React.FC = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/logo.png" alt="" width={28} height={28} style={{ display: 'block' }} />
)
