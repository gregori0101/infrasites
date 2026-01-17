import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ChecklistData, INITIAL_CHECKLIST, INITIAL_GABINETE, GabineteData } from '@/types/checklist';
import { v4 as uuidv4 } from 'uuid';

interface ChecklistContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  currentGabinete: number;
  setCurrentGabinete: (index: number) => void;
  data: ChecklistData;
  updateData: <K extends keyof ChecklistData>(key: K, value: ChecklistData[K]) => void;
  updateGabinete: (index: number, gabinete: Partial<GabineteData>) => void;
  addGabinete: () => void;
  removeGabinete: (index: number) => void;
  resetChecklist: () => void;
  saveToLocal: () => void;
  loadFromLocal: (id: string) => boolean;
  getAllLocal: () => ChecklistData[];
  deleteLocal: (id: string) => void;
  calculateProgress: () => number;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined);

const STORAGE_KEY = 'telecom_checklists';
const CURRENT_SESSION_KEY = 'telecom_current_session';

export function ChecklistProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(`${CURRENT_SESSION_KEY}_step`);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [currentGabinete, setCurrentGabinete] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(`${CURRENT_SESSION_KEY}_gabinete`);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [data, setData] = useState<ChecklistData>(() => {
    // Try to load current session from localStorage
    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem(CURRENT_SESSION_KEY);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          // Validate that it has required fields
          if (parsed.id && parsed.gabinetes) {
            console.log('Restored session from localStorage');
            return parsed;
          }
        } catch (e) {
          console.warn('Failed to parse saved session:', e);
        }
      }
    }
    
    // Create new checklist if no saved session
    const now = new Date().toISOString();
    return {
      ...INITIAL_CHECKLIST,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
  });

  // Auto-save data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(data));
    }
  }, [data]);

  // Save current step and gabinete to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`${CURRENT_SESSION_KEY}_step`, currentStep.toString());
    }
  }, [currentStep]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`${CURRENT_SESSION_KEY}_gabinete`, currentGabinete.toString());
    }
  }, [currentGabinete]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const updateData = useCallback(<K extends keyof ChecklistData>(key: K, value: ChecklistData[K]) => {
    setData(prev => {
      let newData = {
        ...prev,
        [key]: value,
        updatedAt: new Date().toISOString(),
      };
      
      // Sync gabinetes array when qtdGabinetes changes
      if (key === 'qtdGabinetes' && typeof value === 'number') {
        const targetCount = value as number;
        const currentCount = prev.gabinetes.length;
        
        if (targetCount > currentCount) {
          // Add new gabinetes
          const newGabinetes = [...prev.gabinetes];
          for (let i = currentCount; i < targetCount; i++) {
            newGabinetes.push({ ...INITIAL_GABINETE });
          }
          newData.gabinetes = newGabinetes;
        } else if (targetCount < currentCount) {
          // Remove excess gabinetes
          newData.gabinetes = prev.gabinetes.slice(0, targetCount);
          // Reset currentGabinete if it's out of bounds
          if (currentGabinete >= targetCount) {
            setCurrentGabinete(Math.max(0, targetCount - 1));
          }
        }
      }
      
      return newData;
    });
  }, [currentGabinete]);

  const updateGabinete = useCallback((index: number, gabinete: Partial<GabineteData>) => {
    setData(prev => {
      const newGabinetes = [...prev.gabinetes];
      newGabinetes[index] = { ...newGabinetes[index], ...gabinete };
      return {
        ...prev,
        gabinetes: newGabinetes,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const addGabinete = useCallback(() => {
    setData(prev => ({
      ...prev,
      gabinetes: [...prev.gabinetes, { ...INITIAL_GABINETE }],
      qtdGabinetes: prev.qtdGabinetes + 1,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const removeGabinete = useCallback((index: number) => {
    setData(prev => {
      const newGabinetes = prev.gabinetes.filter((_, i) => i !== index);
      return {
        ...prev,
        gabinetes: newGabinetes.length > 0 ? newGabinetes : [{ ...INITIAL_GABINETE }],
        qtdGabinetes: Math.max(1, prev.qtdGabinetes - 1),
        updatedAt: new Date().toISOString(),
      };
    });
    if (currentGabinete >= data.gabinetes.length - 1) {
      setCurrentGabinete(Math.max(0, currentGabinete - 1));
    }
  }, [currentGabinete, data.gabinetes.length]);

  const resetChecklist = useCallback(() => {
    const now = new Date().toISOString();
    const newData = {
      ...INITIAL_CHECKLIST,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    setData(newData);
    setCurrentStep(0);
    setCurrentGabinete(0);
    
    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`${CURRENT_SESSION_KEY}_step`);
      sessionStorage.removeItem(`${CURRENT_SESSION_KEY}_gabinete`);
      // Update localStorage with new empty session
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(newData));
    }
  }, []);

  const saveToLocal = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const checklists: ChecklistData[] = stored ? JSON.parse(stored) : [];
    const index = checklists.findIndex(c => c.id === data.id);
    
    if (index >= 0) {
      checklists[index] = data;
    } else {
      checklists.push(data);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checklists));
  }, [data]);

  const loadFromLocal = useCallback((id: string): boolean => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    
    const checklists: ChecklistData[] = JSON.parse(stored);
    const found = checklists.find(c => c.id === id);
    
    if (found) {
      setData(found);
      setCurrentStep(0);
      setCurrentGabinete(0);
      return true;
    }
    return false;
  }, []);

  const getAllLocal = useCallback((): ChecklistData[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const deleteLocal = useCallback((id: string) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const checklists: ChecklistData[] = JSON.parse(stored);
    const filtered = checklists.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }, []);

  const calculateProgress = useCallback((): number => {
    let filled = 0;
    let total = 0;

    // Step 1: Site data
    total += 4;
    if (data.siglaSite.length === 5) filled++;
    if (data.uf) filled++;
    if (data.qtdGabinetes > 0) filled++;
    if (data.fotoPanoramica) filled++;

    // Steps 2-6: Gabinete data (per gabinete)
    data.gabinetes.forEach(gab => {
      // Gabinete info
      total += 3;
      if (gab.tipo) filled++;
      if (gab.tecnologiasAcesso.length > 0) filled++;
      if (gab.tecnologiasTransporte.length > 0) filled++;

      // FCC
      total += 4;
      if (gab.fcc.fabricante) filled++;
      if (gab.fcc.consumoDC > 0) filled++;
      if (gab.fcc.fotoPanoramica) filled++;
      if (gab.fcc.fotoPainel) filled++;

      // Baterias
      total += 2;
      if (gab.baterias.numBancos > 0) filled++;
      if (gab.baterias.fotoBanco) filled++;

      // Climatização
      total += 2;
      if (gab.climatizacao.tipo !== 'NA') filled++;
      if (gab.climatizacao.fotoAR1 || gab.climatizacao.tipo === 'NA') filled++;

      // Equipamentos
      total += 2;
      if (gab.fotoTransmissao) filled++;
      if (gab.fotoAcesso) filled++;
    });

    // Step 7: GMG e Torre
    total += 3;
    filled++; // GMG has default
    if (data.torre.aterramento) filled++;
    if (data.torre.zeladoria) filled++;

    // Step 8: Finalização
    total += 2;
    if (data.observacoes || data.tecnico) filled++;
    if (data.assinaturaDigital) filled++;

    return Math.round((filled / total) * 100);
  }, [data]);

  return (
    <ChecklistContext.Provider value={{
      currentStep,
      setCurrentStep,
      currentGabinete,
      setCurrentGabinete,
      data,
      updateData,
      updateGabinete,
      addGabinete,
      removeGabinete,
      resetChecklist,
      saveToLocal,
      loadFromLocal,
      getAllLocal,
      deleteLocal,
      calculateProgress,
      isDarkMode,
      toggleDarkMode,
    }}>
      {children}
    </ChecklistContext.Provider>
  );
}

export function useChecklist() {
  const context = useContext(ChecklistContext);
  if (!context) {
    throw new Error('useChecklist must be used within a ChecklistProvider');
  }
  return context;
}
