# Changelog — Velocímetro

Todas as mudanças relevantes deste visual ficam registradas aqui, no formato
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). As versões seguem o
padrão de quatro segmentos do Power BI (`major.minor.patch.build`), com a
semântica descrita no [README do repositório](../../README.md#8-convenções-do-projeto).

## [Não lançado]

### Alterado

- O campo **Faturamento** passa a se chamar **Valor realizado** no painel de
  campos, nas mensagens e no texto de acessibilidade. O nome interno do papel
  (`actual`) não mudou, então relatórios existentes continuam funcionando.
- Links de suporte e de código do `pbiviz.json` apontam para este repositório.
- `package.json` com licença Apache-2.0 (antes MIT, herdada do template) e
  script `typecheck`.

## [1.0.0.32] - 2026-09-02

### Adicionado

- Seis cartões de formatação: Velocímetro, Cores, Valor central, Percentual,
  Ícone e Dica de ferramenta.
- Dois modos de cor no arco (faixas de desempenho e cor única) e cor por faixa
  opcional no valor central.
- Ícone monetário com upload de PNG persistido no relatório.
- Acessibilidade: rótulo ARIA, alto contraste e foco visível.
- Laboratório de QA manual em `qa/preview.html`.

## [1.0.0.0] – [1.0.0.31]

### Alterado

- Iterações de empacotamento e ajuste fino de valores padrão (espessura, tamanho
  do marcador, tamanho de fonte do valor central, entre outros). Não há registro
  detalhado por versão.

> As datas correspondem à entrada do pacote no repositório.
