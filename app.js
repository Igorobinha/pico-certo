/* Pico Certo: previsão de surf pela localização.
 * Ondas e maré: Open-Meteo Marine API. Vento, chuva, nascer e pôr do sol: Open-Meteo Forecast API.
 * Tempo de estrada e rotas: OSRM. Mapa: Leaflet + OpenStreetMap.
 */
(() => {
'use strict';

// ---------- utilidades ----------
const $ = (sel, el = document) => el.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const num = (x, casas = 1) => (x == null || Number.isNaN(+x)) ? '–'
  : Number(x).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

const DIRS = ['N', 'NNE', 'NE', 'ENE', 'L', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
const DIRS_NOME = ['Norte', 'Nor-nordeste', 'Nordeste', 'Lés-nordeste', 'Leste', 'Lés-sudeste', 'Sudeste', 'Su-sudeste',
  'Sul', 'Su-sudoeste', 'Sudoeste', 'Oés-sudoeste', 'Oeste', 'Oés-noroeste', 'Noroeste', 'Nor-noroeste'];
const dirPT = d => d == null ? '–' : DIRS[Math.round((((d % 360) + 360) % 360) / 22.5) % 16];
const angDiff = (a, b) => { const d = Math.abs((((a - b) % 360) + 360) % 360); return d > 180 ? 360 - d : d; };
// a seta aponta para onde a onda/vento VAI (a direção informada é de onde vem)
const seta = dir => dir == null ? '' :
  `<svg class="seta" viewBox="0 0 16 16" aria-hidden="true" style="transform:rotate(${Math.round((dir + 180) % 360)}deg)"><path d="M8 1.5 13 9.5H9.6V14.5H6.4V9.5H3z"/></svg>`;
const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const ICONE = {
  voltar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.4 5.4 14 4l-8 8 8 8 1.4-1.4L8.8 12z"/></svg>',
  seguir: '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.6 5.4 10 4l8 8-8 8-1.4-1.4 6.6-6.6z"/></svg>',
  picos: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 20c3-4 6-4 9 0s6 4 9 0 6-4 8-1" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M3 26c3-3 6-3 9 0s6 3 9 0 6-3 8-1" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" opacity=".55"/><path d="M9 14c2-6 8-9 14-7-4 1-6 4-6 8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  dias: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="7" width="24" height="21" rx="4" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M4 13h24M11 4v6M21 4v6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><rect x="9" y="17" width="5" height="5" rx="1" fill="currentColor"/></svg>',
  mapa: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 8l7-3 10 3 7-3v19l-7 3-10-3-7 3z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><path d="M11 5v19M21 8v19" stroke="currentColor" stroke-width="2.6"/></svg>',
  favoritos: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4l3.6 7.6 8.2 1-6 5.7 1.6 8.2L16 22.4l-7.4 4.1 1.6-8.2-6-5.7 8.2-1z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/></svg>',
  seguranca: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11.5" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="16" cy="16" r="5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M8 8l4.5 4.5M24 8l-4.5 4.5M8 24l4.5-4.5M24 24l-4.5-4.5" stroke="currentColor" stroke-width="2.6"/></svg>',
  diario: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 4h15a3 3 0 0 1 3 3v21H11a3 3 0 0 1-3-3z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><path d="M8 25a3 3 0 0 1 3-3h15M13 10h8M13 15h6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
  chamar: '<svg class="ico-chamar" viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  estrela: '<svg class="estrela" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17l-5.7 3.1 1.2-6.3-4.6-4.4 6.3-.8z"/></svg>',
  ajustes: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 9h14M25 9h2M5 16h4M15 16h12M5 23h10M21 23h6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="22" cy="9" r="3" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="12" cy="16" r="3" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="18" cy="23" r="3" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>',
};

function distKm(a, b) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const store = {
  get(k, def) { try { const v = localStorage.getItem('pc.' + k); return v == null ? def : JSON.parse(v); } catch { return def; } },
  set(k, v) { try { localStorage.setItem('pc.' + k, JSON.stringify(v)); } catch { /* sem espaço ou bloqueado */ } },
};

async function getJSON(url, ms = 20000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) {
      let motivo = 'erro ' + r.status;
      try { const j = await r.json(); if (j.reason) motivo = j.reason; } catch { /* corpo não é JSON */ }
      throw new Error(motivo);
    }
    return await r.json();
  } finally { clearTimeout(t); }
}

// no instalador Android, a página ganha window.PicoCertoNativo (voz e tela acesa nativas)
const NATIVO = window.PicoCertoNativo || null;

// ---------- configuração ----------
const REGIOES = window.REGIOES || [];
const MEUS_PICOS = { id: 'meus-picos', nome: 'Meus picos', cidade: 'Salvos por você' };
const REG_MAP = new Map(REGIOES.map(r => [r.id, r]));
const regiaoDe = p => REG_MAP.get(p.regiao) || MEUS_PICOS;
// "Jacaraípe · Serra, ES"; quando o pico ou a cidade já têm o nome da região, só a cidade
const localPico = p => { const r = regiaoDe(p); return p.nome === r.nome || r.cidade.startsWith(r.nome) ? r.cidade : `${r.nome} · ${r.cidade}`; };

const CIDADES = [
  { nome: 'Cariacica, ES', lat: -20.264, lon: -40.417 },
  { nome: 'Vitória, ES', lat: -20.315, lon: -40.312 },
  { nome: 'Vila Velha, ES', lat: -20.330, lon: -40.292 },
  { nome: 'Serra, ES', lat: -20.128, lon: -40.307 },
  { nome: 'Guarapari, ES', lat: -20.670, lon: -40.500 },
  { nome: 'Linhares, ES', lat: -19.391, lon: -40.072 },
  { nome: 'Salvador, BA', lat: -12.971, lon: -38.501 },
  { nome: 'Recife, PE', lat: -8.047, lon: -34.877 },
  { nome: 'Rio de Janeiro, RJ', lat: -22.907, lon: -43.173 },
  { nome: 'Niterói, RJ', lat: -22.883, lon: -43.104 },
  { nome: 'São Paulo, SP', lat: -23.550, lon: -46.633 },
  { nome: 'Florianópolis, SC', lat: -27.595, lon: -48.548 },
];
const NIVEIS = {
  iniciante:     { nome: 'Iniciante',     a: 0.2, b: 0.5, c: 1.0, d: 1.6, grande: 0 },
  intermediario: { nome: 'Intermediário', a: 0.3, b: 0.8, c: 1.7, d: 2.6, grande: 0.15 },
  avancado:      { nome: 'Avançado',      a: 0.5, b: 1.3, c: 3.0, d: 4.5, grande: 0.4 },
};
const FAIXAS = [
  { min: 7.5, nome: 'Muito bom', cls: 's4' },
  { min: 6,   nome: 'Bom',       cls: 's3' },
  { min: 4.5, nome: 'Surfável',  cls: 's2' },
  { min: 2.5, nome: 'Fraco',     cls: 's1' },
  { min: -1,  nome: 'Não vale',  cls: 's0' },
];
const faixa = n => FAIXAS.find(f => n >= f.min);
const PESO_VIAGEM = 1.0;    // pontos de nota descontados por hora de viagem (só ida)
const FATOR_ESTRADA = 1.4;  // linha reta → estrada, quando não há rota calculada
const VELOCIDADE = 60;      // km/h médios, idem
const MAX_PICOS = 40;
const VALIDADE_CACHE = 45 * 60 * 1000;
const VARS_MAR = 'wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,sea_level_height_msl,sea_surface_temperature';
const VARS_TEMPO = 'wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation_probability,temperature_2m,uv_index,weather_code';
const VERSAO_DADOS = 2;  // aumentar quando mudar as variáveis acima, pra não usar previsão guardada sem elas
const TROVOADA = [95, 96, 99];  // códigos de tempo da Open-Meteo pra trovoada

// ---------- estado ----------
const S = {
  loc: store.get('loc', null),
  nivel: store.get('nivel', 'intermediario'),
  raio: store.get('raio', 150),
  kmL: store.get('kmL', 11),
  gasolina: store.get('gasolina', 6.3),
  custom: store.get('custom', []),
  posicoes: store.get('posicoes', {}),   // posições corrigidas na areia: { idDoPico: {lat, lon} }
  apelido: store.get('apelido', 'maroleiro'),  // como a voz da navegação chama a pessoa
  favoritos: store.get('favoritos', []),       // ids dos picos com estrela
  selecionados: store.get('selecionados', []), // picos marcados pra comparar na tela inicial
  diaComp: null, precisaRecarregar: false,
  modoComp: store.get('modoComp', 'onda'),     // 'onda' = melhor onda; 'viagem' = onda descontando a estrada
  alertas: { ativo: false, notaMin: 7, hora: 19, ...store.get('alertas', {}) },  // aviso na véspera, às `hora`
  boletim: { ativo: false, hora: 5, ...store.get('boletim', {}) },            // boletim todo dia de manhã
  diario: store.get('diario', []),             // sessões registradas: a mais nova primeiro
  apagando: null,                              // sessão esperando confirmação pra apagar
  tela: 'inicio',
  msgLocal: '', localizando: false,
  carregando: false, erro: null, offline: false,
  series: null, dias: [], rk: [], geradoEm: null, foraDoRaio: false,
  dia: 0,
  aberto: null, diaDet: 0, horaSel: null, redesenharDetalhe: false,
};
if (!NIVEIS[S.nivel]) S.nivel = 'intermediario';
{
  const qs = new URLSearchParams(location.search);
  const lat = parseFloat(qs.get('lat')), lon = parseFloat(qs.get('lon'));
  if (Number.isFinite(lat) && Number.isFinite(lon)) S.loc = { lat, lon, nome: qs.get('nome') || 'Local escolhido', fonte: 'url' };
}

function todosPicos() {
  const lista = [];
  const comPosicao = p => { const c = S.posicoes[p.id]; return c ? { ...p, lat: c.lat, lon: c.lon, aproximado: false, corrigido: true } : p; };
  for (const r of REGIOES) for (const p of r.picos) lista.push(comPosicao({ ...p, regiao: r.id }));
  for (const p of S.custom) lista.push(comPosicao({ ...p, regiao: REG_MAP.has(p.regiao) ? p.regiao : MEUS_PICOS.id }));
  return lista;
}

// ---------- viagem ----------
function estimarViagem(p) {
  const km = distKm(S.loc, p) * FATOR_ESTRADA;
  return { km, horas: km < 2 ? 0.05 : km / VELOCIDADE + 1 / 6, estimada: true };
}
const custo = v => (2 * v.km / S.kmL) * S.gasolina;

async function temposEstrada(picos) {
  const coords = [S.loc].concat(picos).map(p => `${p.lon.toFixed(5)},${p.lat.toFixed(5)}`).join(';');
  const j = await getJSON(`https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&annotations=duration,distance`, 12000);
  if (j.code !== 'Ok') throw new Error(j.code);
  return picos.map((p, i) => {
    const dur = j.durations?.[0]?.[i + 1], dist = j.distances?.[0]?.[i + 1];
    if (dur == null || dist == null) return null;
    // OSRM não considera trânsito: 10% a mais e 5 min pra estacionar
    return { km: dist / 1000, horas: dur / 3600 * 1.1 + 5 / 60, estimada: false };
  });
}

// ---------- dados ----------
// picos no raio, mais os favoritos e os marcados pra comparar, mesmo se estiverem longe
function picosProximos() {
  const fav = new Set(S.favoritos.concat(S.selecionados));
  const ord = todosPicos().map(p => ({ p, d: distKm(S.loc, p) })).sort((a, b) => a.d - b.d);
  const noRaio = ord.filter(x => x.d <= S.raio);
  S.foraDoRaio = noRaio.length < 3;
  const base = S.foraDoRaio ? ord.slice(0, 8) : noRaio;
  const extras = ord.filter(x => fav.has(x.p.id) && !base.includes(x));
  return extras.concat(base).slice(0, MAX_PICOS).map(x => x.p);
}
const ehFavorito = id => S.favoritos.includes(id);

// picos a poucos km uns dos outros caem no mesmo ponto do modelo: uma consulta só pra eles
function agrupar(picos) {
  const grupos = [], idx = new Map();
  const grupoDe = picos.map(p => {
    const k = `${Math.round(p.lat * 20)},${Math.round(p.lon * 20)}`;
    if (!idx.has(k)) { idx.set(k, grupos.length); grupos.push(p); }
    return idx.get(k);
  });
  return { grupos, grupoDe };
}

async function carregar(forcar = false) {
  if (!S.loc) { render(); return; }
  const picos = picosProximos();
  const { grupos, grupoDe } = agrupar(picos);
  const chave = `v${VERSAO_DADOS}|${S.loc.lat.toFixed(3)},${S.loc.lon.toFixed(3)}|${picos.map(p => `${p.id}@${p.lat},${p.lon}`).join(',')}`;
  const cache = store.get('cache', null);
  if (!forcar && cache && cache.chave === chave && Date.now() - cache.em < VALIDADE_CACHE) {
    S.offline = false;
    aplicarDados(picos, grupoDe, cache.m, cache.w, cache.estrada, cache.em);
    return;
  }
  S.carregando = true; S.erro = null;
  if (!S.series) render();
  const lat = grupos.map(p => p.lat.toFixed(3)).join(','), lon = grupos.map(p => p.lon.toFixed(3)).join(',');
  const base = `latitude=${lat}&longitude=${lon}&timezone=auto&forecast_days=7`;
  try {
    const [m, w, estrada] = await Promise.all([
      getJSON(`https://marine-api.open-meteo.com/v1/marine?${base}&hourly=${VARS_MAR}`),
      getJSON(`https://api.open-meteo.com/v1/forecast?${base}&hourly=${VARS_TEMPO}&daily=sunrise,sunset&wind_speed_unit=kmh`),
      temposEstrada(picos).catch(() => null),
    ]);
    const ma = [].concat(m), wa = [].concat(w), em = Date.now();
    store.set('cache', { chave, m: ma, w: wa, estrada, em });
    S.offline = false;
    aplicarDados(picos, grupoDe, ma, wa, estrada, em);
  } catch (e) {
    S.carregando = false;
    if (cache && cache.chave === chave) { S.offline = true; aplicarDados(picos, grupoDe, cache.m, cache.w, cache.estrada, cache.em); return; }
    S.erro = e.name === 'AbortError' ? 'a conexão demorou demais' : (e.message || 'falha de rede');
    S.series = null;
    render();
  }
}

function aplicarDados(picos, grupoDe, ma, wa, estrada, em) {
  S.series = picos.map((p, i) => montarSerie(p, ma[grupoDe[i]], wa[grupoDe[i]], estrada && estrada[i]));
  S.geradoEm = em; S.carregando = false; S.erro = null;
  calcular();
  S.dia = S.rk[0].some(r => r.j) ? 0 : 1;  // já escureceu: a sugestão passa pra amanhã
  render();
  agendarAlertas();
  if (S.aberto) {
    if (!serieAberta()) fecharDetalhe();
    else if (S.redesenharDetalhe) { S.redesenharDetalhe = false; renderDetalhe(true); }
    else renderPrevisaoDetalhe(serieAberta());
  }
}

const horaDec = s => s ? +s.slice(11, 13) + +s.slice(14, 16) / 60 : null;

function montarSerie(p, m, w, estrada) {
  const off = w.utc_offset_seconds ?? m.utc_offset_seconds ?? -10800;
  const iMar = new Map(m.hourly.time.map((t, i) => [t, i]));
  const sol = {};
  (w.daily?.time || []).forEach((d, i) => { sol[d] = { nasce: horaDec(w.daily.sunrise[i]), poe: horaDec(w.daily.sunset[i]) }; });
  const horas = [];
  w.hourly.time.forEach((t, i) => {
    const j = iMar.get(t);
    if (j == null) return;
    const mv = k => (m.hourly[k] ? m.hourly[k][j] : null);
    const wv = k => (w.hourly[k] ? w.hourly[k][i] : null);
    const h = {
      t, dia: t.slice(0, 10), hora: +t.slice(11, 13),
      onda:  { alt: mv('wave_height'),       dir: mv('wave_direction'),       per: mv('wave_period') },
      swell: { alt: mv('swell_wave_height'), dir: mv('swell_wave_direction'), per: mv('swell_wave_period') },
      mar:   { alt: mv('wind_wave_height'),  dir: mv('wind_wave_direction'),  per: mv('wind_wave_period') },
      mare: mv('sea_level_height_msl'),
      vento: wv('wind_speed_10m'), ventoDir: wv('wind_direction_10m'), rajada: wv('wind_gusts_10m'),
      chuva: wv('precipitation_probability'),
      agua: mv('sea_surface_temperature'), ar: wv('temperature_2m'), uv: wv('uv_index'),
      raio: TROVOADA.includes(wv('weather_code')),
    };
    const s = sol[h.dia];
    h.claro = s && s.nasce != null ? (h.hora >= Math.ceil(s.nasce - 0.25) && h.hora <= Math.floor(s.poe - 0.5)) : (h.hora >= 5 && h.hora <= 17);
    horas.push(h);
  });
  // maré de cada hora em relação ao dia: 0 = mais seca, 1 = mais cheia; e se está enchendo
  const mareDia = {};
  for (const h of horas) if (h.mare != null) (mareDia[h.dia] = mareDia[h.dia] || []).push(h.mare);
  horas.forEach((h, k) => {
    const v = mareDia[h.dia];
    if (h.mare == null || !v) return;
    const lo = Math.min(...v), hi = Math.max(...v);
    h.mareNivel = hi - lo > 0.05 ? (h.mare - lo) / (hi - lo) : 0.5;
    const prox = horas[k + 1];
    h.mareSobe = prox && prox.mare != null ? prox.mare > h.mare : null;
  });
  return { pico: p, off, horas, sol, viagem: estrada || estimarViagem(p) };
}

// ---------- nota ----------
const G02 = Math.pow(9.81, 0.2);
// altura na arrebentação (Komar e Gaudiano), com um desconto conservador
const quebra = (alt, per) => (alt > 0.02 && per > 0.5) ? 0.85 * 0.39 * G02 * Math.pow(per * alt * alt, 0.4) : 0;
// quanto da ondulação entra na praia, pela diferença entre a direção dela e a da praia
function exposicao(dir, facing) {
  if (dir == null) return 0;
  const d = angDiff(dir, facing);
  return d <= 25 ? 1 : d >= 105 ? 0 : Math.cos((d - 25) / 80 * Math.PI / 2);
}

function notaHora(h, p, nivel) {
  const N = NIVEIS[nivel];
  const sA = h.swell.alt || 0, mA = h.mar.alt || 0, tA = h.onda.alt || 0;
  const oA = Math.sqrt(Math.max(0, tA * tA - sA * sA - mA * mA));  // o que sobra: ondulação secundária
  const comps = [
    { alt: sA, per: h.swell.per, dir: h.swell.dir },
    { alt: mA, per: h.mar.per, dir: h.mar.dir },
    { alt: oA, per: h.onda.per, dir: h.onda.dir },
  ].map(c => { const e = exposicao(c.dir, p.facing); return { ...c, e, hb: quebra(c.alt * e, c.per) }; });
  const soma2 = comps.reduce((s, c) => s + c.hb * c.hb, 0);
  const praia = Math.sqrt(soma2);
  const per = soma2 > 0 ? comps.reduce((s, c) => s + c.hb * c.hb * (c.per || 0), 0) / soma2 : (h.onda.per || 0);

  let tam;
  if (praia <= N.a) tam = 0;
  else if (praia < N.b) tam = (praia - N.a) / (N.b - N.a);
  else if (praia <= N.c) tam = 1;
  else if (praia < N.d) tam = 1 - (1 - N.grande) * (praia - N.c) / (N.d - N.c);
  else tam = N.grande;

  const notaPer = clamp((per - 4) / 8, 0.1, 1);

  const v = h.vento ?? 0, raj = Math.max(h.rajada ?? v, v);
  const ef = v + 0.3 * (raj - v);
  const q = h.ventoDir == null ? 0 : Math.cos(angDiff(h.ventoDir, (p.facing + 180) % 360) * Math.PI / 180); // 1 terral, -1 maral
  let notaVento = ef <= 6 ? 1 : 1 - (ef - 6) * ((1 - q) / 2) / 16;
  if (q > 0.3 && ef > 30) notaVento -= (ef - 30) / 30;  // terral forte demais
  notaVento = clamp(notaVento, 0, 1);

  const chuvaF = (h.chuva ?? 0) >= 70 ? 0.92 : 1;
  const raioF = h.raio ? 0.3 : 1;  // trovoada: surfar com raio é perigoso, a nota despenca

  // ficha do pico: fora da maré ou da ondulação que ele gosta, a nota cai
  const fi = p.ficha || {};
  let mareOk = null, ondOk = null, fichaF = 1;
  if (fi.mare && fi.mare !== 'qualquer' && h.mareNivel != null) {
    mareOk = mareCombina(fi.mare, h);
    if (!mareOk) fichaF *= 0.8;
  }
  if (Array.isArray(fi.ondulacao) && fi.ondulacao.length) {
    const princ = comps.reduce((a, c) => (c.hb > a.hb ? c : a), comps[0]);
    const prefs = fi.ondulacao.map(dirGraus).filter(g => g != null);
    if (princ.dir != null && prefs.length) {
      const d = Math.min(...prefs.map(g => angDiff(g, princ.dir)));
      ondOk = d <= 30;
      fichaF *= d <= 30 ? 1 : d <= 60 ? 0.9 : 0.8;
    }
  }
  const nota = clamp(10 * tam * (0.3 + 0.7 * notaVento) * (0.4 + 0.6 * notaPer) * chuvaF * raioF * fichaF, 0, 10);
  return { nota, praia, per, q, ef, mareOk, ondOk };
}

// 'SE' → 135; aceita as siglas em português (L = leste, O = oeste) e as em inglês (E, W)
function dirGraus(sigla) {
  let s = String(sigla).toUpperCase().trim().replace(/W/g, 'O');
  s = { E: 'L', LNE: 'ENE', LSE: 'ESE' }[s] || s;
  const i = DIRS.indexOf(s);
  return i < 0 ? null : i * 22.5;
}
function mareCombina(pref, h) {
  switch (pref) {
    case 'cheia': return h.mareNivel >= 0.6;
    case 'seca': case 'vazia': return h.mareNivel <= 0.4;
    case 'meia': return h.mareNivel >= 0.25 && h.mareNivel <= 0.75;
    case 'enchendo': return h.mareSobe === true;
    case 'vazando': return h.mareSobe === false;
    default: return true;
  }
}
const descreverMare = h => h.mareNivel == null ? null
  : `${h.mareNivel >= 0.66 ? 'maré cheia' : h.mareNivel <= 0.33 ? 'maré seca' : 'meia maré'}${h.mareSobe === true ? ', enchendo' : h.mareSobe === false ? ', vazando' : ''}`;

function calcular() {
  for (const s of S.series) for (const h of s.horas) h.c = notaHora(h, s.pico, S.nivel);
  S.dias = [...new Set(S.series[0].horas.map(h => h.dia))].slice(0, 7);
  S.rk = S.dias.map((_, i) => ranking(i));
}

function agoraLocal(off) {
  const d = new Date(Date.now() + off * 1000);
  return { dia: d.toISOString().slice(0, 10), hora: d.getUTCHours() + d.getUTCMinutes() / 60 };
}

function horaMinima(s, dIdx) {
  if (dIdx !== 0) return 0;
  const a = agoraLocal(s.off);
  return a.dia === S.dias[0] ? Math.round(a.hora + s.viagem.horas) : 0;
}

function janela(s, diaStr, minHora) {
  const hs = s.horas.filter(h => h.dia === diaStr && h.claro && h.hora >= minHora);
  if (!hs.length) return null;
  let k = 0;
  hs.forEach((h, i) => { if (h.c.nota > hs[k].c.nota) k = i; });
  const lim = hs[k].c.nota - 0.8;
  let i0 = k, i1 = k;
  while (i1 - i0 < 3) {
    const L = i0 > 0 && hs[i0 - 1].hora === hs[i0].hora - 1 && hs[i0 - 1].c.nota >= lim ? hs[i0 - 1].c.nota : -1;
    const R = i1 < hs.length - 1 && hs[i1 + 1].hora === hs[i1].hora + 1 && hs[i1 + 1].c.nota >= lim ? hs[i1 + 1].c.nota : -1;
    if (L < 0 && R < 0) break;
    if (L >= R) i0--; else i1++;
  }
  return { ini: hs[i0].hora, fim: hs[i1].hora + 1, nota: hs[k].c.nota, melhor: hs[k] };
}

function ranking(dIdx) {
  const diaStr = S.dias[dIdx];
  return S.series.map(s => {
    const j = janela(s, diaStr, horaMinima(s, dIdx));
    return { s, j, valor: j ? j.nota - PESO_VIAGEM * s.viagem.horas : -99 };
  }).sort((a, b) => b.valor - a.valor);
}

function regioesProximas(dIdx) {
  const m = new Map();
  for (const r of S.rk[dIdx]) {
    const reg = regiaoDe(r.s.pico);
    if (!m.has(reg.id)) m.set(reg.id, { reg, itens: [], km: Infinity, horas: Infinity });
    const g = m.get(reg.id);
    g.itens.push(r);
    g.km = Math.min(g.km, r.s.viagem.km);
    g.horas = Math.min(g.horas, r.s.viagem.horas);
  }
  return [...m.values()].map(g => {
    g.melhor = g.itens.filter(x => x.j).sort((a, b) => b.j.nota - a.j.nota)[0] || null;
    return g;
  }).sort((a, b) => a.km - b.km);
}

// ---------- alertas (notificação na véspera, agendada no Android) ----------
function montarAlertas() {
  const fav = new Set(S.favoritos);
  const lista = [];
  for (let i = 1; i < S.dias.length; i++) {
    const cands = S.rk[i].filter(r => r.j && (!fav.size || fav.has(r.s.pico.id)));
    // com favoritos, o de maior nota; sem favoritos, o melhor já descontando a viagem
    const m = fav.size ? cands.sort((a, b) => b.j.nota - a.j.nota)[0] : cands[0];
    if (!m || m.j.nota < S.alertas.notaMin) continue;
    // véspera às `hora`, no fuso do pico
    const quando = Date.parse(`${S.dias[i - 1]}T00:00:00Z`) - m.s.off * 1000 + S.alertas.hora * 3600 * 1000;
    if (quando <= Date.now()) continue;
    const c = m.j.melhor.c;
    lista.push({
      quando,
      titulo: comApelido('Amanhã vai ter onda'),
      texto: `${m.s.pico.nome} das ${m.j.ini}h às ${m.j.fim}h, nota ${num(m.j.nota)} (${faixa(m.j.nota).nome.toLowerCase()}).\n${linhasCondicoes(m.s, m.j.melhor)}`,
    });
  }
  return lista;
}
// boletim da manhã: todo dia no horário escolhido, o melhor pico do dia (favoritos ou perto).
// Vale pros próximos 3 dias; depois disso a previsão guardada fica velha e chega um lembrete pra abrir o app.
const DIAS_BOLETIM = 3;
function montarBoletins() {
  const fav = new Set(S.favoritos);
  const lista = [];
  const quandoNoDia = (i, off) => Date.parse(`${S.dias[i]}T00:00:00Z`) - off * 1000 + S.boletim.hora * 3600 * 1000;
  const off = S.series && S.series[0] ? S.series[0].off : -10800;
  let feitos = 0, ultimo = -1;
  for (let i = 0; i < S.dias.length && feitos < DIAS_BOLETIM; i++) {
    const quando = quandoNoDia(i, off);
    if (quando <= Date.now()) continue;
    feitos++;
    ultimo = i;
    const cands = S.rk[i].filter(r => r.j && (!fav.size || fav.has(r.s.pico.id)));
    const m = fav.size ? cands.sort((a, b) => b.j.nota - a.j.nota)[0] : cands[0];
    const titulo = comApelido('Bom dia');
    if (!m) {
      lista.push({ quando, titulo, texto: 'Hoje nenhum dos seus picos tem janela boa com luz do dia. Dia de descanso!' });
      continue;
    }
    const f = faixa(m.j.nota);
    const frase = m.j.nota >= 4.5
      ? `Hoje o melhor é ${m.s.pico.nome} das ${m.j.ini}h às ${m.j.fim}h, nota ${num(m.j.nota)} (${f.nome.toLowerCase()}).`
      : `Hoje tá fraco: o melhor é ${m.s.pico.nome} das ${m.j.ini}h às ${m.j.fim}h, nota ${num(m.j.nota)}. Bom dia pro longboard ou pra descansar.`;
    lista.push({ quando, titulo, texto: `${frase}\n${linhasCondicoes(m.s, m.j.melhor)}` });
  }
  // a previsão guardada acabou: lembrete pra abrir o app e voltar a receber o boletim
  if (ultimo >= 0 && ultimo + 1 < S.dias.length) {
    lista.push({ quando: quandoNoDia(ultimo + 1, off), titulo: comApelido('Bom dia'), texto: 'Abre o Pico Certo pra atualizar a previsão e voltar a receber o boletim do melhor pico do dia.' });
  }
  return lista;
}

function agendarAlertas() {
  if (!NATIVO || typeof NATIVO.agendarAlertas !== 'function' || !S.series) return;
  const lista = (S.alertas.ativo ? montarAlertas() : []).concat(S.boletim.ativo ? montarBoletins() : []);
  try { NATIVO.agendarAlertas(JSON.stringify(lista)); } catch { /* versão antiga do app */ }
}

// liga uma notificação (alerta ou boletim): pede permissão se precisar e avisa no parágrafo `msgId`
function ligarNotificacao(msgId, textoPronto) {
  const msg = $('#' + msgId);
  if (typeof NATIVO.pedirNotificacoes === 'function' && !NATIVO.pedirNotificacoes()) {
    msg.hidden = false;
    msg.textContent = 'Permita as notificações do Pico Certo na janela que abriu.';
  } else {
    msg.hidden = false;
    msg.textContent = textoPronto;
  }
  agendarAlertas();
}

// ---------- textos ----------
function ondulacao(h) {
  const usaSwell = (h.swell.alt || 0) >= 0.25 && h.swell.per;
  return { alt: h.onda.alt, per: usaSwell ? h.swell.per : h.onda.per, dir: usaSwell ? h.swell.dir : h.onda.dir };
}
function rotuloVento(c) {
  if (c.ef <= 6) return 'sem vento';
  const q = c.q;
  const tipo = q > 0.7 ? 'terral' : q > 0.25 ? 'terral de lado' : q > -0.25 ? 'lateral' : q > -0.7 ? 'maral de lado' : 'maral';
  const forca = c.ef < 12 ? 'fraco' : c.ef < 22 ? 'moderado' : 'forte';
  return tipo.includes(' ') ? `${tipo}, ${forca}` : `${tipo} ${forca}`;
}
// "vento terral fraco" ou "quase sem vento", pra frases corridas
const textoVento = c => c.ef <= 6 ? 'quase sem vento' : `vento ${rotuloVento(c)}`;

// condições da melhor hora, uma por linha, pras notificações (aparecem ao expandir o aviso)
function linhasCondicoes(s, h) {
  const c = h.c, o = ondulacao(h), cond = condicoesDia(s, h.dia);
  const linhas = [
    `Onda: ${faixaM(c.praia)} (${rotuloTamanho(c.praia)}), ondulação ${dirPT(o.dir)} de ${num(o.per, 0)} s`,
    `Vento: ${c.ef <= 6 ? 'quase parado' : `${rotuloVento(c)}, ${num(h.vento, 0)} km/h de ${dirPT(h.ventoDir)}`}`,
  ];
  const mare = descreverMare(h);
  const agua = cond.agua != null ? `água ${graus(cond.agua)}, ${roupa(cond.agua).curta}` : null;
  if (mare || agua) linhas.push([mare && `Maré: ${mare.replace('maré ', '')}`, agua && agua.charAt(0).toUpperCase() + agua.slice(1)].filter(Boolean).join(' · '));
  if (cond.raios.length) linhas.push(`Atenção: risco de trovoada das ${intervalos(cond.raios)}`);
  return linhas.join('\n');
}
const rotuloTamanho = m => m < 0.3 ? 'marola' : m < 0.6 ? 'joelho a cintura' : m < 0.9 ? 'cintura a peito'
  : m < 1.3 ? 'peito a cabeça' : m < 1.8 ? 'um pouco acima da cabeça' : m < 2.5 ? '1,5× a 2× a cabeça' : 'grande, acima de 2× a cabeça';
const faixaM = m => m < 0.15 ? 'menos de 0,2 m' : `${num(m * 0.8)}–${num(m * 1.15)} m`;

// roupa pela temperatura da água (°C): curta pros chips, longa pra explicação
function roupa(t) {
  if (t == null) return null;
  if (t >= 25) return { curta: 'bermuda', longa: 'bermuda e lycra' };
  if (t >= 23) return { curta: 'lycra', longa: 'lycra ou jaqueta de neoprene' };
  if (t >= 21) return { curta: 'long john', longa: 'long john ou jaqueta' };
  if (t >= 19) return { curta: 'long john', longa: 'long john 2 mm ou long fino' };
  if (t >= 17) return { curta: 'long 3/2', longa: 'long 3/2 mm' };
  if (t >= 15) return { curta: 'long 4/3', longa: 'long 4/3 mm' };
  return { curta: 'long 5/4', longa: 'long 4/3 ou 5/4 mm e bota' };
}
const uvNome = uv => uv >= 11 ? 'extremo' : uv >= 8 ? 'muito alto' : uv >= 6 ? 'alto' : uv >= 3 ? 'moderado' : 'baixo';
const graus = t => `${num(t, 0)} °C`;
const fmtHoraSol = x => { if (x == null) return '–'; const m = Math.round(x * 60); return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`; };
// [14, 15, 16, 19] → "14h às 17h e 19h às 20h"
function intervalos(horas) {
  const partes = [];
  let ini = null, ant = null;
  for (const h of horas) {
    if (ini == null) ini = h;
    else if (h !== ant + 1) { partes.push([ini, ant + 1]); ini = h; }
    ant = h;
  }
  if (ini != null) partes.push([ini, ant + 1]);
  return partes.map(([a, b]) => `${a}h às ${b}h`).join(' e ');
}

// água, ar, sol, UV e trovoada de um pico num dia (só horas com luz do dia, menos a água)
function condicoesDia(s, diaStr) {
  const hs = s.horas.filter(h => h.dia === diaStr);
  const claras = hs.filter(h => h.claro);
  const vals = (lista, k) => lista.map(h => h[k]).filter(v => v != null);
  const agua = vals(claras.length ? claras : hs, 'agua');
  const ar = vals(claras, 'ar');
  const uv = vals(claras, 'uv');
  const uvAltas = claras.filter(h => (h.uv ?? 0) >= 6).map(h => h.hora);
  return {
    agua: agua.length ? agua.reduce((a, b) => a + b, 0) / agua.length : null,
    arMin: ar.length ? Math.min(...ar) : null,
    arMax: ar.length ? Math.max(...ar) : null,
    uvMax: uv.length ? Math.max(...uv) : null,
    uvAltas,
    raios: claras.filter(h => h.raio).map(h => h.hora),
    sol: s.sol ? s.sol[diaStr] : null,
  };
}
const alertaRaio = (cond, quando) => cond.raios.length
  ? `<p class="alerta" role="alert"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg><span><strong>Risco de trovoada ${quando} das ${intervalos(cond.raios)}.</strong> Ouviu trovão ou viu raio, saia da água.</span></p>`
  : '';

function explicar(h, p) {
  const c = h.c, o = ondulacao(h);
  const e = exposicao(o.dir, p.facing);
  const entrada = e >= 0.85 ? 'entrando de frente' : e >= 0.5 ? 'entrando meio de lado' : e > 0 ? 'chegando bem de lado' : 'de costas pra praia';
  const vento = c.ef <= 6 ? 'quase sem vento'
    : `vento ${rotuloVento(c)} (${num(h.vento, 0)} km/h${h.rajada > h.vento + 8 ? `, rajadas de ${num(h.rajada, 0)}` : ''})`;
  return `Ondulação de ${dirPT(o.dir)} com ${num(o.per, 0)} s, ${entrada}, e ${vento}.`;
}

function fmtTempo(h) {
  const m = Math.max(5, Math.round(h * 60 / 5) * 5);
  if (m < 60) return `~${m} min`;
  const hh = Math.floor(m / 60), mm = m % 60;
  return `~${hh}h${mm ? String(mm).padStart(2, '0') : ''}`;
}
function fmtHora(x) {
  let hh = Math.floor(x), mm = Math.round((x - hh) * 60 / 5) * 5;
  if (mm === 60) { hh++; mm = 0; }
  hh %= 24;
  return mm ? `${hh}h${String(mm).padStart(2, '0')}` : `${hh}h`;
}
const fmtKm = km => `${km < 10 ? num(km, 1) : Math.round(km)} km`;
const fmtViagem = v => `${v.estimada ? '~' : ''}${fmtKm(v.km)} · ${fmtTempo(v.horas)}`;
const fmtDist = m => m < 1000 ? `${Math.max(10, Math.round(m / 10) * 10)} m` : fmtKm(m / 1000);
const fmtDistFala = m => m < 1000 ? `${Math.max(50, Math.round(m / 50) * 50)} metros` : `${num(m / 1000, 1)} quilômetros`;
const fmtReais = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');

function rotuloDia(diaStr, i) {
  if (i === 0) return 'Hoje';
  if (i === 1) return 'Amanhã';
  const d = new Date(diaStr + 'T12:00:00Z');
  return `${SEMANA[d.getUTCDay()]} ${d.getUTCDate()}`;
}
function rotuloDiaLongo(diaStr, i) {
  const d = new Date(diaStr + 'T12:00:00Z');
  const data = `${SEMANA[d.getUTCDay()].toLowerCase()} ${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
  return i === 0 ? `Hoje, ${data}` : i === 1 ? `Amanhã, ${data}` : data.charAt(0).toUpperCase() + data.slice(1);
}

// ---------- navegação entre telas ----------
// cada tela entra no histórico, assim o botão voltar do celular funciona
function irPara(tela) {
  if (tela === S.tela) return;
  const n = (history.state && history.state.n) || 0;
  try { history.pushState({ tela, n: n + 1 }, ''); } catch { /* sem histórico */ }
  S.tela = tela;
  render();
  window.scrollTo(0, 0);
}
function voltarTela() {
  if (history.state && history.state.n > 0) { history.back(); return; }
  S.tela = 'inicio';
  try { history.replaceState({ tela: 'inicio', n: 0 }, ''); } catch { /* sem histórico */ }
  render();
}
const cabecalhoTela = (titulo, sub) => `<header class="tela-cab">
    <button type="button" class="voltar" data-voltar>${ICONE.voltar}Voltar</button>
    <h2>${titulo}</h2>
    ${sub ? `<p class="sub">${sub}</p>` : ''}
  </header>`;

// ---------- telas ----------
let MAPA_GERAL = null;

function render() {
  if (MAPA_GERAL) { MAPA_GERAL.remove(); MAPA_GERAL = null; }
  // saiu da tela de marcar com algum pico sem previsão: baixa de novo incluindo ele
  if (S.precisaRecarregar && S.tela !== 'comparar') { S.precisaRecarregar = false; carregar(true); }
  $('#local-nome').textContent = S.loc ? S.loc.nome : 'Escolha um local';
  const el = $('#conteudo');
  if (!S.loc || S.tela === 'local') { el.innerHTML = telaLocal(); return; }
  if (!S.series) { el.innerHTML = S.erro ? telaErro() : telaCarregando(); return; }
  const [tipo, arg] = S.tela.split(':');
  if (tipo === 'picos') el.innerHTML = telaRegioes();
  else if (tipo === 'regiao') el.innerHTML = telaRegiao(arg);
  else if (tipo === 'dias') el.innerHTML = telaDias();
  else if (tipo === 'mapa') { el.innerHTML = telaMapa(); iniciarMapaGeral(); }
  else if (tipo === 'ajustes') el.innerHTML = telaAjustes();
  else if (tipo === 'favoritos') el.innerHTML = telaFavoritos();
  else if (tipo === 'comparar') { el.innerHTML = telaComparar(); atualizarSelecao(); }
  else if (tipo === 'seguranca') el.innerHTML = telaSeguranca();
  else if (tipo === 'diario') el.innerHTML = telaDiario();
  else if (tipo === 'diario-novo') el.innerHTML = telaDiarioNovo(arg);
  else el.innerHTML = telaInicio();
}

function telaLocal() {
  return `<section class="inicio">
    ${S.loc ? `<button type="button" class="voltar" data-voltar>${ICONE.voltar}Voltar</button>` : ''}
    <h2>${S.loc ? 'Trocar local' : 'Onde você está?'}</h2>
    <p>O Pico Certo usa sua localização pra achar os picos perto de você, lê ondulação, vento e maré dos próximos 7 dias e diz onde e quando cair.</p>
    ${S.msgLocal ? `<p class="aviso">${esc(S.msgLocal)}</p>` : ''}
    <button type="button" class="btn" data-gps${S.localizando ? ' disabled' : ''}>${S.localizando ? 'Pegando sua localização…' : 'Usar minha localização'}</button>
    <label class="cidade" for="sel-cidade">Ou escolha uma cidade
      <select id="sel-cidade"><option value="">Escolher…</option>${CIDADES.map((c, i) => `<option value="${i}">${esc(c.nome)}</option>`).join('')}</select>
    </label>
  </section>`;
}
function telaCarregando() {
  return `<section class="estado carregando" aria-live="polite">
    <h2>Lendo o mar…</h2>
    <p>Baixando ondulação, vento, maré e rotas dos picos perto de ${esc(S.loc.nome)}.</p>
    <div class="onda-anim"></div>
  </section>`;
}
function telaErro() {
  return `<section class="estado">
    <h2>Sem previsão</h2>
    <p>Não consegui baixar a previsão (${esc(S.erro)}). Confira a internet e tente de novo.</p>
    <button type="button" class="btn" data-atualizar>Tentar de novo</button>
  </section>`;
}

function faixaHoras(s, diaStr, j, compacta) {
  const hs = s.horas.filter(h => h.dia === diaStr && h.claro);
  if (!hs.length) return '';
  const a = agoraLocal(s.off), hoje = a.dia === diaStr;
  const barras = hs.map(h => {
    const f = faixa(h.c.nota);
    const dentro = j && h.hora >= j.ini && h.hora < j.fim;
    const passou = hoje && h.hora < Math.floor(a.hora);
    return `<i class="${f.cls}${dentro ? ' dentro' : ''}${passou ? ' passou' : ''}" style="height:${Math.max(6, h.c.nota * 10)}%" title="${h.hora}h · nota ${num(h.c.nota)}"></i>`;
  }).join('');
  return `<span class="faixa${compacta ? ' compacta' : ''}" role="img" aria-label="Nota hora a hora, das ${hs[0].hora}h às ${hs[hs.length - 1].hora}h${j ? `; melhor janela das ${j.ini}h às ${j.fim}h` : ''}">
    <span class="fx-barras">${barras}</span>
    <span class="fx-eixo"><span>${hs[0].hora}h</span><span>${hs[Math.floor(hs.length / 2)].hora}h</span><span>${hs[hs.length - 1].hora}h</span></span>
  </span>`;
}

function telaInicio() {
  return sugestaoMini() + comparacao() + categorias()
    + `<p class="rodape-mini">Previsão das ${new Date(S.geradoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}${S.offline ? ' (sem internet, mostrando a última)' : ''} · <button type="button" data-atualizar>Atualizar</button></p>`;
}

const veredito = nota => nota >= 6 ? 'Vale ir' : nota >= 4.5 ? 'Dá pra cair, sem esperar muito' : 'Melhor esperar outro dia';

// os picos marcados no dia escolhido, do melhor pro pior.
// modo 'onda': só a nota da onda (a viagem desempata); modo 'viagem': nota descontando o tempo de estrada
function rankingMarcados(dIdx) {
  const sel = new Set(S.selecionados);
  const lista = S.rk[dIdx].filter(r => sel.has(r.s.pico.id));
  return S.modoComp === 'viagem'
    ? lista.sort((a, b) => b.valor - a.valor)
    : lista.sort((a, b) => ((b.j ? b.j.nota : -1) - (a.j ? a.j.nota : -1)) || (b.valor - a.valor));
}

function comparacao() {
  const n = S.selecionados.length;
  if (!n) {
    return `<section class="comparar vazio" aria-labelledby="cmp-tit">
      <h2 class="secao-tit" id="cmp-tit">Comparar picos</h2>
      <p>Marque os picos que você costuma surfar e o app diz qual está melhor entre eles.</p>
      <button type="button" class="btn" data-ir="comparar">Escolher picos</button>
    </section>`;
  }
  const dIdx = Math.min(S.diaComp ?? S.dia, S.dias.length - 1), diaStr = S.dias[dIdx];
  const rk = rankingMarcados(dIdx);
  const faltando = n - rk.length;  // marcados que ainda não têm previsão baixada
  const chips = S.dias.map((d, i) => {
    const t = rankingMarcados(i)[0], nota = t && t.j ? t.j.nota : null, f = nota == null ? null : faixa(nota);
    return `<button type="button" class="dia-mini${i === dIdx ? ' sel' : ''}" aria-pressed="${i === dIdx}" data-dia-comp="${i}">
      <span>${rotuloDia(d, i)}</span><span class="pill pq ${f ? f.cls : 's0'}">${nota == null ? '–' : num(nota)}</span>
    </button>`;
  }).join('');
  const top = rk[0];
  let vencedor;
  if (!top || !top.j) {
    vencedor = '<p class="porque">Nenhum dos picos marcados tem horário com luz do dia nesse dia.</p>';
  } else {
    const s = top.s, p = s.pico, j = top.j, c = j.melhor.c, f = faixa(j.nota), cond = condicoesDia(s, diaStr);
    vencedor = `<div class="cmp-vencedor">
      <p class="eyebrow">${S.modoComp === 'viagem' ? 'Melhor contando a viagem' : 'Melhor onda entre os marcados'} · ${rotuloDiaLongo(diaStr, dIdx)}</p>
      <div class="cv-topo">
        <div class="cv-nome"><h3>${esc(p.nome)}</h3><p class="sub">${esc(localPico(p))} · ${fmtViagem(s.viagem)}</p></div>
        <div class="nota-media ${f.cls}" role="img" aria-label="Nota ${num(j.nota)} de 10, ${f.nome}"><span class="nm-num">${num(j.nota)}</span><span class="nm-rot">${f.nome}</span></div>
      </div>
      <p class="janela"><span class="jan-hora">${j.ini}h–${j.fim}h</span><span class="veredito">${veredito(j.nota)}</span></p>
      <ul class="resumo">
        <li><span class="leve">Onda</span> ≈ ${faixaM(c.praia)}</li>
        <li><span class="leve">Vento</span> ${rotuloVento(c)}</li>
        ${cond.agua != null ? `<li><span class="leve">Água</span> ${graus(cond.agua)} · ${roupa(cond.agua).curta}</li>` : ''}
      </ul>
      ${alertaRaio(cond, dIdx === 0 ? 'hoje' : dIdx === 1 ? 'amanhã' : 'nesse dia')}
      <div class="acoes acoes-cheias">
        <button type="button" class="btn" data-abrir="${esc(p.id)}" data-no-dia="${dIdx}">Ver previsão e rota</button>
        <button type="button" class="btn-sec" data-chamar="${esc(p.id)}" data-no-dia="${dIdx}">${ICONE.chamar}Chamar a galera</button>
      </div>
      <p class="aviso" id="msg-chamar-cmp" hidden></p>
    </div>`;
  }
  const outros = rk.slice(1).map((r, i) => {
    const f = r.j ? faixa(r.j.nota) : FAIXAS[FAIXAS.length - 1];
    return `<li><button type="button" class="linha cmp-linha" data-abrir="${esc(r.s.pico.id)}" data-no-dia="${dIdx}">
      <span class="cl-pos">${i + 2}º</span>
      <span class="ln-texto"><strong>${esc(r.s.pico.nome)}</strong><span class="leve">${r.j ? `${r.j.ini}h–${r.j.fim}h` : 'sem janela'} · ${fmtViagem(r.s.viagem)}</span></span>
      <span class="pill pq ${f.cls}">${r.j ? num(r.j.nota) : '–'}</span>
    </button></li>`;
  }).join('');
  return `<section class="comparar" aria-labelledby="cmp-tit">
    <div class="cmp-cab">
      <h2 class="secao-tit" id="cmp-tit">Comparar picos</h2>
      <button type="button" class="btn-sec" data-ir="comparar">Editar (${n})</button>
    </div>
    <div class="seg seg-largo" role="radiogroup" aria-label="Como comparar">
      <button type="button" role="radio" aria-checked="${S.modoComp !== 'viagem'}" data-modo-comp="onda">Melhor onda</button>
      <button type="button" role="radio" aria-checked="${S.modoComp === 'viagem'}" data-modo-comp="viagem">Onda + distância</button>
    </div>
    <div class="dias-mini" role="group" aria-label="Dia da comparação">${chips}</div>
    ${vencedor}
    ${outros ? `<ol class="cmp-lista">${outros}</ol>` : ''}
    ${faltando > 0 ? `<p class="leve">Baixando a previsão de ${faltando} ${faltando === 1 ? 'pico marcado' : 'picos marcados'}…</p>` : ''}
  </section>`;
}

// sugestão pela localização, numa linha só
function sugestaoMini() {
  const top = S.rk[S.dia][0];
  if (!top || !top.j) return '';
  const p = top.s.pico, j = top.j, f = faixa(j.nota);
  const cond = condicoesDia(top.s, S.dias[S.dia]);
  return `<section class="sugestao-mini" aria-labelledby="sug-tit">
    <p class="eyebrow" id="sug-tit">Sugestão: melhor pico perto de você · ${rotuloDia(S.dias[S.dia], S.dia).toLowerCase()}</p>
    <button type="button" class="linha" data-abrir="${esc(p.id)}">
      <span class="ln-texto"><strong>${esc(p.nome)}</strong><span class="leve">${j.ini}h–${j.fim}h · ${fmtViagem(top.s.viagem)}${cond.raios.length ? ' · risco de trovoada' : ''}</span></span>
      <span class="pill pq ${f.cls}">${num(j.nota)}</span>
      ${ICONE.seguir}
    </button>
  </section>`;
}

// tela pra marcar os picos da comparação, separados por região
function telaComparar() {
  const sel = new Set(S.selecionados);
  const notaHoje = new Map(S.rk[S.dia].map(r => [r.s.pico.id, r]));
  const grupos = new Map();
  for (const p of todosPicos()) {
    const reg = regiaoDe(p);
    if (!grupos.has(reg.id)) grupos.set(reg.id, { reg, picos: [], d: Infinity });
    const g = grupos.get(reg.id);
    g.picos.push(p);
    g.d = Math.min(g.d, distKm(S.loc, p));
  }
  const lista = [...grupos.values()].sort((a, b) => a.d - b.d);
  const perto = lista.filter(g => g.d <= S.raio), longe = lista.filter(g => g.d > S.raio);
  const grupoHtml = g => {
    const linhas = g.picos.map(p => {
      const r = notaHoje.get(p.id), f = r && r.j ? faixa(r.j.nota) : null;
      return `<li><label class="linha-chk">
        <input type="checkbox" class="chk-pico" data-id="${esc(p.id)}" data-regiao="${esc(g.reg.id)}"${sel.has(p.id) ? ' checked' : ''}>
        <span class="ln-texto"><strong>${esc(p.nome)}</strong><span class="leve">${r ? `${r.j ? `${r.j.ini}h–${r.j.fim}h · ` : ''}${fmtViagem(r.s.viagem)}` : `${Math.round(distKm(S.loc, p))} km em linha reta`}</span></span>
        ${f ? `<span class="pill pq ${f.cls}">${num(r.j.nota)}</span>` : ''}
      </label></li>`;
    }).join('');
    const todos = g.picos.length > 1 ? `<label class="grupo-todos"><input type="checkbox" class="chk-regiao" data-regiao="${esc(g.reg.id)}"> Todos</label>` : '';
    return `<section class="grupo-regiao">
      <div class="grupo-cab"><span><strong>${esc(g.reg.nome)}</strong> <span class="leve">${esc(g.reg.cidade)}</span></span>${todos}</div>
      <ul class="linhas-chk">${linhas}</ul>
    </section>`;
  };
  return cabecalhoTela('Escolher picos', `Marque os picos pra comparar · nota de ${rotuloDia(S.dias[S.dia], S.dia).toLowerCase()}`)
    + `<div class="comparar-lista">${perto.map(grupoHtml).join('')}
      ${longe.length ? `<details class="outras-regioes"><summary>Outras regiões do Brasil (${longe.length})</summary>${longe.map(grupoHtml).join('')}</details>` : ''}
    </div>
    <div class="barra-acao">
      <span id="cmp-contagem">${S.selecionados.length} ${S.selecionados.length === 1 ? 'pico marcado' : 'picos marcados'}</span>
      <button type="button" class="btn-sec" data-limpar-selecao>Limpar</button>
      <button type="button" class="btn" data-voltar>Comparar</button>
    </div>`;
}

// atualiza contagem e os "Todos" de cada região sem redesenhar a lista (não perde a rolagem)
function atualizarSelecao() {
  const c = $('#cmp-contagem');
  if (c) c.textContent = `${S.selecionados.length} ${S.selecionados.length === 1 ? 'pico marcado' : 'picos marcados'}`;
  document.querySelectorAll('.chk-regiao').forEach(chk => {
    const itens = [...document.querySelectorAll(`.chk-pico[data-regiao="${chk.dataset.regiao}"]`)];
    const marcados = itens.filter(i => i.checked).length;
    chk.checked = marcados === itens.length;
    chk.indeterminate = marcados > 0 && marcados < itens.length;
  });
}

function categorias() {
  const regs = regioesProximas(S.dia);
  const nPicos = S.series.length;
  let melhorDia = -1, melhorNota = -1;
  S.rk.forEach((r, i) => { const t = r[0]; if (t && t.j && t.valor > melhorNota) { melhorNota = t.valor; melhorDia = i; } });
  const metaDias = melhorDia >= 0 ? `Melhor: ${rotuloDia(S.dias[melhorDia], melhorDia).toLowerCase()} (${num(S.rk[melhorDia][0].j.nota)})` : 'Próximos 7 dias';
  const cat = (ir, icone, nome, meta) => `<button type="button" class="cat" data-ir="${ir}">
      <span class="cat-icone">${icone}</span>
      <span class="cat-nome">${nome}</span>
      <span class="cat-meta">${meta}</span>
    </button>`;
  return `<section class="categorias" aria-labelledby="cat-tit">
    <h2 class="secao-tit" id="cat-tit">Categorias</h2>
    <div class="cat-grade">
      ${cat('picos', ICONE.picos, 'Picos', `${regs.length} ${regs.length === 1 ? 'região' : 'regiões'} · ${nPicos} picos`)}
      ${cat('dias', ICONE.dias, 'Melhores dias', metaDias)}
      ${cat('mapa', ICONE.mapa, 'Mapa', 'Notas de hoje no mapa')}
      ${cat('favoritos', ICONE.favoritos, 'Favoritos', S.favoritos.length ? `${S.favoritos.length} ${S.favoritos.length === 1 ? 'pico' : 'picos'}${S.alertas.ativo ? ' · alertas ligados' : ''}` : 'Marque seus picos')}
      ${cat('diario', ICONE.diario, 'Diário', resumoDiario())}
      ${cat('seguranca', ICONE.seguranca, 'Segurança', 'Emergência e dicas')}
      ${cat('ajustes', ICONE.ajustes, 'Ajustes', `${NIVEIS[S.nivel].nome} · ${S.raio} km`)}
    </div>
  </section>`;
}

function telaRegioes() {
  const regs = regioesProximas(S.dia);
  const sub = S.foraDoRaio ? `Nenhum pico no raio de ${S.raio} km. Mostrando os mais perto.` : `Regiões num raio de ${S.raio} km · nota de ${rotuloDia(S.dias[S.dia], S.dia).toLowerCase()}`;
  const itens = regs.map(g => {
    const m = g.melhor, f = m ? faixa(m.j.nota) : FAIXAS[FAIXAS.length - 1];
    const melhorTxt = m ? (g.itens.length > 1 ? `Melhor: ${esc(m.s.pico.nome)} · ${m.j.ini}h–${m.j.fim}h` : `${m.j.ini}h–${m.j.fim}h`) : 'Sem janela';
    return `<li><button type="button" class="linha" data-ir="regiao:${esc(g.reg.id)}">
      <span class="ln-texto"><strong>${esc(g.reg.nome)}</strong><span class="leve">${esc(g.reg.cidade)} · ${g.itens.length} ${g.itens.length === 1 ? 'pico' : 'picos'} · ${fmtTempo(g.horas)}</span><span class="ln-extra">${melhorTxt}</span></span>
      <span class="pill ${f.cls}">${m ? num(m.j.nota) : '–'}</span>
      ${ICONE.seguir}
    </button></li>`;
  }).join('');
  return cabecalhoTela('Picos', sub) + `<ol class="linhas">${itens}</ol>`;
}

function itemPico(r, diaStr) {
  const s = r.s, p = s.pico, j = r.j, f = j ? faixa(j.nota) : FAIXAS[FAIXAS.length - 1];
  return `<li><button type="button" class="item" data-abrir="${esc(p.id)}">
    <span class="it-nome"><strong>${ehFavorito(p.id) ? ICONE.estrela : ''}${esc(p.nome)}</strong><span class="leve">${fmtViagem(s.viagem)}${p.aproximado ? ' · posição aproximada' : ''}</span></span>
    <span class="it-jan">${j ? `${j.ini}h–${j.fim}h` : 'sem janela'}</span>
    <span class="pill ${f.cls}">${j ? num(j.nota) : '–'}</span>
    <span class="it-faixa">${faixaHoras(s, diaStr, j, true)}</span>
  </button></li>`;
}

function telaRegiao(id) {
  const diaStr = S.dias[S.dia];
  const itens = S.rk[S.dia].filter(r => r.s.pico.regiao === id).sort((a, b) => (b.j ? b.j.nota : -1) - (a.j ? a.j.nota : -1));
  if (!itens.length) { S.tela = 'picos'; return telaRegioes(); }
  const reg = regiaoDe(itens[0].s.pico);
  return cabecalhoTela(esc(reg.nome), `${esc(reg.cidade)} · ${itens.length} ${itens.length === 1 ? 'pico' : 'picos'} · nota de ${rotuloDia(diaStr, S.dia).toLowerCase()}`)
    + `<ol class="lista-picos">${itens.map(r => itemPico(r, diaStr)).join('')}</ol>`;
}

function telaDias() {
  const linhas = S.dias.map((d, i) => {
    const t = S.rk[i][0];
    if (!t || !t.j) {
      return `<li><div class="linha sem com-dia"><span class="ln-dia">${rotuloDia(d, i)}</span><span class="ln-texto"><span class="leve">Sem janela com luz do dia</span></span></div></li>`;
    }
    const f = faixa(t.j.nota), p = t.s.pico;
    return `<li><button type="button" class="linha com-dia" data-abrir="${esc(p.id)}" data-no-dia="${i}">
      <span class="ln-dia">${rotuloDia(d, i)}</span>
      <span class="ln-texto"><strong>${esc(p.nome)}</strong><span class="leve">${esc(localPico(p))} · ${t.j.ini}h–${t.j.fim}h</span></span>
      <span class="pill ${f.cls}">${num(t.j.nota)}</span>
      ${ICONE.seguir}
    </button></li>`;
  }).join('');
  return cabecalhoTela('Melhores dias', `O melhor pico de cada dia, já descontando a viagem · nível ${NIVEIS[S.nivel].nome.toLowerCase()}`)
    + `<ol class="linhas">${linhas}</ol>`;
}

function telaFavoritos() {
  const diaStr = S.dias[S.dia];
  const itens = S.rk[S.dia].filter(r => ehFavorito(r.s.pico.id)).sort((a, b) => (b.j ? b.j.nota : -1) - (a.j ? a.j.nota : -1));
  const alertas = S.alertas.ativo
    ? `<p class="comp">Alertas ligados: você recebe um aviso na véspera às ${S.alertas.hora}h quando um favorito passar de nota ${num(S.alertas.notaMin)}. <button type="button" data-ir="ajustes">Mudar</button></p>`
    : `<p class="comp">Quer um aviso no celular quando um favorito for ficar bom? <button type="button" data-ir="ajustes">Ligar alertas</button></p>`;
  if (!itens.length) {
    return cabecalhoTela('Favoritos') + `<section class="estado">
      <p>Você ainda não marcou nenhum pico. Abra um pico e toque em <strong>Favoritar</strong>, ao lado do nome.</p>
      <button type="button" class="btn" data-ir="picos">Ver picos</button>
    </section>` + alertas;
  }
  return cabecalhoTela('Favoritos', `Seus picos · nota de ${rotuloDia(diaStr, S.dia).toLowerCase()}`)
    + `<ol class="lista-picos">${itens.map(r => itemPico(r, diaStr)).join('')}</ol>` + alertas;
}

function telaSeguranca() {
  const fone = (numero, nome, quando) => `<li><a class="linha fone" href="tel:${numero}">
      <span class="ln-dia">${numero}</span>
      <span class="ln-texto"><strong>${nome}</strong><span class="leve">${quando}</span></span>
      ${ICONE.seguir}
    </a></li>`;
  return cabecalhoTela('Segurança', 'Toque no número pra ligar') + `
    <ol class="linhas">
      ${fone('193', 'Bombeiros e guarda-vidas', 'Afogamento, pessoa em perigo no mar')}
      ${fone('185', 'Marinha', 'Emergência no mar, embarcação ou pessoa à deriva')}
      ${fone('192', 'SAMU', 'Ferimento, corte de coral, desmaio')}
    </ol>
    <section class="bloco">
      <h3 class="secao-tit">Avisar alguém</h3>
      <p class="leve">Manda sua localização pra um amigo ou pra família antes de cair, ou numa emergência.</p>
      <button type="button" class="btn" data-compartilhar>Compartilhar minha localização</button>
      <p class="aviso" id="msg-compartilhar" hidden></p>
    </section>
    <section class="bloco texto-seg">
      <h3 class="secao-tit">Corrente de retorno</h3>
      <p><strong>Como reconhecer:</strong> um trecho onde a onda quebra menos, a água fica mais escura ou barrenta e a espuma corre pro fundo.</p>
      <p><strong>Se ela te puxar:</strong> não nade contra. Fique na prancha, nade paralelo à praia até sair da corrente e só então volte pra areia. Cansou? Boie, levante o braço e peça ajuda.</p>
    </section>
    <section class="bloco texto-seg">
      <h3 class="secao-tit">Raio</h3>
      <p>Ouviu trovão, saia da água: no mar você é o ponto mais alto. Espere 30 minutos depois do último trovão pra voltar.</p>
    </section>
    <section class="bloco texto-seg">
      <h3 class="secao-tit">Antes de cair</h3>
      <p>Confira a ficha do pico (fundo, perigos e nível), surfe acompanhado em pico desconhecido e use o leash.</p>
    </section>`;
}

async function compartilharLocal() {
  const msg = $('#msg-compartilhar');
  const avisar = t => { if (msg) { msg.hidden = false; msg.textContent = t; } };
  if (!('geolocation' in navigator)) { avisar('Este aparelho não dá acesso à localização.'); return; }
  avisar('Pegando sua localização…');
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude: lat, longitude: lon } = pos.coords;
    const perto = S.series ? S.series.map(s => ({ p: s.pico, d: distKm({ lat, lon }, s.pico) })).sort((a, b) => a.d - b.d)[0] : null;
    const onde = perto && perto.d < 2 ? ` em ${perto.p.nome}` : '';
    const texto = `Estou surfando${onde}. Minha localização: https://www.openstreetmap.org/?mlat=${lat.toFixed(5)}&mlon=${lon.toFixed(5)}#map=17/${lat.toFixed(5)}/${lon.toFixed(5)}`;
    compartilharTexto(texto, avisar);
  }, err => avisar(err.code === 1 ? 'A localização está bloqueada. Libere nas permissões.' : 'Não consegui pegar sua localização. Tente de novo.'),
  { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 });
}

