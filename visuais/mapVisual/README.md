# Map Visual — documentação técnica

> Guia de uso para quem monta relatórios: [`docs/mapVisual`](../../docs/mapVisual/README.md) ·
> Histórico: [`CHANGELOG.md`](CHANGELOG.md)

| | |
|---|---|
| **Nome interno** | `mapVisual` |
| **GUID** | `mapVisual2EB2FCA8547B4845A3D56E871780B26B` — **nunca altere** |
| **API do Power BI** | `5.11.1` |
| **Renderização** | MapLibre GL (projeção e navegação) + marcadores DOM |
| **Privilégios** | `WebAccess` para `https://api.mapbox.com` e `https://tile.openstreetmap.org` |

---

## 1. Arquitetura

| Camada | Onde | Responsabilidade |
|---|---|---|
| Host | — | Viewport, `DataView`, modo de exibição, tooltip, `SelectionManager`, persistência de propriedades |
| Contrato | `capabilities.json` | Papéis, mapeamento tabular, redução de dados, privilégios, tooltips e recursos suportados |
| Configuração | `src/settings.ts` | Quatro cartões do painel Formatar e seus padrões |
| Dados | `src/visual.ts` | Valida linhas, agrupa Estado + Cidade, soma Tamanho, calcula centros ponderados, deduplica rótulos e tooltips, cria identidades de seleção |
| Cartografia | MapLibre GL | Projeção, zoom e controles; fundo raster de um estilo Mapbox |
| Marcadores | `src/visual.ts` | Elementos DOM sobre o mapa: bolha, ícone, quantidade, rótulo e contorno de seleção |
| Interação | `src/visual.ts` | Clique, Ctrl/Cmd+clique, Enter, Espaço, clique no fundo, tooltip e sincronização com seleções externas |
| Persistência | `iconSettings.customIconDataUrl` | PNG processado localmente e salvo no relatório |
| Build | `scripts/write-mapbox-config.mjs` | Gera `src/mapboxConfig.generated.ts` com token, conta e estilo do Mapbox |

```text
Power BI entrega uma tabela de até 30.000 linhas
  ↓
Validação de Estado, Cidade e coordenadas
  ↓
Agregação por Cidade + Estado → derivação dos Estados
  ↓
Raio calculado separadamente para cada nível
  ↓
MapLibre projeta as coordenadas
  ↓
Marcadores DOM exibem bolha, ícone, valor e rótulo
  ↓
Zoom alterna Estado/Cidade; seleção e tooltip usam o host
```

## 2. Mapeamento de dados

`dataViewMappings` tabular, com redução `top` de 30.000 linhas:

| Papel (`name`) | Nome exibido | Tipo | Máximo |
|---|---|---|---|
| `state` | Estado | Grouping | 1 |
| `city` | Cidade | Grouping | 1 |
| `latitude` | Latitude | Grouping | 1 |
| `longitude` | Longitude | Grouping | 1 |
| `size` | Tamanho | Measure | 1 |
| `label` | Rótulo da cidade | GroupingOrMeasure | 1 |
| `tooltips` | Dicas de ferramenta | GroupingOrMeasure | 20 |

`capabilities.json` não define mínimo para nenhum papel; a obrigatoriedade de
Estado, Cidade, Latitude e Longitude é verificada em tempo de execução.

Cada identidade de seleção é criada com `withTable(table, rowIndex)`, então o
clique em uma bolha seleciona todas as linhas agregadas nela.

> [!WARNING]
> O `name` de cada papel é gravado nos relatórios. Trocar o `displayName` é
> seguro; trocar o `name` quebra os relatórios existentes.

## 3. Recursos da plataforma

Situação segundo a auditoria do `pbiviz package` (Power BI Visuals Tools 7.2.1) e
a leitura do código:

| Recurso | Situação |
|---|---|
| Seleção e filtro cruzado | ✅ `SelectionManager`, multisseleção e sincronização externa; respeita `allowInteractions` |
| Navegação por teclado | ✅ `supportsKeyboardFocus`; Enter e Espaço selecionam o marcador focado |
| Dica de ferramenta | ✅ Até 20 campos, tooltips aprimorados e páginas de dica de ferramenta |
| Landing page | ✅ `supportsLandingPage` |
| Highlight de dados | ⚠️ `supportsHighlight` declarado, mas sem estado visual dedicado |
| Rendering Events | ❌ Não implementado |
| Alto contraste | ❌ Não usa a paleta de alto contraste do host (há só CSS `forced-colors`) |
| Localização (`stringResources`) | ❌ Textos fixos em português |
| Paleta de cores do tema | ❌ Cores fixas no painel Formatar |
| Menu de contexto | ❌ Não implementado |
| Seleção entre visuais (`supportsMultiVisualSelection`) | ❌ Não declarado |

> [!NOTE]
> Visuais com `WebAccess` **não podem ser certificados** pela Microsoft. Enquanto
> o fundo do mapa vier de um serviço externo, este visual fica fora do AppSource.

## 4. Estrutura do projeto

```text
mapVisual/
├── assets/icon.png
├── scripts/
│   └── write-mapbox-config.mjs   <- Gera a configuração do Mapbox antes do build
├── src/
│   ├── mapboxConfig.generated.ts <- GERADO, fora do git
│   ├── settings.ts
│   ├── styles.d.ts
│   └── visual.ts
├── style/visual.less             <- CSS do MapLibre, foco visível e forced colors
├── .env.example                  <- Modelo do .env.local
├── capabilities.json
├── CHANGELOG.md
├── eslint.config.mjs
├── package.json
├── package-lock.json
├── pbiviz.json
├── README.md
└── tsconfig.json
```

