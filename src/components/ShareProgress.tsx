import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Download, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProgressStats {
  pct: number;
  totalStudyHours: number;
  xp: number;
  petLevel: number;
  currentStreak: number;
  daysToExam: number;
  totalTopics: number;
  completedTopics: number;
}

interface ShareProgressProps {
  stats: ProgressStats;
  petName: string;
  petStage: string;
  onClose: () => void;
}

function drawShareCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  stats: ProgressStats,
  petName: string,
  petStage: string,
) {
  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, '#1a1a2e');
  background.addColorStop(1, '#16213e');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(229, 57, 53, 0.1)';
  ctx.beginPath();
  ctx.arc(500, 80, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(229, 57, 53, 0.05)';
  ctx.beginPath();
  ctx.arc(100, 320, 80, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'italic bold 28px Georgia, serif';
  ctx.fillText('Pet Estudos', 30, 50);

  ctx.font = '40px sans-serif';
  ctx.fillText('\uD83D\uDC31', 30, 100);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#B0B0B0';
  ctx.fillText(`${petName} \u2022 ${petStage}`, 80, 95);

  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.moveTo(30, 120);
  ctx.lineTo(width - 30, 120);
  ctx.stroke();

  const statEntries = [
    { label: 'Horas de Estudo', value: `${stats.totalStudyHours}h` },
    { label: 'XP / Nível', value: `${stats.xp} / ${stats.petLevel}` },
    { label: 'Sequência', value: `${stats.currentStreak} dias` },
    { label: 'Progresso', value: `${Math.round(stats.pct)}%` },
    { label: 'Tópicos', value: `${stats.completedTopics}/${stats.totalTopics}` },
    { label: 'Dias p/ ENEM', value: `${stats.daysToExam}` },
  ];

  for (let i = 0; i < statEntries.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 30 + col * 280;
    const y = 155 + row * 65;

    ctx.fillStyle = '#B0B0B0';
    ctx.font = '11px sans-serif';
    ctx.fillText(statEntries[i].label.toUpperCase(), x, y);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(statEntries[i].value, x, y + 28);
  }

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '10px sans-serif';
  ctx.fillText('pet-study.app', 30, height - 20);

  ctx.fillStyle = '#E53935';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(`ENEM ${new Date().getFullYear()}`, width - 120, height - 20);
}

export function ShareProgress({ stats, petName, petStage, onClose }: ShareProgressProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 600;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    drawShareCard(ctx, width, height, stats, petName, petStage);
    setImageUrl(canvas.toDataURL('image/png'));
  }, [stats, petName, petStage]);

  const triggerDownload = useCallback(() => {
    if (!imageUrl) return;
    const anchor = document.createElement('a');
    anchor.href = imageUrl;
    anchor.download = `pet-study-progress-${new Date().toISOString().split('T')[0]}.png`;
    anchor.click();
  }, [imageUrl]);

  const copyToClipboard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const blob = await new Promise<Blob | null>(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (!blob) {
      alert('Não foi possível gerar a imagem.');
      return;
    }

    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Não foi possível copiar. Tente salvar a imagem.');
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-card-bg rounded-bento border-border p-4 md:p-6 max-w-lg w-full space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-accent-red" />
            <h3 className="text-lg font-serif italic text-text-primary">Compartilhar Progresso</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="rounded-xl overflow-hidden border border-border">
          {imageUrl && <img src={imageUrl} alt="Resumo do progresso" className="w-full" />}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-2">
          <Button onClick={triggerDownload} className="flex-1 bg-accent-red text-white hover:bg-accent-red/90">
            <Download className="w-4 h-4 mr-2" /> Salvar Imagem
          </Button>
          <Button onClick={copyToClipboard} variant="outline" className="flex-1 border-border hover:bg-white/5">
            <Copy className="w-4 h-4 mr-2" /> {copied ? 'Copiado!' : 'Copiar'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