// abre o "compartilhar" do celular (WhatsApp, SMS…); sem ele, copia o texto
async function compartilharTexto(texto, avisar) {
  if (NATIVO && typeof NATIVO.compartilhar === 'function') { NATIVO.compartilhar(texto); avisar('Escolha com quem compartilhar.'); return; }
  if (navigator.share) { try { await navigator.share({ text: texto }); avisar('Compartilhado.'); return; } catch { /* cancelou ou não deu */ } }
  try { await navigator.clipboard.writeText(texto); avisar('Mensagem copiada. Cole no WhatsApp pra mandar.'); }
  catch { avisar(texto); }
}

const URL_APP = 'https://igorobinha.github.io/pico-certo/';

// "Bora? Itapuã amanhã das 6h às 9h, nota 7,2…": convite pros amigos com a previsão do pico
function textoChamar(s, dIdx) {
  const p = s.pico, diaStr = S.dias[dIdx];
  const j = janela(s, diaStr, horaMinima(s, dIdx));
  const quando = dIdx === 0 ? 'hoje' : dIdx === 1 ? 'amanhã' : rotuloDiaLongo(diaStr, dIdx).toLowerCase();
  if (!j) return `Bora surfar? ${p.nome} ${quando} não tem janela boa, mas olha a previsão da semana no Pico Certo: ${URL_APP}`;
  const c = j.melhor.c, cond = condicoesDia(s, diaStr);
  const agua = cond.agua != null ? ` Água ${graus(cond.agua)}.` : '';
  return `Bora? ${p.nome} ${quando} das ${j.ini}h às ${j.fim}h, nota ${num(j.nota)} (${faixa(j.nota).nome.toLowerCase()}). `
    + `Onda ≈ ${faixaM(c.praia)}, ${textoVento(c)}.${agua} 🤙\nPrevisão no Pico Certo: ${URL_APP}`;
}

