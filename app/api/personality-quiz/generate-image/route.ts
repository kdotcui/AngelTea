import { NextRequest, NextResponse } from 'next/server';
import { createCanvas, loadImage } from 'canvas';
import type { CanvasRenderingContext2D as NodeCanvasContext } from 'canvas';
import path from 'path';

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
    ctx.font = `bold ${11 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(
      '2 0 2 5   P E R S O N A L I T Y   M A T C H',
      width / 2,
      140 * scale
    );

    // Draw "You are a" text
    ctx.fillStyle = '#111827';
    ctx.font = `bold ${42 * scale}px Arial`;
    ctx.fillText('You are a', width / 2, 400 * scale);

    // Draw drink name (with word wrapping and shadow)
    ctx.font = `900 ${36 * scale}px Arial`;
    ctx.fillStyle = '#6a4c9c';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 15 * scale;
    ctx.shadowOffsetY = 5 * scale;

    // Wrap drink name if it's too long (max width: 80% of canvas width)
    const maxDrinkWidth = width * 0.8;
    wrapText(ctx, drinkName, width / 2, 470 * scale, maxDrinkWidth, 45 * scale);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Draw personality analysis
    ctx.fillStyle = '#111827';
    ctx.font = `600 ${18 * scale}px Arial`;
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
    ctx.font = `${16 * scale}px Arial`;
    wrapText(ctx, drinkMatch, width / 2, 650 * scale, 380 * scale, 26 * scale);

    // Draw vibes
    if (vibes && vibes.length > 0) {
      ctx.font = `bold ${13 * scale}px Arial`;
      const vibeY = 740 * scale;
      const vibeGap = 12 * scale;

      // Calculate total width of all vibes
      const vibeWidths = vibes.map((vibe: string) => {
        return ctx.measureText(vibe.toUpperCase()).width + 40 * scale; // 20px padding each side
      });
      const totalVibesWidth =
        vibeWidths.reduce((a: number, b: number) => a + b, 0) +
        vibeGap * (vibes.length - 1);

      let vibeX = (width - totalVibesWidth) / 2;

      vibes.forEach((vibe: string, i: number) => {
        const vibeText = vibe.toUpperCase();
        const vibeWidth = vibeWidths[i];
        const vibeHeight = 32 * scale;

        // Draw vibe background
        ctx.fillStyle = 'rgba(106, 76, 156, 0.2)';
        ctx.strokeStyle = 'rgba(106, 76, 156, 0.3)';
        ctx.lineWidth = 1 * scale;

        roundRect(ctx, vibeX, vibeY, vibeWidth, vibeHeight, 16 * scale);
        ctx.fill();
        ctx.stroke();

        // Draw vibe text
        ctx.fillStyle = '#6a4c9c';
        ctx.textAlign = 'center';
        ctx.fillText(vibeText, vibeX + vibeWidth / 2, vibeY + 20 * scale);

        vibeX += vibeWidth + vibeGap;
      });
    }

    // Draw footer
    ctx.fillStyle = '#6b7280';
    ctx.font = `bold ${11 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(
      'F I N D  Y O U R  M A T C H  A T  A N G E L  T E A',
      width / 2,
      910 * scale
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
