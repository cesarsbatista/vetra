# Login VETRA com código de 6 dígitos

A interface V1.2 usa o fluxo Supabase Auth OTP, com seis caixas numéricas, entrada por e-mail, sessão persistida e saída. **Ainda não ativo:** preencher `supabase-config.js` com dados públicos de um projeto Supabase separado chamado VETRA.

## Configuração
1. Criar projeto **VETRA** na organização `cesarasbatista`, região São Paulo.
2. Copiar a URL do projeto e a chave **publishable** para `supabase-config.js`. Não inserir `service_role` ou chaves secretas no repositório.
3. No painel Supabase → Authentication → Email Templates → Magic Link, configurar corpo do e-mail com `{{ .Token }}`, para receber um OTP numérico em vez de apenas o magic link.
4. Garantir que Authentication → Providers → Email esteja habilitado e que os limites de envio de e-mail permitam testes; para uso real, configurar SMTP confiável.
5. Testar no site publicado o envio, a chegada do e-mail, o código, a sessão restaurada e a saída da conta.

## Segurança
O login não sincroniza automaticamente os lançamentos da V1: eles ainda ficam no `localStorage`. O modo local continua acessível. Não utilizar dados financeiros sensíveis enquanto o banco compartilhado e as políticas RLS não estiverem implementados.

## Documentação
https://supabase.com/docs/guides/auth/auth-email-templates
