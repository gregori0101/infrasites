import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null, longitude: null, accuracy: null, loading: false, error: null,
  });

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocalização não suportada' }));
      toast.error('Geolocalização não suportada neste dispositivo');
      return;
    }
    setState(prev => ({ ...prev, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false, error: null,
        });
        toast.success('Localização capturada!');
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        switch (error.code) {
          case error.PERMISSION_DENIED: errorMessage = 'Permissão de localização negada'; break;
          case error.POSITION_UNAVAILABLE: errorMessage = 'Localização indisponível'; break;
          case error.TIMEOUT: errorMessage = 'Tempo esgotado ao obter localização'; break;
        }
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        toast.error(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { ...state, getCurrentPosition, hasLocation: state.latitude !== null && state.longitude !== null };
}
