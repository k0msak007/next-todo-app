"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Todo, CreateTodoRequest } from "@/lib/types"
import { TodoForm } from "@/components/todo-form"
import { TodoItem } from "@/components/todo-item"
import { BulkActions } from "@/components/bulk-actions"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, CheckSquare, Square, Clock, AlertTriangle, CheckCircle2, Loader2, BarChart3, Settings, TestTube } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending">("all")
  const [filterPriority, setFilterPriority] = useState<"all" | "low" | "medium" | "high">("all")
  const [filterCategory, setFilterCategory] = useState<"all" | string>("all")
  const [selectedTodos, setSelectedTodos] = useState<string[]>([])
  const [currentTab, setCurrentTab] = useState("todos")

  const router = useRouter()
  const { toast } = useToast()

  // Get unique categories from todos
  const categories = Array.from(new Set(todos.filter(t => t.category).map(t => t.category!)))

  useEffect(() => {
    fetchTodos()
  }, [])

  useEffect(() => {
    filterTodos()
  }, [todos, searchQuery, filterStatus, filterPriority, filterCategory])

  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos")
      if (!response.ok) throw new Error("Failed to fetch todos")
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch todos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterTodos = () => {
    let filtered = todos

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          todo.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((todo) => (filterStatus === "completed" ? todo.completed : !todo.completed))
    }

    // Filter by priority
    if (filterPriority !== "all") {
      filtered = filtered.filter((todo) => todo.priority === filterPriority)
    }

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter((todo) => todo.category === filterCategory)
    }

    setFilteredTodos(filtered)
  }

  const handleCreateTodo = async (todoData: CreateTodoRequest) => {
    setIsCreating(true)
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todoData),
      })

      if (!response.ok) throw new Error("Failed to create todo")

      const newTodo = await response.json()
      setTodos((prev) => [newTodo, ...prev])

      toast({
        title: "Success",
        description: "Todo created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create todo",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      })

      if (!response.ok) throw new Error("Failed to update todo")

      const updatedTodo = await response.json()
      setTodos((prev) => prev.map((todo) => (todo._id === id ? updatedTodo : todo)))

      toast({
        title: "Success",
        description: `Todo marked as ${completed ? "completed" : "pending"}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete todo")

      setTodos((prev) => prev.filter((todo) => todo._id !== id))

      toast({
        title: "Success",
        description: "Todo deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      })
    }
  }

  const handleViewTodo = (id: string) => {
    router.push(`/todos/${id}`)
  }

  const getStats = () => {
    const total = todos.length
    const completed = todos.filter((t) => t.completed).length
    const pending = total - completed
    const overdue = todos.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length

    return { total, completed, pending, overdue }
  }

  const stats = getStats()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading todos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-3">
            ✨ Todo Manager ✨
          </h1>
          <p className="text-muted-foreground text-lg">Organize your tasks efficiently and beautifully</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors shadow-lg hover:shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold text-primary">{stats.total}</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-200 hover:border-green-300 transition-colors shadow-lg hover:shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-3xl font-bold text-success">{stats.completed}</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-yellow-200 hover:border-yellow-300 transition-colors shadow-lg hover:shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-warning" />
                <span className="text-3xl font-bold text-warning">{stats.pending}</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-red-200 hover:border-red-300 transition-colors shadow-lg hover:shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="text-3xl font-bold text-destructive">{stats.overdue}</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
            </CardContent>
          </Card>
        </div>

        {/* Todo Form */}
        <TodoForm onSubmit={handleCreateTodo} isLoading={isCreating} />

        {/* Filters */}
        <Card className="mb-6 shadow-lg border-2 border-blue-100 hover:border-blue-200 transition-colors">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Filter className="h-6 w-6 text-primary" />
              🔍 Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search todos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="search-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger data-testid="status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
                  <SelectTrigger data-testid="priority-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Todo List */}
        <div className="space-y-4">
          {filteredTodos.length === 0 ? (
            <Card className="shadow-lg border-2 border-gray-100">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-3 text-primary">No todos found</h3>
                <p className="text-muted-foreground text-lg">
                  {searchQuery || filterStatus !== "all" || filterPriority !== "all"
                    ? "Try adjusting your filters or search query"
                    : "Create your first todo to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTodo}
                onView={handleViewTodo}
                isLoading={isLoading}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
