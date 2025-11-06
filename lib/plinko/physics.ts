import { Ball, Peg } from '@/types/plinko';

export class PlinkoPhysics {
  private ball: Ball | null = null;
  private pegs: Peg[] = [];
  private width: number;
  private height: number;
  private readonly gravity = 0.5;
  private readonly friction = 0.99;
  private readonly bounceFactor = 0.5;
  private readonly centerBias = 0.3; // Push balls toward center
  private onPegHit: (() => void) | null = null;

  constructor(width: number, height: number, onPegHit?: () => void) {
    this.width = width;
    this.height = height;
    this.onPegHit = onPegHit || null;
    this.generatePegs();
  }

  private generatePegs() {
    const pegRadius = 4;
    const centerX = this.width / 2;
    const pegSpacing = 35; // Horizontal spacing between pegs (40px in Python)
    const rowSpacing = 35; // Vertical spacing between rows (40px in Python)
    
    // Calculate to end closer to bottom (height - 110px for bucket space)
    const endY = this.height - 110;
    const totalRows = 16; // Match Python version
    const startY = endY - (rowSpacing * (totalRows - 1));

    // Manually create tight pyramid - each row adds one peg (16 rows like Python)
    const rows = [
      { pegs: 3, y: startY + rowSpacing * 0 },
      { pegs: 4, y: startY + rowSpacing * 1 },
      { pegs: 5, y: startY + rowSpacing * 2 },
      { pegs: 6, y: startY + rowSpacing * 3 },
      { pegs: 7, y: startY + rowSpacing * 4 },
      { pegs: 8, y: startY + rowSpacing * 5 },
      { pegs: 9, y: startY + rowSpacing * 6 },
      { pegs: 10, y: startY + rowSpacing * 7 },
      { pegs: 11, y: startY + rowSpacing * 8 },
      { pegs: 12, y: startY + rowSpacing * 9 },
      { pegs: 13, y: startY + rowSpacing * 10 },
      { pegs: 14, y: startY + rowSpacing * 11 },
      { pegs: 15, y: startY + rowSpacing * 12 },
      { pegs: 16, y: startY + rowSpacing * 13 },
      { pegs: 17, y: startY + rowSpacing * 14 },
      { pegs: 18, y: startY + rowSpacing * 15 },
    ];

    rows.forEach(row => {
      const totalWidth = (row.pegs - 1) * pegSpacing;
      const startX = centerX - totalWidth / 2;

      for (let i = 0; i < row.pegs; i++) {
        this.pegs.push({
          x: startX + i * pegSpacing,
          y: row.y,
          radius: pegRadius,
        });
      }
    });
  }

  dropBall(startX: number) {
    // Drop ball from a random position near center (like stake)
    const randomOffset = (Math.random() - 0.5) * 60; // Random position within 60px range
    this.ball = {
      x: startX + randomOffset,
      y: 20,
      vx: (Math.random() - 0.5) * 1, // Small random horizontal velocity
      vy: 0,
      radius: 8,
    };
  }

  update(): boolean {
    if (!this.ball) return false;

    // Apply gravity
    this.ball.vy += this.gravity;

    // Apply friction
    this.ball.vx *= this.friction;
    this.ball.vy *= this.friction;

    // Update position
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    // Check collision with pegs
    for (const peg of this.pegs) {
      const dx = this.ball.x - peg.x;
      const dy = this.ball.y - peg.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = this.ball.radius + peg.radius;

      if (distance < minDistance) {
        // Mark peg as hit for animation
        peg.hit = true;
        peg.hitTime = Date.now();
        
        // Play sound callback
        if (this.onPegHit) {
          this.onPegHit();
        }
        
        // Calculate collision angle
        const angle = Math.atan2(dy, dx);
        
        // Move ball out of peg
        const overlap = minDistance - distance;
        this.ball.x += Math.cos(angle) * overlap;
        this.ball.y += Math.sin(angle) * overlap;

        // Calculate reflection velocity (better physics from Python version)
        const normalX = Math.cos(angle);
        const normalY = Math.sin(angle);
        
        // Reflect velocity off the normal
        const dotProduct = this.ball.vx * normalX + this.ball.vy * normalY;
        const reflectedVx = (this.ball.vx - 2 * dotProduct * normalX) * this.bounceFactor;
        const reflectedVy = (this.ball.vy - 2 * dotProduct * normalY) * this.bounceFactor;
        
        this.ball.vx = reflectedVx;
        this.ball.vy = reflectedVy * 0.5; // More bounce in Y direction
        
        // Add random horizontal impulse
        this.ball.vx += (Math.random() - 0.5) * 2;
        
        // Center bias - push balls toward center
        const centerX = this.width / 2;
        if (this.ball.x > centerX + 35) {
          this.ball.vx -= this.centerBias; // Push left if on right side
        } else if (this.ball.x < centerX - 35) {
          this.ball.vx += this.centerBias; // Push right if on left side
        }
        
        // Random directional change for unpredictability
        this.ball.x += (Math.random() < 0.5 ? -1 : 1);
      }
    }

    // Wall collision
    if (this.ball.x - this.ball.radius < 0) {
      this.ball.x = this.ball.radius;
      this.ball.vx *= -this.bounceFactor;
    } else if (this.ball.x + this.ball.radius > this.width) {
      this.ball.x = this.width - this.ball.radius;
      this.ball.vx *= -this.bounceFactor;
    }

    // Check if ball reached bottom
    if (this.ball.y >= this.height - 50) {
      return false; // Ball finished
    }

    return true; // Still falling
  }

  getBall(): Ball | null {
    return this.ball;
  }

  getPegs(): Peg[] {
    return this.pegs;
  }

  getBucketIndex(totalBuckets: number = 13): number {
    if (!this.ball) return 0;
    const bucketWidth = this.width / totalBuckets;
    return Math.floor(this.ball.x / bucketWidth);
  }

  reset() {
    this.ball = null;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.pegs = [];
    this.generatePegs();
  }
}

