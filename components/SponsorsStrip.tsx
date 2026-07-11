'use client';

import Image from 'next/image';

const SPONSORS = [
  { name: 'Xtreme Mining',   src: '/sponsors/xtreme-mining.png'   },
  { name: 'CMPC',            src: '/sponsors/cmpc.png'            },
  { name: 'Avianca',         src: '/sponsors/avianca.png'         },
  { name: 'El Colorado',     src: '/sponsors/el-colorado.png'     },
  { name: 'Subaru',          src: '/sponsors/subaru.png'          },
  { name: 'Atakama Roofing', src: '/sponsors/atakama-roofing.png' },
];

// Triplicados para loop infinito sin corte visible
const TRACK = [...SPONSORS, ...SPONSORS, ...SPONSORS];

// Todos son 1320×362 → ratio 3.64
const ASPECT = 3.64;

type Props = {
  logoHeight?: number;
};

export default function SponsorsStrip({ logoHeight = 56 }: Props) {
  const logoWidth = Math.round(logoHeight * ASPECT);

  return (
    <div className="bg-white border-t border-gray-100 overflow-hidden py-4">
      <div className="flex items-center animate-sponsors-scroll" style={{ gap: '80px' }}>
        {TRACK.map((s, i) => (
          <div key={i} className="shrink-0 flex items-center justify-center" style={{ height: logoHeight }}>
            <Image
              src={s.src}
              alt={s.name}
              width={logoWidth}
              height={logoHeight}
              className="object-contain"
              style={{ height: logoHeight, width: 'auto' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
