'use client';

import Image from 'next/image';

const SPONSORS = [
  { name: 'Avianca', src: '/sponsors/avianca.svg', aspect: 3.2 },
  { name: 'CMPC', src: '/sponsors/cmpc.png', aspect: 1.9 },
  { name: 'Xtreme Mining', src: '/sponsors/xtreme-mining.png', aspect: 3.6 },
];

// Triplicados para loop infinito sin corte visible
const TRACK = [...SPONSORS, ...SPONSORS, ...SPONSORS];

type Props = {
  logoHeight?: number; // px
};

export default function SponsorsStrip({ logoHeight = 56 }: Props) {
  return (
    <div className="bg-white border-t border-gray-100 overflow-hidden py-4">
      <div className="relative">
        <div className="flex items-center animate-sponsors-scroll" style={{ gap: '72px' }}>
          {TRACK.map((s, i) => (
            <div
              key={i}
              className="shrink-0 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-300"
              style={{ height: logoHeight }}
            >
              <Image
                src={s.src}
                alt={s.name}
                width={Math.round(logoHeight * s.aspect)}
                height={logoHeight}
                className="object-contain"
                style={{ height: logoHeight, width: 'auto', maxWidth: Math.round(logoHeight * s.aspect) }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
