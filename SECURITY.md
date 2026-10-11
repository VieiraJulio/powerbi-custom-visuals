# Política de segurança

## Versões cobertas

Correções de segurança são feitas apenas sobre a **versão mais recente de cada
visual** publicada em
[Releases](https://github.com/VieiraJulio/powerbi-custom-visuals/releases).
Versões anteriores não recebem correção retroativa: atualize o `.pbiviz` no
relatório.

## Como relatar uma vulnerabilidade

**Não abra issue pública.** Use o relato privado do GitHub:

1. Acesse a aba **Security** do repositório.
2. Clique em **Report a vulnerability**.
3. Descreva o visual, a versão, o impacto e os passos para reproduzir, sempre com
   dados fictícios.

Os mantenedores confirmam o recebimento, avaliam o impacto e combinam com você a
divulgação depois que a correção estiver publicada.

## Superfície de segurança dos visuais

Os visuais rodam dentro do contêiner isolado (*sandbox*) que o Power BI fornece.
O que cada um pode acessar está declarado em `capabilities.json`:

| Visual | Privilégios | Acesso externo | Dados persistidos no relatório |
|---|---|---|---|
| Barra de Porcentagem | Nenhum | Nenhum | Apenas as propriedades de formatação |
| Velocímetro | Nenhum | Nenhum | Propriedades de formatação e o PNG do ícone (base64, até 512.000 caracteres) |
| Map Visual | `WebAccess` para `api.mapbox.com` e `tile.openstreetmap.org` | Somente tiles do Mapbox; o domínio do OpenStreetMap está declarado, mas não é chamado | Propriedades de formatação e o PNG do ícone (base64) |

Pontos de atenção:

- **Token do Mapbox.** O Map Visual usa um token *público* (`pk.…`), que fica
  dentro do pacote `.pbiviz` publicado. O código-fonte traz só o marcador
  `seu_token`; o token real entra no build pelo secret `MAPBOX_ACCESS_TOKEN`, e o
  CI falha se encontrar um token em `src/`. O token deve ter apenas os
  escopos públicos de leitura de estilos e tiles, ser monitorado no painel do
  Mapbox e ser rotacionado se houver uso indevido.
- **O que sai do Power BI.** As requisições de tiles revelam ao Mapbox a região
  visualizada e o token, mas não os valores das linhas do relatório.
- **Upload de ícone.** O PNG é lido e redimensionado localmente, no navegador, e
  salvo dentro do relatório. Nada é enviado para a internet, e o botão só aparece
  em modo de edição.
- **Inserção no DOM.** Textos vindos dos dados são inseridos com `textContent` e
  atributos, sem `innerHTML`, `eval` ou URLs arbitrárias.

## Recomendações para quem distribui os visuais

- Prefira publicar o `.pbiviz` no **repositório de visuais da organização**
  (portal de administração do Fabric), que centraliza versão e atualização.
- Em ambientes com restrição de saída de rede, libere `https://api.mapbox.com`
  para o Map Visual ou não o utilize.
