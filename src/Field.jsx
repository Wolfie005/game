import { useEffect, useState } from "react";
import { mapScaleFactor } from "./App.jsx";

export function Field() {
  const [field, setField] = useState([]);

  useEffect(() => {
    const arr = [];
    for (let i = 0; i < 200; i++) {
      arr.push([
        (Math.random() * 8).toFixed(0) * 64,
        (Math.random() * 8).toFixed(0) * 64,
        Math.random() > 0.5,
        (Math.random() * (window.innerWidth * mapScaleFactor)).toFixed(0),
        (Math.random() * (window.innerHeight * mapScaleFactor)).toFixed(0),
      ]);
    }
    setField(arr);
  }, []);

  return (
    <>
      {field.map((item, i) => (
        <div
          key={`random-tile${item[0]}${item[1]}${i}`}
          className="grass-grid-item"
          style={{
            backgroundPosition: `${item[0]}px ${item[1]}px`,
            left: item[2] ? "-" : "" + item[3] + "px",
            top: item[2] ? "-" : "" + item[4] + "px",
          }}
        />
      ))}
    </>
  );
}
