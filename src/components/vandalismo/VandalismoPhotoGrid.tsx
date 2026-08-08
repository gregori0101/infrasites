import { useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignedImage } from '@/components/ui/signed-image';
import { usePhotoUpload } from '@/hooks/use-photo-upload';
import { Lightbox } from '@/components/ui/lightbox';
import { toast } from 'sonner';

interface VandalismoPhotoGridProps {
  value: string[];
  onChange: (fotos: string[]) => void;
  category: string;
  siteCode?: string;
  max: number;
  disabled?: boolean;
}

export function VandalismoPhotoGrid({
  value,
  onChange,
  category,
  siteCode,
  max,
  disabled,
}: VandalismoPhotoGridProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { uploadPhotoFile, isUploading } = usePhotoUpload({ siteCode, category });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const slots = max - value.length;
    if (slots <= 0) {
      toast.error(`Limite de ${max} fotos atingido`);
      return;
    }
    const selected = Array.from(files).slice(0, slots);
    if (files.length > slots) {
      toast.warning(`Apenas ${slots} foto(s) adicionada(s) — limite de ${max}.`);
    }

    const uploaded: string[] = [];
    for (const file of selected) {
      const url = await uploadPhotoFile(file);
      if (url) uploaded.push(url);
    }
    if (uploaded.length > 0) onChange([...value, ...uploaded]);
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const full = value.length >= max;

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {value.map((url, index) => (
            <div key={`${url}-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
              <button type="button" className="w-full h-full" onClick={() => setPreview(url)}>
                <SignedImage src={url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
              </button>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label="Remover foto"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!disabled && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={full || isUploading} onClick={() => cameraRef.current?.click()}>
            {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
            Câmera
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={full || isUploading} onClick={() => galleryRef.current?.click()}>
            <ImagePlus className="h-4 w-4 mr-2" />
            Galeria
          </Button>
          <span className="text-xs text-muted-foreground self-center">
            {value.length}/{max}
          </span>
        </div>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {preview !== null && (
        <Lightbox
          images={value.map((url, i) => ({ url, label: `Foto ${i + 1}` }))}
          initialIndex={Math.max(0, value.indexOf(preview))}
          open={preview !== null}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
