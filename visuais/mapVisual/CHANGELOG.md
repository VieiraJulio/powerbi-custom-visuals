# Changelog — Map Visual

Todas as mudanças relevantes deste visual ficam registradas aqui, no formato
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). As versões seguem o
padrão de quatro segmentos do Power BI (`major.minor.patch.build`), com a
semântica descrita no [README do repositório](../../README.md#8-convenções-do-projeto).

## [Não lançado]

### Corrigido

- O código-fonte voltou a compilar: o valor do token estava comentado em
  `src/visual.ts`, o que gerava erro de sintaxe num clone limpo.

### Alterado

- O token, a conta e o estilo do Mapbox passam a ser injetados no build
  (`.env.local` ou secret `MAPBOX_ACCESS_TOKEN`) por
  `scripts/write-mapbox-config.mjs`, e nunca ficam no código-fonte.
- Nova mensagem quando o pacote é gerado sem token.
- Nome exibido no Power BI passa a ser **Map Visual** (antes `MapVisual`).
- Links de suporte e de código do `pbiviz.json` apontam para este repositório.
- `package.json` com nome próprio, licença Apache-2.0 (antes MIT, herdada do
  template) e script `typecheck`.

### Removido

- `LEIA-ME.txt`, substituído por `README.md` (documentação técnica) e
  `docs/mapVisual/README.md` (guia de uso).

### Segurança

- Os pacotes 1.0.0.6 a 1.0.0.12 continham um token do Mapbox e foram retirados do
  repositório. O token deve ser rotacionado.

## [1.0.0.12] - 2026-09-01

### Adicionado

- Bolhas proporcionais com agregação por Estado e Cidade, alternadas pelo zoom.
- Formatação de cor, transparência, borda, contorno de seleção e raios.
- Ícone padrão com importação de PNG em modo de edição, persistido no relatório.
- Tooltips com até 20 campos, valores deduplicados e suporte a páginas de dica de
  ferramenta.
- Seleção cruzada com Ctrl/Cmd+clique e limpeza ao clicar no fundo do mapa.

## [1.0.0.6] – [1.0.0.11]

### Alterado

- Iterações de desenvolvimento sem registro detalhado por versão.

> As datas correspondem à entrada do pacote no repositório.
