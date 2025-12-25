import * as React from "react";
import { cn } from "@/lib/utils";
import { Camera, X, ZoomIn, Image as ImageIcon } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";

interface PhotoCaptureProps {
  value: string | null;
  onChange: (value: string | null) => void;
  label: string;
  required?: boolean;
  className?: string;
}

export function PhotoCapture({ value, onChange, label, required = false, className }: PhotoCaptureProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="hidden"
      />

      {value ? (
        <div className="relative group animate-fade-in">
          <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-success shadow-card">
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" variant="secondary" className="h-8 w-8">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-0 overflow-hidden">
                  <img src={value} alt={label} className="w-full h-auto" />
                </DialogContent>
              </Dialog>
              <Button size="icon" variant="destructive" className="h-8 w-8" onClick={handleRemove}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="absolute -top-2 -right-2 bg-success text-success-foreground rounded-full p-1">
            <Camera className="w-3 h-3" />
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className={cn(
            "w-full aspect-video rounded-lg border-2 border-dashed transition-all duration-200",
            "flex flex-col items-center justify-center gap-2 text-muted-foreground",
            "hover:border-primary hover:text-primary hover:bg-primary/5",
            required && !value && "border-destructive/50"
          )}
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium">Capturar Foto</span>
          <span className="text-xs">Toque para abrir a câmera</span>
        </button>
      )}
    </div>
  );
}

interface MultiPhotoCaptureProps {
  photos: (string | null)[];
  labels: string[];
  onChange: (index: number, value: string | null) => void;
  className?: string;
}

export function MultiPhotoCapture({ photos, labels, onChange, className }: MultiPhotoCaptureProps) {
  const completedCount = photos.filter(Boolean).length;
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Fotos da seção</span>
        <span className={cn(
          "text-xs font-bold px-2 py-0.5 rounded-full",
          completedCount === photos.length ? "bg-success/20 text-success" : "bg-accent/20 text-accent"
        )}>
          {completedCount}/{photos.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {labels.map((label, index) => (
          <PhotoCapture
            key={label}
            label={label}
            value={photos[index]}
            onChange={(value) => onChange(index, value)}
          />
        ))}
      </div>
    </div>
  );
}
