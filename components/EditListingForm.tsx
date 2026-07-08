'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CATEGORIES, REGIONS, ESTACIONES, CONDITIONS, getCategoryById } from '@/lib/categories';
import type { Listing } from '@/lib/supabase';

function formatCLP(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('es-CL');
}

function parseCLP(formatted: string): string {
  return formatted.replace(/\./g, '').replace(/,/g, '');
}

type EditImageManagerProps = {
  existingUrls: string[];
  newFiles: File[];
  onExistingChange: (urls: string[]) => void;
  onNewFilesChange: (files: File[]) => void;
  maxTotal?: number;
};

function EditImageManager({
  existingUrls,
  newFiles,
  onExistingChange,
  onNewFilesChange,
  maxTotal = 3,
}: EditImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const total = existingUrls.length + newFiles.length;

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      setSizeError(null);
      const tooBig: string[] = [];
      const valid = Array.from(files).filter((f) => {
        if (!f.type.startsWith('image/')) return false;
        if (f.size > 3 * 1024 * 1024) {
          tooBig.push(f.name);
          return false;
        }
        return true;
      });
      if (tooBig.length > 0) {
        setSizeError(`${tooBig.length} foto${tooBig.length > 1 ? 's superan' : ' supera'} los 3 MB.`);
      }
      const combined = [...newFiles, ...valid].slice(0, maxTotal - existingUrls.length);
      onNewFilesChange(combined);
    },
    [newFiles, existingUrls.length, onNewFilesChange, maxTotal]
  );

  const removeExisting = (index: number) => {
    onExistingChange(existingUrls.filter((_, i) => i !== index));
  };

  const removeNew = (index: number) => {
    onNewFilesChange(newFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragging ? 'border-navy-500 bg-navy-50' : 'border-gray-300 hover:border-navy-400 hover:bg-gray-50'
        } ${total >= maxTotal ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <svg className="mx-auto w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-gray-600 font-medium">
          {total >= maxTotal ? `Máximo ${maxTotal} imágenes alcanzado` : 'Arrastra fotos o haz clic para agregar'}
        </p>
        <p className="text-xs text-gray-400 mt-1">{total}/{maxTotal} fotos · máx 3 MB c/u</p>
      </div>

      {sizeError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{sizeError}</p>
      )}

      {(existingUrls.length > 0 || newFiles.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {existingUrls.map((url, i) => (
            <div key={`existing-${i}`} className="relative group aspect-square">
              <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100 border-2 border-navy-200">
                <Image src={url} alt={`Imagen ${i + 1}`} fill className="object-cover" />
                {i === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-navy-700/80 text-white text-xs text-center py-0.5">
                    Principal
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeExisting(i)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
          {newFiles.map((file, i) => {
            const url = URL.createObjectURL(file);
            return (
              <div key={`new-${i}`} className="relative group aspect-square">
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100 border-2 border-green-300">
                  <Image src={url} alt={`Nueva imagen ${i + 1}`} fill className="object-cover" onLoad={() => URL.revokeObjectURL(url)} />
                  <div className="absolute top-0 left-0 right-0 bg-green-600/80 text-white text-xs text-center py-0.5">
                    Nueva
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  className="absolute bottom-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

type Props = {
  listing: Listing;
};

export default function EditListingForm({ listing }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const category = getCategoryById(listing.category_id);
  const existingSpecs = listing.specs as Record<string, string | boolean>;

  // Form state
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description ?? '');
  const [priceDisplay, setPriceDisplay] = useState(
    listing.price.toLocaleString('es-CL')
  );
  const [condition, setCondition] = useState<'nuevo' | 'como_nuevo' | 'bueno' | 'regular'>(listing.condition);
  const [region, setRegion] = useState(listing.region ?? '');
  const [estacion, setEstacion] = useState(listing.estacion ?? '');
  const [specs, setSpecs] = useState<Record<string, string | boolean>>(existingSpecs);
  const [existingImages, setExistingImages] = useState<string[]>(listing.images ?? []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  const rawPrice = parseCLP(priceDisplay);

  const isSpecVisible = (spec: { key: string; conditional?: { field: string; value: boolean | string } }): boolean => {
    if (!spec.conditional) return true;
    return specs[spec.conditional.field] === spec.conditional.value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('El título es requerido'); return; }
    if (!rawPrice || parseInt(rawPrice, 10) <= 0) { setError('El precio es inválido'); return; }
    if (existingImages.length + newImageFiles.length === 0) { setError('Al menos una imagen es requerida'); return; }

    setSubmitting(true);
    setError(null);

    try {
      // Upload new images
      const newUrls: string[] = [];
      for (const file of newImageFiles) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error ?? 'Error al subir imagen');
        }
        const data = await res.json();
        newUrls.push(data.url);
      }

      const finalImages = [...existingImages, ...newUrls];

      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: parseInt(rawPrice, 10),
          condition,
          specs,
          images: finalImages,
          region,
          estacion,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Error al guardar');
      }

      router.push(`/articulo/${listing.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Basic info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-base font-bold text-gray-900">Detalles del artículo</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
          />
          <p className="text-xs text-gray-400 mt-1">{title.length}/120</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción <span className="text-gray-400 font-normal text-xs">(opcional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={2000}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{description.length}/2000</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio (CLP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={priceDisplay}
                onChange={(e) => setPriceDisplay(formatCLP(e.target.value))}
                className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as 'nuevo' | 'como_nuevo' | 'bueno' | 'regular')}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
            >
              <option value="">Seleccionar...</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estación más cercana</label>
            <select
              value={estacion}
              onChange={(e) => setEstacion(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
            >
              <option value="">Seleccionar...</option>
              {ESTACIONES.map((est) => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Specs */}
      {category && category.specs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900">
            Especificaciones de {category.label}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {category.specs.map((spec) => {
              if (!isSpecVisible(spec)) return null;
              return (
                <div key={spec.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {spec.label}
                    {spec.unit && <span className="text-gray-400 font-normal ml-1">({spec.unit})</span>}
                  </label>
                  {spec.type === 'select' && spec.options ? (
                    <select
                      value={(specs[spec.key] as string) ?? ''}
                      onChange={(e) => setSpecs((prev) => ({ ...prev, [spec.key]: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
                    >
                      <option value="">Seleccionar...</option>
                      {spec.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : spec.type === 'boolean' ? (
                    <label className="flex items-center gap-3 cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        checked={(specs[spec.key] as boolean) ?? false}
                        onChange={(e) => setSpecs((prev) => ({ ...prev, [spec.key]: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-navy-700 focus:ring-navy-500"
                      />
                      <span className="text-sm text-gray-600">Sí</span>
                    </label>
                  ) : (
                    <input
                      type="text"
                      inputMode={spec.type === 'number' ? 'decimal' : 'text'}
                      value={(specs[spec.key] as string) ?? ''}
                      onChange={(e) => setSpecs((prev) => ({ ...prev, [spec.key]: e.target.value }))}
                      placeholder={spec.placeholder ? `Ej: ${spec.placeholder}` : ''}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Images */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Fotos</h2>
          <p className="text-sm text-gray-500 mt-0.5">Máx 3 fotos. Las fotos con borde verde son nuevas y aún no guardadas.</p>
        </div>
        <EditImageManager
          existingUrls={existingImages}
          newFiles={newImageFiles}
          onExistingChange={setExistingImages}
          onNewFilesChange={setNewImageFiles}
          maxTotal={3}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-navy-700 hover:bg-navy-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </button>
      </div>
    </form>
  );
}
