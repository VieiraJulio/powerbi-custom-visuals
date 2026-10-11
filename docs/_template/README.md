<!--
MODELO DO GUIA DO ANALISTA (docs/<nomeInterno>/README.md)

Público: quem monta o relatório no Power BI. Não explique código aqui — a
referência técnica vai em visuais/<nomeInterno>/README.md (modelo em
README-desenvolvimento.md, nesta mesma pasta).

Como usar:
1. Copie este arquivo para docs/<nomeInterno>/README.md (o mesmo nome que está
   em visual.name no pbiviz.json).
2. Substitua tudo que estiver entre colchetes angulares: <assim>.
3. Apague os comentários HTML como este à medida que preencher.
4. Salve as imagens em docs/<nomeInterno>/img/ seguindo a convenção abaixo.

Convenção de nomes das imagens (o prefixo numérico mantém a pasta ordenada
na mesma sequência do texto):

  01-visao-geral.png          Visual pronto dentro de um relatório
  02-importar-visual.png      Menu "..." > Importar um visual de um arquivo
  03-campos.png               Painel de campos preenchido
  04a-formatacao-<grupo>.png  Painel de formatação, um print por grupo
  05-<recurso>.png            Demonstração de um recurso específico
  06-tooltip.png              Dica de ferramenta aberta
  99-erro-<sintoma>.png       Prints da seção de solução de problemas

Regras para as imagens:
- Use dados fictícios. Nunca publique print com cliente, filial ou faturamento reais.
- PNG, zoom de tela em 100%, largura entre 1200 e 1600 px.
- Recorte justo: só o visual ou só o painel, sem a tela inteira do Power BI.
- Destaque com retângulo ou seta em cor forte quando o print indicar onde clicar.
- Sempre escreva o texto alternativo em ![assim](img/arquivo.png).
- Um GIF curto mostrando a interação vale mais do que cinco prints estáticos.
- Enquanto a imagem não existir, deixe a linha dentro de um comentário HTML
  para não publicar imagem quebrada.
-->

<div align="center">

<img src="../../visuais/<nomeInterno>/assets/icon.png" width="72" alt="">

# <Nome do Visual>

![Power BI](https://img.shields.io/badge/Power%20BI-F2C811?style=flat-square&logo=powerbi&logoColor=black)
![Versão](https://img.shields.io/badge/versão-<0.0.0.0>-blue?style=flat-square)
![API](https://img.shields.io/badge/API-5.11.1-6E4B9E?style=flat-square)

**<Uma frase dizendo qual problema o visual resolve.>**

<!-- ![<Descrição do visual em uso>](img/01-visao-geral.png) -->

</div>

| | |
|---|---|
| **Nome interno** | `<nomeInterno>` |
| **Nome exibido** | `<Nome exibido no Power BI>` |
| **Versão** | `<0.0.0.0>` |
| **Renderização** | <SVG nativo / Vega-Lite / MapLibre / ...> |
| **Privilégios externos** | <Nenhum / WebAccess para ...> |
| **Download** | [Releases do visual](https://github.com/VieiraJulio/powerbi-custom-visuals/releases?q=<nomeInterno>&expanded=true) |
| **Documentação técnica** | [`visuais/<nomeInterno>`](../../visuais/<nomeInterno>/README.md) |
| **Autores** | <Nomes> |

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

<Dois ou três parágrafos curtos. Diga o que o visual mostra, em que situação ele
é melhor que o gráfico nativo equivalente e o que ele explicitamente não faz.>

**Use quando:**

- <Situação 1>
- <Situação 2>

**Prefira o visual nativo quando:**

- <Situação em que o nativo resolve melhor>

---

## 2. Instalação no Power BI

1. Baixe o `.pbiviz` da versão mais recente nas [Releases do visual](https://github.com/VieiraJulio/powerbi-custom-visuals/releases?q=<nomeInterno>&expanded=true).
2. No Power BI Desktop, abra o painel **Visualizações**.
3. Clique nas reticências (`...`) e escolha **Importar um visual de um arquivo**.
4. Selecione o `.pbiviz` baixado e confirme o aviso de visual não certificado.
5. O ícone do visual passa a aparecer no painel de visualizações do relatório.

<!-- ![Importando o visual](img/02-importar-visual.png) -->

> [!NOTE]
> O visual é importado por relatório, não por instalação do Power BI. Cada `.pbix`
> novo precisa da importação de novo. Para publicar na organização inteira, o
> arquivo precisa ser enviado ao repositório de visuais da organização por um
> administrador do Fabric.

---

## 3. Campos

<!-- ![Campos preenchidos](img/03-campos.png) -->

| Campo | Obrigatório | Tipo aceito | O que faz |
|---|---|---|---|
| **<Campo 1>** | Sim | <Medida numérica> | <Descrição> |
| **<Campo 2>** | Não | <Medida numérica> | <Descrição e o que acontece quando fica vazio> |
| **Dica de ferramenta** | Não | <Medida ou coluna, até N campos> | Campos adicionais exibidos ao passar o mouse |

---

## 4. Regra de cálculo

<Explique em texto simples como o número informado vira o desenho. Se houver
armadilha de escala, ela vem aqui, com destaque.>

```text
<fórmula>
```

| Entrada | Resultado |
|---|---|
| <exemplo 1> | <resultado 1> |
| <exemplo 2> | <resultado 2> |

---

## 5. Painel de formatação

### 5.1 <Grupo>

<!-- ![<Grupo> no painel de formatação](img/04a-formatacao-<grupo>.png) -->

| Propriedade | Padrão | Intervalo | Efeito |
|---|---|---|---|
| <Propriedade> | `<padrão>` | <mín. a máx.> | <Efeito> |

---

## 6. Receitas

### 6.1 <Cenário>

<Objetivo em uma frase.>

```dax
<Medida DAX>
```

Configuração: <o que ajustar no painel>.

<!-- ![<Resultado da receita>](img/05-<recurso>.png) -->

---

## 7. Limitações conhecidas

- <Limitação 1>
- <Limitação 2>

---

## 8. Solução de problemas

| O que aparece | Causa | Correção |
|---|---|---|
| `<Mensagem exata do visual>` | <Causa> | <Correção> |

Não encontrou o seu caso? [Abra uma issue](https://github.com/VieiraJulio/powerbi-custom-visuals/issues/new/choose)
com a versão do visual e o passo a passo, usando dados fictícios.

---

## 9. Histórico de versões

As mudanças de cada versão estão no
[`CHANGELOG.md`](../../visuais/<nomeInterno>/CHANGELOG.md) do visual.

---

## 10. Créditos

Desenvolvido por <Nomes>. Licenciado sob [Apache-2.0](../../LICENSE).

Para arquitetura, mapeamento de dados, dependências e comandos de build, veja a
[documentação técnica](../../visuais/<nomeInterno>/README.md).
