"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import type { Todo, UpdateTodoRequest } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Calendar, Clock, Edit, Save, X, Trash2, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface TodoDetailPageProps {
  params: Promise<{ id: string }>
}

export default function TodoDetailPage({ params }: TodoDetailPageProps) {
  const [todo, setTodo] = useState<Todo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editData, setEditData] = useState<UpdateTodoRequest>({})

  const router = useRouter()
  const { toast } = useToast()
  const { id } = use(params)

  useEffect(() => {
    fetchTodo()
  }, [id])

  const fetchTodo = async () => {
    try {
      const response = await fetch(`/api/todos/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Error",
            description: "Todo not found",
            variant: "destructive",
          })
          router.push("/")
          return
        }
        throw new Error("Failed to fetch todo")
      }
      const data = await response.json()
      setTodo(data)
      setEditData({
        title: data.title,
        description: data.description,
        priority: data.priority,
        completed: data.completed,
        dueDate: data.dueDate ? format(new Date(data.dueDate), "yyyy-MM-dd") : "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch todo",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editData.title?.trim() || !editData.description?.trim()) {
      toast({
        title: "Error",
        description: "Title and description are required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      })

      if (!response.ok) throw new Error("Failed to update todo")

      const updatedTodo = await response.json()
      setTodo(updatedTodo)
      setIsEditing(false)

      toast({
        title: "Success",
        description: "Todo updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this todo?")) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete todo")

      toast({
        title: "Success",
        description: "Todo deleted successfully",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleComplete = async () => {
    if (!todo) return

    const newCompleted = !todo.completed
    setIsSaving(true)
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newCompleted }),
      })

      if (!response.ok) throw new Error("Failed to update todo")

      const updatedTodo = await response.json()
      setTodo(updatedTodo)
      setEditData((prev) => ({ ...prev, completed: newCompleted }))

      toast({
        title: "Success",
        description: `Todo marked as ${newCompleted ? "completed" : "pending"}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-warning text-black"
      case "low":
        return "bg-success text-white"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-blue-100">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg font-medium text-primary">Loading todo...</span>
        </div>
      </div>
    )
  }

  if (!todo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-gray-100">
          <div className="text-6xl mb-4">❓</div>
          <h2 className="text-3xl font-bold mb-4 text-primary">Todo not found</h2>
          <Button onClick={() => router.push("/")} size="lg" className="shadow-md">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Todos
          </Button>
        </div>
      </div>
    )
  }

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
            data-testid="back-button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Todos
          </Button>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)} data-testid="edit-button">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} data-testid="delete-button">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </Button>
          </div>
        </div>

        {/* Todo Detail Card */}
        <Card className={cn("shadow-xl border-2", isOverdue ? "border-red-200 bg-red-50/30" : "border-blue-100 bg-white/80 backdrop-blur-sm")}>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-title">Title</Label>
                      <Input
                        id="edit-title"
                        value={editData.title || ""}
                        onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
                        data-testid="edit-title-input"
                      />
                    </div>
                  </div>
                ) : (
                  <CardTitle
                    className={cn("text-2xl leading-tight", todo.completed && "line-through text-muted-foreground")}
                  >
                    {todo.title}
                  </CardTitle>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge className={cn("text-xs", getPriorityColor(todo.priority))} data-testid="todo-priority-badge">
                  {todo.priority}
                </Badge>
                {todo.completed && <CheckCircle2 className="h-5 w-5 text-success" />}
                {isOverdue && <AlertCircle className="h-5 w-5 text-destructive" />}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-8">
            {/* Completion Status */}
            <div className="flex items-center gap-3">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={handleToggleComplete}
                disabled={isSaving}
                data-testid="completion-checkbox"
              />
              <span className="text-sm font-medium">{todo.completed ? "Completed" : "Mark as completed"}</span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              {isEditing ? (
                <Textarea
                  value={editData.description || ""}
                  onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  data-testid="edit-description-input"
                />
              ) : (
                <p
                  className={cn(
                    "text-sm leading-relaxed p-3 bg-muted rounded-md",
                    todo.completed && "line-through text-muted-foreground",
                  )}
                >
                  {todo.description}
                </p>
              )}
            </div>

            {/* Priority */}
            {isEditing && (
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={editData.priority || todo.priority}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setEditData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger data-testid="edit-priority-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editData.dueDate || ""}
                  onChange={(e) => setEditData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  data-testid="edit-due-date-input"
                />
              ) : (
                <div
                  className={cn(
                    "flex items-center gap-2 text-sm p-3 bg-muted rounded-md",
                    isOverdue && "text-destructive bg-destructive/10",
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  {todo.dueDate ? format(new Date(todo.dueDate), "EEEE, MMMM d, yyyy") : "No due date set"}
                  {isOverdue && (
                    <Badge variant="destructive" className="ml-auto">
                      Overdue
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <div>
                  <p className="font-medium">Created</p>
                  <p>{format(new Date(todo.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p>{format(new Date(todo.updatedAt), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !editData.title?.trim() || !editData.description?.trim()}
                  data-testid="save-button"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setEditData({
                      title: todo.title,
                      description: todo.description,
                      priority: todo.priority,
                      completed: todo.completed,
                      dueDate: todo.dueDate ? format(new Date(todo.dueDate), "yyyy-MM-dd") : "",
                    })
                  }}
                  data-testid="cancel-button"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
