<div align="center">

# Referências

![Power BI](https://img.shields.io/badge/Power%20BI-F2C811?style=flat-square&logo=powerbi&logoColor=black)
![Microsoft](https://img.shields.io/badge/Microsoft-0078D4?style=flat-square&logo=microsoft&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)

</div>

Fontes consultadas no desenvolvimento dos visuais deste repositório, organizadas
da documentação normativa da plataforma às obras de fundamentação teórica em
visualização de dados.

Referências no padrão ABNT NBR 6023. Documentação técnica de atualização contínua
não recebe data de publicação; a data de acesso indica a versão consultada.

**[⟵ Voltar ao README](README.md)**

---

## Sumário

1. [Documentação da plataforma](#1-documentação-da-plataforma)
2. [Ferramental de desenvolvimento](#2-ferramental-de-desenvolvimento)
3. [Bibliotecas de renderização](#3-bibliotecas-de-renderização)
4. [Padrões web e acessibilidade](#4-padrões-web-e-acessibilidade)
5. [Fundamentação em visualização de dados](#5-fundamentação-em-visualização-de-dados)
6. [Leituras complementares](#6-leituras-complementares)

---

## 1. Documentação da plataforma

Documentação normativa da Microsoft sobre o modelo de visuais personalizados.
É a fonte de autoridade para o contrato entre host e visual.

**Visão geral e ciclo de vida**

- MICROSOFT. **Power BI visuals: developer documentation.** Disponível em: <https://learn.microsoft.com/power-bi/developer/visuals/>. Acesso em: 2 set. 2026.
- MICROSOFT. **Develop your own Power BI visual.** Disponível em: <https://learn.microsoft.com/power-bi/developer/visuals/develop-power-bi-visuals>. Acesso em: 2 set. 2026.
- MICROSOFT. **Visual project structure.** Disponível em: <https://learn.microsoft.com/power-bi/developer/visuals/visual-project-structure>. Acesso em: 2 set. 2026.

**Contrato de dados**

- MICROSOFT. **Capabilities and properties of Power BI visuals.** Disponível em: <https://learn.microsoft.com/power-bi/developer/visuals/capabilities>. Acesso em: 2 set. 2026.
- MICROSOFT. **Understand data view mapping in Power BI visuals.** Disponível em: <https://learn.microsoft.com/power-bi/developer/visuals/dataview-mappings>. Acesso em: 2 set. 2026.
- MICROSOFT. **Data reduction algorithms in Power BI visuals.** Disponível em: <https://learn.microsoft.com/power-bi/developer/visuals/data-reduction>. Acesso em: 2 set. 2026.

**Interface e interação**

- MICROSOFT. **Format pane in Power BI visuals.** Disponível em: <https://learn.microsoft.com/power-bi/developer/visuals/format-pane>. Acesso em: 2 set. 2026.
- MICROSOFT. **Add tooltips to a Power BI visual.** Disponível em: <https://learn.microsoft.com/power-bi/developer/visuals/add-tooltips>. Acesso em: 2 set. 2026.
- MICROSOFT. **Add interactivity into visual by Power BI visuals selections.** Disponível em: <https://learn.microsoft.com/power-bi/developer/visuals/selection-api>. Acesso em: 2 set. 2026.
- MICROSOFT. **Create accessible Power BI visuals.** Disponível em: <https://learn.microsoft.com/power-bi/developer/visuals/create-accessible-visuals>. Acesso em: 2 set. 2026.

**Distribuição, segurança e certificação**

- MICROSOFT. **Power BI visuals privileges.** Disponível em: <https://learn.microsoft.com/power-bi/developer/visuals/develop-circle-card#privileges>. Acesso em: 2 set. 2026.
- MICROSOFT. **Get a Power BI visual certified.** Disponível em: <https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-certified>. Acesso em: 2 set. 2026.
- MICROSOFT. **Organizational visuals in Power BI.** Disponível em: <https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-organization>. Acesso em: 2 set. 2026.
- MICROSOFT. **Power BI visuals security.** Disponível em: <https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-faq>. Acesso em: 2 set. 2026.

---

## 2. Ferramental de desenvolvimento

- MICROSOFT. **PowerBI-visuals-tools.** Repositório GitHub. Disponível em: <https://github.com/microsoft/PowerBI-visuals-tools>. Acesso em: 2 set. 2026.
- MICROSOFT. **powerbi-visuals-utils-formattingmodel.** Repositório GitHub. Disponível em: <https://github.com/microsoft/powerbi-visuals-utils-formattingmodel>. Acesso em: 2 set. 2026.
- MICROSOFT. **eslint-plugin-powerbi-visuals.** Repositório GitHub. Disponível em: <https://github.com/microsoft/eslint-plugin-powerbi-visuals>. Acesso em: 2 set. 2026.
- MICROSOFT. **TypeScript documentation.** Disponível em: <https://www.typescriptlang.org/docs/>. Acesso em: 2 set. 2026.
- OPENJS FOUNDATION. **Node.js documentation.** Disponível em: <https://nodejs.org/docs/>. Acesso em: 2 set. 2026.

---

## 3. Bibliotecas de renderização

**Vega e Vega-Lite** — motor declarativo da Barra de Porcentagem.

- UNIVERSITY OF WASHINGTON INTERACTIVE DATA LAB. **Vega-Lite: a high-level grammar of interactive graphics.** Disponível em: <https://vega.github.io/vega-lite/>. Acesso em: 2 set. 2026.
- UNIVERSITY OF WASHINGTON INTERACTIVE DATA LAB. **Vega: a visualization grammar.** Disponível em: <https://vega.github.io/vega/>. Acesso em: 2 set. 2026.
- SATYANARAYAN, Arvind; MORITZ, Dominik; WONGSUPHASAWAT, Kanit; HEER, Jeffrey. **Vega-Lite: a grammar of interactive graphics.** IEEE Transactions on Visualization and Computer Graphics, v. 23, n. 1, p. 341-350, jan. 2017.
- SATYANARAYAN, Arvind; RUSSELL, Ryan; HOFFSWELL, Jane; HEER, Jeffrey. **Reactive Vega: a streaming dataflow architecture for declarative interactive visualization.** IEEE Transactions on Visualization and Computer Graphics, v. 22, n. 1, p. 659-668, jan. 2016.

**MapLibre GL JS** — projeção cartográfica do Map Visual.

- MAPLIBRE ORGANIZATION. **MapLibre GL JS documentation.** Disponível em: <https://maplibre.org/maplibre-gl-js/docs/>. Acesso em: 2 set. 2026.
- OPENSTREETMAP FOUNDATION. **Tile usage policy.** Disponível em: <https://operations.osmfoundation.org/policies/tiles/>. Acesso em: 2 set. 2026.

**D3** — dependência declarada, mantida como referência de apoio.

- BOSTOCK, Michael; OGIEVETSKY, Vadim; HEER, Jeffrey. **D³: data-driven documents.** IEEE Transactions on Visualization and Computer Graphics, v. 17, n. 12, p. 2301-2309, dez. 2011.
- BOSTOCK, Michael. **D3: the JavaScript library for bespoke data visualization.** Disponível em: <https://d3js.org/>. Acesso em: 2 set. 2026.

---

## 4. Padrões web e acessibilidade

Normas que regem o contêiner em que os visuais são renderizados e os critérios de
acessibilidade adotados como meta do projeto.

- WORLD WIDE WEB CONSORTIUM. **Scalable Vector Graphics (SVG) 2.** W3C Candidate Recommendation. Disponível em: <https://www.w3.org/TR/SVG2/>. Acesso em: 2 set. 2026.
- WORLD WIDE WEB CONSORTIUM. **Web Content Accessibility Guidelines (WCAG) 2.2.** W3C Recommendation, 5 out. 2023. Disponível em: <https://www.w3.org/TR/WCAG22/>. Acesso em: 2 set. 2026.
- WORLD WIDE WEB CONSORTIUM. **Accessible Rich Internet Applications (WAI-ARIA) 1.2.** W3C Recommendation, 6 jun. 2023. Disponível em: <https://www.w3.org/TR/wai-aria-1.2/>. Acesso em: 2 set. 2026.
- WHATWG. **HTML Living Standard.** Disponível em: <https://html.spec.whatwg.org/>. Acesso em: 2 set. 2026.

---

## 5. Fundamentação em visualização de dados

Obras que embasam as decisões de codificação visual adotadas nos componentes —
escolha de canal gráfico, uso de cor como categoria ordenada e desenho de
indicadores de desempenho.

- WILKINSON, Leland. **The grammar of graphics.** 2. ed. New York: Springer, 2005.
- WICKHAM, Hadley. **A layered grammar of graphics.** Journal of Computational and Graphical Statistics, v. 19, n. 1, p. 3-28, 2010.
- MUNZNER, Tamara. **Visualization analysis and design.** Boca Raton: CRC Press, 2014.
- CLEVELAND, William S.; McGILL, Robert. **Graphical perception: theory, experimentation, and application to the development of graphical methods.** Journal of the American Statistical Association, v. 79, n. 387, p. 531-554, 1984.
- FEW, Stephen. **Information dashboard design: the effective visual communication of data.** Sebastopol: O'Reilly Media, 2006.
- TUFTE, Edward R. **The visual display of quantitative information.** 2. ed. Cheshire: Graphics Press, 2001.
- BREWER, Cynthia A. **ColorBrewer: color advice for cartography.** Disponível em: <https://colorbrewer2.org/>. Acesso em: 2 set. 2026.

> [!NOTE]
> A crítica de Few (2006) aos indicadores radiais — baixa densidade informacional
> por área ocupada — foi considerada no desenho do Velocímetro, que preserva o
> valor absoluto no centro justamente para compensar a limitação apontada. A
> Barra de Porcentagem segue a recomendação de Cleveland e McGill (1984) ao
> privilegiar posição sobre escala comum como canal gráfico primário.

---

## 6. Leituras complementares

Materiais que não normatizam o projeto, mas ajudam a situar as alternativas
consideradas antes da decisão de construir visuais próprios.

- DENEB. **Deneb: declarative visualization in Power BI.** Disponível em: <https://deneb-viz.github.io/>. Acesso em: 2 set. 2026.
- SQLBI. **DAX Guide.** Disponível em: <https://dax.guide/>. Acesso em: 2 set. 2026.
- MICROSOFT. **Power BI Visuals Gallery (Microsoft AppSource).** Disponível em: <https://appsource.microsoft.com/marketplace/apps?product=power-bi-visuals>. Acesso em: 2 set. 2026.
- MICROSOFT. **Microsoft Fabric documentation.** Disponível em: <https://learn.microsoft.com/fabric/>. Acesso em: 2 set. 2026.

---

**[⟵ Voltar ao README](README.md)** · **[Autoria e licença](Autoria.md)** · **[Documentação dos visuais](docs/README.md)**
