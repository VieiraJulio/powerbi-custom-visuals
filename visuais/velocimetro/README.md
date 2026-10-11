# Velocímetro — documentação técnica

> Guia de uso para quem monta relatórios: [`docs/velocimetro`](../../docs/velocimetro/README.md) ·
> Histórico: [`CHANGELOG.md`](CHANGELOG.md)

| | |
|---|---|
| **Nome interno** | `velocimetro` |
| **GUID** | `velocimetro0BBCD8D8C8D1450D88AABEC4EFC5D619` — **nunca altere** |
| **API do Power BI** | `5.11.1` |
| **Renderização** | SVG nativo (sem Vega, Deneb ou D3 em tempo de execução) |
| **Privilégios** | Nenhum (`"privileges": []`) |

O visual reproduz, como componente reutilizável, um velocímetro que existia
originalmente como especificação Deneb. Várias decisões abaixo existem para
manter fidelidade visual a essa referência.

---

## 1. Arquitetura

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Host | — | Viewport, `DataView`, cultura, paleta de alto contraste, tooltip e persistência de propriedades |
| Contrato | `capabilities.json` | Papéis de dados, cardinalidade, tooltip e propriedades de formatação |
| Configuração | `src/settings.ts` | Seis cartões, controles, padrões, limites e visibilidade condicional |
| Execução | `src/visual.ts` | Agrega dados, calcula o atingimento, resolve cores, formata valores, acessibilidade e ciclo de vida |
| Gráfica | SVG nativo | Arcos, marcador, textos e ícone desenhados direto no contêiner |
| QA | `qa/preview.html` | Instancia a classe compilada com um host simulado, para testes visuais manuais |

```text
Power BI calcula Valor realizado, Meta e medidas de tooltip
  ↓
DataView entrega os valores ao visual
  ↓
Visual.update() lê dados, viewport e formatação
  ↓
Cálculo do atingimento e do progresso do arco
  ↓
Seleção das faixas, cores e formatos
  ↓
Renderização SVG responsiva
```

## 2. Mapeamento de dados

| Papel (`name`) | Nome exibido | Tipo | Mínimo | Máximo |
|---|---|---|---|---|
| `actual` | Valor realizado | Measure | 1 | 1 |
| `target` | Meta (opcional) | Measure | 0 | 1 |
| `tooltip` | Dica de ferramenta | Measure | 0 | 20 |

`capabilities.json` declara `"privileges": []` e `"supportsEmptyDataView": true`.

> [!WARNING]
> O `name` de cada papel é gravado nos relatórios. O papel `actual` já se chamou
> *Faturamento* na interface; a troca foi só de `displayName`, por isso relatórios
> antigos continuam funcionando. Não renomeie o `name`.

## 3. Recursos da plataforma

Situação segundo a auditoria do `pbiviz package` (Power BI Visuals Tools 7.2.1):

| Recurso | Situação |
|---|---|
| Rendering Events (`renderingStarted/Finished/Failed`) | ✅ Implementado |
| Alto contraste | ✅ Cores do arco substituídas pela cor de primeiro plano do host |
| Acessibilidade | ✅ `role="img"`, `tabindex="0"`, `aria-label` descritivo, `role="status"` nas mensagens |
| Dica de ferramenta | ✅ Até 20 campos |
| Navegação por teclado (`supportsKeyboardFocus`) | ❌ Não declarado |
| Seleção, filtro cruzado e `allowInteractions` | ❌ Não implementado |
| Highlight de dados | ❌ Não implementado |
| Landing page (visual sem dados) | ❌ Mostra mensagem de texto |
| Menu de contexto | ❌ Não implementado |

## 4. Estrutura do projeto

