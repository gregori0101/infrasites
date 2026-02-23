

# Plano: Modulo Auditoria de Ordens de Servico (OS)

## Visao Geral

Criar um sistema completo de auditoria de OS onde gestores/administradores criam ordens de servico com itens a serem auditados, atribuem a tecnicos, e os tecnicos realizam a vistoria item a item no campo.

---

## 1. Estrutura do Banco de Dados

Duas novas tabelas serao criadas:

### Tabela `audit_orders`
Armazena as ordens de servico criadas pelos gestores.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid (PK) | Identificador unico |
| os_number | text | Numero da OS (ex: 586572212) |
| site_code | text | Sigla do site (ex: AMDM1) |
| motivo | text | Motivo da OS (ex: Recuperacao de vandalismo) |
| technician_id | uuid | Tecnico atribuido |
| created_by | uuid | Gestor que criou |
| status | text | pendente / em_andamento / concluido |
| deadline | date | Prazo (opcional) |
| notes | text | Observacoes gerais |
| completed_at | timestamptz | Data de conclusao |
| created_at | timestamptz | Data de criacao |

### Tabela `audit_order_items`
Armazena os itens individuais de cada OS para auditoria.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid (PK) | Identificador unico |
| order_id | uuid (FK) | Referencia a audit_orders |
| descricao | text | Denominacao Mat./Serv. |
| unidade | text | Unidade (m, UNI, m2, m3, M) |
| quantidade | numeric | Quantidade prevista |
| quantidade_auditada | numeric | Quantidade verificada pelo tecnico |
| status | text | pendente / conforme / nao_conforme |
| observacao | text | Observacao do tecnico |
| foto_url | text | Foto de evidencia |
| audited_at | timestamptz | Data da auditoria do item |

### Politicas RLS
- Gestores/Admins: CRUD completo em ambas tabelas
- Tecnicos: SELECT e UPDATE apenas nas OS atribuidas a eles

---

## 2. Paginas e Componentes

### 2.1 Pagina de Gestao de OS (`/auditoria`)
Para gestores e administradores:
- Listagem de todas as OS criadas com filtros por status e tecnico
- Botao para criar nova OS
- Dialog de criacao com campos: numero OS, sigla site, motivo, tecnico, prazo
- Tabela para adicionar itens (descricao, unidade, quantidade) com botao de adicionar linha
- Visualizacao do progresso de auditoria de cada OS

### 2.2 Pagina do Tecnico na Auditoria (`/auditoria`)
Para tecnicos:
- Lista de OS atribuidas (caixa de entrada similar ao TechnicianInbox)
- Ao clicar numa OS, abre a tela de auditoria item a item
- Para cada item: campo de quantidade auditada, status (conforme/nao conforme), observacao e foto
- Botao de finalizar auditoria da OS

### 2.3 Componentes novos
| Componente | Descricao |
|------------|-----------|
| `src/pages/AuditoriaOS.tsx` | Reescrever - pagina principal com logica de role |
| `src/components/auditoria/AuditoriaGestorView.tsx` | Tela do gestor com lista e criacao de OS |
| `src/components/auditoria/AuditoriaCreateDialog.tsx` | Dialog para criar OS com itens |
| `src/components/auditoria/AuditoriaTechnicianView.tsx` | Caixa de entrada do tecnico |
| `src/components/auditoria/AuditoriaExecucao.tsx` | Tela de execucao da auditoria item a item |
| `src/lib/auditoriaDatabase.ts` | Funcoes de acesso ao banco |

---

## 3. Fluxo do Usuario

**Gestor/Admin:**
1. Acessa "/auditoria" e ve a lista de OS criadas
2. Clica em "Nova OS" e preenche numero, sigla site, motivo
3. Adiciona itens na tabela (descricao, unidade, quantidade)
4. Seleciona o tecnico responsavel e define prazo
5. Salva a OS - tecnico recebe na sua caixa de entrada
6. Acompanha o progresso da auditoria

