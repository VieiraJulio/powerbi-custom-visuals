<!--
MODELO DA DOCUMENTAÇÃO TÉCNICA (visuais/<nomeInterno>/README.md)

Público: quem mantém o código. O GitHub mostra este arquivo ao abrir a pasta
do projeto. O guia de uso para o analista fica em docs/<nomeInterno>/README.md.

Copie para visuais/<nomeInterno>/README.md, substitua os <marcadores> e apague
este comentário.
-->

# <Nome do Visual> — documentação técnica

> Guia de uso para quem monta relatórios: [`docs/<nomeInterno>`](../../docs/<nomeInterno>/README.md) ·
> Histórico: [`CHANGELOG.md`](CHANGELOG.md)

| | |
|---|---|
| **Nome interno** | `<nomeInterno>` |
| **GUID** | `<guid do pbiviz.json>` — **nunca altere** |
| **API do Power BI** | `<5.11.1>` |
| **Renderização** | <SVG nativo / Vega-Lite / MapLibre / ...> |
| **Privilégios** | <Nenhum / WebAccess para ...> |

---

## 1. Arquitetura

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Contrato | `capabilities.json` | Papéis de dados, cardinalidade, mapeamento e propriedades |
| Configuração | `src/settings.ts` | Cartões, controles, padrões, limites e visibilidade condicional |
| Execução | `src/visual.ts` | Ciclo de vida, validação, cálculo, tooltip e descarte |
| Apresentação | <...> | Tradução do estado calculado em elementos gráficos |
| Estilo | `style/visual.less` | Estilo do contêiner |

```text
<Fluxo do update(): DataView → validação → cálculo → renderização>
```

## 2. Mapeamento de dados

| Papel (`name`) | Nome exibido | Tipo | Mínimo | Máximo |
|---|---|---|---|---|
| `<name>` | <displayName> | <Measure / Grouping> | <0> | <1> |

> [!WARNING]
> O `name` de cada papel é gravado nos relatórios. Trocar o `displayName` é
> seguro; trocar o `name` quebra os relatórios existentes.

## 3. Recursos da plataforma

<Marque o que o visual implementa. O comando `pbiviz package` lista os recursos
recomendados que ainda faltam.>

| Recurso | Situação |
|---|---|
| Rendering Events (`renderingStarted/Finished/Failed`) | <Sim / Não> |
| Alto contraste | <Sim / Não> |
| Navegação por teclado | <Sim / Não> |
| Seleção e filtro cruzado | <Sim / Não> |
| Dica de ferramenta | <Sim / Não> |
| Landing page (visual sem dados) | <Sim / Não> |
| Menu de contexto | <Sim / Não> |

## 4. Estrutura do projeto

```text
<nomeInterno>/
├── assets/icon.png
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
| `powerbi-visuals-api` | `<versão>` | Contratos de integração com o host |

## 6. Desenvolvimento

```bash
cd visuais/<nomeInterno>
npm ci
npm run start       # servidor local para o Visual de Desenvolvedor
npm run lint
npm run typecheck
npm run package     # gera o .pbiviz em dist/
```

<Passos específicos deste visual: variáveis de ambiente, dados de teste, harness de QA.>

## 7. Decisões de implementação

<Registre aqui o "porquê" das escolhas que não são óbvias no código: limites,
fórmulas, comportamento em casos de borda, compatibilidade com versões anteriores.>
