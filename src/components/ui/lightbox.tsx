import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LightboxImage {
  url: string;
  label: string;
}

interface LightboxProps {
  images: LightboxImage[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex, open, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentIndex(initialIndex);
    resetView();
  }, [initialIndex, open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, currentIndex]);

  const resetView = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    resetView();
  }, [images.length, resetView]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    resetView();
  }, [images.length, resetView]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [zoom, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  }, [handleZoomIn, handleZoomOut]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!open || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onClick={handleBackdropClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/50 shrink-0">
        <div className="text-white">
          <p className="font-medium">{currentImage.label}</p>
          <p className="text-sm text-white/60">
            {currentIndex + 1} de {images.length}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="text-white hover:bg-white/20 disabled:opacity-30"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <span className="text-white text-sm min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 4}
            className="text-white hover:bg-white/20 disabled:opacity-30"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRotate}
            className="text-white hover:bg-white/20"
          >
            <RotateCw className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 ml-2"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Image Container */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            className="absolute left-4 z-10 text-white hover:bg-white/20 w-12 h-12"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
        )}

        {/* Image */}
        <img
          src={currentImage.url}
          alt={currentImage.label}
          className={cn(
            "max-w-full max-h-full object-contain transition-transform select-none",
            isDragging ? "cursor-grabbing" : zoom > 1 ? "cursor-grab" : "cursor-default"
          )}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
          draggable={false}
        />

        {/* Next Button */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-4 z-10 text-white hover:bg-white/20 w-12 h-12"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="px-4 py-3 bg-black/50 shrink-0 overflow-x-auto">
          <div className="flex gap-2 justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentIndex(idx); resetView(); }}
                className={cn(
                  "w-16 h-12 rounded overflow-hidden border-2 transition-all shrink-0",
                  idx === currentIndex
                    ? "border-primary ring-2 ring-primary/50"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img
                  src={img.url}
                  alt={img.label}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
