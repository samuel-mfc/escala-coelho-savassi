# Calculadora ERF-CS — pasta pronta para publicar

Escala de Vulnerabilidade Familiar de Coelho-Savassi (ERF-CS), para uso em visita domiciliar.
Publique esta pasta uma vez e o aplicativo passa a abrir por um ícone na tela
inicial do iPhone, do iPad e de qualquer Android — **funcionando sem internet**.

## O que tem aqui

| Arquivo | Para que serve |
|---|---|
| `index.html` | a página; carrega o aplicativo e registra o service worker |
| `erf-cs.js` | o aplicativo inteiro: dados da escala, interface e cálculo |
| `sw.js` | service worker — guarda tudo no aparelho para funcionar offline |
| `manifest.webmanifest` | nome, cores e ícones do aplicativo instalado |
| `icones/` | ícones nos tamanhos que iPhone e Android pedem |
| `.nojekyll` | avisa o GitHub para publicar os arquivos como estão |

Nenhum arquivo depende de internet depois de instalado. Não há rastreamento,
nem envio de dados para lugar nenhum: tudo é calculado dentro do aparelho e
nada é gravado — ao fechar, os dados da família somem.

---

## Passo 1 — Publicar no GitHub Pages (uma vez)

O endereço **precisa ser `https`**. Sem isso o navegador recusa o service
worker e o modo offline não liga. O GitHub Pages já entrega `https`.

**Atenção ao plano:** no plano gratuito, o GitHub Pages só publica a partir de
repositórios **públicos**. Aqui isso não é problema — não há dado de paciente
nenhum nestes arquivos, só a calculadora. Mas é bom saber que o código fica
visível.

1. No GitHub, **New repository**.
2. Nome: `risco-familiar`. Visibilidade: **Public**. Pode marcar
   "Add a README file" — ele será substituído pelo desta pasta.
3. Na página do repositório: **Add file → Upload files**.
4. Arraste **o conteúdo** desta pasta (os arquivos soltos e a pasta `icones`),
   e **não** a pasta `erf-cs-pwa` inteira. O `index.html` precisa ficar na
   raiz do repositório, senão o endereço ganha um pedaço a mais no caminho.
   O arquivo `.nojekyll` é oculto; se o seu sistema não deixar arrastá-lo,
   veja a observação no fim deste arquivo.
5. **Commit changes**.
6. **Settings → Pages** (na barra lateral, seção "Code and automation").
7. Em "Build and deployment", escolha **Deploy from a branch**, branch `main`,
   pasta `/ (root)` → **Save**.
8. Espere. A documentação avisa que pode levar **até 10 minutos** para o site
   ficar no ar. Recarregue a página de Settings → Pages até aparecer o
   endereço publicado.

O endereço final será:

    https://SEU-USUARIO.github.io/risco-familiar/

A barra final importa. Guarde esse link — é ele que a equipe vai abrir.

## Passo 2 — Instalar no iPhone ou iPad

1. Abra o endereço **no Safari** (precisa ser o Safari; no iOS os outros
   navegadores não oferecem esta opção).
2. Toque em **Compartilhar** → **Adicionar à Tela de Início** → **Adicionar**.
3. Toque no ícone novo **uma vez ainda com internet**. Essa primeira abertura
   é o que baixa e guarda o aplicativo no aparelho.

Pronto. A partir daí ele abre em tela cheia, sem barra de navegador, e
funciona no modo avião.

**No Android:** abra no Chrome e use *Instalar aplicativo* ou
*Adicionar à tela inicial*. O resto é igual.

## Passo 3 — Distribuir para a equipe

Mande o endereço no grupo. Cada pessoa faz o passo 2 no próprio telefone.
Ninguém instala nada de loja de aplicativos.

---

## Como atualizar depois

Quando a calculadora mudar:

1. no repositório, **Add file → Upload files** e suba os arquivos alterados
   (subir com o mesmo nome substitui o anterior);
2. **abra `sw.js` e mude a versão** — de `"erf-cs-v5"` para `"erf-cs-v6"`, e assim por diante.

O segundo passo não é opcional. É a troca do número que faz os aparelhos
perceberem que existe versão nova; sem ela, cada telefone continua abrindo a
cópia guardada e ninguém vê a mudança. Depois de atualizado, cada aparelho
pega a versão nova na primeira vez que abrir com internet.

---

## Referência

Savassi LCM, Lage JL, Coelho FLG. Sistematização de um instrumento de
estratificação de risco familiar: Escala de Risco Familiar de Coelho-Savassi.
*J Manag Prim Health Care* 2012;3(2):179-185.

A relação morador/cômodo segue a errata da publicação: moradores ÷ cômodos.
As faixas 5–6 (R1), 7–8 (R2) e ≥9 (R3) são as do Quadro 2; a faixa 0–4,
apresentada como R0, não consta no artigo e foi acrescentada por convenção
de uso das equipes.


---

## Observações sobre o GitHub

**O arquivo `.nojekyll`.** Por padrão o GitHub Pages passa o conteúdo por um
gerador de sites chamado Jekyll, que ignora arquivos e pastas começados por
`_`. Nenhum arquivo daqui começa assim, então na prática nada quebraria — mas
o `.nojekyll` desliga essa etapa, o que torna a publicação mais rápida e
previsível. Se o seu computador esconder arquivos começados por ponto e você
não conseguir arrastá-lo, crie-o direto no site: **Add file → Create new
file**, nome `.nojekyll`, deixe o conteúdo vazio e salve.

**Endereço na raiz, sem o `/risco-familiar/`.** Se preferir um link mais
curto, nomeie o repositório como `SEU-USUARIO.github.io`. O site passa a ser
`https://SEU-USUARIO.github.io/`. Funciona igual — os caminhos daqui são todos
relativos. A desvantagem é gastar o endereço pessoal da sua conta, que é único,
com esta aplicação.

**Buscadores.** A página já vem marcada como `noindex`, então não é listada em
buscas. O repositório, sendo público, continua visível para quem procurar no
próprio GitHub.
