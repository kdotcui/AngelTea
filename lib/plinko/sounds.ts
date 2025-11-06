// Simple sound effects using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;
  
  private initAudioContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();
    }
  }

  // Peg hit sound - short click
  playPegHit(volume: number = 0.15) {
    this.initAudioContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 800 + Math.random() * 200; // Random pitch
    gainNode.gain.value = volume;

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }

  // Ball drop sound
  playDrop(volume: number = 0.2) {
    this.initAudioContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 150;
    gainNode.gain.value = volume;

    oscillator.start();
    oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // Win sound - happy chime
  playWin(volume: number = 0.3) {
    this.initAudioContext();
    if (!this.audioContext) return;

    const frequencies = [523.25, 659.25, 783.99]; // C, E, G chord
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      oscillator.frequency.value = freq;
      gainNode.gain.value = volume;

      const startTime = this.audioContext!.currentTime + index * 0.1;
      oscillator.start(startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      oscillator.stop(startTime + 0.3);
    });
  }
}

export const soundManager = new SoundManager();

