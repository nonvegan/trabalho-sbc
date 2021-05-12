class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(vec) {
    return new Vector(this.x + vec.x, this.y + vec.y);
  }

  sub(vec) {
    return new Vector(this.x - vec.x, this.y - vec.y);
  }

  mult(scale) {
    return new Vector(scale * this.x, scale * this.y);
  }

  distance(vec) {
    return Math.sqrt(Math.pow(vec.x - this.x, 2) + Math.pow(vec.y - this.y, 2));
  }

  mag() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  normalize() {
    return this.mult(1 / this.mag());
  }
}

class Entidade {
  constructor(nome, nomeOutput, pos, lucro = 0) {
    this.nome = nome;
    this.nomeOutput = nomeOutput;
    this.pos = pos;
    this.lucro = lucro;
  }

  show(ctx) {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, Entidade.size || 10, 0, 2 * Math.PI);
    ctx.fillStyle = "#f92672";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(this.nomeOutput, this.pos.x, this.pos.y - Entidade.size * 1.5);
    if (this.lucro) {
      ctx.fillText(`${this.lucro}€`, this.pos.x, this.pos.y);
    }
  }
}

class Link {
  constructor(a, b, weight) {
    this.a = a;
    this.b = b;
    this.weight = weight;
    this.inSolution = false;
  }
}

export { Vector, Entidade, Link };
