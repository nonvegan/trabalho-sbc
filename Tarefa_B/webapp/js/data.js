import { Entidade, Vector, Link } from "./classes.js";

const startingMap = (width, height) =>
  new Map([
    ["restaurante", new Entidade("restaurante", "Restaurante", new Vector(width / 2, (2 * height) / 12))],
    ["cliente1", new Entidade("cliente1", "Cliente 1", new Vector(width / 3, (4 * height) / 12))],
    ["cliente2", new Entidade("cliente2", "Cliente 2", new Vector(width / 2, (6 * height) / 12))],
    ["cliente3", new Entidade("cliente3", "Cliente 3", new Vector(width / 2, (8 * height) / 12))],
    ["cliente4", new Entidade("cliente4", "Cliente 4", new Vector((2 * width) / 3, (4 * height) / 12))],
    ["cliente5", new Entidade("cliente5", "Cliente 5", new Vector(width / 4, (7 * height) / 12))],
  ]);

const links = [
  new Link("restaurante", "cliente1", 5),
  new Link("restaurante", "cliente4", 7),
  new Link("cliente1", "cliente2", 5),
  new Link("cliente1", "cliente4", 5),
  new Link("cliente1", "cliente5", 5),
  new Link("cliente2", "cliente3", 3),
  new Link("cliente2", "cliente4", 2),
  new Link("cliente2", "cliente5", 2),
  new Link("cliente3", "cliente4", 4),
  new Link("cliente3", "cliente5", 5),
];

export { startingMap, links };
