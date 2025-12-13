'use client'

import { useState } from 'react'
import { checkIn } from '@/app/actions/checkin'

interface CheckInButtonProps {
  userId: string
  lastCheckIn: Date | null
}

export default function CheckInButton({ userId, lastCheckIn }: CheckInButtonProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(() => {
    if (!lastCheckIn) return false
    const today = new Date().setHours(0, 0, 0, 0)
    const lastCheckInDate = new Date(lastCheckIn).setHours(0, 0, 0, 0)
    return today === lastCheckInDate
  })
  const [reward, setReward] = useState<number | null>(null)

  async function handleCheckIn() {
    const result = await checkIn()
    if (result.success) {
      setIsCheckedIn(true)
      setReward(result.reward!)
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }
  }

  if (isCheckedIn) {
    return (
      <div className="text-center">
        {reward ? (
          <p className="text-green-600 font-semibold">
            签到成功！获得 {reward.toLocaleString()} 金币
          </p>
        ) : (
          <p className="text-gray-500">今日已签到</p>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={handleCheckIn}
      className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200"
    >
      立即签到
    </button>
  )
}
