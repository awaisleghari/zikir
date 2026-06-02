import { useState, useMemo } from "react";

// ─── ZikirLandingMobile ──────────────────────────────────────────────────────
// The mobile landing. A faithful port of the Claude Design mock
// (project/Zikir.html in the handoff bundle): a near-black dawn sky with five
// drifting colored fog glows, fine film grain, a sparse decorative
// constellation, and a centered column — wordmark, hairline rule, kicker,
// Enter button, and the closing copy.
//
// The interactive 99-Names constellation lives only on the desktop landing
// (ZikirLanding.jsx). On mobile those stars are decorative glimmer only, per
// the mock — tapping pinhead-sized targets on a phone isn't the experience.
//
// What this shares with the desktop landing is the *entry sequence*: clicking
// Enter fades the scene out, reveals the Bismillah for a beat, then calls
// onEnter so the parent can mount the app. Timing is identical to the desktop
// landing (ENTRY_DURATION_MS), so the prayer feels the same on both.
//
// Props:
//   onEnter — called once the entry sequence has played (~3.5s). If omitted,
//             the landing self-resets so it can be previewed standalone.

const ENTRY_DURATION_MS = 3500;

// Star palette and seed positions are lifted verbatim from the mock. Colors
// reference the CSS custom properties scoped to .zkm-root below; '#ffffff'
// appears twice so plain-white stars are the most common draw.
const STAR_PALETTE = [
  "var(--rose)",
  "var(--amber)",
  "var(--teal)",
  "var(--violet)",
  "var(--gold)",
  "#ffffff",
  "#ffffff",
];

// Hand-placed-ish positions (percent), kept to the upper field and sparse so
// they never crowd the wordmark.
const STAR_SEEDS = [
  [22, 13], [34, 9], [29, 20], [44, 15],
  [69, 11], [78, 18], [73, 24],
  [16, 30], [85, 33], [58, 7],
];

