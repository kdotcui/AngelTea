import { NextRequest, NextResponse } from 'next/server';
import { createCanvas, loadImage, registerFont } from 'canvas';
import type { CanvasRenderingContext2D as NodeCanvasContext } from 'canvas';
import path from 'path';

// Register fonts at module initialization (runs once when module is loaded)
registerFont(path.join(process.cwd(), 'public/fonts/Roboto-Regular.ttf'), { family: 'Roboto', weight: 'normal' });
registerFont(path.join(process.cwd(), 'public/fonts/Roboto-Bold.ttf'), { family: 'Roboto', weight: 'bold' });
registerFont(path.join(process.cwd(), 'public/fonts/Roboto-Medium.ttf'), { family: 'Roboto', weight: '600' });
registerFont(path.join(process.cwd(), 'public/fonts/Roboto-Black.ttf'), { family: 'Roboto', weight: '900' });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { drinkName, personalityAnalysis, drinkMatch, vibes } = body;

    // Create canvas with fixed dimensions at 2x resolution
    const width = 1080; // 2x for retina
    const height = 1920; // 2x for retina
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d') as unknown as NodeCanvasContext;

    // Scale everything 2x
    const scale = 2;

    // Draw gradient background (sky to peach)
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.3, '#B0E0E6');
    gradient.addColorStop(0.7, '#FFF5E6');
    gradient.addColorStop(1, '#FFE4B5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw decorative clouds (scaled 2x)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';

    ctx.beginPath();
    ctx.ellipse(
      60 * scale,
      80 * scale,
      50 * scale,
      25 * scale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(
      450 * scale,
      130 * scale,
      65 * scale,
      30 * scale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(
      130 * scale,
      190 * scale,
      40 * scale,
      20 * scale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(
      450 * scale,
      800 * scale,
      55 * scale,
      25 * scale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(
      90 * scale,
      850 * scale,
      50 * scale,
      20 * scale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw decorative boba bubbles (circles) for visual interest
    const bobaColors = [
      'rgba(139, 69, 19, 0.3)',    // Brown boba
      'rgba(255, 182, 193, 0.4)',  // Pink
      'rgba(173, 216, 230, 0.4)',  // Light blue
      'rgba(255, 218, 185, 0.4)',  // Peach
      'rgba(221, 160, 221, 0.4)',  // Plum
    ];

    // Draw larger decorative boba circles around the middle section
    const bobaBubbles = [
      { x: 80 * scale, y: 400 * scale, r: 35 * scale, color: bobaColors[0] },
      { x: 480 * scale, y: 350 * scale, r: 45 * scale, color: bobaColors[1] },
      { x: 100 * scale, y: 550 * scale, r: 40 * scale, color: bobaColors[2] },
      { x: 450 * scale, y: 600 * scale, r: 38 * scale, color: bobaColors[3] },
      { x: 90 * scale, y: 720 * scale, r: 32 * scale, color: bobaColors[4] },
      { x: 470 * scale, y: 750 * scale, r: 42 * scale, color: bobaColors[0] },
      { x: 50 * scale, y: 300 * scale, r: 28 * scale, color: bobaColors[1] },
      { x: 500 * scale, y: 480 * scale, r: 30 * scale, color: bobaColors[2] },
    ];

    bobaBubbles.forEach(bubble => {
      ctx.fillStyle = bubble.color;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
      ctx.fill();
      
      // Add a subtle highlight for 3D effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(bubble.x - bubble.r * 0.3, bubble.y - bubble.r * 0.3, bubble.r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Load and draw logo
    try {
      const logoPath = path.join(
        process.cwd(),
        'public',
        'angeltealogo.png'
      );
      const logo = await loadImage(logoPath);
      const logoHeight = 64 * scale;
      const logoWidth = (logo.width / logo.height) * logoHeight;
      ctx.drawImage(
        logo,
        (width - logoWidth) / 2,
        48 * scale,
        logoWidth,
        logoHeight
      );
    } catch {
      // Skip logo if image type not supported
    }

    // Draw "2025 PERSONALITY MATCH" text
    ctx.fillStyle = '#6a4c9c';
    ctx.font = `bold ${11 * scale}px Roboto`;
    ctx.textAlign = 'center';
    ctx.fillText(
      '2 0 2 5   P E R S O N A L I T Y   M A T C H',
      width / 2,
      140 * scale
    );

    // Draw decorative stars/sparkles for added visual interest
    const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    };

    // Draw sparkles around the card
    ctx.fillStyle = 'rgba(255, 215, 0, 0.5)'; // Gold sparkles
    drawStar(120 * scale, 260 * scale, 5, 15 * scale, 7 * scale);
    drawStar(480 * scale, 240 * scale, 5, 12 * scale, 6 * scale);
    drawStar(70 * scale, 820 * scale, 5, 18 * scale, 9 * scale);
    drawStar(490 * scale, 850 * scale, 5, 14 * scale, 7 * scale);
    
    ctx.fillStyle = 'rgba(255, 192, 203, 0.5)'; // Pink sparkles
    drawStar(450 * scale, 290 * scale, 4, 10 * scale, 5 * scale);
    drawStar(90 * scale, 780 * scale, 4, 12 * scale, 6 * scale);

    // Draw "You are a" text
    ctx.fillStyle = '#111827';
    ctx.font = `bold ${42 * scale}px Roboto`;
    ctx.fillText('You are a', width / 2, 400 * scale);

    // Draw a decorative rounded rectangle behind the drink name for emphasis
    const drinkNameY = 470 * scale;
    const boxPadding = 30 * scale;
    const boxWidth = width * 0.85;
    const boxHeight = 90 * scale;
    const boxX = (width - boxWidth) / 2;
    const boxY = drinkNameY - 55 * scale;

    // Draw box with gradient and border
    const boxGradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
    boxGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    boxGradient.addColorStop(1, 'rgba(255, 255, 255, 0.7)');
    ctx.fillStyle = boxGradient;
    ctx.shadowColor = 'rgba(106, 76, 156, 0.3)';
    ctx.shadowBlur = 20 * scale;
    ctx.shadowOffsetY = 8 * scale;
    roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 20 * scale);
    ctx.fill();
    
    // Add border
    ctx.strokeStyle = '#6a4c9c';
    ctx.lineWidth = 3 * scale;
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Draw drink name (with word wrapping and shadow)
    ctx.font = `900 ${38 * scale}px Roboto`;
    ctx.fillStyle = '#6a4c9c';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10 * scale;
    ctx.shadowOffsetY = 3 * scale;

    // Wrap drink name if it's too long (max width: 75% of canvas width)
    const maxDrinkWidth = width * 0.75;
    wrapText(ctx, drinkName, width / 2, 470 * scale, maxDrinkWidth, 48 * scale);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Draw personality analysis
    ctx.fillStyle = '#111827';
    ctx.font = `600 ${18 * scale}px Roboto`;
    wrapText(
      ctx,
      personalityAnalysis,
      width / 2,
      560 * scale,
      380 * scale,
      28 * scale
    );

    // Draw drink match
    ctx.fillStyle = '#374151';
    ctx.font = `${16 * scale}px Roboto`;
    wrapText(ctx, drinkMatch, width / 2, 650 * scale, 380 * scale, 26 * scale);

    // Draw vibes
    if (vibes && vibes.length > 0) {
      ctx.font = `bold ${14 * scale}px Roboto`;
      const vibeY = 740 * scale;
      const vibeGap = 14 * scale;

      // Calculate total width of all vibes
      const vibeWidths = vibes.map((vibe: string) => {
        return ctx.measureText(vibe.toUpperCase()).width + 44 * scale; // 22px padding each side
      });
      const totalVibesWidth =
        vibeWidths.reduce((a: number, b: number) => a + b, 0) +
        vibeGap * (vibes.length - 1);

      let vibeX = (width - totalVibesWidth) / 2;

      vibes.forEach((vibe: string, i: number) => {
        const vibeText = vibe.toUpperCase();
        const vibeWidth = vibeWidths[i];
        const vibeHeight = 36 * scale;

        // Create gradient for vibe background
        const vibeGradient = ctx.createLinearGradient(vibeX, vibeY, vibeX, vibeY + vibeHeight);
        vibeGradient.addColorStop(0, 'rgba(106, 76, 156, 0.35)');
        vibeGradient.addColorStop(1, 'rgba(106, 76, 156, 0.2)');
        
        // Draw vibe background with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 8 * scale;
        ctx.shadowOffsetY = 3 * scale;
        ctx.fillStyle = vibeGradient;
        ctx.strokeStyle = '#6a4c9c';
        ctx.lineWidth = 2 * scale;

        roundRect(ctx, vibeX, vibeY, vibeWidth, vibeHeight, 18 * scale);
        ctx.fill();
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Draw vibe text
        ctx.fillStyle = '#6a4c9c';
        ctx.textAlign = 'center';
        ctx.fillText(vibeText, vibeX + vibeWidth / 2, vibeY + 23 * scale);

        vibeX += vibeWidth + vibeGap;
      });
    }

    // Draw footer with enhanced design
    const footerY = 860 * scale;
    
    // Draw decorative line above footer
    ctx.strokeStyle = 'rgba(106, 76, 156, 0.3)';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(width * 0.2, footerY);
    ctx.lineTo(width * 0.8, footerY);
    ctx.stroke();
    
    // Draw boba cup emoji/icon
    ctx.font = `${32 * scale}px Roboto`;
    ctx.fillText('🧋', width / 2, footerY + 40 * scale);
    
    // Draw main footer text
    ctx.fillStyle = '#6a4c9c';
    ctx.font = `bold ${13 * scale}px Roboto`;
    ctx.textAlign = 'center';
    ctx.fillText(
      'F I N D  Y O U R  M A T C H  A T',
      width / 2,
      footerY + 68 * scale
    );
    
    // Draw brand name larger
    ctx.font = `900 ${18 * scale}px Roboto`;
    ctx.fillStyle = '#6a4c9c';
    ctx.fillText(
      'A N G E L  T E A',
      width / 2,
      footerY + 92 * scale
    );

    // Convert to buffer
    const buffer = canvas.toBuffer('image/png');

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}

// Helper function to draw rounded rectangles
function roundRect(
  ctx: NodeCanvasContext,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Helper function to wrap text
function wrapText(
  ctx: NodeCanvasContext,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}
