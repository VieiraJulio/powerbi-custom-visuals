## O que muda

<!-- Uma ou duas frases. Se resolve uma issue, escreva "Resolve #123". -->

## Visual afetado

- [ ] Barra de Porcentagem
- [ ] Velocímetro
- [ ] Map Visual
- [ ] Apenas documentação ou repositório

## Tipo de mudança

- [ ] Correção (`patch`)
- [ ] Nova propriedade ou funcionalidade (`minor`)
- [ ] Mudança incompatível no contrato de dados — papel removido ou renomeado (`major`)
- [ ] Documentação

## Checklist

- [ ] `npm run lint`, `npm run typecheck` e `npm run package` passam na pasta do visual
- [ ] O `name` dos papéis em `capabilities.json` não mudou (ou a mudança é `major` e está explicada)
- [ ] O `guid` do `pbiviz.json` não foi alterado
- [ ] A documentação de uso (`docs/<visual>/`) e a técnica (`visuais/<visual>/README.md`) refletem a mudança
- [ ] O `CHANGELOG.md` do visual tem a entrada em **[Não lançado]**
- [ ] Prints novos usam somente dados fictícios
- [ ] Nenhum token, senha ou `.env.local` foi incluído

## Como testar

<!-- Campos usados, configurações do painel e o resultado esperado no Power BI. -->
