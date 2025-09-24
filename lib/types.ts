export interface Todo {
  _id?: string
  title: string
  description: string
  completed: boolean
  priority: "low" | "medium" | "high"
  category?: string
  tags?: string[]
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateTodoRequest {
  title: string
  description: string
  priority: "low" | "medium" | "high"
  category?: string
  tags?: string[]
  dueDate?: string
}

export interface UpdateTodoRequest {
  title?: string
  description?: string
  completed?: boolean
  priority?: "low" | "medium" | "high"
  category?: string
  tags?: string[]
  dueDate?: string
}
