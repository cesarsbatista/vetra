# VETRA V2

Aplicativo financeiro familiar desenvolvido para **desktop** e **iPhone**, com identidade visual monocromática inspirada no ORBITRIP. A versão V2 substitui a interface V1.4 e preserva o projeto de autenticação e orçamento familiar do Supabase.

**Acessar:** https://cesarsbatista.github.io/vetra/

## Funcionalidades da V2

- Identidade: preto, branco e cinza; cards discretos, cabeçalho com **＋ Novo lançamento**, menu lateral no desktop e barra de navegação no mobile.
- **Início:** saldo realizado, saldo projetado, receitas, despesas fixas e variáveis, evolução patrimonial e categorias.
- **Novo lançamento:** **Despesa | Receita | Investimento**; em Despesa, pagamento Crédito, Débito, Pix ou Dinheiro.
- **Crédito:** cartão cadastrado e modalidade À vista ou Parcelado de 2–24 vezes. No conjunto, o limite total é 1–24 parcelas; cada parcela entra na fatura de vencimento adequada à data de fechamento. O sistema reparte os centavos sem diferenças no valor total.
- **Débito/Pix:** selecionar a conta cadastrada.
- **Receitas:** campo Origem; categorias próprias como Salário, Benefícios e Empréstimos; sem subcategoria.
- **Despesas variáveis:** campo Estabelecimento / Serviço, categorias específicas como Supermercado e Roupas; sem subcategoria.
- **Cartões:** aba independente com faturas mensais, compras, parcelas e confirmação de pagamento sem duplicidade de lançamento.
- **Investimentos:** aba independente, carteira, aplicações, saldos mensais informados, aportes, resgates, rendimentos estimados e gráfico de evolução semestral.
- **Planejamento:** orçamento mensal e cadastro de despesas fixas recorrentes, com mensalidade ou anualidade, vencimento, valor previsto, confirmação do pagamento mensal, datas e prestações finitas.
- **Configurações:** gerenciamento de cartões (nome, titular, apelido, bandeira, últimos quatro dígitos, fechamento/vencimento, principal e ordenação), cadastro de contas bancárias nacionais e internacionais, orçamento familiar, backups e sair.
- Miniatura de cartão de crédito baseada em características visuais de alguns bancos/modelos, com logotipos de bancos provenientes de arquivos públicos Wikimedia Commons quando disponíveis; trata-se de **ilustração**, não reprodução oficial do cartão.
- Dados compartilhados via Supabase, com controle de revisão e políticas de segurança RLS já instaladas.

## Fluxos principais

### Preparar contas e cartões
1. Entrar no aplicativo com o código OTP de 6 dígitos.
2. Abrir **Configurações → Contas** e cadastrar as contas bancárias.
3. Abrir **Configurações → Cartões** e editar/cadastrar os cartões.
4. Abrir **＋ Novo lançamento**, selecionar **Despesa**, a forma de pagamento e o cartão/conta correspondente.

### Cadastrar despesa fixa
1. Entrar em **Planejamento → Despesas fixas → Adicionar despesa fixa**.
2. Preencher vencimento, valor, categoria, periodicidade e datas.
3. Acompanhar os compromissos de cada mês e clicar em **Pagar** para confirmar a quitação e ajustar o valor efetivo.

### Registrar investimento
1. Entrar em **Investimentos → Adicionar investimento**.
2. Preencher nome, instituição, tipo e saldo inicial.
3. Em cada mês, clicar em **Atualizar mês** para registrar saldo final, aportes e resgates. O rendimento financeiro é calculado por diferença: saldo final − saldo anterior − aportes + resgates.

## Compatibilidade, sincronização e cuidados

O VETRA V2 reutiliza o JSON compartilhado em `public.vetra_finances`: `items`, `cards`, `budgets`, `settings`, mais `accounts`, `fixed` e `investments`. Nenhuma tabela foi excluída ou substituída. Dados antigos continuam preservados. Categorias antigas permanecem disponíveis ao editar lançamentos legados.

O orçamento familiar usa associações por convite e Row Level Security. O navegador usa apenas a chave **publishable** do Supabase.

**Recomenda-se exportar um backup JSON antes de fazer mudanças extensas.** A V2 não mescla automaticamente conflitos simultâneos de edição, não funciona como extrato bancário automático e não busca rendimento real de investimentos: são valores informados manualmente. Para cartões, não há integração com emissores, estorno automatizado nem cálculo de juros.

**Miniaturas:** os esquemas de cores são aproximações visuais, mesmo quando baseados em referências públicas; o VETRA não deve ser utilizado para verificar a autenticidade de cartões.

## Estrutura técnica

- `index.html`: entrada OTP e carregamento dos módulos.
- `v2.js`: UI e regras do financeiro.
- `v2.css`: identidade visual responsiva.
- `cloud.js`: orçamento compartilhado, convites, Realtime e controle de revisão.
- `supabase-config.js`: URL pública e chave publishable.
- `docs/V2-IMPLEMENTACAO.md`: escopo, testes e limitações.

**Qualidade:** testes de sintaxe e simulações de criação de cartão/conta, dez parcelas, obrigação fixa e saldo de investimento foram realizados; testes visuais e uso simultâneo com dois usuários reais devem ser feitos antes de tratar a versão como plenamente validada.
