"use client"

import { useEffect } from "react"
import { FaClock } from "react-icons/fa"

const Timer = ({ timeLeft, setTimeLeft }) => {
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, setTimeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getColorClass = () => {
    if (timeLeft <= 30) return "text-red-600"
    if (timeLeft <= 60) return "text-orange-600"
    return "text-green-600"
  }

  return (
    <div className={`flex items-center space-x-2 font-mono text-xl ${getColorClass()}`}>
      <FaClock />
      <span>{formatTime(timeLeft)}</span>
    </div>
  )
}

export default Timer
