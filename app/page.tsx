import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Link from 'next/link'

export default async function Home() {
  const session = await getSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Who is the champion?
        </h1>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-center transition duration-200"
          >
            登录
          </Link>

          <Link
            href="/register"
            className="block w-full py-3 px-4 bg-white hover:bg-gray-50 text-indigo-600 font-semibold rounded-lg text-center border-2 border-indigo-600 transition duration-200"
          >
            注册新账号
          </Link>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>仅供娱乐 新用户注册即送100万金币</p>
        </div>
      </div>
    </div>
  )
}
