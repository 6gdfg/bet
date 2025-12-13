import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import BetForm from '@/components/BetForm'
import AdminControls from '@/components/AdminControls'

export default async function ProjectPage({ params }: { params: { id: string } }) {
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

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      creator: {
        select: { username: true },
      },
      options: {
        include: {
          _count: {
            select: { bets: true },
          },
        },
      },
      bets: {
        include: {
          user: {
            select: { username: true },
          },
          option: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!project) {
    redirect('/dashboard')
  }

  const userBets = project.bets.filter((bet) => bet.userId === user.id)
  const totalUserBet = userBets.reduce((sum, bet) => sum + bet.amount, BigInt(0))

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-xl font-bold text-gray-800">
              ← 返回首页
            </Link>
            <span className="text-gray-600">{user.username}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {project.title}
              </h1>
              {project.description && (
                <p className="text-gray-600 mb-4">{project.description}</p>
              )}
              <div className="flex gap-4 text-sm text-gray-500">
                <span>创建者: {project.creator.username}</span>
                <span>总奖池: {project.totalPool.toLocaleString()} 金币</span>
                <span>总参与: {project.bets.length} 人次</span>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
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

          {user.isAdmin && (
            <AdminControls
              projectId={project.id}
              status={project.status}
              options={project.options}
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">押注选项</h2>

              <div className="space-y-4">
                {project.options.map((option) => {
                  const percentage =
                    project.totalPool > 0
                      ? (Number(option.totalAmount) / Number(project.totalPool)) * 100
                      : 0
                  const isCorrect = project.correctOptionId === option.id

                  return (
                    <div
                      key={option.id}
                      className={`border-2 rounded-lg p-4 ${
                        isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          {option.name}
                          {isCorrect && (
                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                              正确答案
                            </span>
                          )}
                        </h3>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {option.totalAmount.toLocaleString()} 金币
                          </p>
                          <p className="text-xs text-gray-500">
                            {option._count.bets} 人次
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              isCorrect ? 'bg-green-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>

                      {project.status === 'open' && (
                        <BetForm
                          projectId={project.id}
                          optionId={option.id}
                          userBalance={Number(user.balance)}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">我的押注</h3>
              {userBets.length === 0 ? (
                <p className="text-gray-500 text-sm">暂无押注</p>
              ) : (
                <div className="space-y-2">
                  {userBets.map((bet) => (
                    <div
                      key={bet.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-600">{bet.option.name}</span>
                      <div className="text-right">
                        <p className="text-gray-800 font-semibold">
                          {bet.amount.toLocaleString()}
                        </p>
                        {bet.reward && (
                          <p className="text-green-600 text-xs">
                            +{bet.reward.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>总计</span>
                      <span>{totalUserBet.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-3">最近押注</h3>
              {project.bets.length === 0 ? (
                <p className="text-gray-500 text-sm">暂无押注</p>
              ) : (
                <div className="space-y-3">
                  {project.bets.slice(0, 10).map((bet) => (
                    <div key={bet.id} className="text-sm">
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">{bet.user.username}</span>
                        <span className="text-gray-800 font-semibold">
                          {bet.amount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{bet.option.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
