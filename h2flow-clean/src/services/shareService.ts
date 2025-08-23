// src/services/shareService.ts

interface Achievement {
  emoji: string;
  title: string;
  description: string;
  bgColor: string;
}

interface ShareData {
  achievement: Achievement;
  stats: {
    totalFasts: number;
    longestFast: number;
    completionRate: number;
    currentStreak?: number;
  };
  userName?: string;
}

export class ShareService {
  private static createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  private static drawGradientBackground(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number,
    color1: string,
    color2: string
  ) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  private static getAchievementColors(bgColor: string) {
    const colorMap: Record<string, { primary: string; secondary: string; text: string }> = {
      'bg-yellow-50': { primary: '#FEF3C7', secondary: '#F59E0B', text: '#92400E' },
      'bg-purple-50': { primary: '#FAF5FF', secondary: '#8B5CF6', text: '#6B21A8' },
      'bg-green-50': { primary: '#F0FDF4', secondary: '#22C55E', text: '#15803D' },
      'bg-blue-50': { primary: '#EFF6FF', secondary: '#3B82F6', text: '#1E40AF' },
      'bg-indigo-50': { primary: '#EEF2FF', secondary: '#6366F1', text: '#3730A3' },
      'bg-emerald-50': { primary: '#ECFDF5', secondary: '#10B981', text: '#047857' },
      'bg-orange-50': { primary: '#FFF7ED', secondary: '#F97316', text: '#C2410C' },
      'bg-red-50': { primary: '#FEF2F2', secondary: '#EF4444', text: '#DC2626' },
    };
    return colorMap[bgColor] || { primary: '#F3F4F6', secondary: '#6B7280', text: '#374151' };
  }

  static async generateAchievementImage(data: ShareData): Promise<Blob> {
    const canvas = this.createCanvas(800, 600);
    const ctx = canvas.getContext('2d')!;
    
    const colors = this.getAchievementColors(data.achievement.bgColor);

    // Background gradient
    this.drawGradientBackground(ctx, 800, 600, colors.primary, '#FFFFFF');

    // Main card background
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.fillRect(50, 50, 700, 500);
    ctx.shadowColor = 'transparent';

    // Header section
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(50, 50, 700, 120);

    // H2Flow logo/title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('H2Flow', 80, 100);
    
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('Extended Water Fasting', 80, 125);

    // Date
    ctx.textAlign = 'right';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText(new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }), 720, 125);

    // Achievement emoji (large)
    ctx.font = '120px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(data.achievement.emoji, 400, 280);

    // Achievement title
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillText(data.achievement.title, 400, 340);

    // Achievement description
    ctx.fillStyle = colors.secondary;
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText(data.achievement.description, 400, 380);

    // Stats section
    ctx.fillStyle = '#6B7280';
    ctx.font = '18px Arial, sans-serif';
    ctx.textAlign = 'left';
    
    const statsY = 450;
    const statsX = 100;
    
    ctx.fillText(`Total Fasts: ${data.stats.totalFasts}`, statsX, statsY);
    ctx.fillText(`Longest Fast: ${data.stats.longestFast.toFixed(1)}h`, statsX + 200, statsY);
    ctx.fillText(`Success Rate: ${data.stats.completionRate.toFixed(1)}%`, statsX + 400, statsY);
    
    if (data.stats.currentStreak) {
      ctx.fillText(`Current Streak: ${data.stats.currentStreak} days`, statsX + 150, statsY + 30);
    }

    // User name (if provided)
    if (data.userName) {
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Achieved by ${data.userName}`, 400, 520);
    }

    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 0.9);
    });
  }

  static async shareAchievement(
    achievement: Achievement, 
    stats: any, 
    userName?: string
  ): Promise<boolean> {
    try {
      const shareData: ShareData = {
        achievement,
        stats: {
          totalFasts: stats.totalFasts,
          longestFast: stats.longestFast,
          completionRate: stats.completionRate,
          currentStreak: stats.currentStreak
        },
        userName
      };

      const imageBlob = await this.generateAchievementImage(shareData);
      
      // Create file from blob
      const file = new File([imageBlob], 'achievement.png', { type: 'image/png' });
      
      const shareText = `🎉 Just unlocked "${achievement.title}" on H2Flow! ${achievement.description} #FastingJourney #H2Flow`;
      
      // Check if Web Share API is supported and can share files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `H2Flow Achievement: ${achievement.title}`,
          text: shareText,
          files: [file]
        });
        return true;
      } else {
        // Fallback: download the image and copy text to clipboard
        this.downloadImage(imageBlob, `h2flow-${achievement.title.toLowerCase().replace(/\s+/g, '-')}.png`);
        
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareText);
          alert('Image downloaded and text copied to clipboard! You can now share manually.');
        } else {
          alert('Image downloaded! You can now share it manually.');
        }
        return true;
      }
    } catch (error) {
      console.error('Error sharing achievement:', error);
      return false;
    }
  }

  private static downloadImage(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async copyAchievementText(achievement: Achievement, stats: any): Promise<boolean> {
    try {
      const text = `🎉 Just unlocked "${achievement.title}" on H2Flow! ${achievement.description} #FastingJourney #H2Flow`;
      
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error copying text:', error);
      return false;
    }
  }
}
