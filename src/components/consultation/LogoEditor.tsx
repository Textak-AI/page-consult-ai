import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Pipette, Undo, Check, X, ZoomIn, ZoomOut } from 'lucide-react';

interface LogoEditorProps {
  imageUrl: string;
  open: boolean;
  onClose: () => void;
  onSave: (editedImageUrl: string) => void;
}

// Helper to convert RGB to hex
const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
};

export function LogoEditor({ imageUrl, open, onClose, onSave }: LogoEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState(30);
  const [zoom, setZoom] = useState(1);
  const [isPicking, setIsPicking] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load image into canvas when opened
  useEffect(() => {
    if (!open || !imageUrl) return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalImage(img);
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Set canvas size to image size (or max 800px)
      const maxSize = 800;
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Save initial state to history
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([imageData]);
      setHistoryIndex(0);
    };
    img.src = imageUrl;
  }, [open, imageUrl]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedColor(null);
      setTolerance(30);
      setZoom(1);
      setIsPicking(false);
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, [open]);

  // Remove all pixels matching a color within tolerance
  const removeColorFromCanvas = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement,
    r: number, g: number, b: number, 
    toleranceValue: number
  ) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const pr = data[i];
      const pg = data[i + 1];
      const pb = data[i + 2];

      // Calculate color distance
      const distance = Math.sqrt(
        Math.pow(pr - r, 2) + 
        Math.pow(pg - g, 2) + 
        Math.pow(pb - b, 2)
      );

      // If within tolerance, make transparent
      const maxDistance = (toleranceValue / 100) * 441.67; // 441.67 is max possible distance
      if (distance <= maxDistance) {
        data[i + 3] = 0; // Set alpha to 0 (transparent)
      }
    }

    ctx.putImageData(imageData, 0, 0);
    
    // Save to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Handle canvas click - either pick color or remove that color
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

    // Get pixel color at click position
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const clickedHex = rgbToHex(pixel[0], pixel[1], pixel[2]);

    if (isPicking) {
      // Just picking the color to preview
      setSelectedColor(clickedHex);
      setIsPicking(false);
    } else if (selectedColor) {
      // Remove all pixels matching the selected color (within tolerance)
      removeColorFromCanvas(ctx, canvas, pixel[0], pixel[1], pixel[2], tolerance);
    } else {
      // No color selected yet - select this one
      setSelectedColor(clickedHex);
    }
  };

  // Undo last action
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  // Save the edited image
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Edit Logo - Remove Background
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 mt-4">
          {/* Canvas area */}
          <div className="flex-1 bg-checkerboard rounded-lg overflow-auto max-h-[60vh] flex items-center justify-center p-4">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="cursor-crosshair max-w-full border border-slate-600 rounded"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
                imageRendering: zoom > 1 ? 'pixelated' : 'auto'
              }}
            />
          </div>

          {/* Controls sidebar */}
          <div className="w-64 flex flex-col gap-4">
            {/* Instructions */}
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm font-medium text-white mb-2">How to use:</p>
              <ol className="text-xs text-slate-300 space-y-1 list-decimal list-inside">
                <li>Click on the background color you want to remove</li>
                <li>Adjust tolerance if needed</li>
                <li>Click again to remove more colors</li>
                <li>Use Undo if you remove too much</li>
              </ol>
            </div>

            {/* Selected color preview */}
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm font-medium text-white mb-2">Selected Color</p>
              <div className="flex items-center gap-3">
                {selectedColor ? (
                  <>
                    <div 
                      className="w-10 h-10 rounded-lg border border-slate-600"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <span className="text-sm font-mono text-slate-300">{selectedColor}</span>
                  </>
                ) : (
                  <span className="text-sm text-slate-400">Click on image to select</span>
                )}
              </div>
            </div>

            {/* Eyedropper button */}
            <Button
              variant={isPicking ? "default" : "outline"}
              onClick={() => setIsPicking(!isPicking)}
              className="gap-2"
            >
              <Pipette className="w-4 h-4" />
              {isPicking ? 'Click image to pick color' : 'Pick Different Color'}
            </Button>

            {/* Tolerance slider */}
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white">Tolerance: {tolerance}%</span>
              </div>
              <Slider
                value={[tolerance]}
                onValueChange={(v) => setTolerance(v[0])}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-slate-400 mt-2">
                Higher = removes more similar colors
              </p>
            </div>

            {/* Zoom controls */}
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm font-medium text-white mb-2">Zoom: {Math.round(zoom * 100)}%</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(1)}
                >
                  100%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(z => Math.min(4, z + 0.25))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Undo button */}
            <Button
              variant="outline"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="gap-2"
            >
              <Undo className="w-4 h-4" />
              Undo
            </Button>

            {/* Action buttons */}
            <div className="flex gap-2 mt-auto pt-4">
              <Button variant="ghost" onClick={onClose} className="flex-1 gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1 gap-2">
                <Check className="w-4 h-4" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
