const PANELS = 40;
const RADIUS = 27;
const HEIGHT = 104;
const PANEL_WIDTH = 8;

export default function Capsule3D({ className = "" }: { className?: string }) {
  return (
    <div className={`capsule-stage ${className}`} aria-hidden>
      <div className="capsule-float">
        <div className="capsule-tilt">
          <div className="capsule-spin" style={{ height: HEIGHT }}>
            {Array.from({ length: PANELS }).map((_, index) => (
              <span
                key={index}
                className="capsule-panel"
                style={{
                  width: PANEL_WIDTH,
                  height: HEIGHT,
                  marginLeft: -PANEL_WIDTH / 2,
                  transform: `rotateY(${(index * 360) / PANELS}deg) translateZ(${RADIUS}px)`,
                }}
              />
            ))}
          </div>
          <span className="capsule-shade" />
          <span className="capsule-gloss" />
          <span className="capsule-seam" />
        </div>
      </div>
      <span className="capsule-shadow" />
    </div>
  );
}
