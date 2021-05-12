import { getMousePosElem } from "./helpers.js";
import { Vector, Entidade } from "./classes.js";
import { startingMap, links } from "./data.js";

const canvas = document.getElementById("canvas");
/** @type {CanvasRenderingContext2D} */ const ctx = canvas.getContext("2d");

const metodoProcuraList = document.getElementById("metodoProcuraList");
const resetButton = document.getElementById("resetButton");
const procuraButton = document.getElementById("procuraButton");
const switchInput = document.getElementById("switchInput");
const width = Math.min(window.innerWidth, window.innerHeight) * 1.2;
const height = Math.min(window.innerWidth, window.innerHeight) / 1.5;

const session = pl.create();

Entidade.size = width / 50;
let entidades = startingMap(width, height);
let currentSelectedKey, currentSolution;

document.addEventListener("keydown", (evt) => {
  if (evt.key === "f") {
    console.log(currentSelectedKey, currentSolution);
  }
});

function setup() {
  canvas.width = width;
  canvas.height = height;
  ctx.strokeStyle = ctx.fillStyle = "#ffffff";
  ctx.font = `${Entidade.size}px Consolas`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 3;

  session.consult(":-use_module(library(lists)).");
  session.consult("../prolog/breadthfirst.pl");
  session.consult("../prolog/depthfirst.pl");
  session.consult("../prolog/search.pl");
  session.consult("../prolog/norte.pl");

  procuraButton.addEventListener("click", (evt) => {
    const t0 = performance.now();
    if (entidades.has(currentSelectedKey)) {
      session.query(`retractall(road(_,_,_)).`);
      session.answer();
      for (const link of links) {
        session.query(`assertz(road(${link.a},${link.b},${!switchInput.checked ? link.weight : parseFloat(entidades.get(link.a).pos.distance(entidades.get(link.b).pos) / 100).toFixed(1)})).`);
        session.answer();
        session.query(`assertz(road(${link.b},${link.a},${!switchInput.checked ? link.weight : parseFloat(entidades.get(link.a).pos.distance(entidades.get(link.b).pos) / 100).toFixed(1)})).`);
        session.answer();
      }

      session.query(`retractall(goal(_)).`);
      session.answer();
      session.query(`retractall(lucro(_,_)).`);
      session.answer();

      session.query(`assertz(goal(${currentSelectedKey})).`);
      session.answer();
      session.query(`assertz(lucro(${currentSelectedKey},${entidades.get(currentSelectedKey).lucro})).`);
      session.answer();

      session.query(`search(${metodoProcuraList.value},Par,S),length(S,N),N1 is N-1,eval(S,D), D1 is D + 1,lucro(${currentSelectedKey},L).`);
      session.answer({
        error: function (err) {
          console.log(err);
        },
        fail: function (err) {
          console.log(false);
        },
        success: function (answer) {
          currentSolution = {
            path: answer
              .lookup("S")
              .toString()
              .replace(/[\[\]']+/g, "")
              .split(","),
            time: answer.lookup("D1").value,
            steps: answer.lookup("N1").value,
            profit: answer.lookup("L").value,
            running_time: performance.now() - t0,
          };
          let x = currentSolution.path.slice();
          for (const link of links) {
            link.inSolution = false;
          }
          for (let i = 0; i < x.length - 1; i++) {
            for (const link of links) {
              if ((link.a === x[i] && link.b === x[i + 1]) || (link.b === x[i] && link.a === x[i + 1])) {
                link.inSolution = true;
                break;
              }
            }
          }
          console.log(currentSolution);
        },
      });
    }
  });

  canvas.addEventListener("dblclick", async (evt) => {
    const mousePos = getMousePosElem(evt);
    for (const entidade of entidades.values()) {
      if (entidade.nome != "restaurante" && mousePos.distance(entidade.pos) < Entidade.size) {
        Swal.fire({
          title: "Valor da encomenda",
          input: "text",
          showCancelButton: true,
          confirmButtonColor: "#ae81ff",
          inputValidator: (value) => {
            if (isNaN(parseInt(value))) {
              return "Valor inválido";
            }
          },
        }).then((res) => {
          if (res.isConfirmed) {
            entidades.forEach((entidade) => {
              entidade.lucro = 0;
            });
            for (const link of links) {
              link.inSolution = false;
            }
            currentSelectedKey = entidade.nome;
            currentSolution = null;
            entidades.get(currentSelectedKey).lucro = res.value;
          }
        });
        break;
      }
    }
  });

  canvas.addEventListener("mousemove", (evt) => {
    for (const entidade of entidades.values()) {
      if (getMousePosElem(evt).distance(entidade.pos) < Entidade.size) {
        canvas.style.cursor = "pointer";
        return;
      }
    }
    canvas.style.cursor = "";
  });

  canvas.addEventListener("mousedown", (evt) => {
    const mousePos = getMousePosElem(evt);
    for (const entidade of entidades.values()) {
      if (mousePos.distance(entidade.pos) < Entidade.size) {
        const mouseMoveHandler = (evt) => {
          entidade.pos = getMousePosElem(evt);
        };
        canvas.addEventListener("mousemove", mouseMoveHandler);
        canvas.addEventListener(
          "mouseup",
          (evt) => {
            canvas.removeEventListener("mousemove", mouseMoveHandler);
          },
          { once: true }
        );
        break;
      }
    }
  });

  resetButton.addEventListener("click", reset);
  switchInput.addEventListener("click", () => {});
}

function reset() {
  entidades = startingMap(width, height);
  currentSelectedKey = null;
  currentSolution = null;
  for (const link of links) {
    link.inSolution = false;
  }
}

function draw() {
  for (const link of links) {
    const a = entidades.get(link.a);
    const b = entidades.get(link.b);
    const mid = a.pos.add(b.pos).mult(0.5);
    const normal = new Vector(-(b.pos.y - a.pos.y), b.pos.x - a.pos.x).normalize().mult(15);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(a.pos.x, a.pos.y);
    ctx.lineTo(b.pos.x, b.pos.y);
    link.inSolution ? (ctx.strokeStyle = "#00ff00") : (ctx.strokeStyle = "#ffffff");
    ctx.stroke();
    ctx.fillText(`${switchInput.checked ? parseFloat(a.pos.distance(b.pos) / 100).toFixed(1) : link.weight}m`, mid.x + normal.x, mid.y + normal.y);
    ctx.restore();
  }
  for (const entidade of entidades.values()) {
    entidade.show(ctx);
  }
  const current = entidades.get(currentSelectedKey);
  if (current) {
    ctx.beginPath();
    ctx.arc(current.pos.x, current.pos.y, Entidade.size, 0, 2 * Math.PI);
    ctx.stroke();
  }
  if (currentSolution) {
    ctx.save();
    ctx.font = `${Entidade.size * 0.75}px Consolas`;
    ctx.textAlign = "left";
    ctx.fillText(`Solução: ${currentSolution.path.reduce((acc, val) => `${acc} => ${entidades.get(val).nomeOutput}`)}`.replace("restaurante", "Restaurante"), height * 0.04, height * 0.04);
    ctx.fillText(`Tempo: ${currentSolution.time.toFixed(1)} minutos`, height * 0.04, height * 0.08);
    ctx.fillText(`Lucro: ${currentSolution.profit} €`, height * 0.04, height * 0.12);
    ctx.fillText(`Passos: ${currentSolution.steps}`, height * 0.04, height * 0.16);
    ctx.fillText(`Running Time: ${currentSolution.running_time}ms`, height * 0.04, height * 0.2);
    ctx.restore();
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  draw();
  requestAnimationFrame(animate);
}

setup();
animate();