**Tecnico:**
1. Acessa "/auditoria" e ve suas OS pendentes
2. Clica numa OS para iniciar a auditoria
3. Para cada item: informa quantidade auditada, marca conforme/nao conforme, adiciona observacao e foto se necessario
4. Finaliza a auditoria da OS

---

## 4. Detalhes Tecnicos

### Migracao SQL

```sql
-- Tipo enum para status da OS
CREATE TYPE audit_order_status AS ENUM ('pendente', 'em_andamento', 'concluido');
CREATE TYPE audit_item_status AS ENUM ('pendente', 'conforme', 'nao_conforme');

-- Tabela de ordens de servico
CREATE TABLE public.audit_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  os_number text NOT NULL,
  site_code text NOT NULL,
  motivo text NOT NULL,
  technician_id uuid NOT NULL,
  created_by uuid NOT NULL,
  status audit_order_status NOT NULL DEFAULT 'pendente',
  deadline date,
  notes text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela de itens da OS
CREATE TABLE public.audit_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.audit_orders(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  unidade text NOT NULL DEFAULT '',
  quantidade numeric NOT NULL DEFAULT 0,
  quantidade_auditada numeric,
  status audit_item_status NOT NULL DEFAULT 'pendente',
  observacao text,
  foto_url text,
  audited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.audit_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_order_items ENABLE ROW LEVEL SECURITY;

-- Policies para audit_orders
CREATE POLICY "Gestors and admins can manage audit orders"
  ON public.audit_orders FOR ALL
  USING (has_role(auth.uid(), 'administrador') OR has_role(auth.uid(), 'gestor'));

CREATE POLICY "Technicians can view own audit orders"
  ON public.audit_orders FOR SELECT
  USING (technician_id = auth.uid());

CREATE POLICY "Technicians can update own audit orders"
  ON public.audit_orders FOR UPDATE
  USING (technician_id = auth.uid());

-- Policies para audit_order_items (via order ownership)
CREATE POLICY "Gestors and admins can manage audit items"
  ON public.audit_order_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.audit_orders
    WHERE id = audit_order_items.order_id
    AND (has_role(auth.uid(), 'administrador') OR has_role(auth.uid(), 'gestor'))
  ));

CREATE POLICY "Technicians can view own audit items"
  ON public.audit_order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.audit_orders
    WHERE id = audit_order_items.order_id
    AND technician_id = auth.uid()
  ));

CREATE POLICY "Technicians can update own audit items"
  ON public.audit_order_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.audit_orders
    WHERE id = audit_order_items.order_id
    AND technician_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_audit_orders_technician ON public.audit_orders(technician_id);
CREATE INDEX idx_audit_orders_status ON public.audit_orders(status);
CREATE INDEX idx_audit_order_items_order ON public.audit_order_items(order_id);
```

### Arquivos envolvidos

| Arquivo | Acao |
|---------|------|
| `src/lib/auditoriaDatabase.ts` | Criar - funcoes CRUD para ordens e itens |
| `src/pages/AuditoriaOS.tsx` | Reescrever - router por role (gestor vs tecnico) |
| `src/components/auditoria/AuditoriaGestorView.tsx` | Criar - lista e gestao de OS |
| `src/components/auditoria/AuditoriaCreateDialog.tsx` | Criar - formulario de criacao com itens |
| `src/components/auditoria/AuditoriaTechnicianView.tsx` | Criar - inbox do tecnico |
| `src/components/auditoria/AuditoriaExecucao.tsx` | Criar - auditoria item a item |

### Ordem de implementacao
1. Migracao SQL (tabelas + RLS + indexes)
2. `auditoriaDatabase.ts` (funcoes de acesso)
3. Componentes do gestor (lista + criacao)
4. Componentes do tecnico (inbox + execucao)
5. Reescrever `AuditoriaOS.tsx` como roteador por role

