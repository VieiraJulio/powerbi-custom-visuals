<div align="center">

<img src="../visuais/barraDePorcentagem/assets/icon.png" width="64" alt="">

# Documentação dos visuais

![Power BI](https://img.shields.io/badge/Power%20BI-F2C811?style=for-the-badge&logo=powerbi&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vega-Lite](https://img.shields.io/badge/Vega--Lite-1F77B4?style=for-the-badge&logo=vega&logoColor=white)
![Apache 2.0](https://img.shields.io/badge/Licença-Apache%202.0-D22128?style=for-the-badge)

</div>

Documentação de uso e referência técnica dos visuais personalizados deste repositório.
Cada visual tem uma pasta própria, com o texto e as imagens no mesmo lugar.

---

## Visuais disponíveis

| | Visual | Para que serve | Versão | Documentação | Download |
|:---:|---|---|:---:|:---:|:---:|
| <img src="../visuais/barraDePorcentagem/assets/icon.png" width="32" alt=""> | **Barra de Porcentagem** | Barra de progresso para percentual de atingimento, com cor por meta ou por faixas | `1.0.0.0` | [Abrir](barraDePorcentagem/README.md) | [`.pbiviz`](../visuais/barraDePorcentagem/dist/) |
| <img src="../visuais/velocimetro/assets/icon.png" width="32" alt=""> | **Velocímetro** | Velocímetro de realizado versus meta, com faixas de desempenho e ícone configurável | `1.0.0.32` | [Abrir](velocimetro/README.md) | [`.pbiviz`](../visuais/velocimetro/dist/) |
| <img src="../visuais/mapVisual/assets/icon.png" width="32" alt=""> | **Map Visual** | Mapa com bolhas proporcionais por estado e cidade, com seleção cruzada | `1.0.0.12` | [Abrir](MapVisual/README.md) | [`.pbiviz`](../visuais/mapVisual/dist/) |

---

## Como esta documentação é organizada

```text
docs/
├── README.md                     <- Este índice.
├── _template/
│   └── README.md                 <- Modelo a copiar quando um visual novo entrar.
├── barraDePorcentagem/
│   ├── README.md                 <- Documentação do visual.
│   └── img/                      <- Imagens usadas somente nessa página.
├── velocimetro/
└── MapVisual/
```

O nome da pasta em `docs/` é sempre igual ao nome interno do visual em `visuais/`
(o campo `visual.name` do `pbiviz.json`). Isso mantém documentação e código
alinhados e evita links quebrados por acento ou diferença de grafia.

> [!NOTE]
> Exceção: `docs/MapVisual/` mantém o `M` maiúsculo, diferente de
> `visuais/mapVisual/`. O Windows não distingue maiúscula de minúscula em nomes
> de pasta, então renomear só a caixa exige um comando específico de Git — por
> ora, os links desta página e do README apontam para o nome real da pasta.

---

## Estrutura de cada página

Toda página segue a mesma ordem, do uso para o detalhe técnico:

1. O que é o visual e quando usar
2. Instalação no Power BI
3. Campos aceitos
4. Regra de cálculo
5. Painel de formatação
6. Receitas de uso
7. Limitações conhecidas
8. Solução de problemas
9. Referência técnica
10. Desenvolvimento
11. Histórico de versões
12. Créditos

---

## Adicionando um visual novo

1. Copie `_template/` para `docs/<nome-interno-do-visual>/`.
2. Preencha as seções e apague as instruções entre `<!-- -->`.
3. Salve as imagens em `img/`, seguindo a convenção de nomes descrita no template.
4. Acrescente uma linha na tabela **Visuais disponíveis** deste índice.
