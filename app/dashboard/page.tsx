import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import LogoutButton from '@/components/LogoutButton'
import CheckInButton from '@/components/CheckInButton'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  })

  if (!user) {
    redirect('/login')
  }

  const projects = await prisma.project.findMany({
    where: { status: { in: ['open', 'closed'] } },
    orderBy: { createdAt: 'desc' },
    include: {
      creator: {
        select: { username: true },
      },
      options: true,
      _count: {
        select: { bets: true },
      },
    },
  })

  const userBets = await prisma.bet.findMany({
    where: { userId: user.id },
    include: {
      project: true,
      option: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">班级押分系统</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                {user.username}
                {user.isAdmin && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">管理员</span>}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">我的金币</h3>
            <p className="text-3xl font-bold text-indigo-600">
              {user.balance.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">参与项目</h3>
            <p className="text-3xl font-bold text-gray-800">
              {userBets.length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow flex flex-col justify-between">
            <h3 className="text-sm text-gray-600 mb-2">每日签到</h3>
            <CheckInButton userId={user.id} lastCheckIn={user.lastCheckIn} />
          </div>
        </div>

        {user.isAdmin && (
          <div className="mb-6">
            <Link
              href="/admin/create"
              className="inline-block py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200"
            >
              创建新项目
            </Link>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">押分项目</h2>

          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无项目</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-indigo-400 hover:shadow-md transition duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>创建者: {project.creator.username}</span>
                        <span>奖池: {project.totalPool.toLocaleString()} 金币</span>
                        <span>参与: {project._count.bets} 人次</span>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          project.status === 'open'
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'closed'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {project.status === 'open'
                          ? '进行中'
                          : project.status === 'closed'
                          ? '已截止'
                          : '已结算'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">我的押注记录</h2>

          {userBets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无押注记录</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">项目</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">选项</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">押注</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">奖励</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {userBets.map((bet) => (
                    <tr key={bet.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-800">{bet.project.title}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{bet.option.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-800 text-right">
                        {bet.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        {bet.reward ? (
                          <span className="text-green-600 font-semibold">
                            +{bet.reward.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            bet.project.status === 'open'
                              ? 'bg-green-100 text-green-800'
                              : bet.project.status === 'closed'
                              ? 'bg-yellow-100 text-yellow-800'
                              : bet.reward
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {bet.project.status === 'open'
                            ? '进行中'
                            : bet.project.status === 'closed'
                            ? '已截止'
                            : bet.reward
                            ? '中奖'
                            : '未中奖'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
