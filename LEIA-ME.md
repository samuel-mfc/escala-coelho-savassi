# Calculadora ERF-CS — pasta pronta para publicar

Escala de Risco Familiar de Coelho-Savassi, para uso em visita domiciliar.
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

Nenhum arquivo depende de internet depois de instalado. Não há rastreamento,
nem envio de dados para lugar nenhum: tudo é calculado dentro do aparelho e
nada é gravado — ao fechar, os dados da família somem.

---

## Passo 1 — Publicar (uma vez)

O endereço **precisa ser `https`**. Sem isso o navegador recusa o service
worker e o modo offline não liga. Qualquer uma destas opções gratuitas serve:

**Cloudflare Pages** — crie a conta, escolha *Create a project* →
*Direct Upload*, arraste esta pasta. Sai um endereço `https://algo.pages.dev`.

**Netlify** — em `app.netlify.com/drop`, arraste a pasta. Publica na hora;
**crie a conta para o site não expirar** em cerca de uma hora.

**GitHub Pages** — suba os arquivos num repositório e ligue Pages nas
configurações. Bom se você já usa GitHub.

Não divulgue o endereço e ele fica praticamente invisível: a página já vem
marcada como `noindex`, então buscadores não a listam.

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

1. substitua os arquivos alterados na hospedagem;
2. **abra `sw.js` e mude a versão** — de `"erf-cs-v1"` para `"erf-cs-v2"`, e assim por diante.

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
