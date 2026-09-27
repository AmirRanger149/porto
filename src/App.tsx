import { useState } from "react";
import { BootScreen } from "./components/BootScreen";
import { MatrixRain } from "./components/MatrixRain";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Ticker } from "./components/Ticker";
import { About } from "./components/About";
import { Projects } from "./components/Projects";
import { Skills } from "./components/Skills";
import { Terminal } from "./components/Terminal";
import { Uplink } from "./components/Uplink";
import { Logs } from "./components/Logs";
import { PostReader } from "./components/PostReader";

export default function App() {
  const [booted, setBooted] = useState(false);

  return (
    <div id="top" className="relative min-h-screen">
      {/* ambient layers */}
      <MatrixRain />
      <div className="bg-grid" aria-hidden="true" />

      <Header />

      <main className="relative z-10">
        <Hero active={booted} />
        <Ticker />
        <About />
        <Projects />
        <Skills />
        <Logs />
        <Terminal />
        <Uplink />
      </main>

      <PostReader />

      {/* CRT overlays */}
      <div className="crt-scan" aria-hidden="true" />
      <div className="crt-vignette" aria-hidden="true" />
      <div className="crt-sweep" aria-hidden="true" />

      {!booted && <BootScreen onDone={() => setBooted(true)} />}
    </div>
  );
}