function chamarGalera(id, dIdx, msgId) {
  const s = S.series && S.series.find(x => x.pico.id === id);
  if (!s) return;
  const msg = $('#' + msgId);
  compartilharTexto(textoChamar(s, dIdx), t => { if (msg) { msg.hidden = false; msg.textContent = t; } });
}

// ---------- diário de sessões (fica guardado no celular) ----------
const TAMANHOS = ['marola', 'joelho', 'cintura', 'peito', 'cabeça', 'acima da cabeça'];
const CROWDS = ['vazio', 'tranquilo', 'cheio', 'lotado'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Date → 'AAAA-MM-DDTHH:MM' no horário do aparelho
function horaLocalISO(d) {
  const z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`;
}
function fmtDataSessao(iso) {
  const [a, m, dia] = iso.slice(0, 10).split('-').map(Number);
  return `${SEMANA[new Date(a, m - 1, dia).getDay()]} ${dia} ${MESES[m - 1]} · ${iso.slice(11, 16).replace(':', 'h')}`;
}
const fmtDuracao = min => min < 60 ? `${min} min` : `${Math.floor(min / 60)}h${min % 60 ? String(min % 60).padStart(2, '0') : ''}`;
const estrelasTexto = n => '★'.repeat(n) + '☆'.repeat(5 - n);

// o que a previsão dizia na hora em que a sessão começou (só dá pra hoje e dias à frente)
function previsaoNaHora(s, inicio) {
  if (!s) return null;
  const h = s.horas.find(x => x.dia === inicio.slice(0, 10) && x.hora === +inicio.slice(11, 13));
  return h && h.c ? { nota: +h.c.nota.toFixed(1), praia: +h.c.praia.toFixed(2), vento: rotuloVento(h.c) } : null;
}

function estatisticasDiario() {
  const d = S.diario, agora = new Date();
  const mes = horaLocalISO(agora).slice(0, 7);
  const cont = {};
  d.forEach(s => { cont[s.picoNome] = (cont[s.picoNome] || 0) + 1; });
  const segunda = new Date(agora);
  segunda.setHours(0, 0, 0, 0);
  segunda.setDate(segunda.getDate() - ((segunda.getDay() + 6) % 7));
  const semanas = [];
  for (let k = 7; k >= 0; k--) {
    const ini = new Date(segunda); ini.setDate(ini.getDate() - 7 * k);
    const fim = new Date(ini); fim.setDate(fim.getDate() + 7);
    semanas.push({ ini, n: d.filter(s => { const t = new Date(s.inicio); return t >= ini && t < fim; }).length });
  }
  return {
    total: d.length,
    doMes: d.filter(s => s.inicio.startsWith(mes)).length,
    horas: d.reduce((a, s) => a + s.duracao, 0) / 60,
    top: Object.entries(cont).sort((a, b) => b[1] - a[1])[0] || null,
    media: d.length ? d.reduce((a, s) => a + s.nota, 0) / d.length : null,
    semanas,
  };
}
function resumoDiario() {
  if (!S.diario.length) return 'Registre suas sessões';
  const n = estatisticasDiario().doMes;
  return `${n} ${n === 1 ? 'sessão' : 'sessões'} este mês`;
}

function graficoSemanasDiario(semanas) {
  const W = Math.max(260, Math.min(620, window.innerWidth - 62)), H = 118, pl = 6, pr = 6, pt = 18, pb = 22;
  const n = semanas.length, slot = (W - pl - pr) / n, bw = Math.min(24, slot * 0.55);
  const max = Math.max(3, ...semanas.map(s => s.n));
  const y = v => pt + (H - pt - pb) * (1 - v / max);
  let g = `<line class="base" x1="${pl}" x2="${W - pr}" y1="${y(0)}" y2="${y(0)}"/>`;
  semanas.forEach((s, i) => {
    const cx = pl + i * slot + slot / 2, topo = y(s.n);
    if (s.n) g += `<path class="barra-diario" d="${barPath(cx - bw / 2, topo, bw, y(0) - topo, 4)}"/>`;
    g += `<text class="eixo" x="${cx}" y="${s.n ? topo - 5 : y(0) - 5}" text-anchor="middle" font-weight="${s.n ? 700 : 400}">${s.n}</text>`;
    g += `<text class="eixo" x="${cx}" y="${H - 5}" text-anchor="middle">${i === n - 1 ? 'esta' : `${s.ini.getDate()}/${s.ini.getMonth() + 1}`}</text>`;
  });
  return `<p class="leve graf-tit">Sessões por semana</p><svg class="graf" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Sessões por semana nas últimas 8 semanas">${g}</svg>`;
}

function sessaoHtml(s) {
  const detalhes = [s.tamanho && `onda ${s.tamanho}`, s.crowd && `crowd ${s.crowd}`, s.prancha && esc(s.prancha)].filter(Boolean).join(' · ');
  const prev = s.previsto
    ? `Previsão naquela hora: nota ${num(s.previsto.nota)} (${faixa(s.previsto.nota).nome.toLowerCase()}), onda ≈ ${faixaM(s.previsto.praia)}, vento ${esc(s.previsto.vento)}`
    : 'Sem previsão guardada pra essa hora';
  const acoes = S.apagando === s.id
    ? `<span>Apagar esta sessão?</span><button type="button" class="btn-sec" data-confirmar-apagar="${esc(s.id)}">Apagar</button><button type="button" class="btn-sec" data-cancelar-apagar>Cancelar</button>`
    : `<button type="button" class="link" data-apagar-sessao="${esc(s.id)}">Apagar</button>`;
  return `<li class="sessao">
    <div class="ss-topo">
      <div class="ln-texto"><strong>${esc(s.picoNome)}</strong><span class="leve">${fmtDataSessao(s.inicio)} · ${fmtDuracao(s.duracao)}</span></div>
      <span class="ss-nota" role="img" aria-label="${s.nota} de 5 estrelas">${estrelasTexto(s.nota)}</span>
    </div>
    ${detalhes ? `<p>${detalhes}</p>` : ''}
    ${s.obs ? `<p class="ss-obs">${esc(s.obs)}</p>` : ''}
    <p class="leve">${prev}</p>
    <div class="ss-acoes">${acoes}</div>
  </li>`;
}

function telaDiario() {
  const e = estatisticasDiario();
  return cabecalhoTela('Diário', 'Suas sessões, guardadas no seu celular') + `
    <section class="bloco diario-resumo">
      <dl class="condicoes">
        <div><dt>Este mês</dt><dd><strong>${e.doMes}</strong><span>${e.doMes === 1 ? 'sessão' : 'sessões'}</span></dd></div>
        <div><dt>Na água</dt><dd><strong>${num(e.horas, e.horas % 1 ? 1 : 0)} h</strong><span>em ${e.total} ${e.total === 1 ? 'sessão' : 'sessões'}</span></dd></div>
        <div><dt>Pico mais surfado</dt><dd><strong>${e.top ? esc(e.top[0]) : '–'}</strong><span>${e.top ? `${e.top[1]} ${e.top[1] === 1 ? 'sessão' : 'sessões'}` : 'registre a primeira'}</span></dd></div>
        <div><dt>Sua nota média</dt><dd><strong>${e.media != null ? `${num(e.media)} ★` : '–'}</strong><span>de 1 a 5 estrelas</span></dd></div>
      </dl>
      ${e.total ? graficoSemanasDiario(e.semanas) : ''}
    </section>
    <button type="button" class="btn" data-ir="diario-novo">Registrar sessão</button>
    ${S.diario.length
      ? `<ol class="sessoes">${S.diario.map(sessaoHtml).join('')}</ol>`
      : '<p class="leve">Nenhuma sessão ainda. Depois de surfar, toque em Registrar sessão: o app guarda também o que a previsão dizia, pra você comparar com o que sentiu na água.</p>'}`;
}

function telaDiarioNovo(picoId) {
  const agora = new Date(), ini = new Date(agora.getTime() - 2 * 3600 * 1000);
  ini.setMinutes(0);
  const iso = horaLocalISO(ini);
  // favoritos primeiro, depois os mais perto
  const picos = (S.series || []).map(s => s.pico)
    .sort((a, b) => (ehFavorito(b.id) - ehFavorito(a.id)) || (distKm(S.loc, a) - distKm(S.loc, b)));
  const sel = picoId || (S.diario[0] && S.diario[0].picoId) || (picos[0] && picos[0].id);
  const radios = (nome, lista) => lista.map((t, i) =>
    `<input type="radio" name="${nome}" id="${nome}-${i}" value="${esc(t)}"><label for="${nome}-${i}">${esc(t)}</label>`).join('');
  return cabecalhoTela('Registrar sessão') + `<form class="bloco form-sessao" id="form-sessao">
    <label class="campo" for="ss-pico">Pico<select id="ss-pico">${picos.map(p =>
      `<option value="${esc(p.id)}"${p.id === sel ? ' selected' : ''}>${esc(p.nome)}${p.nome !== regiaoDe(p).nome ? ` · ${esc(regiaoDe(p).nome)}` : ''}</option>`).join('')}</select></label>
    <div class="aj-grid">
      <label class="campo" for="ss-data">Dia<input type="date" id="ss-data" value="${iso.slice(0, 10)}" max="${horaLocalISO(agora).slice(0, 10)}" required></label>
      <label class="campo" for="ss-hora">Entrou na água às<input type="time" id="ss-hora" value="${iso.slice(11, 16)}" required></label>
    </div>
    <label class="campo" for="ss-duracao">Quanto tempo<select id="ss-duracao">${[30, 45, 60, 90, 120, 150, 180, 240].map(m =>
      `<option value="${m}"${m === 90 ? ' selected' : ''}>${fmtDuracao(m)}</option>`).join('')}</select></label>
    <fieldset class="estrelas-campo"><legend>Sua nota pra sessão</legend>
      <div class="estrelas">${[5, 4, 3, 2, 1].map(n =>
        `<input type="radio" name="ss-nota" id="ss-nota-${n}" value="${n}"${n === 3 ? ' checked' : ''}><label for="ss-nota-${n}" title="${n} de 5">★<span class="sr">${n} de 5</span></label>`).join('')}</div>
    </fieldset>
    <fieldset class="chips-campo"><legend>Tamanho da onda</legend><div class="chips">${radios('ss-tamanho', TAMANHOS)}</div></fieldset>
    <fieldset class="chips-campo"><legend>Crowd</legend><div class="chips">${radios('ss-crowd', CROWDS)}</div></fieldset>
    <label class="campo" for="ss-prancha">Prancha (opcional)<input id="ss-prancha" maxlength="40" placeholder="Ex.: 6'0 shortboard"></label>
    <label class="campo" for="ss-obs">Como foi (opcional)<textarea id="ss-obs" rows="3" maxlength="400" placeholder="Ex.: séries boas na maré enchendo, o vento entrou às 10h"></textarea></label>
    <button type="submit" class="btn">Salvar sessão</button>
  </form>`;
}

function telaMapa() {
  return cabecalhoTela('Mapa', `${S.series.length} picos · nota de ${rotuloDia(S.dias[S.dia], S.dia).toLowerCase()}. Toque num pico pra ver a previsão.`)
    + '<div id="mapa-geral" class="mapa mapa-geral"></div>';
}

function iniciarMapaGeral() {
  const el = $('#mapa-geral');
  if (!el) return;
  if (!window.L) { el.innerHTML = '<p class="leve" style="padding:14px">Não consegui carregar o mapa. Confira a internet.</p>'; return; }
  MAPA_GERAL = L.map(el, { scrollWheelZoom: false });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  }).addTo(MAPA_GERAL);
  const pontos = [[S.loc.lat, S.loc.lon]];
  for (const r of S.rk[S.dia]) {
    const p = r.s.pico, f = r.j ? faixa(r.j.nota) : FAIXAS[FAIXAS.length - 1];
    L.marker([p.lat, p.lon], {
      icon: L.divIcon({ className: `mk-nota ${f.cls}`, html: `<span>${r.j ? num(r.j.nota) : '–'}</span>`, iconSize: [34, 34] }),
      keyboard: false, riseOnHover: true,
    }).addTo(MAPA_GERAL).bindPopup(`<div class="pop"><strong>${esc(p.nome)}</strong><span>${esc(localPico(p))}</span>
      <span>${r.j ? `${r.j.ini}h–${r.j.fim}h · nota ${num(r.j.nota)}` : 'Sem janela'}</span>
      <button type="button" class="btn-sec" data-pop-abrir="${esc(p.id)}">Ver previsão e rota</button></div>`);
    pontos.push([p.lat, p.lon]);
  }
  L.marker([S.loc.lat, S.loc.lon], { icon: L.divIcon({ className: 'mk mk-eu', html: '<span></span>', iconSize: [18, 18] }), keyboard: false })
    .addTo(MAPA_GERAL).bindTooltip('Você');
  MAPA_GERAL.fitBounds(L.latLngBounds(pontos), { padding: [28, 28] });
  // o Leaflet não deixa o clique do balão chegar no documento: liga o botão aqui
  MAPA_GERAL.on('popupopen', e => {
    const b = e.popup.getElement().querySelector('[data-pop-abrir]');
    if (b) b.addEventListener('click', () => abrirDetalhe(b.dataset.popAbrir));
  });
}

