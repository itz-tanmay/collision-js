//! Utility Functions
//! ---------------------------------------------------------------------------
//! ---------------------------------------------------------------------------
//! ---------------------------------------------------------------------------
//! ---------------------------------------------------------------------------
//! ---------------------------------------------------------------------------

const randomIntFromRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const randomColor = (colors) => {
  return colors[Math.floor(Math.random() * colors.length)];
};

const getDistance = (x1, y1, x2, y2) => {
  let xDistance = x2 - x1;
  let yDistance = y2 - y1;

  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
};

const rotate = (velocity, angle) => {
  const rotatedVelocities = {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle),
  };

  return rotatedVelocities;
};

const resolveCollision = (particle, otherParticle) => {
  const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
  const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

  const xDist = otherParticle.x - particle.x;
  const yDist = otherParticle.y - particle.y;

  // Prevent accidental overlap of particles
  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
    // Grab angle between the two colliding particles
    const angle = -Math.atan2(
      otherParticle.y - particle.y,
      otherParticle.x - particle.x
    );

    // Store mass in var for better readability in collision equation
    const m1 = particle.mass;
    const m2 = otherParticle.mass;

    // Velocity before equation
    const u1 = rotate(particle.velocity, angle);
    const u2 = rotate(otherParticle.velocity, angle);

    // Velocity after 1d collision equation
    const v1 = {
      x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
      y: u1.y,
    };
    const v2 = {
      x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
      y: u2.y,
    };

    // Final velocity after rotating axis back to original location
    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);

    // Swap particle velocities for realistic bounce effect
    particle.velocity.x = vFinal1.x;
    particle.velocity.y = vFinal1.y;

    otherParticle.velocity.x = vFinal2.x;
    otherParticle.velocity.y = vFinal2.y;
  }
};

//! ---------------------------------------------------------------------------
//! ---------------------------------------------------------------------------
//! ---------------------------------------------------------------------------
//! ---------------------------------------------------------------------------
//! ---------------------------------------------------------------------------

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  init();
});
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

let canvas = document.querySelector("canvas");
let c = canvas.getContext("2d");
let colorArray = ["#383F51", "#DDDBF1", "#3C4F76", "#2E4057", "#29335C"];

let mouse = {
  x: undefined,
  y: undefined,
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
  constructor(x, y, radius = 30, color) {
    this.x = x;
    this.y = y;
    this.velocity = {
      x: (Math.random() - 0.5) * 4,
      y: (Math.random() - 0.5) * 4,
    };
    this.radius = radius;
    this.color = color;
    this.mass = 10;
    this.opacity = 0;
  }

  collision = (particles) => {
    for (let i = 0; i < particles.length; i++) {
      if (this === particles[i]) continue;
      else {
        if (
          getDistance(this.x, this.y, particles[i].x, particles[i].y) -
            2 * this.radius <
          0
        ) {
          resolveCollision(this, particles[i]);
        }
      }
    }
  };

  move = () => {
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    if (this.x - this.radius <= 0 || this.x > canvas.width - this.radius) {
      this.velocity.x = -this.velocity.x;
    }
    if (this.y - this.radius <= 0 || this.y >= canvas.height - this.radius) {
      this.velocity.y = -this.velocity.y;
    }

    //? Mouse Collision
    if (getDistance(mouse.x, mouse.y, this.x, this.y) < 130) {
      this.opacity += 0.3;
    }else{
      this.opacity = 0.3;
    }
  };

  draw = () => {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.strokeStyle = this.color;
    c.save();
    c.globalAlpha = this.opacity;
    c.fillStyle = this.color;
    c.fill();
    c.restore();
    c.stroke();
  };
}

let particles;
let init = () => {
  particles = [];
  for (let i = 0; i < 100; i++) {
    const radius = 25;
    let x = radius + Math.random() * (canvas.width - 2 * radius);
    let y = radius + Math.random() * (canvas.height - 2 * radius);
    const color = randomColor(colorArray);
    if (i !== 0) {
      for (let j = 0; j < particles.length; j++) {
        if (
          getDistance(x, y, particles[j].x, particles[j].y) - 2 * radius <
          0
        ) {
          x = radius + Math.random() * (canvas.width - 2 * radius);
          y = radius + Math.random() * (canvas.height - 2 * radius);

          j = -1;
        }
      }
    }

    particles.push(new Particle(x, y, radius, color));
  }
};

let animate = () => {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle) => {
    particle.draw();
    particle.move();
    particle.collision(particles);
  });
};

init();
animate();
