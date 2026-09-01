# Velocímetro

## 1. Objetivos do projeto

- Representar um valor realizado em um velocímetro compacto, legível e reutilizável em relatórios do Power BI.
- Comparar o Faturamento com uma Meta positiva opcional e calcular internamente o atingimento.
- Preservar o valor realizado no centro e apresentar o percentual próximo ao marcador do arco.
- Permitir cores por faixas de desempenho ou uma cor única, com personalização independente do valor central.
- Manter o desenho responsivo em diferentes viewports, com suporte a alto contraste, rótulo ARIA e foco visível.
- Permitir um ícone monetário padrão ou um PNG personalizado persistido dentro do relatório, sem acesso externo.
- Disponibilizar um pacote `.pbiviz` reproduzível e uma base extensível para testes, interações e certificação.

## 2. Arquitetura atual

A arquitetura é composta por:

- **Power BI Host:** fornece viewport, DataView, cultura, paleta de alto contraste, serviço de tooltip, persistência de propriedades e eventos de renderização.
- **Contrato do visual:** `capabilities.json` define papéis de dados, cardinalidades, tooltip, ausência de privilégios externos e propriedades de formatação.
- **Camada de configuração:** `src/settings.ts` declara seis cartões, controles, valores padrão, limites e visibilidade condicional.
- **Camada de execução:** `src/visual.ts` agrega dados, trata estados, calcula o atingimento, resolve cores, formata valores e controla o ciclo de vida.
- **Camada gráfica:** SVG nativo desenha arcos, marcador, textos e ícone diretamente no contêiner do Power BI.
- **Camada de QA:** `qa/preview.html` instancia a classe compilada com um host simulado e reúne 45 cenários visuais manuais.

```text
Usuário configura o relatório
  ↓
Power BI calcula Faturamento, Meta e medidas de tooltip
  ↓
DataView entrega os valores ao visual
  ↓
Visual.update() lê dados, viewport e formatação
  ↓
Agregação e classificação dos estados
  ↓
Cálculo do atingimento e do progresso do arco
  ↓
Seleção das faixas, cores e formatos
  ↓
Renderização SVG responsiva
  ↓
Tooltip, ARIA, controles de autoria e eventos de conclusão
```

## 3. Tecnologias, versões e identidade do pacote

- **TypeScript 5.5.4:** linguagem principal.
- **Power BI Visuals API 5.11.1:** contratos declarados no projeto.
- **Power BI Visuals Tools 7.2.1:** ferramenta usada no empacotamento validado.
- **powerbi-visuals-utils-formattingmodel 6.0.4:** painel moderno de formatação.
- **powerbi-visuals-utils-formattingutils 6.1.2:** formatação de medidas e unidades.
- **ESLint 9.39.5:** versão instalada usada na análise estática.
- **@typescript-eslint/eslint-plugin 8.67.0** e **eslint-plugin-powerbi-visuals 1.1.1:** plugins instalados de lint.
- **SVG nativo:** renderizador do velocímetro; o runtime não depende de Vega, Vega-Lite, Deneb ou D3.

## 4. Estrutura do projeto

```text
velocimetro/
├── assets/
│   └── icon.png
├── dist/
│   └── velocimetro...1.0.0.18.pbiviz
├── qa/
│   └── preview.html
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
├── README.md
├── tsconfig.json
└── webpack.statistics.prod.html
```

Responsabilidade dos arquivos:

- `src/visual.ts`: ciclo de vida, dados, agregação, cálculo, SVG, marcador, rótulos, tooltip, ARIA, formatação numérica e importação do ícone.
- `src/settings.ts`: cartões e controles do painel Formatar, defaults, validadores e visibilidade condicional.
- `capabilities.json`: contrato entre o Power BI e o visual.
- `pbiviz.json`: identidade, versão, API, autor, ícone, estilo e arquivos associados.
- `package.json` e `package-lock.json`: scripts, dependências e instalação reproduzível.
- `style/visual.less`: layout, mensagens, foco e controles de importação do ícone.
- `qa/preview.html`: laboratório manual baseado no bundle real de produção.
- `README.md`: visão funcional resumida e comandos de desenvolvimento.
- `dist/`: artefatos de empacotamento; contém também versões anteriores.
- `webpack.statistics.prod.html`: relatório do bundle regenerado pelo empacotador.

## 5. Regra funcional e estados de dados

Com Faturamento e Meta positiva válidos:

```text
atingimentoReal = máximo(0, Faturamento / Meta)
```

Modo por faixas:

```text
progressoDoArco = limitar(atingimentoReal / ValorDaMeta, 0, 1)
```

Modo de cor única:

```text
progressoDoArco = limitar(atingimentoReal, 0, 1)
```

O **atingimento real** alimenta o percentual, o tooltip e a seleção da faixa. O **progresso do arco** determina somente a posição gráfica e fica limitado entre 0% e 100% do arco disponível.

