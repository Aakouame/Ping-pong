import { BallType, UpdateDataType } from "./types/ballType";

export default class Ball {
  private context: CanvasRenderingContext2D;
  private radius: number;
  private color: string;
  private speed: number;
  private tableWidth: number;
  private tableHeight: number;
  private xpos: number;
  private ypos: number;
  private dx: number;
  private dy: number;
  private gap: number;

  constructor(context: CanvasRenderingContext2D, data: BallType) {
    this.context = context;
    this.radius = data.radius;
    this.color = data.color;
    this.speed = data.speed;
    this.gap = data.gap;
    this.tableWidth = data.tableWidth;
    this.tableHeight = data.tableHeight;
    this.xpos = 0;
    this.ypos = 0;
    this.dx = 0;
    this.dy = 0;
    //direction to start
    this.reset();
  }

  checkAngle(angle: number) {
    if (
      (angle >= 0 && angle <= 25) ||
      (angle >= 80 && angle <= 100) ||
      (angle >= 155 && angle <= 205) ||
      (angle >= 260 && angle <= 290) ||
      (angle >= 335 && angle <= 360)
    )
      return false;
    return true;
  }

  randomNumber(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  drawBall() {
    const circle = new Path2D();
    circle.arc(this.xpos, this.ypos, this.radius, 0, 2 * Math.PI, false);
    this.context.fillStyle = this.color;
    this.context.fill(circle);
  }

  reset() {
    this.xpos = this.tableWidth / 2;
    this.ypos = this.tableHeight / 2;
    let sight = 0;
    while (!this.checkAngle((sight * 180) / Math.PI))
      sight = this.randomNumber(0, 2 * Math.PI);
    const direction = {
      x: Math.cos(sight),
      y: Math.sin(sight),
    };
    this.dx = direction.x * this.speed;
    this.dy = direction.y * this.speed;
  }

  checkLoss(data: UpdateDataType) {
    if (
      !this.checkBallTouchPaddle(data, false) &&
      (this.ypos - this.radius < data.yUp + data.height ||
        this.ypos + this.radius > data.yDown)
    )
      return true;
    return false;
  }

  checkBallTouchPaddle(data: UpdateDataType, chk: boolean) {
    if (
      data.yUp + data.height >= this.ypos - this.radius &&
      ((this.xpos - this.radius >= data.xUp &&
        this.xpos - this.radius <= data.xUp + data.width) ||
        (this.xpos + this.radius >= data.xUp &&
          this.xpos + this.radius <= data.xUp + data.width))
    ) {
      if (chk) this.dy = -this.dy;
      return true;
    }
    if (
      data.yDown <= this.ypos + this.radius &&
      ((this.xpos - this.radius >= data.xDown &&
        this.xpos - this.radius <= data.xDown + data.width) ||
        (this.xpos + this.radius >= data.xDown &&
          this.xpos + this.radius <= data.xDown + data.width))
    ) {
      if (chk) this.dy = -this.dy;
      return true;
    }
    return false;
  }

  updateBall(delta: number, data: UpdateDataType) {
    this.context.clearRect(0, 0, this.tableWidth, this.tableHeight);
    if (this.xpos + this.radius >= this.tableWidth) this.dx = -this.dx;
    else if (this.xpos - this.radius <= 0) this.dx = -this.dx;
    else if (this.ypos + this.radius >= this.tableHeight) this.dy = -this.dy;
    else if (this.ypos - this.radius <= 0) this.dy = -this.dy;

    this.checkBallTouchPaddle(data, true);

    this.xpos += this.dx * delta;
    this.ypos += this.dy * delta;
    this.drawBall();
  }

  get x() {
    return this.xpos;
  }

  get y() {
    return this.ypos;
  }
}
