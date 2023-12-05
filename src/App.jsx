import "./App.css";
import { useEffect, useState } from "react";
import { Field } from "./Field.jsx";

export let mapScaleFactor = 0.6;
let sizeScalingx = (innerWidth / 2) * mapScaleFactor;
let sizeScalingy = (innerHeight / 2) * mapScaleFactor;

class Enemy {
  constructor(x, y, i) {
    this._id = i;
    this._x = x;
    this._y = y;
  }

  move(targetX, targetY, speed) {
    const deltaX = targetX - this._x;
    const deltaY = targetY - this._y;
    const distance = Math.hypot(deltaX, deltaY);
    const ratio = speed / distance;

    this._x += deltaX * ratio;
    this._y += deltaY * ratio;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get id() {
    return this._id;
  }
}

function App() {
  const [keys, setKeys] = useState([]);
  const [paused, setPaused] = useState(false);
  const [wave, setWave] = useState(1);
  const [enemies, setEnemies] = useState([]);
  const [position, setPosition] = useState({
    x: window.innerWidth - (innerWidth / 2 + sizeScalingx),
    y: window.innerHeight - (innerHeight / 2 + sizeScalingy),
  });

  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      setKeys((x) => {
        if (x.find((i) => i === e.key.toLowerCase())) return x;
        return [...x, e.key.toLowerCase()];
      });
    });
    document.addEventListener("keyup", (e) => {
      setKeys((x) => x.filter((i) => i !== e.key.toLowerCase()));
    });
  }, []);

  useEffect(() => {
    const int = setInterval(() => {
      let speedMultiplier = keys.includes("shift") ? 3 : 2;
      setPosition((prevState) => {
        const number1 =
          window.innerWidth -
          (innerWidth / 2 + sizeScalingx) +
          (innerWidth / 2) * mapScaleFactor;
        const number2 =
          window.innerWidth -
          (innerWidth / 2 + sizeScalingx) -
          (innerWidth / 2) * mapScaleFactor;
        const number3 =
          window.innerHeight -
          (innerHeight / 2 + sizeScalingy) +
          (innerHeight / 2) * mapScaleFactor;
        const number4 =
          window.innerHeight -
          (innerHeight / 2 + sizeScalingy) -
          (innerHeight / 2) * mapScaleFactor;
        let x;
        if (keys.includes("a") && prevState.x <= number1) {
          x = prevState.x + speedMultiplier;
        } else if (keys.includes("d") && prevState.x >= number2) {
          x = prevState.x - speedMultiplier;
        } else {
          x = prevState.x;
        }
        let y;
        if (keys.includes("w") && prevState.y <= number3) {
          y = prevState.y + speedMultiplier;
        } else if (keys.includes("s") && prevState.y >= number4) {
          y = prevState.y - speedMultiplier;
        } else {
          y = prevState.y;
        }
        return {
          x: x,
          y: y,
        };
      });

      if (enemies) {
        const targetX = position.x;
        const targetY = position.y;
        const enemySpeed = 3;

        for (let enemy of enemies) {
          enemy.move(targetX, targetY, enemySpeed);
        }
      }
    }, 10);
    return () => {
      clearInterval(int);
    };
  }, [keys, enemies, position]);

  useEffect(() => {
    console.log(enemies);
  }, [enemies]);

  useEffect(() => {
    if (paused) return;
    if (!keys.includes("k")) return;
    if (enemies.length < 10 * wave) {
      const y =
        Math.random() <= 0.5
          ? (Math.random() + 1) * window.innerHeight * mapScaleFactor
          : ((Math.random() + 1) * window.innerHeight) / mapScaleFactor;
      const x =
        Math.random() <= 0.5
          ? (Math.random() + 1) * window.innerWidth * mapScaleFactor
          : ((Math.random() + 1) * window.innerWidth) / mapScaleFactor;
      const newObj = new Enemy(x, y, enemies.length + 1);
      setEnemies((prev) => [...prev, newObj]);
    }
  }, [enemies.length, keys, paused, wave]);

  return (
    <>
      <div className={"play-grid"}>
        <div
          className={"play-area"}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        >
          <Field />
          {enemies.map((item, i) => (
            <div
              key={"enemy" + i}
              className={"enemy"}
              style={{
                transform: `translate(${item.x}px, ${item.y}px)`,
              }}
            >
              ({item.x.toFixed(0)}, {item.y.toFixed(0)})
            </div>
          ))}
        </div>

        <div
          className="player"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        ></div>

        <div
          className={"player"}
          style={{
            transform: `translate(${window.innerWidth / 2}px, ${
              window.innerHeight / 2
            }px)`,
          }}
        >
          ({position.x.toFixed(0)}, {position.y.toFixed(0)})
        </div>
      </div>
    </>
  );
}

export default App;
