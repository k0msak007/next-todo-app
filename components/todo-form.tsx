"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/multi-select"
import type { CreateTodoRequest } from "@/lib/types"
import { Plus, Loader2, Tag, Folder } from "lucide-react"

interface TodoFormProps {
  onSubmit: (todo: CreateTodoRequest) => Promise<void>
  isLoading?: boolean
}

export function TodoForm({ onSubmit, isLoading }: TodoFormProps) {
  const [formData, setFormData] = useState<CreateTodoRequest>({
    title: "",
    description: "",
    priority: "medium",
    category: undefined,
    tags: [],
    dueDate: "",
  })

  // Predefined categories and tags for better UX
  const categoryOptions = [
    { label: "💼 Work", value: "work" },
    { label: "🏠 Personal", value: "personal" },
    { label: "🛒 Shopping", value: "shopping" },
    { label: "💪 Health", value: "health" },
    { label: "📚 Learning", value: "learning" },
    { label: "🎯 Goals", value: "goals" },
  ]

  const tagOptions = [
    { label: "urgent", value: "urgent" },
    { label: "important", value: "important" },
    { label: "meeting", value: "meeting" },
    { label: "project", value: "project" },
    { label: "review", value: "review" },
    { label: "research", value: "research" },
    { label: "creative", value: "creative" },
    { label: "planning", value: "planning" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.description.trim()) return

    await onSubmit(formData)
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      category: undefined,
      tags: [],
      dueDate: "",
    })
  }

  return (
    <Card className="mb-6 shadow-xl border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50/30" data-testid="todo-form">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg border-b-2 border-blue-100">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Plus className="h-6 w-6 text-primary" />
          ✨ Add New Todo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold">Title</Label>
              <Input
                id="title"
                data-testid="todo-title-input"
                placeholder="Enter todo title..."
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="border-2 focus:border-primary shadow-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="font-semibold">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger data-testid="todo-priority-select" className="border-2 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-2 shadow-lg">
                  <SelectItem value="low">🟢 Low Priority</SelectItem>
                  <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                  <SelectItem value="high">🔴 High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category" className="font-semibold flex items-center gap-1">
                <Folder className="h-4 w-4" />
                Category
              </Label>
              <Select
                value={formData.category || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value === "none" ? undefined : value }))
                }
              >
                <SelectTrigger data-testid="todo-category-select" className="border-2 shadow-sm">
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent className="border-2 shadow-lg">
                  <SelectItem value="none">🚫 No Category</SelectItem>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold flex items-center gap-1">
                <Tag className="h-4 w-4" />
                Tags
              </Label>
              <MultiSelect
                options={tagOptions}
                selected={formData.tags || []}
                onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
                placeholder="Select tags..."
                data-testid="todo-tags-select"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold">Description</Label>
            <Textarea
              id="description"
              data-testid="todo-description-input"
              placeholder="Enter todo description..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="border-2 focus:border-primary shadow-sm resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="font-semibold">📅 Due Date (Optional)</Label>
            <Input
              id="dueDate"
              data-testid="todo-due-date-input"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
              className="border-2 focus:border-primary shadow-sm"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
            disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
            data-testid="todo-submit-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Amazing Todo...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-5 w-5" />
                ✨ Create Todo
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
