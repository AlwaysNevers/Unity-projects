/*
  LAST ORDERS — game flow
  Title → intro → four dilemmas → ending → debrief.
*/
(function () {
  const S = window.STORY;
  const A = window.AudioFX;
  const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ROMAN = ["", "I", "II", "III", "IV"];
  const LENS_NAMES = { util: "Utilitarianism", kant: "Kantian deontology", virtue: "Virtue ethics" };
  const ENDING_ORDER = ["last_aboard", "miras_place", "silent_radio", "coordinates", "clean_hands"];

  const $ = (sel) => document.querySelector(sel);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  const body = document.body;
  const panel = $("#panel");
  const inner = $("#panelInner");
  const titleEl = $("#title");
  const endingEl = $("#ending");
  const doc = $("#doc");
  const docInner = $("#docInner");

  const state = { history: [], ending: null };
  let typing = null; // active typewriter
  let keyChoices = null; // choices available for number keys
  let returnTo = null;

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

  /* ───────── scene layout ───────── */
  function layout(w, h) {
    const wide = w >= 860;
    if (body.dataset.mode === "panel") {
      if (wide) {
        const pw = Math.min(600, Math.max(420, w * 0.42));
        return { cx: (w - pw) / 2, availW: w - pw, top: 0, bottom: h * 0.9 };
      }
      return { cx: w / 2, availW: w, top: 0, bottom: h * 0.4 };
    }
    return { cx: w / 2, availW: w, top: 0, bottom: h * (wide ? 0.9 : 0.75) };
  }
  const renderer = new window.SceneRenderer($("#scene"), layout);
  const origSwap = renderer.swap.bind(renderer);
  renderer.swap = function () {
    origSwap();
    renderer.resize(); // re-frame the stage for the new mode while the screen is black
  };

  function screen(name, mode) {
    body.dataset.screen = name;
    body.dataset.mode = mode;
    titleEl.hidden = name !== "title";
    panel.hidden = mode !== "panel";
    endingEl.hidden = name !== "ending";
    doc.hidden = name !== "doc";
    keyChoices = null;
    A.heartbeat(false);
  }

  function pips(ch) {
    document.querySelectorAll("#pips li").forEach((li, i) => {
      li.className = i + 1 < ch ? "done" : i + 1 === ch ? "now" : "";
    });
  }

  /* ───────── panel transitions + typewriter ───────── */
  function swapPanel(build) {
    stopTyping();
    const go = () => {
      inner.replaceChildren();
      inner.classList.remove("leaving");
      build(inner);
      inner.classList.remove("entering");
      void inner.offsetWidth;
      inner.classList.add("entering");
      panel.scrollTop = 0;
    };
    if (panel.hidden || !inner.childElementCount) go();
    else {
      inner.classList.add("leaving");
      setTimeout(go, REDUCED ? 0 : 420);
    }
  }

  function stopTyping() {
    if (typing) typing.cancel();
    typing = null;
  }

  // Types paragraphs into container. The full text is laid out from the
  // start (the unrevealed part is transparent) so nothing jumps around.
  function typeText(container, paras, done) {
    const parts = paras.map((t) => {
      const p = el("p");
      const shown = el("span");
      const ghost = el("span", "ghost", t);
      p.append(shown, ghost);
      container.append(p);
      return { t, shown, ghost };
    });
    let cancelled = false;
    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      parts.forEach((p) => {
        p.shown.textContent = p.t;
        p.ghost.textContent = "";
      });
      typing = null;
      done();
    };
    typing = {
      finish,
      cancel() {
        cancelled = true;
      }
    };
    if (REDUCED) return finish();
    const CPS = 90;
    let i = 0,
      c = 0,
      budget = 0,
      last = performance.now();
    const step = (now) => {
      if (cancelled) return;
      budget += ((now - last) / 1000) * CPS;
      last = now;
      while (budget >= 1 && i < parts.length) {
        const p = parts[i];
        c++;
        budget--;
        if (c > p.t.length) {
          i++;
          c = 0;
          budget -= 22; // short pause between paragraphs
          continue;
        }
        const ch = p.t[c - 1];
        if (ch === "." || ch === "?" || ch === "!") budget -= 5;
        p.shown.textContent = p.t.slice(0, c);
        p.ghost.textContent = p.t.slice(c);
      }
      if (i >= parts.length) finish();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function continueButton(label, onClick) {
    const row = el("div", "row-end");
    const b = el("button", "btn primary pending-btn", label);
    b.type = "button";
    b.disabled = true;
    b.addEventListener("click", () => {
      A.click();
      onClick();
    });
    row.append(b);
    return {
      row,
      reveal() {
        b.disabled = false;
        b.classList.remove("pending-btn");
        b.animate && !REDUCED && b.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
        b.focus({ preventScroll: true });
        row.scrollIntoView({ block: "nearest", behavior: REDUCED ? "auto" : "smooth" });
      }
    };
  }

  function skipHint() {
    const h = el("p", "hint", "Tap or press Space to skip");
    return h;
  }

  /* ───────── title ───────── */
  function showTitle() {
    screen("title", "full");
    renderer.set("title");
    const n = found.get().length;
    $("#found").textContent = n ? `Endings found: ${n} of ${ENDING_ORDER.length}` : `${ENDING_ORDER.length} endings to find.`;
  }

  /* ───────── intro ───────── */
  function showIntro(i) {
    screen("intro", "panel");
    pips(0);
    renderer.set("intro");
    const card = S.intro[i];
    swapPanel((box) => {
      const head = el("div", "node-head");
      head.append(el("p", "dispatch", `Briefing ${i + 1} / ${S.intro.length}`), el("h2", "kicker", card.kicker));
      const story = el("div", "story");
      const last = i === S.intro.length - 1;
      const cont = continueButton(last ? "Take your post" : "Continue", () => (last ? showNode(S.start) : showIntro(i + 1)));
      const hint = skipHint();
      box.append(head, story, cont.row, hint);
      typeText(story, card.text, () => {
        hint.remove();
        cont.reveal();
      });
    });
  }

  /* ───────── dilemma ───────── */
  function showNode(id) {
    const node = S.nodes[id];
    screen("node", "panel");
    pips(node.chapter);
    renderer.set(node.scene);
    swapPanel((box) => {
      const head = el("div", "node-head");
      const h = el("h2", "node-title");
      h.append(el("span", "num", ROMAN[node.chapter]), document.createTextNode(node.title));
      head.append(el("p", "dispatch", node.dispatch), h);
      const story = el("div", "story");
      const list = el("div", "choices pending");
      const buttons = node.choices.map((c, idx) => {
        const b = el("button", "choice");
        b.type = "button";
        b.disabled = true;
        b.append(el("span", "key", String(idx + 1)), el("span", "c-label", c.label), el("span", "c-sub", c.sub));
        b.addEventListener("click", () => choose(node, c, b, list));
        list.append(b);
        return b;
      });
      const hint = skipHint();
      box.append(head, story, list, hint);
      typeText(story, node.text, () => {
        hint.remove();
        list.classList.remove("pending");
        list.classList.add("shown");
        buttons.forEach((b) => (b.disabled = false));
        list.scrollIntoView({ block: "nearest", behavior: REDUCED ? "auto" : "smooth" });
        keyChoices = buttons;
        A.heartbeat(true);
      });
    });
  }

  function choose(node, choice, button, list) {
    if (list.classList.contains("locked")) return;
    keyChoices = null;
    A.heartbeat(false);
    A.click();
    list.classList.add("locked");
    button.classList.add("picked");
    list.querySelectorAll("button").forEach((b) => (b.disabled = true));
    state.history.push({ node: node, choice });

    if (choice.variant) renderer.set(node.scene, { variant: choice.variant });
    if (choice.fx === "explosion") setTimeout(() => renderer.explode(520, 380, 1.2), 250);
    if (choice.fx === "shots") renderer.muzzle();
    if (choice.fx === "barrage") setTimeout(() => renderer.barrage(), 600);

    setTimeout(() => showResult(node, choice), REDUCED ? 300 : 1300);
  }

  function showResult(node, choice) {
    screen("result", "panel");
    swapPanel((box) => {
      const head = el("div", "node-head");
      const h = el("h2", "node-title");
      h.append(el("span", "num", ROMAN[node.chapter]), document.createTextNode(node.title));
      head.append(el("p", "dispatch", node.dispatch), h);
      const chose = el("p", "you-chose", "You chose: ");
      chose.append(el("b", null, choice.label));
      const story = el("div", "story");
      const cont = choice.ending
        ? continueButton("…", () => showEnding(choice.ending))
        : continueButton("Continue", () => showNode(choice.next));
      const hint = skipHint();
      box.append(head, chose, story, cont.row, hint);
      typeText(story, choice.result, () => {
        hint.remove();
        cont.reveal();
      });
    });
  }

  /* ───────── ending ───────── */
  function showEnding(id) {
    const e = S.endings[id];
    state.ending = id;
    found.add(id);
    screen("ending", "full");
    renderer.set(e.survived ? "survive" : "death");
    A.sting(e.survived ? "survive" : "death");
    endingEl.replaceChildren();
    const made = state.history.length;
    endingEl.append(
      el("p", "dispatch", `Decisions made: ${made} of 4`),
      el("h1", `verdict ${e.survived ? "live" : "die"}`, e.survived ? "You survived" : "You did not survive"),
      el("p", "ending-name", `Ending: ${e.title}`),
      el("p", "epitaph", e.epitaph)
    );
    const b = el("button", "btn primary", "See what your choices meant");
    b.type = "button";
    b.addEventListener("click", () => {
      A.click();
      showDebrief();
    });
    endingEl.append(b);
    setTimeout(() => b.focus({ preventScroll: true }), REDUCED ? 0 : 3500);
  }

  /* ───────── debrief ───────── */
  function computeProfile() {
    let ob = 0,
      obN = 0,
      en = 0;
    const fw = { util: [0, 0], kant: [0, 0], virtue: [0, 0] };
    state.history.forEach(({ node, choice }) => {
      if (choice.tags.obey !== null) {
        obN++;
        if (choice.tags.obey) ob++;
      }
      if (choice.tags.ends) en++;
      for (const k in fw) {
        const v = node.debrief.lenses[k].verdict;
        if (v === "split") continue;
        fw[k][1]++;
        if (v === choice.key) fw[k][0]++;
      }
    });
    const o = obN ? ob / obN : 0.5;
    const e = state.history.length ? en / state.history.length : 0.5;
    const hi = (v) => v >= 0.67,
      lo = (v) => v <= 0.33;
    let key = "torn";
    if (hi(o) && hi(e)) key = "instrument";
    else if (lo(o) && lo(e)) key = "objector";
    else if (lo(o) && hi(e)) key = "calculator";
    else if (hi(o) && lo(e)) key = "dutiful";
    return { key, o, e, obN, fw };
  }

  function meter(left, right, value) {
    const m = el("div", "meter");
    const ends = el("div", "ends");
    ends.append(el("span", null, left), el("span", null, right));
    const track = el("div", "track");
    const mark = el("span", "mark");
    mark.style.left = `${Math.round(value * 100)}%`;
    track.append(mark);
    m.append(ends, track);
    return m;
  }

  function showDebrief() {
    const e = S.endings[state.ending];
    const prof = computeProfile();
    screen("doc", "full");
    renderer.set("quiet");
    docInner.replaceChildren();

    // header
    const head = el("header", "doc-head");
    head.append(
      el("p", "dispatch", "After-action report · Cpl. Wren, 3rd Rifle Company"),
      el("h1", null, e.title),
      el("span", `status ${e.survived ? "live" : "die"}`, e.survived ? "Survived" : "Killed in action"),
      el("p", "epi", e.epitaph)
    );
    docInner.append(head);

    // path
    const pathSec = el("section");
    pathSec.append(el("p", "label", "Your path through the night"));
    const path = el("ol", "path");
    state.history.forEach(({ node, choice }) => {
      const li = el("li");
      li.append(el("span", "p-step", `Decision ${ROMAN[node.chapter]}`), el("span", "p-title", node.title), el("span", "p-choice", choice.label));
      path.append(li);
    });
    const endLi = el("li", "p-end");
    endLi.append(el("span", "p-step", "Outcome"), el("span", "p-title", e.survived ? "Survived" : "Died"), el("span", "p-choice", e.title));
    path.append(endLi);
    pathSec.append(path);
    docInner.append(pathSec);

    // moral luck
    const last = state.history[state.history.length - 1].choice;
    const luck = el("section", "luck");
    luck.append(el("h2", null, "Why you lived or died"));
    luck.append(
      el(
        "p",
        null,
        e.survived
          ? `You survived. That is not the game’s verdict on your character. Your last decision, “${last.label},” is what kept you alive, and it would have kept you alive whether it was right or wrong.`
          : `You died. That is not the game’s verdict on your character. Your last decision, “${last.label},” is what killed you, and it would have killed you whether it was right or wrong.`
      ),
      el(
        "p",
        null,
        "In this game, some of the most defensible choices get you killed and some of the worst get you home, because that is how war works. Philosophers Bernard Williams and Thomas Nagel called this moral luck: what happens after a choice is often out of our control, yet we still judge people by it. Try another path, and ask yourself whether your opinion of a choice changes when its outcome does."
      )
    );
    docInner.append(luck);

    // profile
    const profSec = el("section", "profile");
    const pLeft = el("div");
    const P = S.profiles[prof.key];
    pLeft.append(el("p", "label", "Your ethical profile"), el("p", "profile-name", P.name), el("p", null, P.text));
    const pRight = el("div", "meters");
    const obeyWrap = el("div");
    obeyWrap.append(el("p", "label", "When given an order"), meter("Followed conscience", "Followed orders", prof.o));
    const endsWrap = el("div");
    endsWrap.append(el("p", "label", "When harm could buy a better outcome"), meter("Refused the means", "Accepted the means", prof.e));
    const fwWrap = el("div", "fws");
    fwWrap.append(el("p", "label", "Frameworks that agreed with you"));
    for (const k of ["util", "kant", "virtue"]) {
      const [a, n] = prof.fw[k];
      const row = el("div", "fw");
      const bar = el("div", "bar");
      const fill = el("i");
      fill.style.width = n ? `${(a / n) * 100}%` : "0%";
      bar.append(fill);
      row.append(el("span", null, LENS_NAMES[k]), bar, el("span", "n", n ? `${a} of ${n}` : "—"));
      fwWrap.append(row);
    }
    pRight.append(obeyWrap, endsWrap, fwWrap);
    profSec.append(pLeft, pRight);
    docInner.append(profSec);

    // each decision
    const decSec = el("section");
    decSec.append(el("h2", null, "Your decisions, through three lenses"));
    const decWrap = el("div");
    decWrap.style.display = "grid";
    decWrap.style.gap = "40px";
    state.history.forEach(({ node, choice }) => {
      const d = node.debrief;
      const card = el("article", "decision");
      const dh = el("div", "decision-head");
      dh.append(el("p", "dispatch", `Decision ${ROMAN[node.chapter]} · ${node.dispatch.split(" · ")[0]}`), el("h3", null, node.title), el("p", "concept", d.concept));
      card.append(dh);

      const row = el("div", "picked-row");
      [choice, ...node.choices.filter((c) => c !== choice)].forEach((c) => {
          const o = el("div", `opt${c === choice ? " mine" : ""}`);
          o.append(el("p", "label", c === choice ? "You chose" : "The other option"), el("div", "o-label", c.label), el("div", "o-sub", c.sub));
          row.append(o);
        });
      card.append(row);
      card.append(el("p", "context", d.context));

      const lenses = el("div", "lenses");
      for (const k of ["util", "kant", "virtue"]) {
        const L = d.lenses[k];
        const box = el("div", "lens");
        const picks = node.choices.find((c) => c.key === L.verdict);
        let chip;
        if (L.verdict === "split") chip = el("span", "chip", "Divided");
        else if (L.verdict === choice.key) chip = el("span", "chip agree", "Agrees with you");
        else chip = el("span", "chip disagree", "Disagrees with you");
        box.append(
          el("span", "lens-name", LENS_NAMES[k]),
          el("span", "lens-verdict", picks ? `Leans toward: ${picks.label}` : "Thinkers in this tradition disagree"),
          chip,
          el("p", null, L.text)
        );
        lenses.append(box);
      }
      card.append(lenses);

      const qWrap = el("div");
      qWrap.append(el("p", "label", "Questions to think with"));
      const ql = el("ul", "questions");
      d.questions.forEach((q) => ql.append(el("li", null, q)));
      qWrap.append(ql);
      card.append(qWrap);
      decWrap.append(card);
    });
    decSec.append(decWrap);
    docInner.append(decSec);

    // endings found
    const got = found.get();
    const endSec = el("section");
    endSec.append(el("h2", null, `Endings found: ${ENDING_ORDER.filter((id) => got.includes(id)).length} of ${ENDING_ORDER.length}`));
    const endList = el("ul", "endings");
    ENDING_ORDER.forEach((id) => {
      const en = S.endings[id];
      const has = got.includes(id);
      const li = el("li", has ? `found ${en.survived ? "live" : "die"}` : "");
      li.append(el("span", "e-name", has ? en.title : "Undiscovered"), el("span", "e-state", has ? (en.survived ? "Survived" : "Died") : "???"));
      endList.append(li);
    });
    endSec.append(endList);
    docInner.append(endSec);

    const actions = el("div", "doc-actions");
    const again = el("button", "btn primary", "Play again");
    again.type = "button";
    again.addEventListener("click", () => {
      A.click();
      restart();
    });
    const notes = el("button", "btn", "Designer’s Notes");
    notes.type = "button";
    notes.addEventListener("click", () => {
      A.click();
      showNotes("debrief");
    });
    actions.append(again, notes);
    docInner.append(actions);
    doc.scrollTop = 0;
  }

  /* ───────── designer's notes ───────── */
  function showNotes(from) {
    returnTo = from;
    screen("doc", "full");
    renderer.set("quiet");
    docInner.replaceChildren();
    const head = el("header", "doc-head");
    head.append(el("p", "dispatch", "Philosophy project · Designer’s notes"), el("h1", null, "Designer’s Notes"));
    const art = el("article", "notes");
    art.innerHTML = S.notes;
    const actions = el("div", "doc-actions");
    const back = el("button", "btn primary", from === "debrief" ? "Back to the report" : "Back to the title");
    back.type = "button";
    back.addEventListener("click", () => {
      A.click();
      if (returnTo === "debrief" && state.ending) showDebrief();
      else showTitle();
    });
    actions.append(back);
    if (from !== "debrief") {
      const play = el("button", "btn", "Begin");
      play.type = "button";
      play.addEventListener("click", begin);
      actions.append(play);
    }
    docInner.append(head, art, actions);
    doc.scrollTop = 0;
  }

  /* ───────── start / restart ───────── */
  function begin() {
    A.init();
    A.setMuted(muted);
    A.setMood((window.SCENES.intro || {}).audio || {});
    A.click();
    state.history = [];
    state.ending = null;
    inner.replaceChildren();
    showIntro(0);
  }
  function restart() {
    state.history = [];
    state.ending = null;
    inner.replaceChildren();
    showNode(S.start);
  }

  /* ───────── input ───────── */
  panel.addEventListener("click", (e) => {
    if (typing && !e.target.closest("button")) typing.finish();
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.closest && e.target.closest("button") && (e.key === "Enter" || e.key === " ")) return;
    if (typing && (e.key === " " || e.key === "Enter")) {
      e.preventDefault();
      typing.finish();
      return;
    }
    if (keyChoices && (e.key === "1" || e.key === "2")) {
      const b = keyChoices[Number(e.key) - 1];
      if (b && !b.disabled) b.click();
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
    A.init();
    A.setMuted(muted);
    A.setMood(renderer.def.audio || {});
    paintSound();
  });

  $("#begin").addEventListener("click", begin);
  $("#notesBtn").addEventListener("click", () => {
    A.click();
    showNotes("title");
  });

  showTitle();
})();
