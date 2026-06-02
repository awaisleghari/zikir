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
//   1. Mounts with phase = "landing". Picks a landing by viewport width:
//      narrow screens get ZikirLandingMobile (the dawn-sky design); wider
//      screens get ZikirLanding (the interactive 99-Names constellation).
//   2. User clicks Enter. The landing runs its full entry sequence (~3.5s,
//      identical timing on both), then calls onEnter.
//   3. We flip phase to "app". Landing unmounts. App mounts and fades in,
//      wrapped in MantineProvider (the landings are bespoke and stay outside
//      it, so Mantine's theme/context only governs the dashboard).
//
// The landing choice is made once, at initial mount, and deliberately does NOT
// react to resize. A landing isn't a layout a user resizes through in practice,
// and freezing the choice keeps the ~3.5s Enter→Bismillah→app sequence from
// being torn down mid-animation if the viewport crosses the breakpoint (e.g. a
// phone rotating to landscape). Reloading picks up the new width.
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

export default function Root() {
  const [phase, setPhase] = useState("landing");
  const [isMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < MOBILE_MAX_WIDTH : false
  );

  if (phase === "landing") {
    const Landing = isMobile ? ZikirLandingMobile : ZikirLanding;
    return <Landing onEnter={() => setPhase("app")} />;
  }
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <AppFadeIn />
    </MantineProvider>
  );
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
