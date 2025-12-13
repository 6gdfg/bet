'use server'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createProject(data: {
  title: string
  description?: string
  options: string[]
}) {
  const session = await getSession()

  if (!session) {
    return { error: '未登录' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!user || !user.isAdmin) {
      return { error: '没有权限' }
    }

    if (!data.title || data.title.length < 2) {
      return { error: '标题至少2个字符' }
    }

    if (data.options.length < 2) {
      return { error: '至少需要2个选项' }
    }

    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        creatorId: user.id,
        options: {
          create: data.options.map((name) => ({
            name,
          })),
        },
      },
    })

    revalidatePath('/dashboard')
    return { success: true, projectId: project.id }
  } catch (error) {
    console.error('Create project error:', error)
    return { error: '创建失败' }
  }
}

export async function placeBet(data: {
  projectId: string
  optionId: string
  amount: number
}) {
  const session = await getSession()

  if (!session) {
    return { error: '未登录' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!user) {
      return { error: '用户不存在' }
    }

    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: { options: true },
    })

    if (!project) {
      return { error: '项目不存在' }
    }

    if (project.status !== 'open') {
      return { error: '项目已关闭' }
    }

    const option = project.options.find((opt) => opt.id === data.optionId)

    if (!option) {
      return { error: '选项不存在' }
    }

    if (data.amount < 1000) {
      return { error: '最少押注1000金币' }
    }

    if (user.balance < BigInt(data.amount)) {
      return { error: '金币不足' }
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { balance: user.balance - BigInt(data.amount) },
      }),
      prisma.bet.create({
        data: {
          userId: user.id,
          projectId: project.id,
          optionId: option.id,
          amount: BigInt(data.amount),
        },
      }),
      prisma.option.update({
        where: { id: option.id },
        data: { totalAmount: option.totalAmount + BigInt(data.amount) },
      }),
      prisma.project.update({
        where: { id: project.id },
        data: { totalPool: project.totalPool + BigInt(data.amount) },
      }),
    ])

    revalidatePath(`/project/${project.id}`)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Place bet error:', error)
    return { error: '押注失败' }
  }
}

export async function closeProject(projectId: string) {
  const session = await getSession()

  if (!session) {
    return { error: '未登录' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!user || !user.isAdmin) {
      return { error: '没有权限' }
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return { error: '项目不存在' }
    }

    if (project.status !== 'open') {
      return { error: '项目已关闭' }
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'closed' },
    })

    revalidatePath(`/project/${projectId}`)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Close project error:', error)
    return { error: '关闭失败' }
  }
}

export async function settleProject(projectId: string, correctOptionId: string) {
  const session = await getSession()

  if (!session) {
    return { error: '未登录' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!user || !user.isAdmin) {
      return { error: '没有权限' }
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        options: true,
        bets: true,
      },
    })

    if (!project) {
      return { error: '项目不存在' }
    }

    if (project.status === 'settled') {
      return { error: '项目已结算' }
    }

    const correctOption = project.options.find((opt) => opt.id === correctOptionId)

    if (!correctOption) {
      return { error: '选项不存在' }
    }

    // 获取押中正确答案的所有押注
    const winningBets = project.bets.filter((bet) => bet.optionId === correctOptionId)

    if (winningBets.length === 0) {
      // 没有人押中，奖池清空
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: 'settled',
          correctOptionId,
        },
      })

      revalidatePath(`/project/${projectId}`)
      revalidatePath('/dashboard')
      return { success: true, message: '无人中奖' }
    }

    // 计算每个押注的奖励（按比例分配）
    const totalWinningAmount = correctOption.totalAmount
    const totalPool = project.totalPool

    // 使用事务处理所有更新
    await prisma.$transaction(async (tx) => {
      for (const bet of winningBets) {
        // 计算该押注的占比
        const ratio = Number(bet.amount) / Number(totalWinningAmount)
        const reward = BigInt(Math.floor(Number(totalPool) * ratio))

        // 更新押注记录
        await tx.bet.update({
          where: { id: bet.id },
          data: { reward },
        })

        // 给用户发放奖励
        await tx.user.update({
          where: { id: bet.userId },
          data: {
            balance: {
              increment: reward,
            },
          },
        })
      }

      // 更新项目状态
      await tx.project.update({
        where: { id: projectId },
        data: {
          status: 'settled',
          correctOptionId,
        },
      })
    })

    revalidatePath(`/project/${projectId}`)
    revalidatePath('/dashboard')
    return { success: true, message: '结算成功' }
  } catch (error) {
    console.error('Settle project error:', error)
    return { error: '结算失败' }
  }
}