function telaAjustes() {
  const regsOrdenadas = REGIOES.map(r => ({ r, d: Math.min(...r.picos.map(p => distKm(S.loc, p))) })).sort((a, b) => a.d - b.d).slice(0, 15).map(x => x.r);
  const corrigidos = Object.keys(S.posicoes).length;
  return cabecalhoTela('Ajustes') + `<div class="ajustes-corpo">
    <section class="bloco">
      <h3 class="secao-tit">Seu local</h3>
      <p class="aj-linha"><span>${esc(S.loc.nome)}</span><button type="button" class="btn-sec" data-ir="local">Trocar</button></p>
    </section>
    <section class="bloco">
      <h3 class="secao-tit">Seu nível</h3>
      <div class="seg" role="radiogroup" aria-label="Seu nível">${Object.entries(NIVEIS).map(([k, n]) =>
        `<button type="button" role="radio" aria-checked="${S.nivel === k}" data-nivel="${k}">${n.nome}</button>`).join('')}</div>
      <p class="leve">Muda o tamanho de onda que conta como bom.</p>
    </section>
    <section class="bloco">
      <h3 class="secao-tit">Busca e viagem</h3>
      <div class="aj-grid">
        <label class="campo" for="sel-raio">Buscar picos num raio de<select id="sel-raio">${[50, 100, 150, 250, 400].map(r =>
          `<option value="${r}"${S.raio === r ? ' selected' : ''}>${r} km</option>`).join('')}</select></label>
        <label class="campo" for="in-kml">Consumo do carro<span><input id="in-kml" type="number" inputmode="decimal" min="3" max="40" step="0.5" value="${S.kmL}"> km/L</span></label>
        <label class="campo" for="in-gas">Preço da gasolina<span>R$ <input id="in-gas" type="number" inputmode="decimal" min="1" max="20" step="0.01" value="${S.gasolina}"></span></label>
      </div>
    </section>
    <section class="bloco">
      <h3 class="secao-tit">Boletim da manhã</h3>
      ${NATIVO && typeof NATIVO.agendarAlertas === 'function' ? `
        <label class="interruptor" for="in-boletim"><input type="checkbox" id="in-boletim"${S.boletim.ativo ? ' checked' : ''}><span>Todo dia de manhã, me mandar o melhor pico do dia</span></label>
        <label class="campo" for="in-boletim-hora">Horário do boletim<select id="in-boletim-hora">${[4, 5, 6, 7, 8].map(v =>
          `<option value="${v}"${S.boletim.hora === v ? ' selected' : ''}>${v}h</option>`).join('')}</select></label>
        <p class="leve">${S.favoritos.length ? 'Olha os seus picos favoritos.' : 'Olha o melhor pico perto de você (com favoritos marcados, olha só eles).'} Usa a última previsão baixada: abra o app de vez em quando pra ela ficar em dia.</p>
        <p class="aviso" id="msg-boletim" hidden></p>
        <p class="aj-linha"><span class="leve">Quer ver como chega?</span><button type="button" class="btn-sec" data-testar-notificacao>Testar notificação</button></p>
        <p class="aviso" id="msg-teste-notif" hidden></p>`
      : '<p class="leve">O boletim chega como notificação no app instalado no Android.</p>'}
    </section>
    <section class="bloco">
      <h3 class="secao-tit">Alertas de onda</h3>
      ${NATIVO && typeof NATIVO.agendarAlertas === 'function' ? `
        <label class="interruptor" for="in-alertas"><input type="checkbox" id="in-alertas"${S.alertas.ativo ? ' checked' : ''}><span>Me avisar quando ${S.favoritos.length ? 'um pico favorito' : 'um pico perto'} for ficar bom</span></label>
        <div class="aj-grid">
          <label class="campo" for="in-alerta-nota">A partir da nota<select id="in-alerta-nota">${[[6, '6 · bom'], [7, '7 · bom de verdade'], [7.5, '7,5 · muito bom']].map(([v, t]) =>
            `<option value="${v}"${S.alertas.notaMin === v ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
          <label class="campo" for="in-alerta-hora">Avisar na véspera às<select id="in-alerta-hora">${[17, 18, 19, 20, 21].map(v =>
            `<option value="${v}"${S.alertas.hora === v ? ' selected' : ''}>${v}h</option>`).join('')}</select></label>
        </div>
        <p class="leve">${S.favoritos.length ? 'Vale pros seus favoritos.' : 'Sem favoritos, vale pro melhor pico perto de você. Marque favoritos pra escolher quais.'} O aviso usa a última previsão baixada, então abra o app de vez em quando pra ela ficar em dia.</p>
        <p class="aviso" id="msg-alertas" hidden></p>`
      : '<p class="leve">Os alertas chegam como notificação no app instalado no Android.</p>'}
    </section>
    <section class="bloco">
      <h3 class="secao-tit">Navegação</h3>
      <label class="campo" for="in-apelido">Como a voz te chama<input id="in-apelido" maxlength="20" value="${esc(S.apelido)}" placeholder="Deixe vazio pra não usar apelido"></label>
      <p class="leve">Ao iniciar a rota, a voz fala "${esc(sortear(FRASES.inicio))}"</p>
      <p class="aj-linha"><span class="leve">Não ouviu nada na navegação?</span><button type="button" class="btn-sec" data-testar-voz>Testar voz</button></p>
      <p class="aviso" id="msg-voz" hidden></p>
    </section>
    <section class="bloco">
      <h3 class="secao-tit">Adicionar um pico</h3>
      <p class="leve">Faça isso na areia. O app salva o ponto onde você está e usa a direção do mar pra saber o que é terral ali. Dica: o sol nasce no leste.</p>
      <form class="form-pico" id="form-pico">
        <label class="campo" for="in-nome">Nome do pico<input id="in-nome" maxlength="40" required placeholder="Ex.: Canto da praia"></label>
        <label class="campo" for="in-regiao">Região<select id="in-regiao">${regsOrdenadas.map(r => `<option value="${esc(r.id)}">${esc(r.nome)}</option>`).join('')}<option value="${MEUS_PICOS.id}">Meus picos (sem região)</option></select></label>
        <label class="campo campo-largo" for="in-facing">Olhando pro mar, você está virado para<select id="in-facing">${DIRS_NOME.map((d, i) =>
          `<option value="${i * 22.5}"${i === 4 ? ' selected' : ''}>${d} (${DIRS[i]})</option>`).join('')}</select></label>
        <button type="submit" class="btn">Salvar pico onde estou</button>
      </form>
      <p class="aviso" id="msg-pico" hidden></p>
      ${S.custom.length ? `<ul class="custom">${S.custom.map(p => `<li><span>${esc(p.nome)} <span class="leve">${esc(regiaoDe({ regiao: REG_MAP.has(p.regiao) ? p.regiao : MEUS_PICOS.id }).nome)} · mar para ${dirPT(p.facing)}</span></span><button type="button" data-remover="${esc(p.id)}">Remover</button></li>`).join('')}</ul>` : ''}
      ${corrigidos ? `<p class="aj-linha"><span class="leve">${corrigidos} ${corrigidos === 1 ? 'pico com posição corrigida' : 'picos com posição corrigida'} por você</span><button type="button" class="btn-sec" data-desfazer-posicoes>Desfazer</button></p>` : ''}
    </section>
    <section class="bloco sobre">
      <h3 class="secao-tit">Sobre os dados</h3>
      <p>Ondas, vento e maré: <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>. Rotas: OSRM. Mapa: © colaboradores do OpenStreetMap.</p>
      <p>A onda na praia é estimada a partir do mar aberto. Bancada, fundo e maré mudam muito o resultado, então confira uma câmera antes de sair.</p>
    </section>
  </div>`;
}

// ---------- detalhe do pico ----------
const serieAberta = () => S.series && S.series.find(x => x.pico.id === S.aberto);

function abrirDetalhe(id, dia) {
  S.aberto = id; S.diaDet = dia == null ? S.dia : dia; S.horaSel = null;
  const n = (history.state && history.state.n) || 0;
  try { history.pushState({ tela: S.tela, det: id, n: n + 1 }, ''); } catch { /* sem histórico */ }
  renderDetalhe(true);
  $('#detalhe').scrollTop = 0;
}
function fecharDetalhe() {
  pararNavegacao(); destruirMapa();
  S.aberto = null;
  const p = $('#detalhe');
  p.hidden = true; p.innerHTML = '';
  document.body.classList.remove('travado');
}

function renderDetalhe(completo) {
  const s = serieAberta();
  if (!s) { fecharDetalhe(); return; }
  const painel = $('#detalhe');
  painel.hidden = false;
  document.body.classList.add('travado');
  if (completo || !$('#det-previsao', painel)) {
    pararNavegacao(); destruirMapa();
    const p = s.pico;
    painel.innerHTML = `<div class="painel-int">
      <div class="det-topo"><button type="button" class="voltar" data-fechar>${ICONE.voltar}Voltar</button></div>
      <header class="det-cab">
        ${regiaoDe(p).nome !== p.nome ? `<p class="eyebrow">${esc(regiaoDe(p).nome)}</p>` : ''}
        <h2>${esc(p.nome)}</h2>
        <p class="sub">${esc(regiaoDe(p).cidade)} · ${fmtViagem(s.viagem)} de carro</p>
        <p class="sub">Praia virada para ${dirPT(p.facing)}. Aqui, terral é vento de ${dirPT((p.facing + 180) % 360)}.</p>
        <div class="det-acoes">
          <button type="button" class="fav" data-favorito="${esc(p.id)}" aria-pressed="${ehFavorito(p.id)}">${ICONE.estrela}<span>${ehFavorito(p.id) ? 'Favorito' : 'Favoritar'}</span></button>
          <button type="button" class="fav" data-chamar="${esc(p.id)}">${ICONE.chamar}<span>Chamar a galera</span></button>
          <button type="button" class="fav" data-registrar="${esc(p.id)}">${ICONE.diario}<span>Registrar sessão</span></button>
        </div>
        <p class="aviso" id="msg-chamar-det" hidden></p>
      </header>
      <div id="det-previsao" class="det-col"></div>
      ${fichaPico(p)}
      <section class="bloco" id="det-rota" aria-labelledby="rota-tit"></section>
    </div>`;
    renderPrevisaoDetalhe(s);
    renderRota(s);
  } else {
    renderPrevisaoDetalhe(s);
  }
}

const NOMES_MARE = { cheia: 'Cheia', seca: 'Seca', vazia: 'Seca', meia: 'Meia maré', enchendo: 'Enchendo', vazando: 'Vazando', qualquer: 'Qualquer' };
const NOMES_NIVEL = { iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado', todos: 'Todos' };
const ORDEM_NIVEL = { iniciante: 0, intermediario: 1, avancado: 2 };

function fichaPico(p) {
  const fi = p.ficha || {};
  const itens = [
    fi.fundo && ['Fundo', fi.fundo.charAt(0).toUpperCase() + fi.fundo.slice(1)],
    fi.mare && ['Melhor maré', NOMES_MARE[fi.mare] || fi.mare],
    Array.isArray(fi.ondulacao) && fi.ondulacao.length && ['Melhor ondulação', fi.ondulacao.join(', ')],
    fi.nivel && ['Nível', NOMES_NIVEL[fi.nivel] || fi.nivel],
  ].filter(Boolean);
  const acima = fi.nivel in ORDEM_NIVEL && ORDEM_NIVEL[fi.nivel] > ORDEM_NIVEL[S.nivel];
  const texto = [
    fi.perigos && `<p><strong>Cuidado:</strong> ${esc(fi.perigos)}</p>`,
    fi.fundo && /coral|pedra/.test(fi.fundo) && !fi.perigos && `<p><strong>Cuidado:</strong> fundo de ${esc(fi.fundo)}. Na maré seca, atenção na hora de cair da onda.</p>`,
    fi.estrutura && `<p><strong>Estrutura:</strong> ${esc(fi.estrutura)}</p>`,
    fi.dica && `<p><strong>Dica:</strong> ${esc(fi.dica)}</p>`,
  ].filter(Boolean).join('');
  const vazia = !itens.length && !texto;
  return `<section class="bloco ficha" aria-labelledby="f-tit">
    <h3 class="secao-tit" id="f-tit">Ficha do pico</h3>
    ${acima ? `<p class="alerta" role="note"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 1 21h22zm-1 7h2v6h-2zm0 8h2v2h-2z"/></svg><span><strong>Pico pra surfista ${NOMES_NIVEL[fi.nivel].toLowerCase()}.</strong> Seu nível nos Ajustes está como ${NOMES_NIVEL[S.nivel].toLowerCase()}.</span></p>` : ''}
    ${itens.length ? `<dl class="condicoes">${itens.map(([k, v]) => `<div><dt>${k}</dt><dd><strong>${esc(v)}</strong></dd></div>`).join('')}</dl>` : ''}
    ${texto}
    ${vazia ? '<p class="leve">Ficha em construção. Quem conhece o pico pode mandar fundo, melhor maré e ondulação, perigos e estrutura pro Pico Certo.</p>' : ''}
  </section>`;
}

function leitura(h) {
  if (!h) return 'Toque numa barra pra ver os detalhes da hora.';
  const c = h.c, o = ondulacao(h), f = faixa(c.nota);
  return `<strong>${h.hora}h · nota ${num(c.nota)} (${f.nome})${h.raio ? ' · risco de trovoada' : ''}</strong><br>Na praia ≈ ${faixaM(c.praia)} · ondulação ${num(o.alt)} m, ${num(o.per, 0)} s, ${dirPT(o.dir)} · vento ${num(h.vento, 0)} km/h ${dirPT(h.ventoDir)}, ${rotuloVento(c)}${descreverMare(h) ? ` · ${descreverMare(h)}${c.mareOk === true ? ' (como o pico gosta)' : c.mareOk === false ? ' (não é a maré do pico)' : ''}` : ''}${c.ondOk === false ? ' · ondulação fora da direção preferida' : ''}`;
}

function chipDia(d, i, nota, sel) {
  const f = nota == null ? null : faixa(nota);
  return `<button type="button" class="chip-dia" role="tab" aria-selected="${i === sel}" data-diadet="${i}" aria-label="${rotuloDiaLongo(d, i)}, melhor nota ${nota == null ? 'sem janela' : num(nota)}">
    <span>${rotuloDia(d, i)}</span>
    <span class="cd-barra"><span class="cd-fill ${f ? f.cls : ''}" style="height:${nota == null ? 0 : Math.max(8, nota * 10)}%"></span></span>
    <span class="cd-nota">${nota == null ? '–' : num(nota)}</span>
  </button>`;
}

function renderPrevisaoDetalhe(s) {
  const el = $('#det-previsao');
  if (!el || !s) return;
  const diaStr = S.dias[S.diaDet];
  const hs = s.horas.filter(h => h.dia === diaStr);
  const claras = hs.filter(h => h.claro);
  const jans = S.dias.map((d, i) => janela(s, d, horaMinima(s, i)));
  const j = jans[S.diaDet];
  if (S.horaSel == null || !claras.some(h => h.hora === S.horaSel)) S.horaSel = j ? j.melhor.hora : (claras[0] ? claras[0].hora : null);
  const largura = Math.max(260, Math.min(652, (el.clientWidth || window.innerWidth - 32) - 30));
  const cond = condicoesDia(s, diaStr);
  const rp = roupa(cond.agua);
  const quando = S.diaDet === 0 ? 'hoje' : S.diaDet === 1 ? 'amanhã' : 'nesse dia';
  el.innerHTML = `
    <section class="bloco" aria-labelledby="s-tit">
      <h3 class="secao-tit" id="s-tit">Semana <span class="leve">mar aberto</span></h3>
      <p class="leitura" id="leitura-semana" aria-live="polite">Arraste o dedo no gráfico pra ver cada hora. Toque pra abrir aquele dia.</p>
      ${graficoSemana(s, largura)}
      <p class="legenda"><span class="lg-linha"></span>Ondulação <span class="lg v-terral"></span>Terral <span class="lg v-lateral"></span>Lateral <span class="lg v-maral"></span>Maral</p>
    </section>
    <div class="dias" role="tablist" aria-label="Dia">${S.dias.map((d, i) => chipDia(d, i, jans[i] ? jans[i].nota : null, S.diaDet)).join('')}</div>
    <section class="bloco" aria-labelledby="c-tit">
      <h3 class="secao-tit" id="c-tit">Água, sol e tempo <span class="leve">${rotuloDiaLongo(diaStr, S.diaDet)}</span></h3>
      ${alertaRaio(cond, quando)}
      <dl class="condicoes">
        <div><dt>Água</dt><dd><strong>${cond.agua != null ? graus(cond.agua) : '–'}</strong><span>${rp ? `Vá de ${rp.longa}` : 'Sem dado de temperatura'}</span></dd></div>
        <div><dt>Ar</dt><dd><strong>${cond.arMin != null ? `${num(cond.arMin, 0)}–${graus(cond.arMax)}` : '–'}</strong><span>com luz do dia</span></dd></div>
        <div><dt>Índice UV</dt><dd><strong>${cond.uvMax != null ? `${num(cond.uvMax, 0)} · ${uvNome(cond.uvMax)}` : '–'}</strong><span>${cond.uvAltas.length ? `Das ${intervalos(cond.uvAltas)}: protetor e lycra` : 'Protetor nas horas de sol'}</span></dd></div>
        <div><dt>Sol</dt><dd><strong>${cond.sol ? `${fmtHoraSol(cond.sol.nasce)} às ${fmtHoraSol(cond.sol.poe)}` : '–'}</strong><span>nascer e pôr do sol</span></dd></div>
      </dl>
    </section>
    <section class="bloco" aria-labelledby="g-tit">
      <h3 class="secao-tit" id="g-tit">Nota por hora <span class="leve">${rotuloDiaLongo(diaStr, S.diaDet)}</span></h3>
      <p class="leitura" id="leitura" aria-live="polite">${leitura(claras.find(h => h.hora === S.horaSel))}</p>
      ${graficoNotas(s, claras, j, largura)}
    </section>
    <section class="bloco" aria-labelledby="m-tit">
      <h3 class="secao-tit" id="m-tit">Maré <span class="leve">estimativa do modelo, em metros</span></h3>
      ${graficoMare(s, hs, largura)}
    </section>
    <section class="bloco" aria-labelledby="t-tit">
      <h3 class="secao-tit" id="t-tit">Hora a hora</h3>
      <div class="rolagem">${tabelaHoras(claras, j)}</div>
    </section>`;
}

function barPath(x, y, w, h, r) {
  if (h <= 0) return '';
  r = Math.min(r, w / 2, h);
  return `M${x.toFixed(1)},${(y + h).toFixed(1)}V${(y + r).toFixed(1)}Q${x.toFixed(1)},${y.toFixed(1)} ${(x + r).toFixed(1)},${y.toFixed(1)}H${(x + w - r).toFixed(1)}Q${(x + w).toFixed(1)},${y.toFixed(1)} ${(x + w).toFixed(1)},${(y + r).toFixed(1)}V${(y + h).toFixed(1)}Z`;
}

const tetoRedondo = (v, passo) => Math.max(passo, Math.ceil(v / passo) * passo);

// 7 dias num gráfico só: em cima a ondulação (linha), embaixo o vento em blocos de 3 horas,
// colorido por terral/lateral/maral pra este pico. Mesmo eixo de horas, cada painel com sua escala.
function graficoSemana(s, W) {
  const hs = s.horas, n = hs.length;
  if (n < 24) return '<p class="leve">Sem dados da semana.</p>';
  const pl = 34, pr = 6, pt = 22, h1 = 104, gap = 30, h2 = 56, pb = 4;
  const base1 = pt + h1, topo2 = base1 + gap, base2 = topo2 + h2, H = base2 + pb;
  const passo = (W - pl - pr) / n;
  const x = i => pl + i * passo;
  const alt = h => h.onda.alt ?? 0;
  // folga em cima pros rótulos de cada dia não encostarem na linha; teto redondo (0,4/0,8/1,2 ou 1/2/3 m)
  const bruto = Math.max(...hs.map(alt)) * 1.6;
  const maxA = bruto <= 1.2 ? tetoRedondo(bruto, 0.4) : tetoRedondo(bruto, 1);
  const y1 = v => base1 - (v / maxA) * h1;
  let g = '';

  // noites sombreadas e o dia aberto destacado
  let ini = null;
  hs.forEach((h, i) => {
    if (!h.claro && ini == null) ini = i;
    const fecha = h.claro ? i : (i === n - 1 ? n : null);
    if (ini != null && fecha != null) { g += `<rect class="noite" x="${x(ini).toFixed(1)}" y="${pt}" width="${(x(fecha) - x(ini)).toFixed(1)}" height="${base2 - pt}"/>`; ini = null; }
  });
  S.dias.forEach((d, k) => {
    const i0 = hs.findIndex(h => h.dia === d);
    if (i0 < 0) return;
    let i1 = i0;
    while (i1 < n && hs[i1].dia === d) i1++;
    if (k === S.diaDet) g += `<rect class="dia-sel" x="${x(i0).toFixed(1)}" y="${pt - 16}" width="${(x(i1) - x(i0)).toFixed(1)}" height="${base2 - pt + 16}" rx="4"/>`;
    if (i0 > 0) g += `<line class="grade-dia" x1="${x(i0).toFixed(1)}" x2="${x(i0).toFixed(1)}" y1="${pt - 16}" y2="${base2}"/>`;
    g += `<text class="eixo dia-rot${k === S.diaDet ? ' sel' : ''}" x="${((x(i0) + x(i1)) / 2).toFixed(1)}" y="${pt - 5}" text-anchor="middle">${rotuloDia(d, k)}</text>`;
  });

  // ondulação: grade, área, linha e o máximo de cada dia (altura e período)
  for (const v of [maxA / 2, maxA]) {
    g += `<line class="grade" x1="${pl}" x2="${W - pr}" y1="${y1(v).toFixed(1)}" y2="${y1(v).toFixed(1)}"/>`;
    g += `<text class="eixo" x="${pl - 5}" y="${(y1(v) + 4).toFixed(1)}" text-anchor="end">${num(v, v % 1 ? 1 : 0)} m</text>`;
  }
  const pts = hs.map((h, i) => `${(x(i) + passo / 2).toFixed(1)},${y1(alt(h)).toFixed(1)}`);
  g += `<path class="sem-area" d="M${pts.join('L')}L${(x(n - 1) + passo / 2).toFixed(1)},${base1}L${(x(0) + passo / 2).toFixed(1)},${base1}Z"/>`;
  g += `<path class="sem-linha" d="M${pts.join('L')}"/>`;
  g += `<line class="base" x1="${pl}" x2="${W - pr}" y1="${base1}" y2="${base1}"/>`;
  // máximo de cada dia: ponto no lugar do pico, rótulo centrado na coluna do dia (nunca encavala com o vizinho)
  for (const d of S.dias) {
    let bi = -1, i0 = -1, i1 = -1;
    hs.forEach((h, i) => {
      if (h.dia !== d) return;
      if (i0 < 0) i0 = i;
      i1 = i + 1;
      if (bi < 0 || alt(h) > alt(hs[bi])) bi = i;
    });
    if (bi < 0) continue;
    const h = hs[bi], cx = ((x(i0) + x(i1)) / 2).toFixed(1);
    g += `<circle class="sem-ponto" cx="${(x(bi) + passo / 2).toFixed(1)}" cy="${y1(alt(h)).toFixed(1)}" r="3.5"/>`;
    g += `<text class="sem-rot" x="${cx}" y="${pt + 11}" text-anchor="middle">${num(alt(h))} m<tspan class="sem-per" x="${cx}" dy="10">${num(ondulacao(h).per, 0)} s</tspan></text>`;
  }

  // vento em blocos de 3 horas
  const blocos = [];
  for (let i = 0; i < n; i += 3) {
    const grupo = hs.slice(i, i + 3).filter(h => h.vento != null);
    if (!grupo.length) continue;
    blocos.push({
      i, k: grupo.length,
      v: grupo.reduce((a, h) => a + h.vento, 0) / grupo.length,
      q: grupo.reduce((a, h) => a + (h.c ? h.c.q : 0), 0) / grupo.length,
    });
  }
  const maxV = tetoRedondo(Math.max(...blocos.map(b => b.v)), 10);
  const y2 = v => base2 - (v / maxV) * h2;
  g += `<text class="eixo sem-tit" x="${pl}" y="${topo2 - 9}">Vento</text>`;
  g += `<line class="grade" x1="${pl}" x2="${W - pr}" y1="${y2(maxV)}" y2="${y2(maxV)}"/>`;
  g += `<text class="eixo" x="${pl - 5}" y="${y2(maxV) + 4}" text-anchor="end">${maxV}</text>`;
  g += `<text class="eixo" x="${pl - 5}" y="${base2 + 4}" text-anchor="end">0</text>`;
  for (const b of blocos) {
    const bx = x(b.i) + 1, bw = Math.max(1.5, b.k * passo - 2), topo = y2(b.v);
    const cls = b.q > 0.25 ? 'v-terral' : b.q < -0.25 ? 'v-maral' : 'v-lateral';
    g += `<path class="${cls}" d="${barPath(bx, topo, bw, base2 - topo, 2)}"/>`;
  }
  g += `<line class="base" x1="${pl}" x2="${W - pr}" y1="${base2}" y2="${base2}"/>`;
  g += `<line id="sem-cursor" class="sem-cursor" x1="0" x2="0" y1="${pt - 16}" y2="${base2}" visibility="hidden"/>`;
  return `<svg id="graf-semana" class="graf graf-semana" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" data-pl="${pl}" data-passo="${passo}" role="img" aria-label="Ondulação e vento dos próximos 7 dias">${g}</svg>`;
}

function leituraSemana(h) {
  const o = ondulacao(h), k = S.dias.indexOf(h.dia);
  return `<strong>${rotuloDiaLongo(h.dia, k)} · ${h.hora}h</strong>${h.claro ? ` · nota ${num(h.c.nota)}` : ' · noite'}<br>`
    + `Ondulação ${num(o.alt)} m, ${num(o.per, 0)} s, ${dirPT(o.dir)} · vento ${num(h.vento, 0)} km/h ${dirPT(h.ventoDir)}, ${rotuloVento(h.c)}`;
}

function graficoNotas(s, claras, j, W) {
  if (!claras.length) return '<p class="leve">Sem horas com luz do dia.</p>';
  const H = 176, pl = 24, pr = 6, pt = 26, pb = 24;
  const iw = W - pl - pr, ih = H - pt - pb;
  const n = claras.length, slot = iw / n, bw = Math.min(24, slot * 0.62);
  const y = v => pt + ih - (v / 10) * ih;
  let g = '';
  for (const v of [5, 10]) g += `<line class="grade" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/>`;
  for (const v of [0, 5, 10]) g += `<text class="eixo" x="${pl - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
  if (j) {
    const a = claras.findIndex(h => h.hora === j.ini), b = claras.findIndex(h => h.hora === j.fim - 1);
    if (a >= 0 && b >= 0) {
      const x0 = pl + a * slot + 1, x1 = pl + (b + 1) * slot - 1;
      g += `<rect class="jan-faixa" x="${x0}" y="${pt - 20}" width="${x1 - x0}" height="${ih + 20}" rx="6"/>`;
      g += `<text class="jan-rot" x="${(x0 + x1) / 2}" y="${pt - 7}" text-anchor="middle">melhor janela</text>`;
    }
  }
  const passo = n > 14 ? 2 : 1;
  claras.forEach((h, i) => {
    const cx = pl + i * slot + slot / 2, v = h.c.nota, f = faixa(v), top = y(Math.max(v, 0.15));
    const sel = h.hora === S.horaSel;
    g += `<g class="col${sel ? ' sel' : ''}" data-hora="${h.hora}" tabindex="0" role="button" aria-label="${h.hora}h, nota ${num(v)}, ${f.nome}">
      <rect class="hit" x="${pl + i * slot}" y="${pt - 20}" width="${slot}" height="${ih + pb + 20}"/>
      <path class="b ${f.cls}" d="${barPath(cx - bw / 2, top, bw, y(0) - top, 4)}"/>
      ${sel ? `<line class="marca-sel" x1="${cx - bw / 2}" x2="${cx + bw / 2}" y1="${y(0) + 3}" y2="${y(0) + 3}"/>` : ''}
      ${(i % passo === 0 || sel) ? `<text class="eixo" x="${cx}" y="${H - 5}" text-anchor="middle">${h.hora}h</text>` : ''}
    </g>`;
  });
  g += `<line class="base" x1="${pl}" x2="${W - pr}" y1="${y(0)}" y2="${y(0)}"/>`;
  const a = agoraLocal(s.off);
  if (a.dia === claras[0].dia && a.hora >= claras[0].hora && a.hora <= claras[n - 1].hora + 1) {
    const xa = pl + (a.hora - claras[0].hora) * slot;
    // o rótulo fica à esquerda da linha, longe da janela (que sempre começa depois de agora)
    const esq = xa - pl > 44;
    g += `<line class="agora" x1="${xa}" x2="${xa}" y1="${pt}" y2="${y(0)}"/><text class="agora-rot" x="${esq ? xa - 4 : xa + 4}" y="${pt + 11}" text-anchor="${esq ? 'end' : 'start'}">agora</text>`;
  }
  return `<svg class="graf" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="group" aria-label="Nota de 0 a 10 por hora">${g}</svg>`;
}

function graficoMare(s, hs, W) {
  const pts = hs.filter(h => h.mare != null);
  if (pts.length < 6) return '<p class="leve">Sem dados de maré para este ponto.</p>';
  const H = 130, pl = 8, pr = 8, pt = 24, pb = 22;
  const iw = W - pl - pr, ih = H - pt - pb;
  const vals = pts.map(h => h.mare);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  const folga = Math.max(0.05, (hi - lo) * 0.12); lo -= folga; hi += folga;
  const x = hr => pl + (hr / 23) * iw;
  const y = v => pt + ih - ((v - lo) / (hi - lo)) * ih;
  let g = '';
  const cl = hs.filter(h => h.claro);
  if (cl.length) g += `<rect class="dia-faixa" x="${x(cl[0].hora)}" y="${pt}" width="${x(cl[cl.length - 1].hora) - x(cl[0].hora)}" height="${ih}" rx="4"/>`;
  g += `<line class="base" x1="${pl}" x2="${W - pr}" y1="${pt + ih}" y2="${pt + ih}"/>`;
  const linha = pts.map((h, i) => `${i ? 'L' : 'M'}${x(h.hora).toFixed(1)},${y(h.mare).toFixed(1)}`).join('');
  g += `<path class="mare-area" d="${linha}L${x(pts[pts.length - 1].hora).toFixed(1)},${pt + ih}L${x(pts[0].hora).toFixed(1)},${pt + ih}Z"/>`;
  g += `<path class="mare-linha" d="${linha}"/>`;
  let ultimo = -10;
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1].mare, b = pts[i].mare, c = pts[i + 1].mare;
    const alta = b > a && b >= c, baixa = b < a && b <= c;
    if (!(alta || baixa) || pts[i].hora - ultimo < 3) continue;
    ultimo = pts[i].hora;
    const xx = x(pts[i].hora), yy = y(b);
    const anchor = xx < 44 ? 'start' : xx > W - 44 ? 'end' : 'middle';
    g += `<circle class="mare-ponto" cx="${xx}" cy="${yy}" r="4"/><text class="mare-rot" x="${xx}" y="${yy - 9}" text-anchor="${anchor}">${alta ? 'cheia' : 'seca'} ${pts[i].hora}h</text>`;
  }
  for (const hr of [0, 6, 12, 18, 23]) g += `<text class="eixo" x="${x(hr)}" y="${H - 5}" text-anchor="${hr === 0 ? 'start' : hr === 23 ? 'end' : 'middle'}">${hr}h</text>`;
  const sel = pts.find(h => h.hora === S.horaSel);
  if (sel) g += `<circle class="mare-ponto" cx="${x(sel.hora)}" cy="${y(sel.mare)}" r="5" style="fill:var(--ink)"/>`;
  const a = agoraLocal(s.off);
  if (a.dia === hs[0].dia) {
    const xa = x(Math.min(23, a.hora));
    g += `<line class="agora" x1="${xa}" x2="${xa}" y1="${pt}" y2="${pt + ih}"/>`;
  }
  return `<svg class="graf" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Curva da maré ao longo do dia">${g}</svg>`;
}

function tabelaHoras(claras, j) {
  if (!claras.length) return '<p class="leve">Sem horas com luz do dia.</p>';
  const linhas = claras.map(h => {
    const c = h.c, f = faixa(c.nota), o = ondulacao(h), dentro = j && h.hora >= j.ini && h.hora < j.fim;
    return `<tr class="${dentro ? 'na-jan' : ''}${h.hora === S.horaSel ? ' sel' : ''}" data-hora="${h.hora}">
      <td class="num">${h.hora}h</td>
      <td><span class="pill pq ${f.cls}">${num(c.nota)}</span></td>
      <td class="num">${faixaM(c.praia)}</td>
      <td class="num">${num(o.alt)} m · ${num(o.per, 0)} s ${seta(o.dir)} ${dirPT(o.dir)}</td>
      <td class="num">${num(h.vento, 0)}<span class="leve">/${num(h.rajada, 0)}</span> km/h ${seta(h.ventoDir)} ${dirPT(h.ventoDir)} <span class="leve">${rotuloVento(c)}</span></td>
      <td class="num">${h.mare == null ? '–' : num(h.mare, 2) + ' m'}</td>
      <td class="num">${h.chuva == null ? '–' : h.chuva + '%'}${h.raio ? ' <span class="tag-raio">raio</span>' : ''}</td>
    </tr>`;
  }).join('');
  return `<table>
    <thead><tr><th scope="col">Hora</th><th scope="col">Nota</th><th scope="col">Na praia</th><th scope="col">Ondulação</th><th scope="col">Vento/rajada</th><th scope="col">Maré</th><th scope="col">Chuva</th></tr></thead>
    <tbody>${linhas}</tbody>
  </table>`;
}

// ---------- mapa, rota e navegação ----------
let MAPA = null, ROTA = null, NAV = null;
const acesso = p => p.acesso ? { lat: p.acesso[0], lon: p.acesso[1] } : { lat: p.lat, lon: p.lon };
const corAcento = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#d2501a';

function renderRota(s) {
  const el = $('#det-rota'), p = s.pico;
  el.innerHTML = `<h3 class="secao-tit" id="rota-tit">Como chegar</h3>
    <p class="leitura" id="rota-resumo" aria-live="polite">Calculando a rota de carro…</p>
    <div class="nav-painel" id="nav-painel" aria-live="assertive" hidden></div>
    <div id="mapa" class="mapa"></div>
    <div class="nav-rodape" id="nav-rodape">
      <div class="nav-resumo"><strong id="nav-falta">–</strong><span id="nav-chegada">Procurando o GPS…</span></div>
      <button type="button" class="btn btn-encerrar" data-encerrar>Encerrar</button>
    </div>
    <button type="button" class="nav-recentrar" id="nav-recentrar" data-recentrar hidden>Centralizar</button>
    <div class="acoes">
      <button type="button" class="btn" id="btn-navegar" data-navegar>Iniciar navegação</button>
      <button type="button" class="btn-sec" data-centralizar>Ver rota inteira</button>
    </div>
    <details class="passos"><summary>Passo a passo</summary><ol id="lista-passos"><li class="leve">Carregando…</li></ol></details>
    <div class="corrigir">
      ${p.aproximado ? '<p class="aviso">A posição deste pico é aproximada. Se você estiver nele agora, salve a posição certa.</p>' : ''}
      <button type="button" class="btn-sec" data-corrigir="${esc(p.id)}">Estou no pico: salvar posição</button>
      <p class="aviso" id="msg-corrigir" hidden></p>
    </div>`;
  if (!window.L) {
    $('#mapa').hidden = true;
    $('#rota-resumo').textContent = 'Não consegui carregar o mapa. Confira a internet e abra o pico de novo.';
    return;
  }
  const alvo = acesso(p);
  MAPA = L.map($('#mapa'), { zoomControl: true, scrollWheelZoom: false });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  }).addTo(MAPA);
  L.marker([alvo.lat, alvo.lon], { icon: L.divIcon({ className: 'mk mk-pico', html: '<span></span>', iconSize: [22, 22] }), keyboard: false })
    .addTo(MAPA).bindTooltip(p.nome);
  const eu = L.marker([S.loc.lat, S.loc.lon], { icon: L.divIcon({ className: 'mk mk-eu', html: '<span></span>', iconSize: [18, 18] }), keyboard: false, zIndexOffset: 500 })
    .addTo(MAPA).bindTooltip('Você');
  MAPA.fitBounds(L.latLngBounds([[alvo.lat, alvo.lon], [S.loc.lat, S.loc.lon]]), { padding: [30, 30] });
  ROTA = { alvo, eu, linha: null, coords: null, acum: null, passos: [], recalculando: false, ultimoRecalculo: 0 };
  buscarRota(S.loc).catch(() => {
    if (ROTA) $('#rota-resumo').textContent = 'Não consegui calcular a rota agora. O mapa mostra você e o pico.';
  });
}

