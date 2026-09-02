<!--
MODELO DE DOCUMENTAÇÃO DE VISUAL

Como usar:
1. Copie esta pasta para docs/<nome-interno-do-visual>/ (o mesmo nome que está
   em visual.name no pbiviz.json).
2. Substitua tudo que estiver entre colchetes angulares: <assim>.
3. Apague os comentários HTML como este à medida que preencher.
4. Salve as imagens em img/ seguindo a convenção de nomes indicada abaixo.

Convenção de nomes das imagens (o prefixo numérico mantém a pasta ordenada
na mesma sequência do texto):

  01-visao-geral.png        Visual pronto dentro de um relatório
  02-importar-visual.png    Menu "..." > Importar um visual de um arquivo
  03-campos.png             Painel de campos preenchido
  04a-formatacao-<grupo>.png  Painel de formatação, um print por grupo
  05-<recurso>.png          Demonstração de um recurso específico
  06-tooltip.png            Dica de ferramenta aberta
  99-erro-<sintoma>.png     Prints da seção de solução de problemas

Regras para as imagens:
- Use dados fictícios. Nunca publique print com cliente, filial ou faturamento reais.
- PNG, zoom de tela em 100%, largura entre 1200 e 1600 px.
- Recorte justo: só o visual ou só o painel, sem a tela inteira do Power BI.
- Destaque com retângulo ou seta em cor forte quando o print indicar onde clicar.
- Sempre escreva o texto alternativo em ![assim](img/arquivo.png).
- Um GIF curto mostrando a interação vale mais do que cinco prints estáticos.
-->

<div align="center">

<img src="../../visuais/<nomeInterno>/assets/icon.png" width="72" alt="">

# <Nome do Visual>

![Power BI](https://img.shields.io/badge/Power%20BI-F2C811?style=flat-square&logo=powerbi&logoColor=black)
![Versão](https://img.shields.io/badge/versão-<0.0.0.0>-blue?style=flat-square)
![API](https://img.shields.io/badge/API-5.11.1-6E4B9E?style=flat-square)

**<Uma frase dizendo qual problema o visual resolve.>**

![<Descrição do visual em uso>](img/01-visao-geral.png)

</div>

| | |
|---|---|
| **Nome interno** | `<nomeInterno>` |
| **Versão** | `<0.0.0.0>` |
| **API do Power BI** | `<5.11.1>` |
| **Status** | <Em uso / Em testes / Descontinuado> |
| **Pacote** | [`<arquivo>.pbiviz`](../../visuais/<nomeInterno>/dist/) |
| **Autores** | <Nomes> |

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

1. Baixe o arquivo `.pbiviz` mais recente em [`visuais/<nomeInterno>/dist/`](../../visuais/<nomeInterno>/dist/).
2. No Power BI Desktop, abra o painel **Visualizações**.
3. Clique nas reticências (`...`) e escolha **Importar um visual de um arquivo**.
4. Selecione o `.pbiviz` baixado e confirme o aviso de visual não certificado.
5. O ícone do visual passa a aparecer no painel de visualizações do relatório.

![Importando o visual](img/02-importar-visual.png)

> [!NOTE]
> O visual é importado por relatório, não por instalação do Power BI. Cada `.pbix`
> novo precisa da importação de novo. Para publicar na organização inteira, o
> arquivo precisa ser enviado ao repositório de organização pelo administrador.

---

## 3. Campos

![Campos preenchidos](img/03-campos.png)

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

![<Grupo> no painel de formatação](img/04a-formatacao-<grupo>.png)

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

![<Resultado da receita>](img/05-<recurso>.png)

---

## 7. Limitações conhecidas

- <Limitação 1>
- <Limitação 2>

---

## 8. Solução de problemas

| O que aparece | Causa | Correção |
|---|---|---|
| `<Mensagem exata do visual>` | <Causa> | <Correção> |

---

## 9. Referência técnica

### 9.1 Arquitetura

<Camadas e responsabilidades.>

### 9.2 Estrutura do projeto

```text
<nomeInterno>/
├── assets/
├── dist/
├── src/
├── style/
├── capabilities.json
├── package.json
├── pbiviz.json
└── tsconfig.json
```

### 9.3 Dependências

| Pacote | Versão | Papel |
|---|---|---|
| <pacote> | `<versão>` | <papel> |

---

## 10. Desenvolvimento

```bash
cd visuais/<nomeInterno>
npm ci
npm run start      # servidor local para o Visual de Desenvolvedor
npm run lint
npm run package    # gera o .pbiviz em dist/
```

Pré-requisitos: Node.js 18 ou superior, npm e `powerbi-visuals-tools@7.2.1`.

---

## 11. Histórico de versões

| Versão | Data | Mudanças |
|---|---|---|
| `<0.0.0.0>` | <AAAA-MM-DD> | <Primeira versão publicada> |

---

## 12. Créditos

Desenvolvido por <Nomes>.
Licenciado sob [Apache-2.0](../../LICENSE).
