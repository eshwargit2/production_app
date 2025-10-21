import { Schema, models, model, Types } from "mongoose"

const QuizSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "General" },
    timeLimitSec: { type: Number, default: 60 },
    questionIds: [{ type: Types.ObjectId, ref: "Question" }],
  },
  { timestamps: true },
)

export type QuizDoc = {
  _id: string
  title: string
  description: string
  category: string
  timeLimitSec: number
  questionIds: string[]
}

export default models.Quiz || model("Quiz", QuizSchema)
