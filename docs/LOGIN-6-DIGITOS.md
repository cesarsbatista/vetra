# VETRA — Login por e-mail com código de seis dígitos

## Projeto

- Organização Supabase: `cesarasbatista`
- Projeto: `VETRA`
- Projeto ID: `odmsrxqfuyphtqofegsj`
- Região: `sa-east-1`
- URL pública: `https://cesarsbatista.github.io/vetra/`
- Frontend: `index.html` + `supabase-config.js`
- Segurança: a configuração pública contém apenas a URL e a chave **publishable**, nunca `service_role`.

## Configuração necessária no painel Supabase

1. Abra [Authentication → Email Templates](https://supabase.com/dashboard/project/odmsrxqfuyphtqofegsj/auth/templates).
2. Edite o template **Magic Link** para enviar o token numérico (em vez de apenas o link). Exemplo de corpo HTML:

```html
<h2>Seu código de acesso VETRA</h2>
<p>Utilize este código para entrar no VETRA:</p>
<p style="font-size:32px;font-weight:700;letter-spacing:5px">{{ .Token }}</p>
<p>Se você não solicitou este acesso, ignore a mensagem.</p>
```

3. Abra [Authentication → URL Configuration](https://supabase.com/dashboard/project/odmsrxqfuyphtqofegsj/auth/url-configuration) e configure **Site URL** como `https://cesarsbatista.github.io/vetra/`. Adicione esse URL à lista de redirecionamentos se necessário.
4. Confirme que **Authentication → Providers → Email** está habilitado.
5. Para uso familiar regular, configure SMTP personalizado caso os limites ou restrições do envio-padrão do Supabase impeçam a entrega dos e-mails.

## Teste manual após os ajustes

1. Abra `https://cesarsbatista.github.io/vetra/` e selecione **Começar**.
2. Informe seu e-mail e clique em **Receber código**.
3. Copie os seis dígitos recebidos por e-mail e preencha os campos.
4. Confirme que o aplicativo abre com sessão válida.
5. Recarregue a página para verificar a persistência.
6. Toque no botão de perfil e escolha sair; confirme retorno à entrada.

## Limitações importantes

- A autenticação está ligada ao Supabase, mas as movimentações financeiras ainda estão salvas apenas no `localStorage`. Não há isolamento por usuário, sincronização ou compartilhamento entre dispositivos.
- O botão **Continuar no modo local** permanece disponível para testes.
- A criação de usuário por OTP está habilitada na chamada de frontend; antes de disponibilizar dados financeiros no banco, definir política de convites ou associação à família e RLS por `auth.uid()`.
- A conclusão da entrega dos e-mails e do fluxo real depende da configuração do template e de um teste com uma caixa postal válida.