Exemplos com os padrões atuais:

- Faturamento 5.000, Meta 10.000: valor central 5.000, percentual 50% e metade do arco.
- Faturamento 12.500, Meta 10.000: valor central 12.500, percentual 125% e arco completo.
- Faturamento negativo com Meta positiva: o centro preserva o número negativo; atingimento, cor de desempenho e arco ficam em 0%.
- Faturamento válido sem Meta: o centro permanece visível; o visual mostra as faixas de fundo, o percentual 0% e o marcador inicial, mas não interpreta o próprio Faturamento como percentual.
- Meta zero ou negativa: comportamento equivalente à Meta ausente.
- Faturamento em branco com Meta válida: o centro mostra `(Blank)`; percentual e marcador ficam ocultos, mantendo as faixas de fundo.
- Faturamento em branco sem Meta: o centro mostra `(Blank)` na cor de zero e o estado inicial permanece disponível.

> [!IMPORTANT]
> A Meta é opcional, mas sem uma Meta positiva o arco não representa a magnitude do Faturamento. O arco permanece em um estado inicial de 0%; o valor central é a informação principal.

## 6. Desenho do velocímetro e painel de formatação

O desenho usa um arco de 270 graus, iniciado em -135 graus e encerrado em +135 graus. As camadas principais são:

- faixas de fundo;
- preenchimento alcançado;
- ícone central;
- valor central;
- percentual;
- marcador.

Entre 0% e abaixo de 100%, com dados válidos, o marcador é uma bolinha. Em 0%, em 100% ou acima e no estado sem Meta, ele é um pequeno traço transversal fora da tampa arredondada do arco. Para percentuais muito pequenos, o código pode omitir um trecho de preenchimento curto demais para preservar a separação visual entre a ponta arredondada e a bolinha; marcador e percentual continuam posicionados no valor correto.

### 6.1 Velocímetro

- Espessura: padrão 17% do raio; intervalo de 4% a 35%.
- Espaço entre faixas: padrão 12 graus; intervalo de 0 a 24.
- Opacidade do fundo: padrão 20%; intervalo de 0% a 100%.
- Mostrar marcador: ativado por padrão.
- Cor do marcador: `#000000`.
- Tamanho do marcador: padrão 62%; intervalo de 20% a 120% da referência interna.

### 6.2 Valor central

- Mostrar: ativado por padrão.
- Acompanhar cor da barra: ativado por padrão.
- Personalizar cor por faixa: desativado por padrão.
- Cor única alternativa: `#333333`.
- Cores próprias padrão: zero `#11A3DD`, primeira faixa `#FF4C4C`, segunda faixa `#000000`, antes da meta `#000000` e meta `#22B907`.
- Fonte: Segoe UI.
- Tamanho: padrão 20; intervalo de 4,5 a 54.
- Negrito: ativado.
- Unidades: Nenhuma, Automático, Mil, Milhões ou Bilhões; padrão Nenhuma.
- Casas decimais: padrão 0; intervalo de 0 a 4.
- Posição vertical: padrão 2%; intervalo de -50% a 50%.

### 6.3 Percentual

- Mostrar: ativado por padrão.
- Cor: `#000000`.
- Fonte: Segoe UI.
- Tamanho: padrão 10,5; intervalo de 4,5 a 30.
- Negrito: ativado.
- Casas decimais: padrão 0; intervalo de 0 a 2.
- Distância do arco: padrão 10%; intervalo de 0% a 40%.

O percentual acompanha o marcador. Se houver risco de colisão com o valor central, ele é deslocado horizontalmente e, se necessário, para baixo.

### 6.4 Ícone

- Mostrar: ativado por padrão.
- Mostrar botão de upload: ativado por padrão, mas limitado ao modo de autoria.
- Cor do ícone padrão: `#111111`.
- Tamanho: padrão 28% do raio; intervalo de 8% a 70%.
- Posição vertical: padrão -42%; intervalo de -80% a 30%.
- Opacidade: padrão 100%; intervalo de 0% a 100%.

### 6.5 Visibilidade condicional

- O modo **Cor única** mostra apenas o seletor da cor fixa; o modo **Faixas de desempenho** mostra cores e limites.
- **Personalizar cor por faixa** aparece somente no modo por faixas. Quando ativado, mostra cinco cores próprias e tem prioridade sobre **Acompanhar cor da barra**.
- **Cor personalizada** aparece apenas quando o valor não acompanha a barra e não usa cores próprias por faixa.
- A cor do ícone padrão fica oculta quando existe um PNG personalizado.
- O campo interno que armazena o PNG em base64 permanece oculto no painel.

## 7. Comportamento de cores e limites

O visual possui dois modos.

### 7.1 Faixas de desempenho

