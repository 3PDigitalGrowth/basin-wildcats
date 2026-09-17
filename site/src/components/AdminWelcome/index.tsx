import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

/**
 * Committee-facing welcome on the admin dashboard. Plain instructions in
 * WordPress terms, because that is what the club knows.
 */
export const AdminWelcome: React.FC = () => {
  return (
    <div style={{ marginBottom: 'var(--base)' }}>
      <Banner type="success">
        <h4 style={{ margin: 0 }}>Welcome to the Wildcats website admin</h4>
      </Banner>
      <ul style={{ margin: 'calc(var(--base) / 2) 0 0', paddingLeft: '1.2em', lineHeight: 1.7 }}>
        <li>
          <strong>Pages</strong> are the site sections (Our Club, Join, Members and so on). Open
          one, edit the blocks, hit Publish.
        </li>
        <li>
          <strong>News</strong> is the club blog. Add a post, give it a photo and a couple of
          sentences, publish or schedule it.
        </li>
        <li>
          <strong>Documents</strong> holds policies, coaching resources and team manager files.
          Upload once, then list them on any page with a Document list block.
        </li>
        <li>
          <strong>Media</strong> is the photo library. <strong>Sponsors</strong>,{' '}
          <strong>Navigation</strong>, <strong>Footer</strong> and <strong>Site settings</strong>{' '}
          cover everything else that is not a page.
        </li>
        <li>
          <strong>Shop</strong>: products, stock and orders. Orders show who paid and what to hand
          them at training.
        </li>
        <li>
          Stuck? Email 3P Digital, updates are covered under the SCCS arrangement.{' '}
          <a href="/" target="_blank" rel="noreferrer">
            View the live site
          </a>
          .
        </li>
      </ul>
    </div>
  )
}
