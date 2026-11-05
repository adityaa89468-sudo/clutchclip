/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gs=()=>{};var qi={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Er=function(i){const e=[];let n=0;for(let s=0;s<i.length;s++){let a=i.charCodeAt(s);a<128?e[n++]=a:a<2048?(e[n++]=a>>6|192,e[n++]=a&63|128):(a&64512)===55296&&s+1<i.length&&(i.charCodeAt(s+1)&64512)===56320?(a=65536+((a&1023)<<10)+(i.charCodeAt(++s)&1023),e[n++]=a>>18|240,e[n++]=a>>12&63|128,e[n++]=a>>6&63|128,e[n++]=a&63|128):(e[n++]=a>>12|224,e[n++]=a>>6&63|128,e[n++]=a&63|128)}return e},Ks=function(i){const e=[];let n=0,s=0;for(;n<i.length;){const a=i[n++];if(a<128)e[s++]=String.fromCharCode(a);else if(a>191&&a<224){const l=i[n++];e[s++]=String.fromCharCode((a&31)<<6|l&63)}else if(a>239&&a<365){const l=i[n++],h=i[n++],I=i[n++],w=((a&7)<<18|(l&63)<<12|(h&63)<<6|I&63)-65536;e[s++]=String.fromCharCode(55296+(w>>10)),e[s++]=String.fromCharCode(56320+(w&1023))}else{const l=i[n++],h=i[n++];e[s++]=String.fromCharCode((a&15)<<12|(l&63)<<6|h&63)}}return e.join("")},Tr={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(i,e){if(!Array.isArray(i))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let a=0;a<i.length;a+=3){const l=i[a],h=a+1<i.length,I=h?i[a+1]:0,w=a+2<i.length,E=w?i[a+2]:0,A=l>>2,b=(l&3)<<4|I>>4;let O=(I&15)<<2|E>>6,j=E&63;w||(j=64,h||(O=64)),s.push(n[A],n[b],n[O],n[j])}return s.join("")},encodeString(i,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(i):this.encodeByteArray(Er(i),e)},decodeString(i,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(i):Ks(this.decodeStringToByteArray(i,e))},decodeStringToByteArray(i,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let a=0;a<i.length;){const l=n[i.charAt(a++)],I=a<i.length?n[i.charAt(a)]:0;++a;const E=a<i.length?n[i.charAt(a)]:64;++a;const b=a<i.length?n[i.charAt(a)]:64;if(++a,l==null||I==null||E==null||b==null)throw new qs;const O=l<<2|I>>4;if(s.push(O),E!==64){const j=I<<4&240|E>>2;if(s.push(j),b!==64){const M=E<<6&192|b;s.push(M)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let i=0;i<this.ENCODED_VALS.length;i++)this.byteToCharMap_[i]=this.ENCODED_VALS.charAt(i),this.charToByteMap_[this.byteToCharMap_[i]]=i,this.byteToCharMapWebSafe_[i]=this.ENCODED_VALS_WEBSAFE.charAt(i),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]]=i,i>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)]=i,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)]=i)}}};class qs extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Js=function(i){const e=Er(i);return Tr.encodeByteArray(e,!0)},Bt=function(i){return Js(i).replace(/\./g,"")},br=function(i){try{return Tr.decodeString(i,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xs(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ys=()=>Xs().__FIREBASE_DEFAULTS__,Qs=()=>{if(typeof process>"u"||typeof qi>"u")return;const i=qi.__FIREBASE_DEFAULTS__;if(i)return JSON.parse(i)},Zs=()=>{if(typeof document>"u")return;let i;try{i=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=i&&br(i[1]);return e&&JSON.parse(e)},Kt=()=>{try{return Gs()||Ys()||Qs()||Zs()}catch(i){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${i}`);return}},Sr=i=>{var e,n;return(n=(e=Kt())==null?void 0:e.emulatorHosts)==null?void 0:n[i]},Dh=i=>{const e=Sr(i);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const s=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),s]:[e.substring(0,n),s]},Ar=()=>{var i;return(i=Kt())==null?void 0:i.config},Cr=i=>{var e;return(e=Kt())==null?void 0:e[`_${i}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eo{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,s)=>{n?this.reject(n):this.resolve(s),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,s))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nh(i,e){if(i.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n={alg:"none",type:"JWT"},s=e||"demo-project",a=i.iat||0,l=i.sub||i.user_id;if(!l)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const h={iss:`https://securetoken.google.com/${s}`,aud:s,iat:a,exp:a+3600,auth_time:a,sub:l,user_id:l,firebase:{sign_in_provider:"custom",identities:{}},...i};return[Bt(JSON.stringify(n)),Bt(JSON.stringify(h)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function to(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test($())}function Pr(){var e;const i=(e=Kt())==null?void 0:e.forceEnvironment;if(i==="node")return!0;if(i==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function no(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function io(){const i=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof i=="object"&&i.id!==void 0}function ro(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function so(){const i=$();return i.indexOf("MSIE ")>=0||i.indexOf("Trident/")>=0}function Mh(){return!Pr()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Lh(){return!Pr()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")}function oo(){try{return typeof indexedDB=="object"}catch{return!1}}function ao(){return new Promise((i,e)=>{try{let n=!0;const s="validate-browser-context-for-indexeddb-analytics-module",a=self.indexedDB.open(s);a.onsuccess=()=>{a.result.close(),n||self.indexedDB.deleteDatabase(s),i(!0)},a.onupgradeneeded=()=>{n=!1},a.onerror=()=>{var l;e(((l=a.error)==null?void 0:l.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const co="FirebaseError";class we extends Error{constructor(e,n,s){super(n),this.code=e,this.customData=s,this.name=co,Object.setPrototypeOf(this,we.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ut.prototype.create)}}class ut{constructor(e,n,s){this.service=e,this.serviceName=n,this.errors=s}create(e,...n){const s=n[0]||{},a=`${this.service}/${e}`,l=this.errors[e],h=l?ho(l,s):"Error",I=`${this.serviceName}: ${h} (${a}).`;return new we(a,I,s)}}function ho(i,e){try{let n=0,s="";for(;n<i.length;){const a=i.indexOf("{$",n);if(a===-1){s+=i.substring(n);break}const l=i.indexOf("}",a+2);if(l===-1){s+=i.substring(n);break}const h=i.substring(a+2,l),I=e[h];s+=i.substring(n,a)+(I!=null?String(I):`<${h}?>`),n=l+1}return s}catch{return i}}function lo(i){for(const e in i)if(Object.prototype.hasOwnProperty.call(i,e))return!1;return!0}function Fe(i,e){if(i===e)return!0;const n=Object.keys(i),s=Object.keys(e);for(const a of n){if(!s.includes(a))return!1;const l=i[a],h=e[a];if(Ji(l)&&Ji(h)){if(!Fe(l,h))return!1}else if(l!==h)return!1}for(const a of s)if(!n.includes(a))return!1;return!0}function Ji(i){return i!==null&&typeof i=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ft(i){const e=[];for(const[n,s]of Object.entries(i))Array.isArray(s)?s.forEach(a=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(a))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(s));return e.length?"&"+e.join("&"):""}function uo(i,e){const n=new fo(i,e);return n.subscribe.bind(n)}class fo{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(s=>{this.error(s)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,s){let a;if(e===void 0&&n===void 0&&s===void 0)throw new Error("Missing Observer.");po(e,["next","error","complete"])?a=e:a={next:e,error:n,complete:s},a.next===void 0&&(a.next=En),a.error===void 0&&(a.error=En),a.complete===void 0&&(a.complete=En);const l=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?a.error(this.finalError):a.complete()}catch{}}),this.observers.push(a),l}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(s){typeof console<"u"&&console.error&&console.error(s)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function po(i,e){if(typeof i!="object"||i===null)return!1;for(const n of e)if(n in i&&typeof i[n]=="function")return!0;return!1}function En(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ie(i){return i&&i._delegate?i._delegate:i}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Un(i){try{return(i.startsWith("http://")||i.startsWith("https://")?new URL(i).hostname:i).endsWith(".cloudworkstations.dev")}catch{return!1}}async function go(i){return(await fetch(i,{credentials:"include"})).ok}class He{constructor(e,n,s){this.name=e,this.instanceFactory=n,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pe="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mo{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const s=new eo;if(this.instancesDeferred.set(n,s),this.isInitialized(n)||this.shouldAutoInitialize())try{const a=this.getOrInitializeService({instanceIdentifier:n});a&&s.resolve(a)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){const n=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(e==null?void 0:e.optional)??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(a){if(s)return null;throw a}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(_o(e))try{this.getOrInitializeService({instanceIdentifier:Pe})}catch{}for(const[n,s]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(n);try{const l=this.getOrInitializeService({instanceIdentifier:a});s.resolve(l)}catch{}}}}clearInstance(e=Pe){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Pe){return this.instances.has(e)}getOptions(e=Pe){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,s=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const a=this.getOrInitializeService({instanceIdentifier:s,options:n});for(const[l,h]of this.instancesDeferred.entries()){const I=this.normalizeInstanceIdentifier(l);s===I&&h.resolve(a)}return a}onInit(e,n){const s=this.normalizeInstanceIdentifier(n),a=this.onInitCallbacks.get(s)??new Set;a.add(e),this.onInitCallbacks.set(s,a);const l=this.instances.get(s);return l&&e(l,s),()=>{a.delete(e)}}invokeOnInitCallbacks(e,n){const s=this.onInitCallbacks.get(n);if(s)for(const a of s)try{a(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let s=this.instances.get(e);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:yo(e),options:n}),this.instances.set(e,s),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(s,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,s)}catch{}return s||null}normalizeInstanceIdentifier(e=Pe){return this.component?this.component.multipleInstances?e:Pe:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function yo(i){return i===Pe?void 0:i}function _o(i){return i.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vo{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new mo(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var k;(function(i){i[i.DEBUG=0]="DEBUG",i[i.VERBOSE=1]="VERBOSE",i[i.INFO=2]="INFO",i[i.WARN=3]="WARN",i[i.ERROR=4]="ERROR",i[i.SILENT=5]="SILENT"})(k||(k={}));const wo={debug:k.DEBUG,verbose:k.VERBOSE,info:k.INFO,warn:k.WARN,error:k.ERROR,silent:k.SILENT},Io=k.INFO,Eo={[k.DEBUG]:"log",[k.VERBOSE]:"log",[k.INFO]:"info",[k.WARN]:"warn",[k.ERROR]:"error"},To=(i,e,...n)=>{if(e<i.logLevel)return;const s=new Date().toISOString(),a=Eo[e];if(a)console[a](`[${s}]  ${i.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class kr{constructor(e){this.name=e,this._logLevel=Io,this._logHandler=To,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in k))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?wo[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,k.DEBUG,...e),this._logHandler(this,k.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,k.VERBOSE,...e),this._logHandler(this,k.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,k.INFO,...e),this._logHandler(this,k.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,k.WARN,...e),this._logHandler(this,k.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,k.ERROR,...e),this._logHandler(this,k.ERROR,...e)}}const bo=(i,e)=>e.some(n=>i instanceof n);let Xi,Yi;function So(){return Xi||(Xi=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Ao(){return Yi||(Yi=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Rr=new WeakMap,kn=new WeakMap,Or=new WeakMap,Tn=new WeakMap,xn=new WeakMap;function Co(i){const e=new Promise((n,s)=>{const a=()=>{i.removeEventListener("success",l),i.removeEventListener("error",h)},l=()=>{n(ve(i.result)),a()},h=()=>{s(i.error),a()};i.addEventListener("success",l),i.addEventListener("error",h)});return e.then(n=>{n instanceof IDBCursor&&Rr.set(n,i)}).catch(()=>{}),xn.set(e,i),e}function Po(i){if(kn.has(i))return;const e=new Promise((n,s)=>{const a=()=>{i.removeEventListener("complete",l),i.removeEventListener("error",h),i.removeEventListener("abort",h)},l=()=>{n(),a()},h=()=>{s(i.error||new DOMException("AbortError","AbortError")),a()};i.addEventListener("complete",l),i.addEventListener("error",h),i.addEventListener("abort",h)});kn.set(i,e)}let Rn={get(i,e,n){if(i instanceof IDBTransaction){if(e==="done")return kn.get(i);if(e==="objectStoreNames")return i.objectStoreNames||Or.get(i);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return ve(i[e])},set(i,e,n){return i[e]=n,!0},has(i,e){return i instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in i}};function ko(i){Rn=i(Rn)}function Ro(i){return i===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const s=i.call(bn(this),e,...n);return Or.set(s,e.sort?e.sort():[e]),ve(s)}:Ao().includes(i)?function(...e){return i.apply(bn(this),e),ve(Rr.get(this))}:function(...e){return ve(i.apply(bn(this),e))}}function Oo(i){return typeof i=="function"?Ro(i):(i instanceof IDBTransaction&&Po(i),bo(i,So())?new Proxy(i,Rn):i)}function ve(i){if(i instanceof IDBRequest)return Co(i);if(Tn.has(i))return Tn.get(i);const e=Oo(i);return e!==i&&(Tn.set(i,e),xn.set(e,i)),e}const bn=i=>xn.get(i);function Do(i,e,{blocked:n,upgrade:s,blocking:a,terminated:l}={}){const h=indexedDB.open(i,e),I=ve(h);return s&&h.addEventListener("upgradeneeded",w=>{s(ve(h.result),w.oldVersion,w.newVersion,ve(h.transaction),w)}),n&&h.addEventListener("blocked",w=>n(w.oldVersion,w.newVersion,w)),I.then(w=>{l&&w.addEventListener("close",()=>l()),a&&w.addEventListener("versionchange",E=>a(E.oldVersion,E.newVersion,E))}).catch(()=>{}),I}const No=["get","getKey","getAll","getAllKeys","count"],Mo=["put","add","delete","clear"],Sn=new Map;function Qi(i,e){if(!(i instanceof IDBDatabase&&!(e in i)&&typeof e=="string"))return;if(Sn.get(e))return Sn.get(e);const n=e.replace(/FromIndex$/,""),s=e!==n,a=Mo.includes(n);if(!(n in(s?IDBIndex:IDBObjectStore).prototype)||!(a||No.includes(n)))return;const l=async function(h,...I){const w=this.transaction(h,a?"readwrite":"readonly");let E=w.store;return s&&(E=E.index(I.shift())),(await Promise.all([E[n](...I),a&&w.done]))[0]};return Sn.set(e,l),l}ko(i=>({...i,get:(e,n,s)=>Qi(e,n)||i.get(e,n,s),has:(e,n)=>!!Qi(e,n)||i.has(e,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lo{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(Uo(n)){const s=n.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(n=>n).join(" ")}}function Uo(i){const e=i.getComponent();return(e==null?void 0:e.type)==="VERSION"}const On="@firebase/app",Zi="0.16.3";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ie=new kr("@firebase/app"),xo="@firebase/app-compat",jo="@firebase/analytics-compat",Bo="@firebase/analytics",Fo="@firebase/app-check-compat",Ho="@firebase/app-check",$o="@firebase/auth",Vo="@firebase/auth-compat",Wo="@firebase/database",zo="@firebase/data-connect",Go="@firebase/database-compat",Ko="@firebase/functions",qo="@firebase/functions-compat",Jo="@firebase/installations",Xo="@firebase/installations-compat",Yo="@firebase/messaging",Qo="@firebase/messaging-compat",Zo="@firebase/performance",ea="@firebase/performance-compat",ta="@firebase/remote-config",na="@firebase/remote-config-compat",ia="@firebase/storage",ra="@firebase/storage-compat",sa="@firebase/firestore",oa="@firebase/ai",aa="@firebase/firestore-compat",ca="firebase",ha="13.0.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dn="[DEFAULT]",la={[On]:"fire-core",[xo]:"fire-core-compat",[Bo]:"fire-analytics",[jo]:"fire-analytics-compat",[Ho]:"fire-app-check",[Fo]:"fire-app-check-compat",[$o]:"fire-auth",[Vo]:"fire-auth-compat",[Wo]:"fire-rtdb",[zo]:"fire-data-connect",[Go]:"fire-rtdb-compat",[Ko]:"fire-fn",[qo]:"fire-fn-compat",[Jo]:"fire-iid",[Xo]:"fire-iid-compat",[Yo]:"fire-fcm",[Qo]:"fire-fcm-compat",[Zo]:"fire-perf",[ea]:"fire-perf-compat",[ta]:"fire-rc",[na]:"fire-rc-compat",[ia]:"fire-gcs",[ra]:"fire-gcs-compat",[sa]:"fire-fst",[aa]:"fire-fst-compat",[oa]:"fire-vertex","fire-js":"fire-js",[ca]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ft=new Map,ua=new Map,Nn=new Map;function er(i,e){try{i.container.addComponent(e)}catch(n){ie.debug(`Component ${e.name} failed to register with FirebaseApp ${i.name}`,n)}}function ct(i){const e=i.name;if(Nn.has(e))return ie.debug(`There were multiple attempts to register component ${e}.`),!1;Nn.set(e,i);for(const n of Ft.values())er(n,i);for(const n of ua.values())er(n,i);return!0}function Dr(i,e){const n=i.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),i.container.getProvider(e)}function Y(i){return i==null?!1:i.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fa={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},ee=new ut("app","Firebase",fa);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class da{constructor(e,n,s){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new He("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw ee.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dt=ha;function pa(i,e={}){let n=i;typeof e!="object"&&(e={name:e});const s={name:Dn,automaticDataCollectionEnabled:!0,...e},a=s.name;if(typeof a!="string"||!a)throw ee.create("bad-app-name",{appName:String(a)});if(n||(n=Ar()),!n)throw ee.create("no-options");const l=Ft.get(a);if(l)if(Fe(n,l.options)){if(Fe(s,l.config))return l;throw ee.create("duplicate-app",{appName:a,mismatchedParam:"config",oldValue:JSON.stringify(l.config),newValue:JSON.stringify(s)})}else throw ee.create("duplicate-app",{appName:a,mismatchedParam:"options",oldValue:JSON.stringify(l.options),newValue:JSON.stringify(n)});const h=new vo(a);for(const w of Nn.values())h.addComponent(w);const I=new da(n,s,h);return Ft.set(a,I),I}function ga(i=Dn){const e=Ft.get(i);if(!e&&i===Dn&&Ar())return pa();if(!e)throw ee.create("no-app",{appName:i});return e}function xe(i,e,n){let s=la[i]??i;n&&(s+=`-${n}`);const a=s.match(/\s|\//),l=e.match(/\s|\//);if(a||l){const h=[`Unable to register library "${s}" with version "${e}":`];a&&h.push(`library name "${s}" contains illegal characters (whitespace or "/")`),a&&l&&h.push("and"),l&&h.push(`version name "${e}" contains illegal characters (whitespace or "/")`),ie.warn(h.join(" "));return}ct(new He(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ma="firebase-heartbeat-database",ya=1,ht="firebase-heartbeat-store";let An=null;function Nr(){return An||(An=Do(ma,ya,{upgrade:(i,e)=>{switch(e){case 0:try{i.createObjectStore(ht)}catch(n){console.warn(n)}}}}).catch(i=>{throw ee.create("idb-open",{originalErrorMessage:i.message})})),An}async function _a(i){try{const n=(await Nr()).transaction(ht),s=await n.objectStore(ht).get(Mr(i));return await n.done,s}catch(e){if(e instanceof we)ie.warn(e.message);else{const n=ee.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});ie.warn(n.message)}}}async function tr(i,e){try{const s=(await Nr()).transaction(ht,"readwrite");await s.objectStore(ht).put(e,Mr(i)),await s.done}catch(n){if(n instanceof we)ie.warn(n.message);else{const s=ee.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});ie.warn(s.message)}}}function Mr(i){return`${i.name}!${i.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const va=1024,wa=30;class Ia{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new Ta(n),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){var e,n;try{const a=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),l=nr();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)==null?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===l||this._heartbeatsCache.heartbeats.some(h=>h.date===l))return;if(this._heartbeatsCache.heartbeats.push({date:l,agent:a}),this._heartbeatsCache.heartbeats.length>wa){const h=ba(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(h,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(s){ie.warn(s)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=nr(),{heartbeatsToSend:s,unsentEntries:a}=Ea(this._heartbeatsCache.heartbeats),l=Bt(JSON.stringify({version:2,heartbeats:s}));return this._heartbeatsCache.lastSentHeartbeatDate=n,a.length>0?(this._heartbeatsCache.heartbeats=a,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),l}catch(n){return ie.warn(n),""}}}function nr(){return new Date().toISOString().substring(0,10)}function Ea(i,e=va){const n=[];let s=i.slice();for(const a of i){const l=n.find(h=>h.agent===a.agent);if(l){if(l.dates.push(a.date),ir(n)>e){l.dates.pop();break}}else if(n.push({agent:a.agent,dates:[a.date]}),ir(n)>e){n.pop();break}s=s.slice(1)}return{heartbeatsToSend:n,unsentEntries:s}}class Ta{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return oo()?ao().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await _a(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const s=await this.read();return tr(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const s=await this.read();return tr(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function ir(i){return Bt(JSON.stringify({version:2,heartbeats:i})).length}function ba(i){if(i.length===0)return-1;let e=0,n=i[0].date;for(let s=1;s<i.length;s++)i[s].date<n&&(n=i[s].date,e=s);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sa(i){ct(new He("platform-logger",e=>new Lo(e),"PRIVATE")),ct(new He("heartbeat",e=>new Ia(e),"PRIVATE")),xe(On,Zi,i),xe(On,Zi,"esm2020"),xe("fire-js","")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Sa("");var Aa="firebase",Ca="13.0.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */xe(Aa,Ca,"app");function Lr(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Pa=Lr,Ur=new ut("auth","Firebase",Lr());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ht=new kr("@firebase/auth");function Mt(i,...e){Ht.logLevel<=k.WARN&&Ht.warn(`Auth (${dt}): ${i}`,...e)}function Lt(i,...e){Ht.logLevel<=k.ERROR&&Ht.error(`Auth (${dt}): ${i}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Z(i,...e){throw jn(i,...e)}function K(i,...e){return jn(i,...e)}function qt(i,e,n){const s={...Pa(),[e]:n};return new ut("auth","Firebase",s).create(e,{appName:i.name})}function Re(i){return qt(i,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function ka(i,e,n){const s=n;if(!(e instanceof s))throw s.name!==e.constructor.name&&Z(i,"argument-error"),qt(i,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function jn(i,...e){if(typeof i!="string"){const n=e[0],s=[...e.slice(1)];return s[0]&&(s[0].appName=i.name),i._errorFactory.create(n,...s)}return Ur.create(i,...e)}function S(i,e,...n){if(!i)throw jn(e,...n)}function te(i){const e="INTERNAL ASSERTION FAILED: "+i;throw Lt(e),new Error(e)}function re(i,e){i||te(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mn(){var i;return typeof self<"u"&&((i=self.location)==null?void 0:i.href)||""}function Ra(){return rr()==="http:"||rr()==="https:"}function rr(){var i;return typeof self<"u"&&((i=self.location)==null?void 0:i.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oa(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Ra()||io()||"connection"in navigator)?navigator.onLine:!0}function Da(){if(typeof navigator>"u")return null;const i=navigator;return i.languages&&i.languages[0]||i.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pt{constructor(e,n){this.shortDelay=e,this.longDelay=n,re(n>e,"Short delay should be less than long delay!"),this.isMobile=to()||ro()}get(){return Oa()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bn(i,e){re(i.emulator,"Emulator should always be set here");const{url:n}=i.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xr{static initialize(e,n,s){this.fetchImpl=e,n&&(this.headersImpl=n),s&&(this.responseImpl=s)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;te("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;te("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;te("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Na={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ma=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],La=new pt(3e4,6e4);function Fn(i,e){return i.tenantId&&!e.tenantId?{...e,tenantId:i.tenantId}:e}async function Ve(i,e,n,s,a={}){return jr(i,a,async()=>{let l={},h={};s&&(e==="GET"?h=s:l={body:JSON.stringify(s)});const I=ft({...h,key:i.config.apiKey}).slice(1),w=await i._getAdditionalHeaders();w["Content-Type"]="application/json",i.languageCode&&(w["X-Firebase-Locale"]=i.languageCode);const E={method:e,headers:w,...l};return no()||(E.referrerPolicy="strict-origin-when-cross-origin"),i.emulatorConfig&&Un(i.emulatorConfig.host)&&(E.credentials="include"),xr.fetch()(await Br(i,i.config.apiHost,n,I),E)})}async function jr(i,e,n){i._canInitEmulator=!1;const s={...Na,...e};try{const a=new xa(i),l=await Promise.race([n(),a.promise]);a.clearNetworkTimeout();const h=await l.json();if("needConfirmation"in h)throw Dt(i,"account-exists-with-different-credential",h);if(l.ok&&!("errorMessage"in h))return h;{const I=l.ok?h.errorMessage:h.error.message,[w,E]=I.split(" : ");if(w==="FEDERATED_USER_ID_ALREADY_LINKED")throw Dt(i,"credential-already-in-use",h);if(w==="EMAIL_EXISTS")throw Dt(i,"email-already-in-use",h);if(w==="USER_DISABLED")throw Dt(i,"user-disabled",h);const A=s[w]||w.toLowerCase().replace(/[_\s]+/g,"-");if(E)throw qt(i,A,E);Z(i,A)}}catch(a){if(a instanceof we)throw a;Z(i,"network-request-failed",{message:String(a)})}}async function Ua(i,e,n,s,a={}){const l=await Ve(i,e,n,s,a);return"mfaPendingCredential"in l&&Z(i,"multi-factor-auth-required",{_serverResponse:l}),l}async function Br(i,e,n,s){const a=`${e}${n}?${s}`,l=i,h=l.config.emulator?Bn(i.config,a):`${i.config.apiScheme}://${a}`;return Ma.includes(n)&&(await l._persistenceManagerAvailable,l._getPersistenceType()==="COOKIE")?l._getPersistence()._getFinalTarget(h).toString():h}class xa{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,s)=>{this.timer=setTimeout(()=>s(K(this.auth,"network-request-failed")),La.get())})}}function Dt(i,e,n){const s={appName:i.name};n.email&&(s.email=n.email),n.phoneNumber&&(s.phoneNumber=n.phoneNumber);const a=K(i,e,s);return a.customData._tokenResponse=n,a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ja(i,e){return Ve(i,"POST","/v1/accounts:delete",e)}async function $t(i,e){return Ve(i,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function at(i){if(i)try{const e=new Date(Number(i));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Ba(i,e=!1){const n=Ie(i),s=await n.getIdToken(e),a=Hn(s);S(a&&a.exp&&a.auth_time&&a.iat,n.auth,"internal-error");const l=typeof a.firebase=="object"?a.firebase:void 0,h=l==null?void 0:l.sign_in_provider;return{claims:a,token:s,authTime:at(Cn(a.auth_time)),issuedAtTime:at(Cn(a.iat)),expirationTime:at(Cn(a.exp)),signInProvider:h||null,signInSecondFactor:(l==null?void 0:l.sign_in_second_factor)||null}}function Cn(i){return Number(i)*1e3}function Hn(i){const[e,n,s]=i.split(".");if(e===void 0||n===void 0||s===void 0)return Lt("JWT malformed, contained fewer than 3 sections"),null;try{const a=br(n);return a?JSON.parse(a):(Lt("Failed to decode base64 JWT payload"),null)}catch(a){return Lt("Caught error parsing JWT payload as JSON",a==null?void 0:a.toString()),null}}function sr(i){const e=Hn(i);return S(e,"internal-error"),S(typeof e.exp<"u","internal-error"),S(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function lt(i,e,n=!1){if(n)return e;try{return await e}catch(s){throw s instanceof we&&Fa(s)&&i.auth.currentUser===i&&await i.auth.signOut(),s}}function Fa({code:i}){return i==="auth/user-disabled"||i==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ha{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;const s=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ln{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=at(this.lastLoginAt),this.creationTime=at(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Vt(i){var b;const e=i.auth,n=await i.getIdToken(),s=await lt(i,$t(e,{idToken:n}));S(s==null?void 0:s.users.length,e,"internal-error");const a=s.users[0];i._notifyReloadListener(a);const l=(b=a.providerUserInfo)!=null&&b.length?Fr(a.providerUserInfo):[],h=Va(i.providerData,l),I=i.isAnonymous,w=!(i.email&&a.passwordHash)&&!(h!=null&&h.length),E=I?w:!1,A={uid:a.localId,displayName:a.displayName||null,photoURL:a.photoUrl||null,email:a.email||null,emailVerified:a.emailVerified||!1,phoneNumber:a.phoneNumber||null,tenantId:a.tenantId||null,providerData:h,metadata:new Ln(a.createdAt,a.lastLoginAt),isAnonymous:E};Object.assign(i,A)}async function $a(i){const e=Ie(i);await Vt(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function Va(i,e){return[...i.filter(s=>!e.some(a=>a.providerId===s.providerId)),...e]}function Fr(i){return i.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Wa(i,e){const n=await jr(i,{},async()=>{const s=ft({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:a,apiKey:l}=i.config,h=await Br(i,a,"/v1/token",`key=${l}`),I=await i._getAdditionalHeaders();I["Content-Type"]="application/x-www-form-urlencoded";const w={method:"POST",headers:I,body:s};return i.emulatorConfig&&Un(i.emulatorConfig.host)&&(w.credentials="include"),xr.fetch()(h,w)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function za(i,e){return Ve(i,"POST","/v2/accounts:revokeToken",Fn(i,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class je{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){S(e.idToken,"internal-error"),S(typeof e.idToken<"u","internal-error"),S(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):sr(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){S(e.length!==0,"internal-error");const n=sr(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(S(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:s,refreshToken:a,expiresIn:l}=await Wa(e,n);this.updateTokensAndExpiration(s,a,Number(l))}updateTokensAndExpiration(e,n,s){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+s*1e3}static fromJSON(e,n){const{refreshToken:s,accessToken:a,expirationTime:l}=n,h=new je;return s&&(S(typeof s=="string","internal-error",{appName:e}),h.refreshToken=s),a&&(S(typeof a=="string","internal-error",{appName:e}),h.accessToken=a),l&&(S(typeof l=="number","internal-error",{appName:e}),h.expirationTime=l),h}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new je,this.toJSON())}_performRefresh(){return te("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pe(i,e){S(typeof i=="string"||typeof i>"u","internal-error",{appName:e})}class G{constructor({uid:e,auth:n,stsTokenManager:s,...a}){this.providerId="firebase",this.proactiveRefresh=new Ha(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=a.displayName||null,this.email=a.email||null,this.emailVerified=a.emailVerified||!1,this.phoneNumber=a.phoneNumber||null,this.photoURL=a.photoURL||null,this.isAnonymous=a.isAnonymous||!1,this.tenantId=a.tenantId||null,this.providerData=a.providerData?[...a.providerData]:[],this.metadata=new Ln(a.createdAt||void 0,a.lastLoginAt||void 0)}async getIdToken(e){const n=await lt(this,this.stsTokenManager.getToken(this.auth,e));return S(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return Ba(this,e)}reload(){return $a(this)}_assign(e){this!==e&&(S(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new G({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){S(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let s=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),s=!0),n&&await Vt(this),await this.auth._persistUserIfCurrent(this),s&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Y(this.auth.app))return Promise.reject(Re(this.auth));const e=await this.getIdToken();return await lt(this,ja(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){const s=n.displayName??void 0,a=n.email??void 0,l=n.phoneNumber??void 0,h=n.photoURL??void 0,I=n.tenantId??void 0,w=n._redirectEventId??void 0,E=n.createdAt??void 0,A=n.lastLoginAt??void 0,{uid:b,emailVerified:O,isAnonymous:j,providerData:M,stsTokenManager:x}=n;S(b&&x,e,"internal-error");const N=je.fromJSON(this.name,x);S(typeof b=="string",e,"internal-error"),pe(s,e.name),pe(a,e.name),S(typeof O=="boolean",e,"internal-error"),S(typeof j=="boolean",e,"internal-error"),pe(l,e.name),pe(h,e.name),pe(I,e.name),pe(w,e.name),pe(E,e.name),pe(A,e.name);const q=new G({uid:b,auth:e,email:a,emailVerified:O,displayName:s,isAnonymous:j,photoURL:h,phoneNumber:l,tenantId:I,stsTokenManager:N,createdAt:E,lastLoginAt:A});return M&&Array.isArray(M)&&(q.providerData=M.map(se=>({...se}))),w&&(q._redirectEventId=w),q}static async _fromIdTokenResponse(e,n,s=!1){const a=new je;a.updateFromServerResponse(n);const l=new G({uid:n.localId,auth:e,stsTokenManager:a,isAnonymous:s});return await Vt(l),l}static async _fromGetAccountInfoResponse(e,n,s){const a=n.users[0];S(a.localId!==void 0,"internal-error");const l=a.providerUserInfo!==void 0?Fr(a.providerUserInfo):[],h=!(a.email&&a.passwordHash)&&!(l!=null&&l.length),I=new je;I.updateFromIdToken(s);const w=new G({uid:a.localId,auth:e,stsTokenManager:I,isAnonymous:h}),E={uid:a.localId,displayName:a.displayName||null,photoURL:a.photoUrl||null,email:a.email||null,emailVerified:a.emailVerified||!1,phoneNumber:a.phoneNumber||null,tenantId:a.tenantId||null,providerData:l,metadata:new Ln(a.createdAt,a.lastLoginAt),isAnonymous:!(a.email&&a.passwordHash)&&!(l!=null&&l.length)};return Object.assign(w,E),w}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const or=new Map;function ne(i){re(i instanceof Function,"Expected a class definition");let e=or.get(i);return e?(re(e instanceof i,"Instance stored in cache mismatched with class"),e):(e=new i,or.set(i,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hr{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}Hr.type="NONE";const ar=Hr;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ut(i,e,n){return`firebase:${i}:${e}:${n}`}class Oe{constructor(e,n,s){this.persistence=e,this.auth=n,this.userKey=s;const{config:a,name:l}=this.auth;this.fullUserKey=Ut(this.userKey,a.apiKey,l),this.fullPersistenceKey=Ut("persistence",a.apiKey,l),this.boundEventHandler=n._onStorageEvent.bind(n);try{this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}catch{}}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await $t(this.auth,{idToken:e}).catch(()=>{});return n?G._fromGetAccountInfoResponse(this.auth,n,e):null}return G._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){try{this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}catch{}}static async create(e,n,s="authUser"){if(!n.length)return new Oe(ne(ar),e,s);const a=(await Promise.all(n.map(async E=>{try{if(await E._isAvailable())return E}catch{return}}))).filter(E=>E);let l=a[0]||ne(ar);const h=Ut(s,e.config.apiKey,e.name);let I=null;for(const E of n)try{const A=await E._get(h);if(A){let b;if(typeof A=="string"){const O=await $t(e,{idToken:A}).catch(()=>{});if(!O)break;b=await G._fromGetAccountInfoResponse(e,O,A)}else b=G._fromJSON(e,A);E!==l&&(I=b),l=E;break}}catch{}const w=a.filter(E=>E._shouldAllowMigration);return!l._shouldAllowMigration||!w.length?new Oe(l,e,s):(l=w[0],I&&await l._set(h,I.toJSON()),await Promise.all(n.map(async E=>{if(E!==l)try{await E._remove(h)}catch{}})),new Oe(l,e,s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cr(i){const e=i.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(zr(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if($r(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Kr(e))return"Blackberry";if(qr(e))return"Webos";if(Vr(e))return"Safari";if((e.includes("chrome/")||Wr(e))&&!e.includes("edge/"))return"Chrome";if(Gr(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,s=i.match(n);if((s==null?void 0:s.length)===2)return s[1]}return"Other"}function $r(i=$()){return/firefox\//i.test(i)}function Vr(i=$()){const e=i.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Wr(i=$()){return/crios\//i.test(i)}function zr(i=$()){return/iemobile/i.test(i)}function Gr(i=$()){return/android/i.test(i)}function Kr(i=$()){return/blackberry/i.test(i)}function qr(i=$()){return/webos/i.test(i)}function $n(i=$()){return/iphone|ipad|ipod/i.test(i)||/macintosh/i.test(i)&&/mobile/i.test(i)}function Ga(i=$()){var e;return $n(i)&&!!((e=window.navigator)!=null&&e.standalone)}function Ka(){return so()&&document.documentMode===10}function Jr(i=$()){return $n(i)||Gr(i)||qr(i)||Kr(i)||/windows phone/i.test(i)||zr(i)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xr(i,e=[]){let n;switch(i){case"Browser":n=cr($());break;case"Worker":n=`${cr($())}-${i}`;break;default:n=i}const s=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${dt}/${s}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qa{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const s=l=>new Promise((h,I)=>{try{const w=e(l);h(w)}catch(w){I(w)}});s.onAbort=n,this.queue.push(s);const a=this.queue.length-1;return()=>{this.queue[a]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const s of this.queue)await s(e),s.onAbort&&n.push(s.onAbort)}catch(s){n.reverse();for(const a of n)try{a()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:s==null?void 0:s.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ja(i,e={}){return Ve(i,"GET","/v2/passwordPolicy",Fn(i,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xa=6;class Ya{constructor(e){var s;const n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??Xa,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((s=e.allowedNonAlphanumericCharacters)==null?void 0:s.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){const s=this.customStrengthOptions.minPasswordLength,a=this.customStrengthOptions.maxPasswordLength;s&&(n.meetsMinPasswordLength=e.length>=s),a&&(n.meetsMaxPasswordLength=e.length<=a)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let s;for(let a=0;a<e.length;a++)s=e.charAt(a),this.updatePasswordCharacterOptionsStatuses(n,s>="a"&&s<="z",s>="A"&&s<="Z",s>="0"&&s<="9",this.allowedNonAlphanumericCharacters.includes(s))}updatePasswordCharacterOptionsStatuses(e,n,s,a,l){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=s)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=a)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=l))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qa{constructor(e,n,s,a){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=s,this.config=a,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new hr(this),this.idTokenSubscription=new hr(this),this.beforeStateQueue=new qa(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Ur,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=a.sdkClientVersion,this._persistenceManagerAvailable=new Promise(l=>this._resolvePersistenceManagerAvailable=l)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=ne(n)),this._initializationPromise=this.queue(async()=>{var s,a,l;if(!this._deleted){try{this.persistenceManager=await Oe.create(this,e)}catch(h){Mt(`Failed to initialize persistence: ${h}`),this.persistenceManager=await Oe.create(this,[])}finally{(s=this._resolvePersistenceManagerAvailable)==null||s.call(this)}if(!this._deleted){if((a=this._popupRedirectResolver)!=null&&a._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}try{await this.initializeCurrentUser(n)}catch(h){Mt(`Failed to initialize current user: ${h}`),await this.directlySetCurrentUser(null).catch(()=>{})}this.lastNotifiedUid=((l=this.currentUser)==null?void 0:l.uid)||null,!this._deleted&&(this._isInitialized=!0)}}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await $t(this,{idToken:e}),s=await G._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(s)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var l;if(Y(this.app)){const h=this.app.settings.authIdToken;return h?new Promise(I=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(h).then(I,I))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let s=n,a=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const h=(l=this.redirectUser)==null?void 0:l._redirectEventId,I=s==null?void 0:s._redirectEventId,w=await this.tryRedirectSignIn(e);(!h||h===I)&&(w!=null&&w.user)&&(s=w.user,a=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(a)try{await this.beforeStateQueue.runMiddleware(s)}catch(h){s=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(h))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return S(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Vt(e)}catch(n){const s=n==null?void 0:n.code;if(s!=="auth/network-request-failed"&&s!=="auth/too-many-requests"&&!(s!=null&&s.startsWith("auth/quota-exceeded")))return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Da()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Y(this.app))return Promise.reject(Re(this));const n=e?Ie(e):null;return n&&S(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&S(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Y(this.app)?Promise.reject(Re(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Y(this.app)?Promise.reject(Re(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(ne(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Ja(this),n=new Ya(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new ut("auth","Firebase",e())}onAuthStateChanged(e,n,s){return this.registerStateListener(this.authStateSubscription,e,n,s)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,s){return this.registerStateListener(this.idTokenSubscription,e,n,s)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const s=this.onAuthStateChanged(()=>{s(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),s={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(s.tenantId=this.tenantId),await za(this,s)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,n){const s=await this.getOrInitRedirectPersistenceManager(n);return e===null?s.removeCurrentUser():s.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&ne(e)||this._popupRedirectResolver;S(n,this,"argument-error"),this.redirectPersistenceManager=await Oe.create(this,[ne(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,s;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)==null?void 0:n._redirectEventId)===e?this._currentUser:((s=this.redirectUser)==null?void 0:s._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((n=this.currentUser)==null?void 0:n.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,s,a){if(this._deleted)return()=>{};const l=typeof n=="function"?n:n.next.bind(n);let h=!1;const I=this._isInitialized?Promise.resolve():this._initializationPromise;if(S(I,this,"internal-error"),I.then(()=>{h||l(this.currentUser)}).catch(w=>{if(!h)if(typeof n!="function"&&n.error)n.error(w);else if(s)s(w);else throw w}),typeof n=="function"){const w=e.addObserver(n,s,a);return()=>{h=!0,w()}}else{const w=e.addObserver(n);return()=>{h=!0,w()}}}async directlySetCurrentUser(e){if(this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,this.persistenceManager)try{e?await this.persistenceManager.setCurrentUser(e):await this.persistenceManager.removeCurrentUser()}catch(n){const s=(n==null?void 0:n.message)||String(n),a=qt(this,"internal-error",`An internal AuthError has occurred: ${s}`);throw a.customData={originalError:n},a}}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return S(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Xr(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var a;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const n=await((a=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:a.getHeartbeatsHeader());n&&(e["X-Firebase-Client"]=n);const s=await this._getAppCheckToken();return s&&(e["X-Firebase-AppCheck"]=s),e}async _getAppCheckToken(){var n;if(Y(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((n=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:n.getToken());return e!=null&&e.error&&Mt(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function We(i){return Ie(i)}class hr{constructor(e){this.auth=e,this.observer=null,this.addObserver=uo(n=>this.observer=n)}get next(){return S(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Vn={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Za(i){Vn=i}function ec(i){return Vn.loadJS(i)}function tc(){return Vn.gapiScript}function nc(i){return`__${i}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ic(i,e){const n=Dr(i,"auth");if(n.isInitialized()){const a=n.getImmediate(),l=n.getOptions();if(Fe(l,e??{}))return a;Z(a,"already-initialized")}return n.initialize({options:e})}function rc(i,e){const n=(e==null?void 0:e.persistence)||[],s=(Array.isArray(n)?n:[n]).map(ne);e!=null&&e.errorMap&&i._updateErrorMap(e.errorMap),i._initializeWithPersistence(s,e==null?void 0:e.popupRedirectResolver)}function sc(i,e,n){const s=We(i);S(/^https?:\/\//.test(e),s,"invalid-emulator-scheme");const a=!1,l=Yr(e),{host:h,port:I}=oc(e),w=I===null?"":`:${I}`,E={url:`${l}//${h}${w}/`},A=Object.freeze({host:h,port:I,protocol:l.replace(":",""),options:Object.freeze({disableWarnings:a})});if(!s._canInitEmulator){S(s.config.emulator&&s.emulatorConfig,s,"emulator-config-failed"),S(Fe(E,s.config.emulator)&&Fe(A,s.emulatorConfig),s,"emulator-config-failed");return}s.config.emulator=E,s.emulatorConfig=A,s.settings.appVerificationDisabledForTesting=!0,Un(h)?go(`${l}//${h}${w}`):ac()}function Yr(i){const e=i.indexOf(":");return e<0?"":i.substr(0,e+1)}function oc(i){const e=Yr(i),n=/(\/\/)?([^?#/]+)/.exec(i.substr(e.length));if(!n)return{host:"",port:null};const s=n[2].split("@").pop()||"",a=/^(\[[^\]]+\])(:|$)/.exec(s);if(a){const l=a[1];return{host:l,port:lr(s.substr(l.length+1))}}else{const[l,h]=s.split(":");return{host:l,port:lr(h)}}}function lr(i){if(!i)return null;const e=Number(i);return isNaN(e)?null:e}function ac(){function i(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",i):i())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qr{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return te("not implemented")}_getIdTokenResponse(e){return te("not implemented")}_linkToIdToken(e,n){return te("not implemented")}_getReauthenticationResolver(e){return te("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Be(i,e){return Ua(i,"POST","/v1/accounts:signInWithIdp",Fn(i,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cc="http://localhost";class De extends Qr{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new De(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):Z("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:s,signInMethod:a,...l}=n;if(!s||!a)return null;const h=new De(s,a);return h.idToken=l.idToken||void 0,h.accessToken=l.accessToken||void 0,h.secret=l.secret,h.nonce=l.nonce,h.pendingToken=l.pendingToken||null,h}_getIdTokenResponse(e){const n=this.buildRequest();return Be(e,n)}_linkToIdToken(e,n){const s=this.buildRequest();return s.idToken=n,Be(e,s)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,Be(e,n)}buildRequest(){const e={requestUri:cc,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=ft(n)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wn{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gt extends Wn{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ge extends gt{constructor(){super("facebook.com")}static credential(e){return De._fromParams({providerId:ge.PROVIDER_ID,signInMethod:ge.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ge.credentialFromTaggedObject(e)}static credentialFromError(e){return ge.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ge.credential(e.oauthAccessToken)}catch{return null}}}ge.FACEBOOK_SIGN_IN_METHOD="facebook.com";ge.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class me extends gt{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return De._fromParams({providerId:me.PROVIDER_ID,signInMethod:me.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return me.credentialFromTaggedObject(e)}static credentialFromError(e){return me.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:s}=e;if(!n&&!s)return null;try{return me.credential(n,s)}catch{return null}}}me.GOOGLE_SIGN_IN_METHOD="google.com";me.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ye extends gt{constructor(){super("github.com")}static credential(e){return De._fromParams({providerId:ye.PROVIDER_ID,signInMethod:ye.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ye.credentialFromTaggedObject(e)}static credentialFromError(e){return ye.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ye.credential(e.oauthAccessToken)}catch{return null}}}ye.GITHUB_SIGN_IN_METHOD="github.com";ye.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _e extends gt{constructor(){super("twitter.com")}static credential(e,n){return De._fromParams({providerId:_e.PROVIDER_ID,signInMethod:_e.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return _e.credentialFromTaggedObject(e)}static credentialFromError(e){return _e.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:s}=e;if(!n||!s)return null;try{return _e.credential(n,s)}catch{return null}}}_e.TWITTER_SIGN_IN_METHOD="twitter.com";_e.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $e{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,s,a=!1){const l=await G._fromIdTokenResponse(e,s,a),h=ur(s);return new $e({user:l,providerId:h,_tokenResponse:s,operationType:n})}static async _forOperation(e,n,s){await e._updateTokensIfNecessary(s,!0);const a=ur(s);return new $e({user:e,providerId:a,_tokenResponse:s,operationType:n})}}function ur(i){return i.providerId?i.providerId:"phoneNumber"in i?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wt extends we{constructor(e,n,s,a){super(n.code,n.message),this.operationType=s,this.user=a,Object.setPrototypeOf(this,Wt.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:s}}static _fromErrorAndOperation(e,n,s,a){return new Wt(e,n,s,a)}}function Zr(i,e,n,s){return(e==="reauthenticate"?n._getReauthenticationResolver(i):n._getIdTokenResponse(i)).catch(l=>{throw l.code==="auth/multi-factor-auth-required"?Wt._fromErrorAndOperation(i,l,e,s):l})}async function hc(i,e,n=!1){const s=await lt(i,e._linkToIdToken(i.auth,await i.getIdToken()),n);return $e._forOperation(i,"link",s)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function lc(i,e,n=!1){const{auth:s}=i;if(Y(s.app))return Promise.reject(Re(s));const a="reauthenticate";try{const l=await lt(i,Zr(s,a,e,i),n);S(l.idToken,s,"internal-error");const h=Hn(l.idToken);S(h,s,"internal-error");const{sub:I}=h;return S(i.uid===I,s,"user-mismatch"),$e._forOperation(i,a,l)}catch(l){throw(l==null?void 0:l.code)==="auth/user-not-found"&&Z(s,"user-mismatch"),l}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function es(i,e,n=!1){if(Y(i.app))return Promise.reject(Re(i));const s="signIn",a=await Zr(i,s,e),l=await $e._fromIdTokenResponse(i,s,a);return n||await i._updateCurrentUser(l.user),l}async function Uh(i,e){return es(We(i),e)}function uc(i,e,n,s){return Ie(i).onIdTokenChanged(e,n,s)}function fc(i,e,n){return Ie(i).beforeAuthStateChanged(e,n)}function xh(i,e,n,s){return Ie(i).onAuthStateChanged(e,n,s)}function jh(i){return Ie(i).signOut()}const zt="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ts{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(zt,"1"),this.storage.removeItem(zt),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dc=1e3,pc=10;class ns extends ts{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Jr(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const s=this.storage.getItem(n),a=this.localCache[n];s!==a&&e(n,a,s)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((h,I,w)=>{this.notifyListeners(h,w)});return}const s=e.key;n?this.detachListener():this.stopPolling();const a=()=>{const h=this.storage.getItem(s);!n&&this.localCache[s]===h||this.notifyListeners(s,h)},l=this.storage.getItem(s);Ka()&&l!==e.newValue&&e.newValue!==e.oldValue?setTimeout(a,pc):a()}notifyListeners(e,n){this.localCache[e]=n;const s=this.listeners[e];if(s)for(const a of Array.from(s))a(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,s)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:s}),!0)})},dc)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}ns.type="LOCAL";const gc=ns;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class is extends ts{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}is.type="SESSION";const rs=is;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mc(i){return Promise.all(i.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jt{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(a=>a.isListeningto(e));if(n)return n;const s=new Jt(e);return this.receivers.push(s),s}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:s,eventType:a,data:l}=n.data,h=this.handlersMap[a];if(!(h!=null&&h.size))return;n.ports[0].postMessage({status:"ack",eventId:s,eventType:a});const I=Array.from(h).map(async E=>E(n.origin,l)),w=await mc(I);n.ports[0].postMessage({status:"done",eventId:s,eventType:a,response:w})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Jt.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zn(i="",e=10){let n="";for(let s=0;s<e;s++)n+=Math.floor(Math.random()*10);return i+n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yc{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,s=50){const a=typeof MessageChannel<"u"?new MessageChannel:null;if(!a)throw new Error("connection_unavailable");let l,h;return new Promise((I,w)=>{const E=zn("",20);a.port1.start();const A=setTimeout(()=>{w(new Error("unsupported_event"))},s);h={messageChannel:a,onMessage(b){const O=b;if(O.data.eventId===E)switch(O.data.status){case"ack":clearTimeout(A),l=setTimeout(()=>{w(new Error("timeout"))},3e3);break;case"done":clearTimeout(l),I(O.data.response);break;default:clearTimeout(A),clearTimeout(l),w(new Error("invalid_response"));break}}},this.handlers.add(h),a.port1.addEventListener("message",h.onMessage),this.target.postMessage({eventType:e,eventId:E,data:n},[a.port2])}).finally(()=>{h&&this.removeMessageHandler(h)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Q(){return window}function _c(i){Q().location.href=i}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ss(){return typeof Q().WorkerGlobalScope<"u"&&typeof Q().importScripts=="function"}async function vc(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function wc(){var i;return((i=navigator==null?void 0:navigator.serviceWorker)==null?void 0:i.controller)||null}function Ic(){return ss()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const os="firebaseLocalStorageDb",Ec=1,Gt="firebaseLocalStorage",as="fbase_key";class mt{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function Xt(i,e){return i.transaction([Gt],e?"readwrite":"readonly").objectStore(Gt)}function Tc(){const i=indexedDB.deleteDatabase(os);return new mt(i).toPromise()}function cs(){const i=indexedDB.open(os,Ec);return new Promise((e,n)=>{i.addEventListener("error",()=>{n(i.error)}),i.addEventListener("upgradeneeded",()=>{const s=i.result;try{s.createObjectStore(Gt,{keyPath:as})}catch(a){n(a)}}),i.addEventListener("success",async()=>{const s=i.result;s.objectStoreNames.contains(Gt)?e(s):(s.close(),await Tc(),e(await cs()))})})}async function fr(i,e,n){const s=Xt(i,!0).put({[as]:e,value:n});return new mt(s).toPromise()}async function bc(i,e){const n=Xt(i,!1).get(e),s=await new mt(n).toPromise();return s===void 0?null:s.value}function dr(i,e){const n=Xt(i,!0).delete(e);return new mt(n).toPromise()}const Sc=800,Ac=3;class hs{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=cs(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let n=0;for(;;)try{const s=await this._openDb();return await e(s)}catch(s){if(n++>Ac)throw s;if(this.dbPromise){const a=this.dbPromise;this.dbPromise=null;try{(await a).close()}catch{}}}}async initializeServiceWorkerMessaging(){return ss()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Jt._getInstance(Ic()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var n,s;if(this.activeServiceWorker=await vc(),!this.activeServiceWorker)return;this.sender=new yc(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(n=e[0])!=null&&n.fulfilled&&(s=e[0])!=null&&s.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||wc()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await fr(e,zt,"1"),await dr(e,zt)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(s=>fr(s,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(s=>bc(s,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>dr(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{const e=await this._withRetries(a=>{const l=Xt(a,!1).getAll();return new mt(l).toPromise()});if(this.isClosing)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],s=new Set;if(e.length!==0)for(const{fbase_key:a,value:l}of e)s.add(a),JSON.stringify(this.localCache[a])!==JSON.stringify(l)&&(this.notifyListeners(a,l),n.push(a));for(const a of Object.keys(this.localCache))this.localCache[a]&&!s.has(a)&&(this.notifyListeners(a,null),n.push(a));return n}catch(e){return this.isClosing||Mt(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,n){this.localCache[e]=n;const s=this.listeners[e];if(s)for(const a of Array.from(s))a(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),Sc)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}hs.type="LOCAL";const Cc=hs;new pt(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ls(i,e){return e?ne(e):(S(i._popupRedirectResolver,i,"argument-error"),i._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gn extends Qr{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Be(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Be(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Be(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function Pc(i){return es(i.auth,new Gn(i),i.bypassAuthState)}function kc(i){const{auth:e,user:n}=i;return S(n,e,"internal-error"),lc(n,new Gn(i),i.bypassAuthState)}async function Rc(i){const{auth:e,user:n}=i;return S(n,e,"internal-error"),hc(n,new Gn(i),i.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class us{constructor(e,n,s,a,l=!1){this.auth=e,this.resolver=s,this.user=a,this.bypassAuthState=l,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(s){this.reject(s)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:s,postBody:a,tenantId:l,error:h,type:I}=e;if(h){this.reject(h);return}const w={auth:this.auth,requestUri:n,sessionId:s,tenantId:l||void 0,postBody:a||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(I)(w))}catch(E){this.reject(E)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return Pc;case"linkViaPopup":case"linkViaRedirect":return Rc;case"reauthViaPopup":case"reauthViaRedirect":return kc;default:Z(this.auth,"internal-error")}}resolve(e){re(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){re(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Oc=new pt(2e3,1e4);async function Bh(i,e,n){if(Y(i.app))return Promise.reject(K(i,"operation-not-supported-in-this-environment"));const s=We(i);ka(i,e,Wn);const a=ls(s,n);return new ke(s,"signInViaPopup",e,a).executeNotNull()}class ke extends us{constructor(e,n,s,a,l){super(e,n,a,l),this.provider=s,this.authWindow=null,this.pollId=null,ke.currentPopupAction&&ke.currentPopupAction.cancel(),ke.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return S(e,this.auth,"internal-error"),e}async onExecution(){re(this.filter.length===1,"Popup operations only handle one event");const e=zn();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(K(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(K(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,ke.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,s;if((s=(n=this.authWindow)==null?void 0:n.window)!=null&&s.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(K(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,Oc.get())};e()}}ke.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dc="pendingRedirect",xt=new Map;class Nc extends us{constructor(e,n,s=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,s),this.eventId=null}async execute(){let e=xt.get(this.auth._key());if(!e){try{const s=await Mc(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(s)}catch(n){e=()=>Promise.reject(n)}xt.set(this.auth._key(),e)}return this.bypassAuthState||xt.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Mc(i,e){const n=xc(e),s=Uc(i);if(!await s._isAvailable())return!1;const a=await s._get(n)==="true";return await s._remove(n),a}function Lc(i,e){xt.set(i._key(),e)}function Uc(i){return ne(i._redirectPersistence)}function xc(i){return Ut(Dc,i.config.apiKey,i.name)}async function Fh(i,e){return await We(i)._initializationPromise,fs(i,e,!1)}async function fs(i,e,n=!1){if(Y(i.app))return Promise.reject(Re(i));const s=We(i),a=ls(s,e),h=await new Nc(s,a,n).execute();return h&&!n&&(delete h.user._redirectEventId,await s._persistUserIfCurrent(h.user),await s._setRedirectUser(null,e)),h}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jc=600*1e3;class Bc{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(s=>{this.isEventForConsumer(e,s)&&(n=!0,this.sendToConsumer(e,s),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Fc(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var s;if(e.error&&!ds(e)){const a=((s=e.error.code)==null?void 0:s.split("auth/")[1])||"internal-error";n.onError(K(this.auth,a))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const s=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&s}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=jc&&this.cachedEventUids.clear(),this.cachedEventUids.has(pr(e))}saveEventToCache(e){this.cachedEventUids.add(pr(e)),this.lastProcessedEventTime=Date.now()}}function pr(i){return[i.type,i.eventId,i.sessionId,i.tenantId].filter(e=>e).join("-")}function ds({type:i,error:e}){return i==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Fc(i){switch(i.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return ds(i);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Hc(i,e={}){return Ve(i,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $c=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Vc=/^https?/;async function Wc(i){if(i.config.emulator)return;const{authorizedDomains:e}=await Hc(i);for(const n of e)try{if(zc(n))return}catch{}Z(i,"unauthorized-domain")}function zc(i){const e=Mn(),{protocol:n,hostname:s}=new URL(e);if(i.startsWith("chrome-extension://")){const h=new URL(i);return h.hostname===""&&s===""?n==="chrome-extension:"&&i.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&h.hostname===s}if(!Vc.test(n))return!1;if($c.test(i))return s===i;const a=i.replace(/\./g,"\\.");return new RegExp("^(.+\\."+a+"|"+a+")$","i").test(s)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gc=new pt(3e4,6e4);function gr(){const i=Q().___jsl;if(i!=null&&i.H){for(const e of Object.keys(i.H))if(i.H[e].r=i.H[e].r||[],i.H[e].L=i.H[e].L||[],i.H[e].r=[...i.H[e].L],i.CP)for(let n=0;n<i.CP.length;n++)i.CP[n]=null}}function Kc(i){return new Promise((e,n)=>{var a,l,h;function s(){gr(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{gr(),n(K(i,"network-request-failed"))},timeout:Gc.get()})}if((l=(a=Q().gapi)==null?void 0:a.iframes)!=null&&l.Iframe)e(gapi.iframes.getContext());else if((h=Q().gapi)!=null&&h.load)s();else{const I=nc("iframefcb");return Q()[I]=()=>{gapi.load?s():n(K(i,"network-request-failed"))},ec(`${tc()}?onload=${I}`).catch(w=>n(w))}}).catch(e=>{throw jt=null,e})}let jt=null;function qc(i){return jt=jt||Kc(i),jt}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jc=new pt(5e3,15e3),Xc="__/auth/iframe",Yc="emulator/auth/iframe",Qc={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Zc=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function eh(i){const e=i.config;S(e.authDomain,i,"auth-domain-config-required");const n=e.emulator?Bn(e,Yc):`https://${i.config.authDomain}/${Xc}`,s={apiKey:e.apiKey,appName:i.name,v:dt},a=Zc.get(i.config.apiHost);a&&(s.eid=a);const l=i._getFrameworks();return l.length&&(s.fw=l.join(",")),`${n}?${ft(s).slice(1)}`}async function th(i){const e=await qc(i),n=Q().gapi;return S(n,i,"internal-error"),e.open({where:document.body,url:eh(i),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Qc,dontclear:!0},s=>new Promise(async(a,l)=>{await s.restyle({setHideOnLeave:!1});const h=K(i,"network-request-failed"),I=Q().setTimeout(()=>{l(h)},Jc.get());function w(){Q().clearTimeout(I),a(s)}s.ping(w).then(w,()=>{l(h)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nh={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},ih=500,rh=600,sh="_blank",oh="http://localhost";class mr{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function ah(i,e,n,s=ih,a=rh){const l=Math.max((window.screen.availHeight-a)/2,0).toString(),h=Math.max((window.screen.availWidth-s)/2,0).toString();let I="";const w={...nh,width:s.toString(),height:a.toString(),top:l,left:h},E=$().toLowerCase();n&&(I=Wr(E)?sh:n),$r(E)&&(e=e||oh,w.scrollbars="yes");const A=Object.entries(w).reduce((O,[j,M])=>`${O}${j}=${M},`,"");if(Ga(E)&&I!=="_self")return ch(e||"",I),new mr(null);const b=window.open(e||"",I,A);S(b,i,"popup-blocked");try{b.focus()}catch{}return new mr(b)}function ch(i,e){const n=document.createElement("a");n.href=i,n.target=e;const s=document.createEvent("MouseEvent");s.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hh="__/auth/handler",lh="emulator/auth/handler",uh=encodeURIComponent("fac");async function yr(i,e,n,s,a,l){S(i.config.authDomain,i,"auth-domain-config-required"),S(i.config.apiKey,i,"invalid-api-key");const h={apiKey:i.config.apiKey,appName:i.name,authType:n,redirectUrl:s,v:dt,eventId:a};if(e instanceof Wn){e.setDefaultLanguage(i.languageCode),h.providerId=e.providerId||"",lo(e.getCustomParameters())||(h.customParameters=JSON.stringify(e.getCustomParameters()));for(const[A,b]of Object.entries({}))h[A]=b}if(e instanceof gt){const A=e.getScopes().filter(b=>b!=="");A.length>0&&(h.scopes=A.join(","))}i.tenantId&&(h.tid=i.tenantId);const I=h;for(const A of Object.keys(I))I[A]===void 0&&delete I[A];const w=await i._getAppCheckToken(),E=w?`#${uh}=${encodeURIComponent(w)}`:"";return`${fh(i)}?${ft(I).slice(1)}${E}`}function fh({config:i}){return i.emulator?Bn(i,lh):`https://${i.authDomain}/${hh}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pn="webStorageSupport";class dh{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=rs,this._completeRedirectFn=fs,this._overrideRedirectResult=Lc}async _openPopup(e,n,s,a){var h;re((h=this.eventManagers[e._key()])==null?void 0:h.manager,"_initialize() not called before _openPopup()");const l=await yr(e,n,s,Mn(),a);return ah(e,l,zn())}async _openRedirect(e,n,s,a){await this._originValidation(e);const l=await yr(e,n,s,Mn(),a);return _c(l),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:a,promise:l}=this.eventManagers[n];return a?Promise.resolve(a):(re(l,"If manager is not set, promise should be"),l)}const s=this.initAndGetManager(e);return this.eventManagers[n]={promise:s},s.catch(()=>{delete this.eventManagers[n]}),s}async initAndGetManager(e){const n=await th(e),s=new Bc(e);return n.register("authEvent",a=>(S(a==null?void 0:a.authEvent,e,"invalid-auth-event"),{status:s.onEvent(a.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:s},this.iframes[e._key()]=n,s}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(Pn,{type:Pn},a=>{var h;const l=(h=a==null?void 0:a[0])==null?void 0:h[Pn];l!==void 0&&n(!!l),Z(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=Wc(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return Jr()||Vr()||$n()}}const ph=dh;var _r="@firebase/auth",vr="1.13.7";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gh{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(s=>{e((s==null?void 0:s.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){S(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mh(i){switch(i){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function yh(i){ct(new He("auth",(e,{options:n})=>{const s=e.getProvider("app").getImmediate(),a=e.getProvider("heartbeat"),l=e.getProvider("app-check-internal"),{apiKey:h,authDomain:I}=s.options;S(h&&!h.includes(":"),"invalid-api-key",{appName:s.name});const w={apiKey:h,authDomain:I,clientPlatform:i,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Xr(i)},E=new Qa(s,a,l,w);return rc(E,n),E},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,s)=>{e.getProvider("auth-internal").initialize()})),ct(new He("auth-internal",e=>{const n=We(e.getProvider("auth").getImmediate());return(s=>new gh(s))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),xe(_r,vr,mh(i)),xe(_r,vr,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _h=300,vh=Cr("authIdTokenMaxAge")||_h;let wr=null;const wh=i=>async e=>{const n=e&&await e.getIdTokenResult(),s=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(s&&s>vh)return;const a=n==null?void 0:n.token;wr!==a&&(wr=a,await fetch(i,{method:a?"POST":"DELETE",headers:a?{Authorization:`Bearer ${a}`}:{}}))};function Hh(i=ga()){const e=Dr(i,"auth");if(e.isInitialized())return e.getImmediate();const n=ic(i,{popupRedirectResolver:ph,persistence:[Cc,gc,rs]}),s=Cr("authTokenSyncURL");if(s&&typeof isSecureContext=="boolean"&&isSecureContext){const l=new URL(s,location.origin);if(location.origin===l.origin){const h=wh(l.toString());fc(n,h,()=>h(n.currentUser)),uc(n,I=>h(I))}}const a=Sr("auth");return a&&sc(n,`http://${a}`),n}function Ih(){var i;return((i=document.getElementsByTagName("head"))==null?void 0:i[0])??document}Za({loadJS(i){return new Promise((e,n)=>{const s=document.createElement("script");s.setAttribute("src",i),s.onload=e,s.onerror=a=>{const l=K("internal-error");l.customData=a,n(l)},s.type="text/javascript",s.charset="UTF-8",Ih().appendChild(s)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});yh("Browser");var Ir=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Eh,Th;(function(){var i;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(g,u){function d(){}d.prototype=u.prototype,g.F=u.prototype,g.prototype=new d,g.prototype.constructor=g,g.D=function(m,p,_){for(var f=Array(arguments.length-2),V=2;V<arguments.length;V++)f[V-2]=arguments[V];return u.prototype[p].apply(m,f)}}function n(){this.blockSize=-1}function s(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(s,n),s.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function a(g,u,d){d||(d=0);const m=Array(16);if(typeof u=="string")for(var p=0;p<16;++p)m[p]=u.charCodeAt(d++)|u.charCodeAt(d++)<<8|u.charCodeAt(d++)<<16|u.charCodeAt(d++)<<24;else for(p=0;p<16;++p)m[p]=u[d++]|u[d++]<<8|u[d++]<<16|u[d++]<<24;u=g.g[0],d=g.g[1],p=g.g[2];let _=g.g[3],f;f=u+(_^d&(p^_))+m[0]+3614090360&4294967295,u=d+(f<<7&4294967295|f>>>25),f=_+(p^u&(d^p))+m[1]+3905402710&4294967295,_=u+(f<<12&4294967295|f>>>20),f=p+(d^_&(u^d))+m[2]+606105819&4294967295,p=_+(f<<17&4294967295|f>>>15),f=d+(u^p&(_^u))+m[3]+3250441966&4294967295,d=p+(f<<22&4294967295|f>>>10),f=u+(_^d&(p^_))+m[4]+4118548399&4294967295,u=d+(f<<7&4294967295|f>>>25),f=_+(p^u&(d^p))+m[5]+1200080426&4294967295,_=u+(f<<12&4294967295|f>>>20),f=p+(d^_&(u^d))+m[6]+2821735955&4294967295,p=_+(f<<17&4294967295|f>>>15),f=d+(u^p&(_^u))+m[7]+4249261313&4294967295,d=p+(f<<22&4294967295|f>>>10),f=u+(_^d&(p^_))+m[8]+1770035416&4294967295,u=d+(f<<7&4294967295|f>>>25),f=_+(p^u&(d^p))+m[9]+2336552879&4294967295,_=u+(f<<12&4294967295|f>>>20),f=p+(d^_&(u^d))+m[10]+4294925233&4294967295,p=_+(f<<17&4294967295|f>>>15),f=d+(u^p&(_^u))+m[11]+2304563134&4294967295,d=p+(f<<22&4294967295|f>>>10),f=u+(_^d&(p^_))+m[12]+1804603682&4294967295,u=d+(f<<7&4294967295|f>>>25),f=_+(p^u&(d^p))+m[13]+4254626195&4294967295,_=u+(f<<12&4294967295|f>>>20),f=p+(d^_&(u^d))+m[14]+2792965006&4294967295,p=_+(f<<17&4294967295|f>>>15),f=d+(u^p&(_^u))+m[15]+1236535329&4294967295,d=p+(f<<22&4294967295|f>>>10),f=u+(p^_&(d^p))+m[1]+4129170786&4294967295,u=d+(f<<5&4294967295|f>>>27),f=_+(d^p&(u^d))+m[6]+3225465664&4294967295,_=u+(f<<9&4294967295|f>>>23),f=p+(u^d&(_^u))+m[11]+643717713&4294967295,p=_+(f<<14&4294967295|f>>>18),f=d+(_^u&(p^_))+m[0]+3921069994&4294967295,d=p+(f<<20&4294967295|f>>>12),f=u+(p^_&(d^p))+m[5]+3593408605&4294967295,u=d+(f<<5&4294967295|f>>>27),f=_+(d^p&(u^d))+m[10]+38016083&4294967295,_=u+(f<<9&4294967295|f>>>23),f=p+(u^d&(_^u))+m[15]+3634488961&4294967295,p=_+(f<<14&4294967295|f>>>18),f=d+(_^u&(p^_))+m[4]+3889429448&4294967295,d=p+(f<<20&4294967295|f>>>12),f=u+(p^_&(d^p))+m[9]+568446438&4294967295,u=d+(f<<5&4294967295|f>>>27),f=_+(d^p&(u^d))+m[14]+3275163606&4294967295,_=u+(f<<9&4294967295|f>>>23),f=p+(u^d&(_^u))+m[3]+4107603335&4294967295,p=_+(f<<14&4294967295|f>>>18),f=d+(_^u&(p^_))+m[8]+1163531501&4294967295,d=p+(f<<20&4294967295|f>>>12),f=u+(p^_&(d^p))+m[13]+2850285829&4294967295,u=d+(f<<5&4294967295|f>>>27),f=_+(d^p&(u^d))+m[2]+4243563512&4294967295,_=u+(f<<9&4294967295|f>>>23),f=p+(u^d&(_^u))+m[7]+1735328473&4294967295,p=_+(f<<14&4294967295|f>>>18),f=d+(_^u&(p^_))+m[12]+2368359562&4294967295,d=p+(f<<20&4294967295|f>>>12),f=u+(d^p^_)+m[5]+4294588738&4294967295,u=d+(f<<4&4294967295|f>>>28),f=_+(u^d^p)+m[8]+2272392833&4294967295,_=u+(f<<11&4294967295|f>>>21),f=p+(_^u^d)+m[11]+1839030562&4294967295,p=_+(f<<16&4294967295|f>>>16),f=d+(p^_^u)+m[14]+4259657740&4294967295,d=p+(f<<23&4294967295|f>>>9),f=u+(d^p^_)+m[1]+2763975236&4294967295,u=d+(f<<4&4294967295|f>>>28),f=_+(u^d^p)+m[4]+1272893353&4294967295,_=u+(f<<11&4294967295|f>>>21),f=p+(_^u^d)+m[7]+4139469664&4294967295,p=_+(f<<16&4294967295|f>>>16),f=d+(p^_^u)+m[10]+3200236656&4294967295,d=p+(f<<23&4294967295|f>>>9),f=u+(d^p^_)+m[13]+681279174&4294967295,u=d+(f<<4&4294967295|f>>>28),f=_+(u^d^p)+m[0]+3936430074&4294967295,_=u+(f<<11&4294967295|f>>>21),f=p+(_^u^d)+m[3]+3572445317&4294967295,p=_+(f<<16&4294967295|f>>>16),f=d+(p^_^u)+m[6]+76029189&4294967295,d=p+(f<<23&4294967295|f>>>9),f=u+(d^p^_)+m[9]+3654602809&4294967295,u=d+(f<<4&4294967295|f>>>28),f=_+(u^d^p)+m[12]+3873151461&4294967295,_=u+(f<<11&4294967295|f>>>21),f=p+(_^u^d)+m[15]+530742520&4294967295,p=_+(f<<16&4294967295|f>>>16),f=d+(p^_^u)+m[2]+3299628645&4294967295,d=p+(f<<23&4294967295|f>>>9),f=u+(p^(d|~_))+m[0]+4096336452&4294967295,u=d+(f<<6&4294967295|f>>>26),f=_+(d^(u|~p))+m[7]+1126891415&4294967295,_=u+(f<<10&4294967295|f>>>22),f=p+(u^(_|~d))+m[14]+2878612391&4294967295,p=_+(f<<15&4294967295|f>>>17),f=d+(_^(p|~u))+m[5]+4237533241&4294967295,d=p+(f<<21&4294967295|f>>>11),f=u+(p^(d|~_))+m[12]+1700485571&4294967295,u=d+(f<<6&4294967295|f>>>26),f=_+(d^(u|~p))+m[3]+2399980690&4294967295,_=u+(f<<10&4294967295|f>>>22),f=p+(u^(_|~d))+m[10]+4293915773&4294967295,p=_+(f<<15&4294967295|f>>>17),f=d+(_^(p|~u))+m[1]+2240044497&4294967295,d=p+(f<<21&4294967295|f>>>11),f=u+(p^(d|~_))+m[8]+1873313359&4294967295,u=d+(f<<6&4294967295|f>>>26),f=_+(d^(u|~p))+m[15]+4264355552&4294967295,_=u+(f<<10&4294967295|f>>>22),f=p+(u^(_|~d))+m[6]+2734768916&4294967295,p=_+(f<<15&4294967295|f>>>17),f=d+(_^(p|~u))+m[13]+1309151649&4294967295,d=p+(f<<21&4294967295|f>>>11),f=u+(p^(d|~_))+m[4]+4149444226&4294967295,u=d+(f<<6&4294967295|f>>>26),f=_+(d^(u|~p))+m[11]+3174756917&4294967295,_=u+(f<<10&4294967295|f>>>22),f=p+(u^(_|~d))+m[2]+718787259&4294967295,p=_+(f<<15&4294967295|f>>>17),f=d+(_^(p|~u))+m[9]+3951481745&4294967295,g.g[0]=g.g[0]+u&4294967295,g.g[1]=g.g[1]+(p+(f<<21&4294967295|f>>>11))&4294967295,g.g[2]=g.g[2]+p&4294967295,g.g[3]=g.g[3]+_&4294967295}s.prototype.v=function(g,u){u===void 0&&(u=g.length);const d=u-this.blockSize,m=this.C;let p=this.h,_=0;for(;_<u;){if(p==0)for(;_<=d;)a(this,g,_),_+=this.blockSize;if(typeof g=="string"){for(;_<u;)if(m[p++]=g.charCodeAt(_++),p==this.blockSize){a(this,m),p=0;break}}else for(;_<u;)if(m[p++]=g[_++],p==this.blockSize){a(this,m),p=0;break}}this.h=p,this.o+=u},s.prototype.A=function(){var g=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);g[0]=128;for(var u=1;u<g.length-8;++u)g[u]=0;u=this.o*8;for(var d=g.length-8;d<g.length;++d)g[d]=u&255,u/=256;for(this.v(g),g=Array(16),u=0,d=0;d<4;++d)for(let m=0;m<32;m+=8)g[u++]=this.g[d]>>>m&255;return g};function l(g,u){var d=I;return Object.prototype.hasOwnProperty.call(d,g)?d[g]:d[g]=u(g)}function h(g,u){this.h=u;const d=[];let m=!0;for(let p=g.length-1;p>=0;p--){const _=g[p]|0;m&&_==u||(d[p]=_,m=!1)}this.g=d}var I={};function w(g){return-128<=g&&g<128?l(g,function(u){return new h([u|0],u<0?-1:0)}):new h([g|0],g<0?-1:0)}function E(g){if(isNaN(g)||!isFinite(g))return b;if(g<0)return N(E(-g));const u=[];let d=1;for(let m=0;g>=d;m++)u[m]=g/d|0,d*=4294967296;return new h(u,0)}function A(g,u){if(g.length==0)throw Error("number format error: empty string");if(u=u||10,u<2||36<u)throw Error("radix out of range: "+u);if(g.charAt(0)=="-")return N(A(g.substring(1),u));if(g.indexOf("-")>=0)throw Error('number format error: interior "-" character');const d=E(Math.pow(u,8));let m=b;for(let _=0;_<g.length;_+=8){var p=Math.min(8,g.length-_);const f=parseInt(g.substring(_,_+p),u);p<8?(p=E(Math.pow(u,p)),m=m.j(p).add(E(f))):(m=m.j(d),m=m.add(E(f)))}return m}var b=w(0),O=w(1),j=w(16777216);i=h.prototype,i.m=function(){if(x(this))return-N(this).m();let g=0,u=1;for(let d=0;d<this.g.length;d++){const m=this.i(d);g+=(m>=0?m:4294967296+m)*u,u*=4294967296}return g},i.toString=function(g){if(g=g||10,g<2||36<g)throw Error("radix out of range: "+g);if(M(this))return"0";if(x(this))return"-"+N(this).toString(g);const u=E(Math.pow(g,6));var d=this;let m="";for(;;){const p=Ne(d,u).g;d=q(d,p.j(u));let _=((d.g.length>0?d.g[0]:d.h)>>>0).toString(g);if(d=p,M(d))return _+m;for(;_.length<6;)_="0"+_;m=_+m}},i.i=function(g){return g<0?0:g<this.g.length?this.g[g]:this.h};function M(g){if(g.h!=0)return!1;for(let u=0;u<g.g.length;u++)if(g.g[u]!=0)return!1;return!0}function x(g){return g.h==-1}i.l=function(g){return g=q(this,g),x(g)?-1:M(g)?0:1};function N(g){const u=g.g.length,d=[];for(let m=0;m<u;m++)d[m]=~g.g[m];return new h(d,~g.h).add(O)}i.abs=function(){return x(this)?N(this):this},i.add=function(g){const u=Math.max(this.g.length,g.g.length),d=[];let m=0;for(let p=0;p<=u;p++){let _=m+(this.i(p)&65535)+(g.i(p)&65535),f=(_>>>16)+(this.i(p)>>>16)+(g.i(p)>>>16);m=f>>>16,_&=65535,f&=65535,d[p]=f<<16|_}return new h(d,d[d.length-1]&-2147483648?-1:0)};function q(g,u){return g.add(N(u))}i.j=function(g){if(M(this)||M(g))return b;if(x(this))return x(g)?N(this).j(N(g)):N(N(this).j(g));if(x(g))return N(this.j(N(g)));if(this.l(j)<0&&g.l(j)<0)return E(this.m()*g.m());const u=this.g.length+g.g.length,d=[];for(var m=0;m<2*u;m++)d[m]=0;for(m=0;m<this.g.length;m++)for(let p=0;p<g.g.length;p++){const _=this.i(m)>>>16,f=this.i(m)&65535,V=g.i(p)>>>16,Ee=g.i(p)&65535;d[2*m+2*p]+=f*Ee,se(d,2*m+2*p),d[2*m+2*p+1]+=_*Ee,se(d,2*m+2*p+1),d[2*m+2*p+1]+=f*V,se(d,2*m+2*p+1),d[2*m+2*p+2]+=_*V,se(d,2*m+2*p+2)}for(g=0;g<u;g++)d[g]=d[2*g+1]<<16|d[2*g];for(g=u;g<2*u;g++)d[g]=0;return new h(d,0)};function se(g,u){for(;(g[u]&65535)!=g[u];)g[u+1]+=g[u]>>>16,g[u]&=65535,u++}function oe(g,u){this.g=g,this.h=u}function Ne(g,u){if(M(u))throw Error("division by zero");if(M(g))return new oe(b,b);if(x(g))return u=Ne(N(g),u),new oe(N(u.g),N(u.h));if(x(u))return u=Ne(g,N(u)),new oe(N(u.g),u.h);if(g.g.length>30){if(x(g)||x(u))throw Error("slowDivide_ only works with positive integers.");for(var d=O,m=u;m.l(g)<=0;)d=ae(d),m=ae(m);var p=z(d,1),_=z(m,1);for(m=z(m,2),d=z(d,2);!M(m);){var f=_.add(m);f.l(g)<=0&&(p=p.add(d),_=f),m=z(m,1),d=z(d,1)}return u=q(g,p.j(u)),new oe(p,u)}for(p=b;g.l(u)>=0;){for(d=Math.max(1,Math.floor(g.m()/u.m())),m=Math.ceil(Math.log(d)/Math.LN2),m=m<=48?1:Math.pow(2,m-48),_=E(d),f=_.j(u);x(f)||f.l(g)>0;)d-=m,_=E(d),f=_.j(u);M(_)&&(_=O),p=p.add(_),g=q(g,f)}return new oe(p,g)}i.B=function(g){return Ne(this,g).h},i.and=function(g){const u=Math.max(this.g.length,g.g.length),d=[];for(let m=0;m<u;m++)d[m]=this.i(m)&g.i(m);return new h(d,this.h&g.h)},i.or=function(g){const u=Math.max(this.g.length,g.g.length),d=[];for(let m=0;m<u;m++)d[m]=this.i(m)|g.i(m);return new h(d,this.h|g.h)},i.xor=function(g){const u=Math.max(this.g.length,g.g.length),d=[];for(let m=0;m<u;m++)d[m]=this.i(m)^g.i(m);return new h(d,this.h^g.h)};function ae(g){const u=g.g.length+1,d=[];for(let m=0;m<u;m++)d[m]=g.i(m)<<1|g.i(m-1)>>>31;return new h(d,g.h)}function z(g,u){const d=u>>5;u%=32;const m=g.g.length-d,p=[];for(let _=0;_<m;_++)p[_]=u>0?g.i(_+d)>>>u|g.i(_+d+1)<<32-u:g.i(_+d);return new h(p,g.h)}s.prototype.digest=s.prototype.A,s.prototype.reset=s.prototype.u,s.prototype.update=s.prototype.v,Th=s,h.prototype.add=h.prototype.add,h.prototype.multiply=h.prototype.j,h.prototype.modulo=h.prototype.B,h.prototype.compare=h.prototype.l,h.prototype.toNumber=h.prototype.m,h.prototype.toString=h.prototype.toString,h.prototype.getBits=h.prototype.i,h.fromNumber=E,h.fromString=A,Eh=h}).apply(typeof Ir<"u"?Ir:typeof self<"u"?self:typeof window<"u"?window:{});var Nt=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var bh,Sh,Ah,Ch,Ph,kh,Rh,Oh;(function(){var i,e=Object.defineProperty;function n(t){t=[typeof globalThis=="object"&&globalThis,t,typeof window=="object"&&window,typeof self=="object"&&self,typeof Nt=="object"&&Nt];for(var r=0;r<t.length;++r){var o=t[r];if(o&&o.Math==Math)return o}throw Error("Cannot find global object")}var s=n(this);function a(t,r){if(r)e:{var o=s;t=t.split(".");for(var c=0;c<t.length-1;c++){var y=t[c];if(!(y in o))break e;o=o[y]}t=t[t.length-1],c=o[t],r=r(c),r!=c&&r!=null&&e(o,t,{configurable:!0,writable:!0,value:r})}}a("Symbol.dispose",function(t){return t||Symbol("Symbol.dispose")}),a("Array.prototype.values",function(t){return t||function(){return this[Symbol.iterator]()}}),a("Object.entries",function(t){return t||function(r){var o=[],c;for(c in r)Object.prototype.hasOwnProperty.call(r,c)&&o.push([c,r[c]]);return o}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var l=l||{},h=this||self;function I(t){var r=typeof t;return r=="object"&&t!=null||r=="function"}function w(t,r,o){return t.call.apply(t.bind,arguments)}function E(t,r,o){return E=w,E.apply(null,arguments)}function A(t,r){var o=Array.prototype.slice.call(arguments,1);return function(){var c=o.slice();return c.push.apply(c,arguments),t.apply(this,c)}}function b(t,r){function o(){}o.prototype=r.prototype,t.Z=r.prototype,t.prototype=new o,t.prototype.constructor=t,t.Ob=function(c,y,v){for(var T=Array(arguments.length-2),C=2;C<arguments.length;C++)T[C-2]=arguments[C];return r.prototype[y].apply(c,T)}}var O=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?t=>t&&AsyncContext.Snapshot.wrap(t):t=>t;function j(t){const r=t.length;if(r>0){const o=Array(r);for(let c=0;c<r;c++)o[c]=t[c];return o}return[]}function M(t,r){for(let c=1;c<arguments.length;c++){const y=arguments[c];var o=typeof y;if(o=o!="object"?o:y?Array.isArray(y)?"array":o:"null",o=="array"||o=="object"&&typeof y.length=="number"){o=t.length||0;const v=y.length||0;t.length=o+v;for(let T=0;T<v;T++)t[o+T]=y[T]}else t.push(y)}}class x{constructor(r,o){this.i=r,this.j=o,this.h=0,this.g=null}get(){let r;return this.h>0?(this.h--,r=this.g,this.g=r.next,r.next=null):r=this.i(),r}}function N(t){h.setTimeout(()=>{throw t},0)}function q(){var t=g;let r=null;return t.g&&(r=t.g,t.g=t.g.next,t.g||(t.h=null),r.next=null),r}class se{constructor(){this.h=this.g=null}add(r,o){const c=oe.get();c.set(r,o),this.h?this.h.next=c:this.g=c,this.h=c}}var oe=new x(()=>new Ne,t=>t.reset());class Ne{constructor(){this.next=this.g=this.h=null}set(r,o){this.h=r,this.g=o,this.next=null}reset(){this.next=this.g=this.h=null}}let ae,z=!1,g=new se,u=()=>{const t=Promise.resolve(void 0);ae=()=>{t.then(d)}};function d(){for(var t;t=q();){try{t.h.call(t.g)}catch(o){N(o)}var r=oe;r.j(t),r.h<100&&(r.h++,t.next=r.g,r.g=t)}z=!1}function m(){this.u=this.u,this.C=this.C}m.prototype.u=!1,m.prototype.dispose=function(){this.u||(this.u=!0,this.N())},m.prototype[Symbol.dispose]=function(){this.dispose()},m.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function p(t,r){this.type=t,this.g=this.target=r,this.defaultPrevented=!1}p.prototype.h=function(){this.defaultPrevented=!0};var _=(function(){if(!h.addEventListener||!Object.defineProperty)return!1;var t=!1,r=Object.defineProperty({},"passive",{get:function(){t=!0}});try{const o=()=>{};h.addEventListener("test",o,r),h.removeEventListener("test",o,r)}catch{}return t})();function f(t){return/^[\s\xa0]*$/.test(t)}function V(t,r){p.call(this,t?t.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,t&&this.init(t,r)}b(V,p),V.prototype.init=function(t,r){const o=this.type=t.type,c=t.changedTouches&&t.changedTouches.length?t.changedTouches[0]:null;this.target=t.target||t.srcElement,this.g=r,r=t.relatedTarget,r||(o=="mouseover"?r=t.fromElement:o=="mouseout"&&(r=t.toElement)),this.relatedTarget=r,c?(this.clientX=c.clientX!==void 0?c.clientX:c.pageX,this.clientY=c.clientY!==void 0?c.clientY:c.pageY,this.screenX=c.screenX||0,this.screenY=c.screenY||0):(this.clientX=t.clientX!==void 0?t.clientX:t.pageX,this.clientY=t.clientY!==void 0?t.clientY:t.pageY,this.screenX=t.screenX||0,this.screenY=t.screenY||0),this.button=t.button,this.key=t.key||"",this.ctrlKey=t.ctrlKey,this.altKey=t.altKey,this.shiftKey=t.shiftKey,this.metaKey=t.metaKey,this.pointerId=t.pointerId||0,this.pointerType=t.pointerType,this.state=t.state,this.i=t,t.defaultPrevented&&V.Z.h.call(this)},V.prototype.h=function(){V.Z.h.call(this);const t=this.i;t.preventDefault?t.preventDefault():t.returnValue=!1};var Ee="closure_listenable_"+(Math.random()*1e6|0),ps=0;function gs(t,r,o,c,y){this.listener=t,this.proxy=null,this.src=r,this.type=o,this.capture=!!c,this.ha=y,this.key=++ps,this.da=this.fa=!1}function yt(t){t.da=!0,t.listener=null,t.proxy=null,t.src=null,t.ha=null}function _t(t,r,o){for(const c in t)r.call(o,t[c],c,t)}function ms(t,r){for(const o in t)r.call(void 0,t[o],o,t)}function Kn(t){const r={};for(const o in t)r[o]=t[o];return r}const qn="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Jn(t,r){let o,c;for(let y=1;y<arguments.length;y++){c=arguments[y];for(o in c)t[o]=c[o];for(let v=0;v<qn.length;v++)o=qn[v],Object.prototype.hasOwnProperty.call(c,o)&&(t[o]=c[o])}}function vt(t){this.src=t,this.g={},this.h=0}vt.prototype.add=function(t,r,o,c,y){const v=t.toString();t=this.g[v],t||(t=this.g[v]=[],this.h++);const T=Qt(t,r,c,y);return T>-1?(r=t[T],o||(r.fa=!1)):(r=new gs(r,this.src,v,!!c,y),r.fa=o,t.push(r)),r};function Yt(t,r){const o=r.type;if(o in t.g){var c=t.g[o],y=Array.prototype.indexOf.call(c,r,void 0),v;(v=y>=0)&&Array.prototype.splice.call(c,y,1),v&&(yt(r),t.g[o].length==0&&(delete t.g[o],t.h--))}}function Qt(t,r,o,c){for(let y=0;y<t.length;++y){const v=t[y];if(!v.da&&v.listener==r&&v.capture==!!o&&v.ha==c)return y}return-1}var Zt="closure_lm_"+(Math.random()*1e6|0),en={};function Xn(t,r,o,c,y){if(Array.isArray(r)){for(let v=0;v<r.length;v++)Xn(t,r[v],o,c,y);return null}return o=Zn(o),t&&t[Ee]?t.J(r,o,I(c)?!!c.capture:!1,y):ys(t,r,o,!1,c,y)}function ys(t,r,o,c,y,v){if(!r)throw Error("Invalid event type");const T=I(y)?!!y.capture:!!y;let C=nn(t);if(C||(t[Zt]=C=new vt(t)),o=C.add(r,o,c,T,v),o.proxy)return o;if(c=_s(),o.proxy=c,c.src=t,c.listener=o,t.addEventListener)_||(y=T),y===void 0&&(y=!1),t.addEventListener(r.toString(),c,y);else if(t.attachEvent)t.attachEvent(Qn(r.toString()),c);else if(t.addListener&&t.removeListener)t.addListener(c);else throw Error("addEventListener and attachEvent are unavailable.");return o}function _s(){function t(o){return r.call(t.src,t.listener,o)}const r=vs;return t}function Yn(t,r,o,c,y){if(Array.isArray(r))for(var v=0;v<r.length;v++)Yn(t,r[v],o,c,y);else c=I(c)?!!c.capture:!!c,o=Zn(o),t&&t[Ee]?(t=t.i,v=String(r).toString(),v in t.g&&(r=t.g[v],o=Qt(r,o,c,y),o>-1&&(yt(r[o]),Array.prototype.splice.call(r,o,1),r.length==0&&(delete t.g[v],t.h--)))):t&&(t=nn(t))&&(r=t.g[r.toString()],t=-1,r&&(t=Qt(r,o,c,y)),(o=t>-1?r[t]:null)&&tn(o))}function tn(t){if(typeof t!="number"&&t&&!t.da){var r=t.src;if(r&&r[Ee])Yt(r.i,t);else{var o=t.type,c=t.proxy;r.removeEventListener?r.removeEventListener(o,c,t.capture):r.detachEvent?r.detachEvent(Qn(o),c):r.addListener&&r.removeListener&&r.removeListener(c),(o=nn(r))?(Yt(o,t),o.h==0&&(o.src=null,r[Zt]=null)):yt(t)}}}function Qn(t){return t in en?en[t]:en[t]="on"+t}function vs(t,r){if(t.da)t=!0;else{r=new V(r,this);const o=t.listener,c=t.ha||t.src;t.fa&&tn(t),t=o.call(c,r)}return t}function nn(t){return t=t[Zt],t instanceof vt?t:null}var rn="__closure_events_fn_"+(Math.random()*1e9>>>0);function Zn(t){return typeof t=="function"?t:(t[rn]||(t[rn]=function(r){return t.handleEvent(r)}),t[rn])}function B(){m.call(this),this.i=new vt(this),this.M=this,this.G=null}b(B,m),B.prototype[Ee]=!0,B.prototype.removeEventListener=function(t,r,o,c){Yn(this,t,r,o,c)};function F(t,r){var o,c=t.G;if(c)for(o=[];c;c=c.G)o.push(c);if(t=t.M,c=r.type||r,typeof r=="string")r=new p(r,t);else if(r instanceof p)r.target=r.target||t;else{var y=r;r=new p(c,t),Jn(r,y)}y=!0;let v,T;if(o)for(T=o.length-1;T>=0;T--)v=r.g=o[T],y=wt(v,c,!0,r)&&y;if(v=r.g=t,y=wt(v,c,!0,r)&&y,y=wt(v,c,!1,r)&&y,o)for(T=0;T<o.length;T++)v=r.g=o[T],y=wt(v,c,!1,r)&&y}B.prototype.N=function(){if(B.Z.N.call(this),this.i){var t=this.i;for(const r in t.g){const o=t.g[r];for(let c=0;c<o.length;c++)yt(o[c]);delete t.g[r],t.h--}}this.G=null},B.prototype.J=function(t,r,o,c){return this.i.add(String(t),r,!1,o,c)},B.prototype.K=function(t,r,o,c){return this.i.add(String(t),r,!0,o,c)};function wt(t,r,o,c){if(r=t.i.g[String(r)],!r)return!0;r=r.concat();let y=!0;for(let v=0;v<r.length;++v){const T=r[v];if(T&&!T.da&&T.capture==o){const C=T.listener,L=T.ha||T.src;T.fa&&Yt(t.i,T),y=C.call(L,c)!==!1&&y}}return y&&!c.defaultPrevented}function ws(t,r){if(typeof t!="function")if(t&&typeof t.handleEvent=="function")t=E(t.handleEvent,t);else throw Error("Invalid listener argument");return Number(r)>2147483647?-1:h.setTimeout(t,r||0)}function ei(t){t.g=ws(()=>{t.g=null,t.i&&(t.i=!1,ei(t))},t.l);const r=t.h;t.h=null,t.m.apply(null,r)}class Is extends m{constructor(r,o){super(),this.m=r,this.l=o,this.h=null,this.i=!1,this.g=null}j(r){this.h=arguments,this.g?this.i=!0:ei(this)}N(){super.N(),this.g&&(h.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function ze(t){m.call(this),this.h=t,this.g={}}b(ze,m);var ti=[];function ni(t){_t(t.g,function(r,o){this.g.hasOwnProperty(o)&&tn(r)},t),t.g={}}ze.prototype.N=function(){ze.Z.N.call(this),ni(this)},ze.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var sn=h.JSON.stringify,Es=h.JSON.parse,Ts=class{stringify(t){return h.JSON.stringify(t,void 0)}parse(t){return h.JSON.parse(t,void 0)}};function ii(){}function ri(){}var Ge={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function on(){p.call(this,"d")}b(on,p);function an(){p.call(this,"c")}b(an,p);var Te={},si=null;function It(){return si=si||new B}Te.Ia="serverreachability";function oi(t){p.call(this,Te.Ia,t)}b(oi,p);function Ke(t){const r=It();F(r,new oi(r))}Te.STAT_EVENT="statevent";function ai(t,r){p.call(this,Te.STAT_EVENT,t),this.stat=r}b(ai,p);function H(t){const r=It();F(r,new ai(r,t))}Te.Ja="timingevent";function ci(t,r){p.call(this,Te.Ja,t),this.size=r}b(ci,p);function qe(t,r){if(typeof t!="function")throw Error("Fn must not be null and must be a function");return h.setTimeout(function(){t()},r)}function Je(){this.g=!0}Je.prototype.ua=function(){this.g=!1};function bs(t,r,o,c,y,v){t.info(function(){if(t.g)if(v){var T="",C=v.split("&");for(let P=0;P<C.length;P++){var L=C[P].split("=");if(L.length>1){const U=L[0];L=L[1];const X=U.split("_");T=X.length>=2&&X[1]=="type"?T+(U+"="+L+"&"):T+(U+"=redacted&")}}}else T=null;else T=v;return"XMLHTTP REQ ("+c+") [attempt "+y+"]: "+r+`
`+o+`
`+T})}function Ss(t,r,o,c,y,v,T){t.info(function(){return"XMLHTTP RESP ("+c+") [ attempt "+y+"]: "+r+`
`+o+`
`+v+" "+T})}function Me(t,r,o,c){t.info(function(){return"XMLHTTP TEXT ("+r+"): "+Cs(t,o)+(c?" "+c:"")})}function As(t,r){t.info(function(){return"TIMEOUT: "+r})}Je.prototype.info=function(){};function Cs(t,r){if(!t.g)return r;if(!r)return null;try{const v=JSON.parse(r);if(v){for(t=0;t<v.length;t++)if(Array.isArray(v[t])){var o=v[t];if(!(o.length<2)){var c=o[1];if(Array.isArray(c)&&!(c.length<1)){var y=c[0];if(y!="noop"&&y!="stop"&&y!="close")for(let T=1;T<c.length;T++)c[T]=""}}}}return sn(v)}catch{return r}}var Et={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},hi={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},li;function cn(){}b(cn,ii),cn.prototype.g=function(){return new XMLHttpRequest},li=new cn;function Xe(t){return encodeURIComponent(String(t))}function Ps(t){var r=1;t=t.split(":");const o=[];for(;r>0&&t.length;)o.push(t.shift()),r--;return t.length&&o.push(t.join(":")),o}function ce(t,r,o,c){this.j=t,this.i=r,this.l=o,this.S=c||1,this.V=new ze(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new ui}function ui(){this.i=null,this.g="",this.h=!1}var fi={},hn={};function ln(t,r,o){t.M=1,t.A=bt(J(r)),t.u=o,t.R=!0,di(t,null)}function di(t,r){t.F=Date.now(),Tt(t),t.B=J(t.A);var o=t.B,c=t.S;Array.isArray(c)||(c=[String(c)]),Ai(o.i,"t",c),t.C=0,o=t.j.L,t.h=new ui,t.g=Wi(t.j,o?r:null,!t.u),t.P>0&&(t.O=new Is(E(t.Y,t,t.g),t.P)),r=t.V,o=t.g,c=t.ba;var y="readystatechange";Array.isArray(y)||(y&&(ti[0]=y.toString()),y=ti);for(let v=0;v<y.length;v++){const T=Xn(o,y[v],c||r.handleEvent,!1,r.h||r);if(!T)break;r.g[T.key]=T}r=t.J?Kn(t.J):{},t.u?(t.v||(t.v="POST"),r["Content-Type"]="application/x-www-form-urlencoded",t.g.ea(t.B,t.v,t.u,r)):(t.v="GET",t.g.ea(t.B,t.v,null,r)),Ke(),bs(t.i,t.v,t.B,t.l,t.S,t.u)}ce.prototype.ba=function(t){t=t.target;const r=this.O;r&&ue(t)==3?r.j():this.Y(t)},ce.prototype.Y=function(t){try{if(t==this.g)e:{const C=ue(this.g),L=this.g.ya(),P=this.g.ca();if(!(C<3)&&(C!=3||this.g&&(this.h.h||this.g.la()||Ni(this.g)))){this.K||C!=4||L==7||(L==8||P<=0?Ke(3):Ke(2)),un(this);var r=this.g.ca();this.X=r;var o=ks(this);if(this.o=r==200,Ss(this.i,this.v,this.B,this.l,this.S,C,r),this.o){if(this.U&&!this.L){t:{if(this.g){var c,y=this.g;if((c=y.g?y.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!f(c)){var v=c;break t}}v=null}if(t=v)Me(this.i,this.l,t,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,fn(this,t);else{this.o=!1,this.m=3,H(12),be(this),Ye(this);break e}}if(this.R){t=!0;let U;for(;!this.K&&this.C<o.length;)if(U=Rs(this,o),U==hn){C==4&&(this.m=4,H(14),t=!1),Me(this.i,this.l,null,"[Incomplete Response]");break}else if(U==fi){this.m=4,H(15),Me(this.i,this.l,o,"[Invalid Chunk]"),t=!1;break}else Me(this.i,this.l,U,null),fn(this,U);if(pi(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),C!=4||o.length!=0||this.h.h||(this.m=1,H(16),t=!1),this.o=this.o&&t,!t)Me(this.i,this.l,o,"[Invalid Chunked Response]"),be(this),Ye(this);else if(o.length>0&&!this.W){this.W=!0;var T=this.j;T.g==this&&T.aa&&!T.P&&(T.j.info("Great, no buffering proxy detected. Bytes received: "+o.length),wn(T),T.P=!0,H(11))}}else Me(this.i,this.l,o,null),fn(this,o);C==4&&be(this),this.o&&!this.K&&(C==4?Fi(this.j,this):(this.o=!1,Tt(this)))}else Ws(this.g),r==400&&o.indexOf("Unknown SID")>0?(this.m=3,H(12)):(this.m=0,H(13)),be(this),Ye(this)}}}catch{}finally{}};function ks(t){if(!pi(t))return t.g.la();const r=Ni(t.g);if(r==="")return"";let o="";const c=r.length,y=ue(t.g)==4;if(!t.h.i){if(typeof TextDecoder>"u")return be(t),Ye(t),"";t.h.i=new h.TextDecoder}for(let v=0;v<c;v++)t.h.h=!0,o+=t.h.i.decode(r[v],{stream:!(y&&v==c-1)});return r.length=0,t.h.g+=o,t.C=0,t.h.g}function pi(t){return t.g?t.v=="GET"&&t.M!=2&&t.j.Aa:!1}function Rs(t,r){var o=t.C,c=r.indexOf(`
`,o);return c==-1?hn:(o=Number(r.substring(o,c)),isNaN(o)?fi:(c+=1,c+o>r.length?hn:(r=r.slice(c,c+o),t.C=c+o,r)))}ce.prototype.cancel=function(){this.K=!0,be(this)};function Tt(t){t.T=Date.now()+t.H,gi(t,t.H)}function gi(t,r){if(t.D!=null)throw Error("WatchDog timer not null");t.D=qe(E(t.aa,t),r)}function un(t){t.D&&(h.clearTimeout(t.D),t.D=null)}ce.prototype.aa=function(){this.D=null;const t=Date.now();t-this.T>=0?(As(this.i,this.B),this.M!=2&&(Ke(),H(17)),be(this),this.m=2,Ye(this)):gi(this,this.T-t)};function Ye(t){t.j.I==0||t.K||Fi(t.j,t)}function be(t){un(t);var r=t.O;r&&typeof r.dispose=="function"&&r.dispose(),t.O=null,ni(t.V),t.g&&(r=t.g,t.g=null,r.abort(),r.dispose())}function fn(t,r){try{var o=t.j;if(o.I!=0&&(o.g==t||dn(o.h,t))){if(!t.L&&dn(o.h,t)&&o.I==3){try{var c=o.Ba.g.parse(r)}catch{c=null}if(Array.isArray(c)&&c.length==3){var y=c;if(y[0]==0){e:if(!o.v){if(o.g)if(o.g.F+3e3<t.F)kt(o),Ct(o);else break e;vn(o),H(18)}}else o.xa=y[1],0<o.xa-o.K&&y[2]<37500&&o.F&&o.A==0&&!o.C&&(o.C=qe(E(o.Va,o),6e3));_i(o.h)<=1&&o.ta&&(o.ta=void 0)}else Ae(o,11)}else if((t.L||o.g==t)&&kt(o),!f(r))for(y=o.Ba.g.parse(r),r=0;r<y.length;r++){let P=y[r];const U=P[0];if(!(U<=o.K))if(o.K=U,P=P[1],o.I==2)if(P[0]=="c"){o.M=P[1],o.ba=P[2];const X=P[3];X!=null&&(o.ka=X,o.j.info("VER="+o.ka));const Ce=P[4];Ce!=null&&(o.za=Ce,o.j.info("SVER="+o.za));const fe=P[5];fe!=null&&typeof fe=="number"&&fe>0&&(c=1.5*fe,o.O=c,o.j.info("backChannelRequestTimeoutMs_="+c)),c=o;const de=t.g;if(de){const Ot=de.g?de.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Ot){var v=c.h;v.g||Ot.indexOf("spdy")==-1&&Ot.indexOf("quic")==-1&&Ot.indexOf("h2")==-1||(v.j=v.l,v.g=new Set,v.h&&(pn(v,v.h),v.h=null))}if(c.G){const In=de.g?de.g.getResponseHeader("X-HTTP-Session-Id"):null;In&&(c.wa=In,R(c.J,c.G,In))}}o.I=3,o.l&&o.l.ra(),o.aa&&(o.T=Date.now()-t.F,o.j.info("Handshake RTT: "+o.T+"ms")),c=o;var T=t;if(c.na=Vi(c,c.L?c.ba:null,c.W),T.L){vi(c.h,T);var C=T,L=c.O;L&&(C.H=L),C.D&&(un(C),Tt(C)),c.g=T}else ji(c);o.i.length>0&&Pt(o)}else P[0]!="stop"&&P[0]!="close"||Ae(o,7);else o.I==3&&(P[0]=="stop"||P[0]=="close"?P[0]=="stop"?Ae(o,7):_n(o):P[0]!="noop"&&o.l&&o.l.qa(P),o.A=0)}}Ke(4)}catch{}}var Os=class{constructor(t,r){this.g=t,this.map=r}};function mi(t){this.l=t||10,h.PerformanceNavigationTiming?(t=h.performance.getEntriesByType("navigation"),t=t.length>0&&(t[0].nextHopProtocol=="hq"||t[0].nextHopProtocol=="h2")):t=!!(h.chrome&&h.chrome.loadTimes&&h.chrome.loadTimes()&&h.chrome.loadTimes().wasFetchedViaSpdy),this.j=t?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function yi(t){return t.h?!0:t.g?t.g.size>=t.j:!1}function _i(t){return t.h?1:t.g?t.g.size:0}function dn(t,r){return t.h?t.h==r:t.g?t.g.has(r):!1}function pn(t,r){t.g?t.g.add(r):t.h=r}function vi(t,r){t.h&&t.h==r?t.h=null:t.g&&t.g.has(r)&&t.g.delete(r)}mi.prototype.cancel=function(){if(this.i=wi(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const t of this.g.values())t.cancel();this.g.clear()}};function wi(t){if(t.h!=null)return t.i.concat(t.h.G);if(t.g!=null&&t.g.size!==0){let r=t.i;for(const o of t.g.values())r=r.concat(o.G);return r}return j(t.i)}var Ii=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Ds(t,r){if(t){t=t.split("&");for(let o=0;o<t.length;o++){const c=t[o].indexOf("=");let y,v=null;c>=0?(y=t[o].substring(0,c),v=t[o].substring(c+1)):y=t[o],r(y,v?decodeURIComponent(v.replace(/\+/g," ")):"")}}}function he(t){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let r;t instanceof he?(this.l=t.l,Qe(this,t.j),this.o=t.o,this.g=t.g,Ze(this,t.u),this.h=t.h,gn(this,Ci(t.i)),this.m=t.m):t&&(r=String(t).match(Ii))?(this.l=!1,Qe(this,r[1]||"",!0),this.o=et(r[2]||""),this.g=et(r[3]||"",!0),Ze(this,r[4]),this.h=et(r[5]||"",!0),gn(this,r[6]||"",!0),this.m=et(r[7]||"")):(this.l=!1,this.i=new nt(null,this.l))}he.prototype.toString=function(){const t=[];var r=this.j;r&&t.push(tt(r,Ei,!0),":");var o=this.g;return(o||r=="file")&&(t.push("//"),(r=this.o)&&t.push(tt(r,Ei,!0),"@"),t.push(Xe(o).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o=this.u,o!=null&&t.push(":",String(o))),(o=this.h)&&(this.g&&o.charAt(0)!="/"&&t.push("/"),t.push(tt(o,o.charAt(0)=="/"?Ls:Ms,!0))),(o=this.i.toString())&&t.push("?",o),(o=this.m)&&t.push("#",tt(o,xs)),t.join("")},he.prototype.resolve=function(t){const r=J(this);let o=!!t.j;o?Qe(r,t.j):o=!!t.o,o?r.o=t.o:o=!!t.g,o?r.g=t.g:o=t.u!=null;var c=t.h;if(o)Ze(r,t.u);else if(o=!!t.h){if(c.charAt(0)!="/")if(this.g&&!this.h)c="/"+c;else{var y=r.h.lastIndexOf("/");y!=-1&&(c=r.h.slice(0,y+1)+c)}if(y=c,y==".."||y==".")c="";else if(y.indexOf("./")!=-1||y.indexOf("/.")!=-1){c=y.lastIndexOf("/",0)==0,y=y.split("/");const v=[];for(let T=0;T<y.length;){const C=y[T++];C=="."?c&&T==y.length&&v.push(""):C==".."?((v.length>1||v.length==1&&v[0]!="")&&v.pop(),c&&T==y.length&&v.push("")):(v.push(C),c=!0)}c=v.join("/")}else c=y}return o?r.h=c:o=t.i.toString()!=="",o?gn(r,Ci(t.i)):o=!!t.m,o&&(r.m=t.m),r};function J(t){return new he(t)}function Qe(t,r,o){t.j=o?et(r,!0):r,t.j&&(t.j=t.j.replace(/:$/,""))}function Ze(t,r){if(r){if(r=Number(r),isNaN(r)||r<0)throw Error("Bad port number "+r);t.u=r}else t.u=null}function gn(t,r,o){r instanceof nt?(t.i=r,js(t.i,t.l)):(o||(r=tt(r,Us)),t.i=new nt(r,t.l))}function R(t,r,o){t.i.set(r,o)}function bt(t){return R(t,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),t}function et(t,r){return t?r?decodeURI(t.replace(/%25/g,"%2525")):decodeURIComponent(t):""}function tt(t,r,o){return typeof t=="string"?(t=encodeURI(t).replace(r,Ns),o&&(t=t.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),t):null}function Ns(t){return t=t.charCodeAt(0),"%"+(t>>4&15).toString(16)+(t&15).toString(16)}var Ei=/[#\/\?@]/g,Ms=/[#\?:]/g,Ls=/[#\?]/g,Us=/[#\?@]/g,xs=/#/g;function nt(t,r){this.h=this.g=null,this.i=t||null,this.j=!!r}function Se(t){t.g||(t.g=new Map,t.h=0,t.i&&Ds(t.i,function(r,o){t.add(decodeURIComponent(r.replace(/\+/g," ")),o)}))}i=nt.prototype,i.add=function(t,r){Se(this),this.i=null,t=Le(this,t);let o=this.g.get(t);return o||this.g.set(t,o=[]),o.push(r),this.h+=1,this};function Ti(t,r){Se(t),r=Le(t,r),t.g.has(r)&&(t.i=null,t.h-=t.g.get(r).length,t.g.delete(r))}function bi(t,r){return Se(t),r=Le(t,r),t.g.has(r)}i.forEach=function(t,r){Se(this),this.g.forEach(function(o,c){o.forEach(function(y){t.call(r,y,c,this)},this)},this)};function Si(t,r){Se(t);let o=[];if(typeof r=="string")bi(t,r)&&(o=o.concat(t.g.get(Le(t,r))));else for(t=Array.from(t.g.values()),r=0;r<t.length;r++)o=o.concat(t[r]);return o}i.set=function(t,r){return Se(this),this.i=null,t=Le(this,t),bi(this,t)&&(this.h-=this.g.get(t).length),this.g.set(t,[r]),this.h+=1,this},i.get=function(t,r){return t?(t=Si(this,t),t.length>0?String(t[0]):r):r};function Ai(t,r,o){Ti(t,r),o.length>0&&(t.i=null,t.g.set(Le(t,r),j(o)),t.h+=o.length)}i.toString=function(){if(this.i)return this.i;if(!this.g)return"";const t=[],r=Array.from(this.g.keys());for(let c=0;c<r.length;c++){var o=r[c];const y=Xe(o);o=Si(this,o);for(let v=0;v<o.length;v++){let T=y;o[v]!==""&&(T+="="+Xe(o[v])),t.push(T)}}return this.i=t.join("&")};function Ci(t){const r=new nt;return r.i=t.i,t.g&&(r.g=new Map(t.g),r.h=t.h),r}function Le(t,r){return r=String(r),t.j&&(r=r.toLowerCase()),r}function js(t,r){r&&!t.j&&(Se(t),t.i=null,t.g.forEach(function(o,c){const y=c.toLowerCase();c!=y&&(Ti(this,c),Ai(this,y,o))},t)),t.j=r}function Bs(t,r){const o=new Je;if(h.Image){const c=new Image;c.onload=A(le,o,"TestLoadImage: loaded",!0,r,c),c.onerror=A(le,o,"TestLoadImage: error",!1,r,c),c.onabort=A(le,o,"TestLoadImage: abort",!1,r,c),c.ontimeout=A(le,o,"TestLoadImage: timeout",!1,r,c),h.setTimeout(function(){c.ontimeout&&c.ontimeout()},1e4),c.src=t}else r(!1)}function Fs(t,r){const o=new Je,c=new AbortController,y=setTimeout(()=>{c.abort(),le(o,"TestPingServer: timeout",!1,r)},1e4);fetch(t,{signal:c.signal}).then(v=>{clearTimeout(y),v.ok?le(o,"TestPingServer: ok",!0,r):le(o,"TestPingServer: server error",!1,r)}).catch(()=>{clearTimeout(y),le(o,"TestPingServer: error",!1,r)})}function le(t,r,o,c,y){try{y&&(y.onload=null,y.onerror=null,y.onabort=null,y.ontimeout=null),c(o)}catch{}}function Hs(){this.g=new Ts}function mn(t){this.i=t.Sb||null,this.h=t.ab||!1}b(mn,ii),mn.prototype.g=function(){return new St(this.i,this.h)};function St(t,r){B.call(this),this.H=t,this.o=r,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}b(St,B),i=St.prototype,i.open=function(t,r){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=t,this.D=r,this.readyState=1,rt(this)},i.send=function(t){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const r={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};t&&(r.body=t),(this.H||h).fetch(new Request(this.D,r)).then(this.Pa.bind(this),this.ga.bind(this))},i.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,it(this)),this.readyState=0},i.Pa=function(t){if(this.g&&(this.l=t,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=t.headers,this.readyState=2,rt(this)),this.g&&(this.readyState=3,rt(this),this.g)))if(this.responseType==="arraybuffer")t.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof h.ReadableStream<"u"&&"body"in t){if(this.j=t.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Pi(this)}else t.text().then(this.Oa.bind(this),this.ga.bind(this))};function Pi(t){t.j.read().then(t.Ma.bind(t)).catch(t.ga.bind(t))}i.Ma=function(t){if(this.g){if(this.o&&t.value)this.response.push(t.value);else if(!this.o){var r=t.value?t.value:new Uint8Array(0);(r=this.B.decode(r,{stream:!t.done}))&&(this.response=this.responseText+=r)}t.done?it(this):rt(this),this.readyState==3&&Pi(this)}},i.Oa=function(t){this.g&&(this.response=this.responseText=t,it(this))},i.Na=function(t){this.g&&(this.response=t,it(this))},i.ga=function(){this.g&&it(this)};function it(t){t.readyState=4,t.l=null,t.j=null,t.B=null,rt(t)}i.setRequestHeader=function(t,r){this.A.append(t,r)},i.getResponseHeader=function(t){return this.h&&this.h.get(t.toLowerCase())||""},i.getAllResponseHeaders=function(){if(!this.h)return"";const t=[],r=this.h.entries();for(var o=r.next();!o.done;)o=o.value,t.push(o[0]+": "+o[1]),o=r.next();return t.join(`\r
`)};function rt(t){t.onreadystatechange&&t.onreadystatechange.call(t)}Object.defineProperty(St.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(t){this.m=t?"include":"same-origin"}});function ki(t){let r="";return _t(t,function(o,c){r+=c,r+=":",r+=o,r+=`\r
`}),r}function yn(t,r,o){e:{for(c in o){var c=!1;break e}c=!0}c||(o=ki(o),typeof t=="string"?o!=null&&Xe(o):R(t,r,o))}function D(t){B.call(this),this.headers=new Map,this.L=t||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}b(D,B);var $s=/^https?$/i,Vs=["POST","PUT"];i=D.prototype,i.Fa=function(t){this.H=t},i.ea=function(t,r,o,c){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+t);r=r?r.toUpperCase():"GET",this.D=t,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():li.g(),this.g.onreadystatechange=O(E(this.Ca,this));try{this.B=!0,this.g.open(r,String(t),!0),this.B=!1}catch(v){Ri(this,v);return}if(t=o||"",o=new Map(this.headers),c)if(Object.getPrototypeOf(c)===Object.prototype)for(var y in c)o.set(y,c[y]);else if(typeof c.keys=="function"&&typeof c.get=="function")for(const v of c.keys())o.set(v,c.get(v));else throw Error("Unknown input type for opt_headers: "+String(c));c=Array.from(o.keys()).find(v=>v.toLowerCase()=="content-type"),y=h.FormData&&t instanceof h.FormData,!(Array.prototype.indexOf.call(Vs,r,void 0)>=0)||c||y||o.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[v,T]of o)this.g.setRequestHeader(v,T);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(t),this.v=!1}catch(v){Ri(this,v)}};function Ri(t,r){t.h=!1,t.g&&(t.j=!0,t.g.abort(),t.j=!1),t.l=r,t.o=5,Oi(t),At(t)}function Oi(t){t.A||(t.A=!0,F(t,"complete"),F(t,"error"))}i.abort=function(t){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=t||7,F(this,"complete"),F(this,"abort"),At(this))},i.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),At(this,!0)),D.Z.N.call(this)},i.Ca=function(){this.u||(this.B||this.v||this.j?Di(this):this.Xa())},i.Xa=function(){Di(this)};function Di(t){if(t.h&&typeof l<"u"){if(t.v&&ue(t)==4)setTimeout(t.Ca.bind(t),0);else if(F(t,"readystatechange"),ue(t)==4){t.h=!1;try{const v=t.ca();e:switch(v){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var r=!0;break e;default:r=!1}var o;if(!(o=r)){var c;if(c=v===0){let T=String(t.D).match(Ii)[1]||null;!T&&h.self&&h.self.location&&(T=h.self.location.protocol.slice(0,-1)),c=!$s.test(T?T.toLowerCase():"")}o=c}if(o)F(t,"complete"),F(t,"success");else{t.o=6;try{var y=ue(t)>2?t.g.statusText:""}catch{y=""}t.l=y+" ["+t.ca()+"]",Oi(t)}}finally{At(t)}}}}function At(t,r){if(t.g){t.m&&(clearTimeout(t.m),t.m=null);const o=t.g;t.g=null,r||F(t,"ready");try{o.onreadystatechange=null}catch{}}}i.isActive=function(){return!!this.g};function ue(t){return t.g?t.g.readyState:0}i.ca=function(){try{return ue(this)>2?this.g.status:-1}catch{return-1}},i.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},i.La=function(t){if(this.g){var r=this.g.responseText;return t&&r.indexOf(t)==0&&(r=r.substring(t.length)),Es(r)}};function Ni(t){try{if(!t.g)return null;if("response"in t.g)return t.g.response;switch(t.F){case"":case"text":return t.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in t.g)return t.g.mozResponseArrayBuffer}return null}catch{return null}}function Ws(t){const r={};t=(t.g&&ue(t)>=2&&t.g.getAllResponseHeaders()||"").split(`\r
`);for(let c=0;c<t.length;c++){if(f(t[c]))continue;var o=Ps(t[c]);const y=o[0];if(o=o[1],typeof o!="string")continue;o=o.trim();const v=r[y]||[];r[y]=v,v.push(o)}ms(r,function(c){return c.join(", ")})}i.ya=function(){return this.o},i.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function st(t,r,o){return o&&o.internalChannelParams&&o.internalChannelParams[t]||r}function Mi(t){this.za=0,this.i=[],this.j=new Je,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=st("failFast",!1,t),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=st("baseRetryDelayMs",5e3,t),this.Za=st("retryDelaySeedMs",1e4,t),this.Ta=st("forwardChannelMaxRetries",2,t),this.va=st("forwardChannelRequestTimeoutMs",2e4,t),this.ma=t&&t.xmlHttpFactory||void 0,this.Ua=t&&t.Rb||void 0,this.Aa=t&&t.useFetchStreams||!1,this.O=void 0,this.L=t&&t.supportsCrossDomainXhr||!1,this.M="",this.h=new mi(t&&t.concurrentRequestLimit),this.Ba=new Hs,this.S=t&&t.fastHandshake||!1,this.R=t&&t.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=t&&t.Pb||!1,t&&t.ua&&this.j.ua(),t&&t.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&t&&t.detectBufferingProxy||!1,this.ia=void 0,t&&t.longPollingTimeout&&t.longPollingTimeout>0&&(this.ia=t.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}i=Mi.prototype,i.ka=8,i.I=1,i.connect=function(t,r,o,c){H(0),this.W=t,this.H=r||{},o&&c!==void 0&&(this.H.OSID=o,this.H.OAID=c),this.F=this.X,this.J=Vi(this,null,this.W),Pt(this)};function _n(t){if(Li(t),t.I==3){var r=t.V++,o=J(t.J);if(R(o,"SID",t.M),R(o,"RID",r),R(o,"TYPE","terminate"),ot(t,o),r=new ce(t,t.j,r),r.M=2,r.A=bt(J(o)),o=!1,h.navigator&&h.navigator.sendBeacon)try{o=h.navigator.sendBeacon(r.A.toString(),"")}catch{}!o&&h.Image&&(new Image().src=r.A,o=!0),o||(r.g=Wi(r.j,null),r.g.ea(r.A)),r.F=Date.now(),Tt(r)}$i(t)}function Ct(t){t.g&&(wn(t),t.g.cancel(),t.g=null)}function Li(t){Ct(t),t.v&&(h.clearTimeout(t.v),t.v=null),kt(t),t.h.cancel(),t.m&&(typeof t.m=="number"&&h.clearTimeout(t.m),t.m=null)}function Pt(t){if(!yi(t.h)&&!t.m){t.m=!0;var r=t.Ea;ae||u(),z||(ae(),z=!0),g.add(r,t),t.D=0}}function zs(t,r){return _i(t.h)>=t.h.j-(t.m?1:0)?!1:t.m?(t.i=r.G.concat(t.i),!0):t.I==1||t.I==2||t.D>=(t.Sa?0:t.Ta)?!1:(t.m=qe(E(t.Ea,t,r),Hi(t,t.D)),t.D++,!0)}i.Ea=function(t){if(this.m)if(this.m=null,this.I==1){if(!t){this.V=Math.floor(Math.random()*1e5),t=this.V++;const y=new ce(this,this.j,t);let v=this.o;if(this.U&&(v?(v=Kn(v),Jn(v,this.U)):v=this.U),this.u!==null||this.R||(y.J=v,v=null),this.S)e:{for(var r=0,o=0;o<this.i.length;o++){t:{var c=this.i[o];if("__data__"in c.map&&(c=c.map.__data__,typeof c=="string")){c=c.length;break t}c=void 0}if(c===void 0)break;if(r+=c,r>4096){r=o;break e}if(r===4096||o===this.i.length-1){r=o+1;break e}}r=1e3}else r=1e3;r=xi(this,y,r),o=J(this.J),R(o,"RID",t),R(o,"CVER",22),this.G&&R(o,"X-HTTP-Session-Id",this.G),ot(this,o),v&&(this.R?r="headers="+Xe(ki(v))+"&"+r:this.u&&yn(o,this.u,v)),pn(this.h,y),this.Ra&&R(o,"TYPE","init"),this.S?(R(o,"$req",r),R(o,"SID","null"),y.U=!0,ln(y,o,null)):ln(y,o,r),this.I=2}}else this.I==3&&(t?Ui(this,t):this.i.length==0||yi(this.h)||Ui(this))};function Ui(t,r){var o;r?o=r.l:o=t.V++;const c=J(t.J);R(c,"SID",t.M),R(c,"RID",o),R(c,"AID",t.K),ot(t,c),t.u&&t.o&&yn(c,t.u,t.o),o=new ce(t,t.j,o,t.D+1),t.u===null&&(o.J=t.o),r&&(t.i=r.G.concat(t.i)),r=xi(t,o,1e3),o.H=Math.round(t.va*.5)+Math.round(t.va*.5*Math.random()),pn(t.h,o),ln(o,c,r)}function ot(t,r){t.H&&_t(t.H,function(o,c){R(r,c,o)}),t.l&&_t({},function(o,c){R(r,c,o)})}function xi(t,r,o){o=Math.min(t.i.length,o);const c=t.l?E(t.l.Ka,t.l,t):null;e:{var y=t.i;let C=-1;for(;;){const L=["count="+o];C==-1?o>0?(C=y[0].g,L.push("ofs="+C)):C=0:L.push("ofs="+C);let P=!0;for(let U=0;U<o;U++){var v=y[U].g;const X=y[U].map;if(v-=C,v<0)C=Math.max(0,y[U].g-100),P=!1;else try{v="req"+v+"_"||"";try{var T=X instanceof Map?X:Object.entries(X);for(const[Ce,fe]of T){let de=fe;I(fe)&&(de=sn(fe)),L.push(v+Ce+"="+encodeURIComponent(de))}}catch(Ce){throw L.push(v+"type="+encodeURIComponent("_badmap")),Ce}}catch{c&&c(X)}}if(P){T=L.join("&");break e}}T=void 0}return t=t.i.splice(0,o),r.G=t,T}function ji(t){if(!t.g&&!t.v){t.Y=1;var r=t.Da;ae||u(),z||(ae(),z=!0),g.add(r,t),t.A=0}}function vn(t){return t.g||t.v||t.A>=3?!1:(t.Y++,t.v=qe(E(t.Da,t),Hi(t,t.A)),t.A++,!0)}i.Da=function(){if(this.v=null,Bi(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var t=4*this.T;this.j.info("BP detection timer enabled: "+t),this.B=qe(E(this.Wa,this),t)}},i.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,H(10),Ct(this),Bi(this))};function wn(t){t.B!=null&&(h.clearTimeout(t.B),t.B=null)}function Bi(t){t.g=new ce(t,t.j,"rpc",t.Y),t.u===null&&(t.g.J=t.o),t.g.P=0;var r=J(t.na);R(r,"RID","rpc"),R(r,"SID",t.M),R(r,"AID",t.K),R(r,"CI",t.F?"0":"1"),!t.F&&t.ia&&R(r,"TO",t.ia),R(r,"TYPE","xmlhttp"),ot(t,r),t.u&&t.o&&yn(r,t.u,t.o),t.O&&(t.g.H=t.O);var o=t.g;t=t.ba,o.M=1,o.A=bt(J(r)),o.u=null,o.R=!0,di(o,t)}i.Va=function(){this.C!=null&&(this.C=null,Ct(this),vn(this),H(19))};function kt(t){t.C!=null&&(h.clearTimeout(t.C),t.C=null)}function Fi(t,r){var o=null;if(t.g==r){kt(t),wn(t),t.g=null;var c=2}else if(dn(t.h,r))o=r.G,vi(t.h,r),c=1;else return;if(t.I!=0){if(r.o)if(c==1){o=r.u?r.u.length:0,r=Date.now()-r.F;var y=t.D;c=It(),F(c,new ci(c,o)),Pt(t)}else ji(t);else if(y=r.m,y==3||y==0&&r.X>0||!(c==1&&zs(t,r)||c==2&&vn(t)))switch(o&&o.length>0&&(r=t.h,r.i=r.i.concat(o)),y){case 1:Ae(t,5);break;case 4:Ae(t,10);break;case 3:Ae(t,6);break;default:Ae(t,2)}}}function Hi(t,r){let o=t.Qa+Math.floor(Math.random()*t.Za);return t.isActive()||(o*=2),o*r}function Ae(t,r){if(t.j.info("Error code "+r),r==2){var o=E(t.bb,t),c=t.Ua;const y=!c;c=new he(c||"//www.google.com/images/cleardot.gif"),h.location&&h.location.protocol=="http"||Qe(c,"https"),bt(c),y?Bs(c.toString(),o):Fs(c.toString(),o)}else H(2);t.I=0,t.l&&t.l.pa(r),$i(t),Li(t)}i.bb=function(t){t?(this.j.info("Successfully pinged google.com"),H(2)):(this.j.info("Failed to ping google.com"),H(1))};function $i(t){if(t.I=0,t.ja=[],t.l){const r=wi(t.h);(r.length!=0||t.i.length!=0)&&(M(t.ja,r),M(t.ja,t.i),t.h.i.length=0,j(t.i),t.i.length=0),t.l.oa()}}function Vi(t,r,o){var c=o instanceof he?J(o):new he(o);if(c.g!="")r&&(c.g=r+"."+c.g),Ze(c,c.u);else{var y=h.location;c=y.protocol,r=r?r+"."+y.hostname:y.hostname,y=+y.port;const v=new he(null);c&&Qe(v,c),r&&(v.g=r),y&&Ze(v,y),o&&(v.h=o),c=v}return o=t.G,r=t.wa,o&&r&&R(c,o,r),R(c,"VER",t.ka),ot(t,c),c}function Wi(t,r,o){if(r&&!t.L)throw Error("Can't create secondary domain capable XhrIo object.");return r=t.Aa&&!t.ma?new D(new mn({ab:o})):new D(t.ma),r.Fa(t.L),r}i.isActive=function(){return!!this.l&&this.l.isActive(this)};function zi(){}i=zi.prototype,i.ra=function(){},i.qa=function(){},i.pa=function(){},i.oa=function(){},i.isActive=function(){return!0},i.Ka=function(){};function Rt(){}Rt.prototype.g=function(t,r){return new W(t,r)};function W(t,r){B.call(this),this.g=new Mi(r),this.l=t,this.h=r&&r.messageUrlParams||null,t=r&&r.messageHeaders||null,r&&r.clientProtocolHeaderRequired&&(t?t["X-Client-Protocol"]="webchannel":t={"X-Client-Protocol":"webchannel"}),this.g.o=t,t=r&&r.initMessageHeaders||null,r&&r.messageContentType&&(t?t["X-WebChannel-Content-Type"]=r.messageContentType:t={"X-WebChannel-Content-Type":r.messageContentType}),r&&r.sa&&(t?t["X-WebChannel-Client-Profile"]=r.sa:t={"X-WebChannel-Client-Profile":r.sa}),this.g.U=t,(t=r&&r.Qb)&&!f(t)&&(this.g.u=t),this.A=r&&r.supportsCrossDomainXhr||!1,this.v=r&&r.sendRawJson||!1,(r=r&&r.httpSessionIdParam)&&!f(r)&&(this.g.G=r,t=this.h,t!==null&&r in t&&(t=this.h,r in t&&delete t[r])),this.j=new Ue(this)}b(W,B),W.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},W.prototype.close=function(){_n(this.g)},W.prototype.o=function(t){var r=this.g;if(typeof t=="string"){var o={};o.__data__=t,t=o}else this.v&&(o={},o.__data__=sn(t),t=o);r.i.push(new Os(r.Ya++,t)),r.I==3&&Pt(r)},W.prototype.N=function(){this.g.l=null,delete this.j,_n(this.g),delete this.g,W.Z.N.call(this)};function Gi(t){on.call(this),t.__headers__&&(this.headers=t.__headers__,this.statusCode=t.__status__,delete t.__headers__,delete t.__status__);var r=t.__sm__;if(r){e:{for(const o in r){t=o;break e}t=void 0}(this.i=t)&&(t=this.i,r=r!==null&&t in r?r[t]:void 0),this.data=r}else this.data=t}b(Gi,on);function Ki(){an.call(this),this.status=1}b(Ki,an);function Ue(t){this.g=t}b(Ue,zi),Ue.prototype.ra=function(){F(this.g,"a")},Ue.prototype.qa=function(t){F(this.g,new Gi(t))},Ue.prototype.pa=function(t){F(this.g,new Ki)},Ue.prototype.oa=function(){F(this.g,"b")},Rt.prototype.createWebChannel=Rt.prototype.g,W.prototype.send=W.prototype.o,W.prototype.open=W.prototype.m,W.prototype.close=W.prototype.close,Oh=function(){return new Rt},Rh=function(){return It()},kh=Te,Ph={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Et.NO_ERROR=0,Et.TIMEOUT=8,Et.HTTP_ERROR=6,Ch=Et,hi.COMPLETE="complete",Ah=hi,ri.EventType=Ge,Ge.OPEN="a",Ge.CLOSE="b",Ge.ERROR="c",Ge.MESSAGE="d",B.prototype.listen=B.prototype.J,Sh=ri,D.prototype.listenOnce=D.prototype.K,D.prototype.getLastError=D.prototype.Ha,D.prototype.getLastErrorCode=D.prototype.ya,D.prototype.getStatus=D.prototype.ca,D.prototype.getResponseJson=D.prototype.La,D.prototype.getResponseText=D.prototype.la,D.prototype.send=D.prototype.ea,D.prototype.setWithCredentials=D.prototype.Fa,bh=D}).apply(typeof Nt<"u"?Nt:typeof self<"u"?self:typeof window<"u"?window:{});export{Bh as A,jh as B,He as C,kh as E,we as F,me as G,Eh as I,kr as L,Th as M,Ph as S,Sh as W,bh as X,Y as _,k as a,Dr as b,Dh as c,Fe as d,Ie as e,Nh as f,ga as g,Rh as h,Un as i,Ah as j,Ch as k,Oh as l,Mh as m,$ as n,Xs as o,go as p,oo as q,Lh as r,ct as s,xe as t,dt as u,pa as v,Hh as w,Uh as x,Fh as y,xh as z};
