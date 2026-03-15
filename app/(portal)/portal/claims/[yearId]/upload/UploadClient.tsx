'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'
import FileUploadZone from '@/components/portal/FileUploadZone'
import FileGrid from '@/components/portal/FileGrid'
import { Toaster, toast } from 'sonner'

interface FileRecord {
  id: string
  file_name: string
  category: string
  mime_type: string | null
  file_size: number | null
  uploaded_at: string
  storage_key: string
}

export default function UploadClient({
  yearId,
  companyId,
  initialFiles,
}: {
  yearId: string
  companyId: string
  initialFiles: FileRecord[]
}) {
  const [files, setFiles] = useState<FileRecord[]>(initialFiles)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const refreshFiles = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('files')
      .select('*')
      .eq('claim_year_id', yearId)
      .order('uploaded_at', { ascending: false })
    if (data) setFiles(data)
  }, [yearId])

  async function handleFilesSelected(selectedFiles: File[]) {
    setUploading(true)
    const supabase = createClient()

    for (const file of selectedFiles) {
      const uuid = crypto.randomUUID()
      const sanitized = file.name
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '_')
        .slice(0, 100)
      const storageKey = `${companyId}/${yearId}/${uuid}_${sanitized}`

      const { error: uploadError } = await supabase.storage
        .from('sred-files')
        .upload(storageKey, file)

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`)
        continue
      }

      const { data: { session } } = await supabase.auth.getSession()

      const { error: dbError } = await supabase.from('files').insert({
        claim_year_id: yearId,
        uploaded_by: session?.user.id,
        file_name: file.name,
        storage_key: storageKey,
        category: 'other',
        mime_type: file.type || null,
        file_size: file.size,
      })

      if (dbError) {
        toast.error(`Failed to save ${file.name}`)
        continue
      }

      toast.success(`Uploaded ${file.name}`)
    }

    // Auto-advance claim status from draft to in_progress
    await supabase
      .from('claim_years')
      .update({ status: 'in_progress', updated_at: new Date().toISOString() })
      .eq('id', yearId)
      .eq('status', 'draft')

    setUploading(false)
    await refreshFiles()
    router.refresh()
  }

  return (
    <div>
      <Toaster position="bottom-right" />
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
        Documents
      </p>
      <p className="text-[15px] text-[#5A5A5A] mb-6">
        Upload payroll records, accounting exports, technical documents, and contracts relevant to your SR&ED claim.
      </p>

      <FileUploadZone onFilesSelected={handleFilesSelected} disabled={uploading} />

      {uploading && (
        <div className="mt-4">
          <div className="h-1 bg-surface-raised rounded overflow-hidden">
            <div className="h-full bg-blue rounded animate-pulse w-2/3" />
          </div>
          <p className="text-[13px] text-[#5A5A5A] mt-2">Uploading...</p>
        </div>
      )}

      <div className="mt-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
          Uploaded Files ({files.length})
        </p>
        <FileGrid files={files} onUpdate={refreshFiles} />
      </div>
    </div>
  )
}
