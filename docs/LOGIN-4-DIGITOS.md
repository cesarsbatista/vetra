# VETRA — Autenticação com código de 4 dígitos

## Situação da V1.1

Implementado: página de abertura inspirada na capa do ORBITRIP; formulário de e-mail; quatro caixas de entrada numéricas com avanço automático e suporte a colagem; modo local separado.

**Ainda não implementado:** entrega de código por e-mail, verificação no servidor, sessão de usuário, proteção do banco de dados ou sincronização entre dispositivos. A interface nunca deve tratar um código digitado como autenticação bem-sucedida.

## Observação sobre Supabase

O código OTP nativo por e-mail do Supabase exige entre 6 e 10 dígitos. Para obedecer à exigência de exatamente quatro dígitos, usar um backend de autenticação personalizado, sem armazenar segredo ou lógica de verificação no frontend.

O projeto Supabase existente ORBITRIP não deve ser reaproveitado para dados financeiros do VETRA.

## Requisitos mínimos de implementação

1. Criar projeto Supabase independente para VETRA e configurar um serviço de envio de e-mails.
2. A geração do código deve usar gerador criptograficamente seguro no backend; nunca `Math.random()`.
3. Código de 4 dígitos de uso único, expiração de no máximo 5 minutos e armazenamento apenas de hash com segredo do servidor.
4. Aplicar rate limit por e-mail, IP e dispositivo; no máximo 3 tentativas por código; cooldown para reenvio e bloqueios progressivos.
5. Mensagens indistinguíveis para e-mails cadastrados ou não, proteção anti-bot e logs sem códigos ou dados sensíveis.
6. Criar sessão de verdade após a verificação, preferencialmente apoiada no Supabase Auth ou em backend que emita cookies HttpOnly Secure SameSite com escopo apropriado; proteger os dados financeiros com RLS e vínculo de famílias.
7. Testar abusos, expiração, reenvio, replay e troca de conta antes de liberar operações financeiras autenticadas.

**Nota:** Um código com 10.000 combinações tem baixa entropia, portanto proteções servidoras rigorosas são obrigatórias.
