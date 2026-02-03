
Objetivo
- Corrigir a falha ao enviar relatório (erro: “Could not find the 'gab1_fcc_qtd_ur_instaladas' column of 'reports' in the schema cache”) adicionando a coluna que o app está tentando gravar e garantindo que leituras (prefill/dashboard) também incluam esse novo campo.

Causa raiz (confirmada pelo print + código)
- O app monta a linha para inserir em public.reports com o campo:
  - gab{N}_fcc_qtd_ur_instaladas
- Porém a tabela reports atualmente só possui gab{N}_fcc_qtd_ur (qtd suportadas) e não possui gab{N}_fcc_qtd_ur_instaladas.
- Ao inserir um objeto com uma coluna inexistente, o backend rejeita e o cliente mostra “column … not found in schema cache”.

Solução (abordagem escolhida)
- Adicionar no banco (Lovable Cloud) as colunas faltantes gab1..gab7_fcc_qtd_ur_instaladas (TEXT, nullable) para manter compatibilidade com o modelo “horizontal” já usado na tabela reports.
- Atualizar o “select de colunas” usado em consultas do dashboard/prefill para incluir essas colunas (para que o dado possa ser lido depois de salvo).

Mudanças planejadas (sequência)

1) Migração de banco de dados: adicionar colunas faltantes
- Criar uma nova migration SQL que execute:
  - ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_fcc_qtd_ur_instaladas TEXT;
  - …
  - ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_fcc_qtd_ur_instaladas TEXT;
- Justificativa:
  - Resolve o erro imediatamente sem alterar o fluxo do formulário.
  - Mantém o padrão atual (colunas por gabinete) e evita refatoração grande.

2) Ajuste de queries no código para incluir as novas colunas (leitura/prefill)
Arquivo: src/lib/reportDatabase.ts
- Em buildDashboardColumns(), incluir também:
  - `${prefix}_fcc_qtd_ur_instaladas`
- Isso garante que:
  - fetchLatestReportBySiteCode (prefill sem fotos) traga esse campo.
  - Qualquer tela que use “dashboard columns” possa enxergar o valor.

3) (Opcional, mas recomendado) Robustez no parser de prefill
Arquivo: src/lib/reportToChecklist.ts
- Verificar se já está tolerante a undefined (está), mas ajustar para evitar parseInt(undefined) gerar NaN:
  - Usar um helper safeParseInt (ou fallback) para qtdURInstaladas.
- Isso não é obrigatório para corrigir o envio, mas melhora a estabilidade do prefill.

4) Validação e teste ponta a ponta
- Depois da migração e ajuste de colunas:
  - Recarregar a aplicação (hard refresh no mobile/Chrome) para limpar cache do schema no cliente.
  - Testar envio com FCC preenchida (qtd suportadas e instaladas) em pelo menos 1 gabinete.
  - Confirmar que o relatório salva e que ao abrir o prefill do mesmo site o valor de “UR instaladas” aparece.

Riscos / observações
- “Schema cache” no cliente pode persistir até recarregar a aba; por isso o hard refresh é importante após a migração.
- As políticas de segurança (RLS) já exigem user_id = auth.uid() no INSERT; como o erro atual é de coluna inexistente, o foco é a migração. Se após isso surgir erro de permissão, aí investigaremos RLS/autenticação do usuário que está tentando enviar.

Critérios de pronto
- Envio do relatório não apresenta mais o erro da coluna ausente.
- O relatório é inserido com sucesso em reports.
- Prefill e/ou telas de detalhes conseguem ler e mostrar gab{N}_fcc_qtd_ur_instaladas quando existir.

Arquivos envolvidos
- Banco (migration): adicionar colunas gab1..gab7_fcc_qtd_ur_instaladas
- src/lib/reportDatabase.ts: incluir colunas no buildDashboardColumns()
- (Opcional) src/lib/reportToChecklist.ts: parse mais robusto