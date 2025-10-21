import { Schema, models, model } from "mongoose"

const UserSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    avatarId: { type: Number, default: 1 },
  },
  { timestamps: true },
)

export type UserDoc = {
  _id: string
  email: string
  passwordHash: string
  name: string
  isAdmin: boolean
  avatarId: number
}

export default models.User || model("User", UserSchema)
