export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      reports: {
        Row: {
          assinatura_digital: string | null
          created_at: string
          created_date: string
          created_time: string
          email_sent: boolean | null
          email_sent_at: string | null
          energia_foto_cabos: string | null
          energia_foto_placa: string | null
          energia_foto_quadro_geral: string | null
          energia_foto_transformador: string | null
          excel_file_path: string | null
          fibra_abord1_descricao: string | null
          fibra_abord1_tipo: string | null
          fibra_abord2_descricao: string | null
          fibra_abord2_tipo: string | null
          fibra_caixas_passagem_qtd: number | null
          fibra_caixas_subterraneas_qtd: number | null
          fibra_dgo1_capacidade: string | null
          fibra_dgo1_cordoes: string | null
          fibra_dgo1_id: string | null
          fibra_dgo2_capacidade: string | null
          fibra_dgo2_cordoes: string | null
          fibra_dgo2_id: string | null
          fibra_dgo3_capacidade: string | null
          fibra_dgo3_cordoes: string | null
          fibra_dgo3_id: string | null
          fibra_dgo4_capacidade: string | null
          fibra_dgo4_cordoes: string | null
          fibra_dgo4_id: string | null
          fibra_dgos_nok_qtd: number | null
          fibra_dgos_ok_qtd: number | null
          fibra_dgos_qtd: number | null
          fibra_qtd_abordagens: number | null
          fibra_subidas_laterais_qtd: number | null
          gab1_ac1_modelo: string | null
          gab1_ac1_status: string | null
          gab1_ac2_modelo: string | null
          gab1_ac2_status: string | null
          gab1_ac3_modelo: string | null
          gab1_ac3_status: string | null
          gab1_ac4_modelo: string | null
          gab1_ac4_status: string | null
          gab1_alarme_status: string | null
          gab1_bancos_interligados: string | null
          gab1_bat_foto: string | null
          gab1_bat1_capacidade: string | null
          gab1_bat1_data_fabricacao: string | null
          gab1_bat1_estado: string | null
          gab1_bat1_fabricante: string | null
          gab1_bat1_tipo: string | null
          gab1_bat2_capacidade: string | null
          gab1_bat2_data_fabricacao: string | null
          gab1_bat2_estado: string | null
          gab1_bat2_fabricante: string | null
          gab1_bat2_tipo: string | null
          gab1_bat3_capacidade: string | null
          gab1_bat3_data_fabricacao: string | null
          gab1_bat3_estado: string | null
          gab1_bat3_fabricante: string | null
          gab1_bat3_tipo: string | null
          gab1_bat4_capacidade: string | null
          gab1_bat4_data_fabricacao: string | null
          gab1_bat4_estado: string | null
          gab1_bat4_fabricante: string | null
          gab1_bat4_tipo: string | null
          gab1_bat5_capacidade: string | null
          gab1_bat5_data_fabricacao: string | null
          gab1_bat5_estado: string | null
          gab1_bat5_fabricante: string | null
          gab1_bat5_tipo: string | null
          gab1_bat6_capacidade: string | null
          gab1_bat6_data_fabricacao: string | null
          gab1_bat6_estado: string | null
          gab1_bat6_fabricante: string | null
          gab1_bat6_tipo: string | null
          gab1_clima_foto_ar1: string | null
          gab1_clima_foto_ar2: string | null
          gab1_clima_foto_ar3: string | null
          gab1_clima_foto_ar4: string | null
          gab1_clima_foto_condensador: string | null
          gab1_clima_foto_controlador: string | null
          gab1_clima_foto_evaporador: string | null
          gab1_climatizacao_tipo: string | null
          gab1_fcc_consumo: string | null
          gab1_fcc_fabricante: string | null
          gab1_fcc_foto_painel: string | null
          gab1_fcc_foto_panoramica: string | null
          gab1_fcc_gerenciado: string | null
          gab1_fcc_gerenciavel: string | null
          gab1_fcc_qtd_ur: string | null
          gab1_fcc_tensao: string | null
          gab1_foto_acesso: string | null
          gab1_foto_panoramica: string | null
          gab1_foto_transmissao: string | null
          gab1_plc_status: string | null
          gab1_protecao: string | null
          gab1_tecnologias_acesso: string | null
          gab1_tecnologias_transporte: string | null
          gab1_tipo: string | null
          gab1_ventiladores_status: string | null
          gab2_ac1_modelo: string | null
          gab2_ac1_status: string | null
          gab2_ac2_modelo: string | null
          gab2_ac2_status: string | null
          gab2_ac3_modelo: string | null
          gab2_ac3_status: string | null
          gab2_ac4_modelo: string | null
          gab2_ac4_status: string | null
          gab2_alarme_status: string | null
          gab2_bancos_interligados: string | null
          gab2_bat_foto: string | null
          gab2_bat1_capacidade: string | null
          gab2_bat1_data_fabricacao: string | null
          gab2_bat1_estado: string | null
          gab2_bat1_fabricante: string | null
          gab2_bat1_tipo: string | null
          gab2_bat2_capacidade: string | null
          gab2_bat2_data_fabricacao: string | null
          gab2_bat2_estado: string | null
          gab2_bat2_fabricante: string | null
          gab2_bat2_tipo: string | null
          gab2_bat3_capacidade: string | null
          gab2_bat3_data_fabricacao: string | null
          gab2_bat3_estado: string | null
          gab2_bat3_fabricante: string | null
          gab2_bat3_tipo: string | null
          gab2_bat4_capacidade: string | null
          gab2_bat4_data_fabricacao: string | null
          gab2_bat4_estado: string | null
          gab2_bat4_fabricante: string | null
          gab2_bat4_tipo: string | null
          gab2_bat5_capacidade: string | null
          gab2_bat5_data_fabricacao: string | null
          gab2_bat5_estado: string | null
          gab2_bat5_fabricante: string | null
          gab2_bat5_tipo: string | null
          gab2_bat6_capacidade: string | null
          gab2_bat6_data_fabricacao: string | null
          gab2_bat6_estado: string | null
          gab2_bat6_fabricante: string | null
          gab2_bat6_tipo: string | null
          gab2_clima_foto_ar1: string | null
          gab2_clima_foto_ar2: string | null
          gab2_clima_foto_ar3: string | null
          gab2_clima_foto_ar4: string | null
          gab2_clima_foto_condensador: string | null
          gab2_clima_foto_controlador: string | null
          gab2_clima_foto_evaporador: string | null
          gab2_climatizacao_tipo: string | null
          gab2_fcc_consumo: string | null
          gab2_fcc_fabricante: string | null
          gab2_fcc_foto_painel: string | null
          gab2_fcc_foto_panoramica: string | null
          gab2_fcc_gerenciado: string | null
          gab2_fcc_gerenciavel: string | null
          gab2_fcc_qtd_ur: string | null
          gab2_fcc_tensao: string | null
          gab2_foto_acesso: string | null
          gab2_foto_panoramica: string | null
          gab2_foto_transmissao: string | null
          gab2_plc_status: string | null
          gab2_protecao: string | null
          gab2_tecnologias_acesso: string | null
          gab2_tecnologias_transporte: string | null
          gab2_tipo: string | null
          gab2_ventiladores_status: string | null
          gab3_ac1_modelo: string | null
          gab3_ac1_status: string | null
          gab3_ac2_modelo: string | null
          gab3_ac2_status: string | null
          gab3_ac3_modelo: string | null
          gab3_ac3_status: string | null
          gab3_ac4_modelo: string | null
          gab3_ac4_status: string | null
          gab3_alarme_status: string | null
          gab3_bancos_interligados: string | null
          gab3_bat_foto: string | null
          gab3_bat1_capacidade: string | null
          gab3_bat1_data_fabricacao: string | null
          gab3_bat1_estado: string | null
          gab3_bat1_fabricante: string | null
          gab3_bat1_tipo: string | null
          gab3_bat2_capacidade: string | null
          gab3_bat2_data_fabricacao: string | null
          gab3_bat2_estado: string | null
          gab3_bat2_fabricante: string | null
          gab3_bat2_tipo: string | null
          gab3_bat3_capacidade: string | null
          gab3_bat3_data_fabricacao: string | null
          gab3_bat3_estado: string | null
          gab3_bat3_fabricante: string | null
          gab3_bat3_tipo: string | null
          gab3_bat4_capacidade: string | null
          gab3_bat4_data_fabricacao: string | null
          gab3_bat4_estado: string | null
          gab3_bat4_fabricante: string | null
          gab3_bat4_tipo: string | null
          gab3_bat5_capacidade: string | null
          gab3_bat5_data_fabricacao: string | null
          gab3_bat5_estado: string | null
          gab3_bat5_fabricante: string | null
          gab3_bat5_tipo: string | null
          gab3_bat6_capacidade: string | null
          gab3_bat6_data_fabricacao: string | null
          gab3_bat6_estado: string | null
          gab3_bat6_fabricante: string | null
          gab3_bat6_tipo: string | null
          gab3_clima_foto_ar1: string | null
          gab3_clima_foto_ar2: string | null
          gab3_clima_foto_ar3: string | null
          gab3_clima_foto_ar4: string | null
          gab3_clima_foto_condensador: string | null
          gab3_clima_foto_controlador: string | null
          gab3_clima_foto_evaporador: string | null
          gab3_climatizacao_tipo: string | null
          gab3_fcc_consumo: string | null
          gab3_fcc_fabricante: string | null
          gab3_fcc_foto_painel: string | null
          gab3_fcc_foto_panoramica: string | null
          gab3_fcc_gerenciado: string | null
          gab3_fcc_gerenciavel: string | null
          gab3_fcc_qtd_ur: string | null
          gab3_fcc_tensao: string | null
          gab3_foto_acesso: string | null
          gab3_foto_panoramica: string | null
          gab3_foto_transmissao: string | null
          gab3_plc_status: string | null
          gab3_protecao: string | null
          gab3_tecnologias_acesso: string | null
          gab3_tecnologias_transporte: string | null
          gab3_tipo: string | null
          gab3_ventiladores_status: string | null
          gab4_ac1_modelo: string | null
          gab4_ac1_status: string | null
          gab4_ac2_modelo: string | null
          gab4_ac2_status: string | null
          gab4_ac3_modelo: string | null
          gab4_ac3_status: string | null
          gab4_ac4_modelo: string | null
          gab4_ac4_status: string | null
          gab4_alarme_status: string | null
          gab4_bancos_interligados: string | null
          gab4_bat_foto: string | null
          gab4_bat1_capacidade: string | null
          gab4_bat1_data_fabricacao: string | null
          gab4_bat1_estado: string | null
          gab4_bat1_fabricante: string | null
          gab4_bat1_tipo: string | null
          gab4_bat2_capacidade: string | null
          gab4_bat2_data_fabricacao: string | null
          gab4_bat2_estado: string | null
          gab4_bat2_fabricante: string | null
          gab4_bat2_tipo: string | null
          gab4_bat3_capacidade: string | null
          gab4_bat3_data_fabricacao: string | null
          gab4_bat3_estado: string | null
          gab4_bat3_fabricante: string | null
          gab4_bat3_tipo: string | null
          gab4_bat4_capacidade: string | null
          gab4_bat4_data_fabricacao: string | null
          gab4_bat4_estado: string | null
          gab4_bat4_fabricante: string | null
          gab4_bat4_tipo: string | null
          gab4_bat5_capacidade: string | null
          gab4_bat5_data_fabricacao: string | null
          gab4_bat5_estado: string | null
          gab4_bat5_fabricante: string | null
          gab4_bat5_tipo: string | null
          gab4_bat6_capacidade: string | null
          gab4_bat6_data_fabricacao: string | null
          gab4_bat6_estado: string | null
          gab4_bat6_fabricante: string | null
          gab4_bat6_tipo: string | null
          gab4_clima_foto_ar1: string | null
          gab4_clima_foto_ar2: string | null
          gab4_clima_foto_ar3: string | null
          gab4_clima_foto_ar4: string | null
          gab4_clima_foto_condensador: string | null
          gab4_clima_foto_controlador: string | null
          gab4_clima_foto_evaporador: string | null
          gab4_climatizacao_tipo: string | null
          gab4_fcc_consumo: string | null
          gab4_fcc_fabricante: string | null
          gab4_fcc_foto_painel: string | null
          gab4_fcc_foto_panoramica: string | null
          gab4_fcc_gerenciado: string | null
          gab4_fcc_gerenciavel: string | null
          gab4_fcc_qtd_ur: string | null
          gab4_fcc_tensao: string | null
          gab4_foto_acesso: string | null
          gab4_foto_panoramica: string | null
          gab4_foto_transmissao: string | null
          gab4_plc_status: string | null
          gab4_protecao: string | null
          gab4_tecnologias_acesso: string | null
          gab4_tecnologias_transporte: string | null
          gab4_tipo: string | null
          gab4_ventiladores_status: string | null
          gab5_ac1_modelo: string | null
          gab5_ac1_status: string | null
          gab5_ac2_modelo: string | null
          gab5_ac2_status: string | null
          gab5_ac3_modelo: string | null
          gab5_ac3_status: string | null
          gab5_ac4_modelo: string | null
          gab5_ac4_status: string | null
          gab5_alarme_status: string | null
          gab5_bancos_interligados: string | null
          gab5_bat_foto: string | null
          gab5_bat1_capacidade: string | null
          gab5_bat1_data_fabricacao: string | null
          gab5_bat1_estado: string | null
          gab5_bat1_fabricante: string | null
          gab5_bat1_tipo: string | null
          gab5_bat2_capacidade: string | null
          gab5_bat2_data_fabricacao: string | null
          gab5_bat2_estado: string | null
          gab5_bat2_fabricante: string | null
          gab5_bat2_tipo: string | null
          gab5_bat3_capacidade: string | null
          gab5_bat3_data_fabricacao: string | null
          gab5_bat3_estado: string | null
          gab5_bat3_fabricante: string | null
          gab5_bat3_tipo: string | null
          gab5_bat4_capacidade: string | null
          gab5_bat4_data_fabricacao: string | null
          gab5_bat4_estado: string | null
          gab5_bat4_fabricante: string | null
          gab5_bat4_tipo: string | null
          gab5_bat5_capacidade: string | null
          gab5_bat5_data_fabricacao: string | null
          gab5_bat5_estado: string | null
          gab5_bat5_fabricante: string | null
          gab5_bat5_tipo: string | null
          gab5_bat6_capacidade: string | null
          gab5_bat6_data_fabricacao: string | null
          gab5_bat6_estado: string | null
          gab5_bat6_fabricante: string | null
          gab5_bat6_tipo: string | null
          gab5_clima_foto_ar1: string | null
          gab5_clima_foto_ar2: string | null
          gab5_clima_foto_ar3: string | null
          gab5_clima_foto_ar4: string | null
          gab5_clima_foto_condensador: string | null
          gab5_clima_foto_controlador: string | null
          gab5_clima_foto_evaporador: string | null
          gab5_climatizacao_tipo: string | null
          gab5_fcc_consumo: string | null
          gab5_fcc_fabricante: string | null
          gab5_fcc_foto_painel: string | null
          gab5_fcc_foto_panoramica: string | null
          gab5_fcc_gerenciado: string | null
          gab5_fcc_gerenciavel: string | null
          gab5_fcc_qtd_ur: string | null
          gab5_fcc_tensao: string | null
          gab5_foto_acesso: string | null
          gab5_foto_panoramica: string | null
          gab5_foto_transmissao: string | null
          gab5_plc_status: string | null
          gab5_protecao: string | null
          gab5_tecnologias_acesso: string | null
          gab5_tecnologias_transporte: string | null
          gab5_tipo: string | null
          gab5_ventiladores_status: string | null
          gab6_ac1_modelo: string | null
          gab6_ac1_status: string | null
          gab6_ac2_modelo: string | null
          gab6_ac2_status: string | null
          gab6_ac3_modelo: string | null
          gab6_ac3_status: string | null
          gab6_ac4_modelo: string | null
          gab6_ac4_status: string | null
          gab6_alarme_status: string | null
          gab6_bancos_interligados: string | null
          gab6_bat_foto: string | null
          gab6_bat1_capacidade: string | null
          gab6_bat1_data_fabricacao: string | null
          gab6_bat1_estado: string | null
          gab6_bat1_fabricante: string | null
          gab6_bat1_tipo: string | null
          gab6_bat2_capacidade: string | null
          gab6_bat2_data_fabricacao: string | null
          gab6_bat2_estado: string | null
          gab6_bat2_fabricante: string | null
          gab6_bat2_tipo: string | null
          gab6_bat3_capacidade: string | null
          gab6_bat3_data_fabricacao: string | null
          gab6_bat3_estado: string | null
          gab6_bat3_fabricante: string | null
          gab6_bat3_tipo: string | null
          gab6_bat4_capacidade: string | null
          gab6_bat4_data_fabricacao: string | null
          gab6_bat4_estado: string | null
          gab6_bat4_fabricante: string | null
          gab6_bat4_tipo: string | null
          gab6_bat5_capacidade: string | null
          gab6_bat5_data_fabricacao: string | null
          gab6_bat5_estado: string | null
          gab6_bat5_fabricante: string | null
          gab6_bat5_tipo: string | null
          gab6_bat6_capacidade: string | null
          gab6_bat6_data_fabricacao: string | null
          gab6_bat6_estado: string | null
          gab6_bat6_fabricante: string | null
          gab6_bat6_tipo: string | null
          gab6_clima_foto_ar1: string | null
          gab6_clima_foto_ar2: string | null
          gab6_clima_foto_ar3: string | null
          gab6_clima_foto_ar4: string | null
          gab6_clima_foto_condensador: string | null
          gab6_clima_foto_controlador: string | null
          gab6_clima_foto_evaporador: string | null
          gab6_climatizacao_tipo: string | null
          gab6_fcc_consumo: string | null
          gab6_fcc_fabricante: string | null
          gab6_fcc_foto_painel: string | null
          gab6_fcc_foto_panoramica: string | null
          gab6_fcc_gerenciado: string | null
          gab6_fcc_gerenciavel: string | null
          gab6_fcc_qtd_ur: string | null
          gab6_fcc_tensao: string | null
          gab6_foto_acesso: string | null
          gab6_foto_panoramica: string | null
          gab6_foto_transmissao: string | null
          gab6_plc_status: string | null
          gab6_protecao: string | null
          gab6_tecnologias_acesso: string | null
          gab6_tecnologias_transporte: string | null
          gab6_tipo: string | null
          gab6_ventiladores_status: string | null
          gab7_ac1_modelo: string | null
          gab7_ac1_status: string | null
          gab7_ac2_modelo: string | null
          gab7_ac2_status: string | null
          gab7_ac3_modelo: string | null
          gab7_ac3_status: string | null
          gab7_ac4_modelo: string | null
          gab7_ac4_status: string | null
          gab7_alarme_status: string | null
          gab7_bancos_interligados: string | null
          gab7_bat_foto: string | null
          gab7_bat1_capacidade: string | null
          gab7_bat1_data_fabricacao: string | null
          gab7_bat1_estado: string | null
          gab7_bat1_fabricante: string | null
          gab7_bat1_tipo: string | null
          gab7_bat2_capacidade: string | null
          gab7_bat2_data_fabricacao: string | null
          gab7_bat2_estado: string | null
          gab7_bat2_fabricante: string | null
          gab7_bat2_tipo: string | null
          gab7_bat3_capacidade: string | null
          gab7_bat3_data_fabricacao: string | null
          gab7_bat3_estado: string | null
          gab7_bat3_fabricante: string | null
          gab7_bat3_tipo: string | null
          gab7_bat4_capacidade: string | null
          gab7_bat4_data_fabricacao: string | null
          gab7_bat4_estado: string | null
          gab7_bat4_fabricante: string | null
          gab7_bat4_tipo: string | null
          gab7_bat5_capacidade: string | null
          gab7_bat5_data_fabricacao: string | null
          gab7_bat5_estado: string | null
          gab7_bat5_fabricante: string | null
          gab7_bat5_tipo: string | null
          gab7_bat6_capacidade: string | null
          gab7_bat6_data_fabricacao: string | null
          gab7_bat6_estado: string | null
          gab7_bat6_fabricante: string | null
          gab7_bat6_tipo: string | null
          gab7_clima_foto_ar1: string | null
          gab7_clima_foto_ar2: string | null
          gab7_clima_foto_ar3: string | null
          gab7_clima_foto_ar4: string | null
          gab7_clima_foto_condensador: string | null
          gab7_clima_foto_controlador: string | null
          gab7_clima_foto_evaporador: string | null
          gab7_climatizacao_tipo: string | null
          gab7_fcc_consumo: string | null
          gab7_fcc_fabricante: string | null
          gab7_fcc_foto_painel: string | null
          gab7_fcc_foto_panoramica: string | null
          gab7_fcc_gerenciado: string | null
          gab7_fcc_gerenciavel: string | null
          gab7_fcc_qtd_ur: string | null
          gab7_fcc_tensao: string | null
          gab7_foto_acesso: string | null
          gab7_foto_panoramica: string | null
          gab7_foto_transmissao: string | null
          gab7_plc_status: string | null
          gab7_protecao: string | null
          gab7_tecnologias_acesso: string | null
          gab7_tecnologias_transporte: string | null
          gab7_tipo: string | null
          gab7_ventiladores_status: string | null
          gmg_combustivel: string | null
          gmg_existe: string | null
          gmg_fabricante: string | null
          gmg_foto_painel: string | null
          gmg_potencia: string | null
          gmg_ultimo_teste: string | null
          id: string
          observacao_foto_url: string | null
          observacoes: string | null
          panoramic_photo_url: string | null
          pdf_file_path: string | null
          site_code: string
          state_uf: string | null
          technician_name: string | null
          torre_aterramento: string | null
          torre_foto_ninhos: string | null
          torre_housekeeping: string | null
          torre_ninhos: string | null
          torre_protecao_fibra: string | null
          total_cabinets: number
          user_id: string | null
        }
        Insert: {
          assinatura_digital?: string | null
          created_at?: string
          created_date: string
          created_time: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          energia_foto_cabos?: string | null
          energia_foto_placa?: string | null
          energia_foto_quadro_geral?: string | null
          energia_foto_transformador?: string | null
          excel_file_path?: string | null
          fibra_abord1_descricao?: string | null
          fibra_abord1_tipo?: string | null
          fibra_abord2_descricao?: string | null
          fibra_abord2_tipo?: string | null
          fibra_caixas_passagem_qtd?: number | null
          fibra_caixas_subterraneas_qtd?: number | null
          fibra_dgo1_capacidade?: string | null
          fibra_dgo1_cordoes?: string | null
          fibra_dgo1_id?: string | null
          fibra_dgo2_capacidade?: string | null
          fibra_dgo2_cordoes?: string | null
          fibra_dgo2_id?: string | null
          fibra_dgo3_capacidade?: string | null
          fibra_dgo3_cordoes?: string | null
          fibra_dgo3_id?: string | null
          fibra_dgo4_capacidade?: string | null
          fibra_dgo4_cordoes?: string | null
          fibra_dgo4_id?: string | null
          fibra_dgos_nok_qtd?: number | null
          fibra_dgos_ok_qtd?: number | null
          fibra_dgos_qtd?: number | null
          fibra_qtd_abordagens?: number | null
          fibra_subidas_laterais_qtd?: number | null
          gab1_ac1_modelo?: string | null
          gab1_ac1_status?: string | null
          gab1_ac2_modelo?: string | null
          gab1_ac2_status?: string | null
          gab1_ac3_modelo?: string | null
          gab1_ac3_status?: string | null
          gab1_ac4_modelo?: string | null
          gab1_ac4_status?: string | null
          gab1_alarme_status?: string | null
          gab1_bancos_interligados?: string | null
          gab1_bat_foto?: string | null
          gab1_bat1_capacidade?: string | null
          gab1_bat1_data_fabricacao?: string | null
          gab1_bat1_estado?: string | null
          gab1_bat1_fabricante?: string | null
          gab1_bat1_tipo?: string | null
          gab1_bat2_capacidade?: string | null
          gab1_bat2_data_fabricacao?: string | null
          gab1_bat2_estado?: string | null
          gab1_bat2_fabricante?: string | null
          gab1_bat2_tipo?: string | null
          gab1_bat3_capacidade?: string | null
          gab1_bat3_data_fabricacao?: string | null
          gab1_bat3_estado?: string | null
          gab1_bat3_fabricante?: string | null
          gab1_bat3_tipo?: string | null
          gab1_bat4_capacidade?: string | null
          gab1_bat4_data_fabricacao?: string | null
          gab1_bat4_estado?: string | null
          gab1_bat4_fabricante?: string | null
          gab1_bat4_tipo?: string | null
          gab1_bat5_capacidade?: string | null
          gab1_bat5_data_fabricacao?: string | null
          gab1_bat5_estado?: string | null
          gab1_bat5_fabricante?: string | null
          gab1_bat5_tipo?: string | null
          gab1_bat6_capacidade?: string | null
          gab1_bat6_data_fabricacao?: string | null
          gab1_bat6_estado?: string | null
          gab1_bat6_fabricante?: string | null
          gab1_bat6_tipo?: string | null
          gab1_clima_foto_ar1?: string | null
          gab1_clima_foto_ar2?: string | null
          gab1_clima_foto_ar3?: string | null
          gab1_clima_foto_ar4?: string | null
          gab1_clima_foto_condensador?: string | null
          gab1_clima_foto_controlador?: string | null
          gab1_clima_foto_evaporador?: string | null
          gab1_climatizacao_tipo?: string | null
          gab1_fcc_consumo?: string | null
          gab1_fcc_fabricante?: string | null
          gab1_fcc_foto_painel?: string | null
          gab1_fcc_foto_panoramica?: string | null
          gab1_fcc_gerenciado?: string | null
          gab1_fcc_gerenciavel?: string | null
          gab1_fcc_qtd_ur?: string | null
          gab1_fcc_tensao?: string | null
          gab1_foto_acesso?: string | null
          gab1_foto_panoramica?: string | null
          gab1_foto_transmissao?: string | null
          gab1_plc_status?: string | null
          gab1_protecao?: string | null
          gab1_tecnologias_acesso?: string | null
          gab1_tecnologias_transporte?: string | null
          gab1_tipo?: string | null
          gab1_ventiladores_status?: string | null
          gab2_ac1_modelo?: string | null
          gab2_ac1_status?: string | null
          gab2_ac2_modelo?: string | null
          gab2_ac2_status?: string | null
          gab2_ac3_modelo?: string | null
          gab2_ac3_status?: string | null
          gab2_ac4_modelo?: string | null
          gab2_ac4_status?: string | null
          gab2_alarme_status?: string | null
          gab2_bancos_interligados?: string | null
          gab2_bat_foto?: string | null
          gab2_bat1_capacidade?: string | null
          gab2_bat1_data_fabricacao?: string | null
          gab2_bat1_estado?: string | null
          gab2_bat1_fabricante?: string | null
          gab2_bat1_tipo?: string | null
          gab2_bat2_capacidade?: string | null
          gab2_bat2_data_fabricacao?: string | null
          gab2_bat2_estado?: string | null
          gab2_bat2_fabricante?: string | null
          gab2_bat2_tipo?: string | null
          gab2_bat3_capacidade?: string | null
          gab2_bat3_data_fabricacao?: string | null
          gab2_bat3_estado?: string | null
          gab2_bat3_fabricante?: string | null
          gab2_bat3_tipo?: string | null
          gab2_bat4_capacidade?: string | null
          gab2_bat4_data_fabricacao?: string | null
          gab2_bat4_estado?: string | null
          gab2_bat4_fabricante?: string | null
          gab2_bat4_tipo?: string | null
          gab2_bat5_capacidade?: string | null
          gab2_bat5_data_fabricacao?: string | null
          gab2_bat5_estado?: string | null
          gab2_bat5_fabricante?: string | null
          gab2_bat5_tipo?: string | null
          gab2_bat6_capacidade?: string | null
          gab2_bat6_data_fabricacao?: string | null
          gab2_bat6_estado?: string | null
          gab2_bat6_fabricante?: string | null
          gab2_bat6_tipo?: string | null
          gab2_clima_foto_ar1?: string | null
          gab2_clima_foto_ar2?: string | null
          gab2_clima_foto_ar3?: string | null
          gab2_clima_foto_ar4?: string | null
          gab2_clima_foto_condensador?: string | null
          gab2_clima_foto_controlador?: string | null
          gab2_clima_foto_evaporador?: string | null
          gab2_climatizacao_tipo?: string | null
          gab2_fcc_consumo?: string | null
          gab2_fcc_fabricante?: string | null
          gab2_fcc_foto_painel?: string | null
          gab2_fcc_foto_panoramica?: string | null
          gab2_fcc_gerenciado?: string | null
          gab2_fcc_gerenciavel?: string | null
          gab2_fcc_qtd_ur?: string | null
          gab2_fcc_tensao?: string | null
          gab2_foto_acesso?: string | null
          gab2_foto_panoramica?: string | null
          gab2_foto_transmissao?: string | null
          gab2_plc_status?: string | null
          gab2_protecao?: string | null
          gab2_tecnologias_acesso?: string | null
          gab2_tecnologias_transporte?: string | null
          gab2_tipo?: string | null
          gab2_ventiladores_status?: string | null
          gab3_ac1_modelo?: string | null
          gab3_ac1_status?: string | null
          gab3_ac2_modelo?: string | null
          gab3_ac2_status?: string | null
          gab3_ac3_modelo?: string | null
          gab3_ac3_status?: string | null
          gab3_ac4_modelo?: string | null
          gab3_ac4_status?: string | null
          gab3_alarme_status?: string | null
          gab3_bancos_interligados?: string | null
          gab3_bat_foto?: string | null
          gab3_bat1_capacidade?: string | null
          gab3_bat1_data_fabricacao?: string | null
          gab3_bat1_estado?: string | null
          gab3_bat1_fabricante?: string | null
          gab3_bat1_tipo?: string | null
          gab3_bat2_capacidade?: string | null
          gab3_bat2_data_fabricacao?: string | null
          gab3_bat2_estado?: string | null
          gab3_bat2_fabricante?: string | null
          gab3_bat2_tipo?: string | null
          gab3_bat3_capacidade?: string | null
          gab3_bat3_data_fabricacao?: string | null
          gab3_bat3_estado?: string | null
          gab3_bat3_fabricante?: string | null
          gab3_bat3_tipo?: string | null
          gab3_bat4_capacidade?: string | null
          gab3_bat4_data_fabricacao?: string | null
          gab3_bat4_estado?: string | null
          gab3_bat4_fabricante?: string | null
          gab3_bat4_tipo?: string | null
          gab3_bat5_capacidade?: string | null
          gab3_bat5_data_fabricacao?: string | null
          gab3_bat5_estado?: string | null
          gab3_bat5_fabricante?: string | null
          gab3_bat5_tipo?: string | null
          gab3_bat6_capacidade?: string | null
          gab3_bat6_data_fabricacao?: string | null
          gab3_bat6_estado?: string | null
          gab3_bat6_fabricante?: string | null
          gab3_bat6_tipo?: string | null
          gab3_clima_foto_ar1?: string | null
          gab3_clima_foto_ar2?: string | null
          gab3_clima_foto_ar3?: string | null
          gab3_clima_foto_ar4?: string | null
          gab3_clima_foto_condensador?: string | null
          gab3_clima_foto_controlador?: string | null
          gab3_clima_foto_evaporador?: string | null
          gab3_climatizacao_tipo?: string | null
          gab3_fcc_consumo?: string | null
          gab3_fcc_fabricante?: string | null
          gab3_fcc_foto_painel?: string | null
          gab3_fcc_foto_panoramica?: string | null
          gab3_fcc_gerenciado?: string | null
          gab3_fcc_gerenciavel?: string | null
          gab3_fcc_qtd_ur?: string | null
          gab3_fcc_tensao?: string | null
          gab3_foto_acesso?: string | null
          gab3_foto_panoramica?: string | null
          gab3_foto_transmissao?: string | null
          gab3_plc_status?: string | null
          gab3_protecao?: string | null
          gab3_tecnologias_acesso?: string | null
          gab3_tecnologias_transporte?: string | null
          gab3_tipo?: string | null
          gab3_ventiladores_status?: string | null
          gab4_ac1_modelo?: string | null
          gab4_ac1_status?: string | null
          gab4_ac2_modelo?: string | null
          gab4_ac2_status?: string | null
          gab4_ac3_modelo?: string | null
          gab4_ac3_status?: string | null
          gab4_ac4_modelo?: string | null
          gab4_ac4_status?: string | null
          gab4_alarme_status?: string | null
          gab4_bancos_interligados?: string | null
          gab4_bat_foto?: string | null
          gab4_bat1_capacidade?: string | null
          gab4_bat1_data_fabricacao?: string | null
          gab4_bat1_estado?: string | null
          gab4_bat1_fabricante?: string | null
          gab4_bat1_tipo?: string | null
          gab4_bat2_capacidade?: string | null
          gab4_bat2_data_fabricacao?: string | null
          gab4_bat2_estado?: string | null
          gab4_bat2_fabricante?: string | null
          gab4_bat2_tipo?: string | null
          gab4_bat3_capacidade?: string | null
          gab4_bat3_data_fabricacao?: string | null
          gab4_bat3_estado?: string | null
          gab4_bat3_fabricante?: string | null
          gab4_bat3_tipo?: string | null
          gab4_bat4_capacidade?: string | null
          gab4_bat4_data_fabricacao?: string | null
          gab4_bat4_estado?: string | null
          gab4_bat4_fabricante?: string | null
          gab4_bat4_tipo?: string | null
          gab4_bat5_capacidade?: string | null
          gab4_bat5_data_fabricacao?: string | null
          gab4_bat5_estado?: string | null
          gab4_bat5_fabricante?: string | null
          gab4_bat5_tipo?: string | null
          gab4_bat6_capacidade?: string | null
          gab4_bat6_data_fabricacao?: string | null
          gab4_bat6_estado?: string | null
          gab4_bat6_fabricante?: string | null
          gab4_bat6_tipo?: string | null
          gab4_clima_foto_ar1?: string | null
          gab4_clima_foto_ar2?: string | null
          gab4_clima_foto_ar3?: string | null
          gab4_clima_foto_ar4?: string | null
          gab4_clima_foto_condensador?: string | null
          gab4_clima_foto_controlador?: string | null
          gab4_clima_foto_evaporador?: string | null
          gab4_climatizacao_tipo?: string | null
          gab4_fcc_consumo?: string | null
          gab4_fcc_fabricante?: string | null
          gab4_fcc_foto_painel?: string | null
          gab4_fcc_foto_panoramica?: string | null
          gab4_fcc_gerenciado?: string | null
          gab4_fcc_gerenciavel?: string | null
          gab4_fcc_qtd_ur?: string | null
          gab4_fcc_tensao?: string | null
          gab4_foto_acesso?: string | null
          gab4_foto_panoramica?: string | null
          gab4_foto_transmissao?: string | null
          gab4_plc_status?: string | null
          gab4_protecao?: string | null
          gab4_tecnologias_acesso?: string | null
          gab4_tecnologias_transporte?: string | null
          gab4_tipo?: string | null
          gab4_ventiladores_status?: string | null
          gab5_ac1_modelo?: string | null
          gab5_ac1_status?: string | null
          gab5_ac2_modelo?: string | null
          gab5_ac2_status?: string | null
          gab5_ac3_modelo?: string | null
          gab5_ac3_status?: string | null
          gab5_ac4_modelo?: string | null
          gab5_ac4_status?: string | null
          gab5_alarme_status?: string | null
          gab5_bancos_interligados?: string | null
          gab5_bat_foto?: string | null
          gab5_bat1_capacidade?: string | null
          gab5_bat1_data_fabricacao?: string | null
          gab5_bat1_estado?: string | null
          gab5_bat1_fabricante?: string | null
          gab5_bat1_tipo?: string | null
          gab5_bat2_capacidade?: string | null
          gab5_bat2_data_fabricacao?: string | null
          gab5_bat2_estado?: string | null
          gab5_bat2_fabricante?: string | null
          gab5_bat2_tipo?: string | null
          gab5_bat3_capacidade?: string | null
          gab5_bat3_data_fabricacao?: string | null
          gab5_bat3_estado?: string | null
          gab5_bat3_fabricante?: string | null
          gab5_bat3_tipo?: string | null
          gab5_bat4_capacidade?: string | null
          gab5_bat4_data_fabricacao?: string | null
          gab5_bat4_estado?: string | null
          gab5_bat4_fabricante?: string | null
          gab5_bat4_tipo?: string | null
          gab5_bat5_capacidade?: string | null
          gab5_bat5_data_fabricacao?: string | null
          gab5_bat5_estado?: string | null
          gab5_bat5_fabricante?: string | null
          gab5_bat5_tipo?: string | null
          gab5_bat6_capacidade?: string | null
          gab5_bat6_data_fabricacao?: string | null
          gab5_bat6_estado?: string | null
          gab5_bat6_fabricante?: string | null
          gab5_bat6_tipo?: string | null
          gab5_clima_foto_ar1?: string | null
          gab5_clima_foto_ar2?: string | null
          gab5_clima_foto_ar3?: string | null
          gab5_clima_foto_ar4?: string | null
          gab5_clima_foto_condensador?: string | null
          gab5_clima_foto_controlador?: string | null
          gab5_clima_foto_evaporador?: string | null
          gab5_climatizacao_tipo?: string | null
          gab5_fcc_consumo?: string | null
          gab5_fcc_fabricante?: string | null
          gab5_fcc_foto_painel?: string | null
          gab5_fcc_foto_panoramica?: string | null
          gab5_fcc_gerenciado?: string | null
          gab5_fcc_gerenciavel?: string | null
          gab5_fcc_qtd_ur?: string | null
          gab5_fcc_tensao?: string | null
          gab5_foto_acesso?: string | null
          gab5_foto_panoramica?: string | null
          gab5_foto_transmissao?: string | null
          gab5_plc_status?: string | null
          gab5_protecao?: string | null
          gab5_tecnologias_acesso?: string | null
          gab5_tecnologias_transporte?: string | null
          gab5_tipo?: string | null
          gab5_ventiladores_status?: string | null
          gab6_ac1_modelo?: string | null
          gab6_ac1_status?: string | null
          gab6_ac2_modelo?: string | null
          gab6_ac2_status?: string | null
          gab6_ac3_modelo?: string | null
          gab6_ac3_status?: string | null
          gab6_ac4_modelo?: string | null
          gab6_ac4_status?: string | null
          gab6_alarme_status?: string | null
          gab6_bancos_interligados?: string | null
          gab6_bat_foto?: string | null
          gab6_bat1_capacidade?: string | null
          gab6_bat1_data_fabricacao?: string | null
          gab6_bat1_estado?: string | null
          gab6_bat1_fabricante?: string | null
          gab6_bat1_tipo?: string | null
          gab6_bat2_capacidade?: string | null
          gab6_bat2_data_fabricacao?: string | null
          gab6_bat2_estado?: string | null
          gab6_bat2_fabricante?: string | null
          gab6_bat2_tipo?: string | null
          gab6_bat3_capacidade?: string | null
          gab6_bat3_data_fabricacao?: string | null
          gab6_bat3_estado?: string | null
          gab6_bat3_fabricante?: string | null
          gab6_bat3_tipo?: string | null
          gab6_bat4_capacidade?: string | null
          gab6_bat4_data_fabricacao?: string | null
          gab6_bat4_estado?: string | null
          gab6_bat4_fabricante?: string | null
          gab6_bat4_tipo?: string | null
          gab6_bat5_capacidade?: string | null
          gab6_bat5_data_fabricacao?: string | null
          gab6_bat5_estado?: string | null
          gab6_bat5_fabricante?: string | null
          gab6_bat5_tipo?: string | null
          gab6_bat6_capacidade?: string | null
          gab6_bat6_data_fabricacao?: string | null
          gab6_bat6_estado?: string | null
          gab6_bat6_fabricante?: string | null
          gab6_bat6_tipo?: string | null
          gab6_clima_foto_ar1?: string | null
          gab6_clima_foto_ar2?: string | null
          gab6_clima_foto_ar3?: string | null
          gab6_clima_foto_ar4?: string | null
          gab6_clima_foto_condensador?: string | null
          gab6_clima_foto_controlador?: string | null
          gab6_clima_foto_evaporador?: string | null
          gab6_climatizacao_tipo?: string | null
          gab6_fcc_consumo?: string | null
          gab6_fcc_fabricante?: string | null
          gab6_fcc_foto_painel?: string | null
          gab6_fcc_foto_panoramica?: string | null
          gab6_fcc_gerenciado?: string | null
          gab6_fcc_gerenciavel?: string | null
          gab6_fcc_qtd_ur?: string | null
          gab6_fcc_tensao?: string | null
          gab6_foto_acesso?: string | null
          gab6_foto_panoramica?: string | null
          gab6_foto_transmissao?: string | null
          gab6_plc_status?: string | null
          gab6_protecao?: string | null
          gab6_tecnologias_acesso?: string | null
          gab6_tecnologias_transporte?: string | null
          gab6_tipo?: string | null
          gab6_ventiladores_status?: string | null
          gab7_ac1_modelo?: string | null
          gab7_ac1_status?: string | null
          gab7_ac2_modelo?: string | null
          gab7_ac2_status?: string | null
          gab7_ac3_modelo?: string | null
          gab7_ac3_status?: string | null
          gab7_ac4_modelo?: string | null
          gab7_ac4_status?: string | null
          gab7_alarme_status?: string | null
          gab7_bancos_interligados?: string | null
          gab7_bat_foto?: string | null
          gab7_bat1_capacidade?: string | null
          gab7_bat1_data_fabricacao?: string | null
          gab7_bat1_estado?: string | null
          gab7_bat1_fabricante?: string | null
          gab7_bat1_tipo?: string | null
          gab7_bat2_capacidade?: string | null
          gab7_bat2_data_fabricacao?: string | null
          gab7_bat2_estado?: string | null
          gab7_bat2_fabricante?: string | null
          gab7_bat2_tipo?: string | null
          gab7_bat3_capacidade?: string | null
          gab7_bat3_data_fabricacao?: string | null
          gab7_bat3_estado?: string | null
          gab7_bat3_fabricante?: string | null
          gab7_bat3_tipo?: string | null
          gab7_bat4_capacidade?: string | null
          gab7_bat4_data_fabricacao?: string | null
          gab7_bat4_estado?: string | null
          gab7_bat4_fabricante?: string | null
          gab7_bat4_tipo?: string | null
          gab7_bat5_capacidade?: string | null
          gab7_bat5_data_fabricacao?: string | null
          gab7_bat5_estado?: string | null
          gab7_bat5_fabricante?: string | null
          gab7_bat5_tipo?: string | null
          gab7_bat6_capacidade?: string | null
          gab7_bat6_data_fabricacao?: string | null
          gab7_bat6_estado?: string | null
          gab7_bat6_fabricante?: string | null
          gab7_bat6_tipo?: string | null
          gab7_clima_foto_ar1?: string | null
          gab7_clima_foto_ar2?: string | null
          gab7_clima_foto_ar3?: string | null
          gab7_clima_foto_ar4?: string | null
          gab7_clima_foto_condensador?: string | null
          gab7_clima_foto_controlador?: string | null
          gab7_clima_foto_evaporador?: string | null
          gab7_climatizacao_tipo?: string | null
          gab7_fcc_consumo?: string | null
          gab7_fcc_fabricante?: string | null
          gab7_fcc_foto_painel?: string | null
          gab7_fcc_foto_panoramica?: string | null
          gab7_fcc_gerenciado?: string | null
          gab7_fcc_gerenciavel?: string | null
          gab7_fcc_qtd_ur?: string | null
          gab7_fcc_tensao?: string | null
          gab7_foto_acesso?: string | null
          gab7_foto_panoramica?: string | null
          gab7_foto_transmissao?: string | null
          gab7_plc_status?: string | null
          gab7_protecao?: string | null
          gab7_tecnologias_acesso?: string | null
          gab7_tecnologias_transporte?: string | null
          gab7_tipo?: string | null
          gab7_ventiladores_status?: string | null
          gmg_combustivel?: string | null
          gmg_existe?: string | null
          gmg_fabricante?: string | null
          gmg_foto_painel?: string | null
          gmg_potencia?: string | null
          gmg_ultimo_teste?: string | null
          id?: string
          observacao_foto_url?: string | null
          observacoes?: string | null
          panoramic_photo_url?: string | null
          pdf_file_path?: string | null
          site_code: string
          state_uf?: string | null
          technician_name?: string | null
          torre_aterramento?: string | null
          torre_foto_ninhos?: string | null
          torre_housekeeping?: string | null
          torre_ninhos?: string | null
          torre_protecao_fibra?: string | null
          total_cabinets?: number
          user_id?: string | null
        }
        Update: {
          assinatura_digital?: string | null
          created_at?: string
          created_date?: string
          created_time?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          energia_foto_cabos?: string | null
          energia_foto_placa?: string | null
          energia_foto_quadro_geral?: string | null
          energia_foto_transformador?: string | null
          excel_file_path?: string | null
          fibra_abord1_descricao?: string | null
          fibra_abord1_tipo?: string | null
          fibra_abord2_descricao?: string | null
          fibra_abord2_tipo?: string | null
          fibra_caixas_passagem_qtd?: number | null
          fibra_caixas_subterraneas_qtd?: number | null
          fibra_dgo1_capacidade?: string | null
          fibra_dgo1_cordoes?: string | null
          fibra_dgo1_id?: string | null
          fibra_dgo2_capacidade?: string | null
          fibra_dgo2_cordoes?: string | null
          fibra_dgo2_id?: string | null
          fibra_dgo3_capacidade?: string | null
          fibra_dgo3_cordoes?: string | null
          fibra_dgo3_id?: string | null
          fibra_dgo4_capacidade?: string | null
          fibra_dgo4_cordoes?: string | null
          fibra_dgo4_id?: string | null
          fibra_dgos_nok_qtd?: number | null
          fibra_dgos_ok_qtd?: number | null
          fibra_dgos_qtd?: number | null
          fibra_qtd_abordagens?: number | null
          fibra_subidas_laterais_qtd?: number | null
          gab1_ac1_modelo?: string | null
          gab1_ac1_status?: string | null
          gab1_ac2_modelo?: string | null
          gab1_ac2_status?: string | null
          gab1_ac3_modelo?: string | null
          gab1_ac3_status?: string | null
          gab1_ac4_modelo?: string | null
          gab1_ac4_status?: string | null
          gab1_alarme_status?: string | null
          gab1_bancos_interligados?: string | null
          gab1_bat_foto?: string | null
          gab1_bat1_capacidade?: string | null
          gab1_bat1_data_fabricacao?: string | null
          gab1_bat1_estado?: string | null
          gab1_bat1_fabricante?: string | null
          gab1_bat1_tipo?: string | null
          gab1_bat2_capacidade?: string | null
          gab1_bat2_data_fabricacao?: string | null
          gab1_bat2_estado?: string | null
          gab1_bat2_fabricante?: string | null
          gab1_bat2_tipo?: string | null
          gab1_bat3_capacidade?: string | null
          gab1_bat3_data_fabricacao?: string | null
          gab1_bat3_estado?: string | null
          gab1_bat3_fabricante?: string | null
          gab1_bat3_tipo?: string | null
          gab1_bat4_capacidade?: string | null
          gab1_bat4_data_fabricacao?: string | null
          gab1_bat4_estado?: string | null
          gab1_bat4_fabricante?: string | null
          gab1_bat4_tipo?: string | null
          gab1_bat5_capacidade?: string | null
          gab1_bat5_data_fabricacao?: string | null
          gab1_bat5_estado?: string | null
          gab1_bat5_fabricante?: string | null
          gab1_bat5_tipo?: string | null
          gab1_bat6_capacidade?: string | null
          gab1_bat6_data_fabricacao?: string | null
          gab1_bat6_estado?: string | null
          gab1_bat6_fabricante?: string | null
          gab1_bat6_tipo?: string | null
          gab1_clima_foto_ar1?: string | null
          gab1_clima_foto_ar2?: string | null
          gab1_clima_foto_ar3?: string | null
          gab1_clima_foto_ar4?: string | null
          gab1_clima_foto_condensador?: string | null
          gab1_clima_foto_controlador?: string | null
          gab1_clima_foto_evaporador?: string | null
          gab1_climatizacao_tipo?: string | null
          gab1_fcc_consumo?: string | null
          gab1_fcc_fabricante?: string | null
          gab1_fcc_foto_painel?: string | null
          gab1_fcc_foto_panoramica?: string | null
          gab1_fcc_gerenciado?: string | null
          gab1_fcc_gerenciavel?: string | null
          gab1_fcc_qtd_ur?: string | null
          gab1_fcc_tensao?: string | null
          gab1_foto_acesso?: string | null
          gab1_foto_panoramica?: string | null
          gab1_foto_transmissao?: string | null
          gab1_plc_status?: string | null
          gab1_protecao?: string | null
          gab1_tecnologias_acesso?: string | null
          gab1_tecnologias_transporte?: string | null
          gab1_tipo?: string | null
          gab1_ventiladores_status?: string | null
          gab2_ac1_modelo?: string | null
          gab2_ac1_status?: string | null
          gab2_ac2_modelo?: string | null
          gab2_ac2_status?: string | null
          gab2_ac3_modelo?: string | null
          gab2_ac3_status?: string | null
          gab2_ac4_modelo?: string | null
          gab2_ac4_status?: string | null
          gab2_alarme_status?: string | null
          gab2_bancos_interligados?: string | null
          gab2_bat_foto?: string | null
          gab2_bat1_capacidade?: string | null
          gab2_bat1_data_fabricacao?: string | null
          gab2_bat1_estado?: string | null
          gab2_bat1_fabricante?: string | null
          gab2_bat1_tipo?: string | null
          gab2_bat2_capacidade?: string | null
          gab2_bat2_data_fabricacao?: string | null
          gab2_bat2_estado?: string | null
          gab2_bat2_fabricante?: string | null
          gab2_bat2_tipo?: string | null
          gab2_bat3_capacidade?: string | null
          gab2_bat3_data_fabricacao?: string | null
          gab2_bat3_estado?: string | null
          gab2_bat3_fabricante?: string | null
          gab2_bat3_tipo?: string | null
          gab2_bat4_capacidade?: string | null
          gab2_bat4_data_fabricacao?: string | null
          gab2_bat4_estado?: string | null
          gab2_bat4_fabricante?: string | null
          gab2_bat4_tipo?: string | null
          gab2_bat5_capacidade?: string | null
          gab2_bat5_data_fabricacao?: string | null
          gab2_bat5_estado?: string | null
          gab2_bat5_fabricante?: string | null
          gab2_bat5_tipo?: string | null
          gab2_bat6_capacidade?: string | null
          gab2_bat6_data_fabricacao?: string | null
          gab2_bat6_estado?: string | null
          gab2_bat6_fabricante?: string | null
          gab2_bat6_tipo?: string | null
          gab2_clima_foto_ar1?: string | null
          gab2_clima_foto_ar2?: string | null
          gab2_clima_foto_ar3?: string | null
          gab2_clima_foto_ar4?: string | null
          gab2_clima_foto_condensador?: string | null
          gab2_clima_foto_controlador?: string | null
          gab2_clima_foto_evaporador?: string | null
          gab2_climatizacao_tipo?: string | null
          gab2_fcc_consumo?: string | null
          gab2_fcc_fabricante?: string | null
          gab2_fcc_foto_painel?: string | null
          gab2_fcc_foto_panoramica?: string | null
          gab2_fcc_gerenciado?: string | null
          gab2_fcc_gerenciavel?: string | null
          gab2_fcc_qtd_ur?: string | null
          gab2_fcc_tensao?: string | null
          gab2_foto_acesso?: string | null
          gab2_foto_panoramica?: string | null
          gab2_foto_transmissao?: string | null
          gab2_plc_status?: string | null
          gab2_protecao?: string | null
          gab2_tecnologias_acesso?: string | null
          gab2_tecnologias_transporte?: string | null
          gab2_tipo?: string | null
          gab2_ventiladores_status?: string | null
          gab3_ac1_modelo?: string | null
          gab3_ac1_status?: string | null
          gab3_ac2_modelo?: string | null
          gab3_ac2_status?: string | null
          gab3_ac3_modelo?: string | null
          gab3_ac3_status?: string | null
          gab3_ac4_modelo?: string | null
          gab3_ac4_status?: string | null
          gab3_alarme_status?: string | null
          gab3_bancos_interligados?: string | null
          gab3_bat_foto?: string | null
          gab3_bat1_capacidade?: string | null
          gab3_bat1_data_fabricacao?: string | null
          gab3_bat1_estado?: string | null
          gab3_bat1_fabricante?: string | null
          gab3_bat1_tipo?: string | null
          gab3_bat2_capacidade?: string | null
          gab3_bat2_data_fabricacao?: string | null
          gab3_bat2_estado?: string | null
          gab3_bat2_fabricante?: string | null
          gab3_bat2_tipo?: string | null
          gab3_bat3_capacidade?: string | null
          gab3_bat3_data_fabricacao?: string | null
          gab3_bat3_estado?: string | null
          gab3_bat3_fabricante?: string | null
          gab3_bat3_tipo?: string | null
          gab3_bat4_capacidade?: string | null
          gab3_bat4_data_fabricacao?: string | null
          gab3_bat4_estado?: string | null
          gab3_bat4_fabricante?: string | null
          gab3_bat4_tipo?: string | null
          gab3_bat5_capacidade?: string | null
          gab3_bat5_data_fabricacao?: string | null
          gab3_bat5_estado?: string | null
          gab3_bat5_fabricante?: string | null
          gab3_bat5_tipo?: string | null
          gab3_bat6_capacidade?: string | null
          gab3_bat6_data_fabricacao?: string | null
          gab3_bat6_estado?: string | null
          gab3_bat6_fabricante?: string | null
          gab3_bat6_tipo?: string | null
          gab3_clima_foto_ar1?: string | null
          gab3_clima_foto_ar2?: string | null
          gab3_clima_foto_ar3?: string | null
          gab3_clima_foto_ar4?: string | null
          gab3_clima_foto_condensador?: string | null
          gab3_clima_foto_controlador?: string | null
          gab3_clima_foto_evaporador?: string | null
          gab3_climatizacao_tipo?: string | null
          gab3_fcc_consumo?: string | null
          gab3_fcc_fabricante?: string | null
          gab3_fcc_foto_painel?: string | null
          gab3_fcc_foto_panoramica?: string | null
          gab3_fcc_gerenciado?: string | null
          gab3_fcc_gerenciavel?: string | null
          gab3_fcc_qtd_ur?: string | null
          gab3_fcc_tensao?: string | null
          gab3_foto_acesso?: string | null
          gab3_foto_panoramica?: string | null
          gab3_foto_transmissao?: string | null
          gab3_plc_status?: string | null
          gab3_protecao?: string | null
          gab3_tecnologias_acesso?: string | null
          gab3_tecnologias_transporte?: string | null
          gab3_tipo?: string | null
          gab3_ventiladores_status?: string | null
          gab4_ac1_modelo?: string | null
          gab4_ac1_status?: string | null
          gab4_ac2_modelo?: string | null
          gab4_ac2_status?: string | null
          gab4_ac3_modelo?: string | null
          gab4_ac3_status?: string | null
          gab4_ac4_modelo?: string | null
          gab4_ac4_status?: string | null
          gab4_alarme_status?: string | null
          gab4_bancos_interligados?: string | null
          gab4_bat_foto?: string | null
          gab4_bat1_capacidade?: string | null
          gab4_bat1_data_fabricacao?: string | null
          gab4_bat1_estado?: string | null
          gab4_bat1_fabricante?: string | null
          gab4_bat1_tipo?: string | null
          gab4_bat2_capacidade?: string | null
          gab4_bat2_data_fabricacao?: string | null
          gab4_bat2_estado?: string | null
          gab4_bat2_fabricante?: string | null
          gab4_bat2_tipo?: string | null
          gab4_bat3_capacidade?: string | null
          gab4_bat3_data_fabricacao?: string | null
          gab4_bat3_estado?: string | null
          gab4_bat3_fabricante?: string | null
          gab4_bat3_tipo?: string | null
          gab4_bat4_capacidade?: string | null
          gab4_bat4_data_fabricacao?: string | null
          gab4_bat4_estado?: string | null
          gab4_bat4_fabricante?: string | null
          gab4_bat4_tipo?: string | null
          gab4_bat5_capacidade?: string | null
          gab4_bat5_data_fabricacao?: string | null
          gab4_bat5_estado?: string | null
          gab4_bat5_fabricante?: string | null
          gab4_bat5_tipo?: string | null
          gab4_bat6_capacidade?: string | null
          gab4_bat6_data_fabricacao?: string | null
          gab4_bat6_estado?: string | null
          gab4_bat6_fabricante?: string | null
          gab4_bat6_tipo?: string | null
          gab4_clima_foto_ar1?: string | null
          gab4_clima_foto_ar2?: string | null
          gab4_clima_foto_ar3?: string | null
          gab4_clima_foto_ar4?: string | null
          gab4_clima_foto_condensador?: string | null
          gab4_clima_foto_controlador?: string | null
          gab4_clima_foto_evaporador?: string | null
          gab4_climatizacao_tipo?: string | null
          gab4_fcc_consumo?: string | null
          gab4_fcc_fabricante?: string | null
          gab4_fcc_foto_painel?: string | null
          gab4_fcc_foto_panoramica?: string | null
          gab4_fcc_gerenciado?: string | null
          gab4_fcc_gerenciavel?: string | null
          gab4_fcc_qtd_ur?: string | null
          gab4_fcc_tensao?: string | null
          gab4_foto_acesso?: string | null
          gab4_foto_panoramica?: string | null
          gab4_foto_transmissao?: string | null
          gab4_plc_status?: string | null
          gab4_protecao?: string | null
          gab4_tecnologias_acesso?: string | null
          gab4_tecnologias_transporte?: string | null
          gab4_tipo?: string | null
          gab4_ventiladores_status?: string | null
          gab5_ac1_modelo?: string | null
          gab5_ac1_status?: string | null
          gab5_ac2_modelo?: string | null
          gab5_ac2_status?: string | null
          gab5_ac3_modelo?: string | null
          gab5_ac3_status?: string | null
          gab5_ac4_modelo?: string | null
          gab5_ac4_status?: string | null
          gab5_alarme_status?: string | null
          gab5_bancos_interligados?: string | null
          gab5_bat_foto?: string | null
          gab5_bat1_capacidade?: string | null
          gab5_bat1_data_fabricacao?: string | null
          gab5_bat1_estado?: string | null
          gab5_bat1_fabricante?: string | null
          gab5_bat1_tipo?: string | null
          gab5_bat2_capacidade?: string | null
          gab5_bat2_data_fabricacao?: string | null
          gab5_bat2_estado?: string | null
          gab5_bat2_fabricante?: string | null
          gab5_bat2_tipo?: string | null
          gab5_bat3_capacidade?: string | null
          gab5_bat3_data_fabricacao?: string | null
          gab5_bat3_estado?: string | null
          gab5_bat3_fabricante?: string | null
          gab5_bat3_tipo?: string | null
          gab5_bat4_capacidade?: string | null
          gab5_bat4_data_fabricacao?: string | null
          gab5_bat4_estado?: string | null
          gab5_bat4_fabricante?: string | null
          gab5_bat4_tipo?: string | null
          gab5_bat5_capacidade?: string | null
          gab5_bat5_data_fabricacao?: string | null
          gab5_bat5_estado?: string | null
          gab5_bat5_fabricante?: string | null
          gab5_bat5_tipo?: string | null
          gab5_bat6_capacidade?: string | null
          gab5_bat6_data_fabricacao?: string | null
          gab5_bat6_estado?: string | null
          gab5_bat6_fabricante?: string | null
          gab5_bat6_tipo?: string | null
          gab5_clima_foto_ar1?: string | null
          gab5_clima_foto_ar2?: string | null
          gab5_clima_foto_ar3?: string | null
          gab5_clima_foto_ar4?: string | null
          gab5_clima_foto_condensador?: string | null
          gab5_clima_foto_controlador?: string | null
          gab5_clima_foto_evaporador?: string | null
          gab5_climatizacao_tipo?: string | null
          gab5_fcc_consumo?: string | null
          gab5_fcc_fabricante?: string | null
          gab5_fcc_foto_painel?: string | null
          gab5_fcc_foto_panoramica?: string | null
          gab5_fcc_gerenciado?: string | null
          gab5_fcc_gerenciavel?: string | null
          gab5_fcc_qtd_ur?: string | null
          gab5_fcc_tensao?: string | null
          gab5_foto_acesso?: string | null
          gab5_foto_panoramica?: string | null
          gab5_foto_transmissao?: string | null
          gab5_plc_status?: string | null
          gab5_protecao?: string | null
          gab5_tecnologias_acesso?: string | null
          gab5_tecnologias_transporte?: string | null
          gab5_tipo?: string | null
          gab5_ventiladores_status?: string | null
          gab6_ac1_modelo?: string | null
          gab6_ac1_status?: string | null
          gab6_ac2_modelo?: string | null
          gab6_ac2_status?: string | null
          gab6_ac3_modelo?: string | null
          gab6_ac3_status?: string | null
          gab6_ac4_modelo?: string | null
          gab6_ac4_status?: string | null
          gab6_alarme_status?: string | null
          gab6_bancos_interligados?: string | null
          gab6_bat_foto?: string | null
          gab6_bat1_capacidade?: string | null
          gab6_bat1_data_fabricacao?: string | null
          gab6_bat1_estado?: string | null
          gab6_bat1_fabricante?: string | null
          gab6_bat1_tipo?: string | null
          gab6_bat2_capacidade?: string | null
          gab6_bat2_data_fabricacao?: string | null
          gab6_bat2_estado?: string | null
          gab6_bat2_fabricante?: string | null
          gab6_bat2_tipo?: string | null
          gab6_bat3_capacidade?: string | null
          gab6_bat3_data_fabricacao?: string | null
          gab6_bat3_estado?: string | null
          gab6_bat3_fabricante?: string | null
          gab6_bat3_tipo?: string | null
          gab6_bat4_capacidade?: string | null
          gab6_bat4_data_fabricacao?: string | null
          gab6_bat4_estado?: string | null
          gab6_bat4_fabricante?: string | null
          gab6_bat4_tipo?: string | null
          gab6_bat5_capacidade?: string | null
          gab6_bat5_data_fabricacao?: string | null
          gab6_bat5_estado?: string | null
          gab6_bat5_fabricante?: string | null
          gab6_bat5_tipo?: string | null
          gab6_bat6_capacidade?: string | null
          gab6_bat6_data_fabricacao?: string | null
          gab6_bat6_estado?: string | null
          gab6_bat6_fabricante?: string | null
          gab6_bat6_tipo?: string | null
          gab6_clima_foto_ar1?: string | null
          gab6_clima_foto_ar2?: string | null
          gab6_clima_foto_ar3?: string | null
          gab6_clima_foto_ar4?: string | null
          gab6_clima_foto_condensador?: string | null
          gab6_clima_foto_controlador?: string | null
          gab6_clima_foto_evaporador?: string | null
          gab6_climatizacao_tipo?: string | null
          gab6_fcc_consumo?: string | null
          gab6_fcc_fabricante?: string | null
          gab6_fcc_foto_painel?: string | null
          gab6_fcc_foto_panoramica?: string | null
          gab6_fcc_gerenciado?: string | null
          gab6_fcc_gerenciavel?: string | null
          gab6_fcc_qtd_ur?: string | null
          gab6_fcc_tensao?: string | null
          gab6_foto_acesso?: string | null
          gab6_foto_panoramica?: string | null
          gab6_foto_transmissao?: string | null
          gab6_plc_status?: string | null
          gab6_protecao?: string | null
          gab6_tecnologias_acesso?: string | null
          gab6_tecnologias_transporte?: string | null
          gab6_tipo?: string | null
          gab6_ventiladores_status?: string | null
          gab7_ac1_modelo?: string | null
          gab7_ac1_status?: string | null
          gab7_ac2_modelo?: string | null
          gab7_ac2_status?: string | null
          gab7_ac3_modelo?: string | null
          gab7_ac3_status?: string | null
          gab7_ac4_modelo?: string | null
          gab7_ac4_status?: string | null
          gab7_alarme_status?: string | null
          gab7_bancos_interligados?: string | null
          gab7_bat_foto?: string | null
          gab7_bat1_capacidade?: string | null
          gab7_bat1_data_fabricacao?: string | null
          gab7_bat1_estado?: string | null
          gab7_bat1_fabricante?: string | null
          gab7_bat1_tipo?: string | null
          gab7_bat2_capacidade?: string | null
          gab7_bat2_data_fabricacao?: string | null
          gab7_bat2_estado?: string | null
          gab7_bat2_fabricante?: string | null
          gab7_bat2_tipo?: string | null
          gab7_bat3_capacidade?: string | null
          gab7_bat3_data_fabricacao?: string | null
          gab7_bat3_estado?: string | null
          gab7_bat3_fabricante?: string | null
          gab7_bat3_tipo?: string | null
          gab7_bat4_capacidade?: string | null
          gab7_bat4_data_fabricacao?: string | null
          gab7_bat4_estado?: string | null
          gab7_bat4_fabricante?: string | null
          gab7_bat4_tipo?: string | null
          gab7_bat5_capacidade?: string | null
          gab7_bat5_data_fabricacao?: string | null
          gab7_bat5_estado?: string | null
          gab7_bat5_fabricante?: string | null
          gab7_bat5_tipo?: string | null
          gab7_bat6_capacidade?: string | null
          gab7_bat6_data_fabricacao?: string | null
          gab7_bat6_estado?: string | null
          gab7_bat6_fabricante?: string | null
          gab7_bat6_tipo?: string | null
          gab7_clima_foto_ar1?: string | null
          gab7_clima_foto_ar2?: string | null
          gab7_clima_foto_ar3?: string | null
          gab7_clima_foto_ar4?: string | null
          gab7_clima_foto_condensador?: string | null
          gab7_clima_foto_controlador?: string | null
          gab7_clima_foto_evaporador?: string | null
          gab7_climatizacao_tipo?: string | null
          gab7_fcc_consumo?: string | null
          gab7_fcc_fabricante?: string | null
          gab7_fcc_foto_painel?: string | null
          gab7_fcc_foto_panoramica?: string | null
          gab7_fcc_gerenciado?: string | null
          gab7_fcc_gerenciavel?: string | null
          gab7_fcc_qtd_ur?: string | null
          gab7_fcc_tensao?: string | null
          gab7_foto_acesso?: string | null
          gab7_foto_panoramica?: string | null
          gab7_foto_transmissao?: string | null
          gab7_plc_status?: string | null
          gab7_protecao?: string | null
          gab7_tecnologias_acesso?: string | null
          gab7_tecnologias_transporte?: string | null
          gab7_tipo?: string | null
          gab7_ventiladores_status?: string | null
          gmg_combustivel?: string | null
          gmg_existe?: string | null
          gmg_fabricante?: string | null
          gmg_foto_painel?: string | null
          gmg_potencia?: string | null
          gmg_ultimo_teste?: string | null
          id?: string
          observacao_foto_url?: string | null
          observacoes?: string | null
          panoramic_photo_url?: string | null
          pdf_file_path?: string | null
          site_code?: string
          state_uf?: string | null
          technician_name?: string | null
          torre_aterramento?: string | null
          torre_foto_ninhos?: string | null
          torre_housekeeping?: string | null
          torre_ninhos?: string | null
          torre_protecao_fibra?: string | null
          total_cabinets?: number
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "gestor" | "tecnico"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["gestor", "tecnico"],
    },
  },
} as const
