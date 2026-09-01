# Map Visual

## 1. Objetivos do projeto

1. Representar a distribuição geográfica de indicadores do Power BI em um mapa navegável com bolhas proporcionais.
2. Oferecer leitura progressiva: Estados em zoom amplo e Cidades quando o usuário aproxima o mapa.
3. Agregar linhas repetidas por localidade sem exigir uma preparação visual adicional no relatório.
4. Permitir que o clique em uma bolha filtre ou realce outros visuais por meio das identidades de seleção do Power BI.
5. Disponibilizar tooltips com localização, quantidade e até 20 campos adicionais.
6. Permitir personalização de cores, bordas, raios, rótulos, níveis, transição e ícone.
7. Manter o pacote `.pbiviz` reproduzível e registrar limitações, dependências externas, segurança e pontos de evolução.

## 2. Arquitetura atual

A arquitetura é composta por:

1. **Power BI Host:** fornece viewport, `DataView`, modo de exibição, serviço de tooltip, SelectionManager, persistência de propriedades e painel de formatação.
2. **Contrato do visual:** `capabilities.json` declara papéis, cardinalidades, mapeamento tabular, redução de dados, privilégios web, tooltips e recursos suportados.
3. **Camada de configuração:** `src/settings.ts` declara quatro cartões e os valores padrão do painel Formatar.
4. **Camada de dados:** `src/visual.ts` valida linhas, agrupa Cidade + Estado, soma Tamanho, calcula centros ponderados, deduplica rótulos/tooltips e cria identidades de seleção.
5. **Camada cartográfica:** MapLibre GL projeta o mapa; um estilo raster Mapbox fornece o fundo.
6. **Camada visual:** marcadores DOM posicionados sobre o mapa desenham bolha, ícone, quantidade, rótulo e contorno de seleção.
7. **Camada de interação:** clique, Ctrl/Cmd+clique, Enter, Espaço, clique no fundo, tooltip e sincronização de seleções externas.
8. **Camada de persistência:** um PNG processado localmente é salvo em `iconSettings.customIconDataUrl` dentro do relatório.

```
Usuário configura os campos e filtros
  ↓
Power BI entrega uma tabela de até 30.000 linhas
  ↓
MapVisual valida Estado, Cidade e coordenadas
  ↓
Linhas válidas são agregadas por Cidade + Estado
  ↓
Estados são derivados das cidades e centros ponderados
  ↓
Raio é calculado separadamente para cada nível
  ↓
MapLibre projeta as coordenadas
  ↓
Marcadores DOM exibem bolha, ícone, valor e rótulo
  ↓
Zoom alterna Estado/Cidade; seleção e tooltip usam o host
```

## 3. Tecnologias Usadas

- **Node.js 24.18.0** e **npm 11.16.0:** ambiente usado na validação de 28/08/2026.
- **TypeScript 5.5.4:** linguagem e compilador fixado.
- **Power BI Visuals API 5.11.1:** API declarada no projeto.
- **Power BI Visuals Tools 7.2.1:** ferramenta global usada no empacotamento.
- **MapLibre GL 6.1.0:** navegação, zoom, controles e projeção.
- **powerbi-visuals-utils-formattingmodel 6.0.4:** painel moderno de formatação.
- **ESLint 9.39.5** e **eslint-plugin-powerbi-visuals 1.1.1:** análise estática instalada.
- **D3 7.9.0** e **@types/d3 7.4.3:** declarados, mas não importados pelo código atual.
- **Licença:** MIT.

## 4. Estrutura do projeto e arquivos

```
mapVisual/
├── assets/
│   └── icon.png
├── dist/
│   ├── mapVisual...1.0.0.6.pbiviz
│   ├── ...
│   └── mapVisual...1.0.0.13.pbiviz
├── src/
│   ├── settings.ts
│   ├── styles.d.ts
│   └── visual.ts
├── style/
│   └── visual.less
├── capabilities.json
├── eslint.config.mjs
├── LEIA-ME.txt
├── package.json
├── package-lock.json
├── pbiviz.json
├── tsconfig.json
└── webpack.statistics.prod.html
```

```

```

Responsabilidade dos arquivos:

- `src/visual.ts`: ciclo de vida, mapa, dados, agregação, marcadores, seleção, tooltip, acessibilidade e importação do ícone.
- `src/settings.ts`: cartões e controles do painel Formatar, defaults e validadores.
- `capabilities.json`: contrato entre Power BI e visual, incluindo acesso web.
- `pbiviz.json`: identidade, versão, API, autor, ícone e arquivos associados.
- `package.json` e `package-lock.json`: scripts, dependências e instalação reproduzível.
- `style/visual.less`: CSS do MapLibre, foco visível e forced colors; os estilos críticos dos marcadores são aplicados diretamente pelo TypeScript.
- `LEIA-ME.txt`: resumo funcional e instruções locais; não existe `README.md`.
- `dist/`: pacote atual e versões históricas.
- `webpack.statistics.prod.html`: relatório do bundle regenerado no empacotamento.

