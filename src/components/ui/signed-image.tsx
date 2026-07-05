import { useEffect, useState, ImgHTMLAttributes } from "react";
import { resolveStorageUrl } from "@/lib/storageUrl";

interface SignedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string | null | undefined;
}

// Simple in-memory cache so we don't re-sign the same path on every mount.
const cache = new Map<string, string>();

export function useResolvedImageUrl(src: string | null | undefined): string | undefined {
  const [resolved, setResolved] = useState<string | undefined>(() =>
    src ? cache.get(src) ?? src : undefined
  );

  useEffect(() => {
    if (!src) {
      setResolved(undefined);
      return;
    }
    const cached = cache.get(src);
    if (cached) {
      setResolved(cached);
      return;
    }
    let cancelled = false;
    resolveStorageUrl(src).then((url) => {
      if (cancelled) return;
      const finalUrl = url ?? src;
      cache.set(src, finalUrl);
      setResolved(finalUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return resolved;
}

export function SignedImage({ src, ...rest }: SignedImageProps) {
  const resolved = useResolvedImageUrl(src);
  if (!resolved) return null;
  return <img src={resolved} {...rest} />;
}
