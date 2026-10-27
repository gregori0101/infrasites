# Monitoramento EPS
- [x] Criar entrada separada com validação segura da senha e registro de acessos.
- [x] Reutilizar o painel completo com carregamento protegido e manter o original.
- [x] Testar entrada, bloqueio de acesso e navegação.

# Contagem de vistorias
- [x] Corrigir paginação do dashboard, histórico e exportação sem alterar filtros de acesso.
- [x] Testar paginação: quatro testes passaram e a consulta autenticada recuperou 1421 registros únicos, igual ao total armazenado. A conta de teste é redirecionada à inicial, impedindo conferir o dashboard visualmente.

# Revisão de vistorias
- [x] Corrigir restauração do alvo de edição, mistura de dados ao iniciar atribuição e navegação na última etapa.
- [x] Validar todos os gabinetes antes do envio, proteger confirmação concorrente e preservar foto do PLC e evidências ao remover do formulário.
- [x] Executar nove testes de regressão; conferir checklist autenticado, recuperação após recarregar e bloqueio de envio incompleto. Não foi criada uma vistoria real para testar o envio completo.