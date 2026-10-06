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
      // fallen on the ground, head toward the facing side
      ctx.lineWidth = limb * 1.1;
      line(ctx, -h * 0.02, -h * 0.06, -h * 0.44, -h * 0.04); // straight leg
      line(ctx, -h * 0.02, -h * 0.06, -h * 0.22, -h * 0.17); // bent leg
      line(ctx, -h * 0.22, -h * 0.17, -h * 0.38, -h * 0.05);
      ctx.beginPath();
      ctx.ellipse(h * 0.15, -h * 0.08, h * 0.2, h * 0.08, -0.06, 0, TAU);
      ctx.fill();
      head(ctx, h * 0.42, -h * 0.08, r, o.helmet);
      ctx.lineWidth = limb * 0.8;
      line(ctx, h * 0.24, -h * 0.12, h * 0.33, -h * 0.01); // arm
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
        // far bank: the road runs off the bridge and back toward the city
        ctx.fillStyle = "#140b0a";
        ctx.beginPath();
        ctx.moveTo(-1500, 410);
        ctx.lineTo(-1500, 362);
        ctx.quadraticCurveTo(-300, 350, 150, 368);
        ctx.lineTo(345, 372);
        ctx.quadraticCurveTo(368, 376, 380, 392);
        ctx.lineTo(396, 410);
        ctx.fill();
        const v = S.opts.variant || "";
        const blown = v.startsWith("blown");
        const crossing = v === "crossing";
        const adv = blown ? 0.55 : Math.min(1, S.st / 70);
        for (let i = 0; i < 4; i++) {
          const tx = 20 + i * 52 + adv * 50;
          ctx.globalAlpha = 0.22;
          glow(ctx, tx - 26, 356, 34, "rgba(170,120,90,A)", 0.9);
          ctx.globalAlpha = 1;
          tank(ctx, tx, 366 + i * 0.8, 0.36, "#110a0a");
        }
        // bridge: piers at 250, 430, 610, 790
        const deckY = 372;
        ctx.fillStyle = INK;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        const truss = (a, b) => {
          ctx.fillRect(a, deckY, b - a, 9);
          for (let x = a; x < b; x += 30) {
            line(ctx, x, deckY, x + 15, deckY - 30);
            line(ctx, x + 15, deckY - 30, x + 30, deckY);
          }
          ctx.fillRect(a, deckY - 32, b - a, 4);
        };
        truss(250, 430);
        truss(610, 790);
        [250, 430, 610, 790].forEach((x) => ctx.fillRect(x - 6, deckY, 12, 240));
        if (blown) {
          // the middle span drops into the river
          const fp = ease(clamp(S.st / 1.5, 0, 1));
          ctx.save();
          ctx.globalAlpha = 1 - fp * 0.7;
          ctx.translate(520, deckY + fp * 160);
          ctx.rotate(fp * 0.35);
          ctx.fillRect(-90, 0, 180, 9);
          for (let x = -90; x < 90; x += 30) {
            line(ctx, x, 0, x + 15, -30);
            line(ctx, x + 15, -30, x + 30, 0);
          }
          if (v === "blowntank") tank(ctx, -10, 0, 0.36, INK);
          ctx.restore();
          ctx.globalAlpha = 1;
          ctx.save();
          ctx.translate(430, deckY);
          ctx.rotate(0.55 * fp);
          ctx.fillRect(0, 0, 50, 8);
          ctx.restore();
          ctx.save();
          ctx.translate(610, deckY);
          ctx.rotate(Math.PI - 0.65 * fp);
          ctx.fillRect(0, -8, 45, 8);
          ctx.restore();
          fire(ctx, 460, 425, 16, t, 21);
          fire(ctx, 585, 420, 12, t, 22);
          if (S.st < 3) {
            ctx.globalAlpha = 0.6 * (1 - S.st / 3);
            glow(ctx, 520, 430, 140, "rgba(230,215,200,A)", 0.5);
            ctx.globalAlpha = 1;
          }
        } else if (crossing) {
          truss(430, 610);
          // the lead tank rolls onto the bridge
          tank(ctx, 240 + Math.min(S.st * 18, 230), deckY, 0.36, INK);
        } else {
          truss(430, 610);
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
        // near bank (middle distance): the bridge lands on an embankment and the road ramps down.
        // It faces the burning city and catches its light, so the dark foreground stands out against it.
        const bankY = (x) => (x <= 830 ? 372 + (x - 790) / 20 : x <= 960 ? 374 + ((x - 830) / 130) * 20 : 394);
        const nb = ctx.createLinearGradient(0, 368, 0, 560);
        nb.addColorStop(0, "#3a2017");
        nb.addColorStop(0.45, "#25140f");
        nb.addColorStop(1, "#140c0a");
        ctx.fillStyle = nb;
        ctx.beginPath();
        ctx.moveTo(560, 620);
        ctx.lineTo(752, 410);
        ctx.quadraticCurveTo(772, 392, 790, 372);
        ctx.lineTo(830, 374);
        ctx.quadraticCurveTo(880, 392, 960, 394);
        ctx.lineTo(2600, 398);
        ctx.lineTo(2600, 620);
        ctx.fill();
        // firelight glints along the water's edge
        ctx.strokeStyle = "rgba(255,140,70,0.28)";
        ctx.lineWidth = 1.5;
        line(ctx, 752, 410, 560, 620);
        // your unit at the bridgehead, at the same scale as the people on the bridge
        if (v !== "blowntank") {
          person(ctx, 968, bankY(968), 27, { helmet: true, rifle: "sling", facing: -1, color: "#0c0909" });
          person(ctx, 1004, bankY(1004), 26, { helmet: true, facing: -1, color: "#0c0909" });
        }
        // after waiting, the refugees are safe on your bank
        if (crossing || v === "blowntank") {
          const R = rng(55);
          for (let i = 0; i < 12; i++) {
            const x = i % 2 ? 796 + R() * 26 : 905 + R() * 120;
            person(ctx, x, bankY(x) + R() * 2, 22 + R() * 7, { facing: -1, bulky: R() > 0.6, color: "#0c0909" });
          }
        }
        // you, crouched behind sandbags, rim-lit by the burning city, with a radio pack
        const you = { pose: "kneel", helmet: true, arms: "forward", facing: -1 };
        person(ctx, 847.5, 533, 200, { ...you, color: "rgba(255,130,60,0.22)" });
        person(ctx, 850, 533, 200, you);
        ctx.fillStyle = INK;
        ctx.beginPath();
        roundRect(ctx, 860, 406, 28, 54, 5);
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2;
        line(ctx, 882, 408, 896, 326);
        // the sandbag wall hides your legs and sits between you and the river
        for (let r = 0; r < 4; r++) {
          for (let x = 744 + (r % 2) * 22 - r * 8; x < 1070 + r * 12; x += 44) {
            ctx.fillStyle = INK;
            ctx.strokeStyle = "#150d0b";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            roundRect(ctx, x, 458 + r * 19, 46, 23, 10);
            ctx.fill();
            ctx.stroke();
          }
        }
        // foreground: the ground right in front of the camera, hiding your feet
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.moveTo(590, 620);
        ctx.quadraticCurveTo(650, 552, 740, 534);
        ctx.quadraticCurveTo(820, 520, 960, 524);
        ctx.lineTo(2600, 530);
        ctx.lineTo(2600, 620);
        ctx.fill();
        // the detonator sits on the sandbags, its cable running back to the bridge
        ctx.fillStyle = INK;
        ctx.fillRect(782, 440, 28, 19);
        ctx.fillRect(794, 432, 4, 9);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(784, 452);
        ctx.quadraticCurveTo(742, 440, 786, 384);
        ctx.stroke();
        if (!crossing && v !== "blowntank") glow(ctx, 868, 418, 8, "rgba(233,162,59,A)", 0.9);
        // Harrow's voice comes in over the radio
        if (v === "radio") {
          for (let k = 0; k < 3; k++) {
            const ph = (S.st * 0.9 + k / 3) % 1;
            ctx.strokeStyle = `rgba(233,162,59,${(1 - ph) * 0.75})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(896, 326, 6 + ph * 28, -0.8, 0.8);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(896, 326, 6 + ph * 28, Math.PI - 0.8, Math.PI + 0.8);
            ctx.stroke();
          }
        }
        // name the voice with a callout the moment he's introduced (gone once the decision zooms in)
        if (v === "radio" && !S.pushed) {
          const px = 1 / (S.scale * S.cam.z);
          const a = Math.min(1, S.st / 0.5);
          const top = 286;
          const ty = top - 34 * px;
          ctx.save();
          ctx.globalAlpha = a;
          ctx.strokeStyle = "rgba(233,162,59,0.85)";
          ctx.lineWidth = 1.5 * px;
          line(ctx, 896, top, 896, ty + 8 * px);
          ctx.textAlign = "right";
          ctx.fillStyle = "#e9a23b";
          ctx.font = `500 ${15 * px}px "IBM Plex Mono", ui-monospace, monospace`;
          ctx.fillText("LT. HARROW", 896 + 4 * px, ty - 16 * px);
          ctx.fillStyle = "rgba(230,224,211,0.85)";
          ctx.font = `${11 * px}px "IBM Plex Mono", ui-monospace, monospace`;
          ctx.fillText("YOUR COMMANDER · ON THE RADIO", 896 + 4 * px, ty);
          ctx.restore();
        }
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
        const fl = (0.8 + 0.2 * Math.sin(t * 9) * Math.sin(t * 3.1)) * (S.opts.variant === "dark" ? 0.3 : 1);
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
          const passed = S.opts.variant === "passed";
          const occl = !passed && (Math.abs(bootX - gx) < 40 || Math.abs(bootX - 60 - gx) < 30);
          const a = (occl ? 0.02 : 0.16 + 0.05 * Math.sin(t * 2 + i)) * (passed ? 0.35 : 1);
          // flashlight beams through the cracks
          const g = ctx.createLinearGradient(0, 90, 0, 490);
          g.addColorStop(0, `rgba(200,215,235,${a * 2})`);
          g.addColorStop(1, "rgba(200,215,235,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(gx - 3, 90);
          ctx.lineTo(gx + 3, 90);
          ctx.lineTo(gx + 52, 490);
          ctx.lineTo(gx - 8, 490);
          ctx.fill();
          ctx.fillStyle = occl ? "#000" : `rgba(220,230,245,${0.5 + a})`;
          ctx.fillRect(gx - 3, 86, 6, 5);
        });
        for (let x = -1500; x < 2500; x += 120) {
          ctx.fillStyle = "#030303";
          ctx.fillRect(x, 70, 24, 30);
        }
        const v = S.opts.variant || "";
        const crying = v !== "passed";
        // the floor sits high and the people are drawn large, so Eli stays in view above the choice cards
        const F = 480;
        // your squad, pressed against the walls
        [[115, 1], [240, 1], [345, -1], [690, -1], [810, -1]].forEach(([x, f], i) => {
          person(ctx, x, F, 110 + (i % 2) * 10, { pose: i % 2 ? "huddle" : "sit", helmet: i % 2 === 0, facing: f, lean: 0.1 });
          ctx.fillStyle = INK;
          if (i % 2 === 0) rifle(ctx, x - 22 * f, F - 16, 110, f > 0 ? -1.75 : -1.39);
        });
        // Okafor, reaching toward you
        person(ctx, 572, F + 8, 110, { pose: "kneel", helmet: true, arms: "forward", facing: -1 });
        // you, kneeling, holding Eli
        const shake = crying && !REDUCED ? Math.sin(t * 22) * 1 : 0;
        person(ctx, 440, F + 8, 118, { pose: "kneel", helmet: true, arms: "forward", lean: 0.16 });
        const bx = 469 + shake,
          by = F - 46;
        // a pale blanket, the only soft thing in the room
        ctx.fillStyle = "#4a4037";
        ctx.beginPath();
        ctx.ellipse(bx, by, 21, 11, -0.35, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#5c5146";
        ctx.beginPath();
        ctx.arc(bx + 17, by - 9, 7, 0, TAU);
        ctx.fill();
        // his crying, rippling out through the dark
        if (crying) {
          ctx.lineWidth = 2;
          for (let i = 0; i < 3; i++) {
            const ph = (t * 0.9 + i / 3) % 1;
            ctx.strokeStyle = `rgba(235,215,190,${0.4 * (1 - ph)})`;
            ctx.beginPath();
            ctx.arc(bx + 16, by - 9, 13 + ph * 90, -Math.PI * 0.95, -Math.PI * 0.05);
            ctx.stroke();
          }
        }
        ctx.fillStyle = "#050404";
        ctx.fillRect(-2000, F, 5000, 200);
        // stairs silhouette at right
        ctx.fillStyle = "#070605";
        for (let i = 0; i < 8; i++) ctx.fillRect(930 + i * 26, F - i * 50, 400, 50);
        if (v === "found") {
          // the cellar door is open: a flashlight pours down the stairs
          const fp = ease(clamp(S.st / 0.8, 0, 1));
          ctx.globalCompositeOperation = "lighter";
          glow(ctx, 1040, 200, 300, "rgba(215,225,245,A)", 0.4 * fp);
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = INK;
          for (let i = 0; i < 8; i++) ctx.fillRect(930 + i * 26, F - i * 50, 400, 50);
          ctx.globalCompositeOperation = "lighter";
          lightCone(ctx, 950, 350, 2.98, 580, 0.2, "rgba(225,232,250,A)", 0.45 * fp);
          ctx.globalCompositeOperation = "source-over";
          person(ctx, 968, F - 50, 124, { helmet: true, rifle: "shoulder", facing: -1 });
        }
      }
    },

    checkpoint: {
      sky: ["#04060a", "#0b1118", "#17212a"],
      horizon: 0.64,
      glow: { x: 500, y: 380, r: 400, c: "rgba(120,150,190,A)", a: 0.12 },
      weather: "drizzle",
      flashes: 0.2,
      searchlights: 1,
      audio: { wind: 0.3, rumble: 0.3, rain: 0.3, drone: 0.08 },
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
      horizon: 0.58,
      glow: null,
      weather: "drizzle",
      flashes: 0.15,
      audio: { wind: 0.3, rumble: 0.25, rain: 0.28, drone: 0.1 },
      draw(ctx, t, S) {
        const v = S.opts.variant || "";
        const filming = v === "camera" || v === "shot";
        const shot = v === "shot" && S.st > 0.15;
        const F = 450; // where the prisoners kneel
        // tents & trucks far
        ctx.fillStyle = "#0b0e12";
        for (let i = -6; i < 16; i++) {
          const x = i * 110 + (i % 3) * 20;
          ctx.beginPath();
          ctx.moveTo(x, 350);
          ctx.lineTo(x + 45, 312);
          ctx.lineTo(x + 90, 350);
          ctx.fill();
        }
        ctx.fillRect(-2000, 348, 5000, 300);
        // floodlights
        [[90, 170], [960, 170]].forEach(([x, y], i) => {
          ctx.fillStyle = INK;
          ctx.fillRect(x - 3, y, 6, 300);
          ctx.fillRect(x - 16, y - 6, 32, 10);
          const flick = 0.9 + 0.1 * Math.sin(t * 20 + i * 3);
          ctx.globalCompositeOperation = "lighter";
          lightCone(ctx, x, y, i ? 2.3 : 0.84, 560, 0.28, "rgba(235,240,255,A)", 0.24 * flick);
          glow(ctx, x, y, 50, "rgba(255,255,240,A)", 0.9);
          ctx.globalCompositeOperation = "source-over";
        });
        // lit mud pool
        const g = ctx.createRadialGradient(480, F, 10, 480, F, 380);
        g.addColorStop(0, "rgba(160,170,185,0.25)");
        g.addColorStop(1, "rgba(160,170,185,0)");
        ctx.fillStyle = g;
        ctx.fillRect(100, 370, 800, 150);
        // the other eight prisoners, kneeling in a row behind
        [235, 305, 375, 445, 545, 615, 685, 755].forEach((x, i) => {
          person(ctx, x, 404, 62, { pose: "kneel", arms: "behind", facing: 1, helmet: i % 3 === 0, lean: 0.16 });
        });
        person(ctx, 175, 406, 92, { helmet: true, rifle: "shoulder", facing: 1 });
        person(ctx, 885, 406, 92, { helmet: true, rifle: "shoulder", facing: -1 });
        // the camera's lamp, picking out you and Okafor
        if (filming) {
          ctx.globalCompositeOperation = "lighter";
          lightCone(ctx, 738, 384, 3.02, 470, 0.13, "rgba(230,235,255,A)", 0.26);
          ctx.globalCompositeOperation = "source-over";
        }
        // Okafor, beside you
        if (shot) person(ctx, 392, F, 88, { pose: "lie", facing: -1, helmet: true });
        else person(ctx, 400, F, 92, { pose: "kneel", arms: "behind", facing: 1, helmet: true, lean: 0.04 });
        // you: facing the colonel, then turned toward Okafor with the pistol
        if (v === "shot") person(ctx, 482, F, 94, { pose: "kneel", arms: "forward", facing: -1, lean: 0.06 });
        else person(ctx, 482, F, 94, { pose: "kneel", arms: "behind", facing: 1, lean: 0.1 });
        // the colonel, holding out the pistol to you
        person(ctx, 566, F + 2, 128, { cap: true, arms: v === "shot" ? null : "out", facing: -1 });
        // the camera on its tripod, and the soldier filming
        if (filming) {
          ctx.fillStyle = INK;
          ctx.strokeStyle = INK;
          ctx.lineWidth = 3.5;
          line(ctx, 764, 388, 738, F + 2);
          line(ctx, 764, 388, 790, F + 2);
          line(ctx, 764, 388, 764, F + 2);
          ctx.beginPath();
          roundRect(ctx, 742, 368, 42, 24, 3);
          ctx.fill();
          ctx.fillRect(733, 373, 12, 14);
          person(ctx, 816, F + 2, 124, { helmet: true, facing: -1, lean: 0.12 });
          ctx.globalCompositeOperation = "lighter";
          glow(ctx, 735, 380, 20, "rgba(235,240,255,A)", 0.9);
          if (Math.sin(t * 4) > 0) glow(ctx, 776, 364, 10, "rgba(255,40,30,A)", 1);
          ctx.globalCompositeOperation = "source-over";
        }
        // barbed wire fence foreground
        ctx.fillStyle = INK;
        for (let x = -1500; x < 2500; x += 150) ctx.fillRect(x, 476, 6, 140);
        for (let x = -1500; x < 2500; x += 150) {
          wire(ctx, x, x + 150, 494, 10, "#050608");
          wire(ctx, x, x + 150, 534, 8, "#050608");
          wire(ctx, x, x + 150, 574, 6, "#050608");
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
        const hv = S.opts.variant || "";
        const dep = hv === "departing" || hv === "sailing" ? ease(clamp(S.st / 30, 0, 1)) : 0;
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
          // you at its foot, a mother & child boarding
          person(ctx, 452, 472, 84, { helmet: true, rifle: "sling", facing: -1 });
          person(ctx, 392, 474, 76, { arms: "out", bulky: true, facing: 1 });
          person(ctx, 418, 474, 38, { facing: 1 });
        } else if (hv === "departing") {
          // left behind on the pier
          person(ctx, 432, 472, 80, { helmet: true, rifle: "sling", facing: 1 });
          person(ctx, 462, 472, 84, { helmet: true, rifle: true, facing: 1 });
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

    // The coast road: a boy at a machine gun, your truck full of wounded
    road: {
      sky: ["#070a12", "#1b2232", "#5e4850"],
      horizon: 0.555,
      glow: { x: 900, y: 332, r: 560, c: "rgba(255,150,110,A)", a: 0.3 },
      weather: "ash",
      flashes: 0.35,
      flashZone: [-300, 260],
      smoke: [{ x: 140, y: 370, rate: 1.1, s: 60 }],
      audio: { wind: 0.35, rumble: 0.45, sea: 0.15, drone: 0.08 },
      draw(ctx, t, S) {
        // drawn 40 units high so Kit stays clear of the choice cards
        ctx.save();
        ctx.translate(0, -40);
        const v = S.opts.variant || "";
        const kit = v !== "taken";
        const away = v === "taken" || v === "leave" ? ease(clamp(S.st / 7, 0, 1)) : 0;
        // the sea, and the ships waiting at the harbor
        const sg = ctx.createLinearGradient(0, 372, 0, 430);
        sg.addColorStop(0, "#4a3d46");
        sg.addColorStop(1, "#141520");
        ctx.fillStyle = sg;
        ctx.fillRect(-2000, 372, 5000, 80);
        for (let i = 0; i < 10; i++) {
          ctx.fillStyle = `rgba(255,190,150,${0.14 - i * 0.012})`;
          ctx.fillRect(860 + Math.sin(t + i) * 12 - (60 - i * 5), 376 + i * 3.5, 120 - i * 10, 1.2);
        }
        ctx.fillStyle = "#16151d";
        [[760, 0.55], [870, 0.8], [990, 0.5]].forEach(([x, s]) => {
          ctx.fillRect(x - 40 * s, 366, 80 * s, 7);
          ctx.fillRect(x - 15 * s, 356, 26 * s, 10);
          ctx.fillRect(x - 6 * s, 344, 5, 12 * s + 4);
        });
        // hills on the enemy side, falling away to the coast
        ctx.fillStyle = "#121722";
        ctx.beginPath();
        ctx.moveTo(-2000, 600);
        ctx.lineTo(-2000, 352);
        ctx.quadraticCurveTo(-300, 318, 160, 350);
        ctx.quadraticCurveTo(470, 380, 640, 404);
        ctx.lineTo(2600, 410);
        ctx.lineTo(2600, 600);
        ctx.fill();
        ctx.globalCompositeOperation = "lighter";
        // the convoy's tail lights, crawling down toward the harbor
        for (let i = 0; i < 6; i++) {
          const x = 610 + ((i * 70 + S.st * 6) % 420);
          glow(ctx, x, 405 + (x - 610) * 0.012, 7, "rgba(255,60,40,A)", 0.9);
        }
        // enemy armored cars back up the road; they come on once the gun stops
        const ex = v === "taken" ? Math.min(S.st * 26, 260) : 0;
        [[20, 434], [120, 442]].forEach(([x, y], i) => glow(ctx, x + ex, y, 30, "rgba(255,240,205,A)", 0.55 + 0.1 * Math.sin(t * 9 + i)));
        ctx.globalCompositeOperation = "source-over";
        // near ground and the road sweeping down to the coast
        ctx.fillStyle = "#0b0e15";
        ctx.fillRect(-2000, 446, 5000, 200);
        ctx.fillStyle = "#1a202c";
        ctx.beginPath();
        ctx.moveTo(-600, 436);
        ctx.quadraticCurveTo(300, 452, 1400, 540);
        ctx.lineTo(1400, 640);
        ctx.quadraticCurveTo(300, 494, -600, 446);
        ctx.fill();
        // the gun nest, drawn a little larger so Kit reads at a glance
        ctx.save();
        ctx.translate(360, 480);
        ctx.scale(1.3, 1.3);
        ctx.translate(-360, -480);
        ctx.fillStyle = INK;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        line(ctx, 352, 458, 340, 474);
        line(ctx, 352, 458, 364, 474);
        ctx.fillRect(338, 451, 28, 9);
        ctx.fillRect(298, 453, 42, 3.5);
        ctx.fillRect(366, 462, 14, 10);
        if (kit) person(ctx, 384, 480, 56, { pose: "kneel", helmet: true, arms: "forward", facing: -1 });
        for (let r = 0; r < 2; r++)
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.ellipse(282 + i * 22 + r * 11, 480 - r * 12, 13, 7.5, 0, 0, TAU);
            ctx.fill();
          }
        // Kit fires in bursts while he's at the gun
        const cycle = Math.floor(t / 2.4);
        const firing = kit && t % 2.4 < 1.1;
        if (firing) {
          if (S.local.burst !== cycle) {
            S.local.burst = cycle;
            if (window.AudioFX) AudioFX.shots(4);
          }
          ctx.globalCompositeOperation = "lighter";
          if (Math.sin(t * 70) > 0) glow(ctx, 296, 455, 26, "rgba(255,225,160,A)", 0.95);
          ctx.strokeStyle = "rgba(255,190,110,0.85)";
          ctx.lineWidth = 1.6;
          for (let k = 0; k < 5; k++) {
            const ph = (t * 2.6 + k / 5) % 1;
            const x = 290 - ph * 400;
            const y = 455 - ph * 18;
            line(ctx, x, y, x + 16, y + 0.7);
          }
          ctx.globalCompositeOperation = "source-over";
        }
        ctx.restore();
        // your truck, a red cross on the canvas
        ctx.save();
        ctx.translate(away * 820, away * 24);
        ctx.fillStyle = INK;
        ctx.beginPath();
        roundRect(ctx, 560, 452, 232, 104, 22);
        ctx.fill();
        ctx.fillRect(552, 540, 250, 16);
        ctx.beginPath();
        ctx.moveTo(796, 556);
        ctx.lineTo(796, 470);
        ctx.lineTo(858, 470);
        ctx.lineTo(884, 506);
        ctx.lineTo(892, 556);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(140,160,185,0.16)";
        ctx.beginPath();
        ctx.moveTo(806, 478);
        ctx.lineTo(852, 478);
        ctx.lineTo(870, 503);
        ctx.lineTo(806, 503);
        ctx.fill();
        ctx.fillStyle = "rgba(205,195,180,0.1)";
        ctx.beginPath();
        ctx.arc(676, 500, 24, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(200,60,50,0.55)";
        ctx.fillRect(670, 486, 12, 28);
        ctx.fillRect(662, 494, 28, 12);
        ctx.fillStyle = INK;
        [612, 700, 850].forEach((x) => {
          ctx.beginPath();
          ctx.arc(x, 562, 21, 0, TAU);
          ctx.fill();
        });
        ctx.globalCompositeOperation = "lighter";
        glow(ctx, 556, 528, 26, "rgba(255,50,30,A)", away ? 0.5 : 0.85);
        glow(ctx, 894, 522, 70, "rgba(255,240,200,A)", 0.45);
        ctx.globalCompositeOperation = "source-over";
        ctx.restore();
        // you, calling to him from the back of the truck
        if (!away) person(ctx, 522, 578, 118, { helmet: true, arms: "out", facing: -1 });
        ctx.fillStyle = INK;
        ctx.fillRect(-2000, 576, 5000, 200);
        ctx.restore();
      }
    },

    // A hidden cove: a boat on the ebb tide, the harbor burning far off.
    // Composed high in the frame so the boat stays above the choice cards.
    cove: {
      sky: ["#04060c", "#121829", "#3b3141"],
      horizon: 0.5,
      glow: { x: 40, y: 300, r: 480, c: "rgba(255,120,60,A)", a: 0.4 },
      weather: "stars",
      flashes: 0.5,
      flashZone: [-260, 220],
      audio: { wind: 0.45, rumble: 0.35, sea: 0.5, drone: 0.07 },
      draw(ctx, t, S) {
        const v = S.opts.variant || "";
        const drift = v === "drift" ? ease(clamp(S.st / 16, 0, 1)) : 0;
        // sea
        const sg = ctx.createLinearGradient(0, 300, 0, 560);
        sg.addColorStop(0, "#272638");
        sg.addColorStop(1, "#06070c");
        ctx.fillStyle = sg;
        ctx.fillRect(-2000, 300, 5000, 400);
        // the harbor, three kilometers off: burning, with ships at the piers
        const docks = S.cached("cv-docks", () => makeSkyline(23, -420, 230, 300, 6, 34, 0.5));
        drawSkyline(ctx, docks, "#15111a", t, "rgba(255,170,90,1)");
        fire(ctx, 20, 300, 14, t, 41);
        fire(ctx, 150, 301, 10, t, 43);
        ctx.fillStyle = "#15111a";
        [-120, 40, 190].forEach((x) => {
          ctx.fillRect(x, 294, 54, 7);
          ctx.fillRect(x + 16, 285, 18, 9);
        });
        // tracers over the docks
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = "rgba(255,190,120,0.8)";
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 5; i++) {
          const ph = (t * 0.8 + i * 0.27) % 1;
          const x = -160 + i * 75 + ph * 70;
          const y = 292 - ph * 14;
          line(ctx, x, y, x + 9, y - 2);
        }
        ctx.globalCompositeOperation = "source-over";
        // neutral rescue ships waiting past the cape, lit up so no one shells them
        const nx = 785,
          ny = 300;
        ctx.globalCompositeOperation = "lighter";
        glow(ctx, nx, ny - 12, 120, "rgba(170,190,255,A)", 0.16);
        const sweep = Math.PI - 0.22 + Math.sin(t * 0.35) * 0.16;
        lightCone(ctx, nx - 8, ny - 30, sweep, 420, 0.035, "rgba(225,235,255,A)", 0.2);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(185,190,205,0.4)";
        ctx.fillRect(nx + 74, ny - 5, 40, 4);
        ctx.fillRect(nx + 88, ny - 10, 12, 5);
        ctx.fillStyle = "#c4c7d0";
        ctx.beginPath();
        ctx.moveTo(nx - 62, ny - 11);
        ctx.lineTo(nx + 60, ny - 11);
        ctx.lineTo(nx + 52, ny);
        ctx.lineTo(nx - 56, ny);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(nx - 26, ny - 22, 46, 11);
        ctx.fillRect(nx - 10, ny - 30, 14, 8);
        ctx.fillStyle = "#3f7d55";
        ctx.fillRect(nx - 58, ny - 5, 112, 2);
        ctx.fillStyle = "#d33a2c";
        [[nx - 3, ny - 16.5, 2], [nx - 38, ny - 8, 1.6], [nx + 34, ny - 8, 1.6]].forEach(([cx, cy, k]) => {
          ctx.fillRect(cx - k / 2, cy - k * 1.5, k, k * 3);
          ctx.fillRect(cx - k * 1.5, cy - k / 2, k * 3, k);
        });
        // the ebb tide: streaks drifting out to sea
        for (let i = 0; i < 52; i++) {
          const y = 312 + i * 4.8;
          const x = ((i * 137 + S.st * (10 + (i % 7) * 4)) % 1500) - 300;
          ctx.fillStyle = `rgba(170,175,220,${0.14 - i * 0.0018})`;
          ctx.fillRect(x, y, 18 + (i % 5) * 9, 1.2);
        }
        // the cliff path, sloping down into the cove
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.moveTo(-2000, 700);
        ctx.lineTo(-2000, 342);
        ctx.lineTo(60, 336);
        ctx.quadraticCurveTo(280, 338, 370, 366);
        ctx.quadraticCurveTo(450, 395, 480, 470);
        ctx.lineTo(520, 700);
        ctx.fill();
        // enemy flashlights on the path, between you and the docks
        ctx.globalCompositeOperation = "lighter";
        [[30, 0], [130, 1.7]].forEach(([x, p]) => {
          lightCone(ctx, x, 328, 0.1 + Math.sin(t * 0.6 + p) * 0.28, 260, 0.12, "rgba(225,230,250,A)", 0.22);
          glow(ctx, x, 328, 10, "rgba(255,255,240,A)", 0.9);
        });
        const L = S.local;
        L.mf = L.mf || [];
        if (!REDUCED && Math.random() < 1.4 * S.dt) {
          L.mf.push({ x: -220 + Math.random() * 300, y: 318 + Math.random() * 14, life: 0 });
          if (window.AudioFX && Math.random() < 0.6) AudioFX.shots(1);
        }
        L.mf.forEach((f) => {
          f.life += S.dt;
          glow(ctx, f.x, f.y, 22, "rgba(255,225,160,A)", Math.max(0, 1 - f.life / 0.14));
        });
        L.mf = L.mf.filter((f) => f.life < 0.14);
        ctx.globalCompositeOperation = "source-over";
        // you, with the radio, looking down at the boat
        if (!v) {
          person(ctx, 300, 342, 88, { helmet: true, rifle: "sling", facing: 1 });
          if (Math.sin(t * 5) > 0.2) {
            ctx.globalCompositeOperation = "lighter";
            glow(ctx, 289, 290, 8, "rgba(120,255,170,A)", 0.9);
            ctx.globalCompositeOperation = "source-over";
          }
        }
        // a little jetty
        ctx.fillStyle = INK;
        ctx.fillRect(460, 412, 180, 6);
        [490, 535, 580, 628].forEach((x) => ctx.fillRect(x, 412, 6, 40));
        // the boat, bobbing on the tide
        const bob = Math.sin(t * 1.4) * 2.2;
        const bx = lerp(700, 752, drift),
          by = lerp(426, 322, drift) + bob * (1 - drift * 0.7);
        const bs = lerp(1, 0.3, drift);
        if (!drift) {
          ctx.strokeStyle = INK;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(636, 415);
          ctx.quadraticCurveTo(650, 430, bx - 50, by - 8);
          ctx.stroke();
        }
        ctx.save();
        ctx.translate(bx, by);
        ctx.scale(bs, bs);
        ctx.rotate(Math.sin(t * 1.1) * 0.03);
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.moveTo(-56, -11);
        ctx.lineTo(56, -13);
        ctx.quadraticCurveTo(48, 8, 30, 10);
        ctx.lineTo(-40, 10);
        ctx.quadraticCurveTo(-56, 4, -56, -11);
        ctx.fill();
        ctx.fillRect(-4, -26, 3, 14);
        if (drift) person(ctx, 14, -11, 44, { pose: "sit", helmet: true, lean: 0.25, facing: -1 });
        ctx.restore();
        // the far arm of the cove
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.moveTo(1060, 700);
        ctx.lineTo(1080, 450);
        ctx.quadraticCurveTo(1200, 410, 2600, 420);
        ctx.lineTo(2600, 700);
        ctx.fill();
        ctx.fillStyle = "rgba(6,7,12,0.85)";
        ctx.fillRect(-2000, 540, 5000, 160);
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

  // Tactical map shown between chapters
  const FRONT = [60, 200, 330, 520, 720];
  const ROADS = [["veyra", "bridge"], ["bridge", "prisoner"], ["bridge", "cellar"], ["prisoner", "checkpoint"], ["prisoner", "captured"], ["cellar", "checkpoint"], ["cellar", "captured"], ["checkpoint", "cove"], ["checkpoint", "gunner"], ["captured", "cove"], ["cove", "harbor"], ["gunner", "harbor"]];
  const COAST = [[905, -600], [900, 0], [870, 80], [838, 150], [852, 220], [880, 280], [858, 332], [882, 400], [905, 480], [885, 600], [900, 1200]];
  SCENES.map = {
    sky: ["#0b1210", "#0b1210", "#0b1210"],
    horizon: 1,
    static: true,
    weather: null,
    flashes: 0,
    pfocus: (o) => {
      const P = window.STORY.places;
      return P[o.from] && P[o.to] ? clamp((P[o.from].x + P[o.to].x) / 2, 320, 680) : 500;
    },
    audio: { wind: 0.1, rumble: 0.2, drone: 0.05 },
    draw(ctx, t, S) {
      const P = window.STORY.places;
      const o = S.opts;
      const mono = (px) => `${px}px "IBM Plex Mono", ui-monospace, monospace`;
      ctx.fillStyle = "#0b1210";
      ctx.fillRect(-2000, -800, 5000, 2200);
      // grid with map references
      ctx.strokeStyle = "rgba(140,180,150,0.07)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = -1000; x <= 2000; x += 50) {
        ctx.moveTo(x, -800);
        ctx.lineTo(x, 1400);
      }
      for (let y = -800; y <= 1400; y += 50) {
        ctx.moveTo(-1000, y);
        ctx.lineTo(2000, y);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(160,190,170,0.3)";
      ctx.font = mono(9);
      for (let i = 0; i < 20; i++) ctx.fillText(String.fromCharCode(65 + i), i * 50 + 22, 16);
      for (let j = 1; j < 12; j++) ctx.fillText(String(j).padStart(2, "0"), 4, j * 50 + 4);
      // sea
      const coastPath = () => {
        ctx.beginPath();
        ctx.moveTo(COAST[0][0], COAST[0][1]);
        COAST.forEach((c) => ctx.lineTo(c[0], c[1]));
      };
      coastPath();
      ctx.lineTo(2600, 1200);
      ctx.lineTo(2600, -600);
      ctx.closePath();
      ctx.fillStyle = "rgba(40,75,95,0.35)";
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = "rgba(120,170,200,0.13)";
      ctx.beginPath();
      for (let y = -600; y < 1200; y += 8) {
        ctx.moveTo(800, y);
        ctx.lineTo(2600, y);
      }
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = "rgba(190,215,200,0.6)";
      ctx.lineWidth = 1.6;
      coastPath();
      ctx.stroke();
      ctx.fillStyle = "rgba(150,190,210,0.55)";
      ctx.font = "italic 13px Georgia, serif";
      ctx.fillText("Gulf of Lorn", 925, 470);
      // river Kessel
      ctx.strokeStyle = "rgba(90,150,185,0.7)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(300, -600);
      ctx.bezierCurveTo(240, 100, 300, 250, 262, 300);
      ctx.bezierCurveTo(230, 350, 285, 480, 235, 1200);
      ctx.stroke();
      ctx.save();
      ctx.translate(276, 480);
      ctx.rotate(1.45);
      ctx.fillText("Kessel River", 0, 0);
      ctx.restore();
      // Tannen forest
      const trees = S.cached("m-forest", () => {
        const R = rng(8);
        const a = [];
        for (let i = 0; i < 170; i++) {
          const ang = R() * TAU,
            r = Math.sqrt(R());
          a.push([565 + Math.cos(ang) * r * 115, 170 + Math.sin(ang) * r * 72]);
        }
        return a;
      });
      ctx.fillStyle = "rgba(120,165,120,0.26)";
      trees.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, TAU);
        ctx.fill();
      });
      ctx.fillStyle = "rgba(140,180,140,0.5)";
      ctx.fillText("Tannen Forest", 520, 262);
      // roads
      ctx.strokeStyle = "rgba(210,215,195,0.16)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 6]);
      ctx.beginPath();
      ROADS.forEach(([a, b]) => {
        ctx.moveTo(P[a].x, P[a].y);
        ctx.lineTo(P[b].x, P[b].y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      // the enemy front advances
      const fp = ease(clamp((S.st - 0.3) / 1.8, 0, 1));
      const fx = lerp(FRONT[o.fromCh || 0], FRONT[o.toCh || 0], fp);
      const edge = () => {
        for (let y = -800; y <= 1400; y += 40) ctx.lineTo(fx + Math.sin(y * 0.02 + 1) * 18, y);
      };
      ctx.beginPath();
      ctx.moveTo(-2000, -800);
      edge();
      ctx.lineTo(-2000, 1400);
      ctx.closePath();
      ctx.fillStyle = "rgba(200,60,40,0.1)";
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = "rgba(220,80,60,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = -2600; x < 1400; x += 14) {
        ctx.moveTo(x, -800);
        ctx.lineTo(x + 1100, 1400);
      }
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = "rgba(235,95,65,0.7)";
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(fx + Math.sin(-800 * 0.02 + 1) * 18, -800);
      edge();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(240,110,80,0.85)";
      ctx.font = mono(10);
      ctx.fillText("ENEMY ADVANCE \u25B6", fx - 128, 82);
      // Veyra burns
      ctx.globalCompositeOperation = "lighter";
      glow(ctx, P.veyra.x, P.veyra.y, 70, "rgba(255,110,40,A)", 0.45 + 0.15 * Math.sin(t * 3));
      ctx.globalCompositeOperation = "source-over";
      // the route you've taken
      const visited = o.visited || [];
      ctx.strokeStyle = "rgba(233,162,59,0.85)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      visited.forEach((id, i) => (i ? ctx.lineTo(P[id].x, P[id].y) : ctx.moveTo(P[id].x, P[id].y)));
      ctx.stroke();
      // places
      for (const id in P) {
        const q = P[id];
        const seen = visited.includes(id);
        const target = id === o.to;
        ctx.strokeStyle = seen ? "rgba(233,162,59,0.95)" : "rgba(200,205,190,0.5)";
        ctx.fillStyle = seen ? "rgba(233,162,59,0.95)" : "rgba(11,18,16,1)";
        ctx.lineWidth = 1.5;
        ctx.fillRect(q.x - 4, q.y - 4, 8, 8);
        ctx.strokeRect(q.x - 4, q.y - 4, 8, 8);
        ctx.fillStyle = seen || target ? "rgba(238,232,218,0.95)" : "rgba(200,205,190,0.42)";
        ctx.font = mono(target ? 12 : 10);
        const left = q.x > 780;
        ctx.textAlign = left ? "right" : "left";
        ctx.fillText(q.name, q.x + (left ? -10 : 10), q.y - 9);
        ctx.textAlign = "left";
      }
      // destination
      const H = P.harbor;
      ctx.strokeStyle = "rgba(233,162,59,0.8)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(H.x, H.y, 13 + Math.sin(t * 2) * 1.5, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "rgba(233,162,59,0.9)";
      ctx.font = mono(9);
      ctx.textAlign = "right";
      ctx.fillText("LAST SHIP 06:00", H.x - 10, H.y + 22);
      ctx.textAlign = "left";
      // current leg, drawn as you travel
      const A0 = P[o.from],
        B0 = P[o.to];
      if (A0 && B0) {
        const q = ease(clamp((S.st - 0.6) / 1.7, 0, 1));
        const mx = lerp(A0.x, B0.x, q),
          my = lerp(A0.y, B0.y, q);
        ctx.strokeStyle = "rgba(233,162,59,0.95)";
        ctx.lineWidth = 2.4;
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = -t * 30;
        ctx.beginPath();
        ctx.moveTo(A0.x, A0.y);
        ctx.lineTo(mx, my);
        ctx.stroke();
        ctx.setLineDash([]);
        const pr = (t * 1.1) % 1;
        ctx.strokeStyle = `rgba(233,162,59,${1 - pr})`;
        ctx.beginPath();
        ctx.arc(mx, my, 7 + pr * 26, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = "#f1b04c";
        ctx.beginPath();
        ctx.arc(mx, my, 6, 0, TAU);
        ctx.fill();
        if (q >= 1 && !S.local.blip) {
          S.local.blip = true;
          if (window.AudioFX) AudioFX.blip();
        }
      }
    }
  };

  // Night firefight in the Tannen forest
  SCENES.forest = {
    sky: ["#030406", "#070a0e", "#0f161b"],
    horizon: 0.76,
    weather: "drizzle",
    flashes: 0,
    focal: { x: 500, y: 460 },
    audio: { wind: 0.3, rumble: 0.2, rain: 0.3, drone: 0.1 },
    draw(ctx, t, S) {
      const back = S.cached("fo-back", () => Array.from({ length: 16 }, (_, i) => makeTree(100 + i, -400 + i * 110 + (i % 3) * 25, 470, 60 + ((i * 37) % 40))));
      back.forEach((tr) => drawTree(ctx, tr, "#10171c", Math.sin(t) * 1.5));
      ctx.fillStyle = "rgba(70,85,100,0.16)";
      ctx.fillRect(-2000, 410, 5000, 70);
      const L = S.local;
      L.mf = L.mf || [];
      if (!REDUCED && Math.random() < 4 * S.dt) {
        L.mf.push({ x: 60 + Math.random() * 880, y: 420 + Math.random() * 70, life: 0 });
        if (window.AudioFX && Math.random() < 0.5) AudioFX.shots(1);
      }
      ctx.globalCompositeOperation = "lighter";
      L.mf.forEach((f) => {
        f.life += S.dt;
        glow(ctx, f.x, f.y, 34, "rgba(255,225,160,A)", Math.max(0, 1 - f.life / 0.14));
      });
      ctx.globalCompositeOperation = "source-over";
      L.mf = L.mf.filter((f) => f.life < 0.14);
      const front = S.cached("fo-front", () => Array.from({ length: 8 }, (_, i) => makeTree(300 + i, -300 + i * 200, 560, 110 + ((i * 53) % 50))));
      front.forEach((tr) => drawTree(ctx, tr, INK, Math.sin(t * 1.2) * 2));
      ctx.fillStyle = INK;
      ctx.fillRect(-2000, 540, 5000, 120);
      person(ctx, 380, 545, 84, { pose: "kneel", helmet: true, rifle: true, facing: 1 });
      person(ctx, 540, 548, 92, { helmet: true, rifle: "shoulder", facing: 1 });
    }
  };

  // Camera focal points, portrait framing and blast positions per scene
  Object.assign(SCENES.title, { focal: { x: 620, y: 440 } });
  Object.assign(SCENES.bridge, { focal: { x: 540, y: 380 }, pfocus: 620, blast: [520, 372] });
  Object.assign(SCENES.farmhouse, { focal: { x: 450, y: 420 } });
  Object.assign(SCENES.cellar, { focal: { x: 470, y: 420 } });
  Object.assign(SCENES.checkpoint, { focal: { x: 500, y: 460 } });
  Object.assign(SCENES.camp, { focal: { x: 500, y: 400 }, shot: [458, 418] });
  Object.assign(SCENES.harbor, { focal: { x: 450, y: 420 }, barrageZone: [-250, 350, 440] });
  Object.assign(SCENES.road, { focal: { x: 500, y: 430 }, pfocus: 500, barrageZone: [100, 900, 430] });
  Object.assign(SCENES.cove, { focal: { x: 540, y: 380 }, pfocus: 560 });

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
      this.cam = { z: 1, x: 500, y: 380 };
      this.pushed = false;
      this.white = 0;
      this.local = {};
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
      this.scale = Math.min(L.availW / (L.portrait ? 640 : 760), (L.bottom - (L.top || 0)) / 620);
      const pf = this.def.pfocus;
      const fx = L.portrait && pf ? (typeof pf === "function" ? pf(this.opts) : pf) : 500;
      this.ox = L.cx - fx * this.scale;
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
        this.local = {};
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
      this.local = {};
      this.pushed = false;
      const f = this.def.focal || { x: 500, y: 380 };
      this.cam = { z: 1, x: f.x, y: f.y };
      this.resize();
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
      const z = this.def.barrageZone || [60, 380, 330];
      for (let i = 0; i < 6; i++)
        setTimeout(() => {
          this.flashes.push({ x: z[0] + Math.random() * (z[1] - z[0]), y: z[2], life: 0, max: 1.2, big: 1.4 });
          this.shakeAmt = Math.max(this.shakeAmt, 5);
          if (window.AudioFX) AudioFX.boom(0.5, 1);
        }, i * 380);
    }

    push(on) {
      this.pushed = on;
    }

    whiteout(a) {
      if (!REDUCED) this.white = Math.max(this.white, a);
    }

    // Named effects used by the story's beats
    fx(name) {
      const A = window.AudioFX;
      const d = this.def;
      if (name === "explosion") {
        const [x, y] = d.blast || [500, 400];
        this.explode(x, y, 1.2);
        this.whiteout(0.75);
      } else if (name === "shots") this.muzzle();
      else if (name === "shot") {
        const [x, y] = d.shot || [520, 480];
        this.flashes.push({ x, y, life: 0, max: 0.25, big: 0.5, near: true });
        this.whiteout(0.3);
        this.shakeAmt = 6;
        if (A) A.shots(1);
      } else if (name === "volley") {
        this.muzzle();
        setTimeout(() => this.muzzle(), 260);
        setTimeout(() => this.whiteout(0.4), 200);
      } else if (name === "barrage") this.barrage();
      else if (name === "boom") {
        this.flashes.push({ x: 250 + Math.random() * 500, y: 600 * (d.horizon || 0.7) - 20, life: 0, max: 1.3, big: 1.8 });
        this.shakeAmt = 7;
        if (A) A.boom(0.35, 1.1);
      }
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
      // camera: a slow push-in, and a tighter push when a decision is due
      const cam = this.cam;
      const foc = def.focal || { x: 500, y: 380 };
      const tz = def.static || REDUCED ? 1 : this.pushed ? 1.14 : 1 + Math.min(this.st / 40, 1) * 0.05;
      const rate = Math.min(1, dt * (this.pushed ? 1.4 : 0.7));
      cam.z += (tz - cam.z) * rate;
      cam.x += (foc.x - cam.x) * rate;
      cam.y += (foc.y - cam.y) * rate;
      const zs = this.scale * cam.z;
      const offX = this.ox + cam.x * this.scale * (1 - cam.z);
      const offY = this.oy + cam.y * this.scale * (1 - cam.z);
      // sky
      const hy = offY + 600 * zs * (def.horizon || 0.7);
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
      const k = zs * dpr;
      ctx.setTransform(k, 0, 0, k, (offX + sx) * dpr, (offY + sy) * dpr);

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
      const stageBottom = offY + 600 * zs;
      if (stageBottom < h && this.name !== "death") {
        ctx.fillStyle = this.name === "survive" ? "#2a3038" : this.name === "map" ? "#0b1210" : INK;
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

      // white flash from explosions
      if (this.white > 0.01) {
        ctx.fillStyle = `rgba(255,244,228,${this.white})`;
        ctx.fillRect(0, 0, w, h);
        this.white *= Math.pow(0.04, dt);
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