## 5. Alocação de dados

O mapeamento é tabular e aplica redução `top` de até 30.000 linhas.

| Campo | Tipo | Máximo | Comportamento |
| --- | --- | --- | --- |
| Estado | Agrupamento | 1 | Obrigatório em runtime; forma o nível estadual. |
| Cidade | Agrupamento | 1 | Obrigatório em runtime; compõe a chave Estado + Cidade. |
| Latitude | Numérico | 1 | Obrigatória; deve estar entre -90 e 90. |
| Longitude | Numérico | 1 | Obrigatória; deve estar entre -180 e 180. |
| Tamanho | Medida numérica | 1 | Opcional; é somado. Sem o campo, cada linha vale 1. |
| Rótulo da cidade | Agrupamento ou medida | 1 | Opcional; valores únicos são unidos; vazio usa Cidade. |
| Contexto da seleção | Agrupamento | 5 | Opcional; acompanha a identidade tabular da linha. |
| Dicas de ferramenta | Agrupamento ou medida | 20 | Opcional; valores adicionais deduplicados por campo. |

<aside>
⚠️

`capabilities.json` não define cardinalidade mínima, mas o código exige Estado, Cidade, Latitude e Longitude para gerar pontos. Quando algum desses papéis falta — ou todas as linhas são rejeitadas — a mensagem exibida é **Adicione Estado, Cidade, Latitude e Longitude.**

</aside>

### 5.1 Estado e Cidade

- A chave municipal é a combinação exata de Estado e Cidade após remover espaços nas extremidades.
- Diferenças de maiúsculas, acentos ou grafia continuam criando grupos distintos.
- O nível estadual é calculado a partir das cidades válidas.
- O clique em um Estado seleciona todas as identidades de linha agregadas naquele Estado.

### 5.2 Latitude e Longitude

- Não existe geocodificação.
- Valores ausentes, não finitos ou fora dos limites geográficos são descartados.
- Coordenadas divergentes para a mesma Cidade + Estado são combinadas por média ponderada pelo Tamanho.
- O centro do Estado também é uma média ponderada pelos totais municipais.

### 5.3 Tamanho

- Com o papel configurado, valores nulos, zero e negativos são tratados como zero e a linha é descartada.
- Sem o papel, cada linha válida recebe Tamanho igual a 1.
- O total da cidade e do Estado é a soma das linhas válidas.
- O raio usa escala de raiz quadrada relativa ao maior ponto do nível ativo.

```
proporção = raiz_quadrada(tamanho_do_ponto / maior_tamanho_do_nível)
raio = raio_mínimo + (raio_máximo - raio_mínimo) × proporção
```

### 5.4 Rótulo da cidade

- Rótulos não vazios e distintos são unidos por vírgula.
- Se o papel não estiver configurado ou ficar vazio, o nome da Cidade é exibido.
- O rótulo de Estado usa sempre o próprio Estado.

### 5.5 Contexto da seleção

O código não lê esse papel diretamente. Como o mapeamento é tabular e cada identidade é criada com `withTable(table, rowIndex)`, os campos colocados em Contexto da seleção acompanham a identidade de cada linha. Isso permite preservar dimensões como Status do atendimento no clique da bolha, conforme os relacionamentos do modelo.

## 6. Processamento, agregação e estados de dados

1. O visual recebe o primeiro `DataView` e sua tabela.
2. Localiza os índices dos papéis pelo metadado das colunas.
3. Rejeita linhas sem Estado/Cidade, com coordenadas inválidas ou com Tamanho não positivo quando a medida existe.
4. Agrupa as linhas válidas por Estado + Cidade.
5. Soma Tamanho, calcula coordenadas ponderadas, reúne rótulos, tooltips e identidades.
6. Deriva os pontos de Estado a partir das cidades.
7. Calcula raios separadamente para Cidades e Estados.
8. Gera uma assinatura de dados para evitar reconstrução desnecessária dos marcadores.
9. Ajusta o mapa aos dados quando a assinatura muda.

Estados observados:

- Estado inicial: **Carregando mapa...**
- Sem campos/pontos válidos: **Adicione Estado, Cidade, Latitude e Longitude.**
- Token ausente: **Informe o token público do Mapbox no visual.ts.**
- Falha síncrona de inicialização: **O mapa não pôde ser inicializado.**
- Erros assíncronos do MapLibre, seleção ou identidade: registrados no console.
- Se um `dataView` ficar totalmente ausente depois de dados anteriores, o código não limpa explicitamente os marcadores; o cenário deve ser validado no host.

