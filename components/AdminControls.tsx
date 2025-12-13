'use client'

import { useState } from 'react'
import { closeProject, settleProject } from '@/app/actions/project'

interface AdminControlsProps {
  projectId: string
  status: string
  options: { id: string; name: string }[]
}

export default function AdminControls({ projectId, status, options }: AdminControlsProps) {
  const [selectedOption, setSelectedOption] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleClose() {
    if (!confirm('确定要截止押注吗？截止后玩家将无法继续押注。')) {
      return
    }

    setIsSubmitting(true)
    setError('')

    const result = await closeProject(projectId)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      window.location.reload()
    }
  }

  async function handleSettle() {
    if (!selectedOption) {
      setError('请选择正确答案')
      return
    }

    if (!confirm('确定要结算吗？结算后将按比例分配奖池给押中的玩家。')) {
      return
    }

    setIsSubmitting(true)
    setError('')

    const result = await settleProject(projectId, selectedOption)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      window.location.reload()
    }
  }

  if (status === 'settled') {
    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-700 font-semibold">项目已结算</p>
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-semibold text-gray-800 mb-3">管理员操作</h3>

      {status === 'open' && (
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition duration-200 text-sm"
        >
          {isSubmitting ? '处理中...' : '截止押注'}
        </button>
      )}

      {status === 'closed' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择正确答案
            </label>
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            >
              <option value="">请选择...</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSettle}
            disabled={isSubmitting || !selectedOption}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition duration-200 text-sm"
          >
            {isSubmitting ? '结算中...' : '确认结算'}
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}