// Each star keeps its own size / color / timing so they glimmer apart from one
// another rather than in unison. Computed once per mount (useMemo) so the
// layout is stable across re-renders — the mock computed this once on load.
function makeStars() {
  return STAR_SEEDS.map(([x, y]) => {
    const size = +(Math.random() * 1.6 + 1.1).toFixed(2);   // 1.10 → 2.70 px
    const color = STAR_PALETTE[Math.floor(Math.random() * STAR_PALETTE.length)];
    const dur = +(Math.random() * 4 + 3.2).toFixed(2);      // 3.2 → 7.2 s
    const delay = +(Math.random() * -6).toFixed(2);         // -6 → 0 s
    const hi = +(Math.random() * 0.35 + 0.55).toFixed(2);   // peak opacity
    const lo = +(Math.random() * 0.12 + 0.1).toFixed(2);    // trough opacity
    return { x, y, size, color, dur, delay, hi, lo };
  });
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Amiri+Quran&display=swap');

  .zkm-root{
    /* near-black with a breath of navy */
    --bg-0:#06070d;
    --bg-1:#0a0c16;
    --ink:#e9e6df;
    --ink-soft:rgba(233,230,223,0.62);
    --ink-faint:rgba(233,230,223,0.34);

    /* dawn-sky accents — same gentle register, hue varies */
    --rose:#e6a6a6;
    --amber:#e7be8a;
    --teal:#86b7ad;
    --violet:#b6a4d6;
    --gold:#ecdca6;

    position:fixed;
    inset:0;
    overflow-y:auto;
    -webkit-overflow-scrolling:touch;
    background:var(--bg-0);
    color:var(--ink);
    font-family:"Cormorant Garamond",Georgia,serif;
    -webkit-font-smoothing:antialiased;
    text-rendering:optimizeLegibility;
  }
  .zkm-root *{box-sizing:border-box;margin:0;padding:0;}

  /* ---- depth: layered dark + faint dawn at the horizon ---- */
  .zkm-sky{
    position:fixed;
    inset:0;
    background:
      radial-gradient(120% 70% at 50% 116%, rgba(231,190,138,0.10) 0%, rgba(230,166,166,0.05) 26%, rgba(6,7,13,0) 55%),
      radial-gradient(120% 90% at 50% -10%, rgba(20,24,42,0.9) 0%, rgba(8,10,18,0) 60%),
      linear-gradient(180deg, var(--bg-1) 0%, var(--bg-0) 60%, #050609 100%);
    z-index:0;
  }

  /* drifting dawn fog — colour bleeds from the edges, centre stays dark for text */
  .zkm-fog{
    position:fixed;
    inset:0;
    z-index:1;
    pointer-events:none;
    overflow:hidden;
  }
  .zkm-glow{
    position:absolute;
    border-radius:50%;
    mix-blend-mode:screen;
    filter:blur(34px);
    will-change:transform;
  }
  .zkm-g1{ /* teal, top-left */
    top:-20%;left:-24%;width:82vw;height:52vh;
    background:radial-gradient(circle at center, rgba(134,183,173,0.55), transparent 66%);
    opacity:0.58;
    animation:zkmFog1 54s ease-in-out infinite alternate;
  }
  .zkm-g2{ /* violet, top-right */
    top:-14%;right:-26%;width:78vw;height:50vh;
    background:radial-gradient(circle at center, rgba(182,164,214,0.50), transparent 66%);
    opacity:0.56;
    animation:zkmFog2 63s ease-in-out infinite alternate;
  }
  .zkm-g3{ /* amber-gold, lower-left */
    bottom:-22%;left:-22%;width:80vw;height:54vh;
    background:radial-gradient(circle at center, rgba(231,190,138,0.50), transparent 66%);
    opacity:0.48;
    animation:zkmFog3 58s ease-in-out infinite alternate;
  }
  .zkm-g4{ /* rose, lower-right */
    bottom:-18%;right:-24%;width:78vw;height:52vh;
    background:radial-gradient(circle at center, rgba(230,166,166,0.50), transparent 66%);
    opacity:0.50;
    animation:zkmFog4 49s ease-in-out infinite alternate;
  }
  .zkm-g5{ /* pale gold, faint horizon at the very bottom */
    bottom:-30%;left:50%;width:120vw;height:46vh;transform:translateX(-50%);
    background:radial-gradient(circle at center, rgba(236,220,166,0.40), transparent 64%);
    opacity:0.42;
    animation:zkmFog5 70s ease-in-out infinite alternate;
  }
  @keyframes zkmFog1{from{transform:translate(0,0) scale(1);}to{transform:translate(5%,4%) scale(1.12);}}
  @keyframes zkmFog2{from{transform:translate(0,0) scale(1.05);}to{transform:translate(-4%,5%) scale(1);}}
  @keyframes zkmFog3{from{transform:translate(0,0) scale(1);}to{transform:translate(4%,-5%) scale(1.1);}}
  @keyframes zkmFog4{from{transform:translate(0,0) scale(1.08);}to{transform:translate(-5%,-3%) scale(1);}}
  @keyframes zkmFog5{from{transform:translateX(-50%) scale(1);}to{transform:translateX(-46%) scale(1.07);}}

  /* very fine grain so it is never a flat field */
  .zkm-grain{
    position:fixed;
    inset:0;
    z-index:2;
    pointer-events:none;
    opacity:0.05;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* constellation lives behind the words */
  .zkm-stars{
    position:fixed;
    inset:0;
    z-index:3;
    pointer-events:none;
  }
  .zkm-star{
    position:absolute;
    border-radius:50%;
    will-change:opacity,transform;
    animation:zkmGlimmer var(--dur,5s) ease-in-out var(--delay,0s) infinite;
  }
  @keyframes zkmGlimmer{
    0%,100%{opacity:var(--lo,0.18);transform:scale(0.9);}
    50%{opacity:var(--hi,0.85);transform:scale(1);}
  }

  /* ---- layout ---- */
  .zkm-page{
    position:relative;
    z-index:4;
    min-height:100svh;
    max-width:430px;
    margin-inline:auto;
    padding:clamp(28px,5svh,54px) 30px clamp(26px,4.5svh,46px);
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:clamp(34px,6svh,52px);
    text-align:center;
    opacity:0;
    animation:zkmRise 2s cubic-bezier(.22,.61,.36,1) 0.15s forwards;
  }
  @keyframes zkmRise{
    from{opacity:0;transform:translateY(10px);}
    to{opacity:1;transform:translateY(0);}
  }

  /* ---- wordmark ---- */
  .zkm-mark-wrap{display:flex;flex-direction:column;align-items:center;gap:15px;}
  .zkm-wordmark{
    font-weight:500;
    font-size:clamp(46px,13.5vw,58px);
    line-height:1;
    letter-spacing:0.12em;
    text-indent:0.12em;
    color:var(--ink);
  }
  .zkm-rule{
    width:46px;
    height:1px;
    border:0;
    background:linear-gradient(90deg,
      transparent,
      rgba(236,220,166,0.55) 30%,
      rgba(230,166,166,0.55) 70%,
      transparent);
    opacity:0.8;
  }
  .zkm-kicker{
    font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
    font-size:10.5px;
    font-weight:500;
    letter-spacing:0.24em;
    text-indent:0.24em;
    text-transform:uppercase;
    color:var(--ink-faint);
  }

  /* ---- copy ---- */
  .zkm-copy{
    max-width:30ch;
    font-size:clamp(17px,4.6vw,19px);
    line-height:1.72;
    color:var(--ink-soft);
    font-weight:400;
  }
  .zkm-accent{
    color:var(--rose);
    font-style:italic;
    font-weight:500;
  }

  /* ---- call to action ---- */
  .zkm-enter-wrap{display:flex;flex-direction:column;align-items:center;gap:16px;}
  .zkm-enter{
    appearance:none;
    cursor:pointer;
    font-family:inherit;
    font-size:21px;
    font-weight:500;
    letter-spacing:0.26em;
    text-indent:0.26em;
    color:var(--ink);
    background:rgba(231,190,138,0.04);
    border:1px solid rgba(233,230,223,0.20);
    border-radius:999px;
    padding:15px 46px;
    box-shadow:
      0 0 0 0 rgba(231,190,138,0),
      0 8px 40px -16px rgba(231,190,138,0.30);
    transition:border-color .6s ease, box-shadow .6s ease, background .6s ease, transform .25s ease;
  }
  .zkm-enter:hover,.zkm-enter:focus-visible{
    outline:none;
    border-color:rgba(231,190,138,0.5);
    background:rgba(231,190,138,0.07);
    box-shadow:
      0 0 34px -6px rgba(231,190,138,0.28),
      0 0 60px -10px rgba(230,166,166,0.18);
  }
  .zkm-enter:active{transform:scale(0.985);}

  /* ─── Entry transition ──────────────────────────────────────────
     Grafted from the desktop landing so the prayer feels identical on both.
     On Enter the scene fades out and the Bismillah is revealed for a beat. */
  .zkm-root.zkm-entering .zkm-sky,
  .zkm-root.zkm-entering .zkm-fog,
  .zkm-root.zkm-entering .zkm-grain,
  .zkm-root.zkm-entering .zkm-stars,
  .zkm-root.zkm-entering .zkm-page{
    opacity:0;
    transition:opacity 1.1s ease;
    pointer-events:none;
  }
  .zkm-veil{
    position:fixed;
    inset:0;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:0 30px;
    z-index:50;
    opacity:0;
    pointer-events:none;
    text-align:center;
  }
  .zkm-root.zkm-entering .zkm-veil{
    opacity:1;
    pointer-events:auto;
    transition:opacity 0.6s ease 0.4s;
  }
  .zkm-veil-content{
    font-family:'Amiri Quran','Amiri',serif;
    color:var(--gold);
    font-size:clamp(26px,7.5vw,46px);
    direction:rtl;
    line-height:1.7;
    text-shadow:0 0 50px rgba(236,220,166,0.5), 0 0 24px rgba(231,190,138,0.4);
    opacity:0;
    transform:translateY(10px);
  }
  /* Animations fire only once .zkm-entering is added (on Enter click), so the
     Bismillah isn't already faded out by the time it's revealed. */
  .zkm-root.zkm-entering .zkm-veil-content{
    animation:
      zkmVeilIn  1.7s cubic-bezier(0.16,1,0.3,1) 0.7s forwards,
      zkmVeilOut 0.7s ease 2.8s forwards;
  }
  @keyframes zkmVeilIn{
    to{opacity:1;transform:translateY(0);}
  }
  @keyframes zkmVeilOut{
    from{opacity:1;transform:translateY(0);}
    to{opacity:0;transform:translateY(-8px);}
  }

  @media (prefers-reduced-motion: reduce){
    .zkm-page{animation:none;opacity:1;transform:none;}
    .zkm-star{animation:none;opacity:0.5;}
    .zkm-glow{animation:none;}
  }
`;

export default function ZikirLandingMobile({ onEnter }) {
  const [entered, setEntered] = useState(false);
  const stars = useMemo(makeStars, []);

  const handleEnter = () => {
    setEntered(true);
    if (onEnter) {
      // Production path — parent unmounts us once the prayer has played.
      setTimeout(onEnter, ENTRY_DURATION_MS);
    } else {
      // Standalone preview path — replay after a longer beat.
      setTimeout(() => setEntered(false), 5000);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className={`zkm-root ${entered ? "zkm-entering" : ""}`}>
        <div className="zkm-sky" aria-hidden="true" />

        <div className="zkm-fog" aria-hidden="true">
          <span className="zkm-glow zkm-g1" />
          <span className="zkm-glow zkm-g2" />
          <span className="zkm-glow zkm-g3" />
          <span className="zkm-glow zkm-g4" />
          <span className="zkm-glow zkm-g5" />
        </div>

        <div className="zkm-grain" aria-hidden="true" />

        <div className="zkm-stars" aria-hidden="true">
          {stars.map((s, i) => (
            <span
              key={i}
              className="zkm-star"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                background: s.color,
                boxShadow: `0 0 ${(s.size * 2.4).toFixed(1)}px ${s.color}`,
                "--dur": `${s.dur}s`,
                "--delay": `${s.delay}s`,
                "--hi": s.hi,
                "--lo": s.lo,
              }}
            />
          ))}
        </div>

        <main className="zkm-page" data-screen-label="Zikir landing">
          <header className="zkm-mark-wrap">
            <h1 className="zkm-wordmark">Zikir</h1>
            <hr className="zkm-rule" />
            <p className="zkm-kicker">Duas from the Quran and Sunnah</p>
          </header>

          <div className="zkm-enter-wrap">
            <button className="zkm-enter" type="button" onClick={handleEnter}>
              Enter
            </button>
          </div>

          <p className="zkm-copy">
            What is Zikir but the heart’s cry to its{" "}
            <span className="zkm-accent">Belonging</span>, a sacred conversation
            that never ends? It is the gathering of travelers at the wellspring,
            drinking deep so they might find the strength to walk through the
            fires of this world unbroken.
          </p>
        </main>

        <div className="zkm-veil" aria-hidden={!entered}>
          <div className="zkm-veil-content">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </div>
        </div>
      </div>
    </>
  );
}
