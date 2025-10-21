import { ProfileAvatar } from "@/components/ui/profile-avatar"

async function fetchLeaderboard() {
  const res = await fetch("http://localhost:3000/api/leaderboard", {
    cache: "no-store",
  })
  const json = await res.json()
  return json.rows as { userName: string; score: number; total: number; durationSec: number; avatarId?: number }[]
}

export default async function LeaderboardPage() {
  const rows = await fetchLeaderboard()
  return (
    <div className="min-h-screen gradient-bg">
      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Header with navigation */}
        <div className="flex justify-between items-center mb-8 animate-fade-in-up">
          <div></div> {/* Empty div for spacing */}
          <div className="flex gap-3">
            <a href="/" className="glass-effect text-white border-white/30 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300 text-sm">
              🏠 Home
            </a>
            <a href="/dashboard" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 px-4 py-2 rounded-lg transition-all duration-300 text-sm">
              👤 Dashboard
            </a>
            <a href="/profile" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-4 py-2 rounded-lg transition-all duration-300 text-sm">
              ⚙️ Profile
            </a>
          </div>
        </div>
        
        {/* Login reminder */}
        <div className="glass-effect rounded-xl p-4 border-2 border-blue-400/30 mb-6 animate-fade-in-up">
          <p className="text-center text-white/90 flex items-center justify-center gap-2">
            <span className="text-blue-400">💡</span>
            <strong>Tip:</strong> Log in to take quizzes and appear on this leaderboard!
            <span className="text-blue-400">🏆</span>
          </p>
        </div>
        
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent animate-float">
          🏆 Leaderboard Champions 🏆
        </h1>
        <div className="glass-effect rounded-xl overflow-hidden border-2 border-white/20 animate-fade-in-up">
          {rows.map((r, i) => (
            <div key={i} className={`flex items-center justify-between px-6 py-4 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-all duration-300 animate-slide-in-left`} style={{animationDelay: `${i * 0.1}s`}}>
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  i === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  i === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                  i === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                  'bg-gradient-to-r from-blue-400 to-purple-500'
                }`}>
                  {i + 1}
                </span>
                <ProfileAvatar 
                  selectedAvatar={r.avatarId || 1} 
                  size="md" 
                  animated={true}
                />
                <span className="text-white font-semibold text-lg">{r.userName}</span>
              </div>
              <div className="text-sm text-white/80 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
                ⭐ {r.score}/{r.total} • ⏱️ {r.durationSec}s
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-white/60 text-xl mb-2">🎭 No champions yet!</p>
              <p className="text-white/40">Be the first to complete a quiz and claim your spot!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
