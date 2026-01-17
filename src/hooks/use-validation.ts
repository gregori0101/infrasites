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
        if (!gabinete) break;
        if (!gabinete.tipo) {
          errors.push({ field: 'tipo', message: 'Selecione o tipo do gabinete' });
        }
        if (gabinete.tecnologiasAcesso.length === 0) {
          errors.push({ field: 'tecnologiasAcesso', message: 'Selecione pelo menos uma tecnologia de acesso' });
        }
        break;

      case 2: // Step3FCC
        if (!gabinete) break;
        if (!gabinete.fcc.fabricante) {
          errors.push({ field: 'fabricante', message: 'Informe o fabricante da FCC' });
        }
        if (!gabinete.fcc.tensaoDC) {
          errors.push({ field: 'tensaoDC', message: 'Selecione a tensão DC' });
        }
        if (!gabinete.fcc.fotoPanoramica) {
          errors.push({ field: 'fcc.fotoPanoramica', message: 'Foto panorâmica da FCC é obrigatória' });
        }
        break;

      case 3: // Step4Baterias
        if (!gabinete) break;
        if (gabinete.baterias.numBancos < 1) {
          errors.push({ field: 'numBancos', message: 'Informe o número de bancos' });
        }
        if (!gabinete.baterias.fotoBanco) {
          errors.push({ field: 'fotoBanco', message: 'Foto do banco de baterias é obrigatória' });
        }
        break;

      case 4: // Step5Climatizacao
        if (!gabinete) break;
        if (!gabinete.climatizacao.tipo) {
          errors.push({ field: 'climatizacao.tipo', message: 'Selecione o tipo de climatização' });
        }
        break;

      case 5: // Step7Energia
        if (!data.energia.fotoQuadroGeral) {
          errors.push({ field: 'energia.fotoQuadroGeral', message: 'Foto do quadro geral é obrigatória' });
        }
        if (!data.energia.transformadorOK && !data.energia.fotoTransformador) {
          errors.push({ field: 'energia.fotoTransformador', message: 'Foto do transformador é obrigatória quando NOK' });
        }
        if ((!data.energia.cabos.terminaisApertados || !data.energia.cabos.isolacaoOK) && !data.energia.cabos.fotoCabos) {
          errors.push({ field: 'energia.cabos.fotoCabos', message: 'Foto dos cabos é obrigatória quando NOK' });
        }
        if (data.energia.placaStatus !== 'OK' && !data.energia.fotoPlaca) {
          errors.push({ field: 'energia.fotoPlaca', message: 'Foto da placa é obrigatória quando NOK/Ausente' });
        }
        break;

      case 6: // Step9GMGTorre
        // GMG fields are optional based on "informar" toggle
        // Torre validation
        if (data.torre.ninhos && !data.torre.fotoNinhos) {
          errors.push({ field: 'fotoNinhos', message: 'Foto de ninhos é obrigatória quando há ninhos' });
        }
        break;

      case 7: // Step10Finalizacao
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
