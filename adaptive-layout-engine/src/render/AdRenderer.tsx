import type {
  AdSpec,
  ResolvedElement,
  SurfaceProfile
} from "../types/layout";

interface Props {
  ad: AdSpec;
  layout: ResolvedElement[];
  surface: SurfaceProfile;
}

export default function AdRenderer({
  ad,
  layout,
  surface
}: Props) {

  return (
    <div
      style={{
        position: "relative",
        width: surface.width,
        height: surface.height,
        background: "#fff",
        border: "1px solid #222",
        overflow: "hidden",
        boxSizing: "border-box"
      }}
    >
      {layout
        .filter((item) => item.visible)
        .map((item) => {

          const source =
            ad.elements.find(
              (element) =>
                element.id === item.id
            );

          if (!source) return null;

          return (
            <div
              key={item.id}
              style={{
                position: "absolute",

                left: item.x,
                top: item.y,

                width: item.width,
                height: item.height,

                boxSizing: "border-box",

                border: "1px solid #333",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                fontSize: item.fontSize,

                fontWeight:
                  source.role === "primary" ||
                  source.role === "action"
                    ? 700
                    : 500,

                background:
                  source.type === "image"
                    ? "#ddd"
                    : "#f5f5f5",

                borderRadius:
                  source.type === "button"
                    ? 8
                    : 0
              }}
            >
              {source.content}
            </div>
          );
        })}
    </div>
  );
}