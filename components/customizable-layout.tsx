"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Move, Layout, Maximize2, Minimize2 } from "lucide-react"

interface LayoutComponent {
  id: string
  type: "widget" | "chart" | "table" | "metric"
  title: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  content: React.ReactNode
}

interface CustomizableLayoutProps {
  components?: LayoutComponent[]
  onLayoutChange?: (components: LayoutComponent[]) => void
  editable?: boolean
}

export default function CustomizableLayout({
  components = [],
  onLayoutChange,
  editable = true,
}: CustomizableLayoutProps) {
  const [layoutComponents, setLayoutComponents] = useState<LayoutComponent[]>(components)
  const [isEditMode, setIsEditMode] = useState(false)
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null)

  // Default components if none provided
  useEffect(() => {
    if (components.length === 0) {
      const defaultComponents: LayoutComponent[] = [
        {
          id: "metrics-1",
          type: "metric",
          title: "Active Projects",
          position: { x: 0, y: 0 },
          size: { width: 300, height: 150 },
          content: (
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-cyan-400">24</div>
              <div className="text-sm text-slate-400">Active Projects</div>
            </div>
          ),
        },
        {
          id: "chart-1",
          type: "chart",
          title: "Performance Overview",
          position: { x: 320, y: 0 },
          size: { width: 400, height: 300 },
          content: (
            <div className="p-4 h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded">
              <div className="text-center text-slate-400">Chart Placeholder</div>
            </div>
          ),
        },
        {
          id: "table-1",
          type: "table",
          title: "Recent Activity",
          position: { x: 0, y: 170 },
          size: { width: 720, height: 200 },
          content: (
            <div className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Project Alpha</span>
                  <Badge className="bg-emerald-500/20 text-emerald-300">Active</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Project Beta</span>
                  <Badge className="bg-yellow-500/20 text-yellow-300">Pending</Badge>
                </div>
              </div>
            </div>
          ),
        },
      ]
      setLayoutComponents(defaultComponents)
    }
  }, [components])

  const handleDragStart = (componentId: string) => {
    if (!isEditMode) return
    setDraggedComponent(componentId)
  }

  const handleDragEnd = () => {
    setDraggedComponent(null)
  }

  const handlePositionChange = (componentId: string, newPosition: { x: number; y: number }) => {
    const updatedComponents = layoutComponents.map((comp) =>
      comp.id === componentId ? { ...comp, position: newPosition } : comp,
    )
    setLayoutComponents(updatedComponents)
    onLayoutChange?.(updatedComponents)
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
  }

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Edit Mode Controls */}
      {editable && (
        <div className="absolute top-4 right-4 z-50">
          <Button
            onClick={toggleEditMode}
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            className={`${
              isEditMode
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                : "border-slate-600 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {isEditMode ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
            {isEditMode ? "Exit Edit" : "Edit Layout"}
          </Button>
        </div>
      )}

      {/* Layout Grid */}
      <div className="relative p-6">
        {layoutComponents.map((component) => (
          <Card
            key={component.id}
            className={`absolute transition-all duration-200 ${
              isEditMode
                ? "border-2 border-dashed border-cyan-400/50 hover:border-cyan-400 cursor-move"
                : "border-slate-700"
            } bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm`}
            style={{
              left: component.position.x,
              top: component.position.y,
              width: component.size.width,
              height: component.size.height,
            }}
            draggable={isEditMode}
            onDragStart={() => handleDragStart(component.id)}
            onDragEnd={handleDragEnd}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-200 flex items-center justify-between">
                {component.title}
                {isEditMode && (
                  <div className="flex items-center space-x-1">
                    <Move className="h-3 w-3 text-cyan-400" />
                    <Badge variant="outline" className="text-xs border-cyan-400/50 text-cyan-300">
                      {component.type}
                    </Badge>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">{component.content}</CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Mode Overlay */}
      {isEditMode && (
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <Card className="bg-slate-800/95 border-cyan-400/50">
              <CardContent className="p-4 text-center">
                <Layout className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-sm text-slate-300">Drag components to rearrange</p>
                <p className="text-xs text-slate-400">Layout changes are automatically saved</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

// Named export for compatibility
export { CustomizableLayout }
