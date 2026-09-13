import { useState } from "react";

import { adSpec } from "./data/adSpec";
import { surfaces } from "./data/surfaces";
import { resolve } from "./resolver/resolver";
import AdRenderer from "./render/AdRenderer";

type SurfaceName = keyof typeof surfaces;

function App() {
  const [selected, setSelected] =
    useState<SurfaceName>("mobilePortrait");

  const surface = surfaces[selected];

  const result = resolve(adSpec, surface);

  const visibleCount = result.layout.filter(
    (item) => item.visible
  ).length;

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Adaptive Layout Engine</h1>

      <p>
        One ad specification, multiple surfaces,
        constraint-based resolution.
      </p>

      {/* Surface selector */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "25px",
          marginBottom: "25px",
        }}
      >
        {(Object.keys(surfaces) as SurfaceName[]).map(
          (name) => (
            <button
              key={name}
              onClick={() => setSelected(name)}
              style={{
                padding: "12px 18px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                background:
                  selected === name ? "#111" : "#fff",
                color:
                  selected === name ? "#fff" : "#111",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {name === "mobilePortrait"
                ? "Mobile Portrait"
                : name === "mobileLandscape"
                ? "Mobile Landscape"
                : name === "broadcast"
                ? "Broadcast Lower Third"
                : "Square Kiosk"}
            </button>
          )
        )}
      </div>

      {/* Surface information */}
      <div style={{ marginBottom: "20px" }}>
        <div>
          <strong>Surface:</strong>{" "}
          {selected === "mobilePortrait"
            ? "Mobile Portrait"
            : selected === "mobileLandscape"
            ? "Mobile Landscape"
            : selected === "broadcast"
            ? "Broadcast Lower Third"
            : "Square Kiosk"}
        </div>

        <div>
          <strong>Size:</strong>{" "}
          {surface.width} × {surface.height}
        </div>

        <div>
          <strong>Resolved:</strong>{" "}
          {visibleCount}/{adSpec.elements.length}
        </div>
      </div>

      {/* Resolved layout */}
      <AdRenderer
        ad={adSpec}
        layout={result.layout}
        surface={surface}
      />

      {/* Errors */}
      {!result.success && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            border: "1px solid #e0aaaa",
            borderRadius: "10px",
          }}
        >
          <h3>Resolution Errors</h3>

          {result.errors.map((error, index) => (
            <p key={index}>
              <strong>
                {error.elementId ?? "Surface"}:
              </strong>{" "}
              {error.message}
            </p>
          ))}
        </div>
      )}

      {/* Warnings */}
      {result.success &&
        result.warnings.length > 0 && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "10px",
            }}
          >
            <h3>Layout Warnings</h3>

            {result.warnings.map(
              (warning, index) => (
                <p key={index}>{warning}</p>
              )
            )}
          </div>
        )}
    </main>
  );
}

export default App;