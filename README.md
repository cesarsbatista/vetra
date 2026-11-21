# VETRA — V1

Aplicativo web de controle financeiro, mobile-first, inspirado na organização da planilha financeira original.

## Funcionalidades implementadas

- Painel financeiro mensal, valores realizados e projeção;
- Registro, edição e exclusão de receitas, despesas, compras por cartão e aportes;
- Categorias e subcategorias adaptadas da planilha;
- Registro de movimentações previstas e realizadas;
- Orçamento mensal de despesas;
- Cartões pré-cadastrados (Banco do Brasil, Itaú e Riachuelo);
- Exportação CSV, backup e restauração JSON;
- Instalação básica como PWA pelo navegador compatível.

## Executar

Abra `index.html` em um navegador, ou hospede os arquivos em qualquer servidor estático. Para desenvolvimento local, por exemplo: `python -m http.server 8080`, depois abra `http://localhost:8080`.

## Importante

**V1 local, sem login:** dados persistem apenas no `localStorage` do navegador atual e não sincronizam entre dispositivos. Use a opção **Mais → Backup JSON** para proteger seus dados. Limpar os dados do site apagará os registros locais. O app não é um ambiente de produção para armazenar informações financeiras sensíveis.

**Limitações assumidas da V1:** não há importação automática da planilha/PDF, cálculo de parcelamentos, apuração de faturas híbridas, sincronização familiar, autenticação, balanço patrimonial nem atualização de cotações. Os cartões nesta V1 servem para identificar lançamentos; não há controle completo de faturamento. Investimentos contabilizam somente aportes. Evite contabilizar a mesma compra novamente ao registrar pagamentos de faturas.

## Próxima etapa

Integração com Supabase e autenticação individual, compartilhamento de orçamento, reconciliação de cartões e parcelas, importação assistida da planilha e ajustes adicionais de PWA.
