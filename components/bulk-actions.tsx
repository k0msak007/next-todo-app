"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Trash2, CheckCircle2, Circle, Download, Archive } from "lucide-react"
import type { Todo } from "@/lib/types"

interface BulkActionsProps {
  todos: Todo[]
  selectedTodos: string[]
  onSelectAll: (selected: boolean) => void
  onSelectTodo: (todoId: string, selected: boolean) => void
  onBulkComplete: (todoIds: string[], completed: boolean) => void
  onBulkDelete: (todoIds: string[]) => void
  onExport: (format: "json" | "csv") => void
}

export function BulkActions({
  todos,
  selectedTodos,
  onSelectAll,
  onSelectTodo,
  onBulkComplete,
  onBulkDelete,
  onExport,
}: BulkActionsProps) {
  const [isActioning, setIsActioning] = useState(false)
  
  const allSelected = todos.length > 0 && selectedTodos.length === todos.length
  const someSelected = selectedTodos.length > 0 && selectedTodos.length < todos.length
  const hasSelection = selectedTodos.length > 0
  
  const selectedCompletedCount = todos.filter(t => 
    selectedTodos.includes(t._id!) && t.completed
  ).length
  const selectedPendingCount = selectedTodos.length - selectedCompletedCount

  const handleBulkAction = async (action: () => Promise<void> | void) => {
    setIsActioning(true)
    try {
      await action()
    } finally {
      setIsActioning(false)
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-100 shadow-lg">
      {/* Select All Checkbox */}
      <div className="flex items-center gap-3">
        <Checkbox
          checked={allSelected}
          ref={(ref) => {
            if (ref) ref.indeterminate = someSelected
          }}
          onCheckedChange={(checked) => onSelectAll(!!checked)}
          data-testid="select-all-checkbox"
          className="border-2"
        />
        <span className="font-medium text-sm">
          {hasSelection ? (
            <span className="text-primary">
              {selectedTodos.length} selected
            </span>
          ) : (
            "Select all"
          )}
        </span>
      </div>

      {hasSelection && (
        <>
          {/* Bulk Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Mark as Complete/Incomplete */}
            {selectedPendingCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction(() => 
                  onBulkComplete(
                    selectedTodos.filter(id => 
                      !todos.find(t => t._id === id)?.completed
                    ), 
                    true
                  )
                )}
                disabled={isActioning}
                className="shadow-md hover:shadow-lg transition-shadow border-green-200 hover:bg-green-50"
                data-testid="bulk-complete-button"
              >
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                Complete ({selectedPendingCount})
              </Button>
            )}
            
            {selectedCompletedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction(() => 
                  onBulkComplete(
                    selectedTodos.filter(id => 
                      todos.find(t => t._id === id)?.completed
                    ), 
                    false
                  )
                )}
                disabled={isActioning}
                className="shadow-md hover:shadow-lg transition-shadow border-yellow-200 hover:bg-yellow-50"
                data-testid="bulk-incomplete-button"
              >
                <Circle className="h-4 w-4 mr-2 text-yellow-600" />
                Mark Pending ({selectedCompletedCount})
              </Button>
            )}

            {/* Export Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="shadow-md hover:shadow-lg transition-shadow border-blue-200 hover:bg-blue-50"
                  data-testid="export-dropdown"
                >
                  <Download className="h-4 w-4 mr-2 text-blue-600" />
                  Export
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="shadow-lg border-2">
                <DropdownMenuItem 
                  onClick={() => onExport("json")}
                  data-testid="export-json"
                >
                  📄 Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onExport("csv")}
                  data-testid="export-csv"
                >
                  📊 Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction(() => {
                if (confirm(`Delete ${selectedTodos.length} selected todos?`)) {
                  onBulkDelete(selectedTodos)
                }
              })}
              disabled={isActioning}
              className="shadow-md hover:shadow-lg transition-shadow border-red-200 hover:bg-red-50"
              data-testid="bulk-delete-button"
            >
              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
              Delete ({selectedTodos.length})
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
