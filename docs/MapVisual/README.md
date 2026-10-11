<div align="center">

<img src="../../visuais/mapVisual/assets/icon.png" width="72" alt="">

# Map Visual

![Power BI](https://img.shields.io/badge/Power%20BI-F2C811?style=flat-square&logo=powerbi&logoColor=black)
![Versão](https://img.shields.io/badge/versão-1.0.0.12-blue?style=flat-square)
![API](https://img.shields.io/badge/API-5.11.1-6E4B9E?style=flat-square)
![MapLibre](https://img.shields.io/badge/MapLibre%20GL-6.1-396CB2?style=flat-square)

**Mapa de bolhas proporcionais que mostra Estados no zoom amplo e Cidades ao aproximar, com seleção cruzada e tooltips detalhados.**

<!-- IMAGEM: mapa com bolhas por estado, dados fictícios, controles de zoom visíveis. Salvar como img/01-visao-geral.png. -->
<!-- ![Mapa com bolhas laranja proporcionais sobre os estados do Brasil](img/01-visao-geral.png) — descomente quando a imagem existir -->

</div>

| | |
|---|---|
| **Nome interno** | `mapVisual` |
| **Nome exibido** | `Map Visual` |
| **Versão** | `1.0.0.12` |
| **API do Power BI** | `5.11.1` |
| **Renderização** | MapLibre GL com marcadores HTML |
| **Privilégios externos** | `WebAccess` — carrega o fundo do mapa do Mapbox |
| **Download** | [Releases do Map Visual](https://github.com/VieiraJulio/powerbi-custom-visuals/releases?q=mapVisual&expanded=true) |
| **Documentação técnica** | [`visuais/mapVisual`](../../visuais/mapVisual/README.md) |
| **Autores** | Julio Vieira e Keven Cardoso |

---

## Sumário

1. [O que é e quando usar](#1-o-que-é-e-quando-usar)
2. [Instalação no Power BI](#2-instalação-no-power-bi)
3. [Campos](#3-campos)
4. [Regra de cálculo](#4-regra-de-cálculo)
5. [Painel de formatação](#5-painel-de-formatação)
6. [Receitas](#6-receitas)
7. [Limitações conhecidas](#7-limitações-conhecidas)
8. [Solução de problemas](#8-solução-de-problemas)
9. [Histórico de versões](#9-histórico-de-versões)
10. [Créditos](#10-créditos)

---

## 1. O que é e quando usar

O visual desenha uma bolha por localidade, com área proporcional a uma medida.
A leitura é progressiva: com o mapa afastado, as cidades são somadas em uma bolha
por **Estado**; ao aproximar além de um nível de zoom configurável, as bolhas se
abrem por **Cidade**.

Clicar em uma bolha seleciona todas as linhas daquela cidade ou estado e filtra
ou realça os outros visuais da página. O tooltip junta, sem repetir, os valores
de até 20 campos — útil para listar, por exemplo, os itens que existem em cada
cidade.

O visual **não geocodifica**: ele precisa de latitude e longitude prontas no
modelo.

**Use quando:**

- Você já tem coordenadas por cidade e quer ver a distribuição geográfica de um
  indicador.
- A análise começa no nível de Estado e desce para Cidade sem criar hierarquia
  de drill.
- O mapa precisa funcionar como filtro para os demais visuais.

**Prefira o mapa nativo (Azure Maps) quando:**

- Os dados têm só nome de cidade ou endereço, sem coordenadas.
- Você precisa de áreas coloridas (coroplético) em vez de bolhas.
- O ambiente bloqueia acesso à internet a partir do Power BI.

---

## 2. Instalação no Power BI

1. Baixe o `.pbiviz` da versão mais recente nas [Releases do Map Visual](https://github.com/VieiraJulio/powerbi-custom-visuals/releases?q=mapVisual&expanded=true).
2. No Power BI Desktop, abra o painel **Visualizações**.
3. Clique nas reticências (`...`) e escolha **Importar um visual de um arquivo**.
4. Selecione o arquivo baixado e confirme o aviso de visual não certificado.
5. O ícone passa a aparecer no painel de visualizações do relatório.

> [!IMPORTANT]
> O fundo do mapa vem do **Mapbox** pela internet. O Power BI Desktop e o Service
> precisam conseguir acessar `https://api.mapbox.com`. Em redes corporativas com
> restrição de saída, peça a liberação desse domínio.

> [!NOTE]
> A importação vale para o relatório atual. Para disponibilizar o visual para
> toda a organização, o `.pbiviz` precisa ser publicado no repositório de visuais
> da organização por um administrador do Fabric.

---

## 3. Campos

<!-- ![Campos do visual preenchidos](img/03-campos.png) — descomente quando a imagem existir -->

| Campo | Obrigatório | Tipo aceito | O que faz |
|---|---|---|---|
| **Estado** | Sim | Coluna | Forma o nível estadual e compõe, com a Cidade, a chave de cada bolha. |
| **Cidade** | Sim | Coluna | Forma o nível municipal. |
| **Latitude** | Sim | Coluna numérica (sem resumo) | Entre -90 e 90. |
| **Longitude** | Sim | Coluna numérica (sem resumo) | Entre -180 e 180. |
| **Tamanho** | Não | Medida numérica | Define a área da bolha e o número exibido nela. Sem o campo, cada linha vale 1. |
| **Rótulo da cidade** | Não | Coluna ou medida | Texto exibido no lugar do nome da cidade. |
| **Dicas de ferramenta** | Não | Coluna ou medida, até 20 campos | Valores adicionais no tooltip, sem repetição por bolha. |

Sem **Estado**, **Cidade**, **Latitude** e **Longitude** — ou se nenhuma linha
tiver coordenadas válidas — o visual exibe
`Adicione Estado, Cidade, Latitude e Longitude.`

---

## 4. Regra de cálculo

As linhas recebidas do Power BI passam por três etapas antes de virar bolhas.

**1. Validação.** São descartadas as linhas sem Estado ou Cidade, com
coordenadas vazias ou fora dos limites e — quando o campo **Tamanho** existe —
com Tamanho nulo, zero ou negativo.

**2. Agregação por Cidade.** Linhas com o mesmo par Estado + Cidade (comparado
depois de remover espaços nas pontas) viram uma bolha só:

- o Tamanho é **somado**;
- as coordenadas são a **média ponderada pelo Tamanho**, caso a mesma cidade
  venha com coordenadas diferentes;
- rótulos e valores de tooltip são unidos, sem repetição.

**3. Agregação por Estado.** Cada bolha de Estado soma as suas cidades, e o
centro é a média das coordenadas das cidades ponderada pelos totais.

O raio usa escala de **raiz quadrada**, relativa ao maior valor do nível que está
na tela. Assim, a **área** da bolha é proporcional ao valor:

```text
proporção = raiz_quadrada(tamanho_do_ponto / maior_tamanho_do_nível)
raio      = raio_mínimo + (raio_máximo - raio_mínimo) × proporção
```

| Tamanho | Maior do nível | Raio (padrões 18 e 42 px) |
|---|---|---|
| 100 | 100 | 42 px |
| 25 | 100 | 30 px |
| 1 | 100 | 20,4 px |

> [!IMPORTANT]
> Grafias diferentes da mesma cidade (`Belo Horizonte` e `BELO HORIZONTE`, ou
> com e sem acento) viram bolhas separadas. Padronize os nomes no modelo.

---

## 5. Painel de formatação

### 5.1 Bolhas

| Propriedade | Padrão | Intervalo | Efeito |
|---|---|---|---|
| **Cor da bolha** | `#E67E22` | — | Cor de preenchimento de todas as bolhas. |
| **Transparência (%)** | `34` | 0 a 100 | Transparência do preenchimento. |
| **Cor da borda** | `#FFFFFF` | — | — |
| **Espessura da borda** | `3` | 0 a 12 | Em pixels. |
| **Mostrar borda de seleção** | Ligado | — | Contorno nas bolhas selecionadas: sólido para seleção total, tracejado para parcial. |
| **Cor da borda de seleção** | `#2563EB` | — | Só aparece com a opção anterior ligada. |
| **Raio mínimo** | `18` | 4 a 120 | Raio da menor bolha, em pixels. |
| **Raio máximo** | `42` | 4 a 180 | Raio da maior bolha. Se ficar menor que o mínimo, é elevado ao mínimo. |
| **Mostrar quantidade** | Ligado | — | Selo escuro no canto da bolha com o Tamanho, com até duas casas decimais. |

### 5.2 Ícone

| Propriedade | Padrão | Intervalo | Efeito |
|---|---|---|---|
| **Mostrar ícone** | Ligado | — | Desenha um ícone no centro de cada bolha (padrão: trator). |
| **Mostrar botão de configurações** | Ligado | — | Engrenagem visível só em modo de edição, com a ação **Importar PNG**. |
| **Tamanho do ícone (%)** | `58` | 10 a 100 | Relativo ao tamanho da bolha. |
| **Opacidade do ícone (%)** | `100` | 0 a 100 | — |

O PNG importado vale para todas as bolhas: até **5 MB**, redimensionado para no
máximo **128 px** e salvo dentro do relatório. Nada é enviado para a internet.

### 5.3 Níveis do mapa

| Propriedade | Padrão | Intervalo | Efeito |
|---|---|---|---|
| **Alternar Estado/Cidade pelo zoom** | Ligado | — | Desligado, o mapa mostra sempre Cidades. |
| **Zoom para mostrar cidades** | `7` | 2 a 18 | Abaixo desse zoom, Estados; a partir dele, Cidades. |
| **Duração da transição (ms)** | `280` | 0 a 1.500 | Animação ao trocar de nível. |
| **Mostrar nome do estado** | Ligado | — | — |
| **Mostrar nome da cidade** | Ligado | — | — |

### 5.4 Dicas de ferramenta

| Propriedade | Padrão | Efeito |
|---|---|---|
| **Ativar dicas de ferramenta** | Ligado | Liga ou desliga o tooltip. |
| **Incluir quantidade** | Ligado | Mostra o Tamanho no tooltip. |

O visual também aceita **páginas de dica de ferramenta** do Power BI.

### 5.5 Navegação

- O mapa abre centralizado no Brasil, com zoom 5; o zoom vai de 2 a 18.
- Controles de zoom, bússola e inclinação ficam no canto superior direito.
- Quando os dados mudam, o mapa se ajusta a eles: um único ponto é centralizado
  com zoom 9; vários pontos são enquadrados com zoom máximo 11.
- Clicar em uma bolha **não** aproxima o mapa.

---

## 6. Receitas

### 6.1 Clientes por cidade

Modelo de exemplo, com uma dimensão de cidades já geocodificada:

```dax
Clientes Ativos = DISTINCTCOUNT ( fVendas[ClienteID] )
```

| Campo do visual | Campo do modelo |
|---|---|
| Estado | `dCidade[UF]` |
| Cidade | `dCidade[Cidade]` |
| Latitude | `dCidade[Latitude]` |
| Longitude | `dCidade[Longitude]` |
| Tamanho | `[Clientes Ativos]` |

### 6.2 Listar itens no tooltip

Arraste uma coluna de identificação (por exemplo `fEquipamentos[NumeroSerie]`)
direto para **Dicas de ferramenta**. O visual junta os valores únicos de todas as
linhas da bolha, sem repetir. Uma medida com `CONCATENATEX` também funciona.

### 6.3 Usar o mapa como filtro da página

1. Clique em uma bolha para filtrar a página por aquela cidade ou estado.
2. Use **Ctrl+clique** (ou **Cmd+clique** no macOS) para selecionar várias.
3. Clique em uma área vazia do mapa para limpar a seleção.
4. Em **Formatar > Editar interações**, escolha se cada visual de destino será
   filtrado ou realçado.

A propagação depende dos relacionamentos do modelo entre a tabela de cidades e
as tabelas dos outros visuais.

---

## 7. Limitações conhecidas

- **Depende de internet** e do serviço do Mapbox; não há modo offline.
- **Não geocodifica** nomes ou endereços.
- **Até 30.000 linhas.** Acima disso, o Power BI entrega uma amostra ao visual.
- **Sem agrupamento de bolhas próximas** (*clustering*): bolhas vizinhas podem
  se sobrepor.
- **A escala é relativa** ao maior valor do nível na tela; o mesmo número pode
  gerar bolhas de tamanhos diferentes em filtros diferentes.
- **Filtros podem recentralizar o mapa**, porque o enquadramento acompanha os
  dados.
- **O estilo do mapa não é configurável** no painel.
- **Um ícone para todas as bolhas.**
- **Tooltip orientado a mouse.**
- **Realce (highlight) sem estado visual próprio** quando outro visual filtra o mapa.
- **Visual não certificado — e não certificável enquanto acessar a internet.**
  Não aparece em exportação para PowerPoint nem em assinaturas por e-mail.

---

## 8. Solução de problemas

| O que aparece | Causa | Correção |
|---|---|---|
| Bolhas aparecem, mas o fundo do mapa fica vazio | O fundo não veio do Mapbox: rede bloqueada ou token do pacote revogado. | Verifique o acesso a `https://api.mapbox.com` e atualize para o pacote mais recente das Releases. |
| `Adicione Estado, Cidade, Latitude e Longitude.` | Falta um dos quatro campos, ou todas as linhas têm coordenadas inválidas. | Preencha os quatro campos e confira se Latitude e Longitude são numéricas e estão dentro dos limites. |
| `Token do Mapbox não configurado: troque seu_token em src/visual.ts.` | O `.pbiviz` foi compilado sem token. | Use o pacote publicado nas Releases ou peça a quem gerou o pacote que siga a [documentação técnica](../../visuais/mapVisual/README.md#6-token-do-mapbox). |
| `O mapa não pôde ser inicializado.` | O navegador ou o Desktop não conseguiu criar o mapa (por exemplo, WebGL desativado). | Atualize o Power BI Desktop ou teste no Service; persistindo, [abra uma issue](https://github.com/VieiraJulio/powerbi-custom-visuals/issues/new/choose). |
| Bolhas no oceano ou em outro país | Latitude e Longitude trocadas, ou importadas como texto com separador errado. | Confira a ordem dos campos e o tipo de dado das colunas. |
| A mesma cidade aparece em duas bolhas | Grafias diferentes do nome ou do estado. | Padronize os nomes na dimensão de cidades. |
| Clicar na bolha não filtra outro visual | Interação desativada ou falta relacionamento. | Revise **Editar interações** e os relacionamentos do modelo. |

---

## 9. Histórico de versões

As mudanças de cada versão estão no
[`CHANGELOG.md`](../../visuais/mapVisual/CHANGELOG.md) do visual, e os pacotes
ficam nas [Releases do Map Visual](https://github.com/VieiraJulio/powerbi-custom-visuals/releases?q=mapVisual&expanded=true).

---

## 10. Créditos

Desenvolvido por **Julio Vieira** e **Keven Cardoso**. Licenciado sob
[Apache-2.0](../../LICENSE). Fundo do mapa © Mapbox © OpenStreetMap.

Para arquitetura, processamento dos dados, configuração do token e comandos de
build, veja a [documentação técnica](../../visuais/mapVisual/README.md).
