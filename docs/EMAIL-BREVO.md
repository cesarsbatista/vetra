# VETRA — Brevo SMTP + Supabase OTP de 6 dígitos

Este é o mesmo padrão documentado no projeto ORBITRIP (`docs/V3.4-EMAIL-BREVO.md`), aplicado ao VETRA.

## Situação

- Organização Supabase: `cesarasbatista`
- Projeto exclusivo: `VETRA`
- Projeto: https://supabase.com/dashboard/project/odmsrxqfuyphtqofegsj
- Supabase Auth ligado à interface do app por URL e chave **publishable**.
- Frontend com seis caixas, `signInWithOtp`, `verifyOtp`, sessão persistente e saída.
- Pendente: configurar SMTP transacional e templates no painel; testar e-mail real. O repositório NÃO contém credenciais SMTP.

## 1. Usar o Brevo (mesmo fornecedor do ORBITRIP)

Abra a conta Brevo utilizada no ORBITRIP, se disponível. Pode usar o mesmo provedor e remetente **se estiverem autorizados na conta**, mas o projeto VETRA precisa da sua própria configuração SMTP no painel do Supabase.

Verifique na conta Brevo se o acesso a e-mails transacionais está ativo. Não envie suas credenciais a terceiros.

URL de configuração da Brevo: https://app.brevo.com/settings/keys/smtp

## 2. Configurar SMTP no Supabase VETRA

Abra: https://supabase.com/dashboard/project/odmsrxqfuyphtqofegsj/auth/smtp

Preencha:

| Campo | Valor |
|---|---|
| Enable Custom SMTP | Ativado |
| Sender name | VETRA |
| Sender email | Endereço remetente autorizado no Brevo |
| Host | smtp-relay.brevo.com |
| Port | 587 (STARTTLS) |
| Username | Login SMTP exibido no Brevo |
| Password | Chave SMTP do Brevo (não a API key) |

**Importante:** SMTP user, password e dados secretos só no painel Supabase. Nunca adicionar credenciais a `supabase-config.js`, `index.html` ou commits GitHub.

Se o remetente do ORBITRIP estiver autorizado, é possível reutilizá-lo; a identificação visual dos e-mails será VETRA. Para exibir um endereço de remetente diferente, verifique-o previamente no Brevo.

## 3. Configurar o template OTP

Acesse https://supabase.com/dashboard/project/odmsrxqfuyphtqofegsj/auth/templates

Edite **Magic link or OTP** e substitua o corpo HTML pelo conteúdo de [`supabase/email-otp-template.html`](../supabase/email-otp-template.html). Mantenha literalmente `{{ .Token }}` — esta variável é o código enviado pelo Supabase.

Para o primeiro cadastro, confirme também o template **Confirm signup** caso o provedor envie esse modelo em vez do OTP esperado.

## 4. Configurar URL

Abra https://supabase.com/dashboard/project/odmsrxqfuyphtqofegsj/auth/url-configuration

Defina Site URL: `https://cesarsbatista.github.io/vetra/`

Adicione esse mesmo endereço em Redirect URLs quando necessário. Primeiro confira em GitHub → Settings → Pages se o deploy está ativo.

## 5. Verificação

1. Abra o VETRA e selecione **Começar**.
2. Informe o seu e-mail.
3. Verifique recebimento do OTP de **6 dígitos** (inclusive spam).
4. Digite o código; confira que a sessão é autenticada.
5. Recarregue e teste se a sessão persiste.
6. Saia da conta e tente novo login.
7. Repita com o e-mail da Ana Cristina.

Os envios podem estar sujeitos a limites ou bloqueios de segurança do Supabase e da Brevo.

## Limitações

O login não significa que os dados financeiros estejam na nuvem. Nesta V1, os lançamentos permanecem no armazenamento local do navegador, sem isolamento por conta. Não usar informações financeiras sensíveis até serem criadas as tabelas compartilhadas e políticas RLS. Não desative confirmação de e-mail como atalho para a configuração.