## 7. Mapa, níveis e painel de formatação

O mapa inicia centralizado aproximadamente no Brasil, em longitude -44, latitude -18,5, com zoom 5. O intervalo permitido é de zoom 2 a 18. Os controles nativos de zoom, bússola e pitch ficam no canto superior direito.

### 7.1 Bolhas

Valores padrão e limites:

- Cor: `#E67E22`.
- Transparência: 34%, intervalo 0%–100%.
- Cor da borda: `#FFFFFF`.
- Espessura da borda: 3 px, intervalo 0–12.
- Mostrar contorno de seleção: ativado.
- Cor do contorno: `#2563EB`; o seletor só aparece quando o contorno está ativo.
- Raio mínimo: 18 px, intervalo 4–120.
- Raio máximo: 42 px, intervalo 4–180.
- Se o máximo ficar menor que o mínimo, o runtime eleva o máximo ao mínimo.
- Mostrar quantidade: ativado.
- A quantidade aparece em um selo escuro no canto da bolha e usa até duas casas decimais.

### 7.2 Ícone

- Mostrar: ativado.
- Padrão: trator em SVG embutido.
- Mostrar botão de configurações: ativado, somente em autoria.
- Tamanho: 58%, intervalo 10%–100%.
- Opacidade: 100%, intervalo 0%–100%.
- O mesmo ícone é aplicado a todas as bolhas.

### 7.3 Níveis do mapa

- Alternar Estado/Cidade pelo zoom: ativado.
- Zoom para mostrar cidades: 7, intervalo 2–18.
- Abaixo do limite: Estados.
- Igual ou acima do limite: Cidades.
- Se a alternância for desativada, o visual permanece em Cidades.
- Duração da transição: 280 ms, intervalo 0–1.500.
- Rótulos de Estado e Cidade: ativados por padrão.

### 7.4 Ajuste aos dados

- Um único ponto: centralização direta com zoom 9.
- Vários pontos: `fitBounds` com padding 70 e zoom máximo 11.
- O ajuste acontece quando a assinatura de dados muda; alterações de filtro podem recentralizar o mapa.
- Clicar em uma bolha não aproxima automaticamente.

## 8. Interação, seleção e filtros cruzados

- Clique em uma bolha seleciona todas as linhas que formam a Cidade ou o Estado.
- Ctrl+clique ou Cmd+clique adiciona/remova pontos em uma multisseleção.
- Enter ou Espaço seleciona o marcador focalizado.
- Clique em área vazia do mapa limpa a seleção.
- Seleção total usa contorno sólido; seleção parcial usa contorno tracejado.
- Quando há seleção relevante, pontos não selecionados passam para 35% de opacidade.
- Seleções externas são sincronizadas pelo callback do SelectionManager.
- A interação respeita `hostCapabilities.allowInteractions`.
- A propagação para cards, tabelas e gráficos depende das relações e de Editar interações no Power BI.

<aside>
📌

`supportsHighlight` está declarado no contrato, mas o código não processa um estado visual dedicado de highlight. Esse comportamento deve ser validado no Power BI antes de ser apresentado como recurso concluído.

</aside>

## 9. Fluxo de renderização e performance

### 9.1 Ciclo de atualização

1. Lê seleção atual, modo de exibição e viewport.
2. Carrega o painel de formatação.
3. Converte e agrega os dados quando existe tabela.
4. Compara assinaturas de dados e formatação.
5. Reconstrói marcadores somente quando uma assinatura muda.
6. Redimensiona e reposiciona no próximo `requestAnimationFrame`.
7. Ajusta o mapa aos dados quando necessário.
8. Atualiza a mensagem de estado.
9. Em `destroy()`, fecha tooltip, remove listeners globais, timers, marcadores e a instância MapLibre.

### 9.2 Otimizações atuais

- Agregação prévia por Cidade e Estado.
- Níveis distintos reduzem o número simultâneo de marcadores.
- Escala de raiz quadrada reduz a dominância visual de valores altos.
- Marcadores fora da viewport são ocultados com margem.
- Movimento e zoom reposicionam marcadores sem recriar a árvore.
- Assinaturas evitam reconstrução quando dados e formatação não mudaram.
- O bundle é dominado pelo MapLibre; D3 declarado e não usado deve ser removido.

## 10. Pré-requisitos, instalação e desenvolvimento

Pré-requisitos:

1. Node.js e npm.
2. Power BI Visuals Tools compatível.
3. Dependências instaladas conforme `package-lock.json`.
4. Acesso aos domínios declarados em `capabilities.json`.
5. Power BI Desktop para validação funcional.
6. Estado, Cidade, Latitude e Longitude válidos no modelo.

