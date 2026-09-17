import Link from 'next/link'
import React from 'react'

export const Pagination: React.FC<{
  className?: string
  page: number
  totalPages: number
}> = (props) => {
  const { className, page, totalPages } = props
  const hasPrevPage = page > 1
  const hasNextPage = page < totalPages

  const hrefForPage = (target: number) => (target <= 1 ? '/news' : `/news/page/${target}`)

  return (
    <nav
      className={['pager', className].filter(Boolean).join(' ')}
      aria-label="News pagination"
    >
      {hasPrevPage ? (
        <Link className="btn btn-outline" href={hrefForPage(page - 1)}>
          Previous
        </Link>
      ) : (
        <span className="btn btn-outline is-disabled" aria-disabled="true">
          Previous
        </span>
      )}

      <span className="pager-status">
        Page {page} of {totalPages}
      </span>

      {hasNextPage ? (
        <Link className="btn btn-red" href={`/news/page/${page + 1}`}>
          Next
        </Link>
      ) : (
        <span className="btn btn-red is-disabled" aria-disabled="true">
          Next
        </span>
      )}
    </nav>
  )
}
