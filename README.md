# Calculadora de Vulnerabilidade Familiar

Escala de Vulnerabilidade Familiar de Coelho-Savassi, para uso em visita domiciliar.

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
nada é gravado — ao fechar, os dados somem.

---

## Referência

Savassi LCM, Lage JL, Coelho FLG. Sistematização de um instrumento de
estratificação de risco familiar: Escala de Risco Familiar de Coelho-Savassi.
*J Manag Prim Health Care* 2012;3(2):179-185.
