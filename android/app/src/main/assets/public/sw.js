/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "terms-and-conditions.html",
    "revision": "408d458eff45625626b7f9207f7e8cf5"
  }, {
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "09af932acce593675a0782bd51c6c9b1"
  }, {
    "url": "pwa-512x512.png",
    "revision": "900522b519562315bfa5c519137ef6fb"
  }, {
    "url": "pwa-192x192.png",
    "revision": "adb8b29e9aeb120da02063e5e21d5b05"
  }, {
    "url": "privacy-policy.html",
    "revision": "9b5220f1f21589a3c942faf1dc40a9d7"
  }, {
    "url": "index.html",
    "revision": "8414e50010bde24bc1aad0c081ffa4d6"
  }, {
    "url": "icon.svg",
    "revision": "63c6e982955dd12570a709cd8c976fc3"
  }, {
    "url": "delete-account.html",
    "revision": "23412f686e16f6926a8d873700d1040f"
  }, {
    "url": "clutchclip-mini-logo.svg",
    "revision": "63c6e982955dd12570a709cd8c976fc3"
  }, {
    "url": "clutchclip-logo.svg",
    "revision": "c1fb3e54638585f70ef79c194205e729"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "57539f9f848fcf7beea05b6f798fb700"
  }, {
    "url": "apk-mini-logo-512.png",
    "revision": "c9a50731f49181041eced7fd702ff59e"
  }, {
    "url": "assets/vendor-react-DhSIqXbT.js",
    "revision": null
  }, {
    "url": "assets/vendor-icons-CrJS5FnQ.js",
    "revision": null
  }, {
    "url": "assets/vendor-firestore-ANBYZqk2.js",
    "revision": null
  }, {
    "url": "assets/vendor-firebase-DS8hMEd_.js",
    "revision": null
  }, {
    "url": "assets/index-gzaMWsO3.js",
    "revision": null
  }, {
    "url": "assets/index-D2kyU37C.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "57539f9f848fcf7beea05b6f798fb700"
  }, {
    "url": "clutchclip-logo.svg",
    "revision": "c1fb3e54638585f70ef79c194205e729"
  }, {
    "url": "clutchclip-mini-logo.svg",
    "revision": "63c6e982955dd12570a709cd8c976fc3"
  }, {
    "url": "delete-account.html",
    "revision": "23412f686e16f6926a8d873700d1040f"
  }, {
    "url": "icon.svg",
    "revision": "63c6e982955dd12570a709cd8c976fc3"
  }, {
    "url": "privacy-policy.html",
    "revision": "9b5220f1f21589a3c942faf1dc40a9d7"
  }, {
    "url": "pwa-192x192.png",
    "revision": "adb8b29e9aeb120da02063e5e21d5b05"
  }, {
    "url": "pwa-512x512.png",
    "revision": "900522b519562315bfa5c519137ef6fb"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "09af932acce593675a0782bd51c6c9b1"
  }, {
    "url": "terms-and-conditions.html",
    "revision": "408d458eff45625626b7f9207f7e8cf5"
  }, {
    "url": "manifest.webmanifest",
    "revision": "6afaf31b315177f4d01720c6b6ee35c6"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
