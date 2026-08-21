"use client";

import { useState, type CSSProperties } from "react";

const PANELS = 40;
const RADIUS = 27;
const HEIGHT = 104;
const HALF_HEIGHT = 53;
const PANEL_WIDTH = 8;

const GRAINS = [
  { gx: "-16px", gy: "-6px", gz: "18px" },
  { gx: "14px", gy: "-12px", gz: "10px" },
  { gx: "-6px", gy: "14px", gz: "24px" },
  { gx: "18px", gy: "10px", gz: "-6px" },
  { gx: "-20px", gy: "8px", gz: "-2px" },
  { gx: "4px", gy: "-20px", gz: "-10px" },
  { gx: "24px", gy: "-2px", gz: "20px" },
];

function Barrel({ half }: { half: "top" | "bottom" }) {
  return (
    <div className={`capsule-half capsule-half-${half}`}>
      {Array.from({ length: PANELS }).map((_, index) => (
        <span
          key={index}
          className={`capsule-panel capsule-panel-${half}`}
          style={{
            width: PANEL_WIDTH,
            height: HALF_HEIGHT,
            marginLeft: -PANEL_WIDTH / 2,
            transform: `rotateY(${(index * 360) / PANELS}deg) translateZ(${RADIUS}px)`,
          }}
        />
      ))}
    </div>
  );
}

export default function Capsule3D({ className = "" }: { className?: string }) {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const open = pinned || hovered;

  const toggle = () => setPinned((current) => !current);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={open ? "Close the capsule" : "Open the capsule"}
      aria-pressed={pinned}
      className={`capsule-stage ${open ? "capsule-open" : ""} ${className}`}
      onClick={toggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="capsule-float">
        <div className="capsule-tilt">
          <div className="capsule-spin" style={{ height: HEIGHT }}>
            <Barrel half="top" />
            <Barrel half="bottom" />
          </div>
          <span className="capsule-shell capsule-shell-top">
            <span className="capsule-shade" />
            <span className="capsule-gloss" />
          </span>
          <span className="capsule-shell capsule-shell-bottom">
            <span className="capsule-shade" />
            <span className="capsule-gloss" />
          </span>
          <span className="capsule-seam" />
          <span className="capsule-glow" />
          {GRAINS.map((grain, index) => (
            <span
              key={index}
              className="capsule-grain"
              style={
                {
                  "--gx": grain.gx,
                  "--gy": grain.gy,
                  "--gz": grain.gz,
                  transitionDelay: `${index * 35}ms`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>
      <span className="capsule-hint">Hover to open</span>
      <span className="capsule-shadow" />
    </div>
  );
}
