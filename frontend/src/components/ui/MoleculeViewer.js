import React, { useEffect, useRef } from "react";
import * as $3Dmol from "3dmol";

const MoleculeViewer = ({ pdbUrl }) => {
  const viewerRef = useRef(null);

  useEffect(() => {
    const viewer = $3Dmol.createViewer(viewerRef.current, {
      backgroundColor: "white",
    });

    fetch(pdbUrl)
      .then((res) => res.text())
      .then((data) => {
        viewer.addModel(data, "pdb");
        viewer.setStyle({}, { stick: {} });
        viewer.zoomTo();
        viewer.render();
      });
  }, [pdbUrl]);

  return (
    <div
      ref={viewerRef}
      style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}
    />
  );
};

export default MoleculeViewer;