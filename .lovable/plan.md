

# Plano: Preservar Operadora ao Editar Relatório

## Problema

Quando um administrador VIVO edita um relatório criado por um técnico TEL (como o AMAXA), o campo `operadora` é sobrescrito para "VIVO". Isso acontece porque:

1. A funcao `buildReportRow()` define `operadora: data.operadora || 'VIVO'` (linha 291)
2. A funcao `updateReportInDatabase()` envia esse valor no UPDATE, sobrescrevendo o valor original no banco

O trigger no banco foi corrigido para nao alterar a operadora em UPDATEs, mas o problema esta no codigo do frontend que envia o valor explicitamente.

## Solucao

Remover os campos `operadora` e `user_id` do payload de UPDATE em `updateReportInDatabase()`, para que esses valores originais sejam preservados no banco de dados.

Tambem remover `created_date` e `created_time` para manter a data/hora original do relatorio.

## Alteracao

**Arquivo:** `src/lib/reportDatabase.ts`

Na funcao `updateReportInDatabase` (linhas 515-518), adicionar a remocao dos campos que nao devem ser alterados durante edicao:

```text
const row = buildReportRow(data);
// Remove fields that shouldn't be updated
delete row.id;
delete row.created_at;
delete row.created_date;   // preservar data original
delete row.created_time;   // preservar hora original
delete row.operadora;      // preservar empresa original (TEL/VIVO)
delete row.user_id;        // preservar autor original
```

## Correcao do Relatorio AMAXA

Apos aplicar a correcao no codigo, sera necessario corrigir manualmente o registro AMAXA que ja foi alterado incorretamente. Executaremos um UPDATE no banco para restaurar a operadora correta para "TEL".

## Impacto

- Apenas 1 arquivo modificado
- Nenhuma alteracao no banco de dados (schema)
- Correcao de dados para o relatorio AMAXA afetado
