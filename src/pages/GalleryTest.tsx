import { useState } from "react";
import { PhotoGallerySection } from "@/components/sections/PhotoGallerySection";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GalleryTest() {
  const navigate = useNavigate();
  const [galleryContent, setGalleryContent] = useState({
    title: "Wedding DJ Photo Gallery",
    images: [],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Photo Gallery Test</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 p-4 bg-muted rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Testing Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Click "Add Image" button to open Unsplash search</li>
            <li>Search for images (e.g., "wedding dj", "dance floor")</li>
            <li>Select images to add them to the gallery</li>
            <li>Verify images load correctly from Unsplash</li>
            <li>Test removing images by hovering and clicking the X button</li>
          </ol>
        </div>

        <PhotoGallerySection
          content={galleryContent}
          onUpdate={setGalleryContent}
          isEditing={true}
        />

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Current State:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(galleryContent, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  );
}
