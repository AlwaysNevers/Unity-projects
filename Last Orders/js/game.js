/*
  LAST ORDERS — game flow
  Title → opening → (map → chapter card → scene → decision → consequence
  → philosophers react) × 4 → ending → moral profile.
*/
(function () {
  const S = window.STORY;
  const A = window.AudioFX;
  const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ROMAN = ["", "I", "II", "III", "IV"];
  const FW = ["util", "kant", "virtue"];
  const ENDING_ORDER = ["the_road", "the_tide", "twelve", "pier_four", "clean_hands"];
  const HOLD_MS = 900;
  const CHIP = { util: "Util", kant: "Deontology", virtue: "Virtue" };
  const DECIDE_MS = 20000;

  /* ───────── icons (24×24 line drawings) ───────── */
  const ICONS = {
    detonator: '<path d="M4 13h16v7H4z"/><path d="M12 13V6M8 6h8M7 16.5h2"/>',
    hourglass: '<path d="M6 3h12M6 21h12"/><path d="M7 3c0 6 10 6 10 9s-10 3-10 9"/><path d="M17 3c0 6-10 6-10 9s10 3 10 9"/>',
    pliers: '<path d="M9 3l2 8M15 3l-2 8"/><circle cx="12" cy="12" r="1.5"/><path d="M11 13l-4 8M13 13l4 8"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    mute: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l4 6M21 9l-4 6"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z"/>',
    hand: '<path d="M8 13V6a1.5 1.5 0 0 1 3 0v5"/><path d="M11 11V4.5a1.5 1.5 0 0 1 3 0V11"/><path d="M14 11V6a1.5 1.5 0 0 1 3 0v8c0 4-3 7-6.5 7-2.5 0-4.2-1.4-5.3-3.4L3.4 14a1.5 1.5 0 0 1 2.5-1.6L8 15"/>',
    crosshair: '<circle cx="12" cy="12" r="7"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/><circle cx="12" cy="12" r="1"/>',
    pistol: '<path d="M3 8h16l2 2v3h-9l-1.2 5H7.5l1.2-5H5a2 2 0 0 1-2-2z"/><path d="M12 13c0 1.2.8 2 2 2"/>',
    cross: '<circle cx="12" cy="12" r="9"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7"/>',
    child: '<circle cx="12" cy="5.5" r="2.5"/><path d="M12 8v7M8 11l4-2 4 2M9 21l3-6 3 6"/>',
    truck: '<path d="M2 6h12v10H2zM14 10h4l3 3.5V16h-7z"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    boat: '<path d="M3 13h18l-3 6H6z"/><path d="M9 13L5 6M15 13l4-7"/>',
    unit: '<circle cx="8" cy="8" r="2.5"/><circle cx="16" cy="8" r="2.5"/><path d="M3.5 19c0-3 2-5 4.5-5s4.5 2 4.5 5M11.5 19c0-3 2-5 4.5-5s4.5 2 4.5 5"/>',
    util: '<path d="M12 3v17M7 20h10M4 7h16"/><path d="M4 7L1.5 13h5zM20 7l-2.5 6h5z"/>',
    kant: '<path d="M3 21h18M5 18h14M4 8h16L12 3z"/><path d="M6.5 18V8M10 18V8M14 18V8M17.5 18V8"/>',
    virtue: '<path d="M12 21c-4-1.5-7-5.5-7-11M12 21c4-1.5 7-5.5 7-11"/><path d="M5 10c-1.5-1-2-2.5-1.8-4 1.5.2 2.6 1.3 2.8 3M6.5 14c-2-.5-3-2-3.2-3.5 1.6 0 3 1 3.5 2.6M8.6 17.4c-2 .1-3.5-.9-4-2.3 1.6-.4 3.2.3 4 1.6M19 10c1.5-1 2-2.5 1.8-4-1.5.2-2.6 1.3-2.8 3M17.5 14c2-.5 3-2 3.2-3.5-1.6 0-3 1-3.5 2.6M15.4 17.4c2 .1 3.5-.9 4-2.3-1.6-.4-3.2.3-4 1.6"/>'
  };
  const svgIcon = (name, cls = "") =>
    `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;

  /* ───────── dom helpers ───────── */
  const $ = (sel) => document.querySelector(sel);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const html = (tag, cls, markup) => {
    const e = el(tag, cls);
    e.innerHTML = markup;
    return e;
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, REDUCED ? Math.min(ms, 150) : ms));

  const body = document.body;
  const card = $("#card");
  const caption = $("#caption");
  const whoEl = $("#who");
  const lineEl = $("#line");
  const promptEl = $("#prompt");
  const choicesEl = $("#choices");
  const reactEl = $("#react");
  const toastEl = $("#toast");
  const endingEl = $("#ending");
  const doc = $("#doc");
  const docInner = $("#docInner");
  const hudObj = $(".hud-obj");

  const state = { history: [], ending: null, visited: [], km: 40 };
  let runId = 0;
  let advanceFn = null;
  let typing = null;
  let holdHandles = null;
  let curScene = "title";

  /* ───────── saved endings (per browser) ───────── */
  const KEY = "lastOrders.endings";
  const found = {
    get() {
      try {
        return JSON.parse(localStorage.getItem(KEY) || "[]");
      } catch (e) {
        return [];
      }
    },
    add(id) {
      try {
        const a = found.get();
        if (!a.includes(id)) a.push(id);
        localStorage.setItem(KEY, JSON.stringify(a));
      } catch (e) {}
    }
  };

  /* ───────── scene renderer ───────── */
  function layout(w, h) {
    const portrait = w < h * 0.95;
    return portrait ? { cx: w / 2, availW: w, bottom: h * 0.64, portrait } : { cx: w / 2, availW: w, bottom: h * 0.9, portrait };
  }
  const renderer = new window.SceneRenderer($("#scene"), layout);
  function scene(name, opts) {
    curScene = name;
    renderer.set(name, opts || {});
  }

  function screen(name) {
    body.dataset.screen = name;
    $("#title").hidden = name !== "title";
    endingEl.hidden = name !== "ending";
    doc.hidden = name !== "doc";
    if (name !== "play") {
      [card, caption, promptEl, choicesEl, reactEl].forEach((e) => (e.hidden = true));
      cinema(false);
    }
  }
  const cinema = (on) => body.classList.toggle("cinema", on);

  function toast(text) {
    toastEl.hidden = true;
    toastEl.textContent = text;
    void toastEl.offsetWidth;
    toastEl.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => (toastEl.hidden = true), 1900);
  }

  /* ───────── HUD ───────── */
  function hudTime(time) {
    $("#clock").textContent = time;
  }
  function hudKm(target, ms = 1800) {
    const from = state.km;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      state.km = Math.round(from + (target - from) * p);
      $("#km").textContent = `${state.km} km`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ───────── waiting for the player ───────── */
  function waitAdvance(ms) {
    return new Promise((res) => {
      let tm = null;
      const finish = () => {
        clearTimeout(tm);
        if (advanceFn === finish) advanceFn = null;
        res();
      };
      advanceFn = finish;
      if (ms) tm = setTimeout(finish, REDUCED ? ms / 2 : ms);
    });
  }
  function advance() {
    if (typing) return typing.finish();
    if (advanceFn) advanceFn();
  }

  /* ───────── subtitles ───────── */
  function say(beat) {
    return new Promise((done) => {
      caption.hidden = false;
      caption.classList.remove("ready");
      whoEl.textContent = beat.who || "";
      lineEl.classList.toggle("quote", !!beat.who && !beat.plain);
      const shown = el("span");
      const ghost = el("span", "ghost", beat.text);
      lineEl.replaceChildren(shown, ghost);
      const text = beat.text;
      let cancelled = false;
      const finish = () => {
        if (cancelled) return;
        cancelled = true;
        typing = null;
        shown.textContent = text;
        ghost.textContent = "";
        caption.classList.add("ready");
        done();
      };
      typing = { finish };
      if (REDUCED) return finish();
      let c = 0,
        budget = 0,
        last = performance.now();
      const step = (now) => {
        if (cancelled) return;
        budget += ((now - last) / 1000) * 48;
        last = now;
        while (budget >= 1 && c < text.length) {
          c++;
          budget--;
          const ch = text[c - 1];
          if (ch === "." || ch === "?" || ch === "!") budget -= 6;
        }
        shown.textContent = text.slice(0, c);
        ghost.textContent = text.slice(c);
        if (c >= text.length) finish();
        else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  async function playBeats(beats, id) {
    for (const b of beats) {
      const beat = typeof b === "string" ? { text: b } : b;
      if (beat.scene && beat.scene !== curScene) {
        caption.hidden = true;
        scene(beat.scene);
        await sleep(1100);
        if (id !== runId) return false;
      }
      if (beat.variant) scene(curScene, { variant: beat.variant });
      if (beat.fx) renderer.fx(beat.fx);
      await say(beat);
      if (id !== runId) return false;
      await waitAdvance();
      if (id !== runId) return false;
    }
    caption.hidden = true;
    return true;
  }

  /* ───────── title cards ───────── */
  async function showCard(children, ms, id) {
    card.hidden = false;
    card.classList.remove("out");
    card.replaceChildren(...children);
    await waitAdvance(ms);
    if (id !== runId) return false;
    card.classList.add("out");
    await sleep(500);
    card.hidden = true;
    return id === runId;
  }

  /* ───────── the opening ───────── */
  async function opening(id) {
    screen("play");
    cinema(true);
    scene("title");
    hudTime("21:40");
    state.km = 40;
    $("#km").textContent = "40 km";
    await sleep(600);
    for (const c of S.opening) {
      if (c.fx) renderer.fx(c.fx);
      if (!(await showCard([el("p", "card-big", c.big), el("p", "card-small", c.small)], 3400, id))) return false;
    }
    hudObj.classList.remove("flash");
    void hudObj.offsetWidth;
    hudObj.classList.add("flash");
    toast("New objective: reach Saltmarsh Harbor");
    if (A) A.blip();
    await sleep(900);
    return id === runId;
  }

  /* ───────── travel on the map ───────── */
  async function travel(from, to, id, line) {
    const node = S.nodes[to];
    const fromCh = from === "veyra" ? 0 : S.nodes[from].chapter;
    cinema(true);
    caption.hidden = true;
    scene("map", { from, to, fromCh, toCh: node.chapter, visited: state.visited.slice() });
    await sleep(700);
    if (id !== runId) return false;
    hudTime(node.time);
    hudKm(node.km);
    if (line) await say({ who: `En route · ${S.places[to].name} · ${node.time}`, text: line, plain: true });
    else await say({ who: "En route", text: `${node.place} · ${node.time}` });
    await waitAdvance(line ? 3800 : 3200);
    caption.hidden = true;
    return id === runId;
  }

  /* ───────── one chapter ───────── */
  async function playNode(nodeId, id) {
    const node = S.nodes[nodeId];
    state.visited.push(nodeId);
    scene(node.scene);
    await sleep(1000);
    if (id !== runId) return;
    const ok = await showCard(
      [el("p", "card-k", `Chapter ${ROMAN[node.chapter]}`), el("h2", "card-title", node.title), el("p", "card-sub", `${node.place} · ${node.time}`)],
      2800,
      id
    );
    if (!ok) return;
    cinema(false);
    if (!(await playBeats(node.beats, id))) return;

    const choice = await decide(node, id);
    if (!choice || id !== runId) return;
    state.history.push({ node, choice });

    cinema(true);
    if (!(await playBeats(choice.beats, id))) return;
    await philosophersReact(node, choice, id);
    if (id !== runId) return;

    if (choice.ending) return showEnding(choice.ending);
    if (!(await travel(nodeId, choice.next, id, choice.travel))) return;
    return playNode(choice.next, id);
  }

  /* ───────── the decision ───────── */
  function decide(node, id) {
    return new Promise((resolve) => {
      renderer.push(true);
      $("#promptK").textContent = `Decision ${ROMAN[node.chapter]} of IV · ${node.theme}`;
      $("#promptQ").textContent = node.prompt;
      $("#promptSub").textContent = node.dilemma;
      promptEl.classList.remove("urgent");
      promptEl.hidden = false;
      const bar = $("#timerBar");
      bar.style.width = "100%";

      choicesEl.replaceChildren();
      choicesEl.classList.remove("done");
      choicesEl.hidden = false;
      let decided = false;
      const t0 = performance.now();
      if (A) A.heartbeat(true, 1);

      const tick = (now) => {
        if (decided || id !== runId) return;
        const p = Math.min(1, (now - t0) / DECIDE_MS);
        bar.style.width = `${(1 - p) * 100}%`;
        if (A) A.setHeartRate(1 + p * 1.3);
        if (p >= 1) promptEl.classList.add("urgent");
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      const buttons = node.choices.map((c, i) => {
        const b = el("button", "choice");
        b.type = "button";
        b.setAttribute("aria-label", `${c.label}. ${c.sub} Gain: ${c.pro} Cost: ${c.con} Press and hold to choose.`);
        // what you do, then what you gain and what it costs
        const outcome = (kind, mark, text) => {
          const row = el("span", `c-out ${kind}`);
          row.append(el("i", null, mark), el("span", null, text));
          return row;
        };
        b.append(
          html("span", "", svgIcon(c.icon, "ico")).firstChild,
          el("span", "c-label", c.label),
          el("span", "c-sub", c.sub),
          outcome("pro", "+", c.pro),
          outcome("con", "−", c.con),
          html("span", "c-hold", `Hold <b>${i + 1}</b>`)
        );
        b._hold = holdable(b, () => commit(c, b));
        choicesEl.append(b);
        return b;
      });
      holdHandles = buttons.map((b) => b._hold);
      if (!state.history.length) setTimeout(() => !decided && toast("Press and hold a choice"), 1400);

      function commit(c, b) {
        if (decided) return;
        decided = true;
        holdHandles = null;
        if (A) {
          A.heartbeat(false);
          A.commit();
        }
        renderer.push(false);
        renderer.whiteout(0.18);
        choicesEl.classList.add("done");
        b.classList.add("picked");
        buttons.filter((x) => x !== b).forEach((x) => x.classList.add("dropped"));
        setTimeout(() => {
          promptEl.hidden = true;
          choicesEl.hidden = true;
          resolve(c);
        }, REDUCED ? 200 : 1000);
      }
    });
  }

  // Press and hold to commit, so each choice has weight
  function holdable(btn, onDone) {
    let start = 0,
      raf = 0,
      holding = false;
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / HOLD_MS);
      btn.style.setProperty("--p", p);
      if (p >= 1) {
        holding = false;
        btn.classList.remove("holding");
        onDone();
      } else raf = requestAnimationFrame(tick);
    };
    const down = () => {
      if (holding || choicesEl.classList.contains("done")) return;
      holding = true;
      start = performance.now();
      btn.classList.add("holding");
      if (A) A.holdStart(HOLD_MS);
      raf = requestAnimationFrame(tick);
    };
    const up = () => {
      if (!holding) return;
      holding = false;
      cancelAnimationFrame(raf);
      btn.classList.remove("holding");
      btn.style.setProperty("--p", 0);
      if (A) A.holdStop();
      toast("Hold to decide");
    };
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      try {
        btn.setPointerCapture(e.pointerId);
      } catch (err) {}
      down();
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => btn.addEventListener(ev, up));
    btn.addEventListener("contextmenu", (e) => e.preventDefault());
    return { down, up };
  }

  /* ───────── the philosophers react ───────── */
  function verdictOf(lens, choice) {
    if (lens.verdict === "split") return "split";
    return lens.verdict === choice.key ? "agree" : "disagree";
  }
  async function philosophersReact(node, choice, id) {
    const medals = el("div", "medals");
    FW.forEach((k) => {
      const v = verdictOf(node.debrief.lenses[k], choice);
      const m = el("div", `medal ${v}`);
      const txt = el("div", "medal-txt");
      txt.append(
        el("span", "medal-name", S.frameworks[k].short),
        el("span", "medal-motto", S.frameworks[k].motto),
        el("span", "medal-v", v === "agree" ? "Agrees" : v === "disagree" ? "Disagrees" : "Divided"),
        el("span", "medal-says", node.debrief.lenses[k].says)
      );
      m.append(html("div", "disc", svgIcon(k)), txt);
      medals.append(m);
    });
    reactEl.replaceChildren(el("p", "react-k", "The philosophers react to your choice"), el("p", "react-choice", choice.label), medals);
    reactEl.hidden = false;
    if (A) [0, 350, 700].forEach((d) => setTimeout(() => A.click(), d));
    await sleep(900);
    await waitAdvance(10000);
    reactEl.hidden = true;
  }

  /* ───────── ending ───────── */
  function showEnding(id) {
    const e = S.endings[id];
    state.ending = id;
    found.add(id);
    screen("ending");
    scene(e.survived ? "survive" : "death");
    if (A) A.sting(e.survived ? "survive" : "death");
    endingEl.replaceChildren(
      el("p", "dispatch", `Decisions made: ${state.history.length} of 4`),
      el("h1", `verdict ${e.survived ? "live" : "die"}`, e.survived ? "You survived" : "You did not survive"),
      el("p", "ending-name", `Ending: ${e.title}`),
      el("p", "epitaph", e.epitaph)
    );
    const b = el("button", "btn primary", "See your moral profile");
    b.type = "button";
    b.addEventListener("click", () => {
      if (A) A.click();
      showReport();
    });
    endingEl.append(b);
    setTimeout(() => b.focus({ preventScroll: true }), REDUCED ? 0 : 3400);
  }

  /* ───────── moral profile ───────── */
  // Each framework scores 1 when it agrees with a choice, 0.5 when divided, 0 when it disagrees.
  function scoresAfter(k) {
    const s = { util: 0, kant: 0, virtue: 0 };
    state.history.slice(0, k).forEach(({ node, choice }) => {
      FW.forEach((f) => {
        const v = verdictOf(node.debrief.lenses[f], choice);
        s[f] += v === "agree" ? 1 : v === "split" ? 0.5 : 0;
      });
    });
    FW.forEach((f) => (s[f] /= Math.max(1, k)));
    return s;
  }

  function triangle(profileKey) {
    const NS = "http://www.w3.org/2000/svg";
    const C = { util: [220, 70], kant: [50, 364], virtue: [390, 364] };
    const G = [220, 266];
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const pos = (s) => {
      const tot = s.util + s.kant + s.virtue;
      if (!tot) return G.slice();
      return [0, 1].map((i) => FW.reduce((acc, f) => acc + (s[f] / tot) * C[f][i], 0));
    };
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 440 430");
    svg.setAttribute("class", "tri");
    svg.setAttribute("role", "img");
    const n = state.history.length;
    const pts = [G];
    for (let k = 1; k <= n; k++) pts.push(pos(scoresAfter(k)));
    const last = pts[pts.length - 1];
    svg.setAttribute("aria-label", `Ethical profile triangle. Your marker sits closest to ${profileKey === "plural" ? "the center" : S.frameworks[profileKey].name}.`);

    const add = (tag, attrs, parent = svg) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      parent.append(e);
      return e;
    };
    const P = (arr) => arr.map((p) => p.join(",")).join(" ");
    // regions around each corner
    const M = { uk: mid(C.util, C.kant), uv: mid(C.util, C.virtue), kv: mid(C.kant, C.virtue) };
    const regions = { util: [C.util, M.uk, G, M.uv], kant: [C.kant, M.kv, G, M.uk], virtue: [C.virtue, M.uv, G, M.kv] };
    FW.forEach((f) => add("polygon", { points: P(regions[f]), class: `region${f === profileKey ? " on" : ""}` }));
    // inner guide triangles
    [0.33, 0.66].forEach((t) => add("polygon", { points: P(FW.map((f) => [G[0] + (C[f][0] - G[0]) * t, G[1] + (C[f][1] - G[1]) * t])), class: "grid" }));
    add("polygon", { points: P(FW.map((f) => C[f])), class: "edge" });
    add("circle", { cx: G[0], cy: G[1], r: 34, class: `center-mark${profileKey === "plural" ? " on" : ""}` });
    add("text", { x: G[0], y: G[1] + 50, class: "center-label" }).textContent = "PLURALIST";

    // corners: emblem + name
    const labels = {
      util: { x: 220, y: 22, a: "middle" },
      kant: { x: 22, y: 410, a: "start" },
      virtue: { x: 418, y: 410, a: "end" }
    };
    FW.forEach((f) => {
      const on = f === profileKey;
      add("circle", { cx: C[f][0], cy: C[f][1], r: 24, class: `corner-dot${on ? " on" : ""}` });
      const g = add("g", { transform: `translate(${C[f][0] - 14.4},${C[f][1] - 14.4}) scale(1.2)`, fill: "none", stroke: on ? "#140d04" : "currentColor", "stroke-width": 1.7, "stroke-linecap": "round", "stroke-linejoin": "round", style: on ? "" : "color: var(--ash)" });
      g.innerHTML = ICONS[f];
      const L = labels[f];
      add("text", { x: L.x, y: L.y, "text-anchor": L.a, class: `c-name${on ? " on" : ""}` }).textContent = S.frameworks[f].name;
      add("text", { x: L.x, y: L.y + 15, "text-anchor": L.a, class: "c-who" }).textContent = S.frameworks[f].who;
    });

    // your path, decision by decision
    add("circle", { cx: G[0], cy: G[1], r: 4, class: "start" });
    add("polyline", { points: P(pts), class: "trail", pathLength: 1 });
    // numbered waypoints; ones sitting under the final marker are left out
    const placed = [last];
    pts.slice(1, -1).forEach((p, i) => {
      let [x, y] = p;
      if (Math.hypot(last[0] - x, last[1] - y) < 26) return;
      while (placed.some((q) => Math.hypot(q[0] - x, q[1] - y) < 22)) y -= 22;
      placed.push([x, y]);
      const g = add("g", { class: "wp", style: `animation-delay:${0.4 + (2.2 * (i + 1)) / (pts.length - 1)}s` });
      add("circle", { cx: x, cy: y, r: 10 }, g);
      add("text", { x, y }, g).textContent = ROMAN[i + 1];
    });
    const me = add("g", { class: "me" });
    add("circle", { cx: last[0], cy: last[1], r: 14, class: "ring" }, me);
    add("circle", { cx: last[0], cy: last[1], r: 14, class: "core" }, me);
    add("text", { x: last[0], y: last[1] + 1, "text-anchor": "middle", "dominant-baseline": "central", style: "font: 600 11px var(--mono); fill: #140d04" }, me).textContent = "YOU";
    return svg;
  }

  function showReport() {
    const e = S.endings[state.ending];
    const n = state.history.length;
    const s = scoresAfter(n);
    const tot = s.util + s.kant + s.virtue || 1;
    const top = FW.reduce((a, b) => (s[b] > s[a] ? b : a));
    const profileKey = s[top] / tot >= 0.4 ? top : "plural";
    const prof = S.profiles[profileKey];

    screen("doc");
    scene("quiet");
    docInner.className = "doc-inner";
    docInner.replaceChildren();

    // header
    const head = el("header", "r-head");
    const hl = el("div");
    hl.append(el("p", "dispatch", "After-action report · Cpl. Wren"), el("h1", null, e.title), el("p", "epi", e.epitaph));
    const luck = el("p", "luck");
    luck.innerHTML = e.survived
      ? "<b>Moral luck:</b> you survived, but that doesn’t mean you chose right. In this game, staying alive is never the reward for being good."
      : "<b>Moral luck:</b> you died, but that doesn’t mean you chose wrong. In this game, staying alive is never the reward for being good.";
    hl.append(luck);
    head.append(hl, el("span", `stamp ${e.survived ? "live" : "die"}`, e.survived ? "Survived" : "Killed in action"));
    docInner.append(head);

    // hero: the triangle + profile
    const hero = el("section", "hero");
    const profile = el("div", "profile");
    profile.append(el("p", "you", "Your choices make you"), el("p", "pname", prof.label), el("p", "ptext", prof.text));
    const bars = el("div", "bars");
    FW.forEach((f) => {
      const row = el("div", `bar-row${f === top && profileKey !== "plural" ? " top" : ""}`);
      const track = el("div", "track");
      const fill = el("i");
      fill.style.width = `${Math.round(s[f] * 100)}%`;
      track.append(fill);
      row.append(html("span", "", svgIcon(f)).firstChild, el("span", "bn", `${S.frameworks[f].short} agreed`), el("span", "pct", `${Math.round(s[f] * 100)}%`), track);
      bars.append(row);
    });
    profile.append(bars);

    const orders = state.history.filter((h) => h.choice.tags.obey !== null);
    if (orders.length) {
      const ob = orders.filter((h) => h.choice.tags.obey).length;
      const box = el("div", "orders");
      box.append(el("p", "label", "Orders vs. conscience"));
      const row = el("div", "orders-row");
      const pips = el("div", "pips");
      orders.forEach((h) => {
        const p = el("span", `pip ${h.choice.tags.obey ? "obey" : "defy"}`, ROMAN[h.node.chapter]);
        p.title = `${h.node.title}: ${h.choice.tags.obey ? "obeyed" : "defied"}`;
        pips.append(p);
      });
      row.append(pips, el("span", null, `You obeyed ${ob} of ${orders.length} orders`));
      box.append(row);
      profile.append(box);
    }
    hero.append(triangle(profileKey), profile);
    docInner.append(hero);

    // decisions
    const dsec = el("section");
    dsec.append(el("p", "label", `Your ${n} decisions · open one to see why`));
    const grid = el("div", "dcards");
    state.history.forEach(({ node, choice }) => {
      const d = node.debrief;
      const c = el("article", "dcard");
      const other = node.choices.find((x) => x !== choice);
      c.append(el("span", "d-top", `${ROMAN[node.chapter]} · ${node.title}`), el("p", "d-q", node.dilemma));
      c.append(html("div", "d-choice", `${svgIcon(choice.icon)}<span></span>`));
      c.querySelector(".d-choice span").textContent = choice.label;
      c.append(el("span", "d-other", `instead of: ${other.label}`));
      const vs = el("div", "d-verdicts");
      FW.forEach((f) => {
        const v = verdictOf(d.lenses[f], choice);
        const chip = html("span", `chip ${v}`, `${svgIcon(f)}${CHIP[f]} ${v === "agree" ? "✓" : v === "disagree" ? "✗" : "~"}`);
        chip.title = `${S.frameworks[f].short}: ${v === "agree" ? "agrees" : v === "disagree" ? "disagrees" : "divided"}`;
        vs.append(chip);
      });
      c.append(vs);
      const det = el("details");
      det.append(el("summary", null, "Why"));
      const why = el("div", "why");
      FW.forEach((f) => {
        const p = el("p");
        p.append(el("span", "lens-k", S.frameworks[f].short), document.createTextNode(d.lenses[f].text));
        why.append(p);
      });
      why.append(el("p", "q", d.question), el("p", "ctx", d.context));
      det.append(why);
      c.append(det);
      grid.append(c);
    });
    dsec.append(grid);
    docInner.append(dsec);

    // footer
    const got = found.get();
    const foot = el("footer", "foot");
    const tokens = el("div", "tokens");
    tokens.append(el("span", "label", `Endings found ${ENDING_ORDER.filter((x) => got.includes(x)).length} of ${ENDING_ORDER.length}`));
    ENDING_ORDER.forEach((x) => {
      const has = got.includes(x);
      const t = el("span", `token${has ? (S.endings[x].survived ? " live" : " die") : ""}`);
      t.title = has ? S.endings[x].title : "Undiscovered";
      tokens.append(t);
    });
    const actions = el("div", "doc-actions");
    const again = el("button", "btn primary", "Play again");
    again.type = "button";
    again.addEventListener("click", () => {
      if (A) A.click();
      start(false);
    });
    const notes = el("button", "btn", "Designer’s Notes");
    notes.type = "button";
    notes.addEventListener("click", () => {
      if (A) A.click();
      showNotes("report");
    });
    actions.append(again, notes);
    foot.append(tokens, actions);
    docInner.append(foot);
    doc.scrollTop = 0;
  }

  /* ───────── designer's notes ───────── */
  function showNotes(from) {
    runId++;
    screen("doc");
    scene("quiet");
    docInner.className = "doc-inner notes-page";
    docInner.replaceChildren();
    const head = el("header");
    head.append(el("p", "dispatch", "Philosophy project · Designer’s notes"), el("h1", null, "Designer’s Notes"));
    const art = el("article", "notes");
    art.innerHTML = S.notes;
    const actions = el("div", "doc-actions");
    const back = el("button", "btn primary", from === "report" ? "Back to your profile" : "Back to the title");
    back.type = "button";
    back.addEventListener("click", () => {
      if (A) A.click();
      if (from === "report" && state.ending) showReport();
      else showTitle();
    });
    actions.append(back);
    docInner.append(head, art, actions);
    doc.scrollTop = 0;
  }

  /* ───────── title / start ───────── */
  function showTitle() {
    runId++;
    screen("title");
    scene("title");
    const n = found.get().filter((x) => ENDING_ORDER.includes(x)).length;
    $("#found").textContent = n ? `Endings found: ${n} of ${ENDING_ORDER.length}` : `${ENDING_ORDER.length} endings to find.`;
  }

  async function start(withOpening) {
    if (A) {
      A.init();
      A.setMuted(muted);
      A.click();
    }
    const id = ++runId;
    state.history = [];
    state.ending = null;
    state.visited = ["veyra"];
    screen("play");
    if (withOpening && !(await opening(id))) return;
    if (!withOpening) {
      state.km = 40;
      hudTime("21:40");
    }
    if (!(await travel("veyra", S.start, id))) return;
    playNode(S.start, id);
  }

  /* ───────── input ───────── */
  document.addEventListener("click", (e) => {
    if (body.dataset.screen !== "play") return;
    if (e.target.closest("button, #hud, .choices")) return;
    advance();
  });
  const held = {};
  document.addEventListener("keydown", (e) => {
    if (body.dataset.screen !== "play") return;
    const onChoice = e.target.closest && e.target.closest(".choice");
    if (holdHandles && (e.key === "1" || e.key === "2")) {
      if (!e.repeat) {
        const h = holdHandles[Number(e.key) - 1];
        if (h) {
          held[e.key] = h;
          h.down();
        }
      }
      return;
    }
    if (onChoice && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      if (!e.repeat && onChoice._hold) {
        held[e.key] = onChoice._hold;
        onChoice._hold.down();
      }
      return;
    }
    if (e.target.closest && e.target.closest("button")) return;
    if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") {
      e.preventDefault();
      advance();
    }
  });
  document.addEventListener("keyup", (e) => {
    if (held[e.key]) {
      held[e.key].up();
      delete held[e.key];
    }
  });

  let muted = false;
  try {
    muted = localStorage.getItem("lastOrders.muted") === "1";
  } catch (e) {}
  const soundBtn = $("#sound");
  const paintSound = () => {
    soundBtn.textContent = muted ? "Sound off" : "Sound on";
    soundBtn.setAttribute("aria-pressed", String(!muted));
  };
  paintSound();
  soundBtn.addEventListener("click", () => {
    muted = !muted;
    try {
      localStorage.setItem("lastOrders.muted", muted ? "1" : "0");
    } catch (e) {}
    if (A) {
      A.init();
      A.setMuted(muted);
      A.setMood(renderer.def.audio || {});
    }
    paintSound();
  });

  $("#begin").addEventListener("click", () => start(true));
  $("#notesBtn").addEventListener("click", () => {
    if (A) A.click();
    showNotes("title");
  });

  showTitle();
})();
