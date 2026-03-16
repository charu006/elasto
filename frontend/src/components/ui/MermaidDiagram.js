import { useEffect, useRef } from "react";
import mermaid from "mermaid";

export default function MermaidDiagram({ chart }) {
  const ref = useRef(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true });

    if (ref.current) {
      mermaid.render("mermaid-diagram", chart, (svgCode) => {
        ref.current.innerHTML = svgCode;
      });
    }
  }, [chart]);

  return <div ref={ref} />;
}