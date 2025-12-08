import { NextRequest, NextResponse } from 'next/server';
import { createCanvas, loadImage, registerFont } from 'canvas';
import type { CanvasRenderingContext2D as NodeCanvasContext } from 'canvas';
import path from 'path';
import {
  checkRateLimit,
  getSessionId,
  createRateLimitResponse,
  addRateLimitHeaders,
  RATE_LIMITS,
} from '@/lib/rateLimit';

// Register fonts at module initialization (runs once when module is loaded)
registerFont(path.join(process.cwd(), 'public/fonts/Roboto-Regular.ttf'), { family: 'Roboto', weight: 'normal' });
registerFont(path.join(process.cwd(), 'public/fonts/Roboto-Bold.ttf'), { family: 'Roboto', weight: 'bold' });
registerFont(path.join(process.cwd(), 'public/fonts/Roboto-Medium.ttf'), { family: 'Roboto', weight: '600' });
registerFont(path.join(process.cwd(), 'public/fonts/Roboto-Black.ttf'), { family: 'Roboto', weight: '900' });

// Function to get gradient colors based on drink name
function getDrinkGradient(drinkName: string): { colors: string[], hasBoba: boolean, hasJelly: boolean } {
  const name = drinkName.toLowerCase();
  
  // Oreo/Cookie drinks - brown and cream
  if (name.includes('oreo') || name.includes('cookie')) {
    return { colors: ['#E8D5C4', '#D4A574', '#8B7355', '#C9B5A0'], hasBoba: true, hasJelly: false };
  }
  
  // Matcha drinks - green tones
  if (name.includes('matcha')) {
    return { colors: ['#E8F5E9', '#C8E6C9', '#81C784', '#A5D6A7'], hasBoba: true, hasJelly: false };
  }
  
  // Taro drinks - purple tones
  if (name.includes('taro') || name.includes('ube')) {
    return { colors: ['#F3E5F5', '#E1BEE7', '#BA68C8', '#CE93D8'], hasBoba: true, hasJelly: false };
  }
  
  // Strawberry drinks - pink and red
  if (name.includes('strawberry')) {
    return { colors: ['#FCE4EC', '#F8BBD0', '#F48FB1', '#FFCDD2'], hasBoba: false, hasJelly: true };
  }
  
  // Mango drinks - orange and yellow
  if (name.includes('mango')) {
    return { colors: ['#FFF9C4', '#FFECB3', '#FFD54F', '#FFE082'], hasBoba: false, hasJelly: true };
  }
  
  // Peach drinks - soft orange/pink
  if (name.includes('peach')) {
    return { colors: ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFE5CC'], hasBoba: false, hasJelly: true };
  }
  
  // Coffee drinks - brown tones
  if (name.includes('coffee')) {
    return { colors: ['#EFEBE9', '#D7CCC8', '#A1887F', '#BCAAA4'], hasBoba: true, hasJelly: false };
  }
  
  // Thai milk tea - orange tones
  if (name.includes('thai')) {
    return { colors: ['#FFF3E0', '#FFE0B2', '#FFB74D', '#FFCC80'], hasBoba: true, hasJelly: false };
  }
  
  // Brown sugar drinks - caramel/brown
  if (name.includes('brown sugar')) {
    return { colors: ['#EFEBE9', '#D7CCC8', '#8D6E63', '#A1887F'], hasBoba: true, hasJelly: false };
  }
  
  // Jasmine drinks - soft white/yellow
  if (name.includes('jasmine')) {
    return { colors: ['#FFFDE7', '#FFF9C4', '#FFF59D', '#FFF8E1'], hasBoba: true, hasJelly: false };
  }
  
  // Lychee drinks - pink/white
  if (name.includes('lychee')) {
    return { colors: ['#FCE4EC', '#F8BBD0', '#F48FB1', '#F8E5E8'], hasBoba: false, hasJelly: true };
  }
  
  // Passion fruit - purple/yellow
  if (name.includes('passion')) {
    return { colors: ['#FFF9C4', '#F3E5F5', '#E1BEE7', '#FFF59D'], hasBoba: false, hasJelly: true };
  }
  
  // Pineapple - bright yellow
  if (name.includes('pineapple')) {
    return { colors: ['#FFFDE7', '#FFF9C4', '#FFF176', '#FFEB3B'], hasBoba: false, hasJelly: true };
  }
  
  // Coconut - white/cream
  if (name.includes('coconut')) {
    return { colors: ['#FAFAFA', '#F5F5F5', '#EEEEEE', '#F9F9F9'], hasBoba: false, hasJelly: true };
  }
  
  // Kiwi - green
  if (name.includes('kiwi')) {
    return { colors: ['#F1F8E9', '#DCEDC8', '#AED581', '#C5E1A5'], hasBoba: false, hasJelly: true };
  }
  
  // Orange - orange tones
  if (name.includes('orange')) {
    return { colors: ['#FFF3E0', '#FFE0B2', '#FFB74D', '#FFCC80'], hasBoba: false, hasJelly: true };
  }
  
  // Lemon - yellow
  if (name.includes('lemon')) {
    return { colors: ['#FFFDE7', '#FFF9C4', '#FFF176', '#FFF59D'], hasBoba: false, hasJelly: true };
  }
  
  // Pomelo/Sago - soft yellow/pink
  if (name.includes('pomelo') || name.includes('sago')) {
    return { colors: ['#FFF9C4', '#FFE0B2', '#FFD54F', '#FFECB3'], hasBoba: false, hasJelly: true };
  }
  
  // Yogurt/Smoothie - creamy white/pink
  if (name.includes('yogurt') || name.includes('smoothie')) {
    return { colors: ['#FCE4EC', '#F8BBD0', '#F3E5F5', '#FFEBEE'], hasBoba: false, hasJelly: false };
  }
  
  // Sparkling - light blue/clear
  if (name.includes('sparkling') || name.includes('soda')) {
    return { colors: ['#E1F5FE', '#B3E5FC', '#81D4FA', '#B2EBF2'], hasBoba: false, hasJelly: true };
  }
  
  // Herbal tea - earthy green/brown
  if (name.includes('herbal') || name.includes('chrysanthemum') || name.includes('ginseng')) {
    return { colors: ['#F1F8E9', '#DCEDC8', '#AED581', '#E8F5E9'], hasBoba: false, hasJelly: false };
  }
  
  // Slush - icy blue/white
  if (name.includes('slush')) {
    return { colors: ['#E1F5FE', '#B3E5FC', '#81D4FA', '#E0F7FA'], hasBoba: false, hasJelly: false };
  }
  
  // Default milk tea - classic tea colors
  return { colors: ['#EFEBE9', '#D7CCC8', '#BCAAA4', '#C9B5A0'], hasBoba: true, hasJelly: false };
}

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const sessionId = getSessionId(req);
    const rateLimitResult = checkRateLimit(sessionId, RATE_LIMITS.QUIZ_IMAGE);
    
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult);
    }

    const body = await req.json();
    const { drinkName, personalityAnalysis, drinkMatch, vibes } = body;

    // Create canvas with fixed dimensions at 2x resolution
    const width = 1080; // 2x for retina
    const height = 1920; // 2x for retina
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d') as unknown as NodeCanvasContext;

    // Scale everything 2x
    const scale = 2;

    // Get dynamic gradient colors based on drink
    const drinkTheme = getDrinkGradient(drinkName);

    // Draw gradient background with drink-specific colors
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, drinkTheme.colors[0]);
    gradient.addColorStop(0.3, drinkTheme.colors[1]);
    gradient.addColorStop(0.7, drinkTheme.colors[2]);
    gradient.addColorStop(1, drinkTheme.colors[3]);
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

    // Load and draw logo with more top margin
    try {
      const logoPath = path.join(
        process.cwd(),
        'public',
        'angeltealogo.png'
      );
      const logo = await loadImage(logoPath);
      const logoHeight = 60 * scale;
      const logoWidth = (logo.width / logo.height) * logoHeight;
      ctx.drawImage(
        logo,
        (width - logoWidth) / 2,
        60 * scale,
        logoWidth,
        logoHeight
      );
    } catch {
      // Skip logo if image type not supported
    }

    // Draw "2025 PERSONALITY MATCH" text with better spacing
    ctx.fillStyle = '#6a4c9c';
    ctx.font = `bold ${11 * scale}px Roboto`;
    ctx.textAlign = 'center';
    ctx.fillText(
      '2 0 2 5   P E R S O N A L I T Y   M A T C H',
      width / 2,
      150 * scale
    );

    // Draw boba or jelly balls based on drink type (only if applicable)
    if (drinkTheme.hasBoba) {
      // Draw brown boba pearls
      const bobaPearls = [
        { x: 80 * scale, y: 300 * scale, r: 32 * scale },
        { x: 480 * scale, y: 280 * scale, r: 36 * scale },
        { x: 50 * scale, y: 500 * scale, r: 30 * scale },
        { x: 500 * scale, y: 520 * scale, r: 34 * scale },
        { x: 70 * scale, y: 700 * scale, r: 32 * scale },
        { x: 490 * scale, y: 720 * scale, r: 36 * scale },
        { x: 40 * scale, y: 850 * scale, r: 30 * scale },
        { x: 520 * scale, y: 870 * scale, r: 34 * scale },
      ];
      
      bobaPearls.forEach(pearl => {
        // Draw boba pearl
        ctx.fillStyle = 'rgba(92, 64, 51, 0.6)'; // Brown boba color
        ctx.beginPath();
        ctx.arc(pearl.x, pearl.y, pearl.r, 0, Math.PI * 2);
        ctx.fill();
        
        // Add shine/highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(pearl.x - pearl.r * 0.3, pearl.y - pearl.r * 0.3, pearl.r * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (drinkTheme.hasJelly) {
      // Draw colorful jelly pieces (whitish pink/translucent)
      const jellyPieces = [
        { x: 80 * scale, y: 300 * scale, r: 32 * scale },
        { x: 480 * scale, y: 280 * scale, r: 36 * scale },
        { x: 50 * scale, y: 500 * scale, r: 30 * scale },
        { x: 500 * scale, y: 520 * scale, r: 34 * scale },
        { x: 70 * scale, y: 700 * scale, r: 32 * scale },
        { x: 490 * scale, y: 720 * scale, r: 36 * scale },
        { x: 40 * scale, y: 850 * scale, r: 30 * scale },
        { x: 520 * scale, y: 870 * scale, r: 34 * scale },
      ];
      
      jellyPieces.forEach((jelly, index) => {
        // Alternate between pink and white jelly
        const isPink = index % 2 === 0;
        ctx.fillStyle = isPink ? 'rgba(255, 182, 193, 0.5)' : 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(jelly.x, jelly.y, jelly.r, 0, Math.PI * 2);
        ctx.fill();
        
        // Add shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(jelly.x - jelly.r * 0.3, jelly.y - jelly.r * 0.3, jelly.r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    
    // Reset alpha
    ctx.globalAlpha = 1.0;

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

    // Draw "You are a" text with improved positioning
    ctx.fillStyle = '#111827';
    ctx.font = `bold ${42 * scale}px Roboto`;
    ctx.fillText('You are a', width / 2, 370 * scale);

    // Draw a decorative rounded rectangle behind the drink name for emphasis
    const drinkNameY = 470 * scale;
    const boxPadding = 30 * scale;
    const boxWidth = width * 0.82;
    const boxHeight = 85 * scale;
    const boxX = (width - boxWidth) / 2;
    const boxY = drinkNameY - 50 * scale;

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
    ctx.font = `900 ${34 * scale}px Roboto`;
    ctx.fillStyle = '#6a4c9c';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10 * scale;
    ctx.shadowOffsetY = 3 * scale;

    // Wrap drink name if it's too long (max width: 75% of canvas width for better readability)
    // Position at center of the box (boxY + boxHeight/2)
    const maxDrinkWidth = width * 0.75;
    const drinkNameCenterY = boxY + (boxHeight / 2);
    wrapText(ctx, drinkName, width / 2, drinkNameCenterY, maxDrinkWidth, 42 * scale);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Draw personality analysis with better spacing (italicized using transform, centered)
    ctx.fillStyle = '#111827';
    ctx.font = `600 ${18 * scale}px Roboto`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    // Apply skew transform that keeps the center point fixed
    const centerX = width / 2;
    const centerY = 545 * scale;
    ctx.translate(centerX, centerY);
    ctx.transform(1, 0, -0.15, 1, 0, 0); // Skew for italic effect
    ctx.translate(-centerX, -centerY);
    wrapText(
      ctx,
      personalityAnalysis,
      width / 2,
      545 * scale,
      420 * scale,
      28 * scale
    );
    ctx.restore();

    // Draw drink match with more breathing room (normal text, centered)
    ctx.fillStyle = '#374151';
    ctx.font = `${16 * scale}px Roboto`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    wrapText(ctx, drinkMatch, width / 2, 625 * scale, 420 * scale, 26 * scale);

    // Draw vibes with adjusted positioning
    if (vibes && vibes.length > 0) {
      ctx.font = `bold ${14 * scale}px Roboto`;
      const vibeY = 710 * scale;
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

    // Draw footer with better spacing from bottom
    const footerY = 800 * scale;
    
    // Draw decorative line above footer
    ctx.strokeStyle = 'rgba(106, 76, 156, 0.3)';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(width * 0.25, footerY);
    ctx.lineTo(width * 0.75, footerY);
    ctx.stroke();
    
    // Draw boba cup emoji/icon
    ctx.font = `${30 * scale}px Roboto`;
    ctx.fillText('🧋', width / 2, footerY + 35 * scale);
    
    // Draw main footer text
    ctx.fillStyle = '#6a4c9c';
    ctx.font = `bold ${12 * scale}px Roboto`;
    ctx.textAlign = 'center';
    ctx.fillText(
      'F I N D  Y O U R  M A T C H  A T',
      width / 2,
      footerY + 62 * scale
    );
    
    // Draw brand name larger
    ctx.font = `900 ${16 * scale}px Roboto`;
    ctx.fillStyle = '#6a4c9c';
    ctx.fillText(
      'A N G E L  T E A',
      width / 2,
      footerY + 84 * scale
    );

    // Convert to buffer
    const buffer = canvas.toBuffer('image/png');

    const response = new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

    // Add rate limit headers to successful response
    return addRateLimitHeaders(response, rateLimitResult);
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

// Helper function to wrap text with vertical centering
function wrapText(
  ctx: NodeCanvasContext,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';

  // First pass: determine all lines
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      lines.push(line.trim());
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  // Calculate total height and center the block
  const totalHeight = (lines.length - 1) * lineHeight;
  let currentY = y - (totalHeight / 2);

  // Second pass: draw centered text
  lines.forEach((textLine) => {
    ctx.fillText(textLine, x, currentY);
    currentY += lineHeight;
  });
}
