'use client';

import { useRef } from 'react';

function randomColor() {
  const colors = ['red', 'yellow', 'blue', 'green'];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default function useFirework() {
  const fireworkRef = useRef<HTMLSpanElement>(null);

  function fire() {
    const el = fireworkRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const count = 8 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = `firework-particle ${randomColor()}`;
      const angle = (2 * Math.PI * i) / count;
      const distance = 24 + Math.random() * 16;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      particle.style.left = `${rect.width / 2}px`;
      particle.style.top = `${rect.height / 2}px`;
      particle.style.width = '8px';
      particle.style.height = '8px';
      particle.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      el.appendChild(particle);
      setTimeout(() => {
        particle.remove();
      }, 700);
    }
  }

  return { fireworkRef, fire };
}
