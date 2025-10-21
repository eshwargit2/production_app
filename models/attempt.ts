import { Schema, models, model, Types } from "mongoose"

const AttemptSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    quizId: { type: Types.ObjectId, ref: "Quiz", required: true, index: true },
    answers: [
      {
        questionId: { type: Types.ObjectId, ref: "Question", required: true },
        selectedIndex: { type: Number, required: true },
        correct: { type: Boolean, required: true },
      },
    ],
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    durationSec: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export type AttemptDoc = {
  _id: string
  userId: string
  quizId: string
  answers: { questionId: string; selectedIndex: number; correct: boolean }[]
  score: number
  total: number
  durationSec: number
}

export default models.Attempt || model("Attempt", AttemptSchema)
