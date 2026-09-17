import type { Access } from 'payload'

import { checkRole } from '@/access/utilities'

/** Committee editors and admins can manage site content. Customers cannot. */
export const editorOrAdmin: Access = ({ req: { user } }) => {
  if (!user) return false
  return checkRole(['admin', 'editor'], user)
}
