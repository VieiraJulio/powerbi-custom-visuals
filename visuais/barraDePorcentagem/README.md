# Barra de Porcentagem — documentação técnica

> Guia de uso para quem monta relatórios: [`docs/barraDePorcentagem`](../../docs/barraDePorcentagem/README.md) ·
> Histórico: [`CHANGELOG.md`](CHANGELOG.md)

| | |
|---|---|
| **Nome interno** | `barraDePorcentagem` |
| **GUID** | `barraDePorcentagemDCC394FDAC284A44B6F4D5B34991AF4B` — **nunca altere** |
| **API do Power BI** | `5.11.1` |
| **Renderização** | SVG gerado por Vega-Lite / Vega |
| **Privilégios** | Nenhum (`"privileges": []`) |

---

## 1. Arquitetura

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Host | — | Viewport, `DataView`, propriedades persistidas e ciclo de atualização |
| Contrato | `capabilities.json` | Papéis de dados, cardinalidade e propriedades de formatação |
| Configuração | `src/settings.ts` | Cartões, grupos, controles, padrões, limites e visibilidade condicional |
| Execução | `src/visual.ts` | Valida entradas, calcula o progresso, resolve a cor, monta o tooltip e controla o ciclo de vida |
| Gráfica | Vega-Lite → Vega | Descreve as três camadas do desenho e renderiza em SVG |

```text
Power BI calcula as medidas
  ↓
DataView entrega Percentual, Meta e Tooltip
  ↓
Visual.update() lê dados e formatação
  ↓
Validação das entradas
  ↓
Cálculo do progresso e do rótulo
  ↓
Seleção do modo e da cor
  ↓
Especificação Vega-Lite → compilação e renderização Vega em SVG
```

O desenho tem três camadas: trilho de fundo, preenchimento e texto do rótulo. A
largura total é calculada a partir do viewport, do percentual de comprimento
configurado e de uma área fixa reservada para o rótulo.

## 2. Mapeamento de dados

`dataViewMappings` categórico:

| Papel (`name`) | Nome exibido | Tipo | Mínimo | Máximo |
|---|---|---|---|---|
| `percentual` | Percentual | Measure | 1 | 1 |
| `meta` | Meta (opcional) | Measure | 0 | 1 |
| `tooltip` | Dica de ferramenta | Measure / coluna | 0 | 20 |

> [!WARNING]
> O `name` de cada papel é gravado nos relatórios. Trocar o `displayName` é
> seguro; trocar o `name` quebra os relatórios existentes.

## 3. Recursos da plataforma

Situação segundo a auditoria do `pbiviz package` (Power BI Visuals Tools 7.2.1):

| Recurso | Situação |
|---|---|
| Rendering Events (`renderingStarted/Finished/Failed`) | ❌ Não implementado |
| Alto contraste | ❌ Não implementado |
| Navegação por teclado | ❌ Não implementado |
| Seleção, filtro cruzado e `allowInteractions` | ❌ Não implementado |
| Highlight de dados | ❌ Não implementado |
| Páginas de dica de ferramenta (`tooltips` no `capabilities.json`) | ❌ Não declarado — o tooltip padrão funciona pelo papel `tooltip` |
| Landing page (visual sem dados) | ❌ Mostra mensagem de texto |
| Menu de contexto | ❌ Não implementado |
| Paleta de cores do tema | ❌ Cores fixas no painel Formatar |

Prioridade sugerida: **Rendering Events** (exigido na certificação e usado pelo
Power BI para saber quando o visual terminou de desenhar antes de exportar) e
**alto contraste**.

## 4. Estrutura do projeto

```text
barraDePorcentagem/
├── .vscode/              <- Depuração e servidor MCP do pbiviz
├── assets/icon.png
├── src/
│   ├── settings.ts       <- Painel Formatar
│   └── visual.ts         <- Ciclo de vida, cálculo, Vega-Lite e renderização
├── style/visual.less     <- Herdado do template; não participa do desenho atual
├── capabilities.json
├── CHANGELOG.md
├── eslint.config.mjs
├── package.json
├── package-lock.json
├── pbiviz.json
├── README.md
└── tsconfig.json
```

`dist/`, `.tmp/` e `webpack.statistics.*.html` são gerados pelo build e não são
versionados.

## 5. Dependências

| Pacote | Versão | Papel |
|---|---|---|
| `powerbi-visuals-api` | `5.11.1` | Contratos de integração com o host |
| `powerbi-visuals-utils-formattingmodel` | `^6.0.4` | Painel moderno de formatação |
| `vega` | `^5.33.1` | Runtime da visualização |
| `vega-lite` | `^5.23.0` | Especificação declarativa e compilação da barra |
| `typescript` | `5.5.4` | Linguagem |
| `eslint` + `eslint-plugin-powerbi-visuals` | `^9.11.1` / `^1.0.0` | Análise estática |
| `d3` / `@types/d3` | `7.9.0` / `7.4.3` | **Declaradas, mas não importadas.** Candidatas a remoção |

> [!IMPORTANT]
> Em outubro de 2026, `npm audit` aponta vulnerabilidades **altas** em `vega` e
> `vega-functions` (XSS via expressões), corrigidas a partir de `vega` 6.x — uma
> troca de versão *major* que exige testar a barra de novo. A certificação da
> Microsoft não aceita alertas *high* ou *moderate* no `npm audit`.

## 6. Desenvolvimento

```bash
cd visuais/barraDePorcentagem
npm ci               # instalação reproduzível
npm run start        # servidor local para o Visual de Desenvolvedor
npm run lint         # análise estática
npm run typecheck    # tsc --noEmit
npm run package      # gera o .pbiviz em dist/
```

Ambiente validado: Node.js 24.18.0, npm 11.16.0, Power BI Visuals Tools 7.2.1.

Com `npm run start` rodando, adicione o **Visual de Desenvolvedor** a um
relatório no Power BI Service para ver cada alteração quase em tempo real. Na
primeira vez, rode `pbiviz --install-cert` para instalar o certificado local.

## 7. Decisões de implementação

- **Dois números de progresso.** O *progresso real* alimenta rótulo, cor e
  tooltip; o *progresso da barra* só controla a largura e é limitado a 0–100%.
  É isso que permite escrever `127%` sem estourar o desenho:

  ```typescript
  progressoDaBarra = Math.min(Math.max(progressoReal, 0), 1);
  ```

- **Rótulo ancorado no fim do trilho**, não no fim do preenchimento, para que
  barras empilhadas fiquem com os números alinhados.
- **Faixas normalizadas em tempo de execução** para ordem não decrescente; em
  empate, vence a faixa de maior status (a avaliação começa em *Meta atingida*).
- **Visibilidade condicional** dos grupos do painel em
  `VisualFormattingSettingsModel.updateVisibility()`.
- **Erros viram mensagem no contêiner**, nunca exceção silenciosa. O catálogo de
  mensagens está na seção *Solução de problemas* do guia de uso.
