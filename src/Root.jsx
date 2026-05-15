import { useState, useEffect } from "react";
import App from "./App.jsx";
import ZikirLanding from "./landing/ZikirLanding.jsx";

// ─── Root ────────────────────────────────────────────────────────────────────
// The single point of integration between the landing sequence and the app.
//
// Flow:
//   1. Mounts with phase = "landing". Shows the landing.
//   2. User clicks Enter. The landing runs its full entry sequence (~3.5s),
//      then calls onEnter.
//   3. We flip phase to "app". Landing unmounts. App mounts and fades in.
//
// To REMOVE the landing entirely at a later stage:
//   1. Delete `src/landing/`
//   2. Delete this file (`src/Root.jsx`)
//   3. In `src/main.jsx`, replace `import Root` with `import App` and render
//      <App /> instead of <Root />.
// The rest of the app is untouched.

export default function Root() {
  const [phase, setPhase] = useState("landing");

  if (phase === "landing") {
    return <ZikirLanding onEnter={() => setPhase("app")} />;
  }
  return <AppFadeIn />;
}

// Brief opacity fade-in on the app's first render, so the transition from
// the landing's faded-to-dark final frame into the dashboard feels continuous
// rather than a hard cut. App.jsx itself is untouched.
function AppFadeIn() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div style={{
      opacity: shown ? 1 : 0,
      transition: "opacity 0.7s ease",
    }}>
      <App />
    </div>
  );
}
