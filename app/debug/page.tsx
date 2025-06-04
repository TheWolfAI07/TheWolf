"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ComprehensiveRealDebug from "./comprehensive-debug"
import FinalLaunchCheck from "./final-launch-check"

export default function DebugPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-center">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Wolf Platform Debug Center
        </h1>
      </div>

      <Tabs defaultValue="launch" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="system">System Debug</TabsTrigger>
          <TabsTrigger value="launch">Launch Check</TabsTrigger>
        </TabsList>
        <TabsContent value="system">
          <ComprehensiveRealDebug />
        </TabsContent>
        <TabsContent value="launch">
          <FinalLaunchCheck />
        </TabsContent>
      </Tabs>
    </div>
  )
}
