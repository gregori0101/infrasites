

# Fase 2-5: Migracao Completa do Fiber Guardian

Este plano cobre a transferencia completa de todos os hooks, componentes e paginas do projeto Fiber Guardian para o modulo "Auditoria TA" deste projeto. A Fase 1 (banco de dados, tipos, constantes, hooks base) ja esta concluida.

---

## Fase 2 -- Hooks de Dados

Criar os hooks que fazem a ponte entre a interface e o banco de dados, adaptando imports de `useAuth` para `useFGAuth` e de `profiles` para `fg_profiles`.

**Arquivos a criar:**

1. `src/fiber-guardian/hooks/useReparos.tsx` (549 linhas)
   - Adaptar import: `useFGAuth` em vez de `useAuth`
   - Trocar queries de `profiles` por `fg_profiles`
   - Manter toda a logica de offline/sync/CRUD

2. `src/fiber-guardian/hooks/useRevisoes.tsx` (87 linhas)
   - Adaptar `useAuth` para `useFGAuth`
   - `profiles` para `fg_profiles`

3. `src/fiber-guardian/hooks/useAtividades.tsx` (78 linhas)
   - Adaptar `profiles` para `fg_profiles`
   - Exportar `registrarAtividade` como funcao standalone

4. `src/fiber-guardian/hooks/useMetas.tsx` (53 linhas)
   - Copiar direto, sem adaptacoes significativas

5. `src/fiber-guardian/hooks/useSidebarCounts.tsx` (74 linhas)
   - Adaptar `useAuth` para `useFGAuth`

---

## Fase 3 -- Componentes UI Especificos

Criar os componentes visuais exclusivos do Fiber Guardian dentro de `src/fiber-guardian/components/ui/`:

1. `status-badge.tsx` -- Badge de status com cores customizadas
2. `causa-badge.tsx` -- Badge de causa com cor inline
3. `categoria-badge.tsx` -- Badge de categoria com icone
4. `tipo-rede-badge.tsx` -- Badge de tipo de rede (BBN/BBR/B2B)
5. `connection-status.tsx` -- Indicador online/offline/sync
6. `photo-picker.tsx` -- Seletor camera/galeria com popover

Todos os imports internos apontam para `@/fiber-guardian/types/database` e `@/fiber-guardian/lib/constants`.

---

## Fase 4 -- Componentes de Funcionalidade

Migrar os componentes complexos em subdiretorios, todos para `src/fiber-guardian/components/`:

### Filtros (`filters/`)
- `AdvancedFilters.tsx`
- `MultiSelectFilter.tsx`

### Revisao (`revisao/`)
- `RevisaoDialog.tsx`
- `RevisaoList.tsx`
- `ReenvioForm.tsx`
- `RespostaTecnicoCard.tsx`

### Admin (`admin/`)
- `ReparoDrilldown.tsx`
- `CadastroUsuarioDialog.tsx`
- `UsuariosLista.tsx`
- `EmailConfigDialog.tsx`
- `AdicionarVistoriaDialog.tsx`
- `RelatorioConfigDialog.tsx`
- `DashboardSLA.tsx`
- `KPIsAvancados.tsx`
- `KPIComparativoRede.tsx`
- `KPIEvolucaoMensal.tsx`
- `PainelProdutividade.tsx`
- `PainelProdutividadeDetalhado.tsx`
- `SugestaoTecnico.tsx`
- `VistoriasPendentesConsolidado.tsx`
- `EditarReparoDialog.tsx`

### Tecnico (`tecnico/`)
- `TecnicoReparoDrilldown.tsx`
- `MiniRankingCard.tsx`
- `AtividadeSemanal.tsx`
- `ChecklistSeguranca.tsx`
- `CronometroTrabalho.tsx`
- `EditableObservationCard.tsx`
- `FilaSincronizacao.tsx`
- `MetaMensalCard.tsx`
- `RelatorioDiario.tsx`
- `VoiceInput.tsx`

### Outros
- `shared/AtividadeTimeline.tsx`
- `analytics/MetasTecnicos.tsx`
- `map/UserLocationMarker.tsx`
- `enviar-vistoria/EnvioLoteForm.tsx`
- `layout/AppLayout.tsx` (adaptado para FG -- usa sidebar proprio)
- `layout/NotificacoesDropdown.tsx`
- `layout/BuscaGlobal.tsx`
- `AppSidebar.tsx`

