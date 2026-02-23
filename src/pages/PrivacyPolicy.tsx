import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Política de Privacidade | InfraSites</title>
        <meta name="description" content="Política de Privacidade e Termos de Uso do sistema InfraSites, em conformidade com a LGPD." />
      </Helmet>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">Política de Privacidade</CardTitle>
              <p className="text-sm text-muted-foreground">Última atualização: 23 de fevereiro de 2026</p>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-lg font-semibold text-foreground">1. Introdução</h2>
                <p className="text-muted-foreground">
                  Esta Política de Privacidade descreve como o sistema InfraSites coleta, utiliza, armazena e protege
                  os dados pessoais dos seus usuários, em conformidade com a Lei Geral de Proteção de Dados Pessoais
                  (LGPD - Lei nº 13.709/2018).
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">2. Dados Coletados</h2>
                <p className="text-muted-foreground">Coletamos os seguintes dados pessoais:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>Dados de identificação:</strong> endereço de e-mail corporativo</li>
                  <li><strong>Dados de autenticação:</strong> senha (armazenada com hash criptográfico)</li>
                  <li><strong>Dados profissionais:</strong> empresa, área de atuação, cargo no sistema</li>
                  <li><strong>Dados de geolocalização:</strong> coordenadas GPS capturadas durante vistorias (com consentimento)</li>
                  <li><strong>Registros fotográficos:</strong> fotos de equipamentos de infraestrutura</li>
                  <li><strong>Logs de atividade:</strong> registros de ações administrativas para auditoria</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">3. Finalidade do Tratamento</h2>
                <p className="text-muted-foreground">Os dados são tratados para as seguintes finalidades:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Autenticação e controle de acesso ao sistema</li>
                  <li>Gestão de vistorias e relatórios de infraestrutura</li>
                  <li>Auditoria de ações administrativas</li>
                  <li>Atribuição de tarefas e acompanhamento de produtividade</li>
                  <li>Gamificação e ranking de desempenho</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">4. Base Legal</h2>
                <p className="text-muted-foreground">
                  O tratamento de dados pessoais é realizado com base no <strong>consentimento do titular</strong> (Art. 7º, I da LGPD)
                  e na <strong>execução de contrato</strong> (Art. 7º, V da LGPD) para prestação dos serviços de vistoria.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">5. Compartilhamento de Dados</h2>
                <p className="text-muted-foreground">
                  Os dados pessoais <strong>não são compartilhados com terceiros</strong>, exceto quando necessário para
                  o funcionamento do sistema (infraestrutura de hospedagem e banco de dados). Não realizamos venda
                  ou comercialização de dados pessoais.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">6. Segurança dos Dados</h2>
                <p className="text-muted-foreground">Adotamos medidas técnicas e organizacionais para proteger os dados:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Criptografia de senhas com algoritmos seguros (bcrypt)</li>
                  <li>Comunicação via HTTPS/TLS</li>
                  <li>Row Level Security (RLS) no banco de dados</li>
                  <li>Controle de acesso baseado em perfis (RBAC)</li>
                  <li>Logs de auditoria para rastreabilidade</li>
                  <li>Tokens JWT com expiração automática</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">7. Direitos do Titular</h2>
                <p className="text-muted-foreground">
                  Em conformidade com a LGPD, você possui os seguintes direitos sobre seus dados:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>Acesso:</strong> consultar seus dados pessoais na página de Perfil</li>
                  <li><strong>Correção:</strong> atualizar dados incorretos ou desatualizados</li>
                  <li><strong>Eliminação:</strong> solicitar a exclusão de seus dados ao administrador</li>
                  <li><strong>Portabilidade:</strong> solicitar exportação de seus dados</li>
                  <li><strong>Revogação do consentimento:</strong> solicitar a desativação da conta</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">8. Retenção de Dados</h2>
                <p className="text-muted-foreground">
                  Os dados pessoais são mantidos enquanto a conta do usuário estiver ativa. Após a exclusão da conta,
                  os dados são removidos em até 30 dias, exceto quando a retenção for necessária para cumprimento
                  de obrigações legais ou regulatórias.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">9. Contato</h2>
                <p className="text-muted-foreground">
                  Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados,
                  entre em contato com o administrador do sistema através da sua empresa.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
