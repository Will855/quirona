/**
 * Generador de sonido retro para alertas de nuevos pedidos mediante Web Audio API puro.
 * No requiere archivos MP3 externos ni dependencias pesadas.
 */
export function playOrderChime() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Acorde ascendente retro tipo caja registradora / campanilla: Mi5 -> Sol#5 -> Si5
    const notes = [
      { freq: 659.25, time: 0.0, dur: 0.12 },
      { freq: 830.61, time: 0.09, dur: 0.14 },
      { freq: 987.77, time: 0.20, dur: 0.32 },
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Tono cálido y suave
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + dur + 0.05);
    });
  } catch {
    // Si el navegador tiene políticas estrictas de autoplay antes de la primera interacción, silenciar sin error
  }
}
