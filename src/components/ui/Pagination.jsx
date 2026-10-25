export default function Pagination({ page = 1, totalPages = 1, total = 0, onPage }) {
  if (totalPages <= 1) return <div className="text-xs text-muted-foreground">{total} record{total === 1 ? '' : 's'}</div>
  return <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-muted-foreground">Page {page} of {totalPages} · {total} records</span><div className="flex gap-2"><button className="btn btn-secondary px-3 py-2 text-xs" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button><button className="btn btn-secondary px-3 py-2 text-xs" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</button></div></div>
}
