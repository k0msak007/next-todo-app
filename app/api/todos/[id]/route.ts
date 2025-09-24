import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { UpdateTodoRequest, Todo } from "@/lib/types"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = await clientPromise
    const db = client.db("for_pipeline")

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid todo ID" }, { status: 400 })
    }

    const todo = await db.collection<Todo>("todos").findOne({
      _id: new ObjectId(id),
    })

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    return NextResponse.json(todo)
  } catch (error) {
    console.error("Error fetching todo:", error)
    return NextResponse.json({ error: "Failed to fetch todo" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body: UpdateTodoRequest = await request.json()
    const client = await clientPromise
    const db = client.db("for_pipeline")

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid todo ID" }, { status: 400 })
    }

    const updateData: Partial<Todo> = {
      ...body,
      updatedAt: new Date(),
    }

    if (body.dueDate) {
      updateData.dueDate = new Date(body.dueDate)
    }

    const result = await db.collection("todos").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    const updatedTodo = await db.collection<Todo>("todos").findOne({
      _id: new ObjectId(id),
    })

    return NextResponse.json(updatedTodo)
  } catch (error) {
    console.error("Error updating todo:", error)
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = await clientPromise
    const db = client.db("for_pipeline")

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid todo ID" }, { status: 400 })
    }

    const result = await db.collection("todos").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Todo deleted successfully" })
  } catch (error) {
    console.error("Error deleting todo:", error)
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 })
  }
}
