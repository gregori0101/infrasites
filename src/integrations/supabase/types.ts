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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      atividades_reparo: {
        Row: {
          criado_em: string
          descricao: string | null
          id: string
          reparo_id: string
          tipo: string
          usuario_id: string
        }
        Insert: {
          criado_em?: string
          descricao?: string | null
          id?: string
          reparo_id: string
          tipo: string
          usuario_id: string
        }
        Update: {
          criado_em?: string
          descricao?: string | null
          id?: string
          reparo_id?: string
          tipo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividades_reparo_reparo_id_fkey"
            columns: ["reparo_id"]
            isOneToOne: false
            referencedRelation: "reparos"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_order_items: {
        Row: {
          audited_at: string | null
          created_at: string
          descricao: string
          foto_url: string | null
          id: string
          observacao: string | null
          order_id: string
          quantidade: number
          quantidade_auditada: number | null
          status: string
          unidade: string
        }
        Insert: {
          audited_at?: string | null
          created_at?: string
          descricao: string
          foto_url?: string | null
          id?: string
          observacao?: string | null
          order_id: string
          quantidade?: number
          quantidade_auditada?: number | null
          status?: string
          unidade?: string
        }
        Update: {
          audited_at?: string | null
          created_at?: string
          descricao?: string
          foto_url?: string | null
          id?: string
          observacao?: string | null
          order_id?: string
          quantidade?: number
          quantidade_auditada?: number | null
          status?: string
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "audit_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_orders: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string
          deadline: string | null
          id: string
          motivo: string
          notes: string | null
          os_number: string
          site_code: string
          status: string
          technician_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by: string
          deadline?: string | null
          id?: string
          motivo: string
          notes?: string | null
          os_number: string
          site_code: string
          status?: string
          technician_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string
          deadline?: string | null
          id?: string
          motivo?: string
          notes?: string | null
          os_number?: string
          site_code?: string
          status?: string
          technician_id?: string
        }
        Relationships: []
      }
      fg_profiles: {
        Row: {
          avatar_url: string | null
          criado_em: string
          email: string
          id: string
          nome: string
        }
        Insert: {
          avatar_url?: string | null
          criado_em?: string
          email?: string
          id: string
          nome?: string
        }
        Update: {
          avatar_url?: string | null
          criado_em?: string
          email?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      fotos_reparo: {
        Row: {
          caminho_arquivo: string
          criado_em: string
          id: string
          ordem: number
          reparo_id: string
          tipo_foto: string
          titulo: string | null
        }
        Insert: {
          caminho_arquivo: string
          criado_em?: string
          id?: string
          ordem?: number
          reparo_id: string
          tipo_foto?: string
          titulo?: string | null
        }
        Update: {
          caminho_arquivo?: string
          criado_em?: string
          id?: string
          ordem?: number
          reparo_id?: string
          tipo_foto?: string
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fotos_reparo_reparo_id_fkey"
            columns: ["reparo_id"]
            isOneToOne: false
            referencedRelation: "reparos"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_tecnico: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: string
          mes: string
          meta_reparos: number
          user_id: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          mes: string
          meta_reparos?: number
          user_id: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          mes?: string
          meta_reparos?: number
          user_id?: string
        }
        Relationships: []
      }
      reparos: {
        Row: {
          atualizado_em: string
          caixa_bomba: boolean
          categoria: string
          causa: string
          conclusao_ta: string
          criado_em: string
          email_enviado: boolean
          email_enviado_em: string | null
          fim_trabalho: string | null
          id: string
          inicio_trabalho: string | null
          latitude: number | null
          longitude: number | null
          observacao_definitivo: string | null
          observacao_prevencao: string | null
          observacoes: string | null
          prazo_vistoria: string | null
          rnc_aplicada: boolean
          rnc_aplicada_em: string | null
          rnc_observacao: string | null
          sincronizado: boolean
          status: string
          ta_titulo: string
          tecnicos_reparo: string | null
          tipo_rede: string | null
          trecho: string | null
          usuario_id: string
        }
        Insert: {
          atualizado_em?: string
          caixa_bomba?: boolean
          categoria?: string
          causa?: string
          conclusao_ta?: string
          criado_em?: string
          email_enviado?: boolean
          email_enviado_em?: string | null
          fim_trabalho?: string | null
          id?: string
          inicio_trabalho?: string | null
          latitude?: number | null
          longitude?: number | null
          observacao_definitivo?: string | null
          observacao_prevencao?: string | null
          observacoes?: string | null
          prazo_vistoria?: string | null
          rnc_aplicada?: boolean
          rnc_aplicada_em?: string | null
          rnc_observacao?: string | null
          sincronizado?: boolean
          status?: string
          ta_titulo: string
          tecnicos_reparo?: string | null
          tipo_rede?: string | null
          trecho?: string | null
          usuario_id: string
        }
        Update: {
          atualizado_em?: string
          caixa_bomba?: boolean
          categoria?: string
          causa?: string
          conclusao_ta?: string
          criado_em?: string
          email_enviado?: boolean
          email_enviado_em?: string | null
          fim_trabalho?: string | null
          id?: string
          inicio_trabalho?: string | null
          latitude?: number | null
          longitude?: number | null
          observacao_definitivo?: string | null
          observacao_prevencao?: string | null
          observacoes?: string | null
          prazo_vistoria?: string | null
          rnc_aplicada?: boolean
          rnc_aplicada_em?: string | null
          rnc_observacao?: string | null
          sincronizado?: boolean
          status?: string
          ta_titulo?: string
          tecnicos_reparo?: string | null
          tipo_rede?: string | null
          trecho?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          assinatura_digital: string | null
          baterias_tipo_ia: Json | null
          created_at: string
          created_date: string
          created_time: string
          email_sent: boolean | null
          email_sent_at: string | null
          energia_disjuntor_entrada: number | null
          energia_disjuntor_qdca: number | null
          energia_fabricante: string | null
          energia_fabricante_outra: string | null
          energia_foto_cabos: string | null
          energia_foto_placa: string | null
          energia_foto_quadro_geral: string | null
          energia_foto_relogio: string | null
          energia_foto_transformador: string | null
          energia_potencia_kva: number | null
          energia_potencia_transformador: string | null
          energia_protegido_cadeado: string | null
          energia_protegido_gradil: string | null
          energia_tensao_entrada: string | null
          energia_tipo_quadro: string | null
          energia_transformador_ok: string | null
          energia_unidade_consumidora: string | null
          excel_file_path: string | null
          fibra_abord1_descricao: string | null
          fibra_abord1_foto: string | null
          fibra_abord1_tipo: string | null
          fibra_abord2_descricao: string | null
          fibra_abord2_foto: string | null
          fibra_abord2_tipo: string | null
          fibra_abord3_descricao: string | null
          fibra_abord3_foto: string | null
          fibra_abord3_tipo: string | null
          fibra_abord4_descricao: string | null
          fibra_abord4_foto: string | null
          fibra_abord4_tipo: string | null
          fibra_caixas_passagem_qtd: number | null
          fibra_caixas_subterraneas_qtd: number | null
          fibra_dgo1_capacidade: string | null
          fibra_dgo1_cordoes: string | null
          fibra_dgo1_cordoes_foto: string | null
          fibra_dgo1_foto: string | null
          fibra_dgo1_id: string | null
          fibra_dgo2_capacidade: string | null
          fibra_dgo2_cordoes: string | null
          fibra_dgo2_cordoes_foto: string | null
          fibra_dgo2_foto: string | null
          fibra_dgo2_id: string | null
          fibra_dgo3_capacidade: string | null
          fibra_dgo3_cordoes: string | null
          fibra_dgo3_cordoes_foto: string | null
          fibra_dgo3_foto: string | null
          fibra_dgo3_id: string | null
          fibra_dgo4_capacidade: string | null
          fibra_dgo4_cordoes: string | null
          fibra_dgo4_cordoes_foto: string | null
          fibra_dgo4_foto: string | null
          fibra_dgo4_id: string | null
          fibra_dgos_nok_qtd: number | null
          fibra_dgos_ok_qtd: number | null
          fibra_dgos_qtd: number | null
          fibra_foto_caixas_passagem: string | null
          fibra_foto_caixas_subterraneas: string | null
          fibra_foto_subidas_laterais: string | null
          fibra_qtd_abordagens: number | null
          fibra_subidas_laterais_qtd: number | null
          fotos_extras: Json | null
          gab1_ac1_modelo: string | null
          gab1_ac1_status: string | null
          gab1_ac2_modelo: string | null
          gab1_ac2_status: string | null
          gab1_ac3_modelo: string | null
          gab1_ac3_status: string | null
          gab1_ac4_modelo: string | null
          gab1_ac4_status: string | null
          gab1_alarme_status: string | null
          gab1_ativo: string | null
          gab1_bancos_interligados: string | null
          gab1_bat_foto: string | null
          gab1_bat1_capacidade: string | null
          gab1_bat1_colada: string | null
          gab1_bat1_com_gradil: string | null
          gab1_bat1_data_fabricacao: string | null
          gab1_bat1_estado: string | null
          gab1_bat1_fabricante: string | null
          gab1_bat1_tipo: string | null
          gab1_bat10_capacidade: string | null
          gab1_bat10_colada: string | null
          gab1_bat10_com_gradil: string | null
          gab1_bat10_data_fabricacao: string | null
          gab1_bat10_estado: string | null
          gab1_bat10_fabricante: string | null
          gab1_bat10_tipo: string | null
          gab1_bat11_capacidade: string | null
          gab1_bat11_colada: string | null
          gab1_bat11_com_gradil: string | null
          gab1_bat11_data_fabricacao: string | null
          gab1_bat11_estado: string | null
          gab1_bat11_fabricante: string | null
          gab1_bat11_tipo: string | null
          gab1_bat12_capacidade: string | null
          gab1_bat12_colada: string | null
          gab1_bat12_com_gradil: string | null
          gab1_bat12_data_fabricacao: string | null
          gab1_bat12_estado: string | null
          gab1_bat12_fabricante: string | null
          gab1_bat12_tipo: string | null
          gab1_bat2_capacidade: string | null
          gab1_bat2_colada: string | null
          gab1_bat2_com_gradil: string | null
          gab1_bat2_data_fabricacao: string | null
          gab1_bat2_estado: string | null
          gab1_bat2_fabricante: string | null
          gab1_bat2_tipo: string | null
          gab1_bat3_capacidade: string | null
          gab1_bat3_colada: string | null
          gab1_bat3_com_gradil: string | null
          gab1_bat3_data_fabricacao: string | null
          gab1_bat3_estado: string | null
          gab1_bat3_fabricante: string | null
          gab1_bat3_tipo: string | null
          gab1_bat4_capacidade: string | null
          gab1_bat4_colada: string | null
          gab1_bat4_com_gradil: string | null
          gab1_bat4_data_fabricacao: string | null
          gab1_bat4_estado: string | null
          gab1_bat4_fabricante: string | null
          gab1_bat4_tipo: string | null
          gab1_bat5_capacidade: string | null
          gab1_bat5_colada: string | null
          gab1_bat5_com_gradil: string | null
          gab1_bat5_data_fabricacao: string | null
          gab1_bat5_estado: string | null
          gab1_bat5_fabricante: string | null
          gab1_bat5_tipo: string | null
          gab1_bat6_capacidade: string | null
          gab1_bat6_colada: string | null
          gab1_bat6_com_gradil: string | null
          gab1_bat6_data_fabricacao: string | null
          gab1_bat6_estado: string | null
          gab1_bat6_fabricante: string | null
          gab1_bat6_tipo: string | null
          gab1_bat7_capacidade: string | null
          gab1_bat7_colada: string | null
          gab1_bat7_com_gradil: string | null
          gab1_bat7_data_fabricacao: string | null
          gab1_bat7_estado: string | null
          gab1_bat7_fabricante: string | null
          gab1_bat7_tipo: string | null
          gab1_bat8_capacidade: string | null
          gab1_bat8_colada: string | null
          gab1_bat8_com_gradil: string | null
          gab1_bat8_data_fabricacao: string | null
          gab1_bat8_estado: string | null
          gab1_bat8_fabricante: string | null
          gab1_bat8_tipo: string | null
          gab1_bat9_capacidade: string | null
          gab1_bat9_colada: string | null
          gab1_bat9_com_gradil: string | null
          gab1_bat9_data_fabricacao: string | null
          gab1_bat9_estado: string | null
          gab1_bat9_fabricante: string | null
          gab1_bat9_tipo: string | null
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
          gab1_fcc_qtd_ur_instaladas: string | null
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
          gab2_ativo: string | null
          gab2_bancos_interligados: string | null
          gab2_bat_foto: string | null
          gab2_bat1_capacidade: string | null
          gab2_bat1_colada: string | null
          gab2_bat1_com_gradil: string | null
          gab2_bat1_data_fabricacao: string | null
          gab2_bat1_estado: string | null
          gab2_bat1_fabricante: string | null
          gab2_bat1_tipo: string | null
          gab2_bat10_capacidade: string | null
          gab2_bat10_colada: string | null
          gab2_bat10_com_gradil: string | null
          gab2_bat10_data_fabricacao: string | null
          gab2_bat10_estado: string | null
          gab2_bat10_fabricante: string | null
          gab2_bat10_tipo: string | null
          gab2_bat11_capacidade: string | null
          gab2_bat11_colada: string | null
          gab2_bat11_com_gradil: string | null
          gab2_bat11_data_fabricacao: string | null
          gab2_bat11_estado: string | null
          gab2_bat11_fabricante: string | null
          gab2_bat11_tipo: string | null
          gab2_bat12_capacidade: string | null
          gab2_bat12_colada: string | null
          gab2_bat12_com_gradil: string | null
          gab2_bat12_data_fabricacao: string | null
          gab2_bat12_estado: string | null
          gab2_bat12_fabricante: string | null
          gab2_bat12_tipo: string | null
          gab2_bat2_capacidade: string | null
          gab2_bat2_colada: string | null
          gab2_bat2_com_gradil: string | null
          gab2_bat2_data_fabricacao: string | null
          gab2_bat2_estado: string | null
          gab2_bat2_fabricante: string | null
          gab2_bat2_tipo: string | null
          gab2_bat3_capacidade: string | null
          gab2_bat3_colada: string | null
          gab2_bat3_com_gradil: string | null
          gab2_bat3_data_fabricacao: string | null
          gab2_bat3_estado: string | null
          gab2_bat3_fabricante: string | null
          gab2_bat3_tipo: string | null
          gab2_bat4_capacidade: string | null
          gab2_bat4_colada: string | null
          gab2_bat4_com_gradil: string | null
          gab2_bat4_data_fabricacao: string | null
          gab2_bat4_estado: string | null
          gab2_bat4_fabricante: string | null
          gab2_bat4_tipo: string | null
          gab2_bat5_capacidade: string | null
          gab2_bat5_colada: string | null
          gab2_bat5_com_gradil: string | null
          gab2_bat5_data_fabricacao: string | null
          gab2_bat5_estado: string | null
          gab2_bat5_fabricante: string | null
          gab2_bat5_tipo: string | null
          gab2_bat6_capacidade: string | null
          gab2_bat6_colada: string | null
          gab2_bat6_com_gradil: string | null
          gab2_bat6_data_fabricacao: string | null
          gab2_bat6_estado: string | null
          gab2_bat6_fabricante: string | null
          gab2_bat6_tipo: string | null
          gab2_bat7_capacidade: string | null
          gab2_bat7_colada: string | null
          gab2_bat7_com_gradil: string | null
          gab2_bat7_data_fabricacao: string | null
          gab2_bat7_estado: string | null
          gab2_bat7_fabricante: string | null
          gab2_bat7_tipo: string | null
          gab2_bat8_capacidade: string | null
          gab2_bat8_colada: string | null
          gab2_bat8_com_gradil: string | null
          gab2_bat8_data_fabricacao: string | null
          gab2_bat8_estado: string | null
          gab2_bat8_fabricante: string | null
          gab2_bat8_tipo: string | null
          gab2_bat9_capacidade: string | null
          gab2_bat9_colada: string | null
          gab2_bat9_com_gradil: string | null
          gab2_bat9_data_fabricacao: string | null
          gab2_bat9_estado: string | null
          gab2_bat9_fabricante: string | null
          gab2_bat9_tipo: string | null
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
          gab2_fcc_qtd_ur_instaladas: string | null
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
          gab3_ativo: string | null
          gab3_bancos_interligados: string | null
          gab3_bat_foto: string | null
          gab3_bat1_capacidade: string | null
          gab3_bat1_colada: string | null
          gab3_bat1_com_gradil: string | null
          gab3_bat1_data_fabricacao: string | null
          gab3_bat1_estado: string | null
          gab3_bat1_fabricante: string | null
          gab3_bat1_tipo: string | null
          gab3_bat10_capacidade: string | null
          gab3_bat10_colada: string | null
          gab3_bat10_com_gradil: string | null
          gab3_bat10_data_fabricacao: string | null
          gab3_bat10_estado: string | null
          gab3_bat10_fabricante: string | null
          gab3_bat10_tipo: string | null
          gab3_bat11_capacidade: string | null
          gab3_bat11_colada: string | null
          gab3_bat11_com_gradil: string | null
          gab3_bat11_data_fabricacao: string | null
          gab3_bat11_estado: string | null
          gab3_bat11_fabricante: string | null
          gab3_bat11_tipo: string | null
          gab3_bat12_capacidade: string | null
          gab3_bat12_colada: string | null
          gab3_bat12_com_gradil: string | null
          gab3_bat12_data_fabricacao: string | null
          gab3_bat12_estado: string | null
          gab3_bat12_fabricante: string | null
          gab3_bat12_tipo: string | null
          gab3_bat2_capacidade: string | null
          gab3_bat2_colada: string | null
          gab3_bat2_com_gradil: string | null
          gab3_bat2_data_fabricacao: string | null
          gab3_bat2_estado: string | null
          gab3_bat2_fabricante: string | null
          gab3_bat2_tipo: string | null
          gab3_bat3_capacidade: string | null
          gab3_bat3_colada: string | null
          gab3_bat3_com_gradil: string | null
          gab3_bat3_data_fabricacao: string | null
          gab3_bat3_estado: string | null
          gab3_bat3_fabricante: string | null
          gab3_bat3_tipo: string | null
          gab3_bat4_capacidade: string | null
          gab3_bat4_colada: string | null
          gab3_bat4_com_gradil: string | null
          gab3_bat4_data_fabricacao: string | null
          gab3_bat4_estado: string | null
          gab3_bat4_fabricante: string | null
          gab3_bat4_tipo: string | null
          gab3_bat5_capacidade: string | null
          gab3_bat5_colada: string | null
          gab3_bat5_com_gradil: string | null
          gab3_bat5_data_fabricacao: string | null
          gab3_bat5_estado: string | null
          gab3_bat5_fabricante: string | null
          gab3_bat5_tipo: string | null
          gab3_bat6_capacidade: string | null
          gab3_bat6_colada: string | null
          gab3_bat6_com_gradil: string | null
          gab3_bat6_data_fabricacao: string | null
          gab3_bat6_estado: string | null
          gab3_bat6_fabricante: string | null
          gab3_bat6_tipo: string | null
          gab3_bat7_capacidade: string | null
          gab3_bat7_colada: string | null
          gab3_bat7_com_gradil: string | null
          gab3_bat7_data_fabricacao: string | null
          gab3_bat7_estado: string | null
          gab3_bat7_fabricante: string | null
          gab3_bat7_tipo: string | null
          gab3_bat8_capacidade: string | null
          gab3_bat8_colada: string | null
          gab3_bat8_com_gradil: string | null
          gab3_bat8_data_fabricacao: string | null
          gab3_bat8_estado: string | null
          gab3_bat8_fabricante: string | null
          gab3_bat8_tipo: string | null
          gab3_bat9_capacidade: string | null
          gab3_bat9_colada: string | null
          gab3_bat9_com_gradil: string | null
          gab3_bat9_data_fabricacao: string | null
          gab3_bat9_estado: string | null
          gab3_bat9_fabricante: string | null
          gab3_bat9_tipo: string | null
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
          gab3_fcc_qtd_ur_instaladas: string | null
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
          gab4_ativo: string | null
          gab4_bancos_interligados: string | null
          gab4_bat_foto: string | null
          gab4_bat1_capacidade: string | null
          gab4_bat1_colada: string | null
          gab4_bat1_com_gradil: string | null
          gab4_bat1_data_fabricacao: string | null
          gab4_bat1_estado: string | null
          gab4_bat1_fabricante: string | null
          gab4_bat1_tipo: string | null
          gab4_bat10_capacidade: string | null
          gab4_bat10_colada: string | null
          gab4_bat10_com_gradil: string | null
          gab4_bat10_data_fabricacao: string | null
          gab4_bat10_estado: string | null
          gab4_bat10_fabricante: string | null
          gab4_bat10_tipo: string | null
          gab4_bat11_capacidade: string | null
          gab4_bat11_colada: string | null
          gab4_bat11_com_gradil: string | null
          gab4_bat11_data_fabricacao: string | null
          gab4_bat11_estado: string | null
          gab4_bat11_fabricante: string | null
          gab4_bat11_tipo: string | null
          gab4_bat12_capacidade: string | null
          gab4_bat12_colada: string | null
          gab4_bat12_com_gradil: string | null
          gab4_bat12_data_fabricacao: string | null
          gab4_bat12_estado: string | null
          gab4_bat12_fabricante: string | null
          gab4_bat12_tipo: string | null
          gab4_bat2_capacidade: string | null
          gab4_bat2_colada: string | null
          gab4_bat2_com_gradil: string | null
          gab4_bat2_data_fabricacao: string | null
          gab4_bat2_estado: string | null
          gab4_bat2_fabricante: string | null
          gab4_bat2_tipo: string | null
          gab4_bat3_capacidade: string | null
          gab4_bat3_colada: string | null
          gab4_bat3_com_gradil: string | null
          gab4_bat3_data_fabricacao: string | null
          gab4_bat3_estado: string | null
          gab4_bat3_fabricante: string | null
          gab4_bat3_tipo: string | null
          gab4_bat4_capacidade: string | null
          gab4_bat4_colada: string | null
          gab4_bat4_com_gradil: string | null
          gab4_bat4_data_fabricacao: string | null
          gab4_bat4_estado: string | null
          gab4_bat4_fabricante: string | null
          gab4_bat4_tipo: string | null
          gab4_bat5_capacidade: string | null
          gab4_bat5_colada: string | null
          gab4_bat5_com_gradil: string | null
          gab4_bat5_data_fabricacao: string | null
          gab4_bat5_estado: string | null
          gab4_bat5_fabricante: string | null
          gab4_bat5_tipo: string | null
          gab4_bat6_capacidade: string | null
          gab4_bat6_colada: string | null
          gab4_bat6_com_gradil: string | null
          gab4_bat6_data_fabricacao: string | null
          gab4_bat6_estado: string | null
          gab4_bat6_fabricante: string | null
          gab4_bat6_tipo: string | null
          gab4_bat7_capacidade: string | null
          gab4_bat7_colada: string | null
          gab4_bat7_com_gradil: string | null
          gab4_bat7_data_fabricacao: string | null
          gab4_bat7_estado: string | null
          gab4_bat7_fabricante: string | null
          gab4_bat7_tipo: string | null
          gab4_bat8_capacidade: string | null
          gab4_bat8_colada: string | null
          gab4_bat8_com_gradil: string | null
          gab4_bat8_data_fabricacao: string | null
          gab4_bat8_estado: string | null
          gab4_bat8_fabricante: string | null
          gab4_bat8_tipo: string | null
          gab4_bat9_capacidade: string | null
          gab4_bat9_colada: string | null
          gab4_bat9_com_gradil: string | null
          gab4_bat9_data_fabricacao: string | null
          gab4_bat9_estado: string | null
          gab4_bat9_fabricante: string | null
          gab4_bat9_tipo: string | null
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
          gab4_fcc_qtd_ur_instaladas: string | null
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
          gab5_ativo: string | null
          gab5_bancos_interligados: string | null
          gab5_bat_foto: string | null
          gab5_bat1_capacidade: string | null
          gab5_bat1_colada: string | null
          gab5_bat1_com_gradil: string | null
          gab5_bat1_data_fabricacao: string | null
          gab5_bat1_estado: string | null
          gab5_bat1_fabricante: string | null
          gab5_bat1_tipo: string | null
          gab5_bat10_capacidade: string | null
          gab5_bat10_colada: string | null
          gab5_bat10_com_gradil: string | null
          gab5_bat10_data_fabricacao: string | null
          gab5_bat10_estado: string | null
          gab5_bat10_fabricante: string | null
          gab5_bat10_tipo: string | null
          gab5_bat11_capacidade: string | null
          gab5_bat11_colada: string | null
          gab5_bat11_com_gradil: string | null
          gab5_bat11_data_fabricacao: string | null
          gab5_bat11_estado: string | null
          gab5_bat11_fabricante: string | null
          gab5_bat11_tipo: string | null
          gab5_bat12_capacidade: string | null
          gab5_bat12_colada: string | null
          gab5_bat12_com_gradil: string | null
          gab5_bat12_data_fabricacao: string | null
          gab5_bat12_estado: string | null
          gab5_bat12_fabricante: string | null
          gab5_bat12_tipo: string | null
          gab5_bat2_capacidade: string | null
          gab5_bat2_colada: string | null
          gab5_bat2_com_gradil: string | null
          gab5_bat2_data_fabricacao: string | null
          gab5_bat2_estado: string | null
          gab5_bat2_fabricante: string | null
          gab5_bat2_tipo: string | null
          gab5_bat3_capacidade: string | null
          gab5_bat3_colada: string | null
          gab5_bat3_com_gradil: string | null
          gab5_bat3_data_fabricacao: string | null
          gab5_bat3_estado: string | null
          gab5_bat3_fabricante: string | null
          gab5_bat3_tipo: string | null
          gab5_bat4_capacidade: string | null
          gab5_bat4_colada: string | null
          gab5_bat4_com_gradil: string | null
          gab5_bat4_data_fabricacao: string | null
          gab5_bat4_estado: string | null
          gab5_bat4_fabricante: string | null
          gab5_bat4_tipo: string | null
          gab5_bat5_capacidade: string | null
          gab5_bat5_colada: string | null
          gab5_bat5_com_gradil: string | null
          gab5_bat5_data_fabricacao: string | null
          gab5_bat5_estado: string | null
          gab5_bat5_fabricante: string | null
          gab5_bat5_tipo: string | null
          gab5_bat6_capacidade: string | null
          gab5_bat6_colada: string | null
          gab5_bat6_com_gradil: string | null
          gab5_bat6_data_fabricacao: string | null
          gab5_bat6_estado: string | null
          gab5_bat6_fabricante: string | null
          gab5_bat6_tipo: string | null
          gab5_bat7_capacidade: string | null
          gab5_bat7_colada: string | null
          gab5_bat7_com_gradil: string | null
          gab5_bat7_data_fabricacao: string | null
          gab5_bat7_estado: string | null
          gab5_bat7_fabricante: string | null
          gab5_bat7_tipo: string | null
          gab5_bat8_capacidade: string | null
          gab5_bat8_colada: string | null
          gab5_bat8_com_gradil: string | null
          gab5_bat8_data_fabricacao: string | null
          gab5_bat8_estado: string | null
          gab5_bat8_fabricante: string | null
          gab5_bat8_tipo: string | null
          gab5_bat9_capacidade: string | null
          gab5_bat9_colada: string | null
          gab5_bat9_com_gradil: string | null
          gab5_bat9_data_fabricacao: string | null
          gab5_bat9_estado: string | null
          gab5_bat9_fabricante: string | null
          gab5_bat9_tipo: string | null
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
          gab5_fcc_qtd_ur_instaladas: string | null
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
          gab6_ativo: string | null
          gab6_bancos_interligados: string | null
          gab6_bat_foto: string | null
          gab6_bat1_capacidade: string | null
          gab6_bat1_colada: string | null
          gab6_bat1_com_gradil: string | null
          gab6_bat1_data_fabricacao: string | null
          gab6_bat1_estado: string | null
          gab6_bat1_fabricante: string | null
          gab6_bat1_tipo: string | null
          gab6_bat10_capacidade: string | null
          gab6_bat10_colada: string | null
          gab6_bat10_com_gradil: string | null
          gab6_bat10_data_fabricacao: string | null
          gab6_bat10_estado: string | null
          gab6_bat10_fabricante: string | null
          gab6_bat10_tipo: string | null
          gab6_bat11_capacidade: string | null
          gab6_bat11_colada: string | null
          gab6_bat11_com_gradil: string | null
          gab6_bat11_data_fabricacao: string | null
          gab6_bat11_estado: string | null
          gab6_bat11_fabricante: string | null
          gab6_bat11_tipo: string | null
          gab6_bat12_capacidade: string | null
          gab6_bat12_colada: string | null
          gab6_bat12_com_gradil: string | null
          gab6_bat12_data_fabricacao: string | null
          gab6_bat12_estado: string | null
          gab6_bat12_fabricante: string | null
          gab6_bat12_tipo: string | null
          gab6_bat2_capacidade: string | null
          gab6_bat2_colada: string | null
          gab6_bat2_com_gradil: string | null
          gab6_bat2_data_fabricacao: string | null
          gab6_bat2_estado: string | null
          gab6_bat2_fabricante: string | null
          gab6_bat2_tipo: string | null
          gab6_bat3_capacidade: string | null
          gab6_bat3_colada: string | null
          gab6_bat3_com_gradil: string | null
          gab6_bat3_data_fabricacao: string | null
          gab6_bat3_estado: string | null
          gab6_bat3_fabricante: string | null
          gab6_bat3_tipo: string | null
          gab6_bat4_capacidade: string | null
          gab6_bat4_colada: string | null
          gab6_bat4_com_gradil: string | null
          gab6_bat4_data_fabricacao: string | null
          gab6_bat4_estado: string | null
          gab6_bat4_fabricante: string | null
          gab6_bat4_tipo: string | null
          gab6_bat5_capacidade: string | null
          gab6_bat5_colada: string | null
          gab6_bat5_com_gradil: string | null
          gab6_bat5_data_fabricacao: string | null
          gab6_bat5_estado: string | null
          gab6_bat5_fabricante: string | null
          gab6_bat5_tipo: string | null
          gab6_bat6_capacidade: string | null
          gab6_bat6_colada: string | null
          gab6_bat6_com_gradil: string | null
          gab6_bat6_data_fabricacao: string | null
          gab6_bat6_estado: string | null
          gab6_bat6_fabricante: string | null
          gab6_bat6_tipo: string | null
          gab6_bat7_capacidade: string | null
          gab6_bat7_colada: string | null
          gab6_bat7_com_gradil: string | null
          gab6_bat7_data_fabricacao: string | null
          gab6_bat7_estado: string | null
          gab6_bat7_fabricante: string | null
          gab6_bat7_tipo: string | null
          gab6_bat8_capacidade: string | null
          gab6_bat8_colada: string | null
          gab6_bat8_com_gradil: string | null
          gab6_bat8_data_fabricacao: string | null
          gab6_bat8_estado: string | null
          gab6_bat8_fabricante: string | null
          gab6_bat8_tipo: string | null
          gab6_bat9_capacidade: string | null
          gab6_bat9_colada: string | null
          gab6_bat9_com_gradil: string | null
          gab6_bat9_data_fabricacao: string | null
          gab6_bat9_estado: string | null
          gab6_bat9_fabricante: string | null
          gab6_bat9_tipo: string | null
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
          gab6_fcc_qtd_ur_instaladas: string | null
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
          gab7_ativo: string | null
          gab7_bancos_interligados: string | null
          gab7_bat_foto: string | null
          gab7_bat1_capacidade: string | null
          gab7_bat1_colada: string | null
          gab7_bat1_com_gradil: string | null
          gab7_bat1_data_fabricacao: string | null
          gab7_bat1_estado: string | null
          gab7_bat1_fabricante: string | null
          gab7_bat1_tipo: string | null
          gab7_bat10_capacidade: string | null
          gab7_bat10_colada: string | null
          gab7_bat10_com_gradil: string | null
          gab7_bat10_data_fabricacao: string | null
          gab7_bat10_estado: string | null
          gab7_bat10_fabricante: string | null
          gab7_bat10_tipo: string | null
          gab7_bat11_capacidade: string | null
          gab7_bat11_colada: string | null
          gab7_bat11_com_gradil: string | null
          gab7_bat11_data_fabricacao: string | null
          gab7_bat11_estado: string | null
          gab7_bat11_fabricante: string | null
          gab7_bat11_tipo: string | null
          gab7_bat12_capacidade: string | null
          gab7_bat12_colada: string | null
          gab7_bat12_com_gradil: string | null
          gab7_bat12_data_fabricacao: string | null
          gab7_bat12_estado: string | null
          gab7_bat12_fabricante: string | null
          gab7_bat12_tipo: string | null
          gab7_bat2_capacidade: string | null
          gab7_bat2_colada: string | null
          gab7_bat2_com_gradil: string | null
          gab7_bat2_data_fabricacao: string | null
          gab7_bat2_estado: string | null
          gab7_bat2_fabricante: string | null
          gab7_bat2_tipo: string | null
          gab7_bat3_capacidade: string | null
          gab7_bat3_colada: string | null
          gab7_bat3_com_gradil: string | null
          gab7_bat3_data_fabricacao: string | null
          gab7_bat3_estado: string | null
          gab7_bat3_fabricante: string | null
          gab7_bat3_tipo: string | null
          gab7_bat4_capacidade: string | null
          gab7_bat4_colada: string | null
          gab7_bat4_com_gradil: string | null
          gab7_bat4_data_fabricacao: string | null
          gab7_bat4_estado: string | null
          gab7_bat4_fabricante: string | null
          gab7_bat4_tipo: string | null
          gab7_bat5_capacidade: string | null
          gab7_bat5_colada: string | null
          gab7_bat5_com_gradil: string | null
          gab7_bat5_data_fabricacao: string | null
          gab7_bat5_estado: string | null
          gab7_bat5_fabricante: string | null
          gab7_bat5_tipo: string | null
          gab7_bat6_capacidade: string | null
          gab7_bat6_colada: string | null
          gab7_bat6_com_gradil: string | null
          gab7_bat6_data_fabricacao: string | null
          gab7_bat6_estado: string | null
          gab7_bat6_fabricante: string | null
          gab7_bat6_tipo: string | null
          gab7_bat7_capacidade: string | null
          gab7_bat7_colada: string | null
          gab7_bat7_com_gradil: string | null
          gab7_bat7_data_fabricacao: string | null
          gab7_bat7_estado: string | null
          gab7_bat7_fabricante: string | null
          gab7_bat7_tipo: string | null
          gab7_bat8_capacidade: string | null
          gab7_bat8_colada: string | null
          gab7_bat8_com_gradil: string | null
          gab7_bat8_data_fabricacao: string | null
          gab7_bat8_estado: string | null
          gab7_bat8_fabricante: string | null
          gab7_bat8_tipo: string | null
          gab7_bat9_capacidade: string | null
          gab7_bat9_colada: string | null
          gab7_bat9_com_gradil: string | null
          gab7_bat9_data_fabricacao: string | null
          gab7_bat9_estado: string | null
          gab7_bat9_fabricante: string | null
          gab7_bat9_tipo: string | null
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
          gab7_fcc_qtd_ur_instaladas: string | null
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
          geo_capturado_em: string | null
          geo_endereco: string | null
          geo_latitude: number | null
          geo_longitude: number | null
          gmg_alarme_ativo: string | null
          gmg_autonomia: number | null
          gmg_combustivel: string | null
          gmg_existe: string | null
          gmg_fabricante: string | null
          gmg_foto_alarme: string | null
          gmg_foto_painel: string | null
          gmg_potencia: string | null
          gmg_status: string | null
          gmg_ultimo_teste: string | null
          id: string
          observacao_foto_url: string | null
          observacoes: string | null
          operadora: string | null
          panoramic_photo_url: string | null
          pdf_file_path: string | null
          site_code: string
          state_uf: string | null
          technician_name: string | null
          torre_aterramento: string | null
          torre_esteiramento_horizontal: string | null
          torre_esteiramento_vertical: string | null
          torre_foto_aterramento: string | null
          torre_foto_esteiramento_horizontal: string | null
          torre_foto_esteiramento_vertical: string | null
          torre_foto_fibras_protegidas: string | null
          torre_foto_ninhos: string | null
          torre_foto_zeladoria: string | null
          torre_housekeeping: string | null
          torre_ninhos: string | null
          torre_protecao_fibra: string | null
          total_cabinets: number
          user_id: string | null
        }
        Insert: {
          assinatura_digital?: string | null
          baterias_tipo_ia?: Json | null
          created_at?: string
          created_date: string
          created_time: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          energia_disjuntor_entrada?: number | null
          energia_disjuntor_qdca?: number | null
          energia_fabricante?: string | null
          energia_fabricante_outra?: string | null
          energia_foto_cabos?: string | null
          energia_foto_placa?: string | null
          energia_foto_quadro_geral?: string | null
          energia_foto_relogio?: string | null
          energia_foto_transformador?: string | null
          energia_potencia_kva?: number | null
          energia_potencia_transformador?: string | null
          energia_protegido_cadeado?: string | null
          energia_protegido_gradil?: string | null
          energia_tensao_entrada?: string | null
          energia_tipo_quadro?: string | null
          energia_transformador_ok?: string | null
          energia_unidade_consumidora?: string | null
          excel_file_path?: string | null
          fibra_abord1_descricao?: string | null
          fibra_abord1_foto?: string | null
          fibra_abord1_tipo?: string | null
          fibra_abord2_descricao?: string | null
          fibra_abord2_foto?: string | null
          fibra_abord2_tipo?: string | null
          fibra_abord3_descricao?: string | null
          fibra_abord3_foto?: string | null
          fibra_abord3_tipo?: string | null
          fibra_abord4_descricao?: string | null
          fibra_abord4_foto?: string | null
          fibra_abord4_tipo?: string | null
          fibra_caixas_passagem_qtd?: number | null
          fibra_caixas_subterraneas_qtd?: number | null
          fibra_dgo1_capacidade?: string | null
          fibra_dgo1_cordoes?: string | null
          fibra_dgo1_cordoes_foto?: string | null
          fibra_dgo1_foto?: string | null
          fibra_dgo1_id?: string | null
          fibra_dgo2_capacidade?: string | null
          fibra_dgo2_cordoes?: string | null
          fibra_dgo2_cordoes_foto?: string | null
          fibra_dgo2_foto?: string | null
          fibra_dgo2_id?: string | null
          fibra_dgo3_capacidade?: string | null
          fibra_dgo3_cordoes?: string | null
          fibra_dgo3_cordoes_foto?: string | null
          fibra_dgo3_foto?: string | null
          fibra_dgo3_id?: string | null
          fibra_dgo4_capacidade?: string | null
          fibra_dgo4_cordoes?: string | null
          fibra_dgo4_cordoes_foto?: string | null
          fibra_dgo4_foto?: string | null
          fibra_dgo4_id?: string | null
          fibra_dgos_nok_qtd?: number | null
          fibra_dgos_ok_qtd?: number | null
          fibra_dgos_qtd?: number | null
          fibra_foto_caixas_passagem?: string | null
          fibra_foto_caixas_subterraneas?: string | null
          fibra_foto_subidas_laterais?: string | null
          fibra_qtd_abordagens?: number | null
          fibra_subidas_laterais_qtd?: number | null
          fotos_extras?: Json | null
          gab1_ac1_modelo?: string | null
          gab1_ac1_status?: string | null
          gab1_ac2_modelo?: string | null
          gab1_ac2_status?: string | null
          gab1_ac3_modelo?: string | null
          gab1_ac3_status?: string | null
          gab1_ac4_modelo?: string | null
          gab1_ac4_status?: string | null
          gab1_alarme_status?: string | null
          gab1_ativo?: string | null
          gab1_bancos_interligados?: string | null
          gab1_bat_foto?: string | null
          gab1_bat1_capacidade?: string | null
          gab1_bat1_colada?: string | null
          gab1_bat1_com_gradil?: string | null
          gab1_bat1_data_fabricacao?: string | null
          gab1_bat1_estado?: string | null
          gab1_bat1_fabricante?: string | null
          gab1_bat1_tipo?: string | null
          gab1_bat10_capacidade?: string | null
          gab1_bat10_colada?: string | null
          gab1_bat10_com_gradil?: string | null
          gab1_bat10_data_fabricacao?: string | null
          gab1_bat10_estado?: string | null
          gab1_bat10_fabricante?: string | null
          gab1_bat10_tipo?: string | null
          gab1_bat11_capacidade?: string | null
          gab1_bat11_colada?: string | null
          gab1_bat11_com_gradil?: string | null
          gab1_bat11_data_fabricacao?: string | null
          gab1_bat11_estado?: string | null
          gab1_bat11_fabricante?: string | null
          gab1_bat11_tipo?: string | null
          gab1_bat12_capacidade?: string | null
          gab1_bat12_colada?: string | null
          gab1_bat12_com_gradil?: string | null
          gab1_bat12_data_fabricacao?: string | null
          gab1_bat12_estado?: string | null
          gab1_bat12_fabricante?: string | null
          gab1_bat12_tipo?: string | null
          gab1_bat2_capacidade?: string | null
          gab1_bat2_colada?: string | null
          gab1_bat2_com_gradil?: string | null
          gab1_bat2_data_fabricacao?: string | null
          gab1_bat2_estado?: string | null
          gab1_bat2_fabricante?: string | null
          gab1_bat2_tipo?: string | null
          gab1_bat3_capacidade?: string | null
          gab1_bat3_colada?: string | null
          gab1_bat3_com_gradil?: string | null
          gab1_bat3_data_fabricacao?: string | null
          gab1_bat3_estado?: string | null
          gab1_bat3_fabricante?: string | null
          gab1_bat3_tipo?: string | null
          gab1_bat4_capacidade?: string | null
          gab1_bat4_colada?: string | null
          gab1_bat4_com_gradil?: string | null
          gab1_bat4_data_fabricacao?: string | null
          gab1_bat4_estado?: string | null
          gab1_bat4_fabricante?: string | null
          gab1_bat4_tipo?: string | null
          gab1_bat5_capacidade?: string | null
          gab1_bat5_colada?: string | null
          gab1_bat5_com_gradil?: string | null
          gab1_bat5_data_fabricacao?: string | null
          gab1_bat5_estado?: string | null
          gab1_bat5_fabricante?: string | null
          gab1_bat5_tipo?: string | null
          gab1_bat6_capacidade?: string | null
          gab1_bat6_colada?: string | null
          gab1_bat6_com_gradil?: string | null
          gab1_bat6_data_fabricacao?: string | null
          gab1_bat6_estado?: string | null
          gab1_bat6_fabricante?: string | null
          gab1_bat6_tipo?: string | null
          gab1_bat7_capacidade?: string | null
          gab1_bat7_colada?: string | null
          gab1_bat7_com_gradil?: string | null
          gab1_bat7_data_fabricacao?: string | null
          gab1_bat7_estado?: string | null
          gab1_bat7_fabricante?: string | null
          gab1_bat7_tipo?: string | null
          gab1_bat8_capacidade?: string | null
          gab1_bat8_colada?: string | null
          gab1_bat8_com_gradil?: string | null
          gab1_bat8_data_fabricacao?: string | null
          gab1_bat8_estado?: string | null
          gab1_bat8_fabricante?: string | null
          gab1_bat8_tipo?: string | null
          gab1_bat9_capacidade?: string | null
          gab1_bat9_colada?: string | null
          gab1_bat9_com_gradil?: string | null
          gab1_bat9_data_fabricacao?: string | null
          gab1_bat9_estado?: string | null
          gab1_bat9_fabricante?: string | null
          gab1_bat9_tipo?: string | null
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
          gab1_fcc_qtd_ur_instaladas?: string | null
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
          gab2_ativo?: string | null
          gab2_bancos_interligados?: string | null
          gab2_bat_foto?: string | null
          gab2_bat1_capacidade?: string | null
          gab2_bat1_colada?: string | null
          gab2_bat1_com_gradil?: string | null
          gab2_bat1_data_fabricacao?: string | null
          gab2_bat1_estado?: string | null
          gab2_bat1_fabricante?: string | null
          gab2_bat1_tipo?: string | null
          gab2_bat10_capacidade?: string | null
          gab2_bat10_colada?: string | null
          gab2_bat10_com_gradil?: string | null
          gab2_bat10_data_fabricacao?: string | null
          gab2_bat10_estado?: string | null
          gab2_bat10_fabricante?: string | null
          gab2_bat10_tipo?: string | null
          gab2_bat11_capacidade?: string | null
          gab2_bat11_colada?: string | null
          gab2_bat11_com_gradil?: string | null
          gab2_bat11_data_fabricacao?: string | null
          gab2_bat11_estado?: string | null
          gab2_bat11_fabricante?: string | null
          gab2_bat11_tipo?: string | null
          gab2_bat12_capacidade?: string | null
          gab2_bat12_colada?: string | null
          gab2_bat12_com_gradil?: string | null
          gab2_bat12_data_fabricacao?: string | null
          gab2_bat12_estado?: string | null
          gab2_bat12_fabricante?: string | null
          gab2_bat12_tipo?: string | null
          gab2_bat2_capacidade?: string | null
          gab2_bat2_colada?: string | null
          gab2_bat2_com_gradil?: string | null
          gab2_bat2_data_fabricacao?: string | null
          gab2_bat2_estado?: string | null
          gab2_bat2_fabricante?: string | null
          gab2_bat2_tipo?: string | null
          gab2_bat3_capacidade?: string | null
          gab2_bat3_colada?: string | null
          gab2_bat3_com_gradil?: string | null
          gab2_bat3_data_fabricacao?: string | null
          gab2_bat3_estado?: string | null
          gab2_bat3_fabricante?: string | null
          gab2_bat3_tipo?: string | null
          gab2_bat4_capacidade?: string | null
          gab2_bat4_colada?: string | null
          gab2_bat4_com_gradil?: string | null
          gab2_bat4_data_fabricacao?: string | null
          gab2_bat4_estado?: string | null
          gab2_bat4_fabricante?: string | null
          gab2_bat4_tipo?: string | null
          gab2_bat5_capacidade?: string | null
          gab2_bat5_colada?: string | null
          gab2_bat5_com_gradil?: string | null
          gab2_bat5_data_fabricacao?: string | null
          gab2_bat5_estado?: string | null
          gab2_bat5_fabricante?: string | null
          gab2_bat5_tipo?: string | null
          gab2_bat6_capacidade?: string | null
          gab2_bat6_colada?: string | null
          gab2_bat6_com_gradil?: string | null
          gab2_bat6_data_fabricacao?: string | null
          gab2_bat6_estado?: string | null
          gab2_bat6_fabricante?: string | null
          gab2_bat6_tipo?: string | null
          gab2_bat7_capacidade?: string | null
          gab2_bat7_colada?: string | null
          gab2_bat7_com_gradil?: string | null
          gab2_bat7_data_fabricacao?: string | null
          gab2_bat7_estado?: string | null
          gab2_bat7_fabricante?: string | null
          gab2_bat7_tipo?: string | null
          gab2_bat8_capacidade?: string | null
          gab2_bat8_colada?: string | null
          gab2_bat8_com_gradil?: string | null
          gab2_bat8_data_fabricacao?: string | null
          gab2_bat8_estado?: string | null
          gab2_bat8_fabricante?: string | null
          gab2_bat8_tipo?: string | null
          gab2_bat9_capacidade?: string | null
          gab2_bat9_colada?: string | null
          gab2_bat9_com_gradil?: string | null
          gab2_bat9_data_fabricacao?: string | null
          gab2_bat9_estado?: string | null
          gab2_bat9_fabricante?: string | null
          gab2_bat9_tipo?: string | null
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
          gab2_fcc_qtd_ur_instaladas?: string | null
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
          gab3_ativo?: string | null
          gab3_bancos_interligados?: string | null
          gab3_bat_foto?: string | null
          gab3_bat1_capacidade?: string | null
          gab3_bat1_colada?: string | null
          gab3_bat1_com_gradil?: string | null
          gab3_bat1_data_fabricacao?: string | null
          gab3_bat1_estado?: string | null
          gab3_bat1_fabricante?: string | null
          gab3_bat1_tipo?: string | null
          gab3_bat10_capacidade?: string | null
          gab3_bat10_colada?: string | null
          gab3_bat10_com_gradil?: string | null
          gab3_bat10_data_fabricacao?: string | null
          gab3_bat10_estado?: string | null
          gab3_bat10_fabricante?: string | null
          gab3_bat10_tipo?: string | null
          gab3_bat11_capacidade?: string | null
          gab3_bat11_colada?: string | null
          gab3_bat11_com_gradil?: string | null
          gab3_bat11_data_fabricacao?: string | null
          gab3_bat11_estado?: string | null
          gab3_bat11_fabricante?: string | null
          gab3_bat11_tipo?: string | null
          gab3_bat12_capacidade?: string | null
          gab3_bat12_colada?: string | null
          gab3_bat12_com_gradil?: string | null
          gab3_bat12_data_fabricacao?: string | null
          gab3_bat12_estado?: string | null
          gab3_bat12_fabricante?: string | null
          gab3_bat12_tipo?: string | null
          gab3_bat2_capacidade?: string | null
          gab3_bat2_colada?: string | null
          gab3_bat2_com_gradil?: string | null
          gab3_bat2_data_fabricacao?: string | null
          gab3_bat2_estado?: string | null
          gab3_bat2_fabricante?: string | null
          gab3_bat2_tipo?: string | null
          gab3_bat3_capacidade?: string | null
          gab3_bat3_colada?: string | null
          gab3_bat3_com_gradil?: string | null
          gab3_bat3_data_fabricacao?: string | null
          gab3_bat3_estado?: string | null
          gab3_bat3_fabricante?: string | null
          gab3_bat3_tipo?: string | null
          gab3_bat4_capacidade?: string | null
          gab3_bat4_colada?: string | null
          gab3_bat4_com_gradil?: string | null
          gab3_bat4_data_fabricacao?: string | null
          gab3_bat4_estado?: string | null
          gab3_bat4_fabricante?: string | null
          gab3_bat4_tipo?: string | null
          gab3_bat5_capacidade?: string | null
          gab3_bat5_colada?: string | null
          gab3_bat5_com_gradil?: string | null
          gab3_bat5_data_fabricacao?: string | null
          gab3_bat5_estado?: string | null
          gab3_bat5_fabricante?: string | null
          gab3_bat5_tipo?: string | null
          gab3_bat6_capacidade?: string | null
          gab3_bat6_colada?: string | null
          gab3_bat6_com_gradil?: string | null
          gab3_bat6_data_fabricacao?: string | null
          gab3_bat6_estado?: string | null
          gab3_bat6_fabricante?: string | null
          gab3_bat6_tipo?: string | null
          gab3_bat7_capacidade?: string | null
          gab3_bat7_colada?: string | null
          gab3_bat7_com_gradil?: string | null
          gab3_bat7_data_fabricacao?: string | null
          gab3_bat7_estado?: string | null
          gab3_bat7_fabricante?: string | null
          gab3_bat7_tipo?: string | null
          gab3_bat8_capacidade?: string | null
          gab3_bat8_colada?: string | null
          gab3_bat8_com_gradil?: string | null
          gab3_bat8_data_fabricacao?: string | null
          gab3_bat8_estado?: string | null
          gab3_bat8_fabricante?: string | null
          gab3_bat8_tipo?: string | null
          gab3_bat9_capacidade?: string | null
          gab3_bat9_colada?: string | null
          gab3_bat9_com_gradil?: string | null
          gab3_bat9_data_fabricacao?: string | null
          gab3_bat9_estado?: string | null
          gab3_bat9_fabricante?: string | null
          gab3_bat9_tipo?: string | null
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
          gab3_fcc_qtd_ur_instaladas?: string | null
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
          gab4_ativo?: string | null
          gab4_bancos_interligados?: string | null
          gab4_bat_foto?: string | null
          gab4_bat1_capacidade?: string | null
          gab4_bat1_colada?: string | null
          gab4_bat1_com_gradil?: string | null
          gab4_bat1_data_fabricacao?: string | null
          gab4_bat1_estado?: string | null
          gab4_bat1_fabricante?: string | null
          gab4_bat1_tipo?: string | null
          gab4_bat10_capacidade?: string | null
          gab4_bat10_colada?: string | null
          gab4_bat10_com_gradil?: string | null
          gab4_bat10_data_fabricacao?: string | null
          gab4_bat10_estado?: string | null
          gab4_bat10_fabricante?: string | null
          gab4_bat10_tipo?: string | null
          gab4_bat11_capacidade?: string | null
          gab4_bat11_colada?: string | null
          gab4_bat11_com_gradil?: string | null
          gab4_bat11_data_fabricacao?: string | null
          gab4_bat11_estado?: string | null
          gab4_bat11_fabricante?: string | null
          gab4_bat11_tipo?: string | null
          gab4_bat12_capacidade?: string | null
          gab4_bat12_colada?: string | null
          gab4_bat12_com_gradil?: string | null
          gab4_bat12_data_fabricacao?: string | null
          gab4_bat12_estado?: string | null
          gab4_bat12_fabricante?: string | null
          gab4_bat12_tipo?: string | null
          gab4_bat2_capacidade?: string | null
          gab4_bat2_colada?: string | null
          gab4_bat2_com_gradil?: string | null
          gab4_bat2_data_fabricacao?: string | null
          gab4_bat2_estado?: string | null
          gab4_bat2_fabricante?: string | null
          gab4_bat2_tipo?: string | null
          gab4_bat3_capacidade?: string | null
          gab4_bat3_colada?: string | null
          gab4_bat3_com_gradil?: string | null
          gab4_bat3_data_fabricacao?: string | null
          gab4_bat3_estado?: string | null
          gab4_bat3_fabricante?: string | null
          gab4_bat3_tipo?: string | null
          gab4_bat4_capacidade?: string | null
          gab4_bat4_colada?: string | null
          gab4_bat4_com_gradil?: string | null
          gab4_bat4_data_fabricacao?: string | null
          gab4_bat4_estado?: string | null
          gab4_bat4_fabricante?: string | null
          gab4_bat4_tipo?: string | null
          gab4_bat5_capacidade?: string | null
          gab4_bat5_colada?: string | null
          gab4_bat5_com_gradil?: string | null
          gab4_bat5_data_fabricacao?: string | null
          gab4_bat5_estado?: string | null
          gab4_bat5_fabricante?: string | null
          gab4_bat5_tipo?: string | null
          gab4_bat6_capacidade?: string | null
          gab4_bat6_colada?: string | null
          gab4_bat6_com_gradil?: string | null
          gab4_bat6_data_fabricacao?: string | null
          gab4_bat6_estado?: string | null
          gab4_bat6_fabricante?: string | null
          gab4_bat6_tipo?: string | null
          gab4_bat7_capacidade?: string | null
          gab4_bat7_colada?: string | null
          gab4_bat7_com_gradil?: string | null
          gab4_bat7_data_fabricacao?: string | null
          gab4_bat7_estado?: string | null
          gab4_bat7_fabricante?: string | null
          gab4_bat7_tipo?: string | null
          gab4_bat8_capacidade?: string | null
          gab4_bat8_colada?: string | null
          gab4_bat8_com_gradil?: string | null
          gab4_bat8_data_fabricacao?: string | null
          gab4_bat8_estado?: string | null
          gab4_bat8_fabricante?: string | null
          gab4_bat8_tipo?: string | null
          gab4_bat9_capacidade?: string | null
          gab4_bat9_colada?: string | null
          gab4_bat9_com_gradil?: string | null
          gab4_bat9_data_fabricacao?: string | null
          gab4_bat9_estado?: string | null
          gab4_bat9_fabricante?: string | null
          gab4_bat9_tipo?: string | null
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
          gab4_fcc_qtd_ur_instaladas?: string | null
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
          gab5_ativo?: string | null
          gab5_bancos_interligados?: string | null
          gab5_bat_foto?: string | null
          gab5_bat1_capacidade?: string | null
          gab5_bat1_colada?: string | null
          gab5_bat1_com_gradil?: string | null
          gab5_bat1_data_fabricacao?: string | null
          gab5_bat1_estado?: string | null
          gab5_bat1_fabricante?: string | null
          gab5_bat1_tipo?: string | null
          gab5_bat10_capacidade?: string | null
          gab5_bat10_colada?: string | null
          gab5_bat10_com_gradil?: string | null
          gab5_bat10_data_fabricacao?: string | null
          gab5_bat10_estado?: string | null
          gab5_bat10_fabricante?: string | null
          gab5_bat10_tipo?: string | null
          gab5_bat11_capacidade?: string | null
          gab5_bat11_colada?: string | null
          gab5_bat11_com_gradil?: string | null
          gab5_bat11_data_fabricacao?: string | null
          gab5_bat11_estado?: string | null
          gab5_bat11_fabricante?: string | null
          gab5_bat11_tipo?: string | null
          gab5_bat12_capacidade?: string | null
          gab5_bat12_colada?: string | null
          gab5_bat12_com_gradil?: string | null
          gab5_bat12_data_fabricacao?: string | null
          gab5_bat12_estado?: string | null
          gab5_bat12_fabricante?: string | null
          gab5_bat12_tipo?: string | null
          gab5_bat2_capacidade?: string | null
          gab5_bat2_colada?: string | null
          gab5_bat2_com_gradil?: string | null
          gab5_bat2_data_fabricacao?: string | null
          gab5_bat2_estado?: string | null
          gab5_bat2_fabricante?: string | null
          gab5_bat2_tipo?: string | null
          gab5_bat3_capacidade?: string | null
          gab5_bat3_colada?: string | null
          gab5_bat3_com_gradil?: string | null
          gab5_bat3_data_fabricacao?: string | null
          gab5_bat3_estado?: string | null
          gab5_bat3_fabricante?: string | null
          gab5_bat3_tipo?: string | null
          gab5_bat4_capacidade?: string | null
          gab5_bat4_colada?: string | null
          gab5_bat4_com_gradil?: string | null
          gab5_bat4_data_fabricacao?: string | null
          gab5_bat4_estado?: string | null
          gab5_bat4_fabricante?: string | null
          gab5_bat4_tipo?: string | null
          gab5_bat5_capacidade?: string | null
          gab5_bat5_colada?: string | null
          gab5_bat5_com_gradil?: string | null
          gab5_bat5_data_fabricacao?: string | null
          gab5_bat5_estado?: string | null
          gab5_bat5_fabricante?: string | null
          gab5_bat5_tipo?: string | null
          gab5_bat6_capacidade?: string | null
          gab5_bat6_colada?: string | null
          gab5_bat6_com_gradil?: string | null
          gab5_bat6_data_fabricacao?: string | null
          gab5_bat6_estado?: string | null
          gab5_bat6_fabricante?: string | null
          gab5_bat6_tipo?: string | null
          gab5_bat7_capacidade?: string | null
          gab5_bat7_colada?: string | null
          gab5_bat7_com_gradil?: string | null
          gab5_bat7_data_fabricacao?: string | null
          gab5_bat7_estado?: string | null
          gab5_bat7_fabricante?: string | null
          gab5_bat7_tipo?: string | null
          gab5_bat8_capacidade?: string | null
          gab5_bat8_colada?: string | null
          gab5_bat8_com_gradil?: string | null
          gab5_bat8_data_fabricacao?: string | null
          gab5_bat8_estado?: string | null
          gab5_bat8_fabricante?: string | null
          gab5_bat8_tipo?: string | null
          gab5_bat9_capacidade?: string | null
          gab5_bat9_colada?: string | null
          gab5_bat9_com_gradil?: string | null
          gab5_bat9_data_fabricacao?: string | null
          gab5_bat9_estado?: string | null
          gab5_bat9_fabricante?: string | null
          gab5_bat9_tipo?: string | null
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
          gab5_fcc_qtd_ur_instaladas?: string | null
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
          gab6_ativo?: string | null
          gab6_bancos_interligados?: string | null
          gab6_bat_foto?: string | null
          gab6_bat1_capacidade?: string | null
          gab6_bat1_colada?: string | null
          gab6_bat1_com_gradil?: string | null
          gab6_bat1_data_fabricacao?: string | null
          gab6_bat1_estado?: string | null
          gab6_bat1_fabricante?: string | null
          gab6_bat1_tipo?: string | null
          gab6_bat10_capacidade?: string | null
          gab6_bat10_colada?: string | null
          gab6_bat10_com_gradil?: string | null
          gab6_bat10_data_fabricacao?: string | null
          gab6_bat10_estado?: string | null
          gab6_bat10_fabricante?: string | null
          gab6_bat10_tipo?: string | null
          gab6_bat11_capacidade?: string | null
          gab6_bat11_colada?: string | null
          gab6_bat11_com_gradil?: string | null
          gab6_bat11_data_fabricacao?: string | null
          gab6_bat11_estado?: string | null
          gab6_bat11_fabricante?: string | null
          gab6_bat11_tipo?: string | null
          gab6_bat12_capacidade?: string | null
          gab6_bat12_colada?: string | null
          gab6_bat12_com_gradil?: string | null
          gab6_bat12_data_fabricacao?: string | null
          gab6_bat12_estado?: string | null
          gab6_bat12_fabricante?: string | null
          gab6_bat12_tipo?: string | null
          gab6_bat2_capacidade?: string | null
          gab6_bat2_colada?: string | null
          gab6_bat2_com_gradil?: string | null
          gab6_bat2_data_fabricacao?: string | null
          gab6_bat2_estado?: string | null
          gab6_bat2_fabricante?: string | null
          gab6_bat2_tipo?: string | null
          gab6_bat3_capacidade?: string | null
          gab6_bat3_colada?: string | null
          gab6_bat3_com_gradil?: string | null
          gab6_bat3_data_fabricacao?: string | null
          gab6_bat3_estado?: string | null
          gab6_bat3_fabricante?: string | null
          gab6_bat3_tipo?: string | null
          gab6_bat4_capacidade?: string | null
          gab6_bat4_colada?: string | null
          gab6_bat4_com_gradil?: string | null
          gab6_bat4_data_fabricacao?: string | null
          gab6_bat4_estado?: string | null
          gab6_bat4_fabricante?: string | null
          gab6_bat4_tipo?: string | null
          gab6_bat5_capacidade?: string | null
          gab6_bat5_colada?: string | null
          gab6_bat5_com_gradil?: string | null
          gab6_bat5_data_fabricacao?: string | null
          gab6_bat5_estado?: string | null
          gab6_bat5_fabricante?: string | null
          gab6_bat5_tipo?: string | null
          gab6_bat6_capacidade?: string | null
          gab6_bat6_colada?: string | null
          gab6_bat6_com_gradil?: string | null
          gab6_bat6_data_fabricacao?: string | null
          gab6_bat6_estado?: string | null
          gab6_bat6_fabricante?: string | null
          gab6_bat6_tipo?: string | null
          gab6_bat7_capacidade?: string | null
          gab6_bat7_colada?: string | null
          gab6_bat7_com_gradil?: string | null
          gab6_bat7_data_fabricacao?: string | null
          gab6_bat7_estado?: string | null
          gab6_bat7_fabricante?: string | null
          gab6_bat7_tipo?: string | null
          gab6_bat8_capacidade?: string | null
          gab6_bat8_colada?: string | null
          gab6_bat8_com_gradil?: string | null
          gab6_bat8_data_fabricacao?: string | null
          gab6_bat8_estado?: string | null
          gab6_bat8_fabricante?: string | null
          gab6_bat8_tipo?: string | null
          gab6_bat9_capacidade?: string | null
          gab6_bat9_colada?: string | null
          gab6_bat9_com_gradil?: string | null
          gab6_bat9_data_fabricacao?: string | null
          gab6_bat9_estado?: string | null
          gab6_bat9_fabricante?: string | null
          gab6_bat9_tipo?: string | null
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
          gab6_fcc_qtd_ur_instaladas?: string | null
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
          gab7_ativo?: string | null
          gab7_bancos_interligados?: string | null
          gab7_bat_foto?: string | null
          gab7_bat1_capacidade?: string | null
          gab7_bat1_colada?: string | null
          gab7_bat1_com_gradil?: string | null
          gab7_bat1_data_fabricacao?: string | null
          gab7_bat1_estado?: string | null
          gab7_bat1_fabricante?: string | null
          gab7_bat1_tipo?: string | null
          gab7_bat10_capacidade?: string | null
          gab7_bat10_colada?: string | null
          gab7_bat10_com_gradil?: string | null
          gab7_bat10_data_fabricacao?: string | null
          gab7_bat10_estado?: string | null
          gab7_bat10_fabricante?: string | null
          gab7_bat10_tipo?: string | null
          gab7_bat11_capacidade?: string | null
          gab7_bat11_colada?: string | null
          gab7_bat11_com_gradil?: string | null
          gab7_bat11_data_fabricacao?: string | null
          gab7_bat11_estado?: string | null
          gab7_bat11_fabricante?: string | null
          gab7_bat11_tipo?: string | null
          gab7_bat12_capacidade?: string | null
          gab7_bat12_colada?: string | null
          gab7_bat12_com_gradil?: string | null
          gab7_bat12_data_fabricacao?: string | null
          gab7_bat12_estado?: string | null
          gab7_bat12_fabricante?: string | null
          gab7_bat12_tipo?: string | null
          gab7_bat2_capacidade?: string | null
          gab7_bat2_colada?: string | null
          gab7_bat2_com_gradil?: string | null
          gab7_bat2_data_fabricacao?: string | null
          gab7_bat2_estado?: string | null
          gab7_bat2_fabricante?: string | null
          gab7_bat2_tipo?: string | null
          gab7_bat3_capacidade?: string | null
          gab7_bat3_colada?: string | null
          gab7_bat3_com_gradil?: string | null
          gab7_bat3_data_fabricacao?: string | null
          gab7_bat3_estado?: string | null
          gab7_bat3_fabricante?: string | null
          gab7_bat3_tipo?: string | null
          gab7_bat4_capacidade?: string | null
          gab7_bat4_colada?: string | null
          gab7_bat4_com_gradil?: string | null
          gab7_bat4_data_fabricacao?: string | null
          gab7_bat4_estado?: string | null
          gab7_bat4_fabricante?: string | null
          gab7_bat4_tipo?: string | null
          gab7_bat5_capacidade?: string | null
          gab7_bat5_colada?: string | null
          gab7_bat5_com_gradil?: string | null
          gab7_bat5_data_fabricacao?: string | null
          gab7_bat5_estado?: string | null
          gab7_bat5_fabricante?: string | null
          gab7_bat5_tipo?: string | null
          gab7_bat6_capacidade?: string | null
          gab7_bat6_colada?: string | null
          gab7_bat6_com_gradil?: string | null
          gab7_bat6_data_fabricacao?: string | null
          gab7_bat6_estado?: string | null
          gab7_bat6_fabricante?: string | null
          gab7_bat6_tipo?: string | null
          gab7_bat7_capacidade?: string | null
          gab7_bat7_colada?: string | null
          gab7_bat7_com_gradil?: string | null
          gab7_bat7_data_fabricacao?: string | null
          gab7_bat7_estado?: string | null
          gab7_bat7_fabricante?: string | null
          gab7_bat7_tipo?: string | null
          gab7_bat8_capacidade?: string | null
          gab7_bat8_colada?: string | null
          gab7_bat8_com_gradil?: string | null
          gab7_bat8_data_fabricacao?: string | null
          gab7_bat8_estado?: string | null
          gab7_bat8_fabricante?: string | null
          gab7_bat8_tipo?: string | null
          gab7_bat9_capacidade?: string | null
          gab7_bat9_colada?: string | null
          gab7_bat9_com_gradil?: string | null
          gab7_bat9_data_fabricacao?: string | null
          gab7_bat9_estado?: string | null
          gab7_bat9_fabricante?: string | null
          gab7_bat9_tipo?: string | null
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
          gab7_fcc_qtd_ur_instaladas?: string | null
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
          geo_capturado_em?: string | null
          geo_endereco?: string | null
          geo_latitude?: number | null
          geo_longitude?: number | null
          gmg_alarme_ativo?: string | null
          gmg_autonomia?: number | null
          gmg_combustivel?: string | null
          gmg_existe?: string | null
          gmg_fabricante?: string | null
          gmg_foto_alarme?: string | null
          gmg_foto_painel?: string | null
          gmg_potencia?: string | null
          gmg_status?: string | null
          gmg_ultimo_teste?: string | null
          id?: string
          observacao_foto_url?: string | null
          observacoes?: string | null
          operadora?: string | null
          panoramic_photo_url?: string | null
          pdf_file_path?: string | null
          site_code: string
          state_uf?: string | null
          technician_name?: string | null
          torre_aterramento?: string | null
          torre_esteiramento_horizontal?: string | null
          torre_esteiramento_vertical?: string | null
          torre_foto_aterramento?: string | null
          torre_foto_esteiramento_horizontal?: string | null
          torre_foto_esteiramento_vertical?: string | null
          torre_foto_fibras_protegidas?: string | null
          torre_foto_ninhos?: string | null
          torre_foto_zeladoria?: string | null
          torre_housekeeping?: string | null
          torre_ninhos?: string | null
          torre_protecao_fibra?: string | null
          total_cabinets?: number
          user_id?: string | null
        }
        Update: {
          assinatura_digital?: string | null
          baterias_tipo_ia?: Json | null
          created_at?: string
          created_date?: string
          created_time?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          energia_disjuntor_entrada?: number | null
          energia_disjuntor_qdca?: number | null
          energia_fabricante?: string | null
          energia_fabricante_outra?: string | null
          energia_foto_cabos?: string | null
          energia_foto_placa?: string | null
          energia_foto_quadro_geral?: string | null
          energia_foto_relogio?: string | null
          energia_foto_transformador?: string | null
          energia_potencia_kva?: number | null
          energia_potencia_transformador?: string | null
          energia_protegido_cadeado?: string | null
          energia_protegido_gradil?: string | null
          energia_tensao_entrada?: string | null
          energia_tipo_quadro?: string | null
          energia_transformador_ok?: string | null
          energia_unidade_consumidora?: string | null
          excel_file_path?: string | null
          fibra_abord1_descricao?: string | null
          fibra_abord1_foto?: string | null
          fibra_abord1_tipo?: string | null
          fibra_abord2_descricao?: string | null
          fibra_abord2_foto?: string | null
          fibra_abord2_tipo?: string | null
          fibra_abord3_descricao?: string | null
          fibra_abord3_foto?: string | null
          fibra_abord3_tipo?: string | null
          fibra_abord4_descricao?: string | null
          fibra_abord4_foto?: string | null
          fibra_abord4_tipo?: string | null
          fibra_caixas_passagem_qtd?: number | null
          fibra_caixas_subterraneas_qtd?: number | null
          fibra_dgo1_capacidade?: string | null
          fibra_dgo1_cordoes?: string | null
          fibra_dgo1_cordoes_foto?: string | null
          fibra_dgo1_foto?: string | null
          fibra_dgo1_id?: string | null
          fibra_dgo2_capacidade?: string | null
          fibra_dgo2_cordoes?: string | null
          fibra_dgo2_cordoes_foto?: string | null
          fibra_dgo2_foto?: string | null
          fibra_dgo2_id?: string | null
          fibra_dgo3_capacidade?: string | null
          fibra_dgo3_cordoes?: string | null
          fibra_dgo3_cordoes_foto?: string | null
          fibra_dgo3_foto?: string | null
          fibra_dgo3_id?: string | null
          fibra_dgo4_capacidade?: string | null
          fibra_dgo4_cordoes?: string | null
          fibra_dgo4_cordoes_foto?: string | null
          fibra_dgo4_foto?: string | null
          fibra_dgo4_id?: string | null
          fibra_dgos_nok_qtd?: number | null
          fibra_dgos_ok_qtd?: number | null
          fibra_dgos_qtd?: number | null
          fibra_foto_caixas_passagem?: string | null
          fibra_foto_caixas_subterraneas?: string | null
          fibra_foto_subidas_laterais?: string | null
          fibra_qtd_abordagens?: number | null
          fibra_subidas_laterais_qtd?: number | null
          fotos_extras?: Json | null
          gab1_ac1_modelo?: string | null
          gab1_ac1_status?: string | null
          gab1_ac2_modelo?: string | null
          gab1_ac2_status?: string | null
          gab1_ac3_modelo?: string | null
          gab1_ac3_status?: string | null
          gab1_ac4_modelo?: string | null
          gab1_ac4_status?: string | null
          gab1_alarme_status?: string | null
          gab1_ativo?: string | null
          gab1_bancos_interligados?: string | null
          gab1_bat_foto?: string | null
          gab1_bat1_capacidade?: string | null
          gab1_bat1_colada?: string | null
          gab1_bat1_com_gradil?: string | null
          gab1_bat1_data_fabricacao?: string | null
          gab1_bat1_estado?: string | null
          gab1_bat1_fabricante?: string | null
          gab1_bat1_tipo?: string | null
          gab1_bat10_capacidade?: string | null
          gab1_bat10_colada?: string | null
          gab1_bat10_com_gradil?: string | null
          gab1_bat10_data_fabricacao?: string | null
          gab1_bat10_estado?: string | null
          gab1_bat10_fabricante?: string | null
          gab1_bat10_tipo?: string | null
          gab1_bat11_capacidade?: string | null
          gab1_bat11_colada?: string | null
          gab1_bat11_com_gradil?: string | null
          gab1_bat11_data_fabricacao?: string | null
          gab1_bat11_estado?: string | null
          gab1_bat11_fabricante?: string | null
          gab1_bat11_tipo?: string | null
          gab1_bat12_capacidade?: string | null
          gab1_bat12_colada?: string | null
          gab1_bat12_com_gradil?: string | null
          gab1_bat12_data_fabricacao?: string | null
          gab1_bat12_estado?: string | null
          gab1_bat12_fabricante?: string | null
          gab1_bat12_tipo?: string | null
          gab1_bat2_capacidade?: string | null
          gab1_bat2_colada?: string | null
          gab1_bat2_com_gradil?: string | null
          gab1_bat2_data_fabricacao?: string | null
          gab1_bat2_estado?: string | null
          gab1_bat2_fabricante?: string | null
          gab1_bat2_tipo?: string | null
          gab1_bat3_capacidade?: string | null
          gab1_bat3_colada?: string | null
          gab1_bat3_com_gradil?: string | null
          gab1_bat3_data_fabricacao?: string | null
          gab1_bat3_estado?: string | null
          gab1_bat3_fabricante?: string | null
          gab1_bat3_tipo?: string | null
          gab1_bat4_capacidade?: string | null
          gab1_bat4_colada?: string | null
          gab1_bat4_com_gradil?: string | null
          gab1_bat4_data_fabricacao?: string | null
          gab1_bat4_estado?: string | null
          gab1_bat4_fabricante?: string | null
          gab1_bat4_tipo?: string | null
          gab1_bat5_capacidade?: string | null
          gab1_bat5_colada?: string | null
          gab1_bat5_com_gradil?: string | null
          gab1_bat5_data_fabricacao?: string | null
          gab1_bat5_estado?: string | null
          gab1_bat5_fabricante?: string | null
          gab1_bat5_tipo?: string | null
          gab1_bat6_capacidade?: string | null
          gab1_bat6_colada?: string | null
          gab1_bat6_com_gradil?: string | null
          gab1_bat6_data_fabricacao?: string | null
          gab1_bat6_estado?: string | null
          gab1_bat6_fabricante?: string | null
          gab1_bat6_tipo?: string | null
          gab1_bat7_capacidade?: string | null
          gab1_bat7_colada?: string | null
          gab1_bat7_com_gradil?: string | null
          gab1_bat7_data_fabricacao?: string | null
          gab1_bat7_estado?: string | null
          gab1_bat7_fabricante?: string | null
          gab1_bat7_tipo?: string | null
          gab1_bat8_capacidade?: string | null
          gab1_bat8_colada?: string | null
          gab1_bat8_com_gradil?: string | null
          gab1_bat8_data_fabricacao?: string | null
          gab1_bat8_estado?: string | null
          gab1_bat8_fabricante?: string | null
          gab1_bat8_tipo?: string | null
          gab1_bat9_capacidade?: string | null
          gab1_bat9_colada?: string | null
          gab1_bat9_com_gradil?: string | null
          gab1_bat9_data_fabricacao?: string | null
          gab1_bat9_estado?: string | null
          gab1_bat9_fabricante?: string | null
          gab1_bat9_tipo?: string | null
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
          gab1_fcc_qtd_ur_instaladas?: string | null
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
          gab2_ativo?: string | null
          gab2_bancos_interligados?: string | null
          gab2_bat_foto?: string | null
          gab2_bat1_capacidade?: string | null
          gab2_bat1_colada?: string | null
          gab2_bat1_com_gradil?: string | null
          gab2_bat1_data_fabricacao?: string | null
          gab2_bat1_estado?: string | null
          gab2_bat1_fabricante?: string | null
          gab2_bat1_tipo?: string | null
          gab2_bat10_capacidade?: string | null
          gab2_bat10_colada?: string | null
          gab2_bat10_com_gradil?: string | null
          gab2_bat10_data_fabricacao?: string | null
          gab2_bat10_estado?: string | null
          gab2_bat10_fabricante?: string | null
          gab2_bat10_tipo?: string | null
          gab2_bat11_capacidade?: string | null
          gab2_bat11_colada?: string | null
          gab2_bat11_com_gradil?: string | null
          gab2_bat11_data_fabricacao?: string | null
          gab2_bat11_estado?: string | null
          gab2_bat11_fabricante?: string | null
          gab2_bat11_tipo?: string | null
          gab2_bat12_capacidade?: string | null
          gab2_bat12_colada?: string | null
          gab2_bat12_com_gradil?: string | null
          gab2_bat12_data_fabricacao?: string | null
          gab2_bat12_estado?: string | null
          gab2_bat12_fabricante?: string | null
          gab2_bat12_tipo?: string | null
          gab2_bat2_capacidade?: string | null
          gab2_bat2_colada?: string | null
          gab2_bat2_com_gradil?: string | null
          gab2_bat2_data_fabricacao?: string | null
          gab2_bat2_estado?: string | null
          gab2_bat2_fabricante?: string | null
          gab2_bat2_tipo?: string | null
          gab2_bat3_capacidade?: string | null
          gab2_bat3_colada?: string | null
          gab2_bat3_com_gradil?: string | null
          gab2_bat3_data_fabricacao?: string | null
          gab2_bat3_estado?: string | null
          gab2_bat3_fabricante?: string | null
          gab2_bat3_tipo?: string | null
          gab2_bat4_capacidade?: string | null
          gab2_bat4_colada?: string | null
          gab2_bat4_com_gradil?: string | null
          gab2_bat4_data_fabricacao?: string | null
          gab2_bat4_estado?: string | null
          gab2_bat4_fabricante?: string | null
          gab2_bat4_tipo?: string | null
          gab2_bat5_capacidade?: string | null
          gab2_bat5_colada?: string | null
          gab2_bat5_com_gradil?: string | null
          gab2_bat5_data_fabricacao?: string | null
          gab2_bat5_estado?: string | null
          gab2_bat5_fabricante?: string | null
          gab2_bat5_tipo?: string | null
          gab2_bat6_capacidade?: string | null
          gab2_bat6_colada?: string | null
          gab2_bat6_com_gradil?: string | null
          gab2_bat6_data_fabricacao?: string | null
          gab2_bat6_estado?: string | null
          gab2_bat6_fabricante?: string | null
          gab2_bat6_tipo?: string | null
          gab2_bat7_capacidade?: string | null
          gab2_bat7_colada?: string | null
          gab2_bat7_com_gradil?: string | null
          gab2_bat7_data_fabricacao?: string | null
          gab2_bat7_estado?: string | null
          gab2_bat7_fabricante?: string | null
          gab2_bat7_tipo?: string | null
          gab2_bat8_capacidade?: string | null
          gab2_bat8_colada?: string | null
          gab2_bat8_com_gradil?: string | null
          gab2_bat8_data_fabricacao?: string | null
          gab2_bat8_estado?: string | null
          gab2_bat8_fabricante?: string | null
          gab2_bat8_tipo?: string | null
          gab2_bat9_capacidade?: string | null
          gab2_bat9_colada?: string | null
          gab2_bat9_com_gradil?: string | null
          gab2_bat9_data_fabricacao?: string | null
          gab2_bat9_estado?: string | null
          gab2_bat9_fabricante?: string | null
          gab2_bat9_tipo?: string | null
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
          gab2_fcc_qtd_ur_instaladas?: string | null
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
          gab3_ativo?: string | null
          gab3_bancos_interligados?: string | null
          gab3_bat_foto?: string | null
          gab3_bat1_capacidade?: string | null
          gab3_bat1_colada?: string | null
          gab3_bat1_com_gradil?: string | null
          gab3_bat1_data_fabricacao?: string | null
          gab3_bat1_estado?: string | null
          gab3_bat1_fabricante?: string | null
          gab3_bat1_tipo?: string | null
          gab3_bat10_capacidade?: string | null
          gab3_bat10_colada?: string | null
          gab3_bat10_com_gradil?: string | null
          gab3_bat10_data_fabricacao?: string | null
          gab3_bat10_estado?: string | null
          gab3_bat10_fabricante?: string | null
          gab3_bat10_tipo?: string | null
          gab3_bat11_capacidade?: string | null
          gab3_bat11_colada?: string | null
          gab3_bat11_com_gradil?: string | null
          gab3_bat11_data_fabricacao?: string | null
          gab3_bat11_estado?: string | null
          gab3_bat11_fabricante?: string | null
          gab3_bat11_tipo?: string | null
          gab3_bat12_capacidade?: string | null
          gab3_bat12_colada?: string | null
          gab3_bat12_com_gradil?: string | null
          gab3_bat12_data_fabricacao?: string | null
          gab3_bat12_estado?: string | null
          gab3_bat12_fabricante?: string | null
          gab3_bat12_tipo?: string | null
          gab3_bat2_capacidade?: string | null
          gab3_bat2_colada?: string | null
          gab3_bat2_com_gradil?: string | null
          gab3_bat2_data_fabricacao?: string | null
          gab3_bat2_estado?: string | null
          gab3_bat2_fabricante?: string | null
          gab3_bat2_tipo?: string | null
          gab3_bat3_capacidade?: string | null
          gab3_bat3_colada?: string | null
          gab3_bat3_com_gradil?: string | null
          gab3_bat3_data_fabricacao?: string | null
          gab3_bat3_estado?: string | null
          gab3_bat3_fabricante?: string | null
          gab3_bat3_tipo?: string | null
          gab3_bat4_capacidade?: string | null
          gab3_bat4_colada?: string | null
          gab3_bat4_com_gradil?: string | null
          gab3_bat4_data_fabricacao?: string | null
          gab3_bat4_estado?: string | null
          gab3_bat4_fabricante?: string | null
          gab3_bat4_tipo?: string | null
          gab3_bat5_capacidade?: string | null
          gab3_bat5_colada?: string | null
          gab3_bat5_com_gradil?: string | null
          gab3_bat5_data_fabricacao?: string | null
          gab3_bat5_estado?: string | null
          gab3_bat5_fabricante?: string | null
          gab3_bat5_tipo?: string | null
          gab3_bat6_capacidade?: string | null
          gab3_bat6_colada?: string | null
          gab3_bat6_com_gradil?: string | null
          gab3_bat6_data_fabricacao?: string | null
          gab3_bat6_estado?: string | null
          gab3_bat6_fabricante?: string | null
          gab3_bat6_tipo?: string | null
          gab3_bat7_capacidade?: string | null
          gab3_bat7_colada?: string | null
          gab3_bat7_com_gradil?: string | null
          gab3_bat7_data_fabricacao?: string | null
          gab3_bat7_estado?: string | null
          gab3_bat7_fabricante?: string | null
          gab3_bat7_tipo?: string | null
          gab3_bat8_capacidade?: string | null
          gab3_bat8_colada?: string | null
          gab3_bat8_com_gradil?: string | null
          gab3_bat8_data_fabricacao?: string | null
          gab3_bat8_estado?: string | null
          gab3_bat8_fabricante?: string | null
          gab3_bat8_tipo?: string | null
          gab3_bat9_capacidade?: string | null
          gab3_bat9_colada?: string | null
          gab3_bat9_com_gradil?: string | null
          gab3_bat9_data_fabricacao?: string | null
          gab3_bat9_estado?: string | null
          gab3_bat9_fabricante?: string | null
          gab3_bat9_tipo?: string | null
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
          gab3_fcc_qtd_ur_instaladas?: string | null
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
          gab4_ativo?: string | null
          gab4_bancos_interligados?: string | null
          gab4_bat_foto?: string | null
          gab4_bat1_capacidade?: string | null
          gab4_bat1_colada?: string | null
          gab4_bat1_com_gradil?: string | null
          gab4_bat1_data_fabricacao?: string | null
          gab4_bat1_estado?: string | null
          gab4_bat1_fabricante?: string | null
          gab4_bat1_tipo?: string | null
          gab4_bat10_capacidade?: string | null
          gab4_bat10_colada?: string | null
          gab4_bat10_com_gradil?: string | null
          gab4_bat10_data_fabricacao?: string | null
          gab4_bat10_estado?: string | null
          gab4_bat10_fabricante?: string | null
          gab4_bat10_tipo?: string | null
          gab4_bat11_capacidade?: string | null
          gab4_bat11_colada?: string | null
          gab4_bat11_com_gradil?: string | null
          gab4_bat11_data_fabricacao?: string | null
          gab4_bat11_estado?: string | null
          gab4_bat11_fabricante?: string | null
          gab4_bat11_tipo?: string | null
          gab4_bat12_capacidade?: string | null
          gab4_bat12_colada?: string | null
          gab4_bat12_com_gradil?: string | null
          gab4_bat12_data_fabricacao?: string | null
          gab4_bat12_estado?: string | null
          gab4_bat12_fabricante?: string | null
          gab4_bat12_tipo?: string | null
          gab4_bat2_capacidade?: string | null
          gab4_bat2_colada?: string | null
          gab4_bat2_com_gradil?: string | null
          gab4_bat2_data_fabricacao?: string | null
          gab4_bat2_estado?: string | null
          gab4_bat2_fabricante?: string | null
          gab4_bat2_tipo?: string | null
          gab4_bat3_capacidade?: string | null
          gab4_bat3_colada?: string | null
          gab4_bat3_com_gradil?: string | null
          gab4_bat3_data_fabricacao?: string | null
          gab4_bat3_estado?: string | null
          gab4_bat3_fabricante?: string | null
          gab4_bat3_tipo?: string | null
          gab4_bat4_capacidade?: string | null
          gab4_bat4_colada?: string | null
          gab4_bat4_com_gradil?: string | null
          gab4_bat4_data_fabricacao?: string | null
          gab4_bat4_estado?: string | null
          gab4_bat4_fabricante?: string | null
          gab4_bat4_tipo?: string | null
          gab4_bat5_capacidade?: string | null
          gab4_bat5_colada?: string | null
          gab4_bat5_com_gradil?: string | null
          gab4_bat5_data_fabricacao?: string | null
          gab4_bat5_estado?: string | null
          gab4_bat5_fabricante?: string | null
          gab4_bat5_tipo?: string | null
          gab4_bat6_capacidade?: string | null
          gab4_bat6_colada?: string | null
          gab4_bat6_com_gradil?: string | null
          gab4_bat6_data_fabricacao?: string | null
          gab4_bat6_estado?: string | null
          gab4_bat6_fabricante?: string | null
          gab4_bat6_tipo?: string | null
          gab4_bat7_capacidade?: string | null
          gab4_bat7_colada?: string | null
          gab4_bat7_com_gradil?: string | null
          gab4_bat7_data_fabricacao?: string | null
          gab4_bat7_estado?: string | null
          gab4_bat7_fabricante?: string | null
          gab4_bat7_tipo?: string | null
          gab4_bat8_capacidade?: string | null
          gab4_bat8_colada?: string | null
          gab4_bat8_com_gradil?: string | null
          gab4_bat8_data_fabricacao?: string | null
          gab4_bat8_estado?: string | null
          gab4_bat8_fabricante?: string | null
          gab4_bat8_tipo?: string | null
          gab4_bat9_capacidade?: string | null
          gab4_bat9_colada?: string | null
          gab4_bat9_com_gradil?: string | null
          gab4_bat9_data_fabricacao?: string | null
          gab4_bat9_estado?: string | null
          gab4_bat9_fabricante?: string | null
          gab4_bat9_tipo?: string | null
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
          gab4_fcc_qtd_ur_instaladas?: string | null
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
          gab5_ativo?: string | null
          gab5_bancos_interligados?: string | null
          gab5_bat_foto?: string | null
          gab5_bat1_capacidade?: string | null
          gab5_bat1_colada?: string | null
          gab5_bat1_com_gradil?: string | null
          gab5_bat1_data_fabricacao?: string | null
          gab5_bat1_estado?: string | null
          gab5_bat1_fabricante?: string | null
          gab5_bat1_tipo?: string | null
          gab5_bat10_capacidade?: string | null
          gab5_bat10_colada?: string | null
          gab5_bat10_com_gradil?: string | null
          gab5_bat10_data_fabricacao?: string | null
          gab5_bat10_estado?: string | null
          gab5_bat10_fabricante?: string | null
          gab5_bat10_tipo?: string | null
          gab5_bat11_capacidade?: string | null
          gab5_bat11_colada?: string | null
          gab5_bat11_com_gradil?: string | null
          gab5_bat11_data_fabricacao?: string | null
          gab5_bat11_estado?: string | null
          gab5_bat11_fabricante?: string | null
          gab5_bat11_tipo?: string | null
          gab5_bat12_capacidade?: string | null
          gab5_bat12_colada?: string | null
          gab5_bat12_com_gradil?: string | null
          gab5_bat12_data_fabricacao?: string | null
          gab5_bat12_estado?: string | null
          gab5_bat12_fabricante?: string | null
          gab5_bat12_tipo?: string | null
          gab5_bat2_capacidade?: string | null
          gab5_bat2_colada?: string | null
          gab5_bat2_com_gradil?: string | null
          gab5_bat2_data_fabricacao?: string | null
          gab5_bat2_estado?: string | null
          gab5_bat2_fabricante?: string | null
          gab5_bat2_tipo?: string | null
          gab5_bat3_capacidade?: string | null
          gab5_bat3_colada?: string | null
          gab5_bat3_com_gradil?: string | null
          gab5_bat3_data_fabricacao?: string | null
          gab5_bat3_estado?: string | null
          gab5_bat3_fabricante?: string | null
          gab5_bat3_tipo?: string | null
          gab5_bat4_capacidade?: string | null
          gab5_bat4_colada?: string | null
          gab5_bat4_com_gradil?: string | null
          gab5_bat4_data_fabricacao?: string | null
          gab5_bat4_estado?: string | null
          gab5_bat4_fabricante?: string | null
          gab5_bat4_tipo?: string | null
          gab5_bat5_capacidade?: string | null
          gab5_bat5_colada?: string | null
          gab5_bat5_com_gradil?: string | null
          gab5_bat5_data_fabricacao?: string | null
          gab5_bat5_estado?: string | null
          gab5_bat5_fabricante?: string | null
          gab5_bat5_tipo?: string | null
          gab5_bat6_capacidade?: string | null
          gab5_bat6_colada?: string | null
          gab5_bat6_com_gradil?: string | null
          gab5_bat6_data_fabricacao?: string | null
          gab5_bat6_estado?: string | null
          gab5_bat6_fabricante?: string | null
          gab5_bat6_tipo?: string | null
          gab5_bat7_capacidade?: string | null
          gab5_bat7_colada?: string | null
          gab5_bat7_com_gradil?: string | null
          gab5_bat7_data_fabricacao?: string | null
          gab5_bat7_estado?: string | null
          gab5_bat7_fabricante?: string | null
          gab5_bat7_tipo?: string | null
          gab5_bat8_capacidade?: string | null
          gab5_bat8_colada?: string | null
          gab5_bat8_com_gradil?: string | null
          gab5_bat8_data_fabricacao?: string | null
          gab5_bat8_estado?: string | null
          gab5_bat8_fabricante?: string | null
          gab5_bat8_tipo?: string | null
          gab5_bat9_capacidade?: string | null
          gab5_bat9_colada?: string | null
          gab5_bat9_com_gradil?: string | null
          gab5_bat9_data_fabricacao?: string | null
          gab5_bat9_estado?: string | null
          gab5_bat9_fabricante?: string | null
          gab5_bat9_tipo?: string | null
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
          gab5_fcc_qtd_ur_instaladas?: string | null
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
          gab6_ativo?: string | null
          gab6_bancos_interligados?: string | null
          gab6_bat_foto?: string | null
          gab6_bat1_capacidade?: string | null
          gab6_bat1_colada?: string | null
          gab6_bat1_com_gradil?: string | null
          gab6_bat1_data_fabricacao?: string | null
          gab6_bat1_estado?: string | null
          gab6_bat1_fabricante?: string | null
          gab6_bat1_tipo?: string | null
          gab6_bat10_capacidade?: string | null
          gab6_bat10_colada?: string | null
          gab6_bat10_com_gradil?: string | null
          gab6_bat10_data_fabricacao?: string | null
          gab6_bat10_estado?: string | null
          gab6_bat10_fabricante?: string | null
          gab6_bat10_tipo?: string | null
          gab6_bat11_capacidade?: string | null
          gab6_bat11_colada?: string | null
          gab6_bat11_com_gradil?: string | null
          gab6_bat11_data_fabricacao?: string | null
          gab6_bat11_estado?: string | null
          gab6_bat11_fabricante?: string | null
          gab6_bat11_tipo?: string | null
          gab6_bat12_capacidade?: string | null
          gab6_bat12_colada?: string | null
          gab6_bat12_com_gradil?: string | null
          gab6_bat12_data_fabricacao?: string | null
          gab6_bat12_estado?: string | null
          gab6_bat12_fabricante?: string | null
          gab6_bat12_tipo?: string | null
          gab6_bat2_capacidade?: string | null
          gab6_bat2_colada?: string | null
          gab6_bat2_com_gradil?: string | null
          gab6_bat2_data_fabricacao?: string | null
          gab6_bat2_estado?: string | null
          gab6_bat2_fabricante?: string | null
          gab6_bat2_tipo?: string | null
          gab6_bat3_capacidade?: string | null
          gab6_bat3_colada?: string | null
          gab6_bat3_com_gradil?: string | null
          gab6_bat3_data_fabricacao?: string | null
          gab6_bat3_estado?: string | null
          gab6_bat3_fabricante?: string | null
          gab6_bat3_tipo?: string | null
          gab6_bat4_capacidade?: string | null
          gab6_bat4_colada?: string | null
          gab6_bat4_com_gradil?: string | null
          gab6_bat4_data_fabricacao?: string | null
          gab6_bat4_estado?: string | null
          gab6_bat4_fabricante?: string | null
          gab6_bat4_tipo?: string | null
          gab6_bat5_capacidade?: string | null
          gab6_bat5_colada?: string | null
          gab6_bat5_com_gradil?: string | null
          gab6_bat5_data_fabricacao?: string | null
          gab6_bat5_estado?: string | null
          gab6_bat5_fabricante?: string | null
          gab6_bat5_tipo?: string | null
          gab6_bat6_capacidade?: string | null
          gab6_bat6_colada?: string | null
          gab6_bat6_com_gradil?: string | null
          gab6_bat6_data_fabricacao?: string | null
          gab6_bat6_estado?: string | null
          gab6_bat6_fabricante?: string | null
          gab6_bat6_tipo?: string | null
          gab6_bat7_capacidade?: string | null
          gab6_bat7_colada?: string | null
          gab6_bat7_com_gradil?: string | null
          gab6_bat7_data_fabricacao?: string | null
          gab6_bat7_estado?: string | null
          gab6_bat7_fabricante?: string | null
          gab6_bat7_tipo?: string | null
          gab6_bat8_capacidade?: string | null
          gab6_bat8_colada?: string | null
          gab6_bat8_com_gradil?: string | null
          gab6_bat8_data_fabricacao?: string | null
          gab6_bat8_estado?: string | null
          gab6_bat8_fabricante?: string | null
          gab6_bat8_tipo?: string | null
          gab6_bat9_capacidade?: string | null
          gab6_bat9_colada?: string | null
          gab6_bat9_com_gradil?: string | null
          gab6_bat9_data_fabricacao?: string | null
          gab6_bat9_estado?: string | null
          gab6_bat9_fabricante?: string | null
          gab6_bat9_tipo?: string | null
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
          gab6_fcc_qtd_ur_instaladas?: string | null
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
          gab7_ativo?: string | null
          gab7_bancos_interligados?: string | null
          gab7_bat_foto?: string | null
          gab7_bat1_capacidade?: string | null
          gab7_bat1_colada?: string | null
          gab7_bat1_com_gradil?: string | null
          gab7_bat1_data_fabricacao?: string | null
          gab7_bat1_estado?: string | null
          gab7_bat1_fabricante?: string | null
          gab7_bat1_tipo?: string | null
          gab7_bat10_capacidade?: string | null
          gab7_bat10_colada?: string | null
          gab7_bat10_com_gradil?: string | null
          gab7_bat10_data_fabricacao?: string | null
          gab7_bat10_estado?: string | null
          gab7_bat10_fabricante?: string | null
          gab7_bat10_tipo?: string | null
          gab7_bat11_capacidade?: string | null
          gab7_bat11_colada?: string | null
          gab7_bat11_com_gradil?: string | null
          gab7_bat11_data_fabricacao?: string | null
          gab7_bat11_estado?: string | null
          gab7_bat11_fabricante?: string | null
          gab7_bat11_tipo?: string | null
          gab7_bat12_capacidade?: string | null
          gab7_bat12_colada?: string | null
          gab7_bat12_com_gradil?: string | null
          gab7_bat12_data_fabricacao?: string | null
          gab7_bat12_estado?: string | null
          gab7_bat12_fabricante?: string | null
          gab7_bat12_tipo?: string | null
          gab7_bat2_capacidade?: string | null
          gab7_bat2_colada?: string | null
          gab7_bat2_com_gradil?: string | null
          gab7_bat2_data_fabricacao?: string | null
          gab7_bat2_estado?: string | null
          gab7_bat2_fabricante?: string | null
          gab7_bat2_tipo?: string | null
          gab7_bat3_capacidade?: string | null
          gab7_bat3_colada?: string | null
          gab7_bat3_com_gradil?: string | null
          gab7_bat3_data_fabricacao?: string | null
          gab7_bat3_estado?: string | null
          gab7_bat3_fabricante?: string | null
          gab7_bat3_tipo?: string | null
          gab7_bat4_capacidade?: string | null
          gab7_bat4_colada?: string | null
          gab7_bat4_com_gradil?: string | null
          gab7_bat4_data_fabricacao?: string | null
          gab7_bat4_estado?: string | null
          gab7_bat4_fabricante?: string | null
          gab7_bat4_tipo?: string | null
          gab7_bat5_capacidade?: string | null
          gab7_bat5_colada?: string | null
          gab7_bat5_com_gradil?: string | null
          gab7_bat5_data_fabricacao?: string | null
          gab7_bat5_estado?: string | null
          gab7_bat5_fabricante?: string | null
          gab7_bat5_tipo?: string | null
          gab7_bat6_capacidade?: string | null
          gab7_bat6_colada?: string | null
          gab7_bat6_com_gradil?: string | null
          gab7_bat6_data_fabricacao?: string | null
          gab7_bat6_estado?: string | null
          gab7_bat6_fabricante?: string | null
          gab7_bat6_tipo?: string | null
          gab7_bat7_capacidade?: string | null
          gab7_bat7_colada?: string | null
          gab7_bat7_com_gradil?: string | null
          gab7_bat7_data_fabricacao?: string | null
          gab7_bat7_estado?: string | null
          gab7_bat7_fabricante?: string | null
          gab7_bat7_tipo?: string | null
          gab7_bat8_capacidade?: string | null
          gab7_bat8_colada?: string | null
          gab7_bat8_com_gradil?: string | null
          gab7_bat8_data_fabricacao?: string | null
          gab7_bat8_estado?: string | null
          gab7_bat8_fabricante?: string | null
          gab7_bat8_tipo?: string | null
          gab7_bat9_capacidade?: string | null
          gab7_bat9_colada?: string | null
          gab7_bat9_com_gradil?: string | null
          gab7_bat9_data_fabricacao?: string | null
          gab7_bat9_estado?: string | null
          gab7_bat9_fabricante?: string | null
          gab7_bat9_tipo?: string | null
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
          gab7_fcc_qtd_ur_instaladas?: string | null
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
          geo_capturado_em?: string | null
          geo_endereco?: string | null
          geo_latitude?: number | null
          geo_longitude?: number | null
          gmg_alarme_ativo?: string | null
          gmg_autonomia?: number | null
          gmg_combustivel?: string | null
          gmg_existe?: string | null
          gmg_fabricante?: string | null
          gmg_foto_alarme?: string | null
          gmg_foto_painel?: string | null
          gmg_potencia?: string | null
          gmg_status?: string | null
          gmg_ultimo_teste?: string | null
          id?: string
          observacao_foto_url?: string | null
          observacoes?: string | null
          operadora?: string | null
          panoramic_photo_url?: string | null
          pdf_file_path?: string | null
          site_code?: string
          state_uf?: string | null
          technician_name?: string | null
          torre_aterramento?: string | null
          torre_esteiramento_horizontal?: string | null
          torre_esteiramento_vertical?: string | null
          torre_foto_aterramento?: string | null
          torre_foto_esteiramento_horizontal?: string | null
          torre_foto_esteiramento_vertical?: string | null
          torre_foto_fibras_protegidas?: string | null
          torre_foto_ninhos?: string | null
          torre_foto_zeladoria?: string | null
          torre_housekeeping?: string | null
          torre_ninhos?: string | null
          torre_protecao_fibra?: string | null
          total_cabinets?: number
          user_id?: string | null
        }
        Relationships: []
      }
      revisoes_reparo: {
        Row: {
          criado_em: string
          id: string
          mensagem: string
          reparo_id: string
          tipo: string
          usuario_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          mensagem: string
          reparo_id: string
          tipo?: string
          usuario_id: string
        }
        Update: {
          criado_em?: string
          id?: string
          mensagem?: string
          reparo_id?: string
          tipo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revisoes_reparo_reparo_id_fkey"
            columns: ["reparo_id"]
            isOneToOne: false
            referencedRelation: "reparos"
            referencedColumns: ["id"]
          },
        ]
      }
      site_assignments: {
        Row: {
          assigned_by: string
          completed_at: string | null
          created_at: string
          deadline: string
          id: string
          report_id: string | null
          site_id: string
          status: Database["public"]["Enums"]["assignment_status"]
          technician_id: string
          updated_at: string
        }
        Insert: {
          assigned_by: string
          completed_at?: string | null
          created_at?: string
          deadline: string
          id?: string
          report_id?: string | null
          site_id: string
          status?: Database["public"]["Enums"]["assignment_status"]
          technician_id: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          completed_at?: string | null
          created_at?: string
          deadline?: string
          id?: string
          report_id?: string | null
          site_id?: string
          status?: Database["public"]["Enums"]["assignment_status"]
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_assignments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_assignments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          municipio: string | null
          site_code: string
          tipo: string
          uf: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          municipio?: string | null
          site_code: string
          tipo: string
          uf: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          municipio?: string | null
          site_code?: string
          tipo?: string
          uf?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          area_atuacao: string | null
          created_at: string
          id: string
          lgpd_consent: boolean
          lgpd_consent_at: string | null
          operadora: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          area_atuacao?: string | null
          created_at?: string
          id?: string
          lgpd_consent?: boolean
          lgpd_consent_at?: string | null
          operadora?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          area_atuacao?: string | null
          created_at?: string
          id?: string
          lgpd_consent?: boolean
          lgpd_consent_at?: string | null
          operadora?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vandalismo_fotos: {
        Row: {
          categoria: string
          created_at: string
          id: string
          ordem: number
          url: string
          vistoria_id: string
        }
        Insert: {
          categoria?: string
          created_at?: string
          id?: string
          ordem?: number
          url: string
          vistoria_id: string
        }
        Update: {
          categoria?: string
          created_at?: string
          id?: string
          ordem?: number
          url?: string
          vistoria_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vandalismo_fotos_vistoria_id_fkey"
            columns: ["vistoria_id"]
            isOneToOne: false
            referencedRelation: "vandalismo_vistorias"
            referencedColumns: ["id"]
          },
        ]
      }
      vandalismo_itens: {
        Row: {
          created_at: string
          fotos: Json
          id: string
          item_key: string
          observacao: string | null
          ordem: number
          rotulo: string
          vistoria_id: string
          vulneravel: boolean
        }
        Insert: {
          created_at?: string
          fotos?: Json
          id?: string
          item_key: string
          observacao?: string | null
          ordem?: number
          rotulo: string
          vistoria_id: string
          vulneravel?: boolean
        }
        Update: {
          created_at?: string
          fotos?: Json
          id?: string
          item_key?: string
          observacao?: string | null
          ordem?: number
          rotulo?: string
          vistoria_id?: string
          vulneravel?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "vandalismo_itens_vistoria_id_fkey"
            columns: ["vistoria_id"]
            isOneToOne: false
            referencedRelation: "vandalismo_vistorias"
            referencedColumns: ["id"]
          },
        ]
      }
      vandalismo_vistorias: {
        Row: {
          bo_nome: string | null
          bo_url: string | null
          created_at: string
          descricao: string
          endereco: string | null
          estado: string | null
          id: string
          latitude: number | null
          longitude: number | null
          municipio: string | null
          operadora: string | null
          site_code: string
          status: string
          tecnico: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bo_nome?: string | null
          bo_url?: string | null
          created_at?: string
          descricao?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          municipio?: string | null
          operadora?: string | null
          site_code: string
          status?: string
          tecnico?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          bo_nome?: string | null
          bo_url?: string | null
          created_at?: string
          descricao?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          municipio?: string | null
          operadora?: string | null
          site_code?: string
          status?: string
          tecnico?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_latest_report_for_prefill: {
        Args: { p_site_code: string }
        Returns: {
          assinatura_digital: string | null
          baterias_tipo_ia: Json | null
          created_at: string
          created_date: string
          created_time: string
          email_sent: boolean | null
          email_sent_at: string | null
          energia_disjuntor_entrada: number | null
          energia_disjuntor_qdca: number | null
          energia_fabricante: string | null
          energia_fabricante_outra: string | null
          energia_foto_cabos: string | null
          energia_foto_placa: string | null
          energia_foto_quadro_geral: string | null
          energia_foto_relogio: string | null
          energia_foto_transformador: string | null
          energia_potencia_kva: number | null
          energia_potencia_transformador: string | null
          energia_protegido_cadeado: string | null
          energia_protegido_gradil: string | null
          energia_tensao_entrada: string | null
          energia_tipo_quadro: string | null
          energia_transformador_ok: string | null
          energia_unidade_consumidora: string | null
          excel_file_path: string | null
          fibra_abord1_descricao: string | null
          fibra_abord1_foto: string | null
          fibra_abord1_tipo: string | null
          fibra_abord2_descricao: string | null
          fibra_abord2_foto: string | null
          fibra_abord2_tipo: string | null
          fibra_abord3_descricao: string | null
          fibra_abord3_foto: string | null
          fibra_abord3_tipo: string | null
          fibra_abord4_descricao: string | null
          fibra_abord4_foto: string | null
          fibra_abord4_tipo: string | null
          fibra_caixas_passagem_qtd: number | null
          fibra_caixas_subterraneas_qtd: number | null
          fibra_dgo1_capacidade: string | null
          fibra_dgo1_cordoes: string | null
          fibra_dgo1_cordoes_foto: string | null
          fibra_dgo1_foto: string | null
          fibra_dgo1_id: string | null
          fibra_dgo2_capacidade: string | null
          fibra_dgo2_cordoes: string | null
          fibra_dgo2_cordoes_foto: string | null
          fibra_dgo2_foto: string | null
          fibra_dgo2_id: string | null
          fibra_dgo3_capacidade: string | null
          fibra_dgo3_cordoes: string | null
          fibra_dgo3_cordoes_foto: string | null
          fibra_dgo3_foto: string | null
          fibra_dgo3_id: string | null
          fibra_dgo4_capacidade: string | null
          fibra_dgo4_cordoes: string | null
          fibra_dgo4_cordoes_foto: string | null
          fibra_dgo4_foto: string | null
          fibra_dgo4_id: string | null
          fibra_dgos_nok_qtd: number | null
          fibra_dgos_ok_qtd: number | null
          fibra_dgos_qtd: number | null
          fibra_foto_caixas_passagem: string | null
          fibra_foto_caixas_subterraneas: string | null
          fibra_foto_subidas_laterais: string | null
          fibra_qtd_abordagens: number | null
          fibra_subidas_laterais_qtd: number | null
          fotos_extras: Json | null
          gab1_ac1_modelo: string | null
          gab1_ac1_status: string | null
          gab1_ac2_modelo: string | null
          gab1_ac2_status: string | null
          gab1_ac3_modelo: string | null
          gab1_ac3_status: string | null
          gab1_ac4_modelo: string | null
          gab1_ac4_status: string | null
          gab1_alarme_status: string | null
          gab1_ativo: string | null
          gab1_bancos_interligados: string | null
          gab1_bat_foto: string | null
          gab1_bat1_capacidade: string | null
          gab1_bat1_colada: string | null
          gab1_bat1_com_gradil: string | null
          gab1_bat1_data_fabricacao: string | null
          gab1_bat1_estado: string | null
          gab1_bat1_fabricante: string | null
          gab1_bat1_tipo: string | null
          gab1_bat10_capacidade: string | null
          gab1_bat10_colada: string | null
          gab1_bat10_com_gradil: string | null
          gab1_bat10_data_fabricacao: string | null
          gab1_bat10_estado: string | null
          gab1_bat10_fabricante: string | null
          gab1_bat10_tipo: string | null
          gab1_bat11_capacidade: string | null
          gab1_bat11_colada: string | null
          gab1_bat11_com_gradil: string | null
          gab1_bat11_data_fabricacao: string | null
          gab1_bat11_estado: string | null
          gab1_bat11_fabricante: string | null
          gab1_bat11_tipo: string | null
          gab1_bat12_capacidade: string | null
          gab1_bat12_colada: string | null
          gab1_bat12_com_gradil: string | null
          gab1_bat12_data_fabricacao: string | null
          gab1_bat12_estado: string | null
          gab1_bat12_fabricante: string | null
          gab1_bat12_tipo: string | null
          gab1_bat2_capacidade: string | null
          gab1_bat2_colada: string | null
          gab1_bat2_com_gradil: string | null
          gab1_bat2_data_fabricacao: string | null
          gab1_bat2_estado: string | null
          gab1_bat2_fabricante: string | null
          gab1_bat2_tipo: string | null
          gab1_bat3_capacidade: string | null
          gab1_bat3_colada: string | null
          gab1_bat3_com_gradil: string | null
          gab1_bat3_data_fabricacao: string | null
          gab1_bat3_estado: string | null
          gab1_bat3_fabricante: string | null
          gab1_bat3_tipo: string | null
          gab1_bat4_capacidade: string | null
          gab1_bat4_colada: string | null
          gab1_bat4_com_gradil: string | null
          gab1_bat4_data_fabricacao: string | null
          gab1_bat4_estado: string | null
          gab1_bat4_fabricante: string | null
          gab1_bat4_tipo: string | null
          gab1_bat5_capacidade: string | null
          gab1_bat5_colada: string | null
          gab1_bat5_com_gradil: string | null
          gab1_bat5_data_fabricacao: string | null
          gab1_bat5_estado: string | null
          gab1_bat5_fabricante: string | null
          gab1_bat5_tipo: string | null
          gab1_bat6_capacidade: string | null
          gab1_bat6_colada: string | null
          gab1_bat6_com_gradil: string | null
          gab1_bat6_data_fabricacao: string | null
          gab1_bat6_estado: string | null
          gab1_bat6_fabricante: string | null
          gab1_bat6_tipo: string | null
          gab1_bat7_capacidade: string | null
          gab1_bat7_colada: string | null
          gab1_bat7_com_gradil: string | null
          gab1_bat7_data_fabricacao: string | null
          gab1_bat7_estado: string | null
          gab1_bat7_fabricante: string | null
          gab1_bat7_tipo: string | null
          gab1_bat8_capacidade: string | null
          gab1_bat8_colada: string | null
          gab1_bat8_com_gradil: string | null
          gab1_bat8_data_fabricacao: string | null
          gab1_bat8_estado: string | null
          gab1_bat8_fabricante: string | null
          gab1_bat8_tipo: string | null
          gab1_bat9_capacidade: string | null
          gab1_bat9_colada: string | null
          gab1_bat9_com_gradil: string | null
          gab1_bat9_data_fabricacao: string | null
          gab1_bat9_estado: string | null
          gab1_bat9_fabricante: string | null
          gab1_bat9_tipo: string | null
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
          gab1_fcc_qtd_ur_instaladas: string | null
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
          gab2_ativo: string | null
          gab2_bancos_interligados: string | null
          gab2_bat_foto: string | null
          gab2_bat1_capacidade: string | null
          gab2_bat1_colada: string | null
          gab2_bat1_com_gradil: string | null
          gab2_bat1_data_fabricacao: string | null
          gab2_bat1_estado: string | null
          gab2_bat1_fabricante: string | null
          gab2_bat1_tipo: string | null
          gab2_bat10_capacidade: string | null
          gab2_bat10_colada: string | null
          gab2_bat10_com_gradil: string | null
          gab2_bat10_data_fabricacao: string | null
          gab2_bat10_estado: string | null
          gab2_bat10_fabricante: string | null
          gab2_bat10_tipo: string | null
          gab2_bat11_capacidade: string | null
          gab2_bat11_colada: string | null
          gab2_bat11_com_gradil: string | null
          gab2_bat11_data_fabricacao: string | null
          gab2_bat11_estado: string | null
          gab2_bat11_fabricante: string | null
          gab2_bat11_tipo: string | null
          gab2_bat12_capacidade: string | null
          gab2_bat12_colada: string | null
          gab2_bat12_com_gradil: string | null
          gab2_bat12_data_fabricacao: string | null
          gab2_bat12_estado: string | null
          gab2_bat12_fabricante: string | null
          gab2_bat12_tipo: string | null
          gab2_bat2_capacidade: string | null
          gab2_bat2_colada: string | null
          gab2_bat2_com_gradil: string | null
          gab2_bat2_data_fabricacao: string | null
          gab2_bat2_estado: string | null
          gab2_bat2_fabricante: string | null
          gab2_bat2_tipo: string | null
          gab2_bat3_capacidade: string | null
          gab2_bat3_colada: string | null
          gab2_bat3_com_gradil: string | null
          gab2_bat3_data_fabricacao: string | null
          gab2_bat3_estado: string | null
          gab2_bat3_fabricante: string | null
          gab2_bat3_tipo: string | null
          gab2_bat4_capacidade: string | null
          gab2_bat4_colada: string | null
          gab2_bat4_com_gradil: string | null
          gab2_bat4_data_fabricacao: string | null
          gab2_bat4_estado: string | null
          gab2_bat4_fabricante: string | null
          gab2_bat4_tipo: string | null
          gab2_bat5_capacidade: string | null
          gab2_bat5_colada: string | null
          gab2_bat5_com_gradil: string | null
          gab2_bat5_data_fabricacao: string | null
          gab2_bat5_estado: string | null
          gab2_bat5_fabricante: string | null
          gab2_bat5_tipo: string | null
          gab2_bat6_capacidade: string | null
          gab2_bat6_colada: string | null
          gab2_bat6_com_gradil: string | null
          gab2_bat6_data_fabricacao: string | null
          gab2_bat6_estado: string | null
          gab2_bat6_fabricante: string | null
          gab2_bat6_tipo: string | null
          gab2_bat7_capacidade: string | null
          gab2_bat7_colada: string | null
          gab2_bat7_com_gradil: string | null
          gab2_bat7_data_fabricacao: string | null
          gab2_bat7_estado: string | null
          gab2_bat7_fabricante: string | null
          gab2_bat7_tipo: string | null
          gab2_bat8_capacidade: string | null
          gab2_bat8_colada: string | null
          gab2_bat8_com_gradil: string | null
          gab2_bat8_data_fabricacao: string | null
          gab2_bat8_estado: string | null
          gab2_bat8_fabricante: string | null
          gab2_bat8_tipo: string | null
          gab2_bat9_capacidade: string | null
          gab2_bat9_colada: string | null
          gab2_bat9_com_gradil: string | null
          gab2_bat9_data_fabricacao: string | null
          gab2_bat9_estado: string | null
          gab2_bat9_fabricante: string | null
          gab2_bat9_tipo: string | null
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
          gab2_fcc_qtd_ur_instaladas: string | null
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
          gab3_ativo: string | null
          gab3_bancos_interligados: string | null
          gab3_bat_foto: string | null
          gab3_bat1_capacidade: string | null
          gab3_bat1_colada: string | null
          gab3_bat1_com_gradil: string | null
          gab3_bat1_data_fabricacao: string | null
          gab3_bat1_estado: string | null
          gab3_bat1_fabricante: string | null
          gab3_bat1_tipo: string | null
          gab3_bat10_capacidade: string | null
          gab3_bat10_colada: string | null
          gab3_bat10_com_gradil: string | null
          gab3_bat10_data_fabricacao: string | null
          gab3_bat10_estado: string | null
          gab3_bat10_fabricante: string | null
          gab3_bat10_tipo: string | null
          gab3_bat11_capacidade: string | null
          gab3_bat11_colada: string | null
          gab3_bat11_com_gradil: string | null
          gab3_bat11_data_fabricacao: string | null
          gab3_bat11_estado: string | null
          gab3_bat11_fabricante: string | null
          gab3_bat11_tipo: string | null
          gab3_bat12_capacidade: string | null
          gab3_bat12_colada: string | null
          gab3_bat12_com_gradil: string | null
          gab3_bat12_data_fabricacao: string | null
          gab3_bat12_estado: string | null
          gab3_bat12_fabricante: string | null
          gab3_bat12_tipo: string | null
          gab3_bat2_capacidade: string | null
          gab3_bat2_colada: string | null
          gab3_bat2_com_gradil: string | null
          gab3_bat2_data_fabricacao: string | null
          gab3_bat2_estado: string | null
          gab3_bat2_fabricante: string | null
          gab3_bat2_tipo: string | null
          gab3_bat3_capacidade: string | null
          gab3_bat3_colada: string | null
          gab3_bat3_com_gradil: string | null
          gab3_bat3_data_fabricacao: string | null
          gab3_bat3_estado: string | null
          gab3_bat3_fabricante: string | null
          gab3_bat3_tipo: string | null
          gab3_bat4_capacidade: string | null
          gab3_bat4_colada: string | null
          gab3_bat4_com_gradil: string | null
          gab3_bat4_data_fabricacao: string | null
          gab3_bat4_estado: string | null
          gab3_bat4_fabricante: string | null
          gab3_bat4_tipo: string | null
          gab3_bat5_capacidade: string | null
          gab3_bat5_colada: string | null
          gab3_bat5_com_gradil: string | null
          gab3_bat5_data_fabricacao: string | null
          gab3_bat5_estado: string | null
          gab3_bat5_fabricante: string | null
          gab3_bat5_tipo: string | null
          gab3_bat6_capacidade: string | null
          gab3_bat6_colada: string | null
          gab3_bat6_com_gradil: string | null
          gab3_bat6_data_fabricacao: string | null
          gab3_bat6_estado: string | null
          gab3_bat6_fabricante: string | null
          gab3_bat6_tipo: string | null
          gab3_bat7_capacidade: string | null
          gab3_bat7_colada: string | null
          gab3_bat7_com_gradil: string | null
          gab3_bat7_data_fabricacao: string | null
          gab3_bat7_estado: string | null
          gab3_bat7_fabricante: string | null
          gab3_bat7_tipo: string | null
          gab3_bat8_capacidade: string | null
          gab3_bat8_colada: string | null
          gab3_bat8_com_gradil: string | null
          gab3_bat8_data_fabricacao: string | null
          gab3_bat8_estado: string | null
          gab3_bat8_fabricante: string | null
          gab3_bat8_tipo: string | null
          gab3_bat9_capacidade: string | null
          gab3_bat9_colada: string | null
          gab3_bat9_com_gradil: string | null
          gab3_bat9_data_fabricacao: string | null
          gab3_bat9_estado: string | null
          gab3_bat9_fabricante: string | null
          gab3_bat9_tipo: string | null
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
          gab3_fcc_qtd_ur_instaladas: string | null
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
          gab4_ativo: string | null
          gab4_bancos_interligados: string | null
          gab4_bat_foto: string | null
          gab4_bat1_capacidade: string | null
          gab4_bat1_colada: string | null
          gab4_bat1_com_gradil: string | null
          gab4_bat1_data_fabricacao: string | null
          gab4_bat1_estado: string | null
          gab4_bat1_fabricante: string | null
          gab4_bat1_tipo: string | null
          gab4_bat10_capacidade: string | null
          gab4_bat10_colada: string | null
          gab4_bat10_com_gradil: string | null
          gab4_bat10_data_fabricacao: string | null
          gab4_bat10_estado: string | null
          gab4_bat10_fabricante: string | null
          gab4_bat10_tipo: string | null
          gab4_bat11_capacidade: string | null
          gab4_bat11_colada: string | null
          gab4_bat11_com_gradil: string | null
          gab4_bat11_data_fabricacao: string | null
          gab4_bat11_estado: string | null
          gab4_bat11_fabricante: string | null
          gab4_bat11_tipo: string | null
          gab4_bat12_capacidade: string | null
          gab4_bat12_colada: string | null
          gab4_bat12_com_gradil: string | null
          gab4_bat12_data_fabricacao: string | null
          gab4_bat12_estado: string | null
          gab4_bat12_fabricante: string | null
          gab4_bat12_tipo: string | null
          gab4_bat2_capacidade: string | null
          gab4_bat2_colada: string | null
          gab4_bat2_com_gradil: string | null
          gab4_bat2_data_fabricacao: string | null
          gab4_bat2_estado: string | null
          gab4_bat2_fabricante: string | null
          gab4_bat2_tipo: string | null
          gab4_bat3_capacidade: string | null
          gab4_bat3_colada: string | null
          gab4_bat3_com_gradil: string | null
          gab4_bat3_data_fabricacao: string | null
          gab4_bat3_estado: string | null
          gab4_bat3_fabricante: string | null
          gab4_bat3_tipo: string | null
          gab4_bat4_capacidade: string | null
          gab4_bat4_colada: string | null
          gab4_bat4_com_gradil: string | null
          gab4_bat4_data_fabricacao: string | null
          gab4_bat4_estado: string | null
          gab4_bat4_fabricante: string | null
          gab4_bat4_tipo: string | null
          gab4_bat5_capacidade: string | null
          gab4_bat5_colada: string | null
          gab4_bat5_com_gradil: string | null
          gab4_bat5_data_fabricacao: string | null
          gab4_bat5_estado: string | null
          gab4_bat5_fabricante: string | null
          gab4_bat5_tipo: string | null
          gab4_bat6_capacidade: string | null
          gab4_bat6_colada: string | null
          gab4_bat6_com_gradil: string | null
          gab4_bat6_data_fabricacao: string | null
          gab4_bat6_estado: string | null
          gab4_bat6_fabricante: string | null
          gab4_bat6_tipo: string | null
          gab4_bat7_capacidade: string | null
          gab4_bat7_colada: string | null
          gab4_bat7_com_gradil: string | null
          gab4_bat7_data_fabricacao: string | null
          gab4_bat7_estado: string | null
          gab4_bat7_fabricante: string | null
          gab4_bat7_tipo: string | null
          gab4_bat8_capacidade: string | null
          gab4_bat8_colada: string | null
          gab4_bat8_com_gradil: string | null
          gab4_bat8_data_fabricacao: string | null
          gab4_bat8_estado: string | null
          gab4_bat8_fabricante: string | null
          gab4_bat8_tipo: string | null
          gab4_bat9_capacidade: string | null
          gab4_bat9_colada: string | null
          gab4_bat9_com_gradil: string | null
          gab4_bat9_data_fabricacao: string | null
          gab4_bat9_estado: string | null
          gab4_bat9_fabricante: string | null
          gab4_bat9_tipo: string | null
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
          gab4_fcc_qtd_ur_instaladas: string | null
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
          gab5_ativo: string | null
          gab5_bancos_interligados: string | null
          gab5_bat_foto: string | null
          gab5_bat1_capacidade: string | null
          gab5_bat1_colada: string | null
          gab5_bat1_com_gradil: string | null
          gab5_bat1_data_fabricacao: string | null
          gab5_bat1_estado: string | null
          gab5_bat1_fabricante: string | null
          gab5_bat1_tipo: string | null
          gab5_bat10_capacidade: string | null
          gab5_bat10_colada: string | null
          gab5_bat10_com_gradil: string | null
          gab5_bat10_data_fabricacao: string | null
          gab5_bat10_estado: string | null
          gab5_bat10_fabricante: string | null
          gab5_bat10_tipo: string | null
          gab5_bat11_capacidade: string | null
          gab5_bat11_colada: string | null
          gab5_bat11_com_gradil: string | null
          gab5_bat11_data_fabricacao: string | null
          gab5_bat11_estado: string | null
          gab5_bat11_fabricante: string | null
          gab5_bat11_tipo: string | null
          gab5_bat12_capacidade: string | null
          gab5_bat12_colada: string | null
          gab5_bat12_com_gradil: string | null
          gab5_bat12_data_fabricacao: string | null
          gab5_bat12_estado: string | null
          gab5_bat12_fabricante: string | null
          gab5_bat12_tipo: string | null
          gab5_bat2_capacidade: string | null
          gab5_bat2_colada: string | null
          gab5_bat2_com_gradil: string | null
          gab5_bat2_data_fabricacao: string | null
          gab5_bat2_estado: string | null
          gab5_bat2_fabricante: string | null
          gab5_bat2_tipo: string | null
          gab5_bat3_capacidade: string | null
          gab5_bat3_colada: string | null
          gab5_bat3_com_gradil: string | null
          gab5_bat3_data_fabricacao: string | null
          gab5_bat3_estado: string | null
          gab5_bat3_fabricante: string | null
          gab5_bat3_tipo: string | null
          gab5_bat4_capacidade: string | null
          gab5_bat4_colada: string | null
          gab5_bat4_com_gradil: string | null
          gab5_bat4_data_fabricacao: string | null
          gab5_bat4_estado: string | null
          gab5_bat4_fabricante: string | null
          gab5_bat4_tipo: string | null
          gab5_bat5_capacidade: string | null
          gab5_bat5_colada: string | null
          gab5_bat5_com_gradil: string | null
          gab5_bat5_data_fabricacao: string | null
          gab5_bat5_estado: string | null
          gab5_bat5_fabricante: string | null
          gab5_bat5_tipo: string | null
          gab5_bat6_capacidade: string | null
          gab5_bat6_colada: string | null
          gab5_bat6_com_gradil: string | null
          gab5_bat6_data_fabricacao: string | null
          gab5_bat6_estado: string | null
          gab5_bat6_fabricante: string | null
          gab5_bat6_tipo: string | null
          gab5_bat7_capacidade: string | null
          gab5_bat7_colada: string | null
          gab5_bat7_com_gradil: string | null
          gab5_bat7_data_fabricacao: string | null
          gab5_bat7_estado: string | null
          gab5_bat7_fabricante: string | null
          gab5_bat7_tipo: string | null
          gab5_bat8_capacidade: string | null
          gab5_bat8_colada: string | null
          gab5_bat8_com_gradil: string | null
          gab5_bat8_data_fabricacao: string | null
          gab5_bat8_estado: string | null
          gab5_bat8_fabricante: string | null
          gab5_bat8_tipo: string | null
          gab5_bat9_capacidade: string | null
          gab5_bat9_colada: string | null
          gab5_bat9_com_gradil: string | null
          gab5_bat9_data_fabricacao: string | null
          gab5_bat9_estado: string | null
          gab5_bat9_fabricante: string | null
          gab5_bat9_tipo: string | null
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
          gab5_fcc_qtd_ur_instaladas: string | null
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
          gab6_ativo: string | null
          gab6_bancos_interligados: string | null
          gab6_bat_foto: string | null
          gab6_bat1_capacidade: string | null
          gab6_bat1_colada: string | null
          gab6_bat1_com_gradil: string | null
          gab6_bat1_data_fabricacao: string | null
          gab6_bat1_estado: string | null
          gab6_bat1_fabricante: string | null
          gab6_bat1_tipo: string | null
          gab6_bat10_capacidade: string | null
          gab6_bat10_colada: string | null
          gab6_bat10_com_gradil: string | null
          gab6_bat10_data_fabricacao: string | null
          gab6_bat10_estado: string | null
          gab6_bat10_fabricante: string | null
          gab6_bat10_tipo: string | null
          gab6_bat11_capacidade: string | null
          gab6_bat11_colada: string | null
          gab6_bat11_com_gradil: string | null
          gab6_bat11_data_fabricacao: string | null
          gab6_bat11_estado: string | null
          gab6_bat11_fabricante: string | null
          gab6_bat11_tipo: string | null
          gab6_bat12_capacidade: string | null
          gab6_bat12_colada: string | null
          gab6_bat12_com_gradil: string | null
          gab6_bat12_data_fabricacao: string | null
          gab6_bat12_estado: string | null
          gab6_bat12_fabricante: string | null
          gab6_bat12_tipo: string | null
          gab6_bat2_capacidade: string | null
          gab6_bat2_colada: string | null
          gab6_bat2_com_gradil: string | null
          gab6_bat2_data_fabricacao: string | null
          gab6_bat2_estado: string | null
          gab6_bat2_fabricante: string | null
          gab6_bat2_tipo: string | null
          gab6_bat3_capacidade: string | null
          gab6_bat3_colada: string | null
          gab6_bat3_com_gradil: string | null
          gab6_bat3_data_fabricacao: string | null
          gab6_bat3_estado: string | null
          gab6_bat3_fabricante: string | null
          gab6_bat3_tipo: string | null
          gab6_bat4_capacidade: string | null
          gab6_bat4_colada: string | null
          gab6_bat4_com_gradil: string | null
          gab6_bat4_data_fabricacao: string | null
          gab6_bat4_estado: string | null
          gab6_bat4_fabricante: string | null
          gab6_bat4_tipo: string | null
          gab6_bat5_capacidade: string | null
          gab6_bat5_colada: string | null
          gab6_bat5_com_gradil: string | null
          gab6_bat5_data_fabricacao: string | null
          gab6_bat5_estado: string | null
          gab6_bat5_fabricante: string | null
          gab6_bat5_tipo: string | null
          gab6_bat6_capacidade: string | null
          gab6_bat6_colada: string | null
          gab6_bat6_com_gradil: string | null
          gab6_bat6_data_fabricacao: string | null
          gab6_bat6_estado: string | null
          gab6_bat6_fabricante: string | null
          gab6_bat6_tipo: string | null
          gab6_bat7_capacidade: string | null
          gab6_bat7_colada: string | null
          gab6_bat7_com_gradil: string | null
          gab6_bat7_data_fabricacao: string | null
          gab6_bat7_estado: string | null
          gab6_bat7_fabricante: string | null
          gab6_bat7_tipo: string | null
          gab6_bat8_capacidade: string | null
          gab6_bat8_colada: string | null
          gab6_bat8_com_gradil: string | null
          gab6_bat8_data_fabricacao: string | null
          gab6_bat8_estado: string | null
          gab6_bat8_fabricante: string | null
          gab6_bat8_tipo: string | null
          gab6_bat9_capacidade: string | null
          gab6_bat9_colada: string | null
          gab6_bat9_com_gradil: string | null
          gab6_bat9_data_fabricacao: string | null
          gab6_bat9_estado: string | null
          gab6_bat9_fabricante: string | null
          gab6_bat9_tipo: string | null
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
          gab6_fcc_qtd_ur_instaladas: string | null
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
          gab7_ativo: string | null
          gab7_bancos_interligados: string | null
          gab7_bat_foto: string | null
          gab7_bat1_capacidade: string | null
          gab7_bat1_colada: string | null
          gab7_bat1_com_gradil: string | null
          gab7_bat1_data_fabricacao: string | null
          gab7_bat1_estado: string | null
          gab7_bat1_fabricante: string | null
          gab7_bat1_tipo: string | null
          gab7_bat10_capacidade: string | null
          gab7_bat10_colada: string | null
          gab7_bat10_com_gradil: string | null
          gab7_bat10_data_fabricacao: string | null
          gab7_bat10_estado: string | null
          gab7_bat10_fabricante: string | null
          gab7_bat10_tipo: string | null
          gab7_bat11_capacidade: string | null
          gab7_bat11_colada: string | null
          gab7_bat11_com_gradil: string | null
          gab7_bat11_data_fabricacao: string | null
          gab7_bat11_estado: string | null
          gab7_bat11_fabricante: string | null
          gab7_bat11_tipo: string | null
          gab7_bat12_capacidade: string | null
          gab7_bat12_colada: string | null
          gab7_bat12_com_gradil: string | null
          gab7_bat12_data_fabricacao: string | null
          gab7_bat12_estado: string | null
          gab7_bat12_fabricante: string | null
          gab7_bat12_tipo: string | null
          gab7_bat2_capacidade: string | null
          gab7_bat2_colada: string | null
          gab7_bat2_com_gradil: string | null
          gab7_bat2_data_fabricacao: string | null
          gab7_bat2_estado: string | null
          gab7_bat2_fabricante: string | null
          gab7_bat2_tipo: string | null
          gab7_bat3_capacidade: string | null
          gab7_bat3_colada: string | null
          gab7_bat3_com_gradil: string | null
          gab7_bat3_data_fabricacao: string | null
          gab7_bat3_estado: string | null
          gab7_bat3_fabricante: string | null
          gab7_bat3_tipo: string | null
          gab7_bat4_capacidade: string | null
          gab7_bat4_colada: string | null
          gab7_bat4_com_gradil: string | null
          gab7_bat4_data_fabricacao: string | null
          gab7_bat4_estado: string | null
          gab7_bat4_fabricante: string | null
          gab7_bat4_tipo: string | null
          gab7_bat5_capacidade: string | null
          gab7_bat5_colada: string | null
          gab7_bat5_com_gradil: string | null
          gab7_bat5_data_fabricacao: string | null
          gab7_bat5_estado: string | null
          gab7_bat5_fabricante: string | null
          gab7_bat5_tipo: string | null
          gab7_bat6_capacidade: string | null
          gab7_bat6_colada: string | null
          gab7_bat6_com_gradil: string | null
          gab7_bat6_data_fabricacao: string | null
          gab7_bat6_estado: string | null
          gab7_bat6_fabricante: string | null
          gab7_bat6_tipo: string | null
          gab7_bat7_capacidade: string | null
          gab7_bat7_colada: string | null
          gab7_bat7_com_gradil: string | null
          gab7_bat7_data_fabricacao: string | null
          gab7_bat7_estado: string | null
          gab7_bat7_fabricante: string | null
          gab7_bat7_tipo: string | null
          gab7_bat8_capacidade: string | null
          gab7_bat8_colada: string | null
          gab7_bat8_com_gradil: string | null
          gab7_bat8_data_fabricacao: string | null
          gab7_bat8_estado: string | null
          gab7_bat8_fabricante: string | null
          gab7_bat8_tipo: string | null
          gab7_bat9_capacidade: string | null
          gab7_bat9_colada: string | null
          gab7_bat9_com_gradil: string | null
          gab7_bat9_data_fabricacao: string | null
          gab7_bat9_estado: string | null
          gab7_bat9_fabricante: string | null
          gab7_bat9_tipo: string | null
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
          gab7_fcc_qtd_ur_instaladas: string | null
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
          geo_capturado_em: string | null
          geo_endereco: string | null
          geo_latitude: number | null
          geo_longitude: number | null
          gmg_alarme_ativo: string | null
          gmg_autonomia: number | null
          gmg_combustivel: string | null
          gmg_existe: string | null
          gmg_fabricante: string | null
          gmg_foto_alarme: string | null
          gmg_foto_painel: string | null
          gmg_potencia: string | null
          gmg_status: string | null
          gmg_ultimo_teste: string | null
          id: string
          observacao_foto_url: string | null
          observacoes: string | null
          operadora: string | null
          panoramic_photo_url: string | null
          pdf_file_path: string | null
          site_code: string
          state_uf: string | null
          technician_name: string | null
          torre_aterramento: string | null
          torre_esteiramento_horizontal: string | null
          torre_esteiramento_vertical: string | null
          torre_foto_aterramento: string | null
          torre_foto_esteiramento_horizontal: string | null
          torre_foto_esteiramento_vertical: string | null
          torre_foto_fibras_protegidas: string | null
          torre_foto_ninhos: string | null
          torre_foto_zeladoria: string | null
          torre_housekeeping: string | null
          torre_ninhos: string | null
          torre_protecao_fibra: string | null
          total_cabinets: number
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "reports"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      app_role: "gestor" | "tecnico" | "administrador"
      assignment_status: "pendente" | "em_andamento" | "concluido" | "atrasado"
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
      app_role: ["gestor", "tecnico", "administrador"],
      assignment_status: ["pendente", "em_andamento", "concluido", "atrasado"],
    },
  },
} as const
