# VETRA V2 — Especificações implementadas

Data: 21/11/2026

## Identidade visual

Paleta principal: branco, preto e cinza inspirada no ORBITRIP. Menu lateral no desktop a partir de 900 px; navegação inferior com seis atalhos no mobile. Botão **＋ Novo lançamento** no topo direito. A saída da conta fica em Configurações.

## Navegação

1. Início — indicadores financeiros.
2. Lançamentos — histórico por mês.
3. Cartões — compras e faturas, sem misturar com cadastro.
4. Investimentos — carteira e evolução de saldos mensais.
5. Planejamento — orçamento e despesas fixas.
6. Configurações — Cartões, Contas, Família e Dados.

## Regra de despesas variáveis

Primeiro campo: **Pagamento** (Crédito, Débito, Pix, Dinheiro).
- Crédito: escolher Cartão; escolher À vista ou Parcelado; parcelamento 2–24, equivalente à faixa 1–24 com À vista = 1.
- Débito/Pix: escolher Conta.
- Dinheiro: sem campo adicional.
- Campos seguintes: Valor total, Estabelecimento / Serviço, Categoria, Data, Situação, Observações. Sem Subcategoria.
- Cartões legados do tipo `cartao` continuam reconhecidos como despesas.

## Parcelamentos e faturas

Cada parcela tem ID próprio, referência de grupo, número e total. A data de fechamento e o vencimento do cartão determinam em qual mês fica a primeira fatura, e as seguintes são distribuídas mensalmente. O valor da compra é dividido em centavos, e o último lançamento absorve eventual arredondamento.

A tela Cartões exibe as compras de cada mês por cartão e permite marcar a fatura como paga/reabri-la alterando o status dos lançamentos, **sem adicionar outra despesa**.

O fluxo simplificado não contempla juros de financiamento calculados automaticamente, pagamento parcial, estorno, adiantamento de parcelas ou fusos internacionais. Se uma compra for editada com parcelamento, a substituição se aplica ao conjunto para não gerar registros duplicados.

## Receitas

Campo Origem substitui Descrição. Categorias: Salário, Investimentos, Benefícios, Empréstimos, 13º salário, Férias, Reembolsos, Outras receitas. Não existe Subcategoria.

## Despesas fixas

Cadastros com valor padrão, vencimento, pagamento, periodicidade mensal/anual, data inicial e final, parcela inicial e total de prestações opcional. Registros por mês armazenam valor efetivo, situação pago/não pago e data do pagamento.

O compromisso mensal é contabilizado uma vez no valor previsto ou realizado; a confirmação da quitação não cria um segundo lançamento.

## Contas

Configurações → Contas: banco (texto livre com sugestões), tipo Nacional/Internacional, apelido. Contas podem ser vinculadas a pagamentos por Pix ou Débito. Não há acesso às contas reais nem conexão Open Finance.

## Investimentos

Registros por aplicação com instituição, tipo e saldo inicial. Atualizações mensais de saldo final, aporte e resgate. Rendimento absoluto estimado = saldo final − saldo anterior − aportes + resgates; rentabilidade percentual ilustrativa usa o capital inicial do mês e não corresponde a TIR em meses com fluxos. Gráfico dos últimos seis meses.

## Dados existentes e segurança

O Supabase VETRA `odmsrxqfuyphtqofegsj` permanece com as tabelas anteriores. Nenhuma limpeza ou alteração destrutiva aplicada. JSON remoto foi estendido para manter os campos antigos e os novos.

A sincronização utiliza RLS e confirmação de versão. Dados locais antigos são importados explicitamente, após backup. Não há importação automática dos orçamentos antigos ou cartões locais não sincronizados.

## Recursos e cautelas

Os logotipos de bancos listados usam referências verificadas da Wikimedia Commons, com alternativa de iniciais se o arquivo remoto não carregar. Os gradientes das miniaturas são interpretações ilustrativas por banco ou modelo, não cópias fiéis de cartões emitidos.

O produto não substitui extratos bancários, não importa dados de instituições financeiras, não envia notificações de vencimento e não traz cotações de investimento automaticamente.

### Testes realizados

- Validação sintática de JavaScript.
- Renderização lógica em ambiente simulado.
- Cadastro de conta e cartão.
- Geração de dez parcelas totalizando o valor original.
- Cadastro e pagamento de compromisso mensal.
- Cadastro e atualização de aplicação financeira com rendimento.
- Verificação do RLS nas tabelas do VETRA.

Testes integrados finais em Chrome/Safari e duas sessões reais ainda devem ser feitos pelo usuário antes de confiar dados financeiros importantes à V2.
