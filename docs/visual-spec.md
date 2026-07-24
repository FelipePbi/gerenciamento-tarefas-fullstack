# Especificacao visual interna

Fonte: unico print anexado ao Goal, aberto em resolucao original (751 x 935 px). O arquivo e uma prancha com cinco telas de telefone, nao um screenshot isolado do viewport.

## Fatos observaveis

- Fluxo: Times -> Tarefas do time -> criar/editar tarefa; Times -> criar time.
- Fundo grafite escuro em todas as telas; cards e campos usam tons ainda mais escuros ou levemente mais claros.
- Acao primaria sempre em verde-petroleo, larga e ancorada proxima ao rodape.
- Titulos e formularios centralizados; listas usam titulo central, busca e cards em coluna.
- Cards de time mostram icone colorido, nome e chevron. Cards de tarefa mostram titulo, descricao e pill de status.
- Formularios mostram icone linear verde, titulo, subtitulo, campos retangulares e botao final.
- Status visiveis: Pendente em vermelho, Em progresso em amarelo/laranja e Concluida em verde.
- Icones sao lineares; nenhum emoji e usado.

## Valores aproximados inferidos

- Viewport de referencia: proporcao de telefone estreito, equivalente a cerca de 360 x 780 dp.
- Cores: fundo `#1D1E22`, superficie `#25262B`, campo `#151518`, texto `#F5F5F6`, texto secundario `#74757D`, acao `#00A67D`.
- Padding horizontal principal: aproximadamente 20 dp; gaps de 8-16 dp.
- Tipografia: titulo 18-20 sp sem serifa e peso forte; corpo 12-14 sp; apoio 10-12 sp.
- Raios discretos: 3-6 dp em cards/campos; pills totalmente arredondadas.
- Altura dos campos e botoes: aproximadamente 44-48 dp; areas de toque ampliadas para acessibilidade quando necessario.

## Decisoes para regioes nao visiveis

- Detalhe de tarefa, edicao de time, filtros, erros, vazios e confirmacoes reutilizam mesmos tokens.
- Lista global de tarefas e acessada no cabecalho de Times; tocar em time abre lista filtrada, como indicado pelas setas.
- Menu contextual no cabecalho da lista filtrada oferece editar/excluir time sem mudar hierarquia principal do print.
- Selecao de varios times usa um seletor modal recolhido, preservando o
  relacionamento N:N sem divergir do formulario compacto.

## Refinamento da tela Times

Fonte adicional: captura isolada da tela Times fornecida em 23/07/2026
(`605 x 1070 px`), normalizada para um viewport de aproximadamente
`390 x 844 dp`.

- Cabecalho: titulo `22 sp`, subtitulo `15 sp` e acao `24 dp`.
- Busca: `52 dp` de altura, texto `16 sp`, icone `22 dp` e raio `6 dp`.
- Lista: `24 dp` depois da busca e `16 dp` entre cards.
- Card: `88 dp` de altura, padding horizontal `24 dp`, icone SVG `32 dp`,
  nome `16 sp`, apoio `12 sp` e raio `6 dp`.
- Acao primaria: `52 dp` de altura, texto `16 sp` e raio `6 dp`.
- Contador, menu contextual e atalho de tarefas permanecem visiveis por
  decisao funcional, apesar de nao aparecerem na captura isolada.

## Refinamento da tela Novo Time

Fonte adicional: captura isolada da tela Novo Time fornecida em 23/07/2026
(`482 x 987 px`), normalizada para um viewport de aproximadamente
`390 x 844 dp`.

- Conteudo principal com `20 dp` de padding horizontal.
- Cabecalho: icone SVG `56 dp`, titulo `22 sp` e subtitulo `14 sp`.
- Campos: `52 dp` de altura, texto `16 sp`, padding horizontal `16 dp` e
  raio `6 dp`, sem labels externas.
- Cor: campo compacto com amostra circular de `22 dp`; toque abre modal
  acessivel com as seis cores predefinidas.
- Acao primaria: `52 dp` de altura, texto `16 sp`, raio `6 dp` e intervalo
  de `16 dp` depois do seletor.
- O modelo de time e seus formularios usam somente nome e cor.
- Os icones usam os paths SVG originais fornecidos: o card aplica
  dinamicamente `colorHex`, enquanto o formulario preserva `#00B37E`.

## Refinamento das telas de tarefas

Fontes adicionais: lista (`375 x 757 px`), detalhe, edicao (`391 x 859 px`) e
criacao (`402 x 844 px`) fornecidas em 23/07/2026 e normalizadas para
aproximadamente `390 x 844 dp`.

- A lista aberta por um time usa titulo `22 sp`, subtitulo `14 sp`, padding
  horizontal de `20 dp` e nao mostra busca ou filtros. Esses controles
  permanecem disponiveis somente na lista global.
- Cards usam altura minima de `132 dp`, raio `6 dp`, padding `16 dp` e
  intervalo `16 dp`. Exibem titulo, chips coloridos dos times, descricao em
  ate quatro linhas e status compacto somente visual. O toque abre o detalhe.
- Formularios usam icone `38 dp`, titulo `22 sp`, subtitulo `14 sp`, campos
  de `52 dp`, descricao de `136 dp`, raio `6 dp` e padding horizontal
  `20 dp`.
- Times e status usam seletores modais. Times aceitam selecao multipla;
  status exige uma opcao explicita na criacao.
- Na edicao, titulo, descricao, times e status permanecem editaveis. O envio
  usa o contrato completo `PUT /api/tasks/:id`.
- A edicao mostra lixeira no topo e confirma a exclusao antes de retornar para
  a lista.
- O detalhe mostra descricao, chips dos times, editar, excluir e tres acoes
  rapidas de status. Alteracao usa PATCH otimista com rollback em falha.
- A acao primaria usa altura `52 dp`, texto `16 sp`, raio `6 dp` e fica
  proxima ao rodape seguro.
