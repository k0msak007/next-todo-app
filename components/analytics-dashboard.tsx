"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Award, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3
} from "lucide-react"
import type { Todo } from "@/lib/types"
import { format, isToday, isThisWeek, isThisMonth, startOfWeek, endOfWeek } from "date-fns"

interface AnalyticsDashboardProps {
  todos: Todo[]
}

export function AnalyticsDashboard({ todos }: AnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    const now = new Date()
    const today = isToday
    const thisWeek = isThisWeek
    const thisMonth = isThisMonth

    // Basic stats
    const total = todos.length
    const completed = todos.filter(t => t.completed).length
    const pending = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    // Priority distribution
    const highPriority = todos.filter(t => t.priority === "high").length
    const mediumPriority = todos.filter(t => t.priority === "medium").length
    const lowPriority = todos.filter(t => t.priority === "low").length

    // Time-based stats
    const todayTodos = todos.filter(t => today(new Date(t.createdAt))).length
    const thisWeekTodos = todos.filter(t => thisWeek(new Date(t.createdAt))).length
    const thisMonthTodos = todos.filter(t => thisMonth(new Date(t.createdAt))).length

    const todayCompleted = todos.filter(t => 
      t.completed && t.updatedAt && today(new Date(t.updatedAt))
    ).length

    // Overdue todos
    const overdue = todos.filter(t => 
      t.dueDate && new Date(t.dueDate) < now && !t.completed
    ).length

    // Productivity score (based on completion rate and recency)
    const recentCompletions = todos.filter(t => 
      t.completed && t.updatedAt && thisWeek(new Date(t.updatedAt))
    ).length
    const productivityScore = Math.min(100, Math.round(
      (completionRate * 0.7) + (recentCompletions * 5)
    ))

    // Category distribution (if categories exist)
    const categories = todos.reduce((acc, todo) => {
      if (todo.category) {
        acc[todo.category] = (acc[todo.category] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      completed,
      pending,
      completionRate,
      highPriority,
      mediumPriority,
      lowPriority,
      todayTodos,
      thisWeekTodos,
      thisMonthTodos,
      todayCompleted,
      overdue,
      productivityScore,
      categories
    }
  }, [todos])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-blue-600"
    if (score >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return "🚀"
    if (score >= 60) return "⭐"
    if (score >= 40) return "👍"
    return "💪"
  }

  return (
    <div className="space-y-6" data-testid="analytics-dashboard">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Productivity Score</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-3xl font-bold ${getScoreColor(analytics.productivityScore)}`}>
                    {analytics.productivityScore}
                  </p>
                  <span className="text-2xl">{getScoreEmoji(analytics.productivityScore)}</span>
                </div>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
            <Progress 
              value={analytics.productivityScore} 
              className="mt-3"
              data-testid="productivity-score-progress"
            />
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold text-green-600">{analytics.completionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.completed}/{analytics.total} tasks
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Progress</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.todayCompleted}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  completed today
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 shadow-lg hover:shadow-xl transition-shadow ${
          analytics.overdue > 0 
            ? "border-red-200 bg-gradient-to-br from-red-50 to-orange-50" 
            : "border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50"
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue Tasks</p>
                <p className={`text-3xl font-bold ${analytics.overdue > 0 ? "text-red-600" : "text-gray-600"}`}>
                  {analytics.overdue}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  need attention
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${analytics.overdue > 0 ? "text-red-600" : "text-gray-600"}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card className="shadow-lg border-2 border-indigo-100">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              📊 Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-700 border-red-200">High Priority</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{analytics.highPriority}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${analytics.total > 0 ? (analytics.highPriority / analytics.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Medium Priority</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{analytics.mediumPriority}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${analytics.total > 0 ? (analytics.mediumPriority / analytics.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 border-green-200">Low Priority</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{analytics.lowPriority}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${analytics.total > 0 ? (analytics.lowPriority / analytics.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time-based Stats */}
        <Card className="shadow-lg border-2 border-teal-100">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-teal-600" />
              📅 Time Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{analytics.todayTodos}</div>
                <div className="text-sm text-muted-foreground">Created Today</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{analytics.thisWeekTodos}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{analytics.thisMonthTodos}</div>
                <div className="text-sm text-muted-foreground">This Month</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{analytics.todayCompleted}</div>
                <div className="text-sm text-muted-foreground">Done Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories (if available) */}
      {Object.keys(analytics.categories).length > 0 && (
        <Card className="shadow-lg border-2 border-pink-100">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg">
              🏷️ Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {Object.entries(analytics.categories).map(([category, count]) => (
                <Badge key={category} variant="outline" className="px-3 py-1 border-2">
                  {category} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
