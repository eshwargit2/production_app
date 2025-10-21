"use client"

import { useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function AdminImportPage() {
  const { data: me } = useSWR("/api/auth/me", fetcher)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[] | null>(null)
  const [result, setResult] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  async function handlePreview() {
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("preview", "1")
    const res = await fetch("/api/questions/bulk-import", { method: "POST", body: fd, credentials: "include" })
    const json = await res.json()
    setPreview(json.preview || null)
    setLoading(false)
  }

  async function handleImport() {
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/questions/bulk-import", { method: "POST", body: fd, credentials: "include" })
    const json = await res.json()
    setResult(json)
    setLoading(false)
  }

  if (!me?.user?.isAdmin) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="glass-effect rounded-xl p-8 border-2 border-white/20">
          <p className="text-white/80 text-xl">🔒 Admin access required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent animate-float mb-8">
          ⚙️ Bulk Import Questions ⚙️
        </h1>
      <Card className="glass-effect border-2 border-white/20 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-white text-xl">📁 Upload CSV/XLSX</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>File</Label>
            <Input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePreview} disabled={!file || loading} className="glass-effect text-white border-white/30 hover:bg-white/20 transform hover:scale-105 transition-all duration-300">
              👁️ Preview
            </Button>
            <Button onClick={handleImport} disabled={!file || loading} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 transform hover:scale-105 transition-all duration-300">
              {loading ? "🚀 Processing..." : "📥 Import"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {preview && (
        <div className="rounded-lg border p-4">
          <h2 className="font-medium mb-2">Preview</h2>
          <div className="max-h-64 overflow-auto text-sm">
            {preview.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-1 border-b last:border-0">
                <span>Row {p.index}</span>
                <span className={p.valid ? "text-green-600" : "text-destructive"}>{p.valid ? "OK" : p.error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="glass-effect rounded-xl p-6 border-2 border-white/20 animate-fade-in-up">
          <h2 className="font-bold mb-4 text-white text-xl">📊 Import Result</h2>
          <p className="text-white/80 mb-2">
            ✅ Imported {result.imported} questions into quiz {result.quizId}
          </p>
          {result.errors?.length > 0 && (
            <div className="mt-2 text-red-300 bg-red-500/20 p-3 rounded-lg">
              ⚠️ {result.errors.length} rows failed validation
            </div>
          )}
        </div>
      )}
      </main>
    </div>
  )
}
