import { useEffect, useRef } from 'react';

export const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateDimensions = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Matrix characters (Binary & hex)
    const characters = '01MATRIXCYBERSECURITY';
    const fontSize = 15;
    let columns = Math.ceil(canvas.width / fontSize);
    let drops: number[] = [];

    const initDrops = () => {
      columns = Math.ceil(canvas.width / fontSize);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
      }
    };

    initDrops();

    const draw = () => {
      ctx.fillStyle = 'rgba(255, 252, 247, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (Math.random() > 0.98) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        const alpha = Math.max(0, 1 - (drops[i] * fontSize) / canvas.height);
        
        ctx.fillStyle = `rgba(45, 90, 74, ${alpha * 0.45})`;
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 opacity-100 pointer-events-none mix-blend-multiply"
    />
  );
};

export default MatrixRain;
