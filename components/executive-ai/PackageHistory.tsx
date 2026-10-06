export type SavedPackage = {
  id: string
  created_at: string
  course_version: number | null
}
export default function PackageHistory({
  packages,
}: {
  packages: SavedPackage[]
}) {
  if (!packages.length) return null
  return (
    <div className="mt-6">
      <h3 className="font-semibold">Saved preparation packages</h3>
      <ul className="mt-3 space-y-3 text-sm">
        {packages.map((p) => (
          <li key={p.id}>
            <a
              className="underline"
              href={'/api/executive-ai/documents/grant?packageId=' + p.id}
            >
              Download {new Date(p.created_at).toLocaleString()} · course
              version {p.course_version ?? 'unconfirmed'}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
