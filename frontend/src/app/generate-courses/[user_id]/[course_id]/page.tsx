"use client"

import type React from "react"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import ReactFlow, {
  type Node,
  type Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
  Panel,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from "reactflow"
import "reactflow/dist/style.css"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Loader2, Target, Clock, ChevronRight, X, ArrowRight, MoveRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface CourseModule {
  week: number
  title: string
  objectives: string[]
  timeSpent: string
}

interface CourseData {
  course_id: string
  courseStructure: {
    title: string
    description: string
    modules: CourseModule[]
  }
}

// Custom edge component with decorative elements
function CustomEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: any) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const edgeType = data?.edgeType || "default"

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          {edgeType === "arrow" && (
            <div className="bg-primary/10 dark:bg-primary/20 backdrop-blur-sm p-1 rounded-full shadow-sm border border-primary/20">
              <MoveRight className="h-4 w-4 text-primary animate-pulse" />
            </div>
          )}

          {edgeType === "chevron" && (
            <div className="flex items-center justify-center gap-1">
              <ChevronRight className="h-4 w-4 text-primary animate-pulse" />
              <ChevronRight className="h-4 w-4 text-primary animate-pulse" />
            </div>
          )}

          {edgeType === "progress" && (
            <div className="bg-primary/10 dark:bg-primary/20 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-primary/20 text-xs font-medium text-primary flex items-center gap-1.5">
              <span>Progress</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

// Custom node component for course modules
function ModuleNode({ data }: { data: any }) {
  return (
    <div
      className={cn(
        "px-6 py-4 rounded-xl transition-all duration-300",
        data.selected
          ? "shadow-lg ring-2 ring-primary ring-offset-2 dark:ring-offset-background scale-105"
          : "shadow-md hover:shadow-lg",
        "bg-gradient-to-br from-card to-background dark:from-card dark:to-background/80",
        "backdrop-blur-sm text-card-foreground",
      )}
      style={{ width: 220, minHeight: 120 }}
    >
      <div className="flex items-center justify-between mb-3">
        <Badge
          variant={data.selected ? "default" : "outline"}
          className={cn(
            "text-xs font-medium px-3 py-1",
            data.selected ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          Week {data.week}
        </Badge>
        {data.selected && <div className="w-2 h-2 rounded-full bg-primary animate-pulse mr-1" />}
      </div>
      <h3 className="font-semibold text-base mb-2 line-clamp-2" title={data.title}>
        {data.title}
      </h3>
      <div className="flex items-center mt-3 text-xs text-muted-foreground">
        <Clock className="h-3 w-3 mr-1.5 opacity-70" />
        <span>{data.timeSpent}</span>
      </div>
    </div>
  )
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAccepting, setIsAccepting] = useState(false)
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null)
  const [timeValue, setTimeValue] = useState<number>(0)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  
  // Add ref for the module details card
  const moduleDetailsRef = useRef<HTMLDivElement>(null)

  const nodeTypes = useMemo(() => ({ moduleNode: ModuleNode }), [])
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), [])

  // Parse time string to hours for slider
  const parseTimeToHours = (timeString: string): number => {
    const match = timeString.match(/(\d+)/)
    return match ? Number.parseInt(match[1], 10) : 5
  }

  // Format hours to time string
  const formatHoursToTime = (hours: number): string => {
    return `${hours} hours per week`
  }

  // Handle node click
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const moduleData = courseData?.courseStructure.modules.find((m) => m.week === node.data.week)

      if (moduleData) {
        setSelectedModule(moduleData)
        setTimeValue(parseTimeToHours(moduleData.timeSpent))

        // Update nodes to highlight the selected one
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: {
              ...n.data,
              selected: n.id === node.id,
            },
          })),
        )
        
        // Add a small delay to ensure the module details are rendered before scrolling
        setTimeout(() => {
          if (moduleDetailsRef.current) {
            // Scroll to the module details card
            window.scrollTo({
              top: moduleDetailsRef.current.offsetTop - 100, // Offset for better visibility
              behavior: 'smooth'
            })
          }
        }, 100)
      }
    },
    [courseData, setNodes],
  )

  // Update time spent when slider changes
  const handleTimeChange = useCallback(
    (value: number[]) => {
      const newTime = value[0]
      setTimeValue(newTime)

      if (selectedModule) {
        const newTimeSpent = formatHoursToTime(newTime)

        // Update selected module
        setSelectedModule({
          ...selectedModule,
          timeSpent: newTimeSpent,
        })

        // Update course data
        if (courseData) {
          const updatedModules = courseData.courseStructure.modules.map((module) =>
            module.week === selectedModule.week ? { ...module, timeSpent: newTimeSpent } : module,
          )

          setCourseData({
            ...courseData,
            courseStructure: {
              ...courseData.courseStructure,
              modules: updatedModules,
            },
          })

          // Update the node in the flow diagram to reflect the new time spent
          setNodes((nds) =>
            nds.map((n) => {
              if (n.data.week === selectedModule.week) {
                return {
                  ...n,
                  data: {
                    ...n.data,
                    timeSpent: newTimeSpent,
                  },
                }
              }
              return n
            }),
          )
        }
      }
    },
    [selectedModule, courseData, setCourseData, setNodes],
  )

  // Close detail panel
  const closeDetailPanel = () => {
    setSelectedModule(null)
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          selected: false,
        },
      })),
    )
  }

  // Initialize flow diagram
  const initializeFlowDiagram = useCallback(
    (modules: CourseModule[]) => {
      if (!modules || modules.length === 0) return

      const newNodes: Node[] = []
      const newEdges: Edge[] = []

      // Calculate positions based on number of modules
      const nodeSpacing = 300
      const startX = 50
      const startY = 150
      const moduleCount = modules.length

      // Create a more interesting layout pattern
      modules.forEach((module, index) => {
        const nodeId = `module-${module.week}`

        // Create a slight arc pattern for nodes
        const progress = index / (moduleCount - 1)
        const yOffset = Math.sin(progress * Math.PI) * 80

        // Create node
        newNodes.push({
          id: nodeId,
          type: "moduleNode",
          position: {
            x: startX + index * nodeSpacing,
            y: startY - yOffset,
          },
          data: {
            week: module.week,
            title: module.title,
            timeSpent: module.timeSpent,
            selected: false,
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        })

        // Create edge to next node with different edge types for visual variety
        if (index < modules.length - 1) {
          // Alternate between different edge types for visual interest
          const edgeTypes = ["arrow", "chevron", "progress"]
          const edgeType = edgeTypes[index % edgeTypes.length]

          newEdges.push({
            id: `edge-${module.week}`,
            source: nodeId,
            target: `module-${modules[index + 1].week}`,
            type: "custom",
            animated: true,
            style: { strokeWidth: 2 },
            className: "stroke-primary/70 dark:stroke-primary/70",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: "var(--primary)",
            },
            data: {
              edgeType: edgeType,
            },
          })
        }
      })

      setNodes(newNodes)
      setEdges(newEdges)
    },
    [setNodes, setEdges],
  )

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch(`/api/generate-course/${params.user_id}/${params.course_id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch course data")
        }

        if (!data.title || !data.modules) {
          throw new Error("Invalid course data structure")
        }

        // Format the data to match the expected structure
        const formattedData = {
          course_id: data.course_id,
          courseStructure: {
            title: data.title,
            description: data.description || "No description available",
            modules: data.modules,
          },
        }

        setCourseData(formattedData)
        initializeFlowDiagram(data.modules)
      } catch (err) {
        console.error("Error in fetchCourseData:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (params.user_id && params.course_id) {
      fetchCourseData()
    }
  }, [params.course_id, params.user_id, initializeFlowDiagram])

  const handleAccept = async () => {
    if (!courseData?.courseStructure?.modules) {
      toast.error("No course modules to save")
      return
    }

    // Print the final data to the console
    console.log("Final Course Data:", {
      user_id: params.user_id,
      title: courseData.courseStructure.title,
      description: courseData.courseStructure.description,
      modules: courseData.courseStructure.modules,
    })

    setIsAccepting(true)
    try {
      // First, send the course data to the API endpoint
      const apiResponse = await fetch(`/api/generate-course/${params.user_id}/${params.course_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: params.user_id,
          title: courseData.courseStructure.title,
          description: courseData.courseStructure.description,
          modules: courseData.courseStructure.modules,
        }),
      })

      if (!apiResponse.ok) {
        const apiData = await apiResponse.json()
        throw new Error(apiData.error || "Failed to send course data to API")
      }
      
      // Navigate to dedicated progress page which will poll status and redirect when complete
      router.push(`/generate-courses/${params.user_id}/${params.course_id}/progress`)
    } catch (error) {
      console.error("Error saving course:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save course")
    } finally {
      setIsAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  if (!courseData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">No course data available</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{courseData.courseStructure.title}</h1>
        <p className="text-muted-foreground">{courseData.courseStructure.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 h-[450px] border rounded-xl shadow-sm overflow-hidden bg-gradient-to-br from-background to-muted/30">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{
              padding: 0.2,
              minZoom: 0.5,
              maxZoom: 1.5,
            }}
            zoomOnScroll={false}
            className="transition-all duration-300"
            proOptions={{ hideAttribution: true }}
          >
            <Background color="var(--muted-foreground)" gap={20} size={1} className="opacity-30" />  
            <Controls
              showInteractive={false}
              className="bg-background/80 backdrop-blur-sm border rounded-md shadow-md"
            />
            <Panel
              position="top-left"
              className="bg-background/80 backdrop-blur-sm p-2 rounded-md border shadow-sm m-4"
            >
              <div className="text-xs font-medium text-muted-foreground">Click on a module to view details</div>
            </Panel>
          </ReactFlow>
        </div>

        <AnimatePresence>
          {selectedModule && (
            <motion.div
              ref={moduleDetailsRef}
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              id="module-details"
            >
              <Card className="border rounded-lg shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Badge variant="default" className="mr-2">
                      Week {selectedModule.week}
                    </Badge>
                    {selectedModule.title}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={closeDetailPanel}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Learning Objectives
                      </h3>
                      <ul className="space-y-2">
                        {selectedModule.objectives.map((objective, idx) => (
                          <li key={idx} className="flex items-start">
                            <ChevronRight className="h-4 w-4 text-primary mt-1 mr-2 flex-shrink-0" />
                            <span className="text-muted-foreground">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Time to be Spent
                      </h3>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Current: {selectedModule.timeSpent}</span>
                          <Badge variant="outline">{timeValue} hours</Badge>
                        </div>
                        <Slider
                          defaultValue={[timeValue]}
                          max={20}
                          min={1}
                          step={1}
                          onValueChange={handleTimeChange}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="lg:col-span-3 mt-4">
          <div className="flex justify-end">
            <Button onClick={handleAccept} disabled={isAccepting} className="bg-primary hover:bg-primary/90" size="lg">
              {isAccepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Accept Course"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}