É o modo padrão. Com os valores atuais:

- Exatamente 0%: azul `#11A3DD` para o estado de zero.
- Acima de 0% até 50%: vermelho `#FF4C4C`.
- Acima de 50% até 80%: amarelo `#FFC300`.
- Acima de 80% até 90%: verde-claro `#A3F573`.
- Acima de 90%: verde `#22B907`.

Os quatro limites padrão são 0,50, 0,80, 0,90 e 1,00. O último, **Valor da meta**, define o ponto em que o arco fica completo e aceita valores de 0,01 a 1,00; os demais aceitam de 0 a 1.

> [!NOTE]
> A cor chamada **Cor da meta** começa logo acima de **Valor antes da meta**. Com os padrões atuais, ela já é aplicada acima de 90%, e não somente ao atingir 100%.

Os limites são normalizados silenciosamente em ordem não decrescente: primeiro ≤ segundo ≤ antes da meta ≤ valor da meta. Se um limite posterior for menor, o código o eleva ao limite anterior. Limites iguais eliminam visualmente faixas de largura zero.

### 7.2 Cor única

Aplica uma única cor ao fundo segmentado como uma faixa contínua e ao preenchimento.

- Cor padrão: vermelho `#FF4C4C`.
- O arco completa em 100%, independentemente do campo **Valor da meta** configurado no modo por faixas.

## 8. Fluxo de renderização, responsividade, acessibilidade e ícone

### 8.1 Ciclo de atualização

- O visual sinaliza `renderingStarted`.
- Lê viewport, modo de exibição, modo de formatação e o primeiro DataView.
- Carrega configurações persistidas e atualiza a visibilidade do painel.
- Normaliza o PNG armazenado e controla a disponibilidade dos botões de autoria.
- Valida a presença do papel Faturamento.
- Agrega Faturamento, Meta e tooltip.
- Calcula atingimento, progresso, faixas, cores e textos.
- Substitui o conteúdo anterior e desenha um novo SVG.
- Sinaliza `renderingFinished`; em erro, mostra uma mensagem e chama `renderingFailed`.
- Em `destroy()`, remove listeners globais, fecha tooltip, cancela feedback e limpa o contêiner.

### 8.2 Responsividade

- Viewports abaixo de 48 × 42 px exibem **Aumente o tamanho do visual.**
- O raio considera largura, altura, padding e espaço reservado para o percentual.
- A reserva de espaço do percentual permanece estável entre estados quando o raio permite, reduzindo oscilações de layout.
- Ícone e percentual são omitidos quando o raio externo fica abaixo de 34 px.
- Fontes são limitadas pelo raio; textos centrais longos são comprimidos horizontalmente com `textLength` em vez de reduzir o tamanho por quantidade de dígitos.
- O percentual é limitado ao viewport e possui tratamento de colisão com o valor central.

### 8.3 Acessibilidade

- O SVG usa `role="img"`, `tabindex="0"`, título interno e `aria-label` com Faturamento, Meta e Atingimento formatados.
- O modo de alto contraste usa a cor de primeiro plano fornecida pelo Power BI nos arcos, textos, marcador e ícone padrão.
- O foco do SVG e dos botões possui contorno visível.
- Mensagens gerais usam `role="status"`; feedback do ícone usa `aria-live="polite"`.
- O menu de ícone possui nomes acessíveis, estado expandido e fechamento pela tecla Escape.

### 8.4 PNG personalizado e proteção em produção

- Somente PNG é aceito.
- Tamanho máximo do arquivo de entrada: 5 MB.
- Dimensão total máxima antes do redimensionamento: 40 milhões de pixels.
- Maior lado após processamento: no máximo 128 px.
- Data URL persistida: no máximo 512.000 caracteres e validada como base64 PNG.
- O PNG é armazenado na propriedade `iconSettings.customIconDataUrl` dentro do relatório.
- Os controles ficam disponíveis no Power BI Desktop em edição ou no Power BI Web quando o relatório está em edição e o painel de formatação está ativo.
- Leitores e modos de visualização não veem a engrenagem nem os botões; o ícone já salvo continua visível.
- Nenhum arquivo é enviado para a internet.

## 9. Pré-requisitos, instalação e desenvolvimento

Pré-requisitos:

- Node.js compatível com o Power BI Visuals Tools.
- npm.
- Power BI Visuals Tools, disponível pelo comando `pbiviz`.
- Power BI Desktop para importação e validação manual.
- Editor compatível com TypeScript.

Ambiente usado na validação:

```text
Node.js: 24.18.0
npm: 11.16.0
Power BI Visuals Tools: 7.2.1
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
.\node_modules\.bin\tsc.cmd --noEmit
npm run package
```

## 10. Empacotamento e importação no Power BI

O comando abaixo gera o pacote:

```bash
npm run package
```
