# Check Vandalismo

Nova seção independente para técnicos registrarem vistorias em estações vandalizadas, com fotos, BO e checklist de vulnerabilidades, salvando tudo no banco para relatórios e dashboards futuros.

## Acesso

- Novo card "Check Vandalismo" no menu principal (Home), no mesmo padrão dos cards existentes.
- Rota protegida `/check-vandalismo` (formulário) e `/check-vandalismo/historico` (lista das vistorias do usuário; gestores/admin veem todas).

## Seção 1 — Identificação e Registro

- Sigla do site (texto, obrigatório; aceita padrões como PACRE e MNS_G1I01).
- Descrição detalhada do que foi vandalizado/furtado (área de texto ampla, obrigatória).
- Fotos do ocorrido: mínimo 3, máximo 20, com miniatura e botão remover.
- Boletim de Ocorrência: upload de PDF ou imagem (opcional), com nome do arquivo e link de visualização.
- Captura automática de geolocalização (mesmo padrão do checklist atual), quando disponível.

## Seção 2 — Vulnerabilidade do Site

Cada item tem foto(s) com pré-visualização + seletor Vulnerável / Não Vulnerável, com indicador visual (vermelho / verde).

Itens: placa do site; frente; laterais (múltiplas); portão; cadeado do portão; concertinas (4 fotos); Gab1 panorâmica; Gab1 cadeado; Gab2/Gab3/Gab4 panorâmica e cadeado (opcionais); esteiramento horizontal; esteiramento vertical; CME padrão concessionária panorâmica; cadeado do CME; QDCA panorâmica; cadeado do QDCA; luminária ou falta de luminária (2 fotos).

Regras:
- Itens Gab2–Gab4 só são exigidos se o técnico marcar que o gabinete existe.
- Marcar um item como "Vulnerável" exige pelo menos uma foto desse item.
- Contador de vulnerabilidades no topo, atualizado em tempo real.

## Finalizar e Relatório

- Botão "Finalizar e Salvar Vistoria" grava a vistoria, as mídias e os itens de vulnerabilidade.
- Após salvar, diálogo com opção de baixar/visualizar o "Relatório de Vandalismo e Vulnerabilidades" em PDF, contendo cabeçalho (site, técnico, data, localização), descrição, fotos do ocorrido, BO e a tabela/galeria de itens com status colorido.
- Rascunho local para não perder dados em campo; fotos vão para o storage assim que capturadas.

## Design

- Mobile-first, seções colapsáveis, botões grandes para captura pela câmera.
- Badges coloridos de status e barra de progresso do preenchimento.
- Segue os tokens de design já existentes na plataforma.

## Detalhes técnicos

- Banco (migração): `vandalismo_vistorias` (site_code, user_id, operadora, descrição, geolocalização, bo_url, status, timestamps), `vandalismo_fotos` (vistoria_id, categoria, url, ordem) e `vandalismo_itens` (vistoria_id, item_key, rótulo, vulneravel bool, fotos jsonb). GRANTs + RLS: técnico vê/edita apenas as próprias; gestor/admin veem todas conforme operadora, seguindo o padrão já usado em `reports`.
- Bucket de storage: reutiliza `report-photos` (privado) com prefixo `vandalismo/<site>/...`, exibindo via componente `SignedImage` já existente. BO em PDF entra no mesmo bucket.
- Upload reaproveita `usePhotoUpload` / compressão de imagem existentes (upload imediato, sem base64 em estado).
- PDF gerado com jsPDF, no mesmo estilo de `src/lib/generatePDF.ts`, com normalização de imagem já existente.
- Arquivos novos: `src/pages/CheckVandalismo.tsx`, `src/pages/CheckVandalismoHistorico.tsx`, `src/components/vandalismo/*` (seções e item de checklist), `src/lib/vandalismoDatabase.ts`, `src/lib/generateVandalismoPDF.ts`, `src/types/vandalismo.ts`; rotas em `App.tsx` e card em `Home.tsx`.
