# Plano de Migração: Fiber Guardian → InfraSites

## Status: Fase 1 Concluída ✅

### Fase 1 — Fundação (CONCLUÍDA)
- [x] Criar tabelas no banco (reparos, fotos_reparo, revisoes_reparo, atividades_reparo, metas_tecnico, fg_profiles)
- [x] Criar bucket de storage `fotos-reparos`
- [x] RLS policies para todas as tabelas
- [x] Realtime habilitado para reparos
- [x] Copiar tipos (`src/fiber-guardian/types/database.ts`)
- [x] Copiar constantes (`src/fiber-guardian/lib/constants.ts`)
- [x] Copiar gamification (`src/fiber-guardian/lib/gamification.ts`)
- [x] Copiar imageCompression (`src/fiber-guardian/lib/imageCompression.ts`)
- [x] Copiar offlineDb (`src/fiber-guardian/lib/offlineDb.ts`)
- [x] Criar auth compatibility wrapper (`src/fiber-guardian/hooks/useFGAuth.tsx`)
- [x] Copiar hooks: useOnlineStatus, useGeolocation
- [x] Adicionar botão "Auditoria TA" na Home
- [x] Criar página placeholder AuditoriaTA
- [x] Adicionar rota `/auditoria-ta` no App.tsx
- [x] Instalar dependência `idb`

### Fase 2 — Hooks de Dados (PENDENTE)
- [ ] Copiar/adaptar `useReparos.tsx` (usar `useFGAuth`, queries com `fg_profiles`)
- [ ] Copiar/adaptar `useRevisoes.tsx`
- [ ] Copiar/adaptar `useAtividades.tsx`
- [ ] Copiar/adaptar `useMetas.tsx`
- [ ] Copiar/adaptar `useSidebarCounts.tsx`

### Fase 3 — Componentes UI específicos do FG (PENDENTE)
- [ ] StatusBadge, CausaBadge, CategoriaBadge, TipoRedeBadge
- [ ] ConnectionStatus, PhotoPicker

### Fase 4 — Componentes de Funcionalidade (PENDENTE)
- [ ] filters/ (AdvancedFilters, MultiSelectFilter)
- [ ] revisao/ (RevisaoDialog, RevisaoList, ReenvioForm, RespostaTecnicoCard)
- [ ] admin/ (15 componentes)
- [ ] tecnico/ (10 componentes)
- [ ] analytics/, map/, shared/, enviar-vistoria/, layout/

### Fase 5 — Páginas (PENDENTE)
- [ ] NovoRegistro → `/auditoria-ta/novo-registro`
- [ ] TecnicoDashboard, AdminDashboard
- [ ] ReparoDetalhes → `/auditoria-ta/reparo/:id`
- [ ] MapaReparos (requer leaflet)
- [ ] Analytics, ExportarExcel, RankingGamificado
- [ ] CalendarioVistorias, EnviarVistoria

### Fase 6 — Dependências Extras (PENDENTE)
- [ ] leaflet, react-leaflet, react-leaflet-cluster
- [ ] CSS custom (variáveis status/causa)
- [ ] Tabela email_config

### Notas de Adaptação
- `useFGAuth` wraps AuthContext: admin+gestor→isAdmin, tecnico→isTecnico
- Queries a `profiles` usam `fg_profiles`
- Componentes UI padrão já existem — NÃO copiar
