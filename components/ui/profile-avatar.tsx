"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const cartoonAvatars = [
  { id: 1, emoji: "🦊", name: "Fox", color: "from-orange-400 to-red-500" },
  { id: 2, emoji: "🐱", name: "Cat", color: "from-pink-400 to-purple-500" },
  { id: 3, emoji: "🐻", name: "Bear", color: "from-yellow-400 to-orange-500" },
  { id: 4, emoji: "🐸", name: "Frog", color: "from-green-400 to-teal-500" },
  { id: 5, emoji: "🐺", name: "Wolf", color: "from-gray-400 to-blue-500" },
  { id: 6, emoji: "🦁", name: "Lion", color: "from-yellow-500 to-orange-600" },
  { id: 7, emoji: "🐼", name: "Panda", color: "from-gray-300 to-gray-600" },
  { id: 8, emoji: "🐨", name: "Koala", color: "from-gray-400 to-green-500" },
  { id: 9, emoji: "🦄", name: "Unicorn", color: "from-pink-500 to-purple-600" },
  { id: 10, emoji: "🐉", name: "Dragon", color: "from-red-500 to-purple-600" },
  { id: 11, emoji: "🦋", name: "Butterfly", color: "from-blue-400 to-purple-500" },
  { id: 12, emoji: "🐙", name: "Octopus", color: "from-purple-400 to-blue-500" }
]

interface ProfileAvatarProps {
  selectedAvatar?: number
  onSelect?: (avatarId: number) => void
  size?: "sm" | "md" | "lg" | "xl"
  animated?: boolean
  showSelector?: boolean
}

export function ProfileAvatar({ 
  selectedAvatar = 1, 
  onSelect, 
  size = "md", 
  animated = true,
  showSelector = false 
}: ProfileAvatarProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const avatar = cartoonAvatars.find(a => a.id === selectedAvatar) || cartoonAvatars[0]
  
  const sizeClasses = {
    sm: "w-8 h-8 text-lg",
    md: "w-12 h-12 text-2xl",
    lg: "w-16 h-16 text-3xl",
    xl: "w-20 h-20 text-4xl"
  }
  
  const AvatarDisplay = () => (
    <motion.div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center cursor-pointer border-2 border-white/30 shadow-lg`}
      whileHover={animated ? { scale: 1.1, rotate: 5 } : {}}
      whileTap={animated ? { scale: 0.95 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={animated ? {
        y: isHovered ? -2 : 0,
        boxShadow: isHovered ? "0 10px 30px rgba(0,0,0,0.3)" : "0 5px 15px rgba(0,0,0,0.2)"
      } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.span
        animate={animated ? { rotate: isHovered ? [0, -10, 10, 0] : 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        {avatar.emoji}
      </motion.span>
    </motion.div>
  )

  if (!showSelector) {
    return <AvatarDisplay />
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-white font-semibold mb-2">Choose Your Avatar</h3>
        <AvatarDisplay />
        <p className="text-white/70 text-sm mt-2">{avatar.name}</p>
      </div>
      
      <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
        {cartoonAvatars.map((av) => (
          <motion.button
            key={av.id}
            onClick={() => onSelect?.(av.id)}
            className={`w-12 h-12 rounded-full bg-gradient-to-br ${av.color} flex items-center justify-center text-xl border-2 transition-all duration-300 ${
              selectedAvatar === av.id 
                ? 'border-white scale-110 shadow-lg' 
                : 'border-white/30 hover:border-white/60'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {av.emoji}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export { cartoonAvatars }
