import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  ChecklistData,
  INITIAL_CHECKLIST,
  INITIAL_GABINETE,
  INITIAL_FIBRA_OPTICA,
  INITIAL_ABORDAGEM_FIBRA,
  INITIAL_SECOES_NAO_APLICAVEIS,
  INITIAL_GEOLOCALIZACAO,
  GabineteData,
  SecoesNaoAplicaveis,
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
  updateSecaoNaoAplicavel: (secao: keyof SecoesNaoAplicaveis, value: boolean) => void;
  updateFotosExtras: (fieldKey: string, photos: string[]) => void;
  getFotosExtras: (fieldKey: string) => string[];
  addGabinete: () => void;
  removeGabinete: (index: number) => void;
  resetChecklist: () => void;
  loadFromPreviousReport: (checklistData: ChecklistData) => void;
  loadReportForEditing: (checklistData: ChecklistData, reportId: string) => void;
  clearEditingMode: () => void;
  editingReportId: string | null;
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
            
            // Ensure gabinetes have all required fields with fallbacks
            const restoredGabinetes = Array.isArray(parsed.gabinetes) && parsed.gabinetes.length > 0 
              ? parsed.gabinetes.map((gab: any) => ({
                  ...INITIAL_GABINETE,
                  ...gab,
                  fcc: { ...INITIAL_GABINETE.fcc, ...(gab.fcc || {}) },
                  baterias: { ...INITIAL_GABINETE.baterias, ...(gab.baterias || {}) },
                  climatizacao: { ...INITIAL_GABINETE.climatizacao, ...(gab.climatizacao || {}) },
                }))
              : [{ ...INITIAL_GABINETE }];

            return {
              ...INITIAL_CHECKLIST,
              ...parsed,
              // Ensure nested structures exist even for older saved sessions
              geolocalizacao: {
                ...INITIAL_GEOLOCALIZACAO,
                ...(parsed.geolocalizacao || {}),
              },
              gabinetes: restoredGabinetes,
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
              secoesNaoAplicaveis: {
                ...INITIAL_SECOES_NAO_APLICAVEIS,
                ...(parsed.secoesNaoAplicaveis || {}),
              },
              fotosExtras: parsed.fotosExtras || {},
            } as ChecklistData;
          }
        } catch (e) {
          console.warn('Failed to parse saved session, clearing localStorage:', e);
          // Clear corrupted session data
          localStorage.removeItem(CURRENT_SESSION_KEY);
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
        console.warn('localStorage quota exceeded, saving without base64 photos:', error);
        try {
          // Helper to keep only URLs (not base64), as URLs are already in cloud storage
          const keepOnlyUrls = (photo: string | null | undefined): string | null => {
            if (!photo) return null;
            return photo.startsWith('http') ? photo : null;
          };
          
          const dataWithoutBase64 = {
            ...data,
            fotoPanoramica: keepOnlyUrls(data.fotoPanoramica),
            // Fix: correct field name is fotosObservacao (array with objects)
            fotosObservacao: (data.fotosObservacao || []).map(item => ({
              ...item,
              foto: keepOnlyUrls(item.foto),
            })).filter(item => item.foto), // Only keep items with valid URLs
            assinaturaDigital: keepOnlyUrls(data.assinaturaDigital),
            gabinetes: data.gabinetes.map(gab => ({
              ...gab,
              fotoPanoramicaGabinete: keepOnlyUrls(gab.fotoPanoramicaGabinete),
              fotoTransmissao: keepOnlyUrls(gab.fotoTransmissao),
              fotoAcesso: keepOnlyUrls(gab.fotoAcesso),
              fcc: { 
                ...gab.fcc, 
                fccs: gab.fcc.fccs.map(fcc => ({
                  ...fcc,
                  fotoPanoramica: keepOnlyUrls(fcc.fotoPanoramica),
                  fotoPainel: keepOnlyUrls(fcc.fotoPainel),
                })),
              },
              baterias: { 
                ...gab.baterias, 
                bancos: gab.baterias.bancos.map(banco => ({
                  ...banco,
                  fotoBanco: keepOnlyUrls(banco.fotoBanco),
                })),
              },
              climatizacao: { 
                ...gab.climatizacao, 
                fotoAR1: keepOnlyUrls(gab.climatizacao.fotoAR1), 
                fotoAR2: keepOnlyUrls(gab.climatizacao.fotoAR2), 
                fotoAR3: keepOnlyUrls(gab.climatizacao.fotoAR3), 
                fotoAR4: keepOnlyUrls(gab.climatizacao.fotoAR4),
                fotoCondensador: keepOnlyUrls(gab.climatizacao.fotoCondensador), 
                fotoEvaporador: keepOnlyUrls(gab.climatizacao.fotoEvaporador), 
                fotoControlador: keepOnlyUrls(gab.climatizacao.fotoControlador),
              },
            })),
            energia: {
              ...data.energia,
              fotoTransformador: keepOnlyUrls(data.energia?.fotoTransformador),
              fotoQuadroGeral: keepOnlyUrls(data.energia?.fotoQuadroGeral),
            },
            torre: { 
              ...data.torre, 
              fotoFibrasProtegidas: keepOnlyUrls(data.torre?.fotoFibrasProtegidas),
            },
            gmg: {
              ...data.gmg,
              fotoGMG: keepOnlyUrls(data.gmg?.fotoGMG),
            },
            fibraOptica: {
              ...data.fibraOptica,
              abordagens: (data.fibraOptica?.abordagens || []).map(ab => ({
                ...ab,
                fotos: (ab.fotos || []).map(f => keepOnlyUrls(f)).filter(Boolean),
              })),
              fotosCaixasPassagem: (data.fibraOptica?.fotosCaixasPassagem || []).map(f => keepOnlyUrls(f)).filter(Boolean),
              fotosCaixasSubterraneas: (data.fibraOptica?.fotosCaixasSubterraneas || []).map(f => keepOnlyUrls(f)).filter(Boolean),
              fotosSubidasLaterais: (data.fibraOptica?.fotosSubidasLaterais || []).map(f => keepOnlyUrls(f)).filter(Boolean),
              dgos: (data.fibraOptica?.dgos || []).map(dgo => ({
                ...dgo,
                fotoDGO: keepOnlyUrls(dgo.fotoDGO),
                fotoCordesDetalhada: keepOnlyUrls(dgo.fotoCordesDetalhada),
              })),
            },
          };
          localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(dataWithoutBase64));
        } catch (innerError) {
          console.error('Failed to save even without base64 photos:', innerError);
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

  const updateSecaoNaoAplicavel = useCallback((secao: keyof SecoesNaoAplicaveis, value: boolean) => {
    setData(prev => ({
      ...prev,
      secoesNaoAplicaveis: {
        ...prev.secoesNaoAplicaveis,
        [secao]: value,
      },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateFotosExtras = useCallback((fieldKey: string, photos: string[]) => {
    setData(prev => ({
      ...prev,
      fotosExtras: {
        ...prev.fotosExtras,
        [fieldKey]: photos,
      },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const getFotosExtras = useCallback((fieldKey: string): string[] => {
    return data.fotosExtras?.[fieldKey] || [];
  }, [data.fotosExtras]);

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

  const [editingReportId, setEditingReportId] = React.useState<string | null>(null);

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
    setEditingReportId(null);
    
    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`${CURRENT_SESSION_KEY}_step`);
      sessionStorage.removeItem(`${CURRENT_SESSION_KEY}_gabinete`);
      // Update localStorage with new empty session
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(newData));
    }
  }, []);

  // Load data from a previous report (pre-fill feature)
  const loadFromPreviousReport = useCallback((checklistData: ChecklistData) => {
    // Ensure the data has a new ID and updated timestamps
    const now = new Date().toISOString();
    const newData = {
      ...checklistData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      sincronizado: false,
    };
    
    setData(newData);
    setCurrentStep(0);
    setCurrentGabinete(0);
    setEditingReportId(null);
    
    // Update localStorage with pre-filled session
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`${CURRENT_SESSION_KEY}_step`);
      sessionStorage.removeItem(`${CURRENT_SESSION_KEY}_gabinete`);
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(newData));
    }
    
    console.log('[ChecklistContext] Loaded data from previous report for site:', checklistData.siglaSite);
  }, []);

  // Load data for editing an existing report (admin feature)
  const loadReportForEditing = useCallback((checklistData: ChecklistData, reportId: string) => {
    const now = new Date().toISOString();
    const newData = {
      ...checklistData,
      updatedAt: now,
    };
    
    setData(newData);
    setCurrentStep(0);
    setCurrentGabinete(0);
    setEditingReportId(reportId);
    
    // Update localStorage with editing session
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`${CURRENT_SESSION_KEY}_step`);
      sessionStorage.removeItem(`${CURRENT_SESSION_KEY}_gabinete`);
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(newData));
    }
    
    console.log('[ChecklistContext] Loaded report for editing, ID:', reportId, 'site:', checklistData.siglaSite);
  }, []);

  const clearEditingMode = useCallback(() => {
    setEditingReportId(null);
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
      let fccProgress = 0;
      if (gab.fcc.numFCCs > 0) {
        const fccItems = gab.fcc.fccs;
        const fccFieldsCount = fccItems.reduce((count, fcc) => {
          return count + (fcc.fabricante ? 1 : 0) + (fcc.tensaoDC ? 1 : 0) + (fcc.fotoPanoramica ? 1 : 0) + (fcc.fotoPainel ? 1 : 0);
        }, 0);
        fccProgress = fccFieldsCount / (fccItems.length * 4);
      }
      progress += fccProgress * WEIGHTS.fcc * gabWeightFactor;

      // Step 4: Baterias (12% distribuído)
      let bateriasProgress = 0;
      if (gab.baterias.numBancos > 0) {
        const batFields = [
          true, // numBancos preenchido
          gab.baterias.bancos.length > 0 && gab.baterias.bancos.every(b => !!b.fotoBanco),
          gab.baterias.bancos.length > 0 && gab.baterias.bancos.every(b => !!b.tipo),
          gab.baterias.bancos.length > 0 && gab.baterias.bancos.every(b => !!b.fabricante),
          gab.baterias.bancos.length > 0 && gab.baterias.bancos.every(b => b.estados && b.estados.length > 0),
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
          gab.climatizacao.temPlcLeadLag !== undefined,
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
      data.energia.potenciaKVA !== null && data.energia.potenciaKVA > 0,
      !!data.energia.tensaoEntrada,
      !!data.energia.fotoQuadroGeral,
      // Fotos condicionais - se tem transformador, deve ter foto
      !data.energia.temTransformador || !!data.energia.fotoTransformador,
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
      updateSecaoNaoAplicavel,
      updateFotosExtras,
      getFotosExtras,
      addGabinete,
      removeGabinete,
      resetChecklist,
      loadFromPreviousReport,
      loadReportForEditing,
      clearEditingMode,
      editingReportId,
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
