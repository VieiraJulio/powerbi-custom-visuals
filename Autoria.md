<div align="center">

# Autoria e licença

![Licença](https://img.shields.io/badge/Licença-Apache%202.0-D22128?style=for-the-badge)
![Power BI](https://img.shields.io/badge/Power%20BI-F2C811?style=for-the-badge&logo=powerbi&logoColor=black)

</div>

**[⟵ Voltar ao README](README.md)**

---

## Sumário

1. [Autores](#1-autores)
2. [Como citar este repositório](#2-como-citar-este-repositório)
3. [Licença do projeto](#3-licença-do-projeto)
4. [Licenças de terceiros](#4-licenças-de-terceiros)
5. [Marcas registradas](#5-marcas-registradas)
6. [Contribuições](#6-contribuições)

---

## 1. Autores

| Autor | Contribuição | Perfil |
|---|---|---|
| **Julio Vieira** | Concepção, requisitos analíticos, validação em relatórios e documentação | [@VieiraJulio](https://github.com/VieiraJulio) |
| **Keven Cardoso** | Concepção, implementação dos visuais, empacotamento e manutenção | [@KevenHenrique](https://github.com/KevenHenrique) |

Os visuais foram desenvolvidos a partir de necessidades analíticas identificadas
em relatórios de produção, e cada componente passou por validação em uso real
antes de ser consolidado neste repositório.

> [!NOTE]
> Os arquivos `pbiviz.json` dos três projetos declaram atualmente apenas um autor
> no campo `author`, herdado do momento em que os pacotes foram gerados. A
> atribuição correta é a desta página, e o alinhamento dos metadados dos pacotes
> consta como item de trabalho futuro no [README](README.md#10-trabalhos-futuros).

---

## 2. Como citar este repositório

**ABNT NBR 6023**

```text
VIEIRA, Julio; CARDOSO, Keven. Visuais personalizados para Power BI:
desenvolvimento, documentação e distribuição de visuais customizados.
2026. Repositório GitHub. Disponível em:
https://github.com/VieiraJulio/powerbi-custom-visuals. Acesso em: [data].
```

**BibTeX**

```bibtex
@software{vieira_cardoso_powerbi_visuals,
  author  = {Vieira, Julio and Cardoso, Keven},
  title   = {Visuais Personalizados para Power BI},
  year    = {2026},
  url     = {https://github.com/VieiraJulio/powerbi-custom-visuals},
  license = {Apache-2.0}
}
```

Para citar um visual específico, acrescente o nome do componente e a versão do
pacote — por exemplo, *Barra de Porcentagem, versão 1.0.0.0*.

---

## 3. Licença do projeto

Este repositório é distribuído sob a **Licença Apache, versão 2.0**. O texto
integral está em [`LICENSE`](LICENSE).

| | |
|---|---|
| ✅ **Permitido** | Uso comercial, modificação, distribuição, uso privado e sublicenciamento |
| ⚠️ **Exigido** | Manter o aviso de copyright e o texto da licença; declarar as alterações relevantes feitas nos arquivos |
| 🛡️ **Concedido** | Licença expressa de patente pelos contribuidores |
| ❌ **Não concedido** | Uso das marcas dos autores ou de terceiros; garantia de qualquer natureza |

O software é fornecido **"no estado em que se encontra"**, sem garantias
expressas ou implícitas. Os autores não respondem por decisões de negócio
tomadas a partir de relatórios que utilizem estes visuais.

> [!IMPORTANT]
> Os arquivos `package.json` dos três projetos declaram `"license": "MIT"`,
> valor herdado do template de scaffolding do `pbiviz`. A licença efetiva do
> repositório é a Apache-2.0 declarada em `LICENSE`. A correção desse campo
> consta como item de trabalho futuro.

---

## 4. Licenças de terceiros

Os pacotes `.pbiviz` distribuídos em `dist/` incorporam código das bibliotecas
abaixo. Todas adotam licenças permissivas compatíveis com a Apache-2.0.

| Biblioteca | Versão | Licença | Uso no projeto |
|---|---|---|---|
| [`powerbi-visuals-api`](https://github.com/microsoft/powerbi-visuals-api) | `5.11.1` | MIT | Contrato de integração com o host |
| [`powerbi-visuals-utils-formattingmodel`](https://github.com/microsoft/powerbi-visuals-utils-formattingmodel) | `6.0.4` | MIT | Painel moderno de formatação |
| [`vega`](https://github.com/vega/vega) | `5.33.1` | BSD-3-Clause | Runtime de renderização — Barra de Porcentagem |
| [`vega-lite`](https://github.com/vega/vega-lite) | `5.23.0` | BSD-3-Clause | Gramática declarativa — Barra de Porcentagem |
| [`maplibre-gl`](https://github.com/maplibre/maplibre-gl-js) | `6.1.0` | BSD-3-Clause | Projeção cartográfica — Map Visual |
| [`d3`](https://github.com/d3/d3) | `7.9.0` | ISC | Dependência declarada, sem uso no código atual |
| [`typescript`](https://github.com/microsoft/TypeScript) | `5.5.4` | Apache-2.0 | Compilação (desenvolvimento) |
| [`eslint`](https://github.com/eslint/eslint) | `9.x` | MIT | Análise estática (desenvolvimento) |

**Serviços externos.** O Map Visual declara o privilégio `WebAccess` para
`https://tile.openstreetmap.org` e `https://api.mapbox.com`. O uso desses
serviços está sujeito às respectivas políticas:

- OpenStreetMap — [Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/) e dados sob [ODbL](https://www.openstreetmap.org/copyright)
- Mapbox — [Termos de serviço](https://www.mapbox.com/legal/tos), que podem exigir chave de API própria em uso de produção

---

## 5. Marcas registradas

Microsoft, Power BI, Power BI Desktop, Microsoft Fabric e Azure são marcas
registradas ou marcas comerciais da Microsoft Corporation nos Estados Unidos e
em outros países. TypeScript é marca da Microsoft Corporation. OpenStreetMap é
marca da OpenStreetMap Foundation. Mapbox é marca da Mapbox, Inc.

**Este projeto não é afiliado, patrocinado nem endossado pela Microsoft
Corporation.** As marcas e logotipos são utilizados exclusivamente em caráter
descritivo, para identificar a plataforma e as tecnologias com as quais os
visuais são compatíveis.

Os visuais aqui publicados **não são certificados** pela Microsoft e não constam
do AppSource.

---

## 6. Contribuições

Relatos de comportamento inesperado, sugestões de novos visuais e propostas de
melhoria são bem-vindos pela aba
[Issues](https://github.com/VieiraJulio/powerbi-custom-visuals/issues).

Ao relatar um problema, informe:

1. Nome e **versão** do visual (visível em `pbiviz.json` ou no nome do arquivo `.pbiviz`);
2. Versão do Power BI Desktop e se o comportamento também ocorre no Service;
3. Passos para reproduzir, com **dados fictícios**;
4. Print da tela, quando o problema for visual.

> [!CAUTION]
> Não anexe capturas de tela com dados reais de clientes, faturamento ou qualquer
> informação sensível. Reproduza o cenário com dados fictícios antes de publicar.

Contribuições de código enviadas a este repositório são licenciadas sob os
mesmos termos da Apache-2.0, conforme a seção 5 da licença.

---

**[⟵ Voltar ao README](README.md)** · **[Referências](REFERENCIAS.md)** · **[Documentação dos visuais](docs/README.md)**
