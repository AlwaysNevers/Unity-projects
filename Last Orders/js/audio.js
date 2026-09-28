/*
  LAST ORDERS — sound
  Every sound is synthesized with the Web Audio API, so the game
  needs no audio files. Browsers only allow sound after a click,
  so AudioFX.init() is called from the "Begin" button.
*/
(function () {
  const A = {
    ctx: null,
    master: null,
    muted: false,
    layers: {},
    heartTimer: null,

    init() {
      if (this.ctx) {
        if (this.ctx.state === "suspended") this.ctx.resume();
        return;
      }
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = (this.ctx = new Ctx());

      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 4;
      comp.connect(ctx.destination);
      this.master = ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(comp);

      this.white = this.noiseBuffer("white");
      this.brown = this.noiseBuffer("brown");

      // Wind: brown noise, gently swept filter
      this.layers.wind = this.loop(this.brown, "lowpass", 380, 0.0);
      this.sweep(this.layers.wind.filter.frequency, 380, 160, 0.07);
      // Low rumble of distant war
      this.layers.rumble = this.loop(this.brown, "lowpass", 90, 0.0);
      // Rain: bandpassed white noise
      this.layers.rain = this.loop(this.white, "bandpass", 2600, 0.0, 0.6);
      // Sea: slow swelling lowpassed noise
      this.layers.sea = this.loop(this.brown, "lowpass", 600, 0.0);
      this.sweep(this.layers.sea.gainLfoTarget, 0, 1, 0.12, this.layers.sea);

      // Drone: two detuned saws through a slow filter
      const dg = ctx.createGain();
      dg.gain.value = 0;
      const df = ctx.createBiquadFilter();
      df.type = "lowpass";
      df.frequency.value = 260;
      df.Q.value = 4;
      [55, 55.35, 82.4].forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = i === 2 ? "sine" : "sawtooth";
        o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = i === 2 ? 0.5 : 0.35;
        o.connect(g).connect(df);
        o.start();
      });
      df.connect(dg).connect(this.master);
      this.sweep(df.frequency, 260, 140, 0.05);
      this.layers.drone = { gain: dg, filter: df };
    },

    noiseBuffer(kind) {
      const ctx = this.ctx;
      const len = ctx.sampleRate * 3;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        if (kind === "brown") {
          last = (last + 0.02 * w) / 1.02;
          d[i] = last * 3.5;
        } else d[i] = w;
      }
      return buf;
    },

    loop(buffer, type, freq, vol, q) {
      const ctx = this.ctx;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = freq;
      if (q) filter.Q.value = q;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 1;
      const gain = ctx.createGain();
      gain.gain.value = vol;
      src.connect(filter).connect(lfoGain).connect(gain).connect(this.master);
      src.start(0, Math.random() * 2);
      return { src, filter, gain, gainLfoTarget: lfoGain.gain };
    },

    // Slow LFO between two values
    sweep(param, a, b, rate) {
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      osc.frequency.value = rate;
      const amp = ctx.createGain();
      amp.gain.value = (a - b) / 2;
      param.value = (a + b) / 2;
      osc.connect(amp).connect(param);
      osc.start();
    },

    setMood(m) {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const set = (layer, v) => {
        if (!this.layers[layer]) return;
        const g = this.layers[layer].gain.gain;
        g.cancelScheduledValues(t);
        g.setValueAtTime(g.value, t);
        g.linearRampToValueAtTime(v, t + 2.5);
      };
      set("wind", m.wind ?? 0.25);
      set("rumble", m.rumble ?? 0.3);
      set("rain", m.rain ?? 0);
      set("sea", m.sea ?? 0);
      set("drone", m.drone ?? 0.05);
    },

    setMuted(v) {
      this.muted = v;
      if (!this.ctx) return;
      const g = this.master.gain;
      g.cancelScheduledValues(this.ctx.currentTime);
      g.setTargetAtTime(v ? 0 : 0.9, this.ctx.currentTime, 0.15);
    },

    // A distant or close explosion. distance 0 = on top of you, 1 = far away
    boom(distance = 0.8, size = 1) {
      if (!this.ctx) return;
      const ctx = this.ctx;
      const t = ctx.currentTime + 0.02;
      const src = ctx.createBufferSource();
      src.buffer = this.brown;
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(900 - distance * 700, t);
      f.frequency.exponentialRampToValueAtTime(60, t + 2.5);
      const g = ctx.createGain();
      const peak = (1.6 - distance * 1.2) * size;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.001), t + 0.03 + distance * 0.1);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6 + distance * 1.5);
      src.connect(f).connect(g).connect(this.master);
      src.start(t, Math.random() * 2);
      src.stop(t + 4);
      // sub thump
      const o = ctx.createOscillator();
      o.frequency.setValueAtTime(70, t);
      o.frequency.exponentialRampToValueAtTime(28, t + 0.8);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.0001, t);
      og.gain.exponentialRampToValueAtTime(Math.max(0.9 * size * (1 - distance * 0.8), 0.001), t + 0.02);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      o.connect(og).connect(this.master);
      o.start(t);
      o.stop(t + 1.4);
    },

    shots(n = 6) {
      if (!this.ctx) return;
      for (let i = 0; i < n; i++) {
        const t = this.ctx.currentTime + i * 0.11 + Math.random() * 0.05;
        const src = this.ctx.createBufferSource();
        src.buffer = this.white;
        const f = this.ctx.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = 1200 + Math.random() * 600;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.9, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        src.connect(f).connect(g).connect(this.master);
        src.start(t, Math.random());
        src.stop(t + 0.25);
      }
    },

    click() {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      o.type = "triangle";
      o.frequency.setValueAtTime(180, t);
      o.frequency.exponentialRampToValueAtTime(60, t + 0.12);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
      o.connect(g).connect(this.master);
      o.start(t);
      o.stop(t + 0.2);
    },

    thump(t, vol) {
      const o = this.ctx.createOscillator();
      o.frequency.setValueAtTime(62, t);
      o.frequency.exponentialRampToValueAtTime(38, t + 0.12);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g).connect(this.master);
      o.start(t);
      o.stop(t + 0.3);
    },

    // Heartbeat. rate 1 = resting, higher = faster
    heartbeat(on, rate = 1) {
      clearTimeout(this.heartTimer);
      this.heartTimer = null;
      this.heartRate = rate;
      if (!on || !this.ctx) return;
      const beat = () => {
        const t = this.ctx.currentTime + 0.02;
        this.thump(t, 0.55);
        this.thump(t + 0.24, 0.35);
        this.heartTimer = setTimeout(beat, 1050 / this.heartRate);
      };
      beat();
    },
    setHeartRate(rate) {
      this.heartRate = rate;
    },

    // Rising tone while a choice is held down
    holdStart(ms) {
      if (!this.ctx) return;
      this.holdStop();
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(70, t);
      o.frequency.exponentialRampToValueAtTime(220, t + ms / 1000);
      const f = this.ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(300, t);
      f.frequency.linearRampToValueAtTime(1400, t + ms / 1000);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.15);
      o.connect(f).connect(g).connect(this.master);
      o.start(t);
      this.holdNode = { o, g };
    },
    holdStop() {
      if (!this.holdNode || !this.ctx) return;
      const { o, g } = this.holdNode;
      const t = this.ctx.currentTime;
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.stop(t + 0.15);
      this.holdNode = null;
    },
    // The weight of a decision landing
    commit() {
      if (!this.ctx) return;
      this.holdStop();
      const t = this.ctx.currentTime + 0.01;
      this.thump(t, 0.9);
      this.boom(0.2, 0.5);
    },
    // Map marker arriving
    blip() {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [880, 1320].forEach((fr, i) => {
        const o = this.ctx.createOscillator();
        o.type = "sine";
        o.frequency.value = fr;
        const g = this.ctx.createGain();
        const st = t + i * 0.09;
        g.gain.setValueAtTime(0.0001, st);
        g.gain.exponentialRampToValueAtTime(0.12, st + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, st + 0.18);
        o.connect(g).connect(this.master);
        o.start(st);
        o.stop(st + 0.2);
      });
    },
    // Incoming shell
    whistle() {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(1500, t);
      o.frequency.exponentialRampToValueAtTime(380, t + 1.5);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.14, t + 0.3);
      g.gain.setValueAtTime(0.14, t + 1.4);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.52);
      o.connect(g).connect(this.master);
      o.start(t);
      o.stop(t + 1.6);
    },

    sting(kind) {
      if (!this.ctx) return;
      const ctx = this.ctx;
      const t = ctx.currentTime + 0.05;
      if (kind === "death") {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(110, t);
        o.frequency.exponentialRampToValueAtTime(27, t + 4);
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = 300;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.35, t + 0.4);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 5);
        o.connect(f).connect(g).connect(this.master);
        o.start(t);
        o.stop(t + 5.2);
      } else {
        // a quiet, unresolved chord: survival is not a victory
        [220, 277.2, 329.6, 415.3].forEach((fr, i) => {
          const o = ctx.createOscillator();
          o.type = "sine";
          o.frequency.value = fr;
          const g = ctx.createGain();
          const st = t + i * 0.35;
          g.gain.setValueAtTime(0.0001, st);
          g.gain.exponentialRampToValueAtTime(0.09, st + 1.2);
          g.gain.exponentialRampToValueAtTime(0.0001, st + 6);
          o.connect(g).connect(this.master);
          o.start(st);
          o.stop(st + 6.2);
        });
      }
    }
  };

  window.AudioFX = A;
})();
