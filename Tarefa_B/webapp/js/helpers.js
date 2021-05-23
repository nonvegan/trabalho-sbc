import { Vector } from "./classes.js";

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getMousePosElem(click, xOffset, yOffset) {
  return new Vector(
    click.clientX - click.target.getBoundingClientRect().x - 4 + (typeof xOffset !== "undefined" ? xOffset : 0),
    click.clientY - click.target.getBoundingClientRect().y - 4 + (typeof yOffset !== "undefined" ? yOffset : 0)
  );
}

function setupSolutionDrawing(currentSolution,links) {
  let solutionCopy = currentSolution.path.slice();
  for (const link of links) {
    link.inSolution = false;
  }
  for (let i = 0; i < solutionCopy.length - 1; i++) {
    for (const link of links) {
      if ((link.a === solutionCopy[i] && link.b === solutionCopy[i + 1]) || (link.b === solutionCopy[i] && link.a === solutionCopy[i + 1])) {
        link.inSolution = true;
        break;
      }
    }
  }
}

export { getMousePosElem, getRandomInt,setupSolutionDrawing };