function destruirMapa() {
  if (MAPA) { MAPA.remove(); MAPA = null; }
  ROTA = null;
}

function maisProximo(coords, pt) {
  const k = Math.cos(pt[0] * Math.PI / 180);
  let bi = 0, bd = Infinity;
  for (let i = 0; i < coords.length; i++) {
    const dy = coords[i][0] - pt[0], dx = (coords[i][1] - pt[1]) * k, d = dy * dy + dx * dx;
    if (d < bd) { bd = d; bi = i; }
  }
  return { i: bi, km: Math.sqrt(bd) * 111.2 };
}
function acumulado(coords) {
  const a = [0];
  for (let i = 1; i < coords.length; i++) {
    a.push(a[i - 1] + distKm({ lat: coords[i - 1][0], lon: coords[i - 1][1] }, { lat: coords[i][0], lon: coords[i][1] }));
  }
  return a;
}

function instrucao(st) {
  const m = st.maneuver, nome = st.name ? ` na ${st.name}` : '';
  const LADO = { left: 'à esquerda', right: 'à direita', 'slight left': 'levemente à esquerda', 'slight right': 'levemente à direita',
    'sharp left': 'bem à esquerda', 'sharp right': 'bem à direita', straight: 'em frente', uturn: 'no retorno' };
  const lado = LADO[m.modifier] || '';
  const ladoSimples = lado.replace(/^(levemente|bem) /, '');
  switch (m.type) {
    case 'depart': return st.name ? `Saia pela ${st.name}` : 'Saia em direção ao pico';
    case 'arrive': return 'Chegue ao pico';
    case 'turn':
    case 'end of road':
      if (m.modifier === 'uturn') return 'Faça o retorno';
      if (m.modifier === 'straight') return `Siga em frente${nome}`;
      return `Vire ${lado}${nome}`;
    case 'continue':
    case 'new name': return st.name ? `Continue na ${st.name}` : 'Continue em frente';
    case 'merge': return st.name ? `Entre na ${st.name}` : 'Entre na via';
    case 'on ramp': return `Pegue o acesso ${ladoSimples}${nome}`.trim();
    case 'off ramp': return `Pegue a saída ${ladoSimples}${nome}`.trim();
    case 'fork': return `Na bifurcação, fique ${ladoSimples}${nome}`;
    case 'roundabout':
    case 'rotary': return `Na rotatória, pegue a ${m.exit || 1}ª saída${nome}`;
    case 'exit roundabout':
    case 'exit rotary': return `Saia da rotatória${nome}`;
    default: return st.name ? `Siga pela ${st.name}` : 'Siga em frente';
  }
}

