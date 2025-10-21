import { Schema, models, model } from "mongoose"

const OptionSchema = new Schema({
  text: { type: String, required: true },
})

const QuestionSchema = new Schema(
  {
    text: { type: String, required: true },
    options: { type: [OptionSchema], required: true, validate: (v: any[]) => v.length >= 2 && v.length <= 6 },
    correctOptionIndex: { type: Number, required: true },
    category: { type: String },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
  },
  { timestamps: true },
)

export type QuestionDoc = {
  _id: string
  text: string
  options: { text: string }[]
  correctOptionIndex: number
  category?: string
  difficulty?: "easy" | "medium" | "hard"
}

export default models.Question || model("Question", QuestionSchema)
