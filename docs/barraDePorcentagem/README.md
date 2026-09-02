<div align="center">

<img src="../../visuais/barraDePorcentagem/assets/icon.png" width="72" alt="">

# Barra de Porcentagem

![Power BI](https://img.shields.io/badge/Power%20BI-F2C811?style=flat-square&logo=powerbi&logoColor=black)
![Versão](https://img.shields.io/badge/versão-1.0.0.0-blue?style=flat-square)
![API](https://img.shields.io/badge/API-5.11.1-6E4B9E?style=flat-square)
![Vega-Lite](https://img.shields.io/badge/Vega--Lite-5.23-1F77B4?style=flat-square&logo=vega&logoColor=white)

**Barra de progresso compacta para percentual de atingimento, com cor definida pela meta ou por faixas de desempenho, sem precisar de DAX condicional.**

![Duas barras de porcentagem, uma em 81% na cor da faixa Intermediária e outra em 55% na cor da faixa Baixa](img/01-visao-geral.png)

</div>

| | |
|---|---|
| **Nome interno** | `barraDePorcentagem` |
| **Nome exibido** | `BarraDePorcentagem` |
| **Versão** | `1.0.0.0` |
| **API do Power BI** | `5.11.1` |
| **Renderização** | SVG (Vega-Lite) |
| **Privilégios externos** | Nenhum |
| **Pacote** | [`barraDePorcentagem...1.0.0.0.pbiviz`](../../visuais/barraDePorcentagem/dist/) |
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
9. [Referência técnica](#9-referência-técnica)
10. [Desenvolvimento](#10-desenvolvimento)
11. [Histórico de versões](#11-histórico-de-versões)
12. [Créditos](#12-créditos)

---

## 1. O que é e quando usar

O visual desenha uma barra horizontal em que o trilho de fundo representa sempre
100% da escala e o preenchimento representa o quanto foi atingido. Ao lado da
barra, um rótulo exibe o percentual em número.

A diferença em relação ao gráfico de barras nativo está no comportamento do
trilho: ele **não muda de comprimento** conforme o resultado. Ao filtrar o
relatório, a barra de 45% e a barra de 127% ocupam exatamente o mesmo espaço, e
apenas a área preenchida muda. Isso mantém o layout estável quando várias barras
aparecem empilhadas em uma matriz ou em cartões lado a lado.

O preenchimento é limitado a 100%, mas o rótulo não é. Um resultado de 127%
desenha a barra cheia e escreve `127%` — o número não é perdido nem "estoura" o
desenho. O mesmo vale para resultados negativos: a barra fica vazia e o rótulo
mostra `-10%`.

**Use quando:**

- Você precisa mostrar atingimento de meta em uma matriz, com uma barra por linha.
- O semáforo de cores precisa ser configurado por quem monta o relatório, sem editar DAX.
- Resultados acima de 100% são comuns e precisam continuar legíveis.

**Prefira outro caminho quando:**

- Você precisa comparar categorias entre si pelo comprimento da barra — nesse caso
  o gráfico de barras nativo é o certo, porque aqui o trilho é fixo.
- Você precisa de eixo, grade ou rótulo de categoria dentro do próprio visual.

---

## 2. Instalação no Power BI

1. Baixe o `.pbiviz` mais recente em [`visuais/barraDePorcentagem/dist/`](../../visuais/barraDePorcentagem/dist/).
2. No Power BI Desktop, abra o painel **Visualizações**.
3. Clique nas reticências (`...`) e escolha **Importar um visual de um arquivo**.
4. Selecione o arquivo baixado e confirme o aviso de visual não certificado.
5. O ícone passa a aparecer no painel de visualizações do relatório.

<!-- IMAGEM: menu "..." aberto no painel Visualizações, com "Importar um visual de um arquivo" destacado por um retângulo. -->
![Importando o visual no Power BI Desktop](img/02-importar-visual.png)

> [!NOTE]
> A importação vale para o relatório atual, não para a instalação do Power BI.
> Cada `.pbix` novo precisa importar o visual de novo. Para disponibilizar o
> visual para toda a organização, o `.pbiviz` precisa ser publicado no repositório
> de organização por um administrador do Fabric.

---

## 3. Campos

<!-- IMAGEM: painel de campos do visual com "Percentual" e "Meta (opcional)" preenchidos e dois campos em "Dica de ferramenta". -->
![Campos do visual preenchidos](img/03-campos.png)

| Campo | Obrigatório | Tipo aceito | O que faz |
|---|---|---|---|
| **Percentual** | Sim | Medida numérica | Valor do indicador. Sozinho, é lido como percentual já pronto: `0,20` equivale a 20%. |
| **Meta (opcional)** | Não | Medida numérica maior que zero | Quando preenchida, define o valor que equivale a 100% da barra. O visual passa a calcular `Percentual / Meta`. |
| **Dica de ferramenta** | Não | Medida ou coluna, até 20 campos | Campos adicionais exibidos ao passar o mouse sobre a barra. |

Sem o campo **Percentual**, o visual não desenha nada e exibe a mensagem
`Adicione uma medida ao campo Percentual.`

---

## 4. Regra de cálculo

O visual tem dois modos de leitura, e qual deles vale depende apenas de o campo
**Meta** estar preenchido ou não.

**Sem Meta** — o valor informado já é o percentual:

```text
progresso = Percentual
```

**Com Meta** — o visual calcula o atingimento:

```text
progresso = Percentual / Meta
```

| Percentual | Meta | Progresso e rótulo | Preenchimento da barra |
|---|---|---|---|
| `0,75` | — | 75% | 75% |
| `0,20` | — | 20% | 20% |
| `50` | `100` | 50% | 50% |
| `0,50` | `0,40` | 125% | 100% |
| `-0,10` | — | -10% | 0% |

> [!IMPORTANT]
> **A escala é a armadilha mais comum.** Sem Meta, o número entra como fração.
> Informar `20` produz **2.000%**, não 20%. Para representar 20%, a medida precisa
> devolver `0,20`. Com Meta, os dois campos podem estar em valores absolutos
> (`50` e `100`) ou fracionários (`0,50` e `0,40`), desde que estejam na
> **mesma unidade**.

O visual guarda dois números separados internamente:

- **Progresso real** — usado no rótulo, na escolha da cor e no tooltip.
- **Progresso da barra** — usado apenas na largura do preenchimento, limitado
  entre 0% e 100%.

É essa separação que permite escrever `127%` sem quebrar o desenho.

---

## 5. Painel de formatação

Todos os controles ficam no ícone de pincel, em **Formatar visual**.

### 5.1 Barra

<!-- IMAGEM: cartão "Barra" expandido no painel de formatação. -->
![Cartão Barra no painel de formatação](img/04a-formatacao-barra.png)

| Propriedade | Padrão | Intervalo | Efeito |
|---|---|---|---|
| **Cor de fundo** | `#C8C8C8` | — | Cor do trilho, a parte não preenchida. |
| **Altura** | `15` | 1 a 100 | Espessura da barra, em pixels. |
| **Comprimento da barra (%)** | `100` | 10 a 100 | Percentual da largura disponível que o trilho ocupa. Reduza para abrir espaço quando o rótulo tiver muitos dígitos. |
| **Arredondamento** | `15` | 0 a 50 | Raio das pontas. `0` deixa a barra retangular. |

### 5.2 Rótulo

<!-- IMAGEM: cartão "Rótulo" expandido, com "Usar cor da barra" ligado. -->
![Cartão Rótulo no painel de formatação](img/04b-formatacao-rotulo.png)

| Propriedade | Padrão | Intervalo | Efeito |
|---|---|---|---|
| **Exibir** | Ligado | — | Mostra ou esconde o número ao lado da barra. |
| **Usar cor da barra** | Ligado | — | O texto assume a mesma cor do preenchimento, acompanhando o semáforo. |
| **Cor do texto** | `#333333` | — | Cor fixa do rótulo. **Só aparece no painel** quando *Usar cor da barra* está desligado. |
| **Tamanho do texto** | `13` | 6 a 72 | Tamanho da fonte do rótulo. |
| **Casas decimais** | `0` | 0 a 4 | Casas decimais do percentual exibido. |

O rótulo é posicionado depois da **extremidade total do trilho**, não depois da
parte preenchida. Por isso ele fica alinhado entre barras de valores diferentes.

### 5.3 Dica de ferramenta

| Propriedade | Padrão | Efeito |
|---|---|---|
| **Exibir** | Ligado | Liga ou desliga o tooltip. Desligado, os campos arrastados para *Dica de ferramenta* deixam de aparecer. |

<!-- IMAGEM: tooltip aberto sobre a barra, mostrando o percentual e dois campos adicionais. -->
![Dica de ferramenta aberta](img/06-tooltip.png)

### 5.4 Comportamento de cor

O cartão tem um seletor **Modo** no topo. Os grupos de configuração que aparecem
abaixo dele mudam conforme o modo escolhido — o painel esconde o que não se aplica.

<!-- IMAGEM: cartão "Comportamento de cor" com o seletor Modo aberto, mostrando as três opções. -->
![Modos de cor](img/04c-formatacao-cor.png)

#### Comparar com a meta — padrão

Duas cores, decididas pelo atingimento.

| Propriedade | Padrão | Efeito |
|---|---|---|
| **Cor abaixo da meta** | `#FF4C4C` (vermelho) | Progresso menor que 100%. |
| **Cor da meta atingida** | `#22B907` (verde) | Progresso igual ou maior que 100%. |

> [!NOTE]
> Sem o campo **Meta** preenchido, este modo não tem contra o que comparar e cai
> na **Cor fixa** configurada.

#### Cor fixa

Uma cor só, independente do valor.

| Propriedade | Padrão |
|---|---|
| **Cor** | `#11A3DD` (azul) |

#### Faixas de valor

Cinco faixas configuráveis, avaliadas sobre o **progresso** — ou seja, já depois
da divisão pela meta, quando existe meta.

| Faixa | Valor padrão | Cor padrão | Aplica-se a |
|---|---|---|---|
| **Ruim** | `0` | `#FF4C4C` | de 0 até abaixo de 0,50 |
| **Baixa** | `0,50` | `#FFC300` | de 0,50 até abaixo de 0,80 |
| **Intermediária** | `0,80` | `#A3F573` | de 0,80 até abaixo de 0,99 |
| **Alta** | `0,99` | `#62D62C` | de 0,99 até abaixo de 1,00 |
| **Meta atingida** | `1` | `#22B907` | a partir de 1,00 |

<!-- IMAGEM: cinco barras lado a lado, uma em cada faixa de cor, com o rótulo visível. -->
![As cinco faixas de cor](img/05-faixas-cores.png)

Cada faixa aceita valores de `0` a `10`, sempre em **escala fracionária**:
`0,50` significa 50%, `1` significa 100%, `1,2` significa 120%.

Duas regras de comportamento importam na hora de configurar:

- Os limites são **normalizados em tempo de execução** para uma ordem não
  decrescente. Se você digitar um limite menor que o da faixa anterior, ele é
  elevado silenciosamente — o painel não avisa, mas o desenho respeita a ordem.
- Limites iguais favorecem a faixa de **maior** status, porque a avaliação começa
  em *Meta atingida* e desce até *Ruim*.

---

## 6. Receitas

### 6.1 Percentual já calculado no DAX

O caso mais simples. A medida devolve a fração e o campo **Meta** fica vazio.

```dax
% Atingimento =
DIVIDE (
    [Faturamento],
    [Meta Faturamento]
)
```

Arraste `% Atingimento` para **Percentual**. Em **Comportamento de cor**, escolha
**Faixas de valor** para ter o semáforo, ou **Cor fixa** para uma cor única.

### 6.2 Realizado e meta separados, sem dividir no DAX

Deixe a divisão com o visual. Isso mantém o tooltip com os valores absolutos.

```dax
Faturamento = SUM ( fFaturamento[Valor] )

Meta Faturamento = SUM ( fMetas[Meta] )
```

Arraste `Faturamento` para **Percentual** e `Meta Faturamento` para
**Meta (opcional)**. Mantenha o modo **Comparar com a meta** para o vermelho e
verde automáticos, e arraste as duas medidas também para **Dica de ferramenta**
para que o usuário veja os números absolutos ao passar o mouse.

### 6.3 Semáforo por faixas com corte próprio

Quando as faixas do negócio não são as padrão. Exemplo com corte em 70%, 90% e 100%:

| Faixa | Valor |
|---|---|
| Ruim | `0` |
| Baixa | `0,70` |
| Intermediária | `0,90` |
| Alta | `0,99` |
| Meta atingida | `1` |

Lembre-se de digitar em fração: `0,70`, não `70`.

---

## 7. Limitações conhecidas

- **Uma barra por visual.** O campo **Percentual** aceita exatamente uma medida.
  Para várias linhas, use o visual dentro de uma matriz ou replique o objeto.
- **O preenchimento não passa de 100%.** O excedente aparece no rótulo, nunca no desenho.
- **Meta precisa ser maior que zero.** Meta igual ou menor que zero interrompe a
  renderização com mensagem de erro.
- **Sem eixo, grade ou rótulo de categoria.** O visual desenha trilho, preenchimento e rótulo.
- **Sem seleção cruzada.** Clicar na barra não filtra outros visuais.
- **Máximo de 20 campos** na dica de ferramenta.
- **Visual não certificado.** Isso não impede o uso no Power BI Service, mas o
  visual não aparece em exportação para PowerPoint nem em assinaturas por e-mail.

---

## 8. Solução de problemas

| O que aparece | Causa | Correção |
|---|---|---|
| `Adicione uma medida ao campo Percentual.` | O campo obrigatório está vazio. | Arraste uma medida numérica para **Percentual**. |
| `O percentual possui um valor inválido.` | A medida devolveu texto, infinito ou resultado de divisão por zero. | Envolva a medida em `DIVIDE()`, que já trata o denominador zero, ou trate o branco com `COALESCE()`. |
| `A meta deve possuir um valor maior que zero.` | A medida de meta devolveu zero, negativo ou branco no contexto do filtro. | Verifique se existe meta cadastrada para o período filtrado. Um `COALESCE([Meta]; BLANK())` não resolve — a meta precisa existir. |
| `Não foi possível calcular o preenchimento da barra.` | A divisão `Percentual / Meta` não resultou em número finito. | Confira se as duas medidas estão na mesma unidade e se a meta não está zerada. |
| `Ocorreu um erro ao renderizar a barra.` | Falha inesperada na renderização. | Remova e adicione o visual de novo. Persistindo, abra uma issue no repositório com o print e o passo a passo. |
| Barra mostra `2.000%` | O valor entrou em escala errada. | Sem **Meta**, o campo **Percentual** espera fração: `0,20`, não `20`. |
| Rótulo cortado na borda | O trilho está ocupando toda a largura. | Reduza **Comprimento da barra (%)** em **Barra**. |
| Cor não muda com o valor | O modo está em **Cor fixa**, ou está em **Comparar com a meta** sem o campo **Meta**. | Escolha **Faixas de valor**, ou preencha **Meta (opcional)**. |

<!-- IMAGEM (opcional): print da mensagem "Adicione uma medida ao campo Percentual." dentro do visual vazio. -->

---

## 9. Referência técnica

### 9.1 Arquitetura

| Camada | Responsabilidade |
|---|---|
| **Power BI Host** | Viewport, `DataView`, propriedades persistidas e ciclo de atualização. |
| **Contrato** | `capabilities.json` define papéis de dados, cardinalidade e propriedades de formatação. |
| **Configuração** | `src/settings.ts` declara cartões, grupos, controles, padrões, limites e visibilidade condicional. |
| **Execução** | `src/visual.ts` valida entradas, calcula o progresso, resolve a cor, monta o tooltip e controla o ciclo de vida. |
| **Gráfica** | Vega-Lite descreve as três camadas do desenho; Vega compila e renderiza em SVG. |

```text
Usuário configura o relatório
  ↓
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
Construção da especificação Vega-Lite
  ↓
Compilação e renderização Vega em SVG
  ↓
Barra, rótulo e tooltip no relatório
```

O desenho tem três camadas: trilho de fundo, preenchimento e texto do rótulo. A
largura total é calculada a partir do viewport, do percentual de comprimento
configurado e de uma área fixa reservada para o rótulo.

O recorte do preenchimento é feito assim:

```typescript
progressoDaBarra = Math.min(Math.max(progressoReal, 0), 1);
```

A visibilidade condicional dos grupos do painel é controlada em
`VisualFormattingSettingsModel.updateVisibility()`.

### 9.2 Estrutura do projeto

```text
barraDePorcentagem/
├── assets/
│   └── icon.png
├── dist/
│   └── barraDePorcentagem...1.0.0.0.pbiviz
├── src/
│   ├── settings.ts
│   └── visual.ts
├── style/
│   └── visual.less
├── capabilities.json
├── eslint.config.mjs
├── package.json
├── package-lock.json
├── pbiviz.json
└── tsconfig.json
```

| Arquivo | Papel |
|---|---|
| `src/visual.ts` | Ciclo de vida, dados, cálculo, cores, tooltip, Vega-Lite, renderização, mensagens e descarte. |
| `src/settings.ts` | Cartões e grupos do painel Formatar, padrões, limites e visibilidade condicional. |
| `capabilities.json` | Contrato entre o Power BI e o visual. |
| `pbiviz.json` | Identidade, versão, API, autor, ícone, estilo e arquivos associados. |
| `package.json` | Scripts e dependências. |
| `package-lock.json` | Versões resolvidas para instalação reproduzível. |
| `style/visual.less` | Estilo herdado do template; não participa da barra desenhada pelo código atual. |
| `dist/` | Artefatos gerados pelo empacotamento. |

### 9.3 Dependências

| Pacote | Versão | Papel |
|---|---|---|
| `powerbi-visuals-api` | `5.11.1` | Contratos de integração com o host. |
| `powerbi-visuals-utils-formattingmodel` | `^6.0.4` | Painel moderno de formatação. |
| `vega` | `^5.33.1` | Runtime da visualização. |
| `vega-lite` | `^5.23.0` | Especificação declarativa e compilação da barra. |
| `typescript` | `5.5.4` | Linguagem principal. |
| `eslint` | `^9.11.1` | Análise estática. |
| `d3` / `@types/d3` | `7.9.0` / `7.4.3` | Declaradas, mas **não utilizadas** pelo código atual. Candidatas a remoção. |

### 9.4 Mapeamento de dados

O `dataViewMappings` é categórico, com as condições:

| Papel | Mínimo | Máximo |
|---|---|---|
| `percentual` | 1 | 1 |
| `meta` | 0 | 1 |
| `tooltip` | 0 | 20 |

---

## 10. Desenvolvimento

**Pré-requisitos:** Node.js 18 ou superior, npm, `powerbi-visuals-tools` e o
Power BI Desktop para validação manual.

Ambiente validado:

```text
Node.js: 24.18.0
npm: 11.16.0
Power BI Visuals Tools: 7.2.1
```

```bash
cd visuais/barraDePorcentagem

npm ci               # instalação reproduzível

npm run start        # servidor local para o Visual de Desenvolvedor
npm run lint         # análise estática
npx tsc --noEmit     # verificação de tipos
npm run package      # gera o .pbiviz em dist/
```

Se o comando `pbiviz` não estiver disponível globalmente:

```bash
npm install -g powerbi-visuals-tools@7.2.1
pbiviz --version
```

Com `npm run start` rodando, adicione o **Visual de Desenvolvedor** a um
relatório no Power BI Service para validar o código quase em tempo real.

---

## 11. Histórico de versões

| Versão | Data | Mudanças |
|---|---|---|
| `1.0.0.0` | 2026 | Primeira versão consolidada: trilho estável, rótulo além de 100%, três modos de cor, cinco faixas configuráveis e tooltip com até 20 campos. |

---

## 12. Créditos

Desenvolvido por **Julio Vieira** e **Keven Cardoso**.

Licenciado sob [Apache-2.0](../../LICENSE).
