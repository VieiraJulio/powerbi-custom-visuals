# Changelog — Barra de Porcentagem

Todas as mudanças relevantes deste visual ficam registradas aqui, no formato
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). As versões seguem o
padrão de quatro segmentos do Power BI (`major.minor.patch.build`), com a
semântica descrita no [README do repositório](../../README.md#8-convenções-do-projeto).

## [Não lançado]

### Alterado

- Nome exibido no Power BI passa a ser **Barra de Porcentagem** (antes
  `BarraDePorcentagem`), e a descrição do pacote deixa de mencionar o Deneb.
- Links de suporte e de código do `pbiviz.json` apontam para este repositório.
- `package.json` com nome próprio, licença Apache-2.0 (antes MIT, herdada do
  template) e script `typecheck`.

## [1.0.0.0] - 2026-09-01

### Adicionado

- Primeira versão consolidada: trilho de comprimento fixo, rótulo além de 100%,
  três modos de cor (comparar com a meta, cor fixa e faixas de valor), cinco
  faixas configuráveis e tooltip com até 20 campos.

> A data da versão 1.0.0.0 corresponde à entrada do pacote no repositório.