**Adaptacoes em todos os componentes:**
- `useAuth` -> `useFGAuth`
- `@/types/database` -> `@/fiber-guardian/types/database`
- `@/lib/constants` -> `@/fiber-guardian/lib/constants`
- `@/lib/gamification` -> `@/fiber-guardian/lib/gamification`
- `@/hooks/useReparos` -> `@/fiber-guardian/hooks/useReparos`
- (similar para useRevisoes, useAtividades, useMetas, useSidebarCounts)
- UI components (Button, Card, etc.) continuam usando `@/components/ui/`

---

## Fase 5 -- Paginas e Rotas

Criar as paginas em `src/fiber-guardian/pages/`:

1. `NovoRegistro.tsx` (860 linhas) -- Formulario completo de novo reparo
2. `TecnicoDashboard.tsx` (242 linhas) -- Dashboard do tecnico
3. `AdminDashboard.tsx` (1111 linhas) -- Dashboard administrativo
4. `ReparoDetalhes.tsx` (1243 linhas) -- Detalhes e acoes de um reparo
5. `Analytics.tsx` (817 linhas) -- Graficos e estatisticas
6. `ExportarExcel.tsx` (356 linhas) -- Exportacao de dados
7. `RankingGamificado.tsx` (316 linhas) -- Ranking entre tecnicos
8. `CalendarioVistorias.tsx` (286 linhas) -- Calendario de prazos
9. `EnviarVistoria.tsx` (377 linhas) -- Envio e agendamento
10. `PerfilTecnico.tsx` (203 linhas) -- Perfil e conquistas
11. `MapaReparos.tsx` (574 linhas) -- Mapa interativo (requer leaflet)

**Atualizar rotas em `App.tsx`:**

```text
/auditoria-ta                -> Landing page (ja existe)
/auditoria-ta/novo-registro  -> NovoRegistro
/auditoria-ta/dashboard      -> Dashboard router (admin/tecnico)
/auditoria-ta/reparo/:id     -> ReparoDetalhes
/auditoria-ta/mapa           -> MapaReparos
/auditoria-ta/analytics      -> Analytics
/auditoria-ta/exportar       -> ExportarExcel
/auditoria-ta/ranking        -> RankingGamificado
/auditoria-ta/calendario     -> CalendarioVistorias
/auditoria-ta/enviar         -> EnviarVistoria
/auditoria-ta/perfil         -> PerfilTecnico
```

**Atualizar `AuditoriaTA.tsx`** (landing page) para ter links de navegacao para todas as sub-paginas, mostrando opcoes diferentes para admin vs tecnico.

---

## Fase 6 -- CSS e Dependencias

### CSS (`src/index.css`)
Adicionar ao final as variaveis e classes CSS exclusivas do FG:
- Variaveis `--status-pendente`, `--status-enviado`, `--status-revisao`, `--status-concluido`
- Variaveis `--success`, `--warning`, `--info` e `--sync-*`
- Classes `.glass-header`, `.page-enter`, `.stagger-list`, `.card-interactive`, `.status-badge`, `.causa-badge`, `.branded-loader`, `.shimmer-skeleton`, `.field-button`
- Estilos de leaflet (`.leaflet-container`, `.leaflet-popup-content-wrapper`)
- Calendar day markers

### Dependencias extras
- `leaflet`, `react-leaflet`, `react-leaflet-cluster` (para mapa)
- `uuid` (ja instalado)
- `jspdf` (ja instalado)
- `xlsx` (ja instalado)

### Tabela extra (banco)
- `email_config` -- tabela para configuracao de destinatarios de email (usada pelo AdminDashboard)

---

## Ordem de Execucao

Devido ao tamanho do projeto (~50 arquivos, ~7000+ linhas), a implementacao sera feita em blocos sequenciais:

1. **Bloco A**: CSS + Hooks (Fase 2 + 6 parcial)
2. **Bloco B**: UI badges + PhotoPicker + ConnectionStatus (Fase 3)
3. **Bloco C**: Componentes filters + revisao (Fase 4 parcial)
4. **Bloco D**: Componentes admin + tecnico (Fase 4 restante)
5. **Bloco E**: Paginas simples (NovoRegistro, TecnicoDashboard, ReparoDetalhes)
6. **Bloco F**: Paginas complexas (AdminDashboard, Analytics, Mapa) + rotas
7. **Bloco G**: Paginas restantes + leaflet + tabela email_config

Cada bloco sera uma mensagem de implementacao separada para manter a qualidade.

