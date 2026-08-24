# Repositório de Visuais Personalizados - Power BI

> Documentação oficial, guias de importação e código-fonte dos nossos visuais customizados para o Power BI.

Este repositório centraliza o desenvolvimento e a documentação técnica de visuais personalizados (arquivos `.pbiviz`), projetados para suprir necessidades analíticas específicas que vão além dos gráficos nativos do Power BI.

---

## Organização do projeto

Organizamos o repositório para separar claramente a documentação do código-fonte de cada visual construído:

```text
├── docs/                             <- Documentação técnica detalhada de cada visual.
├── visuais/                          <- Código-fonte dos projetos individuais.
│   │
│   └── BarraPercentual/              <- Exemplo: Visual de Barra Percentual.
│       │
│       ├── src/                      <- Lógica principal (TypeScript: visual.ts, settings.ts).
│       ├── style/                    <- Estilos do contêiner (LESS/CSS).
│       ├── assets/                   <- Ícones do visual.
│       ├── dist/                     <- Arquivo empacotado (.pbiviz) pronto para uso.
│       ├── pbiviz.json               <- Metadados do pacote (versão, autor, id).
│       └── capabilities.json         <- Definição de dados e painel de formatação.
│
└── README.md                         <- Este arquivo de apresentação.
```

## Tecnologias Utilizadas

Os visuais deste repositório são construídos utilizando o ecossistema oficial da Microsoft em conjunto com bibliotecas de renderização avançada:

*   **[Power BI Visuals Tools](https://github.com/microsoft/PowerBI-visuals-tools):** CLI oficial (`pbiviz`) para criação, execução, validação e empacotamento.
*   **[TypeScript](https://www.typescriptlang.org/):** Linguagem principal que gerencia o ciclo de vida, cálculos, mapeamento do `DataView` e tooltips.
*   **[Vega & Vega-Lite](https://vega.github.io/vega-lite/):** Motor de renderização declarativa para gerar gráficos SVG de alta precisão e performance.
*   **Power BI Visuals API:** Para integração profunda com o relatório, incluindo o moderno painel de formatação (`powerbi-visuals-utils-formattingmodel`).

---

## Visual em Destaque: Barra Percentual

**Status:** Versão Consolidada

O **Visual de Barra Percentual** foi projetado para representar percentuais de atingimento de metas de forma elegante. Ele elimina a necessidade de editar arquivos JSON manualmente, encapsulando toda a lógica Vega-Lite em um visual nativo do Power BI.

### Principais Funcionalidades
1. **Trilho Estável e Rótulos Flexíveis:** O fundo da barra sempre representa 100% da escala. O preenchimento visual é limitado a 100%, mas o rótulo de dados consegue exibir resultados superiores (ex: 127%) sem "quebrar" o layout.
2. **Cálculo Inteligente:** Aceita uma medida percentual pronta ou calcula dinamicamente a taxa utilizando componentes: `(Valores Positivos - Valores Negativos) / Base`.
3. **Cores por Faixas Configuráveis:** Configure pelo painel 5 faixas de cores sem usar DAX (Ruim, Baixa, Intermediária, Alta e Meta Atingida), além de aceitar cores via campo HEX.
4. **Tooltips Enriquecidos:** Suporta o arraste de múltiplos campos adicionais para a "Dica de Ferramenta", expandindo o contexto do dado ao passar o mouse.
5. **Formatação 100% Visual:** Controle altura, arredondamento de bordas, comprimento da barra e fontes diretamente pelo moderno painel de formatação do Power BI.

---

## Como Importar no Power BI (Usuários)

Para utilizar os visuais prontos em seus relatórios:

1. Acesse a pasta `dist/` do visual desejado aqui no repositório.
2. Faça o download do arquivo `.pbiviz`.
3. No Power BI Desktop, abra o painel **Visualizações**, clique nas reticências (`...`) e selecione **Importar um visual de um arquivo**.
4. Adicione suas medidas aos campos disponíveis e acesse o ícone de formatação para customizar.

---

## Como Executar e Desenvolver (Engenheiros)

### Pré-requisitos
* Node.js e npm instalados.
* Power BI Visuals Tools (`npm install -g powerbi-visuals-tools@7.2.1`).

### Rodando o ambiente de desenvolvimento local
1. Clone este repositório.
2. Acesse a pasta do visual: `cd visuais/BarraPercentual`
3. Restaure as dependências: `npm install`
4. Inicie o servidor local: `pbiviz start`
5. No **Power BI Service**, adicione o "Visual de Desenvolvedor" ao relatório para testar e validar o código quase em tempo real.
6. Quando o desenvolvimento estiver finalizado, gere o novo pacote com `pbiviz package` (o arquivo será depositado na pasta `dist/`).