async function buscarRota(origem) {
  const r0 = ROTA;
  if (!r0) return;
  const b = r0.alvo;
  const url = `https://router.project-osrm.org/route/v1/driving/${origem.lon.toFixed(5)},${origem.lat.toFixed(5)};${b.lon.toFixed(5)},${b.lat.toFixed(5)}?overview=full&geometries=geojson&steps=true`;
  const j = await getJSON(url, 15000);
  if (ROTA !== r0 || !MAPA) return;
  if (j.code !== 'Ok' || !j.routes || !j.routes.length) throw new Error('sem rota');
  const r = j.routes[0];
  const coords = r.geometry.coordinates.map(c => [c[1], c[0]]);
  r0.coords = coords;
  r0.acum = acumulado(coords);
  r0.duracao = r.duration / 3600 * 1.1;  // horas, com folga de trânsito
  r0.passos = r.legs[0].steps.map(st => ({
    texto: instrucao(st), dist: st.distance, falado: false,
    idx: maisProximo(coords, [st.maneuver.location[1], st.maneuver.location[0]]).i,
  }));
  if (r0.linha) r0.linha.remove();
  r0.linha = L.polyline(coords, { color: corAcento(), weight: 5, opacity: 0.9 }).addTo(MAPA);
  if (!NAV) MAPA.fitBounds(r0.linha.getBounds(), { padding: [24, 24] });
  const km = r.distance / 1000;
  $('#rota-resumo').innerHTML = `<strong>${fmtKm(km)}</strong> de carro · <strong>${fmtTempo(r.duration / 3600 * 1.1)}</strong> sem trânsito · ≈ ${fmtReais(custo({ km }))} de gasolina ida e volta`;
  $('#lista-passos').innerHTML = r0.passos.map(p => `<li>${esc(p.texto)}${p.dist > 0 ? ` <span class="leve">${fmtDist(p.dist)}</span>` : ''}</li>`).join('');
}

