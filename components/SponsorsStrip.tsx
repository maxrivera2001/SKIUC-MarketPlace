'use client';

import Image from 'next/image';

const SPONSORS = [
  { name: 'Avianca', src: '/sponsors/avianca.svg', width: 160, height: 50 },
  { name: 'CMPC', src: '/sponsors/cmpc.png', width: 130, height: 50 },
  { name: 'Red de Salud UC Christus', src: '/sponsors/uc-christus.jpg', width: 200, height: 50 },
  { name: 'Xtreme Mining', src: '/sponsors/xtreme-mining.png', width: 180, height: 50 },
];

// Duplicados para loop infinito sin cortes
const TRACK = [...SPONSORS, ...SPONSORS, ...SPONSORS];

export default function SponsorsStrip() {
  return (
    <div className="bg-white border-t border-gray-100 py-5 overflow-hidden">
      <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Auspiciadores
      </p>
      <div className="relative">
        <div className="flex gap-16 items-center animate-sponsors-scroll">
          {TRACK.map((s, i) => (
            <div
              key={i}
              className="shrink-0 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
            >
              <Image
                src={s.src}
                alt={s.name}
                width={s.width}
                height={s.height}
                className="object-contain"
                style={{ height: '48px', width: 'auto' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
