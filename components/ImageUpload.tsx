'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';

type Props = {
  images: File[];
  onChange: (files: File[]) => void;
  maxImages?: number;
};

export default function ImageUpload({ images, onChange, maxImages = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const [sizeError, setSizeError] = useState<string | null>(null);

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      setSizeError(null);
      const tooBig: string[] = [];
      const valid = Array.from(files).filter((f) => {
        if (!f.type.startsWith('image/')) return false;
        if (f.size > 5 * 1024 * 1024) {
          tooBig.push(f.name);
          return false;
        }
        return true;
      });
      if (tooBig.length > 0) {
        setSizeError(`${tooBig.length} foto${tooBig.length > 1 ? 's superan' : ' supera'} los 5 MB y no se agregó. Comprime la imagen antes de subirla.`);
      }
      const combined = [...images, ...valid].slice(0, maxImages);
      onChange(combined);
    },
    [images, onChange, maxImages]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const moveImage = (from: number, to: number) => {
    const updated = [...images];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-navy-500 bg-navy-50'
            : 'border-gray-300 hover:border-navy-400 hover:bg-gray-50'
        } ${images.length >= maxImages ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <svg
          className="mx-auto w-10 h-10 text-gray-400 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm text-gray-600 font-medium">
          {images.length >= maxImages
            ? `Máximo ${maxImages} imágenes alcanzado`
            : 'Arrastra fotos aquí o haz clic para seleccionar'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {images.length}/{maxImages} fotos · JPG, PNG, WEBP · máx 5 MB c/u
        </p>
      </div>

      {sizeError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          ⚠️ {sizeError}
        </p>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((file, index) => {
            const url = URL.createObjectURL(file);
            return (
              <div key={index} className="relative group aspect-square">
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent group-hover:border-navy-400 transition-colors">
                  <Image
                    src={url}
                    alt={`Imagen ${index + 1}`}
                    fill
                    className="object-cover"
                    onLoad={() => URL.revokeObjectURL(url)}
                  />
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-navy-700/80 text-white text-xs text-center py-0.5">
                      Principal
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>

                {/* Move arrows */}
                <div className="absolute bottom-1 left-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); moveImage(index, index - 1); }}
                      className="bg-black/50 hover:bg-black/70 text-white rounded w-4 h-4 flex items-center justify-center text-xs"
                      title="Mover izquierda"
                    >
                      ←
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); moveImage(index, index + 1); }}
                      className="bg-black/50 hover:bg-black/70 text-white rounded w-4 h-4 flex items-center justify-center text-xs"
                      title="Mover derecha"
                    >
                      →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-500">
        La primera imagen será la foto principal del anuncio. Puedes reordenar con las flechas.
      </p>
    </div>
  );
}
