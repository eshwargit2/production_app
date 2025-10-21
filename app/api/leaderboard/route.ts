import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongodb"
import Attempt from "@/models/attempt"
import { Types } from "mongoose"

export async function GET(req: Request) {
  await dbConnect()
  const { searchParams } = new URL(req.url)
  const quizId = searchParams.get("quizId") || undefined

  const pipeline: any[] = [
    ...(quizId ? [{ $match: { quizId: new Types.ObjectId(quizId) } }] : []),
    { $sort: { score: -1, durationSec: 1, createdAt: 1 } },
    { $limit: 20 },
    { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    {
      $project: {
        score: 1,
        total: 1,
        durationSec: 1,
        createdAt: 1,
        userName: "$user.name",
        avatarId: { $ifNull: ["$user.avatarId", 1] },
      },
    },
  ]
  const rows = await (Attempt as any).aggregate(pipeline)
  return NextResponse.json({ rows })
}
