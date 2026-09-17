import type { Access } from 'payload'

import { checkRole } from '@/access/utilities'

/** Editors and admins see drafts; everyone else sees published documents only. */
export const editorOrAdminOrPublished: Access = ({ req: { user } }) => {
  if (user && checkRole(['admin', 'editor'], user)) return true
  return {
    _status: {
      equals: 'published',
    },
  }
}
