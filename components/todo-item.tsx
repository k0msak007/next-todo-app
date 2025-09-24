"use client"

import { useState } from "react"
import type { Todo } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Trash2, Eye, AlertCircle, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TodoItemProps {
  todo: Todo
  onToggleComplete: (id: string, completed: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onView: (id: string) => void
  isLoading?: boolean
}

export function TodoItem({ todo, onToggleComplete, onDelete, onView, isLoading }: TodoItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleComplete = async () => {
    setIsUpdating(true)
    try {
      await onToggleComplete(todo._id!, !todo.completed)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(todo._id!)
    } finally {
      setIsDeleting(false)
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

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        todo.completed && "opacity-75",
        isOverdue && "border-destructive/50",
      )}
      data-testid="todo-item"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={handleToggleComplete}
            disabled={isUpdating || isLoading}
            className="mt-1"
            data-testid="todo-checkbox"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3
                className={cn(
                  "font-medium text-sm leading-tight",
                  todo.completed && "line-through text-muted-foreground",
                )}
                data-testid="todo-title"
              >
                {todo.title}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Badge
                  variant="secondary"
                  className={cn("text-xs", getPriorityColor(todo.priority))}
                  data-testid="todo-priority"
                >
                  {todo.priority}
                </Badge>
                {todo.completed && <CheckCircle2 className="h-4 w-4 text-success" />}
                {isOverdue && <AlertCircle className="h-4 w-4 text-destructive" />}
              </div>
            </div>

            <p
              className={cn("text-sm text-muted-foreground mb-3 line-clamp-2", todo.completed && "line-through")}
              data-testid="todo-description"
            >
              {todo.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(todo.createdAt), "MMM d, yyyy")}
                </div>
                {todo.dueDate && (
                  <div className={cn("flex items-center gap-1", isOverdue && "text-destructive")}>
                    <Calendar className="h-3 w-3" />
                    Due: {format(new Date(todo.dueDate), "MMM d, yyyy")}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(todo._id!)}
                  className="h-8 w-8 p-0"
                  data-testid="todo-view-button"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting || isLoading}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  data-testid="todo-delete-button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
