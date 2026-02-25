import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Camera, Image, Plus } from 'lucide-react';

interface PhotoPickerProps {
  onPhotosSelected: (files: FileList | null) => void;
  multiple?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function PhotoPicker({ 
  onPhotosSelected, 
  multiple = false, 
  children,
  className 
}: PhotoPickerProps) {
  const [open, setOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    setOpen(false);
    setTimeout(() => cameraInputRef.current?.click(), 100);
  };

  const handleGalleryClick = () => {
    setOpen(false);
    setTimeout(() => galleryInputRef.current?.click(), 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPhotosSelected(e.target.files);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  return (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple={multiple}
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={handleFileChange}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {children || (
            <Button
              variant="outline"
              className={className || "aspect-square flex flex-col items-center justify-center gap-2"}
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs">Adicionar</span>
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="center">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={handleCameraClick}
            >
              <Camera className="w-5 h-5" />
              Câmera
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={handleGalleryClick}
            >
              <Image className="w-5 h-5" />
              Galeria
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
