<div align="center">

<img src="visuais/barraDePorcentagem/assets/icon.png" width="56" alt="">&nbsp;&nbsp;<img src="visuais/velocimetro/assets/icon.png" width="56" alt="">&nbsp;&nbsp;<img src="visuais/mapVisual/assets/icon.png" width="56" alt="">

# Visuais Personalizados para Power BI

**Desenvolvimento, documentação e distribuição de visuais customizados (`.pbiviz`) para o Microsoft Power BI**

![Power BI](https://img.shields.io/badge/Power%20BI-F2C811?style=for-the-badge&logo=powerbi&logoColor=black)
![Microsoft](https://img.shields.io/badge/Microsoft-0078D4?style=for-the-badge&logo=microsoft&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)

[![CI](https://github.com/VieiraJulio/powerbi-custom-visuals/actions/workflows/ci.yml/badge.svg)](https://github.com/VieiraJulio/powerbi-custom-visuals/actions/workflows/ci.yml)
![Visuals API](https://img.shields.io/badge/Visuals%20API-5.11.1-6E4B9E?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Licença](https://img.shields.io/badge/Licença-Apache%202.0-D22128?style=flat-square)
![Visuais](https://img.shields.io/badge/visuais-3-informational?style=flat-square)

**[Documentação](docs/README.md)** · **[Releases](https://github.com/VieiraJulio/powerbi-custom-visuals/releases)** · **[Como contribuir](CONTRIBUTING.md)** · **[Segurança](SECURITY.md)** · **[Referências](Referencias.md)** · **[Autoria](Autoria.md)**

</div>

---

## Sumário

1. [Apresentação](#1-apresentação)
2. [Objetivos](#2-objetivos)
3. [Visuais desenvolvidos](#3-visuais-desenvolvidos)
4. [Fundamentação técnica](#4-fundamentação-técnica)
5. [Organização do repositório](#5-organização-do-repositório)
6. [Instalação e uso](#6-instalação-e-uso)
7. [Ambiente de desenvolvimento](#7-ambiente-de-desenvolvimento)
8. [Convenções do projeto](#8-convenções-do-projeto)
9. [Limitações e considerações](#9-limitações-e-considerações)
10. [Trabalhos futuros](#10-trabalhos-futuros)
11. [Referências](#11-referências)
12. [Autoria, licença e contribuição](#12-autoria-licença-e-contribuição)

---

## 1. Apresentação

O Microsoft Power BI oferece um conjunto extenso de visualizações nativas, adequado
à maior parte das análises descritivas. Existem, contudo, situações em que a
representação exigida pelo negócio não encontra correspondência direta na
biblioteca padrão: uma escala que precisa permanecer fixa entre filtros, um
semáforo cujas faixas devem ser parametrizadas por quem monta o relatório, ou uma
projeção geográfica com agregação progressiva por nível de zoom.

Diante dessas lacunas, a prática comum é contornar a limitação no modelo semântico
— multiplicando medidas DAX condicionais, criando colunas auxiliares de cor ou
recorrendo a especificações Deneb replicadas manualmente em cada relatório. Essas
soluções funcionam, mas transferem complexidade para a camada de dados, dificultam
a manutenção e não são reutilizáveis entre relatórios.

Este repositório adota a alternativa oposta: **encapsular o comportamento no
próprio visual**. Cada componente é implementado como um Power BI custom visual,
distribuído como pacote `.pbiviz`, com parâmetros expostos no painel de formatação
nativo. O resultado é um artefato reutilizável, versionado e documentado, que
mantém o modelo semântico limpo e transfere a configuração para quem constrói o
relatório, sem exigir conhecimento de código.

O repositório reúne o **código-fonte** dos visuais, a **documentação** de cada
componente em dois níveis — guia de uso e referência técnica — e a **automação**
que valida, empacota e publica os pacotes como *Releases* do GitHub.

---

## 2. Objetivos

### 2.1 Objetivo geral

Desenvolver, documentar e manter um acervo de visuais personalizados para o
Power BI que atenda a requisitos analíticos não cobertos pelas visualizações
nativas, priorizando a reutilização entre relatórios e a configuração sem código.

### 2.2 Objetivos específicos

1. **Encapsular a lógica de apresentação no visual**, eliminando medidas DAX
   auxiliares criadas exclusivamente para controlar cor, formato ou escala.
2. **Expor toda a parametrização no painel moderno de formatação**, de modo que a
   customização seja acessível ao analista de negócio.
3. **Garantir estabilidade de layout** sob diferentes contextos de filtro,
   preservando dimensões e alinhamento entre instâncias do mesmo visual.
4. **Documentar cada componente em dois níveis** — guia de uso para o analista e
   referência técnica para quem mantém o código.
5. **Assegurar reprodutibilidade do empacotamento**, com dependências fixadas,
   ambiente de build declarado e pacotes gerados por integração contínua.
6. **Manter uma base extensível** para evoluções em acessibilidade, interatividade
   e eventual submissão ao processo de certificação da Microsoft.

---

## 3. Visuais desenvolvidos

| | Visual | Descrição | Renderização | Versão | Guia de uso | Doc. técnica | Download |
|:---:|---|---|:---:|:---:|:---:|:---:|:---:|
| <img src="visuais/barraDePorcentagem/assets/icon.png" width="32" alt=""> | **Barra de Porcentagem** | Barra de progresso para percentual de atingimento, com trilho de comprimento fixo e cor definida por meta ou por cinco faixas configuráveis | Vega-Lite | `1.0.0.0` | [Abrir](docs/barraDePorcentagem/README.md) | [Abrir](visuais/barraDePorcentagem/README.md) | [Releases](https://github.com/VieiraJulio/powerbi-custom-visuals/releases?q=barraDePorcentagem&expanded=true) |
| <img src="visuais/velocimetro/assets/icon.png" width="32" alt=""> | **Velocímetro** | Indicador radial de valor realizado versus meta, com faixas de desempenho, valor central formatado e ícone personalizável | SVG nativo | `1.0.0.32` | [Abrir](docs/velocimetro/README.md) | [Abrir](visuais/velocimetro/README.md) | [Releases](https://github.com/VieiraJulio/powerbi-custom-visuals/releases?q=velocimetro&expanded=true) |
| <img src="visuais/mapVisual/assets/icon.png" width="32" alt=""> | **Map Visual** | Mapa com bolhas proporcionais, agregação progressiva por estado e cidade, seleção cruzada e tooltips enriquecidos | MapLibre GL | `1.0.0.12` | [Abrir](docs/mapVisual/README.md) | [Abrir](visuais/mapVisual/README.md) | [Releases](https://github.com/VieiraJulio/powerbi-custom-visuals/releases?q=mapVisual&expanded=true) |

O índice da documentação está em **[`docs/`](docs/README.md)**.

---

## 4. Fundamentação técnica

### 4.1 O modelo de visuais personalizados do Power BI

Um custom visual do Power BI é um pacote `.pbiviz` que contém código
JavaScript compilado, folha de estilo, ícone e um contrato declarativo de dados.
O host — Power BI Desktop ou Power BI Service — instancia uma classe que
implementa a interface `IVisual` dentro de um contêiner HTML isolado
(`<div>` em sandbox `iframe`), e passa a governar seu ciclo de vida.

Dois arquivos definem o contrato entre o host e o visual:

| Arquivo | Papel |
|---|---|
| `capabilities.json` | Declara os **papéis de dados** (`dataRoles`), as cardinalidades aceitas, o **mapeamento do DataView**, os **privilégios** e as **propriedades de formatação** que o painel exibirá. |
| `pbiviz.json` | Declara a **identidade do pacote**: nome interno, GUID, versão, versão da API, autor, links de suporte, ícone e arquivos associados. |

O fluxo de execução segue o modelo reativo do host:

```mermaid
flowchart TD
    A[Usuário configura campos e filtros] --> B[Power BI avalia as medidas DAX]
    B --> C[Host monta o DataView<br/>conforme o dataViewMapping]
    C --> D["Visual.update(options)"]
    D --> E[Validação das entradas]
    E --> F[Cálculo e resolução de estilo]
    F --> G[Renderização no contêiner HTML]
    G --> H[Barra, arco ou mapa no relatório]
    I[Painel de formatação] --> D
    J[Redimensionamento do visual] --> D
```

O método `update()` é reinvocado a cada mudança de dado, de filtro, de propriedade
de formatação ou de viewport. Cabe ao visual ser idempotente e eficiente nesse
ponto: todo o desenho é reconstruído a partir do estado recebido, sem depender de
execuções anteriores.

### 4.2 Pilha tecnológica

| Camada | Tecnologia | Papel no projeto |
|---|---|---|
| Plataforma | **Microsoft Power BI** | Host que fornece viewport, `DataView`, serviços de tooltip e seleção, e persistência de propriedades |
| Contrato | **Power BI Visuals API 5.11.1** | Interfaces `IVisual`, `IVisualHost`, `DataView` e tipos do painel de formatação |
| Ferramental | **Power BI Visuals Tools 7.2.1** (`pbiviz`) | CLI oficial de scaffolding, servidor de desenvolvimento, auditoria de recursos e empacotamento |
| Linguagem | **TypeScript 5.5** | Tipagem estática sobre a API do host, ciclo de vida, cálculo e mapeamento do `DataView` |
| Marcação | **HTML5 e SVG** | Contêiner de renderização entregue pelo host; o desenho final é SVG inline |
| Estilo | **LESS / CSS** | Estilo do contêiner, pré-processado pelo `pbiviz` durante o empacotamento |
| Renderização declarativa | **Vega 5 e Vega-Lite 5** | Especificação declarativa compilada em SVG (Barra de Porcentagem) |
| Cartografia | **MapLibre GL** | Projeção e navegação do mapa (Map Visual) |
| Formatação | **powerbi-visuals-utils-formattingmodel 6** | Construção declarativa do painel moderno de formatação, com visibilidade condicional |
| Qualidade | **ESLint 9** + `eslint-plugin-powerbi-visuals` | Análise estática, incluindo as regras exigidas pelo processo de certificação |
| Automação | **GitHub Actions** + **Dependabot** | Lint, verificação de tipos e empacotamento a cada PR; publicação de *Releases* por tag; atualização de dependências |

### 4.3 Arquitetura comum

Os três visuais compartilham a mesma separação de responsabilidades, o que
padroniza a manutenção e permite reaproveitar decisões entre projetos:

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Contrato | `capabilities.json` | Papéis de dados, cardinalidade, mapeamento e propriedades |
| Configuração | `src/settings.ts` | Cartões, grupos, controles, valores padrão, limites e visibilidade condicional |
| Execução | `src/visual.ts` | Ciclo de vida, validação, cálculo, resolução de cor, tooltip e descarte |
| Apresentação | Vega-Lite, SVG ou MapLibre | Tradução do estado calculado em elementos gráficos |
| Estilo | `style/visual.less` | Estilo do contêiner |

A validação de entrada é sempre a primeira etapa do `update()`, e falhas são
comunicadas por mensagem textual dentro do próprio contêiner — nunca por exceção
silenciosa. As mensagens específicas de cada visual estão catalogadas na seção
*Solução de problemas* do respectivo guia de uso.

---

## 5. Organização do repositório

```text
powerbi-custom-visuals/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    <- Lint, typecheck e package dos visuais a cada PR.
│   │   └── release.yml               <- Publica a Release de um visual a partir de uma tag.
│   ├── ISSUE_TEMPLATE/               <- Formulários de bug, melhoria e novo visual.
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CODEOWNERS                    <- Revisores automáticos.
│   └── dependabot.yml
│
├── docs/                             <- Guias de uso, para quem monta relatórios.
│   ├── README.md                     <- Índice da documentação.
│   ├── _template/                    <- Modelos do guia de uso e da doc técnica.
│   ├── barraDePorcentagem/
│   │   ├── README.md
│   │   └── img/                      <- Imagens usadas apenas nessa página.
│   ├── velocimetro/
│   └── mapVisual/
│
├── visuais/                          <- Código-fonte: um projeto pbiviz por pasta.
│   │
│   └── barraDePorcentagem/
│       ├── src/
│       │   ├── visual.ts             <- Ciclo de vida, cálculo e renderização.
│       │   └── settings.ts           <- Modelo do painel de formatação.
│       ├── style/visual.less         <- Estilo do contêiner.
│       ├── assets/icon.png           <- Ícone exibido no painel Visualizações.
│       ├── capabilities.json         <- Contrato de dados e formatação.
│       ├── pbiviz.json               <- Identidade do pacote.
│       ├── package.json              <- Scripts e dependências.
│       ├── tsconfig.json             <- Configuração do compilador.
│       ├── README.md                 <- Documentação técnica do visual.
│       └── CHANGELOG.md              <- Histórico de versões do visual.
│
├── CONTRIBUTING.md                   <- Fluxo de contribuição e de release.
├── SECURITY.md                       <- Como relatar vulnerabilidades.
├── CODE_OF_CONDUCT.md
├── CITATION.cff                      <- Metadados de citação.
├── Autoria.md · Referencias.md
├── LICENSE
└── README.md
```

`dist/`, `.tmp/`, `node_modules/` e os relatórios `webpack.statistics.*.html` são
gerados pelo build e não são versionados — os pacotes `.pbiviz` ficam nas
*Releases*.

Cada pasta em `docs/` recebe o mesmo nome da pasta correspondente em `visuais/`,
que por sua vez corresponde ao campo `visual.name` declarado no `pbiviz.json`.
Essa correspondência elimina ambiguidade entre documentação e código e evita
links quebrados por diferença de grafia ou acentuação.

---

## 6. Instalação e uso

### 6.1 Importação em um relatório

1. Abra as [Releases](https://github.com/VieiraJulio/powerbi-custom-visuals/releases)
   e baixe o `.pbiviz` da versão mais recente do visual desejado. As tags seguem
   o formato `<visual>-v<versão>`, por exemplo `velocimetro-v1.0.0.32`.
2. No Power BI Desktop, abra o painel **Visualizações**.
3. Selecione as reticências (`...`) e a opção **Importar um visual de um arquivo**.
4. Escolha o arquivo baixado e confirme o aviso de visual não certificado.
5. O ícone do visual passa a integrar o painel de visualizações do relatório.

> [!NOTE]
> A importação tem escopo de **relatório**, não de instalação. Cada arquivo `.pbix`
> exige nova importação. Para disponibilizar um visual a toda a organização, o
> pacote deve ser publicado no **repositório de visuais da organização** por um
> administrador do Microsoft Fabric, o que também centraliza a atualização de
> versões.

### 6.2 Atualização de versão

Ao importar um `.pbiviz` de versão superior com o mesmo GUID, o Power BI substitui
a instância existente e preserva os campos e as propriedades já configurados. As
propriedades introduzidas na nova versão assumem seus valores padrão. O que mudou
em cada versão está no `CHANGELOG.md` do visual.

---

## 7. Ambiente de desenvolvimento

### 7.1 Requisitos

| Componente | Versão | Observação |
|---|---|---|
| Node.js | 22 LTS ou 24 LTS | Ambiente validado em 24.18.0; o CI usa a 24 |
| npm | 10 ou superior | Ambiente validado em 11.16.0 |
| Power BI Visuals Tools | 7.2.1 | Instalação global: `npm install -g powerbi-visuals-tools@7.2.1` |
| Power BI Desktop | Atual | Validação manual e importação |
| Power BI Service | — | Necessário para o **Visual de Desenvolvedor** |

### 7.2 Execução

```bash
git clone https://github.com/VieiraJulio/powerbi-custom-visuals.git
cd powerbi-custom-visuals/visuais/barraDePorcentagem

npm ci               # instalação reproduzível a partir do package-lock.json
npm run start        # servidor local de desenvolvimento
npm run lint         # análise estática
npm run typecheck    # verificação de tipos (tsc --noEmit)
npm run package      # gera o .pbiviz em dist/
```

Com `npm run start` em execução, adicione o **Visual de Desenvolvedor** a um
relatório no Power BI Service. O host passa a consumir o bundle servido
localmente, e cada alteração salva é refletida no relatório sem reimportação.

> [!IMPORTANT]
> O Visual de Desenvolvedor exige que a opção correspondente esteja habilitada no
> portal de administração do Fabric e que o certificado local do `pbiviz` esteja
> instalado. Na primeira execução, o comando `pbiviz --install-cert` gera e instala
> esse certificado.

> [!NOTE]
> O **Map Visual** precisa de um token do Mapbox para exibir o fundo do mapa. O
> token nunca é versionado: ele vem de um arquivo `.env.local` ou do secret
> `MAPBOX_ACCESS_TOKEN` no GitHub. Veja a
> [documentação técnica do Map Visual](visuais/mapVisual/README.md#6-token-do-mapbox).

### 7.3 Integração contínua

| Workflow | Quando roda | O que faz |
|---|---|---|
| [`ci.yml`](.github/workflows/ci.yml) | Push na `main` e todo pull request | `npm ci`, lint, typecheck e `npm run package` dos três visuais; `npm audit` informativo; anexa os `.pbiviz` como artefatos |
| [`release.yml`](.github/workflows/release.yml) | Tag `<visual>-v<versão>` | Confere a tag com o `pbiviz.json`, empacota e cria a *Release* com o `.pbiviz` e as notas do CHANGELOG |
| [`dependabot.yml`](.github/dependabot.yml) | Mensal | Abre PRs de atualização de dependências npm e de actions |

---

## 8. Convenções do projeto

### 8.1 Versionamento dos pacotes

A versão declarada no `pbiviz.json` segue o formato de quatro segmentos exigido
pela plataforma (`major.minor.patch.build`). Adota-se a seguinte semântica:

| Segmento | Incrementa quando |
|---|---|
| `major` | Há mudança incompatível no contrato de dados — remoção ou renomeação de papel |
| `minor` | Uma funcionalidade ou propriedade de formatação é adicionada |
| `patch` | Uma correção de comportamento é aplicada sem alterar o contrato |
| `build` | O pacote é regerado durante o ciclo de desenvolvimento |

O GUID declarado no `pbiviz.json` **não deve ser alterado** após a primeira
distribuição: é ele que permite ao Power BI reconhecer a atualização como sendo
do mesmo visual, preservando a configuração dos relatórios existentes.

Cada versão publicada corresponde a uma **tag** `<visual>-v<versão>` e a uma
**Release** do GitHub, e é descrita no `CHANGELOG.md` do visual, no formato
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

### 8.2 Nomenclatura

- Pastas de projeto em `visuais/` usam *camelCase* e coincidem com `visual.name`.
- Pastas em `docs/` replicam exatamente o nome da pasta do projeto.
- Nomes de arquivos de imagem seguem o padrão numerado descrito no
  [template de documentação](docs/_template/README.md).
- Mensagens de commit seguem
  [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/), com o
  visual como escopo: `fix(velocimetro): ...`.

### 8.3 Documentação

| Documento | Público | Modelo |
|---|---|---|
| `docs/<visual>/README.md` | Analista que monta o relatório | [`docs/_template/README.md`](docs/_template/README.md) |
| `visuais/<visual>/README.md` | Quem mantém o código | [`docs/_template/README-desenvolvimento.md`](docs/_template/README-desenvolvimento.md) |
| `visuais/<visual>/CHANGELOG.md` | Os dois | Keep a Changelog |

---

## 9. Limitações e considerações

**Certificação.** Os visuais deste repositório não passaram pelo processo de
certificação da Microsoft. Visuais não certificados funcionam normalmente no
Power BI Desktop e no Service, mas não são renderizados na exportação para
PowerPoint nem em assinaturas de e-mail. As regras atuais de certificação exigem,
entre outros pontos, **um repositório por visual** com uma branch
`certification`, **nenhum privilégio `WebAccess`**, `npm audit` sem alertas
*high* ou *moderate* e suporte à **API de Rendering Events**. Por isso, este
repositório não serve diretamente para submissão, e o Map Visual não é
certificável enquanto depender de um serviço de mapas externo.

**Acesso externo.** A Barra de Porcentagem e o Velocímetro declaram
`"privileges": []`, isto é, não realizam nenhuma requisição de rede. O Map Visual
declara o privilégio `WebAccess` e carrega o fundo do mapa de
`https://api.mapbox.com` com um token público embutido no pacote — dependência
que exige atenção em ambientes com restrição de saída de rede. Detalhes em
[`SECURITY.md`](SECURITY.md).

**Volume de dados.** O host aplica redução de dados antes de entregar o
`DataView`. O Map Visual declara um limite de 30.000 linhas; acima disso, o
conjunto é amostrado pelo próprio Power BI, e não pelo visual.

**Acessibilidade.** O Map Visual declara `supportsKeyboardFocus` e
`supportsHighlight`; o Velocímetro implementa alto contraste, rótulo ARIA e foco
visível. Na Barra de Porcentagem, esse tratamento ainda é incipiente. A situação
de cada recurso recomendado pela Microsoft está na seção *Recursos da
plataforma* da documentação técnica de cada visual.

---

## 10. Trabalhos futuros

- [x] Publicação dos pacotes como *Releases* do GitHub, geradas por CI
- [x] Padronização das URLs de suporte e da licença nos metadados dos pacotes
- [ ] Rendering Events na Barra de Porcentagem e no Map Visual
- [ ] Alto contraste e navegação por teclado na Barra de Porcentagem
- [ ] Respeitar o formato da medida no valor central do Velocímetro (hoje fixo em `R$ #,0`)
- [ ] Zerar os alertas do `npm audit` (`vega` 6 na Barra, `maplibre-gl` no Map Visual)
- [ ] Remoção de dependências declaradas e não utilizadas (`d3` na Barra e no Map Visual)
- [ ] Remoção do domínio `tile.openstreetmap.org`, declarado e não usado, do Map Visual
- [ ] Testes automatizados de renderização, ampliando a harness manual do Velocímetro
- [ ] Capturas de tela para os guias de uso
- [ ] Avaliação da submissão ao processo de certificação (exigiria um repositório por visual)

---

## 11. Referências

As fontes consultadas no desenvolvimento — documentação normativa da plataforma,
ferramental, bibliotecas de renderização, padrões web e obras de fundamentação em
visualização de dados — estão reunidas em **[`Referencias.md`](Referencias.md)**,
no padrão ABNT NBR 6023.

---

## 12. Autoria, licença e contribuição

Desenvolvido por **Julio Vieira** e **Keven Cardoso**, sob licença
[Apache-2.0](LICENSE).

- Atribuição, formas de citação, licenças de terceiros e marcas registradas:
  **[`Autoria.md`](Autoria.md)**.
- Como relatar problemas, propor melhorias e enviar pull requests:
  **[`CONTRIBUTING.md`](CONTRIBUTING.md)**.
- Vulnerabilidades: **[`SECURITY.md`](SECURITY.md)** — nunca por issue pública.
- Convivência: **[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)**.
