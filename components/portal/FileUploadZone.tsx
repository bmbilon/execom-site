'use client'

import { useState, useCallback, useRef } from 'react'

const ALLOWED_EXTENSIONS = ['pdf', 'xlsx', 'xls', 'csv', 'docx', 'png', 'jpg', 'jpeg', 'zip']
const MAX_FILE_SIZE = 25 * 1024 * 1024

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
}

export default function FileUploadZone({ onFilesSelected, disabled }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFiles = useCallback((files: FileList | File[]): File[] => {
    const valid: File[] = []
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) continue
      if (file.size > MAX_FILE_SIZE) continue
      valid.push(file)
    }
    return valid
  }, [])

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const files = validateFiles(e.dataTransfer.files)
    if (files.length > 0) onFilesSelected(files)
  }

  function handleClick() {
    if (!disabled) inputRef.current?.click()
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const files = validateFiles(e.target.files)
    if (files.length > 0) onFilesSelected(files)
    e.target.value = ''
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`border-[1.5px] border-dashed rounded-[6px] p-10 text-center cursor-pointer transition-colors ${
        isDragging
          ? 'border-blue bg-blue/5'
          : 'border-[#E5E5E5] hover:border-blue'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.xlsx,.xls,.csv,.docx,.png,.jpg,.jpeg,.zip"
        onChange={handleChange}
        className="hidden"
      />
      <p className="text-[15px] text-[#1A1A1A] font-medium mb-1">
        Drop files here or click to browse
      </p>
      <p className="text-[13px] text-[#5A5A5A]">
        PDF, XLSX, CSV, DOCX, PNG, JPG, ZIP — max 25 MB per file
      </p>
    </div>
  )
}
