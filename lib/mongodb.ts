import mongoose from "mongoose"

let cached = (global as any)._mongooseCached as {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}
if (!cached) {
  cached = (global as any)._mongooseCached = { conn: null, promise: null }
}

export async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it in Project Settings > Environment Variables.")
  }
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      // @ts-ignore
      bufferCommands: false,
      // retry writes enabled by default in modern clusters
    })
  }
  cached.conn = await cached.promise
  return cached.conn
}
