

## Edição Inline em Todas as Abas do Modal de Detalhes

Atualmente, a edição inline (clicar no lápis para editar diretamente) funciona apenas na aba "Geral" (campos Site, UF, Técnico, etc.). Esta alteração expande a funcionalidade para todas as abas do modal.

### Abas e campos que passarão a ser editáveis

**Abas de Gabinete (Gab 1, Gab 2, ...)**
- Informações: Tipo, Proteção, Ativo, Tecnologias Acesso, Tecnologias Transporte
- FCC: Fabricante, Tensão DC, Gerenciada, Gerenciável, Consumo DC, Qtd UR Suportadas, URs Instaladas
- Baterias: Tipo, Fabricante, Capacidade, Data Fabricação, Estado, Colada, Com Gradil (dentro de cada banco) e Bancos Interligados
- Climatização: Tipo, Ventiladores/PLC/Alarme status, Modelo e Status de cada AC

**Aba Energia**
- Tipo Quadro, Fabricante, Potência, Tensão Entrada, Disjuntor Entrada, Disjuntor QDCA, Unidade Consumidora, Potência Transformador, Transformador OK, Protegido Gradil, Protegido Cadeado

**Aba Fibra**
- Qtd Abordagens, Caixas de Passagem, Caixas Subterrâneas, Subidas Laterais, Total DGOs
- Tipo e Descrição de cada abordagem
- ID, Capacidade e Estado Cordões de cada DGO

**Aba GMG/Torre**
- GMG: Possui GMG, Fabricante, Potência, Combustível, Capacidade Tanque, Último Teste, Status, Alarme Ativo
- Torre: Fibra Protegida, Aterramento, Zeladoria, Ninhos

### O que muda para o usuário

- Em todas as abas, ao passar o mouse sobre um campo de texto, aparece o ícone de lápis (igual já funciona na aba Geral)
- Apenas usuários autorizados (Admin, Gestor ou autor do relatório) veem o ícone de edição
- As alterações são salvas diretamente no banco de dados em tempo real

### Detalhes técnicos

**Arquivo a editar:** `src/components/dashboard/SiteDetailModal.tsx`

Todas as instâncias de `InfoRow` nas abas de Gabinete, Energia, Fibra e GMG/Torre serão substituídas por `EditableInfoRow`, passando os parâmetros necessários:
- `fieldName`: nome da coluna no banco (ex: `gab1_tipo`, `energia_tipo_quadro`, `gmg_fabricante`)
- `reportId`: ID do relatório atual
- `canEdit`: permissão do usuário (já calculada como `canEditReport`)
- `onUpdate`: callback `handleFieldUpdate` (já existente)
- `type`: "number" para campos numéricos

Os campos que usam `StatusBadge` inline (como Ventiladores, PLC, Alarme, GMG existe) também serão convertidos para `EditableInfoRow` para permitir a edição do valor.

Nenhuma alteração de banco de dados é necessária - a função `updateReportField` já suporta qualquer campo da tabela `reports`.
