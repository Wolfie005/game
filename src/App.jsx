import "./App.css";
import { useEffect, useState } from "react";
import { Field } from "./Field.jsx";

const bulletLife = 1000 * 0.7;
export let mapScaleFactor = 2;
let sizeScalingx = (innerWidth / 2) * mapScaleFactor;
let sizeScalingy = (innerHeight / 2) * mapScaleFactor;

class Enemy {
  constructor(x, y, i, h) {
    this._id = i;
    this._x = x;
    this._y = y;
    this._health = h;
  }

  is_alive() {
    return this._health > 0;
  }

  take_damage(dmg) {
    let newHealth = this._health - dmg;
    if (newHealth < 0) newHealth = 0;
    this._health = newHealth;
  }

  move(targetX, targetY, speed) {
    if (this._health === 0) return;
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

  get health() {
    return this._health;
  }
}

class Bullet {
  constructor(x, y, i, target_x, target_y, keycode, epx) {
    this._id = i;
    this._x = x;
    this._y = y;
    this._target_x = target_x;
    this._target_y = target_y;
    this.keycode = keycode;
    this.expiery = epx;
    this.toRemove = false;
  }

  is_marked_for_removal() {
    return this.toRemove;
  }

  get_damage() {
    if (this.toRemove) return 0;
    return 5;
  }

  move(targetX, targetY, speed, current_time) {
    if (this.toRemove) return;
    const deltaX = targetX - this._x;
    const deltaY = targetY - this._y;
    const distance = Math.hypot(deltaX, deltaY);
    const ratio = speed / distance;
    this._x += deltaX * ratio;
    this._y += deltaY * ratio;

    if (current_time > this.expiery) {
      this.toRemove = true;
    }
  }

  get id() {
    return this._id;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }
}

function App() {
  const [keys, setKeys] = useState([]);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [invicible, setinvicible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [start, setStart] = useState(true);
  const [wave, setWave] = useState(0);
  const [enemies, setEnemies] = useState([]);
  const [bullet, setBullet] = useState([]);
  const [position, setPosition] = useState({
    x: window.innerWidth - (innerWidth / 2 + sizeScalingx),
    y: window.innerHeight - (innerHeight / 2 + sizeScalingy),
  });
  const bulletx = sizeScalingx / mapScaleFactor - position.x + 12.5;
  const bullety = sizeScalingy / mapScaleFactor - position.y + 12.5;

  useEffect(() => {
    if (!invicible) return;
    const time = setTimeout(() => {
      setinvicible(false);
    }, 1000);
    return () => {
      clearTimeout(time);
    };
  }, [invicible]);

  function bulletshoot(keycode) {
    console.log(bullet.length);
    if (bullet.length > 5) {
      setBullet((prev) => {
        const newArr = prev;
        newArr.shift();
        return newArr;
      });
    }
    const currentTime = new Date().getTime();
    const newbull = new Bullet(
      bulletx,
      bullety,
      currentTime,
      0,
      0,
      keycode,
      currentTime + bulletLife,
    );
    setBullet((prev) => [...prev, newbull]);
  }

  useEffect(() => {
    console.log(keys);
    if (keys.includes("arrowright")) {
      bulletshoot(1);
    } else if (keys.includes("arrowleft")) {
      bulletshoot(2);
    } else if (keys.includes("arrowdown")) {
      bulletshoot(3);
    } else if (keys.includes("arrowup")) {
      bulletshoot(4);
    }
  }, [keys]);

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
      if (paused) return;
      if (start) return;
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

        if (keys.includes("escape")) {
          setPaused(true);
        }

        const enemyFilter = enemies.filter((enemyItem) => enemyItem.is_alive());
        const bulletFilter = bullet.filter(
          (item) => !item.is_marked_for_removal(),
        );
        for (let bulletElement of bulletFilter) {
          const bulletPos = {
            x: bulletElement.x,
            y: bulletElement.y,
            width: 0,
            height: 0,
          };

          for (let enemy of enemyFilter) {
            const enemyPos = {
              x: enemy.x,
              y: enemy.y,
              height: 50,
              width: 50,
            };

            const isColliding =
              bulletPos.x < enemyPos.x + enemyPos.width &&
              bulletPos.x + bulletPos.width > enemyPos.x &&
              bulletPos.y < enemyPos.y + enemyPos.height &&
              bulletPos.y + bulletPos.height > enemyPos.y;

            if (isColliding) {
              enemy.take_damage(bulletElement.get_damage());
            }
          }
        }

        return {
          x: x,
          y: y,
        };
      });

