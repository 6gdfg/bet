'use server'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function checkIn() {
  const session = await getSession()

  if (!session) {
    return { success: false, error: '未登录' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!user) {
      return { success: false, error: '用户不存在' }
    }

    const today = new Date().setHours(0, 0, 0, 0)
    const lastCheckInDate = user.lastCheckIn
      ? new Date(user.lastCheckIn).setHours(0, 0, 0, 0)
      : null

    if (lastCheckInDate === today) {
      return { success: false, error: '今日已签到' }
    }

    // 随机奖励 50000-1000000 金币
    const reward = Math.floor(Math.random() * (1000000 - 50000 + 1)) + 50000

    await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: user.balance + BigInt(reward),
        lastCheckIn: new Date(),
      },
    })

    return { success: true, reward }
  } catch (error) {
    console.error('Check-in error:', error)
    return { success: false, error: '签到失败' }
  }
}
