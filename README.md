# VETRA — Finanças compartilhadas

Aplicativo de controle financeiro pessoal e familiar com acesso por e-mail, código OTP de seis dígitos, orçamento compartilhado e versões responsivas para **iPhone 16 Pro Max** e **desktop**.

**Aplicativo:** https://cesarsbatista.github.io/vetra/

## V1.3 — Implementado

- Supabase Auth independente do ORBITRIP, com código OTP de 6 dígitos e sessão persistente.
- Orçamento familiar compartilhado: uma pessoa cria o orçamento, a segunda recebe convite vinculado ao seu e-mail e o aceita ao entrar.
- Banco de dados PostgreSQL no Supabase, protegido por políticas RLS por participação no orçamento.
- Sincronização entre dispositivos via Supabase Realtime, com controle de revisão contra sobrescrita simultânea.
- Painel mensal, despesas e receitas previstas/realizadas, investimentos, cartões e planejamento.
- Categorias originais da planilha de controle financeiro.
- Exportação CSV, backup JSON e importação explícita de lançamentos locais antigos.
- Interface móvel com navegação inferior e interface desktop com menu lateral e área de trabalho ampliada.
- Modo local opcional para testes sem sincronização.

## Uso

1. Abra o aplicativo e faça login com seu e-mail e o OTP recebido.
2. Selecione **Criar orçamento familiar** no primeiro acesso.
3. Em **Mais**, crie um convite para o e-mail da segunda pessoa.
4. A pessoa entra com o próprio e-mail, aceita o convite e passa a utilizar os mesmos dados.
5. Se houver registros antigos neste navegador, abra **Mais → Importar meus lançamentos locais** após fazer backup.

**Convites não enviam e-mail automaticamente nesta versão**: o proprietário deve avisar a pessoa convidada.

## Desenvolvimento

Aplicação estática (HTML, CSS, JavaScript) com Supabase. Hospedagem por GitHub Pages. A chave em `supabase-config.js` é uma **publishable key pública**; não há chaves secretas no frontend.

Consulte o guia completo: [V1.3 — Banco compartilhado e layouts](docs/V1.3-CLOUD-RESPONSIVO.md).

## Limitações

- Cartões e investimentos ainda têm recursos simplificados (sem parcelamentos automáticos ou rentabilidade).
- Conflitos de edição não são mesclados automaticamente; exporte um backup JSON antes de atualizar se houver aviso de sincronização.
- Não há operação offline sincronizada.
- A importação legada é explícita e inclui lançamentos, não todos os ajustes de orçamento/cartões.
- O fluxo completo deve ser testado com as duas contas em seus dispositivos antes de ser utilizado como controle financeiro definitivo.
