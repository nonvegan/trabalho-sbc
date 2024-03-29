import { assertz, retractall, consult, consultFile, query, queryF } from "./interpretador_prolog.js";
import { Vector, Entidade } from "./classes.js";
import { getMousePosElem, getRandomInt, setupSolutionDrawing } from "./helpers.js";
import { startingMap, links } from "./data.js";

const metodoProcuraList = document.getElementById("metodoProcuraList");
const depthfirstOption = metodoProcuraList.firstElementChild;
const procuraButton = document.getElementById("procuraButton");
const resetButton = document.getElementById("resetButton");
const randomButton = document.getElementById("randomButton");
const switchInputDistancia = document.getElementById("switchInputDistancia");
const switchInputObjetivo = document.getElementById("switchInputObjetivo");
const labelObjetivo = document.getElementById("labelObjetivo");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const width = Math.min(window.innerWidth, window.innerHeight);
const height = width / 1.6;
Entidade.size = width / 50;

let entidades = startingMap(width, height);
let currentSelectedKeys = new Set();
let currentSolution;

document.addEventListener("keydown", (evt) => {
  if (evt.key === "c") {
    console.log(currentSelectedKeys, currentSolution);
  }
  if (evt.key === "e") {
    console.log(entidades);
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

  const session = pl.create();
  consult(":-use_module(library(lists)).", session);
  consult(":-use_module(library(random)).", session);
  consultFile("../prolog/procura/breadthfirst.pl", session);
  consultFile("../prolog/procura/depthfirst.pl", session);
  consultFile("../prolog/procura/search.pl", session);
  consultFile("../prolog/procura/estafeta.pl", session);
  consultFile("../prolog/optimizacao/hill.pl", session);
  consultFile("../prolog/optimizacao/auxiliar.pl", session);
  consultFile("../prolog/optimizacao/traveling.pl", session);

  procuraButton.addEventListener("click", (evt) => {
    procuraButton.disabled = randomButton.disabled = true;

    const t0 = performance.now();
    if (currentSelectedKeys.size > 0) {
      retractall("initial(_)", session);
      retractall("goal(_)", session);
      retractall("road(_,_,_)", session);
      retractall("s(_,_)", session);
      retractall("lucro(_,_)", session);

      for (const link of links) {
        assertz(`road(${link.a},${link.b},${!switchInputDistancia.checked ? link.weight : parseFloat(entidades.get(link.a).pos.distance(entidades.get(link.b).pos) / 100).toFixed(1)})`, session);
      }

      for (const cliente of entidades.values()) {
        assertz(`lucro(${cliente.nome},${cliente.lucro})`, session);
      }

      if (currentSelectedKeys.size == 1 && !switchInputObjetivo.checked) {
        const encomenda = entidades.get(currentSelectedKeys.values().next().value);
        assertz("initial(restaurante)", session);
        assertz("(s(N1,N2):- travel(N1,N2,_))", session);
        assertz(`goal(${encomenda.nome})`, session);
        query(
          `search(${metodoProcuraList.value == "hillclimbing" ? "iterativedeepening" : metodoProcuraList.value},Par,S),length(S,N),N1 is N-1,eval(S,D), D1 is D + 1,evalLucro(S,L).`,
          session,
          function (answer) {
            if (metodoProcuraList.value != "hillclimbing") {
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
              setupSolutionDrawing(currentSolution, links);
            } else {
              const initial = answer.lookup("S").toString();
              queryF(
                `hill_climbing(${initial},[20,5,0.75,max],S),eval_dist(S,D),D2 is D + 2,length(S,N),N1 is N - 1,eval_lucro(S,L).`,
                session,
                (answerHill) => {
                  currentSolution = {
                    path: answerHill
                      .lookup("S")
                      .toString()
                      .replace(/[\[\]']+/g, "")
                      .split(","),
                    time: answerHill.lookup("D2").value,
                    steps: answerHill.lookup("N1").value,
                    running_time: performance.now() - t0,
                    profit: answerHill.lookup("L").value,
                  };
                  setupSolutionDrawing(currentSolution, links);
                },
                (fail) => {
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
                  setupSolutionDrawing(currentSolution, links);
                }
              );
            }
          }
        );
      } else if (currentSelectedKeys.size == 2 && switchInputObjetivo.checked) {
        assertz("initial([restaurante])", session);
        assertz("(s(L1,L2):- last(L1,N1),travel(N1,N2,_),append(L1,[N2],L2))", session);
        let goal = "goal(X):- ";
        let i = 0;
        currentSelectedKeys.forEach((key) => (goal += `member(${key},X)${i++ < currentSelectedKeys.size - 1 ? "," : ""}`));
        assertz(`(${goal})`, session);
        query(
          `search(${metodoProcuraList.value == "hillclimbing" ? "iterativedeepening" : metodoProcuraList.value},Par,S),last(S,LS),length(S,N),N1 is N-1,eval(LS,D), D1 is D + 1,evalLucro(LS,L).`,
          session,
          function (answer) {
            if (metodoProcuraList.value != "hillclimbing") {
              currentSolution = {
                path: answer
                  .lookup("LS")
                  .toString()
                  .replace(/[\[\]']+/g, "")
                  .split(","),
                time: answer.lookup("D1").value,
                steps: answer.lookup("N1").value,
                running_time: performance.now() - t0,
                profit: answer.lookup("L").value,
              };
              setupSolutionDrawing(currentSolution, links);
            } else {
              const initial = answer.lookup("LS").toString();
              queryF(
                `hill_climbing(${initial},[20,5,0.75,max],S),eval_dist(S,D),D2 is D + 2,length(S,N),N1 is N - 1,eval_lucro(S,L).`,
                session,
                (answerHill) => {
                  currentSolution = {
                    path: answerHill
                      .lookup("S")
                      .toString()
                      .replace(/[\[\]']+/g, "")
                      .split(","),
                    time: answerHill.lookup("D2").value,
                    steps: answerHill.lookup("N1").value,
                    running_time: performance.now() - t0,
                    profit: answerHill.lookup("L").value,
                  };
                  setupSolutionDrawing(currentSolution, links);
                },
                (fail) => {
                  currentSolution = {
                    path: answer
                      .lookup("LS")
                      .toString()
                      .replace(/[\[\]']+/g, "")
                      .split(","),
                    time: answer.lookup("D1").value,
                    steps: answer.lookup("N1").value,
                    running_time: performance.now() - t0,
                    profit: answer.lookup("L").value,
                  };
                  setupSolutionDrawing(currentSolution, links);
                }
              );
            }
          }
        );
      }
    }
    setTimeout(() => {
      procuraButton.disabled = randomButton.disabled = false;
    }, 500);
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
            if (metodoProcuraList.firstElementChild.getAttribute("value") != "depthfirst") {
              metodoProcuraList.prepend(depthfirstOption);
            }
            for (const link of links) {
              link.inSolution = false;
            }
            if (!switchInputObjetivo.checked) {
              if (currentSelectedKeys.size > 0) {
                entidades.get(currentSelectedKeys.values().next().value).lucro = 0;
                currentSelectedKeys.clear();
              }
              currentSelectedKeys.add(entidade.nome);
              currentSolution = null;
              entidades.get(entidade.nome).lucro = res.value;
            } else {
              if (currentSelectedKeys.size > 1 && !currentSelectedKeys.has(entidade.nome)) {
                const toBeRemovedKey = currentSelectedKeys.values().next().value;
                entidades.get(currentSelectedKeys.values().next().value).lucro = 0;
                currentSelectedKeys.delete(toBeRemovedKey);
              }
              currentSelectedKeys.add(entidade.nome);
              if (currentSelectedKeys.has("cliente5") && depthfirstOption.getAttribute("value") === "depthfirst") {
                metodoProcuraList.removeChild(depthfirstOption);
              }
              currentSolution = null;
              entidades.get(entidade.nome).lucro = res.value;
            }
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

  resetButton.addEventListener("click", (evt) => {
    entidades = startingMap(width, height);
    reset();
  });

  randomButton.addEventListener("click", (evt) => {
    if (metodoProcuraList.firstElementChild.getAttribute("value") != "depthfirst") {
      metodoProcuraList.prepend(depthfirstOption);
    }
    reset();
    const randomBuffer = Array.from(entidades.keys()).slice(1);
    if (!switchInputObjetivo.checked) {
      const c1 = randomBuffer[getRandomInt(0, randomBuffer.length - 1)];
      entidades.get(c1).lucro = getRandomInt(5, 20);
      currentSelectedKeys.add(c1);
    } else {
      while (currentSelectedKeys.size < 2) {
        const c2 = randomBuffer[getRandomInt(0, randomBuffer.length - 1)];
        if (currentSelectedKeys.size == 0) {
          entidades.get(c2).lucro = getRandomInt(5, 20);
        }
        currentSelectedKeys.add(c2);
        if (currentSelectedKeys.size == 2) {
          entidades.get(c2).lucro = getRandomInt(5, 20);
        }
      }

      if (currentSelectedKeys.has("cliente5") && depthfirstOption.getAttribute("value") === "depthfirst") {
        metodoProcuraList.removeChild(depthfirstOption);
      }
    }
    procuraButton.click();
  });

  switchInputObjetivo.addEventListener("change", (evt) => {
    labelObjetivo.textContent = !evt.target.checked ? "Objetivo 1" : "Objetivo 2";
    reset();
  });
}

function reset() {
  currentSelectedKeys.clear();
  currentSolution = null;
  entidades.forEach((entidade) => {
    entidade.lucro = 0;
  });
  for (const link of links) {
    link.inSolution = false;
  }
}

function draw() {
  for (const link of links) {
    ctx.save();
    const a = entidades.get(link.a);
    const b = entidades.get(link.b);
    const mid = a.pos.add(b.pos).mult(0.5);
    const normal = new Vector(-(b.pos.y - a.pos.y), b.pos.x - a.pos.x).normalize().mult(15);
    ctx.beginPath();
    ctx.moveTo(a.pos.x, a.pos.y);
    ctx.lineTo(b.pos.x, b.pos.y);
    link.inSolution ? (ctx.strokeStyle = "#00ff00") : (ctx.strokeStyle = "#ffffff");
    ctx.stroke();
    ctx.fillText(`${switchInputDistancia.checked ? parseFloat(a.pos.distance(b.pos) / 100).toFixed(1) : link.weight}m`, mid.x + normal.x, mid.y + normal.y);
    ctx.restore();
  }
  for (const entidade of entidades.values()) {
    entidade.show(ctx);
  }

  currentSelectedKeys.forEach((selectedKey) => {
    const encomenda = entidades.get(selectedKey);
    ctx.beginPath();
    currentSolution ? (ctx.strokeStyle = "#00ff00") : (ctx.strokeStyle = "#ffffff");
    ctx.arc(encomenda.pos.x, encomenda.pos.y, Entidade.size, 0, 2 * Math.PI);
    ctx.stroke();
  });

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