      if (bullet) {
        const bulletSpeed = 5;
        let bulletdirectionx;
        let bulletdirectiony;
        const currentTime = new Date().getTime();

        for (let bulletItem of bullet) {
          if (bulletItem.keycode === 1) {
            bulletdirectionx = bulletx + 300;
            bulletdirectiony = bullety;
          } else if (bulletItem.keycode === 2) {
            bulletdirectionx = bulletx - 300;
            bulletdirectiony = bullety;
          } else if (bulletItem.keycode === 3) {
            bulletdirectionx = bulletx;
            bulletdirectiony = bullety + 300;
          } else if (bulletItem.keycode === 4) {
            bulletdirectionx = bulletx;
            bulletdirectiony = bullety - 300;
          }
          const targetX = bulletdirectionx;
          const targetY = bulletdirectiony;
          bulletItem.move(targetX, targetY, bulletSpeed, currentTime);
        }
      }

      let dx = sizeScalingx / mapScaleFactor - position.x - 12.5;
      let dy = sizeScalingy / mapScaleFactor - position.y - 12.5;

      if (enemies) {
        const targetX = dx;
        const targetY = dy;
        const enemySpeed = 1;

        const alive = enemies.filter((x) => x.is_alive());
        for (let enemy of alive) {
          enemy.move(targetX, targetY, enemySpeed);
          if (
            !invicible &&
            Math.abs(targetX - enemy.x) < 30 &&
            Math.abs(targetY - enemy.y) < 30
          ) {
            setPlayerHealth((prevState) => {
              if (prevState - 10 <= 0) setStart(true);
              return prevState - 10;
            });
            setinvicible(true);
          }
        }
      }
    }, 10);
    return () => {
      clearInterval(int);
    };
  }, [bullet, keys, enemies, position]);

  function enemywave(wave) {
    const wantedEnemies = wave * 10;

    for (let i = 0; i < wantedEnemies; i++) {
      const spawnOnTopOrBottom = Math.random() < 0.5;
      const differencex =
        window.innerWidth - (innerWidth / 2 + sizeScalingx) + position.x;
      const differencey =
        window.innerHeight - (innerHeight / 2 + sizeScalingy) + position.y;

      let x, y;

      if (spawnOnTopOrBottom) {
        x = Math.random() * innerWidth + innerWidth / 2;
        y =
          Math.random() < 0.5
            ? innerHeight - (differencey + innerHeight / 2)
            : innerHeight + (differencey + innerHeight / 2);
      } else {
        x =
          Math.random() < 0.5
            ? innerWidth - (differencex + innerWidth / 2)
            : innerWidth + (differencex + innerWidth / 2);
        y = Math.random() * innerHeight + innerHeight / 2;
      }

      const newObj = new Enemy(x, y, new Date().getTime(), 100);
      setEnemies((prev) => [...prev, newObj]);
    }
  }

  useEffect(() => {
    if (paused) return;
    if (start) return;
    if (enemies.map((item) => !item.is_alive()).every((item) => item)) {
      setWave((prev) => {
        const newWave = prev + 1;
        setEnemies([]);
        enemywave(newWave);
        return newWave;
      });
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
              id={"enemy-" + item.id}
              className={"enemy"}
              style={{
                transform: `translate(${item.x}px, ${item.y}px)`,
              }}
            >
              <div className={"health-bar-container"}>
                <div
                  className="health-bar"
                  style={{
                    width: `${item.health}px`,
                  }}
                />
              </div>
            </div>
          ))}
          {bullet.map((item) => (
            <div
              key={"bullet" + item.id}
              id={"bullet-" + item.id}
              className={"bullet"}
              style={{
                transform: `translate(${item.x}px, ${item.y}px)`,
              }}
            />
          ))}
        </div>
        {start && (
          <div className={"start-menu"}>
            <div className={"Game-name"}>
              <h1>RPGgame</h1>
            </div>
            <div className={"start-buttons"}>
              <button
                onClick={() => {
                  setEnemies([]);
                  setWave(0);
                  setPlayerHealth(100);
                  setStart(false);
                  setPosition({
                    x: window.innerWidth - (innerWidth / 2 + sizeScalingx),
                    y: window.innerHeight - (innerHeight / 2 + sizeScalingy),
                  });
                }}
              >
                Start
              </button>
              <button
                onClick={() => {
                  window.location = "https://google.com";
                }}
              >
                Exit
              </button>
            </div>
          </div>
        )}
        {paused && (
          <div className={"pause-menu"}>
            <div className={"Game-name"}>
              <h1>RPGgame</h1>
            </div>
            <div className={"pause-buttons"}>
              <button onClick={() => setPaused(false)}>Unpause</button>
              <button
                onClick={() => {
                  setPaused(false);
                  setStart(true);
                }}
              >
                Restart
              </button>
            </div>
          </div>
        )}
        <div
          className={"player"}
          style={{
            transform: `translate(${window.innerWidth / 2}px, ${
              window.innerHeight / 2
            }px)`,
            background: invicible ? "blue" : "initial",
          }}
        ></div>
      </div>
    </>
  );
}

export default App;
