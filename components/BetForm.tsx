'use client'

import { useState } from 'react'
import { placeBet } from '@/app/actions/project'

interface BetFormProps {
  projectId: string
  optionId: string
  userBalance: number
}

export default function BetForm({ projectId, optionId, userBalance }: BetFormProps) {
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const betAmount = parseInt(amount)

    if (isNaN(betAmount) || betAmount < 1000) {
      setError('最少押注1000金币')
      setIsSubmitting(false)
      return
    }

    if (betAmount > userBalance) {
      setError('金币不足')
      setIsSubmitting(false)
      return
    }

    const result = await placeBet({
      projectId,
      optionId,
      amount: betAmount,
    })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      setAmount('')
      window.location.reload()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="押注金额（最少1000）"
        min="1000"
        step="1000"
        disabled={isSubmitting}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm disabled:bg-gray-100"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition duration-200 text-sm"
      >
        {isSubmitting ? '押注中...' : '押注'}
      </button>
      {error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </form>
  )
}
