import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="min-h-screen enhanced-gradient-bg flex items-center justify-center">
      <main className="w-full max-w-md px-4">
        <div className="glass-effect-enhanced rounded-xl p-8 animate-fade-in-up">
          <h1 className="heading-secondary text-center mb-8 text-bold-gradient">
            ✨ Join the Fun!
          </h1>
          <SignupForm />
        </div>
      </main>
    </div>
  )
}
