'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const SPONSORS = [
  { name: 'Avianca', src: '/sponsors/avianca.svg', width: 200, height: 60 },
  { name: 'CMPC', src: '/sponsors/cmpc.png', width: 160, height: 60 },
  { name: 'Xtreme Mining', src: '/sponsors/xtreme-mining.png', width: 220, height: 60 },
  { name: 'El Colorado', src: '/sponsors/el-colorado.png', width: 220, height: 60 },
  { name: 'Subaru', src: '/sponsors/subaru.png', width: 220, height: 60 },
  { name: 'Atakama Roofing', src: '/sponsors/atakama-roofing.png', width: 220, height: 60 },
];

export default function SponsorsCarousel() {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActive((prev) => (prev + 1) % SPONSORS.length);
        setFading(false);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const sponsor = SPONSORS[active];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 mb-6">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-4">
        Auspiciadores
      </p>
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <div
          className="flex items-center justify-center h-16 transition-opacity duration-400"
          style={{ opacity: fading ? 0 : 1 }}
        >
          <Image
            src={sponsor.src}
            alt={sponsor.name}
            width={sponsor.width}
            height={sponsor.height}
            className="object-contain"
            style={{ maxHeight: '60px', width: 'auto' }}
          />
        </div>

        {/* Dots */}
        <div className="flex gap-2">
          {SPONSORS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setFading(true); setTimeout(() => { setActive(i); setFading(false); }, 400); }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === active ? 'bg-navy-700 w-4' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={SPONSORS[i].name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