function centralizarRota() {
  if (!MAPA || !ROTA) return;
  if (ROTA.linha) MAPA.fitBounds(ROTA.linha.getBounds(), { padding: [24, 24] });
  else MAPA.fitBounds(L.latLngBounds([[ROTA.alvo.lat, ROTA.alvo.lon], ROTA.eu.getLatLng()]), { padding: [30, 30] });
}

// fila = true: fala depois do que já está sendo falado, sem cortar (a saudação, por exemplo).
// Devolve false quando o aparelho não tem como falar.
function falar(texto, fila = false) {
  try {
    if (NATIVO) {
      const r = fila && typeof NATIVO.falarDepois === 'function' ? NATIVO.falarDepois(texto) : NATIVO.falar(texto);
      if (r !== false) return true;
    }
    if (!('speechSynthesis' in window)) return false;
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'pt-BR';
    if (!fila) speechSynthesis.cancel();
    speechSynthesis.speak(u);
    return true;
  } catch { return false; }
}
const AVISO_SEM_VOZ = 'Sem voz neste aparelho. Confira o volume de mídia e, no Android, Configurações › Acessibilidade › Saída de texto em voz.';

const comApelido = (frase, fim = '!') => S.apelido ? `${frase}, ${S.apelido}${fim}` : `${frase}${fim}`;

