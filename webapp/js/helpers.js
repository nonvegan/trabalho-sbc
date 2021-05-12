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

export { getMousePosElem, getRandomInt };
