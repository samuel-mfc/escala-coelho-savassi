/*
 * Service worker da calculadora ERF-CS.
 *
 * Estratégia: cache primeiro. Tudo o que o aplicativo precisa é guardado no
 * aparelho na primeira abertura; a partir daí ele abre sem internet.
 *
 * AO ATUALIZAR O APLICATIVO: mude o número da VERSAO abaixo. Isso troca o nome
 * do cache, o navegador baixa os arquivos novos e apaga os antigos. Sem essa
 * troca, os aparelhos continuam abrindo a versão velha guardada.
 */

var VERSAO = "erf-cs-v3";

var ARQUIVOS = [
  "./",
  "./index.html",
  "./erf-cs.js",
  "./manifest.webmanifest",
  "./icones/icone-180.png",
  "./icones/icone-192.png",
  "./icones/icone-512.png",
  "./icones/icone-maskable-512.png",
  "./icones/favicon-32.png"
];

/* Instalação: baixa e guarda tudo. */
self.addEventListener("install", function (evento) {
  evento.waitUntil(
    caches.open(VERSAO).then(function (cache) {
      return cache.addAll(ARQUIVOS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

/* Ativação: apaga caches de versões anteriores. */
self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(nomes.map(function (nome) {
        if (nome !== VERSAO) return caches.delete(nome);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* Busca: responde do cache; se não houver, tenta a rede e guarda o resultado.
   Navegação sem rede e sem cache cai no index.html. */
self.addEventListener("fetch", function (evento) {
  var req = evento.request;

  if (req.method !== "GET") return;

  evento.respondWith(
    caches.match(req).then(function (guardado) {
      if (guardado) return guardado;

      return fetch(req).then(function (resposta) {
        if (resposta && resposta.status === 200 && resposta.type === "basic") {
          var copia = resposta.clone();
          caches.open(VERSAO).then(function (cache) { cache.put(req, copia); });
        }
        return resposta;
      }).catch(function () {
        if (req.mode === "navigate") return caches.match("./index.html");
        return new Response("", { status: 504, statusText: "Sem conexão" });
      });
    })
  );
});
