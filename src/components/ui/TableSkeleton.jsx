export default function TableSkeleton({ rows = 6, columns = 5 }) {
  return <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">{Array.from({ length: rows }, (_, row) => <div key={row} className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-5">{Array.from({ length: columns }, (_, col) => <div key={col} className="skeleton h-4 rounded-full" />)}</div>)}</div>
}
