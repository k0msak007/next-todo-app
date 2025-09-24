import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { CreateTodoRequest, Todo } from "@/lib/types"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("for_pipeline")
    const todos = await db.collection<Todo>("todos").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(todos)
  } catch (error) {
    console.error("Error fetching todos:", error)
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTodoRequest = await request.json()

    if (!body.title || !body.description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("for_pipeline")

    const newTodo: Omit<Todo, "_id"> = {
      title: body.title,
      description: body.description,
      completed: false,
      priority: body.priority || "medium",
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("todos").insertOne(newTodo)
    const todo = await db.collection<Todo>("todos").findOne({ _id: result.insertedId })

    return NextResponse.json(todo, { status: 201 })
  } catch (error) {
    console.error("Error creating todo:", error)
    return NextResponse.json({ error: "Failed to create todo" }, { status: 500 })
  }
}
