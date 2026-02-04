import * as React from "react";
import { cn } from "@/lib/utils";
import { Plus, X, Camera, ZoomIn, Loader2, CheckCircle } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";
import { usePhotoUpload } from "@/hooks/use-photo-upload";
import { toast } from "sonner";
import { Progress } from "./progress";
import { ScrollArea, ScrollBar } from "./scroll-area";

interface PhotoCaptureWithExtrasProps {
  /** Main photo value */
  value: string | null;
  /** Handler for main photo changes */
  onChange: (value: string | null) => void;
  /** Extra photos array */
  extraPhotos?: string[];
  /** Handler for extra photos changes */
  onExtraPhotosChange?: (photos: string[]) => void;
  /** Label for the field */
  label: string;
  /** Whether the main photo is required */
  required?: boolean;
  className?: string;
  siteCode?: string;
  category?: string;
}

export function PhotoCaptureWithExtras({
  value,
  onChange,
  extraPhotos = [],
  onExtraPhotosChange,
  label,
  required = false,
  className,
  siteCode,
  category = 'photo'
}: PhotoCaptureWithExtrasProps) {
  const mainInputRef = React.useRef<HTMLInputElement>(null);
  const extraInputRef = React.useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingExtra, setProcessingExtra] = React.useState(false);

  const { uploadPhoto, deletePhoto, isUploading, uploadProgress } = usePhotoUpload({
    siteCode,
    category,
  });

  const isUploaded = value?.startsWith('http') ?? false;
  const hasMainPhoto = !!value;

  const handleMainCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Arquivo inválido", { description: "Por favor, selecione uma imagem." });
      return;
    }

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
          if (!dataURL) throw new Error("Falha ao ler a imagem");
          
          const result = await uploadPhoto(dataURL);
          
          if (result) {
            onChange(result);
            toast.success(result.startsWith('http') ? "Foto salva na nuvem!" : "Foto adicionada!");
          } else {
            throw new Error("Falha ao processar imagem");
          }
        } catch (error) {
          console.error("Error processing image:", error);
          toast.error("Erro ao processar imagem");
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.onerror = () => {
        toast.error("Erro ao carregar imagem");
        setIsProcessing(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error handling file:", error);
      toast.error("Erro ao processar arquivo");
      setIsProcessing(false);
    }
  };

  const handleExtraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onExtraPhotosChange) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Arquivo inválido", { description: "Por favor, selecione uma imagem." });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Imagem muito grande", { description: "O tamanho máximo é 20MB." });
      return;
    }

    setProcessingExtra(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const dataURL = event.target?.result as string;
          if (!dataURL) throw new Error("Falha ao ler a imagem");
          
          const result = await uploadPhoto(dataURL);
          
          if (result) {
            onExtraPhotosChange([...extraPhotos, result]);
            toast.success("Foto extra adicionada!");
          } else {
            throw new Error("Falha ao processar imagem");
          }
        } catch (error) {
          console.error("Error processing extra image:", error);
          toast.error("Erro ao processar imagem extra");
        } finally {
          setProcessingExtra(false);
          if (extraInputRef.current) extraInputRef.current.value = '';
        }
      };
      
      reader.onerror = () => {
        toast.error("Erro ao carregar imagem");
        setProcessingExtra(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error handling file:", error);
      toast.error("Erro ao processar arquivo");
      setProcessingExtra(false);
    }
  };

  const handleRemoveMain = async () => {
    if (value) await deletePhoto(value);
    onChange(null);
    if (mainInputRef.current) mainInputRef.current.value = '';
  };

  const handleRemoveExtra = async (index: number) => {
    if (!onExtraPhotosChange) return;
    const photoToRemove = extraPhotos[index];
    if (photoToRemove) await deletePhoto(photoToRemove);
    const newExtras = extraPhotos.filter((_, i) => i !== index);
    onExtraPhotosChange(newExtras);
  };

  const isLoading = isProcessing || isUploading;
  const totalPhotos = (hasMainPhoto ? 1 : 0) + extraPhotos.length;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
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
        {totalPhotos > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {totalPhotos} foto{totalPhotos > 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <input
        ref={mainInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleMainCapture}
        className="hidden"
      />
      <input
        ref={extraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleExtraCapture}
        className="hidden"
      />

      {value ? (
        <div className="space-y-2">
          {/* Main photo */}
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
                    <Button type="button" size="icon" variant="secondary" className="h-8 w-8">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 overflow-hidden">
                    <img src={value} alt={label} className="w-full h-auto" />
                  </DialogContent>
                </Dialog>
                <Button type="button" size="icon" variant="destructive" className="h-8 w-8" onClick={handleRemoveMain}>
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

          {/* Extra photos horizontal scroll */}
          {extraPhotos.length > 0 && (
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pb-2">
                {extraPhotos.map((photo, index) => (
                  <div key={index} className="relative group flex-shrink-0 w-24 h-24">
                    <div className={cn(
                      "w-full h-full rounded-lg overflow-hidden border-2",
                      photo.startsWith('http') ? "border-success" : "border-warning"
                    )}>
                      <img
                        src={photo}
                        alt={`${label} extra ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-200 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 rounded-lg">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button type="button" size="icon" variant="secondary" className="h-6 w-6">
                            <ZoomIn className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl p-0 overflow-hidden">
                          <img src={photo} alt={`${label} extra ${index + 1}`} className="w-full h-auto" />
                        </DialogContent>
                      </Dialog>
                      <Button 
                        type="button"
                        size="icon" 
                        variant="destructive" 
                        className="h-6 w-6" 
                        onClick={() => handleRemoveExtra(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="absolute -top-1 -left-1 bg-muted text-muted-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {index + 2}
                    </span>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}

          {/* Add more button */}
          {onExtraPhotosChange && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => extraInputRef.current?.click()}
              disabled={processingExtra}
              className="w-full border-dashed"
            >
              {processingExtra ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar foto extra
                </>
              )}
            </Button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => mainInputRef.current?.click()}
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
