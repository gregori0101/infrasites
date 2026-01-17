import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  ChecklistData,
  INITIAL_CHECKLIST,
  INITIAL_GABINETE,
  INITIAL_FIBRA_OPTICA,
  INITIAL_ABORDAGEM_FIBRA,
  GabineteData,
} from '@/types/checklist';
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

            const parsedFibra = parsed.fibraOptica || {};

            return {
              ...INITIAL_CHECKLIST,
              ...parsed,
              // Ensure nested structures exist even for older saved sessions
              gabinetes: Array.isArray(parsed.gabinetes) && parsed.gabinetes.length > 0 ? parsed.gabinetes : [{ ...INITIAL_GABINETE }],
              fibraOptica: {
                ...INITIAL_FIBRA_OPTICA,
                ...parsedFibra,
                abordagens:
                  Array.isArray(parsedFibra.abordagens) && parsedFibra.abordagens.length > 0
                    ? parsedFibra.abordagens
                    : [{ ...INITIAL_ABORDAGEM_FIBRA }],
                dgos: Array.isArray(parsedFibra.dgos) ? parsedFibra.dgos : [],
                fotosCaixasPassagem: Array.isArray(parsedFibra.fotosCaixasPassagem) ? parsedFibra.fotosCaixasPassagem : [],
                fotosCaixasSubterraneas: Array.isArray(parsedFibra.fotosCaixasSubterraneas) ? parsedFibra.fotosCaixasSubterraneas : [],
                fotosSubidasLaterais: Array.isArray(parsedFibra.fotosSubidasLaterais) ? parsedFibra.fotosSubidasLaterais : [],
              },
            } as ChecklistData;
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
      try {
        const dataToSave = JSON.stringify(data);
        localStorage.setItem(CURRENT_SESSION_KEY, dataToSave);
      } catch (error) {
        // localStorage quota exceeded - try to save without photos
        console.warn('localStorage quota exceeded, saving without photos:', error);
        try {
          const dataWithoutPhotos = {
            ...data,
            fotoPanoramica: null,
            fotoObservacao: null,
            assinaturaDigital: null,
            gabinetes: data.gabinetes.map(gab => ({
              ...gab,
              fotoPanoramicaGabinete: null,
              fotoTransmissao: null,
              fotoAcesso: null,
              fcc: { ...gab.fcc, fotoPanoramica: null, fotoPainel: null },
              baterias: { ...gab.baterias, fotoBanco: null },
              climatizacao: { 
                ...gab.climatizacao, 
                fotoAR1: null, fotoAR2: null, fotoAR3: null, fotoAR4: null,
                fotoCondensador: null, fotoEvaporador: null, fotoControlador: null 
              },
            })),
            energia: {
              ...data.energia,
              fotoTransformador: null,
              fotoQuadroGeral: null,
              fotoPlaca: null,
              cabos: { ...data.energia.cabos, fotoCabos: null },
            },
            torre: { ...data.torre, fotoNinhos: null },
          };
          localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(dataWithoutPhotos));
        } catch (innerError) {
          console.error('Failed to save even without photos:', innerError);
        }
      }
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
    // Pesos por seção (total = 100%)
    const WEIGHTS = {
      site: 10,           // Step 1: Dados do Site
      gabineteInfo: 8,    // Step 2: Info do Gabinete (por gab)
      fcc: 12,            // Step 3: FCC (por gab)
      baterias: 12,       // Step 4: Baterias (por gab)
      climatizacao: 8,    // Step 5: Climatização (por gab)
      energia: 20,        // Step 6: Energia
      gmgTorre: 15,       // Step 7: GMG e Torre
      finalizacao: 15,    // Step 8: Finalização
    };

    // Calcula peso por gabinete (distribui peso entre todos)
    const numGabs = Math.max(1, data.gabinetes.length);
    const gabWeightFactor = 1 / numGabs;

    let progress = 0;

    // ========== Step 1: Dados do Site (10%) ==========
    const siteFields = [
      data.siglaSite.length === 5,
      !!data.uf,
      data.qtdGabinetes > 0,
      !!data.fotoPanoramica,
    ];
    const siteProgress = siteFields.filter(Boolean).length / siteFields.length;
    progress += siteProgress * WEIGHTS.site;

    // ========== Steps por Gabinete ==========
    data.gabinetes.forEach((gab) => {
      // Step 2: Gabinete Info (8% distribuído)
      const gabInfoFields = [
        !!gab.tipo,
        gab.tecnologiasAcesso.length > 0,
        gab.tecnologiasTransporte.length > 0,
        !!gab.fotoPanoramicaGabinete,
      ];
      const gabInfoProgress = gabInfoFields.filter(Boolean).length / gabInfoFields.length;
      progress += gabInfoProgress * WEIGHTS.gabineteInfo * gabWeightFactor;

      // Step 3: FCC (12% distribuído)
      const fccFields = [
        !!gab.fcc.fabricante,
        !!gab.fcc.tensaoDC,
        gab.fcc.consumoDC > 0,
        gab.fcc.qtdURSuportadas !== null && gab.fcc.qtdURSuportadas !== undefined,
        !!gab.fcc.fotoPanoramica,
        !!gab.fcc.fotoPainel,
      ];
      const fccProgress = fccFields.filter(Boolean).length / fccFields.length;
      progress += fccProgress * WEIGHTS.fcc * gabWeightFactor;

      // Step 4: Baterias (12% distribuído)
      let bateriasProgress = 0;
      if (gab.baterias.numBancos > 0) {
        const batFields = [
          true, // numBancos preenchido
          !!gab.baterias.fotoBanco,
          gab.baterias.bancos.length > 0 && gab.baterias.bancos.every(b => !!b.tipo && b.tipo !== 'NA'),
          gab.baterias.bancos.length > 0 && gab.baterias.bancos.every(b => !!b.fabricante),
          gab.baterias.bancos.length > 0 && gab.baterias.bancos.every(b => !!b.estado),
        ];
        bateriasProgress = batFields.filter(Boolean).length / batFields.length;
      } else {
        // Se numBancos = 0, considera 0% ou verifica se foi intencional
        bateriasProgress = 0;
      }
      progress += bateriasProgress * WEIGHTS.baterias * gabWeightFactor;

      // Step 5: Climatização (8% distribuído)
      let climaProgress = 0;
      if (gab.climatizacao.tipo === 'NA') {
        climaProgress = 1; // 100% se não aplicável
      } else if (gab.climatizacao.tipo === 'AR CONDICIONADO') {
        const climaFields = [
          true, // tipo selecionado
          gab.climatizacao.acs.length > 0 && gab.climatizacao.acs.some(ac => ac.modelo !== 'NA'),
          !!gab.climatizacao.fotoAR1,
          gab.climatizacao.plcLeadLag !== null,
        ];
        climaProgress = climaFields.filter(Boolean).length / climaFields.length;
      } else if (gab.climatizacao.tipo === 'FAN') {
        climaProgress = gab.climatizacao.fanOK !== undefined ? 1 : 0.5;
      }
      progress += climaProgress * WEIGHTS.climatizacao * gabWeightFactor;
    });

    // ========== Step 6: Energia (20%) ==========
    const energiaFields = [
      !!data.energia.tipoQuadro,
      !!data.energia.fabricante,
      data.energia.potenciaKVA > 0,
      !!data.energia.tensaoEntrada,
      !!data.energia.fotoQuadroGeral,
      // Fotos condicionais
      data.energia.transformadorOK || !!data.energia.fotoTransformador,
      (data.energia.cabos.terminaisApertados && data.energia.cabos.isolacaoOK) || !!data.energia.cabos.fotoCabos,
      data.energia.placaStatus === 'OK' || !!data.energia.fotoPlaca,
    ];
    const energiaProgress = energiaFields.filter(Boolean).length / energiaFields.length;
    progress += energiaProgress * WEIGHTS.energia;

    // ========== Step 7: GMG e Torre (15%) ==========
    const gmgTorreFields = [
      // GMG - opcional, então conta se informar=false ou se campos preenchidos
      !data.gmg.informar || (!!data.gmg.fabricante && (data.gmg.potencia ?? 0) > 0),
      // Torre
      !!data.torre.aterramento,
      !!data.torre.zeladoria,
      data.torre.fibrasProtegidas !== undefined,
      // Foto ninhos só obrigatória se houver ninhos
      !data.torre.ninhos || !!data.torre.fotoNinhos,
    ];
    const gmgTorreProgress = gmgTorreFields.filter(Boolean).length / gmgTorreFields.length;
    progress += gmgTorreProgress * WEIGHTS.gmgTorre;

    // ========== Step 8: Finalização (15%) ==========
    const finFields = [
      !!data.tecnico && data.tecnico.trim().length > 0,
      !!data.assinaturaDigital,
      // Observação é opcional, mas dá crédito parcial se preenchida
    ];
    // Adiciona bônus se tiver observação
    const finProgress = finFields.filter(Boolean).length / finFields.length;
    const obsBonus = data.observacoes && data.observacoes.trim().length > 0 ? 0.1 : 0;
    progress += Math.min(1, finProgress + obsBonus) * WEIGHTS.finalizacao;

    return Math.min(100, Math.round(progress));
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
