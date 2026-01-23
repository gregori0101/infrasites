import * as React from "react";
import { cn } from "@/lib/utils";
import { Camera, X, ZoomIn, Loader2, Upload, CheckCircle } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";
import { usePhotoUpload } from "@/hooks/use-photo-upload";
import { toast } from "sonner";
import { Progress } from "./progress";

interface PhotoCaptureProps {
  value: string | null;
  onChange: (value: string | null) => void;
  label: string;
  required?: boolean;
  className?: string;
  siteCode?: string;
  category?: string;
}

export function PhotoCapture({ 
  value, 
  onChange, 
  label, 
  required = false, 
  className,
  siteCode,
  category = 'photo'
}: PhotoCaptureProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const { uploadPhoto, deletePhoto, isUploading, uploadProgress } = usePhotoUpload({
    siteCode,
    category,
  });

  // Determine if value is a URL (uploaded) or base64 (local)
  const isUploaded = value?.startsWith('http') ?? false;

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Arquivo inválido", { description: "Por favor, selecione uma imagem." });
      return;
    }

    // Validate file size (max 20MB before compression)
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Imagem muito grande", { description: "O tamanho máximo é 20MB." });
      return;
    }

    setIsProcessing(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const dataURL = event.target?.result as string;
          if (!dataURL) {
            throw new Error("Falha ao ler a imagem");
          }
          
          // Upload to storage or compress for local storage
          const result = await uploadPhoto(dataURL);
          
          if (result) {
            onChange(result);
            if (result.startsWith('http')) {
              toast.success("Foto salva na nuvem!");
            } else {
              toast.success("Foto adicionada!");
            }
          } else {
            throw new Error("Falha ao processar imagem");
          }
        } catch (error) {
          console.error("Error processing image:", error);
          toast.error("Erro ao processar imagem", { 
            description: "Tente novamente ou use outra imagem." 
          });
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.onerror = () => {
        console.error("FileReader error");
        toast.error("Erro ao carregar imagem", { 
          description: "Verifique se o arquivo é válido." 
        });
        setIsProcessing(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error handling file:", error);
      toast.error("Erro ao processar arquivo");
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (value) {
      // Try to delete from storage if it's a URL
      await deletePhoto(value);
    }
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const isLoading = isProcessing || isUploading;

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
        {isUploaded && (
          <span className="ml-2 text-xs text-success flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Salvo
          </span>
        )}
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
          <div className={cn(
            "relative aspect-video rounded-lg overflow-hidden border-2 shadow-card",
            isUploaded ? "border-success" : "border-warning"
          )}>
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
          <div className={cn(
            "absolute -top-2 -right-2 rounded-full p-1",
            isUploaded ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"
          )}>
            {isUploaded ? <CheckCircle className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className={cn(
            "w-full aspect-video rounded-lg border-2 border-dashed transition-all duration-200",
            "flex flex-col items-center justify-center gap-2 text-muted-foreground",
            "hover:border-primary hover:text-primary hover:bg-primary/5",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            required && !value && "border-destructive/50"
          )}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 w-full px-4">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-medium">
                {uploadProgress > 0 ? 'Enviando...' : 'Processando...'}
              </span>
              {uploadProgress > 0 && (
                <Progress value={uploadProgress} className="w-full max-w-32 h-2" />
              )}
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Capturar Foto</span>
              <span className="text-xs">Toque para abrir a câmera</span>
            </>
          )}
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
  siteCode?: string;
  categoryPrefix?: string;
}

export function MultiPhotoCapture({ 
  photos, 
  labels, 
  onChange, 
  className,
  siteCode,
  categoryPrefix = 'multi'
}: MultiPhotoCaptureProps) {
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
            siteCode={siteCode}
            category={`${categoryPrefix}_${index}`}
          />
        ))}
      </div>
    </div>
  );
}
