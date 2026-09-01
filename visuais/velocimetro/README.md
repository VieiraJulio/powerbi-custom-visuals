# Velocímetro para Power BI

Visual personalizado que exibe **Faturamento**, compara-o opcionalmente com uma
**Meta** e reproduz o comportamento do velocímetro criado originalmente no
Deneb.

## Campos

- **Faturamento**: medida realizada, exibida no centro.
- **Meta**: medida opcional equivalente a 100%.
- **Dica de ferramenta**: medidas adicionais opcionais.

Com uma Meta válida, o percentual é calculado por `Faturamento / Meta`. Valores
acima de 100% continuam aparecendo no rótulo, enquanto o arco permanece limitado
a 100%. Sem Meta, o visual mostra o estado de 0% com um pequeno traço e o valor
central na cor de zero (azul por padrão), mantendo somente as faixas de fundo.
Se a medida Faturamento retornar `BLANK()`, o centro mostra `(Blank)` na cor de
zero em vez de converter o valor para zero, enquanto o marcador e o percentual
continuam visíveis em 0%, na cor azul, mesmo quando existe uma Meta válida. O
medidor usa a geometria original
do Deneb: raio externo de 130 px, raio interno de 108 px, raio central de
119 px e padding de 5 px, reduzindo essas medidas apenas quando o contêiner não
comporta o tamanho original. O valor central usa 24 px (18 pt no painel), fica
no centro geométrico e adota o formato padrão `R$ #,0`. Ele não reduz a fonte
por causa da quantidade de dígitos; textos longos são apenas
ajustados horizontalmente para permanecer dentro do arco, com uma margem
interna equivalente à referência Deneb. Valores sem formato numérico completo
ou recebidos como formato Geral também ganham agrupamento de milhar. O valor
central usa a convenção brasileira (`.` para milhar e `,` para decimal) no
Desktop, no Service e no Power BI Embedded, sem depender da localidade enviada
pelo host; tooltips e textos de acessibilidade preservam a localidade do
relatório.
Uma validação final da saída garante o agrupamento mesmo quando o formatador do
Service devolve uma sequência numérica contínua. Durante o ajuste horizontal,
os glifos dos separadores permanecem com sua espessura original sempre que o
nível de compressão permite.

## Padrões de cor

- 0%: azul `#11A3DD`
- acima de 0% até 50%: vermelho `#FF4C4C`
- acima de 50% até 80%: amarelo `#FFC300`
- acima de 80% e antes da meta: verde-claro `#A3F573`
- meta atingida: verde `#22B907`

Todas essas cores, os limites e o modo de cor única podem ser alterados no
painel de formatação. Como no Deneb, o fundo possui exatamente três faixas:
vermelha, amarela e verde-clara; o verde de meta é aplicado ao progresso quando
a meta é atingida. Por padrão, **Personalizar cor por faixa** está ativo: o
valor fica preto sobre as faixas amarela e verde-clara, vermelho na primeira
faixa e verde quando a meta é atingida.

## Marcador

Entre 0% e 100%, o marcador tem 14 px e é desenhado na frente de todas as
camadas do visual, no mesmo raio central de 119 px usado pelo Deneb. A tampa
arredondada do preenchimento chega por trás até o centro da bolinha; como o
marcador é desenhado depois, ele permanece à frente da barra sem alterar sua
posição. Em 0%,
100% e resultados acima de 100%, o marcador vira um pequeno traço transversal
ao arco. Nas duas pontas, o traço fica na posição exata de 0% ou 100%, junto à
tampa arredondada da barra, e o percentual permanece abaixo dele. Em todas as posições, o percentual fica
logo abaixo do marcador; somente quando houver risco de encostar no valor
central ele é afastado para fora do centro e, se necessário, um pouco para
baixo. O estado sem Meta usa esse mesmo traço na cor de zero (azul por padrão).
Quando o arredondamento configurado faz o percentual exibido chegar a 100% —
por exemplo, `19.999 / 20.000` com zero casas decimais — o marcador também é
fixado no final do arco e assume o formato de traço. Nesse estado final, a
distância padrão entre o arco e o percentual reproduz a referência do Deneb:
o texto fica aproximadamente 14 px abaixo da extremidade visível do arco.
Em valores muito pequenos, o marcador permanece à frente e a posição do
percentual continua representando o valor exato.
As extremidades e separações dos arcos usam círculos explícitos com raio igual
à metade da espessura. Assim, todas as pontas têm exatamente o mesmo raio,
inclusive em telas com escalas diferentes. A detecção do início e do fim usa a
mesma proporção normalizada empregada para desenhar o arco.
No cartão **Percentual**, o campo **Distância do arco (px)** controla
diretamente o deslocamento vertical do percentual em pixels. O padrão é
`12 px`, como no Deneb; `0 px` posiciona a âncora do texto no ponto do
marcador e, por exemplo, `40 px` a desloca exatamente 40 pixels. Nos limites
do viewport, o texto ainda é contido dentro do visual para não ser cortado.

## Ícone

O Deneb original não possui ícone, portanto o ícone central e a engrenagem
ficam desativados por padrão. Eles continuam disponíveis como recursos
opcionais no painel de formatação. Quando habilitado, o PNG é reduzido para até
128 px e persistido dentro do relatório; todo o controle permanece oculto para
leitores.

## Desenvolvimento

```powershell
npm install -g powerbi-visuals-tools@7.2.1
npm install
npx tsc --noEmit
npm run lint
npm run package
```

O primeiro comando instala o empacotador oficial, caso ele ainda não esteja
disponível na máquina. O pacote gerado fica em `dist/` e pode ser importado
pelo Power BI Desktop.