### 10.1 Configuração pessoal do Mapbox

<aside>
🔐

A chave da API do Mapbox é pessoal e **não acompanha o código disponível no repositório**. O repositório deve manter apenas o placeholder; cada usuário precisa gerar e inserir seu próprio token somente no ambiente local.

</aside>

1. Criar ou acessar uma conta no Mapbox.
2. Gerar um token público de acesso apropriado ao uso do mapa.
3. Abrir `src/visual.ts` na cópia local do projeto.
4. Localizar a constante `MAPBOX_ACCESS_TOKEN`.
5. Substituir localmente o placeholder pelo token pessoal.
6. Manter essa alteração fora de commits, compartilhamentos e pacotes de código-fonte.
7. Restringir origem e escopo do token conforme a política do Mapbox.

```tsx
const MAPBOX_ACCESS_TOKEN: string =
    "COLE_SEU_TOKEN_ATUAL_AQUI";
```

Sem um token configurado, o visual informa **Informe o token público do Mapbox no visual.ts.** e não inicializa o mapa.

Comandos do projeto:

```powershell
npm ci
npm run lint
npx tsc --noEmit
npm run package
```

Observações:

- Não existe script `test`.
- Não existe script `typecheck`; o comando é manual.
- O `pbiviz` usado na validação está instalado globalmente e não consta em `devDependencies`.
- O diretório atual não é reconhecido como repositório Git.

Configuração conceitual usada no BI POPs:

- Estado: `d_cidade[UF]`.
- Cidade: `d_cidade[CIDADE_EXIBICAO]`.
- Latitude: `d_cidade[Latitude_Cidade]`.
- Longitude: `d_cidade[Longitude_Cidade]`.
- Tamanho: `[Máquinas Não Atendidas]`.
- Contexto da seleção: uma dimensão como Status do atendimento, quando necessário.
- Dicas de ferramenta: chassi, responsável, filial e demais detalhes.

## 11. Empacotamento e importação no Power BI

Processo:

1. Instalar dependências com `npm ci`.
2. Executar lint.
3. Executar o typecheck e tratar incompatibilidades.
4. Gerar o pacote com `npm run package`.
5. No Power BI Desktop, escolher **Obter mais visuais > Importar um visual de um arquivo**.
6. Selecionar o `.pbiviz` atual.
7. Configurar os campos geográficos e validar o mapa com internet disponível.
8. Conferir seleção, tooltip, zoom, filtros, persistência e modo de leitura.
9. Validar também no Power BI Service.

## 12. Limitações, riscos e boas práticas

### 12.1 Limitações conhecidas

- Depende de internet, Mapbox e token válido.
- Não geocodifica endereços.
- Processa no máximo 30.000 linhas entregues pelo mapeamento.
- Não possui clustering; pontos próximos podem se sobrepor.
- A escala é relativa ao maior valor de cada nível.
- Grafias diferentes da mesma localidade produzem grupos separados.
- Coordenadas divergentes são reduzidas a um centro ponderado.
- Filtros que mudam os dados podem recentralizar o mapa.
- O estilo cartográfico não é configurável.
- Um PNG personalizado vale para todas as bolhas.
- Tooltip é orientado a mouse.
- Highlights não têm estado dedicado.
- Não existe fallback offline.
- Erros assíncronos podem ficar apenas no console.

### 12.2 Segurança e governança

- `WebAccess` é essencial e restrito no manifesto a Mapbox e OpenStreetMap.
- O código carrega tiles do Mapbox; o domínio OpenStreetMap não é chamado diretamente pela implementação inspecionada.
- Requisições de tiles expõem ao provedor o token público e a região visualizada, mas o código não envia explicitamente os valores brutos das linhas.
- Textos são inseridos com `textContent`/atributos; não há `innerHTML`, `eval`, `fetch` próprio ou URL arbitrária de ícone.
- O PNG é processado localmente e persistido no relatório.
- Permissões sobre dados continuam sob responsabilidade do modelo, relatório e ambiente Power BI.
- Tokens públicos devem ser restritos, monitorados e rotacionados conforme a política do provedor.

### 12.3 Performance e manutenção

- Manter Estado/Cidade normalizados e coordenadas consistentes.
- Usar uma medida de Tamanho já agregada e não negativa.
- Evitar campos desnecessários na tabela e no tooltip.
- Avaliar clustering ou camadas WebGL quando o volume crescer.
- Remover D3 se continuar sem uso.
- Manter `package-lock.json` versionado e preferir `npm ci`.
- Sincronizar `capabilities.json`, `settings.ts`, `visual.ts` e `LEIA-ME.txt`.
- Rodar lint, typecheck, package e testes funcionais em cada entrega.
- Medir bundle, tempo de atualização e quantidade de marcadores.
