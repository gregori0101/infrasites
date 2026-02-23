

# Plano: Gerar PDF do Relatorio de Auditoria

## Visao Geral

Adicionar um botao "PDF" em cada OS concluida na visao do gestor/administrador que gera um documento PDF com todos os detalhes da auditoria: dados da OS, itens auditados, status de conformidade, quantidades, observacoes e fotos de evidencia.

---

## Componentes Envolvidos

### 1. Novo arquivo: `src/lib/generateAuditPDF.ts`

Criar funcao `generateAuditPDF` que recebe os dados da OS, seus itens e o email do tecnico, e produz um PDF no estilo visual existente (cores Vivo, headers roxos, cards com secoes).

O PDF contera:
- **Cabecalho**: Logo Vivo, titulo "Relatorio de Auditoria", numero da OS e sigla do site
- **Dados Gerais**: Numero OS, Sigla Site, Motivo, Tecnico, Prazo, Status, Data de Criacao e Conclusao
- **Tabela de Itens Auditados**: Para cada item -- descricao, unidade, quantidade prevista, quantidade auditada, status (Conforme/Nao Conforme), observacao
- **Fotos de Evidencia**: Imagens capturadas pelo tecnico, incluidas inline no PDF
- **Resumo**: Total de itens, conformes, nao conformes
- **Rodape**: Data de geracao e paginacao

### 2. Alteracao: `src/components/auditoria/AuditoriaGestorView.tsx`

- Importar `generateAuditPDF` e `fetchAuditOrderItems`
- Adicionar botao com icone `FileText` (ou `Download`) em cada card de OS concluida
- Ao clicar, buscar os itens da OS, gerar o PDF e disparar o download automatico
- Mostrar estado de loading no botao durante a geracao

### 3. Alteracao: `src/lib/auditoriaDatabase.ts`

Nenhuma alteracao necessaria -- `fetchAuditOrderItems` ja existe e retorna todos os dados necessarios.

---

## Estrutura do PDF

```text
+------------------------------------------+
|  [VIVO]  RELATORIO DE AUDITORIA   OS XXX |
+------------------------------------------+
|                                          |
|  DADOS DA ORDEM DE SERVICO               |
|  +--------------------------------------+|
|  | OS: 586572212    Site: AMDM1         ||
|  | Motivo: Recuperacao de vandalismo    ||
|  | Tecnico: email@email.com            ||
|  | Prazo: 25/02/2026  Status: Concluido||
|  +--------------------------------------+|
|                                          |
|  ITENS AUDITADOS                         |
|  +----+----------+----+----+----+-------+|
|  | #  | Descr    | Un | Prev | Aud | St ||
|  +----+----------+----+----+----+-------+|
|  | 1  | Cabo ... | m  | 100  | 98  | OK||
|  | 2  | Conect...| UNI| 50   | 48  |NOK||
|  +----+----------+----+----+----+-------+|
|                                          |
|  RESUMO                                  |
|  Conformes: 8   Nao Conformes: 2        |
|                                          |
|  EVIDENCIAS FOTOGRAFICAS                 |
|  [foto1]  [foto2]  ...                   |
|                                          |
+------------------------------------------+
|  Gerado em DD/MM/AAAA  |  Pagina X de Y |
+------------------------------------------+
```

---

## Detalhes Tecnicos

### `src/lib/generateAuditPDF.ts`
- Usa `jsPDF` (ja instalado)
- Reutiliza as mesmas cores e helpers visuais do `generatePDF.ts` (VIVO_PURPLE, VIVO_ORANGE, etc.)
- Fotos sao carregadas via fetch e inseridas como imagem base64
- Funcao: `generateAuditPDF(order: AuditOrder, items: AuditOrderItem[], techEmail: string): Promise<Blob>`

### `src/components/auditoria/AuditoriaGestorView.tsx`
- Novo estado `generatingPdf` para rastrear qual OS esta gerando
- Botao visivel para todas as OS (nao apenas concluidas) para permitir relatorios parciais
- Download automatico com nome `Auditoria_OS_{os_number}_{site_code}.pdf`

### Ordem de implementacao
1. Criar `src/lib/generateAuditPDF.ts`
2. Atualizar `AuditoriaGestorView.tsx` com botao de download

