"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Search, Upload, FileText } from "lucide-react"

interface DocumentSearchProps {
  documentCount: number
  userId: string
}

export function DocumentSearch({ documentCount, userId }: DocumentSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [aiResponse, setAiResponse] = useState("")
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  const supabase = createClientComponentClient()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    setSearchResults([])
    setAiResponse("")

    try {
      // Search documents using embeddings similarity search
      const { data, error } = await supabase.rpc("search_documents", {
        query_embedding: searchQuery, // In a real app, you'd generate this embedding first
        match_threshold: 0.5,
        match_count: 10,
        user_id_input: userId,
      })

      if (error) throw error

      setSearchResults(data || [])
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      })

      // Fallback to basic text search if embeddings search fails
      try {
        const { data } = await supabase
          .from("documents")
          .select("*")
          .eq("user_id", userId)
          .textSearch("content", searchQuery, {
            type: "plain",
          })
          .limit(10)

        setSearchResults(data || [])
      } catch (fallbackError) {
        console.error("Fallback search failed:", fallbackError)
      }
    } finally {
      setSearching(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      // In a real app, you'd generate embeddings for the document content here
      // For this demo, we'll just use a placeholder embedding

      const { data, error } = await supabase
        .from("documents")
        .insert({
          user_id: userId,
          content,
          metadata: { title },
          embedding: [], // In a real app, this would be the actual embedding vector
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      })

      setUploadOpen(false)
      setTitle("")
      setContent("")

      // If the user is on the search results, refresh them
      if (searchQuery) {
        handleSearch(e)
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document)
  }

  const handleAskAI = async () => {
    if (!searchQuery.trim() || !searchResults.length) return

    setAiLoading(true)

    try {
      // Prepare context from search results
      const context = searchResults.map((doc) => doc.content).join("\n\n")

      // Call AI service using API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Based on these documents, answer this question: ${searchQuery}`,
          context,
          userId,
        }),
      })

      if (!response.ok) throw new Error("Failed to get AI response")

      const data = await response.json()
      setAiResponse(data.aiMessage.content)
    } catch (error: any) {
      toast({
        title: "AI response failed",
        description: error.message,
        variant: "destructive",
      })
      setAiResponse("Sorry, I couldn't process your request at this time.")
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Search Your Documents</h2>
          <p className="text-gray-500 mt-1">You have {documentCount} documents stored</p>
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
              <DialogDescription>Add a new document to your knowledge base.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Document Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Financial Report 2023"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Document Content</label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your document content here..."
                    rows={10}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={uploading}>
                  {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload Document
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your documents..."
          className="flex-1"
        />
        <Button type="submit" disabled={searching}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
          Search
        </Button>
      </form>

      {searchResults.length > 0 && (
        <Tabs defaultValue="results">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">Search Results ({searchResults.length})</TabsTrigger>
            <TabsTrigger value="ai">AI Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4 mt-4">
            {searchResults.map((doc) => (
              <Card key={doc.id} className="overflow-hidden">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{doc.metadata?.title || "Untitled Document"}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-gray-700 line-clamp-3">{doc.content}</p>
                </CardContent>
                <CardFooter className="bg-gray-50 p-4 border-t">
                  <Button variant="outline" onClick={() => handleViewDocument(doc)}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Document
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="ai" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>AI-Generated Summary</CardTitle>
                <CardDescription>Based on your search results</CardDescription>
              </CardHeader>
              <CardContent>
                {aiResponse ? (
                  <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">{aiResponse}</div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <p className="text-gray-500 text-center max-w-md">
                      Click the button below to generate an AI-powered summary and answer based on your search results.
                    </p>
                    <Button onClick={handleAskAI} disabled={aiLoading}>
                      {aiLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Generate AI Response
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedDocument.metadata?.title || "Untitled Document"}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">{selectedDocument.content}</div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedDocument(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {searchResults.length === 0 && searchQuery && !searching && (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed mt-6">
          <p className="text-gray-500">No documents found matching your search.</p>
        </div>
      )}

      {!searchQuery && (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed mt-6">
          <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 max-w-md mx-auto">
            Enter a search query to find information in your documents or upload new documents to expand your knowledge
            base.
          </p>
        </div>
      )}
    </div>
  )
}
