import { useMemo } from "react";
import { ChecklistData, GabineteData } from "@/types/checklist";

export interface ValidationError {
  field: string;
  message: string;
}

export interface StepValidation {
  isValid: boolean;
  errors: ValidationError[];
}

export function useStepValidation(data: ChecklistData, currentStep: number, currentGabinete: number): StepValidation {
  const gabinete = data.gabinetes[currentGabinete];

  return useMemo(() => {
    const errors: ValidationError[] = [];

    // Check if sections are skipped (não se aplica)
    const isGabineteSkipped = data.secoesNaoAplicaveis?.gabinete ?? false;
    const isFCCSkipped = data.secoesNaoAplicaveis?.fcc ?? false;
    const isBateriasSkipped = data.secoesNaoAplicaveis?.baterias ?? false;
    const isClimatizacaoSkipped = data.secoesNaoAplicaveis?.climatizacao ?? false;
    const isEnergiaSkipped = data.secoesNaoAplicaveis?.energia ?? false;
    const isGmgTorreSkipped = data.secoesNaoAplicaveis?.gmgTorre ?? false;

    switch (currentStep) {
      case 0: // Step1DadosSite
        if (!data.siglaSite || data.siglaSite.length !== 5) {
          errors.push({ field: 'siglaSite', message: 'Sigla deve ter exatamente 5 caracteres' });
        }
        if (!data.uf) {
          errors.push({ field: 'uf', message: 'Selecione a UF' });
        }
        if (!data.fotoPanoramica) {
          errors.push({ field: 'fotoPanoramica', message: 'Foto panorâmica é obrigatória' });
        }
        break;

      case 1: // Step2Gabinete
        if (isGabineteSkipped) break;
        if (!gabinete) break;
        if (!gabinete.tipo) {
          errors.push({ field: 'tipo', message: 'Selecione o tipo do gabinete' });
        }
        if (gabinete.tecnologiasAcesso.length === 0) {
          errors.push({ field: 'tecnologiasAcesso', message: 'Selecione pelo menos uma tecnologia de acesso' });
        }
        break;

      case 2: // Step3FCC
        if (isFCCSkipped) break;
        if (!gabinete) break;
        // FCC pode ter 0 itens se não houver neste gabinete específico
        // Valida apenas se há FCCs cadastradas
        gabinete.fcc.fccs.forEach((fcc, index) => {
          if (!fcc.fabricante) {
            errors.push({ field: `fcc.${index}.fabricante`, message: `FCC ${index + 1}: Informe o fabricante` });
          }
          if (!fcc.tensaoDC) {
            errors.push({ field: `fcc.${index}.tensaoDC`, message: `FCC ${index + 1}: Selecione a tensão DC` });
          }
          if (!fcc.fotoPanoramica) {
            errors.push({ field: `fcc.${index}.fotoPanoramica`, message: `FCC ${index + 1}: Foto panorâmica obrigatória` });
          }
        });
        break;

      case 3: // Step4Baterias
        if (isBateriasSkipped) break;
        if (!gabinete) break;
        // Baterias pode ter 0 itens se não houver neste gabinete específico
        // Valida apenas se há bancos cadastrados
        gabinete.baterias.bancos.forEach((banco, index) => {
          if (!banco.fotoBanco) {
            errors.push({ field: `banco.${index}.fotoBanco`, message: `Banco ${index + 1}: Foto obrigatória` });
          }
        });
        break;

      case 4: // Step5Climatizacao
        if (isClimatizacaoSkipped) break;
        if (!gabinete) break;
        if (!gabinete.climatizacao.tipo) {
          errors.push({ field: 'climatizacao.tipo', message: 'Selecione o tipo de climatização' });
        }
        break;

      case 5: // Step6FibraOptica
        // Fibra sempre é aplicável (não tem toggle de skip)
        // Validação mínima - pelo menos 1 abordagem com tipo definido
        if (!data.fibraOptica?.abordagens?.length || data.fibraOptica.abordagens.length === 0) {
          errors.push({ field: 'fibra.abordagens', message: 'Adicione pelo menos uma abordagem de fibra' });
        }
        break;

      case 6: // Step7Energia
        if (isEnergiaSkipped) break;
        if (!data.energia.fotoQuadroGeral) {
          errors.push({ field: 'energia.fotoQuadroGeral', message: 'Foto do quadro geral é obrigatória' });
        }
        if (data.energia.transformadorOK === false && !data.energia.fotoTransformador) {
          errors.push({ field: 'energia.fotoTransformador', message: 'Foto do transformador é obrigatória quando NOK' });
        }
        break;

      case 7: // Step9GMGTorre
        if (isGmgTorreSkipped) break;
        // GMG validation - ultimoTeste is required when GMG exists
        if (data.gmg.informar && !data.gmg.ultimoTeste) {
          errors.push({ field: 'gmg.ultimoTeste', message: 'Data do último teste é obrigatória quando GMG existe' });
        }
        // Torre validation
        if (data.torre.ninhos && !data.torre.fotoNinhos) {
          errors.push({ field: 'fotoNinhos', message: 'Foto de ninhos é obrigatória quando há ninhos' });
        }
        break;

      case 8: // Step10Finalizacao
        if (!data.tecnico || data.tecnico.trim() === '') {
          errors.push({ field: 'tecnico', message: 'Nome do técnico é obrigatório' });
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [data, gabinete, currentStep, currentGabinete]);
}

export function getFieldError(errors: ValidationError[], field: string): string | undefined {
  return errors.find(e => e.field === field)?.message;
}
