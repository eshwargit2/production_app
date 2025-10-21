import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/auth"
import * as XLSX from "xlsx"
import Quiz from "@/models/quiz"
import Question from "@/models/question"

type Row = {
  text: string
  option1: string
  option2: string
  option3?: string
  option4?: string
  correctOptionIndex: number // 0-based
  category?: string
  difficulty?: string
  quizTitle?: string
  timeLimitSec?: number
}

function parseFile(buffer: ArrayBuffer) {
  const wb = XLSX.read(buffer, { type: "array" })
  const ws = wb.Sheets[wb.SheetNames[0]]
  
  // Debug: Get the actual column headers
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1')
  const headers = []
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })]
    headers.push(cell ? cell.v : undefined)
  }
  console.log('Excel headers found:', headers)
  
  const rows = XLSX.utils.sheet_to_json<Row>(ws, { raw: true })
  console.log('First parsed row:', rows[0])
  
  return { rows, headers }
}

export async function POST(req: Request) {
  await dbConnect()
  requireAdmin()
  const form = await req.formData()
  const file = form.get("file") as File | null
  const quizId = (form.get("quizId") as string) || ""
  const preview = (form.get("preview") as string) === "1"
  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 })

  const buffer = await file.arrayBuffer()
  const { rows, headers } = parseFile(buffer)

  // quick validation
  const parsed = rows.map((r, idx) => {
    const opts = [r.option1, r.option2, r.option3, r.option4].filter(Boolean) as string[]
    
    // Detailed validation checks
    const errors = []
    if (!r.text) errors.push("Missing question text")
    if (opts.length < 2) errors.push(`Only ${opts.length} options provided, need at least 2`)
    if (typeof r.correctOptionIndex !== "number") errors.push(`correctOptionIndex is ${typeof r.correctOptionIndex}, expected number`)
    if (typeof r.correctOptionIndex === "number" && (r.correctOptionIndex < 0 || r.correctOptionIndex >= opts.length)) {
      errors.push(`correctOptionIndex ${r.correctOptionIndex} is out of range (0-${opts.length - 1})`)
    }
    
    const valid = errors.length === 0
    
    return {
      index: idx + 2, // account for header row
      valid,
      question: valid
        ? {
            text: r.text,
            options: opts.map((t) => ({ text: t })),
            correctOptionIndex: r.correctOptionIndex,
            category: r.category || undefined,
            difficulty: (r.difficulty as any) || undefined,
          }
        : null,
      error: valid ? null : errors.join("; "),
      rawData: r, // Add raw data for debugging
      quizTitle: r.quizTitle,
      timeLimitSec: r.timeLimitSec,
    }
  })

  if (preview) {
    return NextResponse.json({ 
      preview: parsed,
      headers: headers,
      expectedHeaders: ['text', 'option1', 'option2', 'option3', 'option4', 'correctOptionIndex', 'quizTitle', 'timeLimitSec']
    })
  }

  // import
  let targetQuizId = quizId
  if (!targetQuizId) {
    // create or reuse by title
    const firstWithTitle = rows.find((r) => r.quizTitle)
    const title = firstWithTitle?.quizTitle || "Imported Quiz"
    const timeLimitSec = Number(firstWithTitle?.timeLimitSec) || 60
    const created = await Quiz.create({ title, description: "", category: "General", timeLimitSec, questionIds: [] })
    targetQuizId = String(created._id)
  }

  const validItems = parsed.filter((p) => p.valid && p.question).map((p) => p.question!)
  const created = await Question.insertMany(validItems)
  const createdIds = created.map((q) => q._id)

  await Quiz.findByIdAndUpdate(targetQuizId, { $push: { questionIds: { $each: createdIds } } })

  return NextResponse.json({
    imported: created.length,
    quizId: targetQuizId,
    errors: parsed.filter((p) => !p.valid),
    totalRows: parsed.length,
    validRows: parsed.filter((p) => p.valid).length,
  })
}