```text
velocimetro/
├── .vscode/              <- Depuração e servidor MCP do pbiviz
├── assets/icon.png
├── qa/preview.html       <- Laboratório manual com o bundle real de produção
├── src/
│   ├── settings.ts
│   └── visual.ts
├── style/visual.less
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
| `powerbi-visuals-api` | `5.11.1` | Contratos de integração com o host |
| `powerbi-visuals-utils-formattingmodel` | `6.0.4` | Painel moderno de formatação |
| `powerbi-visuals-utils-formattingutils` | `6.1.2` | Formatação de medidas e unidades de exibição |
| `typescript` | `5.5.4` | Linguagem |
| `eslint` + `eslint-plugin-powerbi-visuals` | `^9.11.1` / `^1.0.0` | Análise estática |

## 6. Desenvolvimento

```bash
cd visuais/velocimetro
npm ci               # instalação reproduzível
npm run start        # servidor local para o Visual de Desenvolvedor
npm run lint
npm run typecheck    # tsc --noEmit
npm run package      # gera o .pbiviz em dist/
```

Ambiente validado: Node.js 24.18.0, npm 11.16.0, Power BI Visuals Tools 7.2.1.

`qa/preview.html` oferece um laboratório manual, fora do Power BI: ele carrega o
bundle de produção com um host simulado para conferir o desenho em vários
cenários de valor, meta e tamanho.

## 7. Decisões de implementação

### 7.1 Geometria

- O arco vai de -135° a +135° (270° no total).
- Medidas de referência herdadas do Deneb: raio externo de 130 px, raio interno
  de 108 px, raio central de 119 px e padding de 5 px. Elas só são reduzidas
  quando o contêiner não comporta o tamanho original.
- As extremidades e separações dos arcos usam círculos explícitos com raio igual
  à metade da espessura, para que todas as pontas tenham exatamente o mesmo raio
  em qualquer escala de tela. A detecção de início e fim usa a mesma proporção
  normalizada empregada para desenhar o arco.
- Abaixo de 48 × 42 px o visual mostra `Aumente o tamanho do visual.`; com raio
  externo abaixo de 34 px, ícone e percentual são ocultados.

### 7.2 Atingimento e progresso

```typescript
progressoDoArco = limitar(atingimento / máximoDoArco, 0, 1)
```

- `máximoDoArco` é o **Valor da meta** das faixas no modo *Faixas de desempenho*
  e sempre `1` no modo *Cor única*.
- Sem Meta positiva, o atingimento é 0 e o arco fica no estado inicial.
- Com Valor realizado em `BLANK()`, o centro mostra `(Blank)` na cor de zero, sem
  converter para zero; marcador e percentual ficam em 0%.
- Quando o arredondamento faz o percentual exibido chegar a 100% (por exemplo
  `19.999 / 20.000` com zero casas), o marcador é fixado no fim do arco e vira
  traço.

### 7.3 Faixas de cor

Como no Deneb, o fundo tem exatamente três faixas — vermelha, amarela e
verde-clara. O verde de meta é aplicado ao **progresso** quando a meta é
atingida. Os limites são normalizados para ordem não decrescente.

### 7.4 Marcador e percentual

- Entre 0% e 100% exclusive, o marcador é uma bolinha de 14 px desenhada à frente
  de todas as camadas, no raio central (119 px). Em 0%, 100% ou acima, e no
  estado sem Meta, vira um traço transversal na ponta do arco.
- O percentual fica logo abaixo do marcador; só é afastado para fora (e, se
  preciso, para baixo) quando há risco de encostar no valor central.
- **Distância do arco (px)** desloca o percentual em pixels exatos (padrão
  `12 px`, como no Deneb). Nos limites do viewport, o texto é contido para não ser
  cortado.

### 7.5 Valor central

- Tamanho padrão de 24 px (18 pt no painel), no centro geométrico.
- A fonte **não** é reduzida pela quantidade de dígitos; textos longos são
  comprimidos horizontalmente para caber no arco, preservando a espessura dos
  separadores sempre que possível.
- Formato **fixo** `R$ #,0` (constante `DENEB_VALUE_FORMAT`, acrescida das casas
  decimais configuradas) e convenção brasileira (`.` para milhar, `,` para
  decimal) no Desktop, no Service e no Embedded, **independentemente do formato
  da medida e da localidade do host**. Respeitar o formato da medida
  (`column.source.format`) é a principal melhoria pendente para uso genérico. Valores recebidos em formato Geral também ganham
  agrupamento de milhar, e uma validação final garante o agrupamento quando o
  formatador do Service devolve uma sequência contínua.
- Tooltips e textos de acessibilidade preservam a localidade do relatório.

### 7.6 Ícone

- Desativado por padrão (o Deneb original não tinha ícone).
- PNG personalizado: até 5 MB e 40 milhões de pixels na entrada, redimensionado
  para no máximo 128 px no maior lado e persistido em base64 no relatório (até
  512.000 caracteres). O controle de upload só aparece em modo de edição e fica
  oculto para leitores de tela.
