
const SOUNDS = {
  // Cheerful chime
  CORRECT: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3', 
  // Gentle buzzer/fail sound
  WRONG: 'https://cdn.pixabay.com/audio/2021/08/09/audio_88447e769f.mp3',
  // Soft pop/click
  CLICK: 'https://cdn.pixabay.com/audio/2022/03/24/audio_c8c8a73467.mp3' 
};

export const playCorrectSound = () => {
  const audio = new Audio(SOUNDS.CORRECT);
  audio.volume = 0.6;
  audio.play().catch(e => console.log("Audio play failed", e));
};

export const playWrongSound = () => {
  const audio = new Audio(SOUNDS.WRONG);
  audio.volume = 0.5;
  audio.play().catch(e => console.log("Audio play failed", e));
};

export const playClickSound = () => {
  const audio = new Audio(SOUNDS.CLICK);
  audio.volume = 0.4;
  audio.play().catch(e => console.log("Audio play failed", e));
};
