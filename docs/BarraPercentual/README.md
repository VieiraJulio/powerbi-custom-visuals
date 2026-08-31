# Barra de porcentagem

## 1. Objetivos do projeto

- Representar o desempenho de um indicador em uma barra percentual compacta, legível e reutilizável em relatórios do Power BI.
- Permitir o uso direto de uma medida percentual ou a comparação da medida com uma meta opcional, sem exigir alteração do código do visual.
- Manter o comprimento do trilho independente do resultado, alterando somente a área preenchida e evitando oscilações de layout entre filtros.
- Permitir que resultados inferiores a 0% ou superiores a 100% permaneçam visíveis no rótulo e no tooltip, enquanto o desenho continua contido no trilho.
- Centralizar cores, dimensões, arredondamento, rótulo e tooltip no painel moderno de formatação do Power BI.
- Disponibilizar um pacote `.pbiviz` reproduzível, com base extensível para futuras melhorias de acessibilidade, interação e certificação.

## 2. Arquitetura atual

A arquitetura é composta por:

- **Power BI Host:** fornece viewport, DataView, propriedades persistidas e ciclo de atualização.
- **Contrato do visual:** `capabilities.json` define papéis de dados, limites de cardinalidade e propriedades de formatação.
- **Camada de configuração:** `src/settings.ts` declara cartões, grupos, controles, valores padrão, limites e visibilidade condicional.
- **Camada de execução:** `src/visual.ts` valida entradas, calcula o progresso, resolve a cor, prepara o tooltip e controla o ciclo de vida.
- **Camada gráfica:** Vega-Lite descreve as três camadas visuais; Vega compila e renderiza o resultado em SVG no contêiner do Power BI.

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

## 3. Tecnologias, versões e identidade do pacote

- **TypeScript 5.5.4:** linguagem principal do visual.
- **Power BI Visuals API 5.11.1:** contratos de integração declarados no projeto.
- **Power BI Visuals Tools 7.2.1:** ferramenta usada no empacotamento validado.
- **powerbi-visuals-utils-formattingmodel 6.0.4:** painel moderno de formatação.
- **Vega 5.33.1:** runtime da visualização.
- **Vega-Lite 5.23.0:** especificação declarativa e compilação da barra.
- **ESLint 9.11.1:** análise estática.
- **D3 7.9.0 e @types/d3 7.4.3:** dependências declaradas, mas não utilizadas pelo código atual.

| Propriedade | Valor |
|---|---|
| Nome interno | `barraDePorcentagem` |
| Nome exibido | `BarraDePorcentagem` |
| Classe principal | `Visual` |
| GUID | `barraDePorcentagemDCC394FDAC284A44B6F4D5B34991AF4B` |
| Versão | `1.0.0.0` |
| Autor | Keven Henrique |
| Renderizador | SVG |
| Privilégios externos | Nenhum |

## 4. Estrutura do projeto

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

Responsabilidade dos arquivos:

- `src/visual.ts`: ciclo de vida, dados, cálculo, cores, tooltip, Vega-Lite, renderização, mensagens e descarte.
- `src/settings.ts`: cartões e grupos do painel Formatar, defaults, limites e visibilidade condicional.
- `capabilities.json`: contrato entre Power BI e visual.
- `pbiviz.json`: identidade, versão, API, autor, ícone, estilo e arquivos associados.
- `package.json`: scripts e dependências.
- `package-lock.json`: versões resolvidas para instalação reproduzível.
- `style/visual.less`: estilo herdado do template; não participa da barra criada pelo código atual.
- `dist/`: artefatos gerados pelo empacotamento.

## 5. Regra de cálculo

Sem Meta:

```text
progresso = Percentual
```

Com Meta:

```text
progresso = Percentual / Meta
```

Exemplos:

- Percentual = 0,75, sem Meta: progresso e rótulo iguais a 75%.
- Percentual = 50, Meta = 100: progresso e rótulo iguais a 50%.
- Percentual = 0,50, Meta = 0,40: atingimento igual a 125%.

> [!IMPORTANT]
> Sem Meta, informar 20 produz 2.000%, e não 20%. Para representar 20%, use 0,20. Com Meta, os dois valores podem ser absolutos ou fracionários, desde que estejam na mesma unidade.