// Frases de surfista que a voz fala durante a rota. {apelido} vira o apelido escolhido nos Ajustes.
// Pode trocar e acrescentar à vontade; quando há mais de uma, o app sorteia.
const FRASES = {
  inicio: ['Vamos às ondas, {apelido}!'],
  diaRuim: ['Hoje não está bom, mas você é um maroleiro!'],
  diaBom: ['Hoje tá bom, separa a parafina!', 'O mar tá chamando, bora!'],
  metade: ['Segue firme, calango aquático!', 'Metade do caminho, {apelido}!', 'Tá chegando a hora, calango aquático!'],
  quaseChegando: ['Eletriza, você já está quase chegando!'],
};
const sortear = lista => lista[Math.floor(Math.random() * lista.length)].replace('{apelido}', S.apelido || 'surfista');
const iconeEu = () => L.divIcon({ className: 'mk mk-eu', html: '<span></span>', iconSize: [18, 18] });
const iconeSeta = () => L.divIcon({ className: 'mk-seta', html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 20 21l-8-4.6L4 21z"/></svg>', iconSize: [34, 34] });

// direção (graus) de a até b, pra girar a seta quando o GPS não informa
function rumo(a, b) {
  const r = Math.PI / 180, dl = (b[1] - a[1]) * r;
  const y = Math.sin(dl) * Math.cos(b[0] * r);
  const x = Math.cos(a[0] * r) * Math.sin(b[0] * r) - Math.sin(a[0] * r) * Math.cos(b[0] * r) * Math.cos(dl);
  return (Math.atan2(y, x) / r + 360) % 360;
}

function aoArrastarMapa() {
  if (!NAV) return;
  NAV.seguir = false;
  const b = $('#nav-recentrar'); if (b) b.hidden = false;
}

function iniciarNavegacao() {
  if (!ROTA || !MAPA) return;
  const painel = $('#nav-painel');
  painel.hidden = false;
  if (!('geolocation' in navigator)) { painel.innerHTML = '<span class="nav-instr">Este aparelho não dá acesso ao GPS.</span>'; return; }
  NAV = { id: null, lock: null, chegou: false, seguir: true, ultimo: null, rumo: 0 };
  // o botão voltar do celular encerra a navegação antes de fechar o pico
  const st = history.state || {};
  try { history.pushState({ ...st, nav: true, n: (st.n || 0) + 1 }, ''); } catch { /* sem histórico */ }
  $('#detalhe').classList.add('nav-ativa');
  MAPA.invalidateSize();
  ROTA.eu.setIcon(iconeSeta());
  MAPA.on('dragstart', aoArrastarMapa);
  MAPA.setView(ROTA.eu.getLatLng(), 17);
  NAV.id = navigator.geolocation.watchPosition(posNavegacao, erroNavegacao, { enableHighAccuracy: true, maximumAge: 2000, timeout: 30000 });
  if (NATIVO) NATIVO.telaLigada(true);
  else if (navigator.wakeLock) navigator.wakeLock.request('screen').then(l => { if (NAV) NAV.lock = l; else l.release(); }).catch(() => {});
  $('#btn-navegar').textContent = 'Parar navegação';
  // saudação + frase do dia, pela nota do pico hoje; aparece escrita e é falada
  const s = serieAberta();
  const jHoje = s && S.dias.length ? janela(s, S.dias[0], horaMinima(s, 0)) : null;
  const doDia = !jHoje || jHoje.nota < 4.5 ? sortear(FRASES.diaRuim) : jHoje.nota >= 6 ? sortear(FRASES.diaBom) : '';
  const saudacao = sortear(FRASES.inicio);
  const falou = falar(`Navegação iniciada. ${saudacao} ${doDia}`.trim());
  painel.innerHTML = `<span class="nav-dist">Procurando o sinal do GPS…</span><span class="nav-instr">${esc(saudacao)}</span>`
    + (doDia ? `<span class="nav-dist">${esc(doDia)}</span>` : '')
    + (falou ? '' : `<span class="nav-dist">${esc(AVISO_SEM_VOZ)}</span>`);
}

function pararNavegacao() {
  if (!NAV) return;
  if (NAV.id != null) navigator.geolocation.clearWatch(NAV.id);
  if (NAV.lock) NAV.lock.release().catch(() => {});
  if (NATIVO) NATIVO.telaLigada(false);
  NAV = null;
  try { speechSynthesis.cancel(); } catch { /* sem voz */ }
  $('#detalhe').classList.remove('nav-ativa');
  const b = $('#btn-navegar'); if (b) b.textContent = 'Iniciar navegação';
  const p = $('#nav-painel'); if (p) p.hidden = true;
  const rc = $('#nav-recentrar'); if (rc) rc.hidden = true;
  if (MAPA && ROTA) {
    MAPA.off('dragstart', aoArrastarMapa);
    ROTA.eu.setIcon(iconeEu());
    MAPA.invalidateSize();
    centralizarRota();
  }
}

// botão Encerrar, Esc e "Parar navegação": volta o histórico se a navegação entrou nele
function encerrarNavegacao() {
  if (history.state && history.state.nav) history.back();
  else pararNavegacao();
}

function recentrar() {
  if (!NAV || !MAPA || !ROTA) return;
  NAV.seguir = true;
  $('#nav-recentrar').hidden = true;
  MAPA.setView(ROTA.eu.getLatLng(), Math.max(MAPA.getZoom(), 16));
}

function posNavegacao(pos) {
  if (!NAV || !ROTA || !MAPA) return;
  const aqui = [pos.coords.latitude, pos.coords.longitude];
  // seta: direção do GPS quando o carro anda; senão, calcula pelo último ponto
  const { heading, speed } = pos.coords;
  if (heading != null && !Number.isNaN(heading) && (speed == null || speed > 1)) NAV.rumo = heading;
  else if (NAV.ultimo && distKm({ lat: NAV.ultimo[0], lon: NAV.ultimo[1] }, { lat: aqui[0], lon: aqui[1] }) > 0.008) NAV.rumo = rumo(NAV.ultimo, aqui);
  NAV.ultimo = aqui;
  ROTA.eu.setLatLng(aqui);
  const seta = ROTA.eu.getElement() && ROTA.eu.getElement().querySelector('svg');
  if (seta) seta.style.transform = `rotate(${Math.round(NAV.rumo)}deg)`;
  if (NAV.seguir) MAPA.setView(aqui, Math.max(MAPA.getZoom(), 16), { animate: true });
  if (!ROTA.coords) return;

  const painel = $('#nav-painel');
  const { i, km: desvio } = maisProximo(ROTA.coords, aqui);
  if (desvio > 0.12) {
    painel.innerHTML = '<span class="nav-instr">Fora da rota. Recalculando…</span>';
    if (!ROTA.recalculando && Date.now() - ROTA.ultimoRecalculo > 20000) {
      const r0 = ROTA;
      r0.recalculando = true; r0.ultimoRecalculo = Date.now();
      falar('Recalculando a rota.', true);
      buscarRota({ lat: aqui[0], lon: aqui[1] }).catch(() => {}).finally(() => { r0.recalculando = false; });
    }
    return;
  }
  const total = ROTA.acum[ROTA.acum.length - 1];
  const falta = total - ROTA.acum[i];
  if (falta < 0.05) {
    painel.innerHTML = `<span class="nav-instr">${esc(comApelido('Você chegou', '.'))} Boas ondas!</span>`;
    $('#nav-falta').textContent = 'Chegou';
    $('#nav-chegada').textContent = 'Boas ondas!';
    if (!NAV.chegou) { NAV.chegou = true; falar(`${comApelido('Você chegou', '.')} Boas ondas!`, true); }
    return;
  }
  const prox = ROTA.passos.find(p => p.idx > i);
  const ate = prox ? ROTA.acum[prox.idx] - ROTA.acum[i] : falta;
  painel.innerHTML = `<span class="nav-dist">Em ${fmtDist(ate * 1000)}</span>
    <span class="nav-instr">${esc(prox ? prox.texto : 'Siga até o pico')}</span>`;
  const horasFalta = total > 0 ? (falta / total) * (ROTA.duracao || 0) : 0;
  const chegada = new Date(Date.now() + horasFalta * 3600 * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  $('#nav-falta').textContent = `${fmtDist(falta * 1000)} · ${fmtTempo(horasFalta).replace('~', '')}`;
  $('#nav-chegada').textContent = `Chegada às ${chegada}`;
  if (prox && ate < 0.3 && !prox.falado) {
    prox.falado = true;
    falar(`Em ${fmtDistFala(ate * 1000)}, ${prox.texto.charAt(0).toLowerCase()}${prox.texto.slice(1)}.`, true);
    return;
  }
  // frases de surfista: só quando a próxima manobra está longe, pra não atrapalhar a instrução
  if (ate < 0.6) return;
  if (!NAV.quase && total > 2.5 && falta < 2 && falta > 0.3) { NAV.quase = true; NAV.metade = true; falar(sortear(FRASES.quaseChegando), true); }
  else if (!NAV.metade && total > 3 && falta / total < 0.5) { NAV.metade = true; falar(sortear(FRASES.metade), true); }
}

function erroNavegacao(err) {
  const painel = $('#nav-painel');
  if (!painel) return;
  if (err.code === 1) {
    encerrarNavegacao();
    $('#rota-resumo').textContent = 'O GPS está bloqueado pra este app. Libere a localização nas permissões pra navegar.';
  } else {
    painel.innerHTML = '<span class="nav-instr">Sinal de GPS fraco. Tentando de novo…</span>';
  }
}

function corrigirPosicao(id) {
  const msg = $('#msg-corrigir');
  const avisar = t => { if (msg) { msg.hidden = false; msg.textContent = t; } };
  if (!('geolocation' in navigator)) { avisar('Este aparelho não dá acesso à localização.'); return; }
  avisar('Pegando sua posição…');
  navigator.geolocation.getCurrentPosition(pos => {
    if (pos.coords.accuracy > 150) { avisar(`O GPS está impreciso agora (±${Math.round(pos.coords.accuracy)} m). Espere uns segundos e tente de novo.`); return; }
    S.posicoes = { ...S.posicoes, [id]: { lat: +pos.coords.latitude.toFixed(5), lon: +pos.coords.longitude.toFixed(5) } };
    store.set('posicoes', S.posicoes);
    avisar('Posição salva. Atualizando a previsão…');
    S.redesenharDetalhe = true;
    carregar(true);
  }, err => avisar(err.code === 1 ? 'A localização está bloqueada. Libere nas permissões.' : 'Não consegui pegar sua posição. Tente de novo.'),
  { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
}

// ---------- localização ----------
function definirLocal(loc) {
  S.loc = loc; store.set('loc', loc);
  S.msgLocal = ''; S.series = null; S.tela = 'inicio';
  try { history.replaceState({ tela: 'inicio', n: 0 }, ''); } catch { /* sem histórico */ }
  carregar();
}
function nomeAproximado(lat, lon) {
  const perto = CIDADES.map(c => ({ c, d: distKm({ lat, lon }, c) })).sort((a, b) => a.d - b.d)[0];
  return perto && perto.d < 20 ? `Perto de ${perto.c.nome.split(',')[0]}` : 'Sua localização';
}
function usarGPS() {
  if (!('geolocation' in navigator)) {
    S.msgLocal = 'Este navegador não dá acesso à localização. Escolha uma cidade.'; render(); return;
  }
  S.localizando = true; S.msgLocal = ''; render();
  navigator.geolocation.getCurrentPosition(pos => {
    S.localizando = false;
    const { latitude: lat, longitude: lon } = pos.coords;
    definirLocal({ lat, lon, nome: nomeAproximado(lat, lon), fonte: 'gps' });
  }, err => {
    S.localizando = false;
    S.msgLocal = err.code === 1
      ? 'A localização foi bloqueada. Libere nas permissões ou escolha uma cidade.'
      : 'Não consegui pegar sua localização agora. Tente de novo ou escolha uma cidade.';
    render();
  }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 });
}

// ---------- eventos ----------
document.addEventListener('click', e => {
  const t = e.target.closest('button, [data-hora], [data-abrir]');
  if (!t || t.disabled) return;
  const d = t.dataset;
  if ('gps' in d) usarGPS();
  else if ('trocar' in d) { if (S.aberto) fecharDetalhe(); S.msgLocal = ''; irPara('local'); }
  else if ('ir' in d) irPara(d.ir);
  else if ('voltar' in d) voltarTela();
  else if ('nivel' in d) { S.nivel = d.nivel; store.set('nivel', S.nivel); calcular(); render(); }
  else if ('abrir' in d) abrirDetalhe(d.abrir, d.noDia != null ? +d.noDia : undefined);
  else if ('fechar' in d) { if (history.state && history.state.det) history.back(); else fecharDetalhe(); }
  else if ('diadet' in d) { S.diaDet = +d.diadet; S.horaSel = null; renderPrevisaoDetalhe(serieAberta()); }
  else if ('hora' in d) { S.horaSel = +d.hora; renderPrevisaoDetalhe(serieAberta()); }
  else if ('atualizar' in d) carregar(true);
  else if ('remover' in d) { S.custom = S.custom.filter(p => p.id !== d.remover); store.set('custom', S.custom); carregar(true); }
  else if ('desfazerPosicoes' in d) { S.posicoes = {}; store.set('posicoes', S.posicoes); carregar(true); }
  else if ('corrigir' in d) corrigirPosicao(d.corrigir);
  else if ('navegar' in d) { if (NAV) encerrarNavegacao(); else iniciarNavegacao(); }
  else if ('encerrar' in d) encerrarNavegacao();
  else if ('favorito' in d) {
    const id = d.favorito, era = ehFavorito(id);
    S.favoritos = era ? S.favoritos.filter(x => x !== id) : S.favoritos.concat(id);
    store.set('favoritos', S.favoritos);
    t.setAttribute('aria-pressed', String(!era));
    t.querySelector('span').textContent = era ? 'Favoritar' : 'Favorito';
    agendarAlertas();
  }
  else if ('compartilhar' in d) compartilharLocal();
  else if ('chamar' in d) {
    // dentro do pico vale o dia que está aberto; na comparação, o dia escolhido lá
    const noPico = !!t.closest('#detalhe');
    chamarGalera(d.chamar, noPico ? S.diaDet : (d.noDia != null ? +d.noDia : S.dia), noPico ? 'msg-chamar-det' : 'msg-chamar-cmp');
  }
  else if ('modoComp' in d) { S.modoComp = d.modoComp; store.set('modoComp', S.modoComp); render(); }
  else if ('registrar' in d) {
    // sai do pico direto pro formulário; o voltar leva pra tela de antes do pico
    fecharDetalhe();
    S.tela = 'diario-novo:' + d.registrar;
    try { history.replaceState({ tela: S.tela, n: (history.state && history.state.n) || 0 }, ''); } catch { /* sem histórico */ }
    render();
    window.scrollTo(0, 0);
  }
  else if ('testarNotificacao' in d) {
    // notificação de teste daqui a 5 s, junto com os avisos de verdade (o próximo agendamento já tira ela)
    const msg = $('#msg-teste-notif');
    const avisar = t => { msg.hidden = false; msg.textContent = t; };
    if (typeof NATIVO.pedirNotificacoes === 'function' && !NATIVO.pedirNotificacoes()) {
      avisar('Permita as notificações do Pico Certo na janela que abriu e toque de novo.');
      return;
    }
    const top = S.rk && S.rk[S.dia] ? S.rk[S.dia].find(r => ehFavorito(r.s.pico.id)) || S.rk[S.dia][0] : null;
    const nome = top ? top.s.pico.nome : 'Jacaraípe';
    // condições inventadas de um mar bom, pra ver o formato; o título deixa claro que é teste
    const teste = {
      quando: Date.now() + 5000,
      titulo: `${comApelido('Tá bombando agora')} (teste)`,
      texto: `${nome} das 6h às 9h, nota 8,6 (muito bom). Corre pra água!\n`
        + 'Onda: 1,2–1,6 m (peito a cabeça), ondulação SE de 11 s\n'
        + 'Vento: terral fraco, 8 km/h de O\n'
        + 'Maré: meia maré, enchendo · Água 25 °C, lycra\n'
        + 'Esta é só uma notificação de teste.',
    };
    const reais = (S.alertas.ativo ? montarAlertas() : []).concat(S.boletim.ativo ? montarBoletins() : []);
    NATIVO.agendarAlertas(JSON.stringify([teste].concat(reais)));
    avisar('Pronto! A notificação de teste chega em alguns segundos (às vezes até 1 minuto). Pode bloquear a tela pra ver.');
  }
  else if ('apagarSessao' in d) { S.apagando = d.apagarSessao; render(); }
  else if ('cancelarApagar' in d) { S.apagando = null; render(); }
  else if ('confirmarApagar' in d) {
    S.diario = S.diario.filter(s => s.id !== d.confirmarApagar);
    store.set('diario', S.diario);
    S.apagando = null;
    render();
  }
  else if ('diaComp' in d) { S.diaComp = +d.diaComp; render(); }
  else if ('limparSelecao' in d) {
    S.selecionados = []; store.set('selecionados', S.selecionados);
    document.querySelectorAll('.chk-pico').forEach(c => { c.checked = false; });
    atualizarSelecao();
  }
  else if ('testarVoz' in d) {
    const ok = falar(sortear(FRASES.inicio));
    const msg = $('#msg-voz');
    msg.hidden = false;
    msg.textContent = ok ? 'Se não ouviu, aumente o volume de mídia do celular e toque de novo.' : AVISO_SEM_VOZ;
  }
  else if ('recentrar' in d) recentrar();
  else if ('centralizar' in d) centralizarRota();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && NAV) { encerrarNavegacao(); return; }
  if (e.key === 'Escape' && S.aberto) { if (history.state && history.state.det) history.back(); else fecharDetalhe(); return; }
  const g = e.target.closest && e.target.closest('g[data-hora]');
  if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); S.horaSel = +g.dataset.hora; renderPrevisaoDetalhe(serieAberta()); }
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'sel-raio') { S.raio = +t.value; store.set('raio', S.raio); carregar(); }
  else if (t.id === 'sel-cidade' && t.value !== '') {
    const c = CIDADES[+t.value];
    definirLocal({ lat: c.lat, lon: c.lon, nome: c.nome, fonte: 'cidade' });
  }
  else if (t.classList.contains('chk-pico') || t.classList.contains('chk-regiao')) {
    const alvos = t.classList.contains('chk-regiao')
      ? [...document.querySelectorAll(`.chk-pico[data-regiao="${t.dataset.regiao}"]`)]
      : [t];
    const carregados = new Set((S.series || []).map(s => s.pico.id));
    let sel = new Set(S.selecionados);
    for (const c of alvos) {
      c.checked = t.checked;
      if (t.checked) { sel.add(c.dataset.id); if (!carregados.has(c.dataset.id)) S.precisaRecarregar = true; }
      else sel.delete(c.dataset.id);
    }
    S.selecionados = [...sel];
    store.set('selecionados', S.selecionados);
    atualizarSelecao();
  }
  else if (t.id === 'in-alertas') {
    S.alertas = { ...S.alertas, ativo: t.checked };
    store.set('alertas', S.alertas);
    if (t.checked) {
      const n = S.series ? montarAlertas().length : 0;
      ligarNotificacao('msg-alertas', n ? `Pronto! ${n} ${n === 1 ? 'aviso agendado' : 'avisos agendados'} pros próximos dias.` : 'Pronto! Nenhum dia da semana passa da nota escolhida por enquanto. Quando passar, você recebe o aviso.');
    } else agendarAlertas();
  }
  else if (t.id === 'in-boletim') {
    S.boletim = { ...S.boletim, ativo: t.checked };
    store.set('boletim', S.boletim);
    if (t.checked) ligarNotificacao('msg-boletim', `Pronto! O próximo boletim chega às ${S.boletim.hora}h.`);
    else agendarAlertas();
  }
  else if (t.id === 'in-boletim-hora') {
    S.boletim = { ...S.boletim, hora: +t.value };
    store.set('boletim', S.boletim);
    agendarAlertas();
  }
  else if (t.id === 'in-alerta-nota' || t.id === 'in-alerta-hora') {
    S.alertas = { ...S.alertas, [t.id === 'in-alerta-nota' ? 'notaMin' : 'hora']: +t.value };
    store.set('alertas', S.alertas);
    agendarAlertas();
  }
  else if (t.id === 'in-apelido') {
    S.apelido = t.value.trim().slice(0, 20);
    store.set('apelido', S.apelido);
    render();
  }
  else if (t.id === 'in-kml' || t.id === 'in-gas') {
    const v = parseFloat(String(t.value).replace(',', '.'));
    if (!(v > 0)) return;
    if (t.id === 'in-kml') { S.kmL = v; store.set('kmL', v); } else { S.gasolina = v; store.set('gasolina', v); }
  }
});

// salva uma sessão do diário, junto com o que a previsão dizia naquela hora
document.addEventListener('submit', e => {
  if (e.target.id !== 'form-sessao') return;
  e.preventDefault();
  const picoId = $('#ss-pico').value;
  const s = S.series && S.series.find(x => x.pico.id === picoId);
  const p = s ? s.pico : todosPicos().find(x => x.id === picoId);
  const marcado = nome => { const r = document.querySelector(`input[name="${nome}"]:checked`); return r ? r.value : null; };
  const inicio = `${$('#ss-data').value}T${$('#ss-hora').value}`;
  const sessao = {
    id: 's' + Date.now().toString(36),
    picoId, picoNome: p ? p.nome : picoId, regiaoNome: p ? regiaoDe(p).nome : '',
    inicio, duracao: +$('#ss-duracao').value,
    nota: +(marcado('ss-nota') || 3), tamanho: marcado('ss-tamanho'), crowd: marcado('ss-crowd'),
    prancha: $('#ss-prancha').value.trim(), obs: $('#ss-obs').value.trim(),
    previsto: previsaoNaHora(s, inicio),
  };
  S.diario = [sessao].concat(S.diario).sort((a, b) => b.inicio.localeCompare(a.inicio));
  store.set('diario', S.diario);
  S.tela = 'diario';
  try { history.replaceState({ tela: 'diario', n: (history.state && history.state.n) || 0 }, ''); } catch { /* sem histórico */ }
  render();
  window.scrollTo(0, 0);
});

document.addEventListener('submit', e => {
  if (e.target.id !== 'form-pico') return;
  e.preventDefault();
  const nome = $('#in-nome').value.trim(), facing = +$('#in-facing').value, regiao = $('#in-regiao').value, msg = $('#msg-pico');
  const avisar = t => { msg.hidden = false; msg.textContent = t; };
  if (!nome) return;
  if (!('geolocation' in navigator)) { avisar('Este aparelho não dá acesso à localização.'); return; }
  avisar('Pegando sua localização…');
  navigator.geolocation.getCurrentPosition(pos => {
    const p = { id: 'meu-' + Date.now().toString(36), nome, regiao, lat: +pos.coords.latitude.toFixed(5), lon: +pos.coords.longitude.toFixed(5), facing };
    S.custom = S.custom.concat(p); store.set('custom', S.custom);
    avisar(`${nome} salvo. Atualizando a previsão…`);
    carregar(true);
  }, err => avisar(err.code === 1 ? 'A localização está bloqueada. Libere nas permissões.' : 'Não consegui pegar sua localização. Tente de novo.'),
  { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
});

document.addEventListener('pointerover', e => {
  const g = e.target.closest && e.target.closest('#detalhe .graf [data-hora]');
  if (!g) return;
  const s = serieAberta(); if (!s) return;
  const h = s.horas.find(x => x.dia === S.dias[S.diaDet] && x.hora === +g.dataset.hora);
  const el = $('#leitura'); if (el && h) el.innerHTML = leitura(h);
});
document.addEventListener('pointerout', e => {
  const sai = e.target.closest && e.target.closest('#detalhe .graf');
  const entra = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('#detalhe .graf');
  if (!sai || entra) return;
  const s = serieAberta(); if (!s) return;
  const h = s.horas.find(x => x.dia === S.dias[S.diaDet] && x.hora === S.horaSel);
  const el = $('#leitura'); if (el) el.innerHTML = leitura(h);
});

// gráfico da semana: arrastar mostra a hora; tocar abre aquele dia
function horaNoGrafico(e) {
  const svg = e.target.closest && e.target.closest('#graf-semana');
  const s = svg && serieAberta();
  if (!s) return null;
  const pl = +svg.dataset.pl, passo = +svg.dataset.passo;
  const i = clamp(Math.floor((e.clientX - svg.getBoundingClientRect().left - pl) / passo), 0, s.horas.length - 1);
  return { svg, i, h: s.horas[i], pl, passo };
}
function mostrarHoraSemana(e) {
  const a = horaNoGrafico(e);
  if (!a) return;
  const cur = a.svg.querySelector('#sem-cursor'), x = (a.pl + (a.i + 0.5) * a.passo).toFixed(1);
  cur.setAttribute('x1', x); cur.setAttribute('x2', x); cur.setAttribute('visibility', 'visible');
  const el = $('#leitura-semana'); if (el) el.innerHTML = leituraSemana(a.h);
}
document.addEventListener('pointermove', mostrarHoraSemana);
document.addEventListener('pointerdown', mostrarHoraSemana);
document.addEventListener('click', e => {
  const a = horaNoGrafico(e);
  if (!a) return;
  const k = S.dias.indexOf(a.h.dia);
  if (k < 0) return;
  S.diaDet = k;
  S.horaSel = a.h.claro ? a.h.hora : null;
  renderPrevisaoDetalhe(serieAberta());
  const el = $('#leitura-semana'); if (el) el.innerHTML = leituraSemana(a.h);
});

// o Android avisa aqui se a pessoa permitiu as notificações
window.addEventListener('pc-notificacoes', e => {
  // atualiza a mensagem de quem pediu (alertas ou boletim)
  for (const id of ['msg-alertas', 'msg-boletim']) {
    const msg = $('#' + id);
    if (!msg || msg.hidden) continue;
    msg.textContent = e.detail ? 'Notificações permitidas. Está tudo agendado.' : 'Sem permissão de notificação, os avisos não aparecem. Dá pra liberar nas configurações do Android, em Apps › Pico Certo › Notificações.';
  }
  agendarAlertas();
});

window.addEventListener('popstate', e => {
  const st = e.state || { tela: 'inicio', n: 0 };
  if (NAV && !st.nav) pararNavegacao();
  if (S.aberto && !st.det) fecharDetalhe();
  const nova = st.tela || 'inicio';
  if (nova !== S.tela) { S.tela = nova; render(); window.scrollTo(0, 0); }
});

let tRedim = null;
window.addEventListener('resize', () => {
  clearTimeout(tRedim);
  tRedim = setTimeout(() => {
    if (S.aberto) { renderPrevisaoDetalhe(serieAberta()); if (MAPA) MAPA.invalidateSize(); }
    if (MAPA_GERAL) MAPA_GERAL.invalidateSize();
  }, 200);
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || !S.series || NAV) return;
  if (Date.now() - S.geradoEm > VALIDADE_CACHE) carregar(true);
  else if (S.tela !== 'mapa') { calcular(); render(); if (S.aberto) renderPrevisaoDetalhe(serieAberta()); }
});

if (!NATIVO && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

try { history.replaceState({ tela: 'inicio', n: 0 }, ''); } catch { /* sem histórico */ }
render();
if (S.loc) carregar();
})();