## 5. Dependências

| Pacote | Versão | Papel |
|---|---|---|
| `maplibre-gl` | `^6.1.0` | Projeção, navegação, zoom e controles |
| `powerbi-visuals-api` | `~5.11.1` | Contratos de integração com o host |
| `powerbi-visuals-utils-formattingmodel` | `6.0.4` | Painel moderno de formatação |
| `typescript` | `5.5.4` | Linguagem |
| `eslint` + `eslint-plugin-powerbi-visuals` | `^9.11.1` / `^1.0.0` | Análise estática |
| `d3` / `@types/d3` | `7.9.0` / `7.4.3` | **Declaradas, mas não importadas.** Candidatas a remoção |

> [!IMPORTANT]
> Em outubro de 2026, `npm audit` aponta uma vulnerabilidade **crítica** em
> `maplibre-gl` ≤ 6.4.0 (desvio do sanitizador de XSS em `DOM.sanitize()`), com
> correção dentro da faixa `^6.x`. Atualize e teste o mapa.

`tsconfig.json` usa `skipLibCheck: true` porque as declarações de tipos de
dependências do MapLibre (por exemplo `kdbush`) exigem TypeScript mais novo que
o 5.5.4 fixado pelo projeto.

## 6. Token do Mapbox

O token **nunca** fica no código-fonte. Antes de `npm run start`,
`npm run package` e `npm run typecheck`, o script
`scripts/write-mapbox-config.mjs` gera `src/mapboxConfig.generated.ts` (fora do
git) a partir de, nesta ordem:

1. variáveis de ambiente `MAPBOX_ACCESS_TOKEN`, `MAPBOX_USERNAME` e
   `MAPBOX_STYLE_ID`;
2. o arquivo `.env.local` na pasta do visual (também fora do git);
3. valores padrão — sem token, com a conta e o estilo atuais.

**Na sua máquina:**

```bash
cd visuais/mapVisual
cp .env.example .env.local      # no PowerShell: Copy-Item .env.example .env.local
# edite .env.local e preencha MAPBOX_ACCESS_TOKEN=pk....
npm run package
```

**No GitHub:** cadastre o token em *Settings > Secrets and variables > Actions*
com o nome `MAPBOX_ACCESS_TOKEN`. O workflow de release injeta o secret no build;
o CI de pull requests compila **sem** token, só para validar.

Regras para o token:

- Use um token **público** (`pk.…`) criado só para este visual, com os escopos
  públicos de leitura de estilos e tiles — nunca o token padrão da conta.
- O token precisa pertencer à **mesma conta dona do estilo** (`MAPBOX_USERNAME`).
- O token acaba dentro do `.pbiviz` publicado e pode ser extraído dele. Monitore
  o uso no painel do Mapbox e rotacione quando necessário.
- Ao rotacionar, publique uma versão nova do visual **antes** de revogar o token
  antigo: relatórios com pacotes antigos perdem o fundo do mapa no momento da
  revogação.

Sem token, o visual compila normalmente e exibe
`Pacote gerado sem token do Mapbox. Consulte a documentação de desenvolvimento.`

## 7. Desenvolvimento

```bash
cd visuais/mapVisual
npm ci
npm run start        # gera a config do Mapbox e sobe o servidor do Visual de Desenvolvedor
npm run lint
npm run typecheck    # gera a config do Mapbox e roda tsc --noEmit
npm run package      # gera a config do Mapbox e o .pbiviz em dist/
```

Sempre use `npm run package`, e não `pbiviz package` direto: o script `prepackage`
é que gera `src/mapboxConfig.generated.ts`.

Ambiente validado: Node.js 24.18.0, npm 11.16.0, Power BI Visuals Tools 7.2.1.

## 8. Ciclo de atualização e performance

1. Lê seleção atual, modo de exibição e viewport.
2. Carrega o painel de formatação.
3. Converte e agrega os dados quando existe tabela.
4. Compara **assinaturas** de dados e de formatação.
5. Reconstrói os marcadores só quando alguma assinatura muda.
6. Redimensiona e reposiciona no próximo `requestAnimationFrame`.
7. Ajusta o enquadramento aos dados quando necessário.
8. Atualiza a mensagem de estado.
9. Em `destroy()`, fecha o tooltip e remove listeners globais, timers, marcadores
   e a instância do MapLibre.

Otimizações atuais: agregação prévia, níveis que reduzem o número de marcadores
simultâneos, ocultação de marcadores fora da viewport, reposicionamento sem
recriar a árvore DOM e assinaturas que evitam reconstrução.

## 9. Segurança

- `WebAccess` é essencial e restrito no manifesto a Mapbox e OpenStreetMap.
- Só o Mapbox é chamado; o domínio do OpenStreetMap está declarado, mas não é
  usado pelo código atual (candidato a remoção, pelo princípio do menor
  privilégio).
- As requisições de tiles expõem ao Mapbox o token e a região visualizada, mas
  não os valores das linhas.
- Textos são inseridos com `textContent` e atributos; não há `innerHTML`, `eval`,
  `fetch` próprio ou URL arbitrária de ícone.

## 10. Pontos em aberto

- Se o `DataView` desaparece depois de já ter havido dados, os marcadores não são
  limpos explicitamente.
- Erros assíncronos do MapLibre, da seleção e das identidades só vão para o
  console.
- `supportsHighlight` está declarado sem tratamento visual dedicado.
- Versões anteriores da documentação citavam um papel **Contexto da seleção**,
  que não existe no `capabilities.json` atual.
