/*
  LAST ORDERS — scene renderer
  Every scene is painted in code on a <canvas>: layered skies,
  burning skylines, silhouettes, smoke, rain, embers, and light.

  Scenes are drawn in a virtual 1000 x 600 "stage". The renderer
  scales and positions that stage so the focal point sits beside
  the story panel on wide screens and above it on phones.
*/
(function () {
  const TAU = Math.PI * 2;
  const INK = "#06070a";
  const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (t) => t * t * (3 - 2 * t);

  /* ─────────────── drawing helpers (virtual coordinates) ─────────────── */

  // A human silhouette. y = feet. h = height.
  function person(ctx, x, y, h, o = {}) {
    const pose = o.pose || "stand";
    const dir = o.facing || 1;
    const ph = o.phase || 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir, 1);
    ctx.fillStyle = o.color || INK;
    ctx.strokeStyle = o.color || INK;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const r = h * 0.075;
    const limb = h * 0.075;

    if (pose === "kneel") {
      // torso upright, one knee down
      const hipY = -h * 0.3;
      ctx.lineWidth = limb * 1.1;
      line(ctx, 0, hipY, h * 0.16, hipY); // thigh
      line(ctx, h * 0.16, hipY, h * 0.16, 0); // shin
      line(ctx, 0, hipY, -h * 0.12, -h * 0.02); // back thigh
      line(ctx, -h * 0.12, -h * 0.02, -h * 0.3, 0); // back shin on ground
      torso(ctx, 0, hipY, h * 0.36, h * 0.2, h * 0.16, o.lean || 0.08);
      const sx = (o.lean || 0.08) * h * 0.36;
      head(ctx, sx + h * 0.02, hipY - h * 0.36 - r * 1.25, r, o.helmet);
      ctx.lineWidth = limb * 0.8;
      if (o.arms === "forward") {
        line(ctx, sx, hipY - h * 0.32, sx + h * 0.2, hipY - h * 0.12);
      } else if (o.arms === "behind") {
        line(ctx, sx, hipY - h * 0.32, sx - h * 0.1, hipY - h * 0.08);
      } else {
        line(ctx, sx, hipY - h * 0.32, sx + h * 0.08, hipY - h * 0.05);
      }
      if (o.rifle) rifle(ctx, sx + h * 0.05, hipY - h * 0.2, h, -0.15);
    } else if (o.pose === "sit") {
      const hipY = -h * 0.28;
      ctx.lineWidth = limb * 1.1;
      line(ctx, 0, hipY, h * 0.2, hipY);
      line(ctx, h * 0.2, hipY, h * 0.22, 0);
      torso(ctx, 0, hipY, h * 0.34, h * 0.2, h * 0.16, o.lean || 0.15);
      const sx = (o.lean || 0.15) * h * 0.34;
      head(ctx, sx + h * 0.04, hipY - h * 0.34 - r * 1.1 + (o.slump || 0) * h * 0.06, r, o.helmet);
      ctx.lineWidth = limb * 0.8;
      line(ctx, sx, hipY - h * 0.3, h * 0.16, hipY - h * 0.02);
    } else if (pose === "huddle") {
      // knees drawn up, arms round them
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.22, h * 0.16, h * 0.24, -0.25, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(h * 0.12, -h * 0.14, h * 0.1, h * 0.15, 0.3, 0, TAU);
      ctx.fill();
      head(ctx, h * 0.06, -h * 0.47, r * 1.05, false);
    } else if (pose === "lie") {
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.07, h * 0.45, h * 0.075, 0, 0, TAU);
      ctx.fill();
      head(ctx, h * 0.5, -h * 0.1, r, false);
    } else {
      // stand / walk
      const walk = pose === "walk";
      const hipY = -h * 0.47;
      const swing = walk ? Math.sin(ph) * 0.38 : 0.06;
      ctx.lineWidth = limb * 1.15;
      const legL = h * 0.47;
      line(ctx, 0, hipY, Math.sin(swing) * legL, hipY + Math.cos(swing) * legL);
      line(ctx, 0, hipY, Math.sin(-swing) * legL, hipY + Math.cos(-swing) * legL);
      torso(ctx, 0, hipY, h * 0.36, h * (o.bulky ? 0.26 : 0.22), h * 0.17, o.lean || 0);
      const sx = (o.lean || 0) * h * 0.36;
      const sy = hipY - h * 0.33;
      if (o.cap) officerCap(ctx, sx, sy - r * 1.4, r);
      head(ctx, sx, sy - r * 1.4, r, o.helmet);
      ctx.lineWidth = limb * 0.85;
      const armL = h * 0.34;
      if (o.arms === "up") {
        line(ctx, sx, sy + h * 0.02, sx + h * 0.08, sy - h * 0.28);
        line(ctx, sx, sy + h * 0.02, sx - h * 0.08, sy - h * 0.28);
      } else if (o.arms === "out") {
        line(ctx, sx, sy + h * 0.03, sx + h * 0.3, sy + h * 0.02);
        line(ctx, sx, sy + h * 0.03, sx - h * 0.02, sy + armL);
      } else if (o.arms === "carry") {
        line(ctx, sx, sy + h * 0.03, sx + h * 0.16, sy + h * 0.14);
        line(ctx, sx + h * 0.16, sy + h * 0.14, sx + h * 0.22, sy + h * 0.02);
      } else {
        const a = walk ? Math.sin(ph + Math.PI) * 0.3 : 0.08;
        line(ctx, sx, sy + h * 0.03, sx + Math.sin(a) * armL, sy + h * 0.03 + Math.cos(a) * armL);
        line(ctx, sx, sy + h * 0.03, sx + Math.sin(-a) * armL, sy + h * 0.03 + Math.cos(-a) * armL);
      }
      if (o.rifle === "shoulder") rifle(ctx, sx + h * 0.02, sy + h * 0.08, h, -0.02, true);
      else if (o.rifle === "sling") rifle(ctx, sx - h * 0.02, sy + h * 0.02, h, -1.2);
      else if (o.rifle) rifle(ctx, sx + h * 0.03, sy + h * 0.22, h, -0.55);
      if (o.pack) {
        ctx.beginPath();
        roundRect(ctx, sx - h * 0.2, sy + h * 0.02, h * 0.12, h * 0.2, h * 0.03);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  function line(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  function torso(ctx, x, hipY, len, sw, hw, lean) {
    const sx = x + lean * len;
    ctx.beginPath();
    ctx.moveTo(x - hw / 2, hipY);
    ctx.lineTo(sx - sw / 2, hipY - len + sw * 0.15);
    ctx.quadraticCurveTo(sx, hipY - len - sw * 0.12, sx + sw / 2, hipY - len + sw * 0.15);
    ctx.lineTo(x + hw / 2, hipY);
    ctx.closePath();
    ctx.fill();
  }
  function head(ctx, x, y, r, helmet) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    if (helmet) {
      ctx.beginPath();
      ctx.ellipse(x, y - r * 0.15, r * 1.45, r * 1.15, 0, Math.PI, TAU);
      ctx.fill();
      ctx.fillRect(x - r * 1.6, y - r * 0.2, r * 3.2, r * 0.3);
    }
  }
  function officerCap(ctx, x, y, r) {
    ctx.beginPath();
    ctx.ellipse(x, y - r * 0.9, r * 1.35, r * 0.55, -0.08, 0, TAU);
    ctx.fill();
    ctx.fillRect(x - r * 0.2, y - r * 1.1, r * 1.9, r * 0.35);
  }
  function rifle(ctx, x, y, h, ang, aimed) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    const L = h * (aimed ? 0.62 : 0.55);
    ctx.fillRect(-L * 0.25, -h * 0.018, L, h * 0.036);
    ctx.fillRect(-L * 0.3, -h * 0.01, L * 0.18, h * 0.06);
    ctx.restore();
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Procedural city skyline, ruined or whole, with optional lit windows
  function makeSkyline(seed, x0, x1, base, minH, maxH, ruin) {
    const R = rng(seed);
    const b = [];
    let x = x0;
    while (x < x1) {
      const w = 22 + R() * 70;
      const hgt = minH + Math.pow(R(), 1.6) * (maxH - minH);
      const bld = { x, w, h: hgt, broken: R() < ruin, cut: R(), spire: R() < 0.06, windows: [] };
      const cols = Math.floor(w / 9);
      const rows = Math.floor(hgt / 12);
      for (let c = 0; c < cols; c++)
        for (let r = 1; r < rows; r++)
          if (R() < 0.07) bld.windows.push({ x: x + 4 + c * 9, y: base - r * 12, f: R() * 10 });
      b.push(bld);
      x += w + (R() < 0.3 ? R() * 14 : 0);
    }
    return { b, base };
  }
  function drawSkyline(ctx, sk, color, t, winColor) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (const d of sk.b) {
      const top = sk.base - d.h;
      ctx.moveTo(d.x, sk.base + 2);
      if (d.broken) {
        const mid = d.x + d.w * d.cut;
        ctx.lineTo(d.x, top + d.h * 0.25);
        ctx.lineTo(d.x + d.w * 0.2, top + d.h * 0.12);
        ctx.lineTo(mid, top + d.h * 0.45);
        ctx.lineTo(d.x + d.w * 0.8, top);
        ctx.lineTo(d.x + d.w, top + d.h * 0.2);
      } else {
        ctx.lineTo(d.x, top);
        if (d.spire) {
          ctx.lineTo(d.x + d.w / 2 - 2, top);
          ctx.lineTo(d.x + d.w / 2, top - d.h * 0.35);
          ctx.lineTo(d.x + d.w / 2 + 2, top);
        }
        ctx.lineTo(d.x + d.w, top);
      }
      ctx.lineTo(d.x + d.w, sk.base + 2);
      ctx.closePath();
    }
    ctx.fill();
    if (winColor) {
      for (const d of sk.b)
        for (const w of d.windows) {
          const fl = 0.55 + 0.45 * Math.sin(t * 2 + w.f * 7) * Math.sin(t * 0.7 + w.f);
          ctx.globalAlpha = clamp(fl, 0.15, 1);
          ctx.fillStyle = winColor;
          ctx.fillRect(w.x, w.y, 3.5, 5);
        }
      ctx.globalAlpha = 1;
    }
  }

  // Bare winter trees (recursive)
  function makeTree(seed, x, y, len) {
    const R = rng(seed);
    const segs = [];
    (function br(x, y, a, l, w, d) {
      const x2 = x + Math.cos(a) * l,
        y2 = y + Math.sin(a) * l;
      segs.push([x, y, x2, y2, w]);
      if (d > 7 || l < 4) return;
      const n = R() < 0.3 ? 3 : 2;
      for (let i = 0; i < n; i++) br(x2, y2, a + (R() - 0.5) * 1.1, l * (0.66 + R() * 0.12), w * 0.68, d + 1);
    })(x, y, -Math.PI / 2 + (R() - 0.5) * 0.2, len, len * 0.14, 0);
    return segs;
  }
  function drawTree(ctx, segs, color, sway) {
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    for (const [x1, y1, x2, y2, w] of segs) {
      const s = sway * (1 - Math.min(w, 8) / 8);
      ctx.lineWidth = Math.max(w, 0.6);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2 + s, y2);
      ctx.stroke();
    }
  }

  function glow(ctx, x, y, r, color, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace("A", a));
    g.addColorStop(1, color.replace("A", 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function fire(ctx, x, y, s, t, seed) {
    // flickering tongues of flame
    const R = rng(seed);
    for (let i = 0; i < 7; i++) {
      const ox = (R() - 0.5) * s * 1.2;
      const hh = s * (0.6 + R() * 0.9) * (0.8 + 0.25 * Math.sin(t * (6 + R() * 5) + i));
      const ww = s * (0.25 + R() * 0.2);
      const g = ctx.createLinearGradient(0, y, 0, y - hh);
      g.addColorStop(0, "rgba(255,190,90,0.95)");
      g.addColorStop(0.5, "rgba(240,110,40,0.75)");
      g.addColorStop(1, "rgba(160,40,20,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x + ox - ww, y);
      ctx.quadraticCurveTo(x + ox - ww * 0.4, y - hh * 0.6, x + ox + Math.sin(t * 3 + i) * ww * 0.4, y - hh);
      ctx.quadraticCurveTo(x + ox + ww * 0.4, y - hh * 0.6, x + ox + ww, y);
      ctx.fill();
    }
  }

  function wire(ctx, x1, x2, y, sag, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.quadraticCurveTo((x1 + x2) / 2, y + sag, x2, y);
    ctx.stroke();
    // barbs
    for (let x = x1 + 8; x < x2; x += 14) {
      const tt = (x - x1) / (x2 - x1);
      const yy = y + sag * 2 * tt * (1 - tt);
      ctx.beginPath();
      ctx.moveTo(x - 3, yy - 3);
      ctx.lineTo(x + 3, yy + 3);
      ctx.moveTo(x + 3, yy - 3);
      ctx.lineTo(x - 3, yy + 3);
      ctx.stroke();
    }
  }

  function lightCone(ctx, x, y, ang, len, spread, color, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, len);
    g.addColorStop(0, color.replace("A", a));
    g.addColorStop(1, color.replace("A", 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang - spread) * len, y + Math.sin(ang - spread) * len);
    ctx.lineTo(x + Math.cos(ang + spread) * len, y + Math.sin(ang + spread) * len);
    ctx.closePath();
    ctx.fill();
  }

  /* ─────────────── scenes ─────────────── */
  // sky: [top, middle, horizon]; glow: horizon fire color; weather; smoke emitters (virtual coords)
  const SCENES = {
    title: {
      sky: ["#07080d", "#1c1418", "#6b2a17"],
      horizon: 0.72,
      glow: { x: 520, y: 470, r: 700, c: "rgba(255,110,40,A)", a: 0.55 },
      weather: "embers",
      flashes: 0.25,
      searchlights: 2,
      smoke: [{ x: 380, y: 400, rate: 1.4, s: 60 }, { x: 700, y: 420, rate: 1, s: 50 }],
      audio: { wind: 0.25, rumble: 0.45, drone: 0.06 },
      draw(ctx, t, S) {
        const far = S.cached("t-far", () => makeSkyline(11, -1200, 2300, 470, 30, 150, 0.5));
        const near = S.cached("t-near", () => makeSkyline(29, -1200, 2300, 480, 20, 90, 0.7));
        drawSkyline(ctx, far, "#2a1611", t, "rgba(255,160,70,1)");
        fire(ctx, 350, 470, 40, t, 3);
        fire(ctx, 720, 480, 30, t, 5);
        drawSkyline(ctx, near, "#140c0b", t);
        // rubble ground
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.moveTo(-2000, 600);
        ctx.lineTo(-2000, 520);
        const R = rng(7);
        for (let x = -2000; x < 3000; x += 18) ctx.lineTo(x, 520 - R() * 10 - (x > 600 && x < 820 ? 40 * Math.sin(((x - 600) / 220) * Math.PI) : 0));
        ctx.lineTo(3000, 600);
        ctx.fill();
        person(ctx, 700, 482, 92, { helmet: true, rifle: "sling", pack: true, facing: -1 });
      }
    },

    bridge: {
      sky: ["#0b0b12", "#2b1719", "#8a3a1c"],
      horizon: 0.62,
      glow: { x: 170, y: 360, r: 650, c: "rgba(255,110,40,A)", a: 0.6 },
      weather: "ash",
      flashes: 0.35,
      smoke: [{ x: 150, y: 330, rate: 1.6, s: 70 }, { x: 250, y: 335, rate: 0.8, s: 50 }],
      audio: { wind: 0.3, rumble: 0.5, drone: 0.07, sea: 0.12 },
      draw(ctx, t, S) {
        const city = S.cached("b-city", () => makeSkyline(5, -1400, 280, 350, 20, 120, 0.6));
        drawSkyline(ctx, city, "#2c1712", t, "rgba(255,150,60,1)");
        fire(ctx, 150, 350, 34, t, 9);
        fire(ctx, 250, 352, 22, t, 13);
        // far bank ridge with the enemy column coming down it
        ctx.fillStyle = "#1a0f0e";
        ctx.beginPath();
        ctx.moveTo(-1500, 400);
        ctx.lineTo(-1500, 360);
        ctx.quadraticCurveTo(-200, 350, 250, 372);
        ctx.lineTo(262, 400);
        ctx.fill();
        const blown = S.opts.variant === "blown";
        const adv = blown ? 0.55 : Math.min(1, S.st / 70);
        for (let i = 0; i < 4; i++) {
          const tx = 20 + i * 52 + adv * 50;
          ctx.globalAlpha = 0.22;
          glow(ctx, tx - 26, 356, 34, "rgba(170,120,90,A)", 0.9);
          ctx.globalAlpha = 1;
          tank(ctx, tx, 366 + i * 0.8, 0.36, "#110a0a");
        }
        // river
        const rg = ctx.createLinearGradient(0, 390, 0, 600);
        rg.addColorStop(0, "#3a1d14");
        rg.addColorStop(1, "#0a090d");
        ctx.fillStyle = rg;
        ctx.fillRect(-2000, 392, 5000, 230);
        for (let i = 0; i < 40; i++) {
          const y = 400 + i * 3;
          const w = 90 - i * 1.8 + Math.sin(t * 1.5 + i) * 10;
          ctx.fillStyle = `rgba(255,120,50,${0.22 - i * 0.005})`;
          ctx.fillRect(190 - w / 2 + Math.sin(t * 2 + i * 0.7) * 6, y, w, 1.4);
        }
        // bridge: piers at 250, 430, 610, 790
        const deckY = 372;
        ctx.fillStyle = INK;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        const span = (a, b) => {
          ctx.fillRect(a, deckY, b - a, 9);
          for (let x = a; x < b; x += 30) {
            line(ctx, x, deckY, x + 15, deckY - 30);
            line(ctx, x + 15, deckY - 30, x + 30, deckY);
          }
          ctx.fillRect(a, deckY - 32, b - a, 4);
        };
        span(250, 430);
        if (!blown) span(430, 610);
        span(610, 790);
        [250, 430, 610, 790].forEach((x) => ctx.fillRect(x - 6, deckY, 12, 240));
        if (blown) {
          ctx.save();
          ctx.translate(430, deckY);
          ctx.rotate(0.55);
          ctx.fillRect(0, 0, 80, 8);
          ctx.restore();
          ctx.save();
          ctx.translate(610, deckY);
          ctx.rotate(Math.PI - 0.65);
          ctx.fillRect(0, -8, 70, 8);
          ctx.restore();
          fire(ctx, 460, 425, 16, t, 21);
          fire(ctx, 585, 420, 12, t, 22);
        } else {
          // refugees crossing toward you
          const R = rng(99);
          for (let i = 0; i < 16; i++) {
            const speed = 8 + R() * 5;
            const x = 250 + ((R() * 540 + S.st * speed) % 540);
            const hh = 20 + R() * 5;
            const kind = R();
            person(ctx, x, deckY, kind < 0.2 ? hh * 0.6 : hh, { pose: "walk", phase: S.st * 5 + i, bulky: kind > 0.7, arms: kind > 0.85 ? "carry" : null });
          }
          bus(ctx, 400 + Math.min(S.st * 2.5, 110), deckY);
        }
        // near bank + you with the detonator
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.moveTo(700, 620);
        ctx.lineTo(760, 470);
        ctx.quadraticCurveTo(880, 440, 2600, 450);
        ctx.lineTo(2600, 620);
        ctx.fill();
        person(ctx, 850, 462, 96, { pose: "kneel", helmet: true, arms: "forward", facing: -1 });
        ctx.fillRect(812, 446, 22, 16);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(818, 460);
        ctx.quadraticCurveTo(760, 500, 700, 380);
        ctx.stroke();
        // Harrow with the radio, behind you
        person(ctx, 930, 452, 104, { helmet: true, rifle: "sling", facing: -1 });
      }
    },

    farmhouse: {
      sky: ["#05070b", "#0d141b", "#1c2a30"],
      horizon: 0.7,
      glow: null,
      weather: "rain",
      flashes: 0.18,
      flashColor: "rgba(190,210,255,A)",
      audio: { wind: 0.35, rumble: 0.25, rain: 0.5, drone: 0.06 },
      draw(ctx, t, S) {
        // hills
        ctx.fillStyle = "#0f171c";
        ctx.beginPath();
        ctx.moveTo(-2000, 460);
        ctx.quadraticCurveTo(0, 380, 500, 430);
        ctx.quadraticCurveTo(1100, 470, 3000, 400);
        ctx.lineTo(3000, 600);
        ctx.lineTo(-2000, 600);
        ctx.fill();
        const trees = S.cached("f-trees", () => [makeTree(3, 120, 500, 70), makeTree(8, 860, 505, 80), makeTree(12, -150, 490, 60), makeTree(21, 1120, 500, 64)]);
        const sway = Math.sin(t * 1.3) * 2.5;
        trees.forEach((tr) => drawTree(ctx, tr, "#080b0e", sway));
        // farmhouse
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.moveTo(330, 505);
        ctx.lineTo(330, 395);
        ctx.lineTo(500, 300);
        ctx.lineTo(670, 395);
        ctx.lineTo(670, 505);
        ctx.fill();
        ctx.fillRect(590, 310, 22, 60); // chimney
        ctx.fillRect(670, 430, 110, 75); // barn wing
        ctx.beginPath();
        ctx.moveTo(660, 432);
        ctx.lineTo(725, 395);
        ctx.lineTo(790, 432);
        ctx.fill();
        // window with lantern
        const fl = 0.8 + 0.2 * Math.sin(t * 9) * Math.sin(t * 3.1);
        glow(ctx, 450, 420, 140 * fl, "rgba(255,170,80,A)", 0.3);
        ctx.fillStyle = `rgba(255,${170 + fl * 20},90,${0.9 * fl})`;
        ctx.fillRect(420, 395, 60, 52);
        // figure bound to chair, seen through window
        ctx.fillStyle = INK;
        person(ctx, 446, 447, 50, { pose: "sit", slump: 1, lean: 0.25 });
        ctx.fillRect(440, 420, 3, 27);
        // mullions
        ctx.fillRect(448, 395, 3, 52);
        ctx.fillRect(420, 419, 60, 3);
        // second window, dark with standing figure
        ctx.fillStyle = "rgba(255,160,80,0.18)";
        ctx.fillRect(540, 400, 44, 46);
        person(ctx, 562, 446, 46, { helmet: true });
        // sentry outside
        person(ctx, 250, 505, 70, { helmet: true, rifle: "sling", facing: 1 });
        // foreground ground
        ctx.fillStyle = INK;
        ctx.fillRect(-2000, 503, 5000, 120);
        // fence
        ctx.fillStyle = INK;
        for (let x = -300; x < 1400; x += 46) ctx.fillRect(x, 470, 5, 40);
        ctx.fillRect(-300, 480, 1700, 3);
        ctx.fillRect(-300, 494, 1700, 3);
      }
    },

    cellar: {
      sky: ["#0a0907", "#0d0b09", "#110e0b"],
      horizon: 1,
      glow: null,
      weather: "dust",
      flashes: 0,
      audio: { wind: 0.08, rumble: 0.35, drone: 0.09 },
      draw(ctx, t, S) {
        // brick wall
        ctx.fillStyle = "#16110d";
        ctx.fillRect(-2000, 0, 5000, 600);
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 2;
        for (let r = 0; r < 26; r++) {
          const y = 90 + r * 20;
          line(ctx, -1500, y, 2500, y);
          for (let x = -1500 + (r % 2) * 20; x < 2500; x += 40) line(ctx, x, y, x, y + 20);
        }
        // ceiling beams and floorboards
        ctx.fillStyle = "#050404";
        ctx.fillRect(-2000, 0, 5000, 92);
        const gaps = [140, 290, 470, 640, 820];
        // boots passing over the gaps: a dark shape sweeping left->right
        const bootX = ((S.st * 70) % 1500) - 250;
        gaps.forEach((gx, i) => {
          const occl = Math.abs(bootX - gx) < 40 || Math.abs(bootX - 60 - gx) < 30;
          const a = occl ? 0.02 : 0.16 + 0.05 * Math.sin(t * 2 + i);
          // flashlight beams through the cracks
          const g = ctx.createLinearGradient(0, 90, 0, 560);
          g.addColorStop(0, `rgba(200,215,235,${a * 2})`);
          g.addColorStop(1, "rgba(200,215,235,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(gx - 3, 90);
          ctx.lineTo(gx + 3, 90);
          ctx.lineTo(gx + 60, 560);
          ctx.lineTo(gx - 10, 560);
          ctx.fill();
          ctx.fillStyle = occl ? "#000" : `rgba(220,230,245,${0.5 + a})`;
          ctx.fillRect(gx - 3, 86, 6, 5);
        });
        for (let x = -1500; x < 2500; x += 120) {
          ctx.fillStyle = "#030303";
          ctx.fillRect(x, 70, 24, 30);
        }
        // huddled survivors along the wall
        const R = rng(4);
        const spots = [110, 175, 235, 300, 360, 590, 650, 710, 770, 830, 880];
        spots.forEach((x) => {
          const h = 70 + R() * 20;
          person(ctx, x, 540, h, { pose: R() < 0.6 ? "huddle" : "sit", facing: R() < 0.5 ? 1 : -1, lean: 0.1 });
        });
        // Tomas lying; you kneeling beside him
        const breathe = Math.sin(t * 2.4) * 1.5;
        ctx.save();
        ctx.translate(0, breathe * 0.3);
        person(ctx, 470, 548, 80, { pose: "lie" });
        ctx.restore();
        person(ctx, 440, 548, 86, { pose: "kneel", helmet: true, arms: "forward" });
        ctx.fillStyle = "#050404";
        ctx.fillRect(-2000, 540, 5000, 80);
        // stairs silhouette at right
        ctx.fillStyle = "#070605";
        for (let i = 0; i < 9; i++) ctx.fillRect(930 + i * 26, 540 - i * 50, 400, 50);
      }
    },

    checkpoint: {
      sky: ["#04060a", "#0b1118", "#17212a"],
      horizon: 0.64,
      glow: { x: 500, y: 380, r: 400, c: "rgba(120,150,190,A)", a: 0.12 },
      weather: "drizzle",
      flashes: 0.2,
      searchlights: 1,
      audio: { wind: 0.3, rumble: 0.3, rain: 0.2, drone: 0.08 },
      draw(ctx, t, S) {
        // horizon hills
        ctx.fillStyle = "#0b1016";
        ctx.beginPath();
        ctx.moveTo(-2000, 390);
        ctx.quadraticCurveTo(200, 350, 500, 382);
        ctx.quadraticCurveTo(900, 410, 3000, 360);
        ctx.lineTo(3000, 600);
        ctx.lineTo(-2000, 600);
        ctx.fill();
        // road in perspective
        ctx.fillStyle = "#07090c";
        ctx.beginPath();
        ctx.moveTo(492, 384);
        ctx.lineTo(508, 384);
        ctx.lineTo(900, 600);
        ctx.lineTo(100, 600);
        ctx.fill();
        // lane marks
        ctx.fillStyle = "rgba(200,200,190,0.25)";
        for (let i = 0; i < 8; i++) {
          const z = (i + ((S.st * 0.0) % 1)) / 8;
          const y = 384 + Math.pow(z, 2) * 216;
          const w = 1 + z * 5;
          ctx.fillRect(500 - w / 2, y, w, 2 + z * 14);
        }
        // approaching car
        const stopped = S.opts.variant === "stopped";
        let p = stopped ? 0.78 : 0.12 + ease(clamp(S.st / 40, 0, 1)) * 0.6;
        const cy = 386 + Math.pow(p, 1.6) * 150;
        const cs = 0.08 + p * 0.9;
        const on = stopped ? (Math.sin(t * 13) > 0.6 ? 0.25 : 0.05) : 1;
        // headlight glow & beams
        ctx.globalCompositeOperation = "lighter";
        glow(ctx, 500 - 26 * cs, cy - 10 * cs, 120 * cs + 20, "rgba(255,245,210,A)", 0.55 * on);
        glow(ctx, 500 + 26 * cs, cy - 10 * cs, 120 * cs + 20, "rgba(255,245,210,A)", 0.55 * on);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = INK;
        ctx.beginPath();
        roundRect(ctx, 500 - 42 * cs, cy - 38 * cs, 84 * cs, 32 * cs, 5 * cs);
        ctx.fill();
        ctx.beginPath();
        roundRect(ctx, 500 - 30 * cs, cy - 58 * cs, 60 * cs, 24 * cs, 6 * cs);
        ctx.fill();
        ctx.fillStyle = `rgba(255,250,225,${0.95 * on})`;
        ctx.beginPath();
        ctx.arc(500 - 28 * cs, cy - 22 * cs, 5 * cs + 1, 0, TAU);
        ctx.arc(500 + 28 * cs, cy - 22 * cs, 5 * cs + 1, 0, TAU);
        ctx.fill();
        if (stopped) {
          ctx.globalAlpha = 0.35;
          glow(ctx, 500, cy - 60 * cs, 70, "rgba(200,200,200,A)", 0.5); // radiator steam
          ctx.globalAlpha = 1;
        }
        // barrier & sandbags
        ctx.fillStyle = INK;
        ctx.fillRect(290, 470, 14, 70);
        ctx.save();
        ctx.translate(297, 480);
        ctx.fillRect(0, -4, 420, 8);
        ctx.fillStyle = "rgba(200,60,40,0.55)";
        for (let x = 20; x < 420; x += 60) ctx.fillRect(x, -4, 26, 8);
        ctx.restore();
        ctx.fillStyle = INK;
        const bags = (x0, n) => {
          for (let r = 0; r < 3; r++)
            for (let i = 0; i < n - r; i++) {
              ctx.beginPath();
              ctx.ellipse(x0 + i * 30 + r * 15, 548 - r * 16, 16, 9, 0, 0, TAU);
              ctx.fill();
            }
        };
        bags(40, 7);
        bags(760, 7);
        // soldiers
        person(ctx, 150, 530, 96, { helmet: true, rifle: "shoulder", facing: 1 });
        person(ctx, 855, 530, 96, { helmet: true, rifle: "shoulder", facing: -1 });
        person(ctx, 930, 532, 100, { cap: true, arms: "out", facing: -1 }); // Voss
        ctx.fillStyle = INK;
        ctx.fillRect(-2000, 548, 5000, 80);
        // you, in the foreground, rifle raised toward the car
        person(ctx, 700, 660, 230, { helmet: true, rifle: "shoulder", facing: -1, pack: true });
      }
    },

    camp: {
      sky: ["#040507", "#0a0d11", "#141a20"],
      horizon: 0.7,
      glow: null,
      weather: "drizzle",
      flashes: 0.15,
      audio: { wind: 0.3, rumble: 0.25, rain: 0.18, drone: 0.1 },
      draw(ctx, t, S) {
        // tents & trucks far
        ctx.fillStyle = "#0b0e12";
        for (let i = -6; i < 16; i++) {
          const x = i * 110 + (i % 3) * 20;
          ctx.beginPath();
          ctx.moveTo(x, 440);
          ctx.lineTo(x + 45, 400);
          ctx.lineTo(x + 90, 440);
          ctx.fill();
        }
        ctx.fillRect(-2000, 438, 5000, 200);
        // floodlights
        [[150, 250], [850, 250]].forEach(([x, y], i) => {
          ctx.fillStyle = INK;
          ctx.fillRect(x - 3, y, 6, 300);
          ctx.fillRect(x - 16, y - 6, 32, 10);
          const flick = 0.9 + 0.1 * Math.sin(t * 20 + i * 3);
          ctx.globalCompositeOperation = "lighter";
          lightCone(ctx, x, y, i ? 2.2 : 0.94, 520, 0.28, "rgba(235,240,255,A)", 0.24 * flick);
          glow(ctx, x, y, 50, "rgba(255,255,240,A)", 0.9);
          ctx.globalCompositeOperation = "source-over";
        });
        // lit mud pool
        const g = ctx.createRadialGradient(500, 540, 10, 500, 540, 380);
        g.addColorStop(0, "rgba(160,170,185,0.25)");
        g.addColorStop(1, "rgba(160,170,185,0)");
        ctx.fillStyle = g;
        ctx.fillRect(100, 450, 800, 150);
        // kneeling prisoners
        for (let i = 0; i < 10; i++) {
          const x = 250 + i * 52;
          person(ctx, x, 540, 72, { pose: "kneel", arms: "behind", facing: -1, helmet: i % 3 === 0, lean: 0.12 - (i === 4 ? 0.06 : 0) });
        }
        // the colonel, offering the pistol to you (5th in line)
        person(ctx, 520, 540, 104, { cap: true, arms: "out", facing: -1 });
        // guards
        person(ctx, 180, 540, 100, { helmet: true, rifle: "shoulder", facing: 1 });
        person(ctx, 830, 540, 100, { helmet: true, rifle: "shoulder", facing: -1 });
        // barbed wire fence foreground
        ctx.fillStyle = INK;
        for (let x = -1500; x < 2500; x += 150) ctx.fillRect(x, 470, 6, 140);
        for (let x = -1500; x < 2500; x += 150) {
          wire(ctx, x, x + 150, 490, 10, "#050608");
          wire(ctx, x, x + 150, 530, 8, "#050608");
          wire(ctx, x, x + 150, 570, 6, "#050608");
        }
        ctx.fillStyle = INK;
        ctx.fillRect(-2000, 588, 5000, 40);
      }
    },

    harbor: {
      sky: ["#1a1830", "#6a3a4a", "#e0915e"],
      horizon: 0.6,
      glow: { x: 700, y: 360, r: 600, c: "rgba(255,170,110,A)", a: 0.45 },
      weather: "ash",
      flashes: 0.3,
      smoke: [{ x: 60, y: 350, rate: 1.8, s: 80 }, { x: -120, y: 360, rate: 1.2, s: 70 }],
      audio: { wind: 0.3, rumble: 0.45, sea: 0.3, drone: 0.06 },
      draw(ctx, t, S) {
        // sea
        const sg = ctx.createLinearGradient(0, 360, 0, 560);
        sg.addColorStop(0, "#8a5a58");
        sg.addColorStop(1, "#1a1624");
        ctx.fillStyle = sg;
        ctx.fillRect(-2000, 360, 5000, 240);
        for (let i = 0; i < 30; i++) {
          const y = 366 + i * 5;
          ctx.fillStyle = `rgba(255,200,150,${0.16 - i * 0.005})`;
          ctx.fillRect(640 + Math.sin(t + i) * 20 - (60 - i), y, 120 - i * 2, 1.2);
        }
        // shelled outer docks, left
        const docks = S.cached("h-docks", () => makeSkyline(17, -1400, 180, 362, 10, 60, 0.6));
        drawSkyline(ctx, docks, "#241922", t);
        fire(ctx, 60, 362, 26, t, 31);
        // cranes
        ctx.strokeStyle = "#120d14";
        ctx.lineWidth = 4;
        [[-40, 1], [220, -1]].forEach(([x, d]) => {
          line(ctx, x, 362, x, 250);
          line(ctx, x - 20 * d, 255, x + 90 * d, 255);
          line(ctx, x + 80 * d, 255, x + 80 * d, 300);
        });
        // ship
        const dep = S.opts.variant === "departing" ? ease(clamp(S.st / 30, 0, 1)) : 0;
        const sx = 470 + dep * 260;
        const ss = 1 - dep * 0.35;
        const bob = Math.sin(t * 0.8) * 1.5;
        ctx.save();
        ctx.translate(sx, 400 + bob);
        ctx.scale(ss, ss);
        ctx.fillStyle = "#0a0910";
        ctx.beginPath();
        ctx.moveTo(-30, 0);
        ctx.lineTo(420, 0);
        ctx.lineTo(450, -40);
        ctx.lineTo(-40, -40);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(40, -80, 250, 42);
        ctx.fillRect(90, -112, 150, 34);
        ctx.fillRect(130, -170, 26, 60);
        ctx.fillRect(190, -165, 26, 55);
        ctx.fillRect(340, -130, 4, 92); // mast
        // portholes
        ctx.fillStyle = "rgba(255,200,120,0.7)";
        for (let x = 0; x < 400; x += 22) ctx.fillRect(x, -24, 4, 4);
        // people on deck
        const R = rng(5);
        for (let x = 30; x < 400; x += 7 + R() * 5) person(ctx, x, -40, 10 + R() * 3, { color: "#0a0910" });
        ctx.restore();
        // smoke from the funnels
        S.emit("funnel", sx + 143 * ss, 400 - 170 * ss, 0.8, 30);
        // dock + crowd
        ctx.fillStyle = INK;
        ctx.fillRect(-2000, 470, 5000, 160);
        ctx.fillRect(-2000, 462, 2450 + (dep ? 0 : 0), 10);
        for (let x = -300; x < 460; x += 60) ctx.fillRect(x, 470, 10, 60);
        const R2 = rng(12);
        for (let i = 0; i < 60; i++) {
          const x = -300 + R2() * 720;
          const h = 44 + R2() * 22;
          person(ctx, x, 474 + R2() * 6, h, { pose: "stand", arms: R2() < 0.1 ? "up" : null, facing: R2() < 0.5 ? 1 : -1, bulky: R2() < 0.4, phase: R2() * 6 });
        }
        // gangplank
        if (!dep) {
          ctx.strokeStyle = INK;
          ctx.lineWidth = 6;
          line(ctx, 430, 470, 520, 364);
          ctx.lineWidth = 1.5;
          line(ctx, 432, 452, 522, 346);
          // you at its foot, mother & child
          person(ctx, 452, 472, 84, { helmet: true, rifle: "sling", facing: -1 });
          person(ctx, 392, 474, 76, { arms: "out", bulky: true, facing: 1 });
          person(ctx, 418, 474, 38, { facing: 1 });
        } else {
          person(ctx, 440, 472, 80, { helmet: false, facing: 1, bulky: true });
          person(ctx, 460, 472, 84, { helmet: true, facing: 1 });
        }
        // gulls
        ctx.strokeStyle = "#1a1420";
        ctx.lineWidth = 1.6;
        for (let i = 0; i < 4; i++) {
          const gx = ((S.st * (12 + i * 3) + i * 240) % 1400) - 200;
          const gy = 170 + i * 26 + Math.sin(t + i) * 8;
          const f = Math.sin(t * 6 + i) * 4;
          ctx.beginPath();
          ctx.moveTo(gx - 8, gy - f);
          ctx.quadraticCurveTo(gx - 3, gy - 4, gx, gy);
          ctx.quadraticCurveTo(gx + 3, gy - 4, gx + 8, gy - f);
          ctx.stroke();
        }
      }
    },

    lighthouse: {
      sky: ["#05060c", "#141427", "#3d2a3a"],
      horizon: 0.6,
      glow: { x: 250, y: 380, r: 450, c: "rgba(255,120,60,A)", a: 0.3 },
      weather: "stars",
      flashes: 0.4,
      flashZone: [60, 380],
      audio: { wind: 0.45, rumble: 0.3, sea: 0.35, drone: 0.08 },
      draw(ctx, t, S) {
        const strike = S.opts.variant === "strike";
        // far hills with village & guns
        ctx.fillStyle = "#120f1c";
        ctx.beginPath();
        ctx.moveTo(-2000, 400);
        ctx.quadraticCurveTo(-200, 300, 200, 340);
        ctx.quadraticCurveTo(420, 360, 560, 400);
        ctx.lineTo(560, 420);
        ctx.lineTo(-2000, 420);
        ctx.fill();
        // village lights & church
        const R = rng(3);
        for (let i = 0; i < 26; i++) {
          const x = 60 + R() * 300,
            y = 330 + R() * 30 + (x - 200) * 0.06;
          ctx.fillStyle = `rgba(255,190,110,${strike ? 0.2 : 0.55 + 0.3 * Math.sin(t + i)})`;
          ctx.fillRect(x, y, 2.5, 2.5);
        }
        ctx.fillStyle = "#120f1c";
        ctx.fillRect(196, 298, 12, 40);
        ctx.beginPath();
        ctx.moveTo(192, 300);
        ctx.lineTo(202, 280);
        ctx.lineTo(212, 300);
        ctx.fill();
        // gun flashes from the village (muzzle)
        if (!strike && Math.sin(t * 1.7) > 0.96) glow(ctx, 150 + (t * 37) % 160, 335, 30, "rgba(255,220,150,A)", 0.9);
        if (strike) {
          for (let i = 0; i < 4; i++) {
            const ph = (S.st * 0.9 + i * 0.37) % 1;
            if (ph < 0.2) glow(ctx, 90 + i * 70, 330, 90, "rgba(255,230,190,A)", (0.2 - ph) * 4);
          }
          S.emit("strike", 180, 330, 0.9, 60);
        }
        // sea
        const sg = ctx.createLinearGradient(0, 400, 0, 600);
        sg.addColorStop(0, "#1e1a2c");
        sg.addColorStop(1, "#07070d");
        ctx.fillStyle = sg;
        ctx.fillRect(-2000, 404, 5000, 200);
        for (let i = 0; i < 24; i++) {
          const y = 410 + i * 7;
          ctx.fillStyle = `rgba(160,160,210,${0.1 - i * 0.003})`;
          ctx.fillRect(-400 + Math.sin(t * 0.7 + i) * 30, y, 1600, 1);
        }
        // harbor and ships far below-left
        ctx.fillStyle = "#0a0912";
        ctx.fillRect(-300, 404, 620, 10);
        for (let i = 0; i < 5; i++) {
          const x = -200 + i * 110 + (strike ? S.st * (3 + i) : 0);
          ctx.fillRect(x, 396, 60, 10);
          ctx.fillRect(x + 20, 386, 16, 10);
          ctx.fillStyle = "rgba(255,200,120,0.6)";
          ctx.fillRect(x + 8, 400, 2, 2);
          ctx.fillRect(x + 40, 400, 2, 2);
          ctx.fillStyle = "#0a0912";
        }
        // cliff
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.moveTo(560, 620);
        ctx.lineTo(600, 470);
        ctx.lineTo(640, 440);
        ctx.lineTo(700, 400);
        ctx.lineTo(2600, 390);
        ctx.lineTo(2600, 620);
        ctx.fill();
        // lighthouse tower
        const lx = 790;
        ctx.beginPath();
        ctx.moveTo(lx - 34, 402);
        ctx.lineTo(lx - 22, 170);
        ctx.lineTo(lx + 22, 170);
        ctx.lineTo(lx + 34, 402);
        ctx.fill();
        ctx.fillRect(lx - 32, 160, 64, 10);
        ctx.fillRect(lx - 20, 124, 40, 36);
        ctx.beginPath();
        ctx.moveTo(lx - 24, 124);
        ctx.lineTo(lx, 100);
        ctx.lineTo(lx + 24, 124);
        ctx.fill();
        // lantern room: dim — the lamp is dead; only the radio glows
        ctx.fillStyle = "rgba(120,200,160,0.55)";
        ctx.fillRect(lx - 14, 132, 28, 22);
        person(ctx, lx - 2, 158, 26, { helmet: true, color: "#0b1210" });
        // sweeping searchlight from the enemy side looking for you
        const ang = -0.9 + Math.sin(t * 0.35) * 0.5;
        ctx.globalCompositeOperation = "lighter";
        lightCone(ctx, 220, 340, ang, 900, 0.045, "rgba(220,225,255,A)", 0.18);
        ctx.globalCompositeOperation = "source-over";
        // small cottage & radio mast
        ctx.fillStyle = INK;
        ctx.fillRect(860, 368, 80, 36);
        ctx.beginPath();
        ctx.moveTo(854, 370);
        ctx.lineTo(900, 346);
        ctx.lineTo(946, 370);
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2;
        line(ctx, 960, 400, 960, 250);
        line(ctx, 960, 260, 930, 400);
        line(ctx, 960, 260, 990, 400);
      }
    },

    death: {
      sky: ["#030203", "#0e0506", "#220a09"],
      horizon: 0.8,
      glow: { x: 500, y: 600, r: 700, c: "rgba(150,30,20,A)", a: 0.3 },
      weather: "ash",
      flashes: 0,
      audio: { wind: 0.35, rumble: 0.15, drone: 0.04 },
      draw() {}
    },

    survive: {
      sky: ["#1b2330", "#56606e", "#b7aea1"],
      horizon: 0.62,
      glow: { x: 700, y: 380, r: 600, c: "rgba(255,235,200,A)", a: 0.35 },
      weather: null,
      flashes: 0,
      audio: { wind: 0.3, rumble: 0, sea: 0.4, drone: 0.03 },
      draw(ctx, t, S) {
        const sg = ctx.createLinearGradient(0, 372, 0, 600);
        sg.addColorStop(0, "#8f8e8e");
        sg.addColorStop(1, "#2a3038");
        ctx.fillStyle = sg;
        ctx.fillRect(-2000, 372, 5000, 240);
        for (let i = 0; i < 30; i++) {
          ctx.fillStyle = `rgba(255,245,225,${0.25 - i * 0.008})`;
          ctx.fillRect(640 + Math.sin(t * 0.8 + i) * 16 - (70 - i * 2), 376 + i * 5, 140 - i * 4, 1.2);
        }
        // a lone small boat
        const bx = 420 + S.st * 2,
          by = 440 + Math.sin(t) * 2;
        ctx.fillStyle = "#1a1e24";
        ctx.beginPath();
        ctx.moveTo(bx - 40, by);
        ctx.lineTo(bx + 40, by);
        ctx.lineTo(bx + 30, by + 10);
        ctx.lineTo(bx - 34, by + 10);
        ctx.fill();
        person(ctx, bx, by, 34, { pose: "sit", color: "#1a1e24", lean: 0.3 });
        // distant smoke on the horizon, behind you
        ctx.fillStyle = "rgba(60,60,70,0.25)";
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.ellipse(-100 + i * 25, 360 - i * 18, 40 + i * 12, 14 + i * 4, 0.2, 0, TAU);
          ctx.fill();
        }
      }
    },

    quiet: {
      sky: ["#05060a", "#0c0e15", "#1b1618"],
      horizon: 0.72,
      glow: { x: 500, y: 470, r: 600, c: "rgba(200,90,40,A)", a: 0.2 },
      weather: "ash",
      flashes: 0.08,
      audio: { wind: 0.2, rumble: 0.15, drone: 0.03 },
      draw(ctx, t, S) {
        const far = S.cached("q-far", () => makeSkyline(41, -1200, 2300, 470, 20, 110, 0.6));
        drawSkyline(ctx, far, "#140e0e", t, "rgba(255,160,70,1)");
        ctx.fillStyle = INK;
        ctx.fillRect(-2000, 468, 5000, 200);
      }
    }
  };
  SCENES.intro = SCENES.title;

  function tank(ctx, x, y, s, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = color;
    ctx.beginPath();
    roundRect(ctx, -60, -22, 120, 22, 10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-40, -22);
    ctx.lineTo(-30, -40);
    ctx.lineTo(30, -40);
    ctx.lineTo(45, -22);
    ctx.fill();
    ctx.fillRect(20, -34, 80, 6);
    ctx.restore();
  }
  function bus(ctx, x, y) {
    ctx.fillStyle = INK;
    ctx.beginPath();
    roundRect(ctx, x - 50, y - 34, 100, 30, 5);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - 30, y - 4, 7, 0, TAU);
    ctx.arc(x + 30, y - 4, 7, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,170,90,0.35)";
    for (let i = 0; i < 6; i++) ctx.fillRect(x - 44 + i * 15, y - 29, 10, 9);
  }

  /* ─────────────── renderer ─────────────── */
  class Renderer {
    constructor(canvas, layoutFn) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.layoutFn = layoutFn;
      this.name = "title";
      this.def = SCENES.title;
      this.opts = {};
      this.st = 0;
      this.t = 0;
      this.cover = 1; // black overlay alpha for transitions
      this.coverTarget = 0;
      this.pending = null;
      this.flashes = [];
      this.particles = [];
      this.smokes = [];
      this.cache = {};
      this.shakeAmt = 0;
      this.last = performance.now();
      this.onFlash = null;
      this.grain = this.makeGrain();
      this.resize();
      window.addEventListener("resize", () => this.resize());
      requestAnimationFrame((ts) => this.frame(ts));
    }

    makeGrain() {
      const c = document.createElement("canvas");
      c.width = c.height = 160;
      const g = c.getContext("2d");
      const img = g.createImageData(160, 160);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 22;
      }
      g.putImageData(img, 0, 0);
      return c;
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.dpr = dpr;
      this.w = window.innerWidth;
      this.h = window.innerHeight;
      this.canvas.width = Math.round(this.w * dpr);
      this.canvas.height = Math.round(this.h * dpr);
      const L = this.layoutFn ? this.layoutFn(this.w, this.h) : { cx: this.w / 2, bottom: this.h * 0.9, availW: this.w };
      this.L = L;
      this.scale = Math.min(L.availW / 760, (L.bottom - (L.top || 0)) / 620);
      this.ox = L.cx - 500 * this.scale;
      this.oy = L.bottom - 600 * this.scale;
    }

    set(name, opts = {}) {
      const def = SCENES[name] || SCENES.quiet;
      const same = name === this.name && JSON.stringify(opts) === JSON.stringify(this.opts);
      if (same) return;
      if (name === this.name) {
        // variant change on same scene: no fade, keep time
        this.opts = opts;
        this.st = 0;
        return;
      }
      this.pending = { name, def, opts };
      this.coverTarget = 1;
    }

    swap() {
      const p = this.pending;
      this.pending = null;
      this.name = p.name;
      this.def = p.def;
      this.opts = p.opts;
      this.st = 0;
      this.smokes = [];
      this.particles = [];
      this.flashes = [];
      this.coverTarget = 0;
      if (window.AudioFX) AudioFX.setMood(this.def.audio || {});
    }

    cached(key, fn) {
      return this.cache[key] || (this.cache[key] = fn());
    }

    emit(key, x, y, rate, size) {
      if (REDUCED) return;
      if (Math.random() < rate * this.dt * 2)
        this.smokes.push({ x, y, vx: 8 + Math.random() * 10, vy: -12 - Math.random() * 10, r: size * 0.4, g: size * 0.35, life: 0, max: 7 + Math.random() * 5, key });
    }

    explode(x, y, big = 1) {
      this.flashes.push({ x, y, life: 0, max: 1.4, big: 2.4 * big, near: true });
      this.shakeAmt = 14 * big;
      for (let i = 0; i < 26; i++)
        this.smokes.push({ x: x + (Math.random() - 0.5) * 120, y: y + (Math.random() - 0.5) * 40, vx: (Math.random() - 0.5) * 40, vy: -20 - Math.random() * 40, r: 30 + Math.random() * 40, g: 25, life: 0, max: 8 + Math.random() * 5, dark: true });
      if (window.AudioFX) AudioFX.boom(0.1, 1.3);
    }

    muzzle() {
      this.shakeAmt = 4;
      for (let i = 0; i < 6; i++) setTimeout(() => this.flashes.push({ x: 150 + Math.random() * 700, y: 470, life: 0, max: 0.15, big: 0.3, near: true }), i * 110);
      if (window.AudioFX) AudioFX.shots(7);
    }

    barrage() {
      for (let i = 0; i < 6; i++)
        setTimeout(() => {
          this.flashes.push({ x: 60 + Math.random() * 320, y: 330, life: 0, max: 1.2, big: 1.4 });
          if (window.AudioFX) AudioFX.boom(0.6, 1);
        }, i * 380);
    }

    frame(ts) {
      const dt = Math.min(0.05, (ts - this.last) / 1000);
      this.last = ts;
      this.dt = dt;
      this.t += dt;
      this.st += dt;
      // transition cover
      const speed = this.coverTarget > this.cover ? 2.2 : 1.1;
      this.cover += clamp(this.coverTarget - this.cover, -speed * dt, speed * dt);
      if (this.pending && this.cover >= 0.999) this.swap();
      this.draw(dt);
      requestAnimationFrame((t2) => this.frame(t2));
    }

    draw(dt) {
      const { ctx, w, h, dpr, def } = this;
      const t = REDUCED ? this.t * 0.25 : this.t;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // sky
      const hy = this.oy + 600 * this.scale * (def.horizon || 0.7);
      const sky = ctx.createLinearGradient(0, 0, 0, Math.max(hy, 1));
      sky.addColorStop(0, def.sky[0]);
      sky.addColorStop(0.55, def.sky[1]);
      sky.addColorStop(1, def.sky[2]);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      if (def.weather === "stars") this.stars(ctx, w, hy, t);

      // world transform with shake
      let sx = 0,
        sy = 0;
      if (this.shakeAmt > 0.1 && !REDUCED) {
        sx = (Math.random() - 0.5) * this.shakeAmt;
        sy = (Math.random() - 0.5) * this.shakeAmt;
        this.shakeAmt *= Math.pow(0.02, dt);
      }
      const k = this.scale * dpr;
      ctx.setTransform(k, 0, 0, k, (this.ox + sx) * dpr, (this.oy + sy) * dpr);

      // horizon glow
      if (def.glow) {
        const g = def.glow;
        const fl = 0.85 + 0.15 * Math.sin(t * 1.3) * Math.sin(t * 2.9);
        ctx.globalCompositeOperation = "lighter";
        glow(ctx, g.x, g.y, g.r, g.c, g.a * fl);
        ctx.globalCompositeOperation = "source-over";
      }
      // searchlights in the sky
      if (def.searchlights) {
        ctx.globalCompositeOperation = "lighter";
        for (let i = 0; i < def.searchlights; i++) {
          const ang = -Math.PI / 2 + Math.sin(t * (0.21 + i * 0.07) + i * 2) * 0.55;
          lightCone(ctx, 300 + i * 420, 480, ang, 900, 0.035, "rgba(200,210,235,A)", 0.13);
        }
        ctx.globalCompositeOperation = "source-over";
      }

      // artillery flashes on the horizon
      if (def.flashes && !REDUCED && Math.random() < def.flashes * dt) {
        const z = def.flashZone || [-300, 1300];
        const f = { x: z[0] + Math.random() * (z[1] - z[0]), y: 600 * (def.horizon || 0.7) - 10, life: 0, max: 0.9, big: 0.6 + Math.random() * 0.8 };
        this.flashes.push(f);
        if (window.AudioFX) setTimeout(() => AudioFX.boom(0.75 + Math.random() * 0.2, 0.8), 300 + Math.random() * 900);
      }
      ctx.globalCompositeOperation = "lighter";
      for (const f of this.flashes) {
        f.life += dt;
        const a = Math.max(0, 1 - f.life / f.max);
        glow(ctx, f.x, f.y, 260 * f.big, def.flashColor || "rgba(255,200,140,A)", a * a * (f.near ? 0.95 : 0.5));
      }
      ctx.globalCompositeOperation = "source-over";
      this.flashes = this.flashes.filter((f) => f.life < f.max);

      // scene emitters (behind silhouettes)
      if (def.smoke) for (const s of def.smoke) this.emit("s", s.x, s.y, s.rate, s.s);
      this.drawSmoke(ctx, dt, false);

      // scene silhouettes
      def.draw(ctx, t, this);
      this.drawSmoke(ctx, dt, true);

      // fill everything under the stage with ground so the panel sits on it
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const stageBottom = this.oy + 600 * this.scale;
      if (stageBottom < h && this.name !== "death") {
        ctx.fillStyle = this.name === "survive" ? "#2a3038" : this.name === "death" ? "#030203" : INK;
        ctx.fillRect(0, stageBottom - 1, w, h - stageBottom + 1);
      }

      // weather (screen space)
      this.weather(ctx, dt, w, h, t);

      // vignette
      const v = ctx.createRadialGradient(this.L.cx, h * 0.45, Math.min(w, h) * 0.25, this.L.cx, h * 0.5, Math.max(w, h) * 0.85);
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, w, h);

      // film grain
      if (!REDUCED) {
        ctx.globalAlpha = 0.5;
        const p = ctx.createPattern(this.grain, "repeat");
        const ox = (Math.random() * 160) | 0,
          oy = (Math.random() * 160) | 0;
        ctx.translate(-ox, -oy);
        ctx.fillStyle = p;
        ctx.fillRect(0, 0, w + 160, h + 160);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalAlpha = 1;
      }

      // transition cover
      if (this.cover > 0.001) {
        ctx.fillStyle = `rgba(0,0,0,${ease(this.cover)})`;
        ctx.fillRect(0, 0, w, h);
      }
    }

    drawSmoke(ctx, dt, front) {
      for (const s of this.smokes) {
        if (!!s.dark !== front) continue;
        if (!front) {
          s.life += dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.r += s.g * dt;
        }
        const a = Math.sin(Math.PI * clamp(s.life / s.max, 0, 1)) * (s.dark ? 0.55 : 0.28);
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
        const c = s.dark ? "30,26,26" : s.key === "funnel" ? "40,34,44" : "24,20,22";
        g.addColorStop(0, `rgba(${c},${a})`);
        g.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
      }
      if (front) {
        for (const s of this.smokes)
          if (s.dark) {
            s.life += dt;
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.r += s.g * dt;
          }
        this.smokes = this.smokes.filter((s) => s.life < s.max);
      }
    }

    stars(ctx, w, hy, t) {
      const st = this.cached("stars", () => {
        const R = rng(77);
        return Array.from({ length: 140 }, () => ({ x: R(), y: R(), s: R() }));
      });
      for (const s of st) {
        ctx.fillStyle = `rgba(220,225,255,${0.2 + 0.5 * s.s * (0.7 + 0.3 * Math.sin(t * 2 + s.x * 50))})`;
        ctx.fillRect(s.x * w, s.y * hy * 0.8, 1.2, 1.2);
      }
    }

    weather(ctx, dt, w, h, t) {
      const kind = this.def.weather;
      if (!kind || kind === "stars") return;
      const P = this.particles;
      const want = REDUCED ? 0 : { rain: 260, drizzle: 110, embers: 70, ash: 80, dust: 60 }[kind] || 0;
      while (P.length < want) P.push(this.spawn(kind, w, h, true));
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.age += dt;
        if (kind === "embers") p.x += Math.sin(t * 2 + p.seed) * 12 * dt;
        if (kind === "ash" || kind === "dust") p.x += Math.sin(t + p.seed) * 8 * dt;
        if (p.y > h + 20 || p.y < -30 || p.x < -40 || p.x > w + 40) P[i] = this.spawn(kind, w, h, false);
      }
      if (kind === "rain" || kind === "drizzle") {
        ctx.strokeStyle = kind === "rain" ? "rgba(170,190,215,0.28)" : "rgba(170,190,215,0.18)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const p of P) {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025);
        }
        ctx.stroke();
      } else if (kind === "embers") {
        ctx.globalCompositeOperation = "lighter";
        for (const p of P) {
          const a = 0.5 + 0.5 * Math.sin(t * 8 + p.seed * 10);
          ctx.fillStyle = `rgba(255,${120 + p.seed * 60},50,${a * 0.9})`;
          ctx.fillRect(p.x, p.y, p.s, p.s);
        }
        ctx.globalCompositeOperation = "source-over";
      } else {
        for (const p of P) {
          ctx.fillStyle = kind === "dust" ? `rgba(210,215,230,${0.25 + 0.2 * Math.sin(t + p.seed)})` : "rgba(170,160,160,0.45)";
          ctx.fillRect(p.x, p.y, p.s, p.s);
        }
      }
    }

    spawn(kind, w, h, anywhere) {
      const p = { x: Math.random() * w, y: anywhere ? Math.random() * h : -10, age: 0, seed: Math.random() * 10, s: 1 + Math.random() * 2 };
      if (kind === "rain") Object.assign(p, { vx: -120, vy: 900 + Math.random() * 300 });
      else if (kind === "drizzle") Object.assign(p, { vx: -60, vy: 600 + Math.random() * 200 });
      else if (kind === "embers") Object.assign(p, { y: anywhere ? Math.random() * h : h + 10, vx: 10 + Math.random() * 20, vy: -30 - Math.random() * 60, s: 1.2 + Math.random() * 2 });
      else if (kind === "dust") Object.assign(p, { vx: 0, vy: 6 + Math.random() * 10, s: 1 + Math.random() * 1.5 });
      else Object.assign(p, { vx: 6, vy: 18 + Math.random() * 24 });
      return p;
    }
  }

  window.SceneRenderer = Renderer;
  window.SCENES = SCENES;
})();
