import { Button } from "@/components/ui/button";
import { ImagePicker } from "@/components/editor/ImagePicker";
import { useState } from "react";
import { ImagePlus, X, Image as ImageIcon } from "lucide-react";

interface PhotoGallerySectionProps {
  content: {
    images: string[];
    title?: string;
  };
  onUpdate: (content: any) => void;
  isEditing?: boolean;
}

export function PhotoGallerySection({ content, onUpdate, isEditing }: PhotoGallerySectionProps) {
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  const handleImageSelect = (image: any) => {
    onUpdate({
      ...content,
      images: [...(content.images || []), image.urls.regular],
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = content.images.filter((_, i) => i !== index);
    onUpdate({
      ...content,
      images: newImages,
    });
  };

  const handleTitleBlur = (e: React.FocusEvent<HTMLElement>) => {
    onUpdate({
      ...content,
      title: e.currentTarget.textContent || content.title,
    });
  };

  return (
    <section className={`py-16 px-4 bg-muted/30 ${isEditing ? "relative" : ""}`}>
      {isEditing && (
        <>
          <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none" />
          <Button
            className="absolute top-4 right-4 z-10"
            size="sm"
            onClick={() => setImagePickerOpen(true)}
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            Add Image
          </Button>
        </>
      )}
      
      <div className="container mx-auto max-w-6xl">
        {content.title && (
          <h2
            className={`text-3xl font-bold text-center mb-12 ${
              isEditing ? "outline-dashed outline-2 outline-primary/30 rounded px-2" : ""
            }`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleTitleBlur}
          >
            {content.title}
          </h2>
        )}

        {(!content.images || content.images.length === 0) ? (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No images yet</p>
            {isEditing && (
              <p className="text-sm mt-2">Click "Add Image" to showcase your work</p>
            )}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.images?.map((imageUrl, index) => (
            <div
              key={index}
              className="relative group aspect-square overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <img
                src={imageUrl}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              {isEditing && (
                <Button
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  size="icon"
                  variant="destructive"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <ImagePicker
        open={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        onSelect={handleImageSelect}
        defaultQuery="professional photography"
      />
    </section>
  );
}
