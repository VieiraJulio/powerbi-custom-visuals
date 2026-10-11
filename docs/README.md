<div align="center">

# Documentação dos visuais

![Power BI](https://img.shields.io/badge/Power%20BI-F2C811?style=for-the-badge&logo=powerbi&logoColor=black)
![Apache 2.0](https://img.shields.io/badge/Licença-Apache%202.0-D22128?style=for-the-badge)

</div>

Guias de uso para quem monta relatórios no Power BI: campos, regra de cálculo,
painel de formatação, receitas e solução de problemas de cada visual.

A referência técnica — arquitetura, mapeamento de dados, dependências e build —
fica junto do código, no `README.md` de cada pasta em [`visuais/`](../visuais/).

---

## Visuais disponíveis

| | Visual | Para que serve | Versão | Guia de uso | Doc. técnica | Download |
|:---:|---|---|:---:|:---:|:---:|:---:|
| <img src="../visuais/barraDePorcentagem/assets/icon.png" width="32" alt=""> | **Barra de Porcentagem** | Barra de progresso para percentual de atingimento, com cor por meta ou por faixas | `1.0.0.0` | [Abrir](barraDePorcentagem/README.md) | [Abrir](../visuais/barraDePorcentagem/README.md) | [Releases](https://github.com/VieiraJulio/powerbi-custom-visuals/releases?q=barraDePorcentagem&expanded=true) |
| <img src="../visuais/velocimetro/assets/icon.png" width="32" alt=""> | **Velocímetro** | Valor realizado versus meta em formato radial, com faixas de desempenho e ícone configurável | `1.0.0.32` | [Abrir](velocimetro/README.md) | [Abrir](../visuais/velocimetro/README.md) | [Releases](https://github.com/VieiraJulio/powerbi-custom-visuals/releases?q=velocimetro&expanded=true) |
| <img src="../visuais/mapVisual/assets/icon.png" width="32" alt=""> | **Map Visual** | Mapa com bolhas proporcionais por estado e cidade, com seleção cruzada | `1.0.0.12` | [Abrir](mapVisual/README.md) | [Abrir](../visuais/mapVisual/README.md) | [Releases](https://github.com/VieiraJulio/powerbi-custom-visuals/releases?q=mapVisual&expanded=true) |

---

## Onde fica cada informação

```text
powerbi-custom-visuals/
├── docs/
│   ├── README.md                    <- Este índice.
│   ├── _template/
│   │   ├── README.md                <- Modelo do guia de uso.
│   │   └── README-desenvolvimento.md <- Modelo da documentação técnica.
│   ├── barraDePorcentagem/
│   │   ├── README.md                <- Guia de uso do visual.
│   │   └── img/                     <- Imagens usadas somente nessa página.
│   ├── velocimetro/
│   └── mapVisual/
└── visuais/
    └── barraDePorcentagem/
        ├── README.md                <- Documentação técnica.
        └── CHANGELOG.md             <- Histórico de versões.
```

O nome da pasta em `docs/` é sempre igual ao nome interno do visual em `visuais/`
(o campo `visual.name` do `pbiviz.json`). Isso mantém documentação e código
alinhados e evita links quebrados por acento ou diferença de grafia.

---

## Estrutura de cada guia de uso

Todo guia segue a mesma ordem, do primeiro contato até o detalhe:

1. O que é o visual e quando usar
2. Instalação no Power BI
3. Campos aceitos
4. Regra de cálculo
5. Painel de formatação
6. Receitas de uso
7. Limitações conhecidas
8. Solução de problemas
9. Histórico de versões (link para o CHANGELOG)
10. Créditos (com link para a documentação técnica)

---

## Adicionando um visual novo

1. Copie `_template/README.md` para `docs/<nome-interno-do-visual>/README.md` e
   `_template/README-desenvolvimento.md` para `visuais/<nome-interno>/README.md`.
2. Preencha as seções e apague as instruções entre `<!-- -->`.
3. Salve as imagens em `docs/<nome-interno>/img/`, seguindo a convenção de nomes
   descrita no template. Imagem que ainda não existe fica comentada.
4. Acrescente uma linha na tabela **Visuais disponíveis** deste índice.

O passo a passo completo, incluindo CI e release, está em
[`CONTRIBUTING.md`](../CONTRIBUTING.md#7-adicionando-um-visual-novo).
