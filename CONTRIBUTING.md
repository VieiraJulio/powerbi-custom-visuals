# Como contribuir

Obrigado pelo interesse em melhorar os visuais. Este guia cobre o caminho de uma
ideia até a release: como relatar, como preparar o ambiente, o que um pull request
precisa ter e como uma versão nova é publicada.

**[⟵ Voltar ao README](README.md)**

---

## Sumário

1. [Formas de contribuir](#1-formas-de-contribuir)
2. [Ambiente de desenvolvimento](#2-ambiente-de-desenvolvimento)
3. [Fluxo de trabalho](#3-fluxo-de-trabalho)
4. [Regras que não podem ser quebradas](#4-regras-que-não-podem-ser-quebradas)
5. [Documentação](#5-documentação)
6. [Versionamento e release](#6-versionamento-e-release)
7. [Adicionando um visual novo](#7-adicionando-um-visual-novo)
8. [Licença das contribuições](#8-licença-das-contribuições)

---

## 1. Formas de contribuir

| Você quer… | Use |
|---|---|
| Relatar um comportamento errado | Issue **Relatar problema** |
| Pedir uma propriedade ou ajuste | Issue **Sugerir melhoria** |
| Propor um visual que ainda não existe | Issue **Propor novo visual** |
| Relatar uma falha de segurança | **Não abra issue.** Siga o [`SECURITY.md`](SECURITY.md) |
| Corrigir código ou documentação | Pull request (abaixo) |

> [!CAUTION]
> Nunca anexe prints com dados reais de clientes, filiais, faturamento ou
> qualquer informação sensível. Reproduza o cenário com dados fictícios.

---

## 2. Ambiente de desenvolvimento

| Componente | Versão |
|---|---|
| Node.js | 22 LTS ou 24 LTS (validado em 24.18.0) |
| npm | 10 ou superior |
| Power BI Visuals Tools | 7.2.1 — `npm install -g powerbi-visuals-tools@7.2.1` |
| Power BI Desktop | Versão atual, para validação manual |

Cada visual é um projeto `pbiviz` independente, com o próprio `package.json`:

```bash
cd visuais/<visual>
npm ci                # instalação reproduzível a partir do package-lock.json
npm run start         # servidor local para o Visual de Desenvolvedor
npm run lint          # ESLint com as regras do eslint-plugin-powerbi-visuals
npm run typecheck     # tsc --noEmit
npm run package       # gera o .pbiviz em dist/
```

O passo a passo do Visual de Desenvolvedor, do certificado local e da
configuração específica de cada visual está no `README.md` da pasta do projeto,
em [`visuais/`](visuais/).

---

## 3. Fluxo de trabalho

1. **Abra ou escolha uma issue** antes de começar algo grande, para alinhar a
   abordagem.
2. **Crie uma branch** a partir da `main`:
   `fix/velocimetro-marcador`, `feat/map-visual-cluster`, `docs/barra-receitas`.
3. **Faça commits pequenos** no padrão
   [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/),
   com o visual como escopo:

   ```text
   fix(velocimetro): corrige posição do percentual em 100%
   feat(mapVisual): adiciona agrupamento de bolhas próximas
   docs(barraDePorcentagem): inclui receita com meta mensal
   ci: adiciona auditoria de dependências
   ```

4. **Abra o pull request** e preencha o checklist do template. O CI roda lint,
   verificação de tipos e empacotamento dos três visuais; o PR só entra com tudo
   verde e uma revisão aprovada.

---

## 4. Regras que não podem ser quebradas

Estas regras protegem quem já usa os visuais em relatórios publicados:

- **Não altere o `guid` do `pbiviz.json`.** É ele que faz o Power BI reconhecer
  uma versão nova como atualização do mesmo visual.
- **Não renomeie nem remova o `name` de um papel de dados** em
  `capabilities.json` sem tratar como mudança `major`. Os relatórios guardam os
  campos pelo `name`; mudar só o `displayName` é seguro.
- **Não renomeie propriedades de formatação existentes.** A configuração salva
  nos relatórios se perde.
- **Nunca versione segredos.** O token do Mapbox vive em `.env.local` (local) ou
  no secret `MAPBOX_ACCESS_TOKEN` (CI). Veja
  [`visuais/mapVisual/README.md`](visuais/mapVisual/README.md).
- **Não adicione privilégios** (`WebAccess`, `LocalStorage`, etc.) sem discutir
  em issue: eles mudam o perfil de segurança do visual e impedem a certificação.

---

## 5. Documentação

Cada visual tem dois documentos, com públicos diferentes:

| Documento | Público | Conteúdo |
|---|---|---|
| `docs/<visual>/README.md` | Analista que monta o relatório | O que é, instalação, campos, regra de cálculo, painel de formatação, receitas, limitações, solução de problemas |
| `visuais/<visual>/README.md` | Quem mantém o código | Arquitetura, fluxo do `update()`, mapeamento de dados, dependências, comandos, decisões de implementação |
| `visuais/<visual>/CHANGELOG.md` | Os dois | Histórico de versões |

Modelos para os dois documentos estão em [`docs/_template/`](docs/_template/).
Regras para imagens: PNG, dados fictícios, recorte só do visual ou do painel e
texto alternativo sempre preenchido.

---

## 6. Versionamento e release

A versão segue o formato de quatro segmentos do Power BI
(`major.minor.patch.build`), com a semântica descrita no
[README](README.md#8-convenções-do-projeto).

Durante o desenvolvimento, registre as mudanças em **[Não lançado]** no
`CHANGELOG.md` do visual. Para publicar:

1. Atualize a versão em `pbiviz.json` (os dois campos `version`) e em
   `package.json`.
2. No `CHANGELOG.md`, troque **[Não lançado]** pela versão e pela data.
3. Faça o merge na `main`.
4. Crie e envie a tag no formato `<visual>-v<versão>`:

   ```bash
   git tag velocimetro-v1.0.1.0
   git push origin velocimetro-v1.0.1.0
   ```

O workflow [`release.yml`](.github/workflows/release.yml) confere se a tag bate
com o `pbiviz.json`, empacota o visual e cria a Release com o `.pbiviz` anexado e
as notas tiradas do CHANGELOG.

---

## 7. Adicionando um visual novo

1. Gere o projeto dentro de `visuais/`:
   `pbiviz new <nomeEmCamelCase>`.
2. Ajuste `pbiviz.json` (nome exibido, descrição, `supportUrl` e `gitHubUrl`
   apontando para este repositório) e `package.json` (`name`, `private`,
   `license: Apache-2.0`, `repository.directory` e o script `typecheck`).
3. Copie os modelos de [`docs/_template/`](docs/_template/): o guia do analista
   para `docs/<nome>/README.md` e o técnico para `visuais/<nome>/README.md`.
   Crie também `visuais/<nome>/CHANGELOG.md`.
4. Inclua o visual na `matrix` de [`ci.yml`](.github/workflows/ci.yml), na lista
   de `directories` de [`dependabot.yml`](.github/dependabot.yml) e nos
   templates de issue.
5. Acrescente a linha do visual nas tabelas do [README](README.md) e de
   [`docs/README.md`](docs/README.md).

---

## 8. Licença das contribuições

Ao enviar uma contribuição, você concorda que ela seja licenciada sob a
[Apache-2.0](LICENSE), conforme a seção 5 da própria licença.

Este projeto segue um [Código de Conduta](CODE_OF_CONDUCT.md).
