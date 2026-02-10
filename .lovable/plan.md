

# Acesso do Gestor TEL ao Dashboard

## Situacao Atual

Apos analise completa do codigo, o dashboard **ja esta acessivel** para gestores da empresa TEL. O sistema possui todas as pecas necessarias:

1. **Rota protegida**: A rota `/dashboard` exige apenas o cargo `gestor`, independente da empresa (VIVO ou TEL)
2. **Filtro de dados**: Usuarios TEL automaticamente recebem o filtro `operadora = 'TEL'`, vendo apenas relatorios da empresa TEL (atualmente existem 4 relatorios TEL no banco)
3. **Politicas de acesso**: As regras de seguranca do banco permitem que gestores leiam todos os relatorios
4. **Redirecionamento**: Gestores em desktop sao automaticamente redirecionados para o dashboard ao fazer login

## Possivel Problema

Se o gestor TEL nao esta conseguindo ver o dashboard, as causas mais provaveis sao:

- **Poucos dados**: Existem apenas 4 relatorios da empresa TEL no banco, o que pode dar a impressao de dashboard vazio
- **Acesso mobile**: Em dispositivos moveis, gestores nao sao redirecionados automaticamente para o dashboard -- precisam navegar manualmente via menu

## Melhorias Propostas

Para garantir uma experiencia completa para gestores TEL, as seguintes melhorias serao implementadas:

### 1. Indicador visual de empresa no dashboard
Adicionar um badge/indicador no cabecalho do dashboard mostrando qual empresa esta sendo visualizada (ex: "Empresa: TEL"), para que o gestor TEL saiba que esta vendo dados filtrados da sua empresa.

### 2. Mensagem quando nao ha dados
Adicionar uma mensagem amigavel quando o dashboard nao possui relatorios para exibir, informando que ainda nao existem vistorias registradas para a empresa, em vez de mostrar apenas zeros.

## Detalhes Tecnicos

### Arquivo: `src/pages/Dashboard.tsx`

**Alteracao 1 - Badge de empresa no cabecalho:**
- Adicionar abaixo do titulo "Dashboard Executivo" um badge indicando a empresa ativa
- Para usuarios TEL: mostrar "Empresa: TEL"  
- Para usuarios VIVO com filtro ativo: mostrar "Empresa: VIVO" ou "Empresa: TEL"
- Para usuarios VIVO sem filtro: mostrar "Todas as Empresas"

**Alteracao 2 - Estado vazio amigavel:**
- Quando `reports.length === 0` e nao esta carregando, mostrar mensagem informativa
- Texto: "Nenhuma vistoria encontrada para a empresa [NOME]. As vistorias aparecerao aqui conforme forem realizadas pelos tecnicos."

Nenhuma alteracao de banco de dados e necessaria. As politicas de seguranca e o fluxo de dados ja estao corretos.