## 6. Lógica da barra e do rótulo

O código mantém dois valores separados:

- **Progresso real:** usado no rótulo, na comparação de cor e no tooltip.
- **Progresso da barra:** usado somente na largura do preenchimento.

```typescript
progressoDaBarra = Math.min(Math.max(progressoReal, 0), 1);
```

Comportamento esperado:

- Progresso de 45%: preenchimento de 45% e rótulo de 45%.
- Progresso de 100%: preenchimento e rótulo de 100%.
- Progresso de 125%: preenchimento de 100% e rótulo de 125%.
- Progresso de -10%: preenchimento de 0% e rótulo de -10%.

O trilho de fundo sempre usa a escala completa de 0 a 1. A largura total é calculada a partir do viewport, do percentual de comprimento configurado e de uma área fixa reservada para o rótulo. O resultado do indicador não altera o comprimento do trilho.

O visual utiliza três camadas:

- trilho de fundo;
- preenchimento;
- texto do rótulo.

## 7. Painel de formatação

### 7.1 Barra

- Cor de fundo: `#C8C8C8`.
- Altura padrão: 15 px; intervalo de 1 a 100.
- Comprimento padrão: 100% da largura disponível; intervalo de 10% a 100%.
- Arredondamento padrão: 15; intervalo de 0 a 50.

### 7.2 Rótulo

- Exibido por padrão.
- Usa a cor da barra por padrão.
- Cor alternativa padrão: `#333333`.
- Tamanho padrão: 13; intervalo de 6 a 72.
- Casas decimais: padrão 0; intervalo de 0 a 4.
- O seletor de cor do texto aparece somente quando o rótulo está ativo e **Usar cor da barra** está desativado.
- O texto é posicionado depois da extremidade total do trilho, não depois da extremidade preenchida.

### 7.3 Dica de ferramenta

- Exibida por padrão.
- Pode ser desativada no painel.

### 7.4 Visibilidade condicional

Os grupos de cor exibidos no painel mudam conforme o modo selecionado. Essa lógica é controlada em `VisualFormattingSettingsModel.updateVisibility()`.

## 8. Comportamento de cor

O visual possui três modos.

### 8.1 Comparar com a meta

É o modo padrão.

- Com Meta e progresso inferior a 100%: vermelho `#FF4C4C`.
- Com Meta e progresso igual ou superior a 100%: verde `#22B907`.
- Sem Meta: utiliza a cor fixa configurada.

### 8.2 Cor fixa

Aplica uma única cor, independentemente do valor.

- Cor padrão: azul `#11A3DD`.

### 8.3 Faixas de valor

As faixas são avaliadas sobre o **progresso**, e não sobre o valor bruto quando existe Meta.

Configuração padrão:

- Ruim: abaixo de 0,50; vermelho `#FF4C4C`.
- Baixa: de 0,50 até abaixo de 0,80; amarelo `#FFC300`.
- Intermediária: de 0,80 até abaixo de 0,99; verde-claro `#A3F573`.
- Alta: de 0,99 até abaixo de 1,00; verde `#62D62C`.
- Meta atingida: a partir de 1,00; verde `#22B907`.

Os controles aceitam limites de 0 a 10. Os valores devem ser informados em escala fracionária: 0,50 representa 50%.

Em tempo de execução, os limites são normalizados para uma ordem não decrescente. Um limite posterior abaixo do anterior é elevado silenciosamente. Limites iguais favorecem a faixa de maior status porque a avaliação começa pela meta e desce até Ruim.

## 9. Pré-requisitos, instalação e desenvolvimento

Pré-requisitos:

- Node.js 18 ou superior.
- npm.
- Power BI Visuals Tools, disponível pelo comando `pbiviz`.
- Power BI Desktop para importação e validação manual.
- Editor compatível com TypeScript.

Ambiente usado:

```text
Node.js: 24.18.0
npm: 11.16.0
Power BI Visuals Tools: 7.2.1
```

Instalação reproduzível:

```bash
npm ci
```

Caso `pbiviz` não esteja disponível:

```bash
npm install -g powerbi-visuals-tools@7.2.1
pbiviz --version
```

Comandos do projeto:

```bash
npm run start
npm run lint
.\\node_modules\\.bin\\tsc.cmd --noEmit
npm run package
```
