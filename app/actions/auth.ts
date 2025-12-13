'use server'

import { prisma } from '@/lib/prisma'
import { createSession, deleteSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

export async function register(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: '用户名和密码不能为空' }
  }

  if (username.length < 3 || username.length > 20) {
    return { error: '用户名长度必须在3-20个字符之间' }
  }

  if (password.length < 6) {
    return { error: '密码长度至少6个字符' }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return { error: '用户名已存在' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        balance: BigInt(1000000), // 100万金币
      },
    })

    await createSession(user.id, user.username, user.isAdmin)
  } catch (error) {
    console.error('Registration error:', error)
    return { error: '注册失败，请稍后重试' }
  }

  redirect('/dashboard')
}

export async function login(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: '用户名和密码不能为空' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return { error: '用户名或密码错误' }
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return { error: '用户名或密码错误' }
    }

    await createSession(user.id, user.username, user.isAdmin)
  } catch (error) {
    console.error('Login error:', error)
    return { error: '登录失败，请稍后重试' }
  }

  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/')
}
