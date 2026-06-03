import { useState, useEffect } from "react";
import { MantineProvider } from "@mantine/core";
import App from "./App.jsx";
import { theme } from "./theme.js";
import ZikirLanding from "./landing/ZikirLanding.jsx";
import ZikirLandingMobile from "./landing/ZikirLandingMobile.jsx";

// ─── Root ────────────────────────────────────────────────────────────────────
// The single point of integration between the landing sequence and the app.
//
// Flow:
//   1. On a first visit, mounts with phase = "landing" and picks a landing by
//      viewport width: narrow screens get ZikirLandingMobile (the dawn-sky
//      design); wider screens get ZikirLanding (the 99-Names constellation).
//   2. User clicks Enter. The landing runs its full entry sequence (~3.5s),
//      then calls onEnter, which records that the user has entered (localStorage)
//      and flips phase to "app". App mounts inside MantineProvider and fades in.
//   3. On later loads/refreshes, the recorded flag makes Root open straight to
//      the app, so a refresh keeps you where you were instead of replaying the
//      landing. App.jsx separately restores the section and open dua.
//   4. Clicking the "Zikir" wordmark inside the app calls back here to return to
//      the landing (and clears the flag, so a refresh on the landing stays on
//      the landing until the user enters again).
//
// The landing choice is made once, at initial mount, and deliberately does NOT
// react to resize. A landing isn't a layout a user resizes through in practice,
// and freezing the choice keeps the entry sequence from being torn down
// mid-animation if the viewport crosses the breakpoint. Reloading picks up the
// new width.
//
// To REMOVE the landing entirely at a later stage:
//   1. Delete `src/landing/`
//   2. Delete this file (`src/Root.jsx`)
//   3. In `src/main.jsx`, render <App /> inside <MantineProvider> instead of
//      <Root />.
// The rest of the app is untouched.

// Phones get the mobile landing; tablets and up keep the constellation. The
// constellation reads well down to tablet widths, so the boundary sits below
// the project's 900px desktop breakpoint. Adjust here if the cut should move.
const MOBILE_MAX_WIDTH = 768;
const ENTERED_KEY = "zikir.entered";

export default function Root() {
  const [phase, setPhase] = useState(() => {
    try {
      return window.localStorage.getItem(ENTERED_KEY) === "1" ? "app" : "landing";
    } catch {
      return "landing";
    }
  });
  const [isMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < MOBILE_MAX_WIDTH : false
  );

  const enterApp = () => {
    try { window.localStorage.setItem(ENTERED_KEY, "1"); } catch {}
    setPhase("app");
  };
  const exitToLanding = () => {
    try { window.localStorage.removeItem(ENTERED_KEY); } catch {}
    setPhase("landing");
  };

  if (phase === "landing") {
    const Landing = isMobile ? ZikirLandingMobile : ZikirLanding;
    return <Landing onEnter={enterApp} />;
  }
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <AppFadeIn onExitToLanding={exitToLanding} />
    </MantineProvider>
  );
}

// Brief opacity fade-in on the app's first render, so the transition from
// the landing's faded-to-dark final frame into the dashboard feels continuous
// rather than a hard cut. App.jsx itself is untouched.
function AppFadeIn({ onExitToLanding }) {
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
      <App onExitToLanding={onExitToLanding} />
    </div>
  );
}
