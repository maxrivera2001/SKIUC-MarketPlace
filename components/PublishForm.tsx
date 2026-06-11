'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from './ImageUpload';
import { CATEGORIES, REGIONS, ESTACIONES, CONDITIONS, getCategoryById } from '@/lib/categories';

type Step = 'category' | 'details' | 'specs' | 'images' | 'contact' | 'review';

const STEPS: Step[] = ['category', 'details', 'specs', 'images', 'contact', 'review'];
const STEP_LABELS: Record<Step, string> = {
  category: 'Categoría',
  details: 'Detalles',
  specs: 'Especificaciones',
  images: 'Fotos',
  contact: 'Contacto',
  review: 'Revisión',
};

function formatCLP(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('es-CL');
}

function parseCLP(formatted: string): string {
  return formatted.replace(/\./g, '').replace(/,/g, '');
}

export default function PublishForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('category');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceDisplay, setPriceDisplay] = useState(''); // formatted for display
  const [condition, setCondition] = useState('');
  const [region, setRegion] = useState('');
  const [estacion, setEstacion] = useState('');
  const [specs, setSpecs] = useState<Record<string, string | boolean>>({});
  const [customTalla, setCustomTalla] = useState<Record<string, string>>({});
  const [images, setImages] = useState<File[]>([]);
  const [phone, setPhone] = useState('');
  const [nombre, setNombre] = useState('');

  const category = getCategoryById(categoryId);
  const currentStepIndex = STEPS.indexOf(step);

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) setStep(STEPS[nextIndex]);
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) setStep(STEPS[prevIndex]);
  };

  const rawPrice = parseCLP(priceDisplay);

  const canGoNext = (): boolean => {
    switch (step) {
      case 'category':
        return !!categoryId;
      case 'details':
        return !!(title.trim() && rawPrice && condition);
      case 'specs':
        return true;
      case 'images':
        return images.length >= 1;
      case 'contact':
        return !!(phone.trim() && nombre.trim());
      case 'review':
        return true;
      default:
        return true;
    }
  };

  const handleSpecChange = (key: string, value: string | boolean) => {
    setSpecs((prev) => ({ ...prev, [key]: value }));
    // Clear custom talla if switching away from Otro
    if (value !== 'Otro') {
      setCustomTalla((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // Returns the final value for a spec key (resolves "Otro" to custom text)
  const resolvedSpec = (key: string): string | boolean => {
    const val = specs[key];
    if (val === 'Otro' && customTalla[key]) return customTalla[key];
    return val ?? '';
  };

  const isSpecVisible = (spec: { key: string; conditional?: { field: string; value: boolean | string } }): boolean => {
    if (!spec.conditional) return true;
    return specs[spec.conditional.field] === spec.conditional.value;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      // Upload images first
      const imageUrls: string[] = [];
      for (const file of images) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error ?? 'Error al subir imagen');
        }
        const data = await res.json();
        imageUrls.push(data.url);
      }

      // Build resolved specs
      const resolvedSpecs: Record<string, string | boolean> = {};
      for (const key of Object.keys(specs)) {
        resolvedSpecs[key] = resolvedSpec(key);
      }

      // Create listing
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: parseInt(rawPrice, 10),
          condition,
          category_id: categoryId,
          specs: resolvedSpecs,
          images: imageUrls,
          region,
          estacion,
          phone: phone.trim(),
          nombre: nombre.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Error al publicar');
      }

      const data = await res.json();
      router.push(`/articulo/${data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step progress */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 transition-colors ${
                i < currentStepIndex
                  ? 'bg-navy-700 text-white'
                  : i === currentStepIndex
                  ? 'bg-navy-700 text-white ring-4 ring-navy-100'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i < currentStepIndex ? '✓' : i + 1}
            </div>
            <div className="hidden sm:block ml-1 text-xs text-gray-500">{STEP_LABELS[s]}</div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 rounded ${
                  i < currentStepIndex ? 'bg-navy-700' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        {/* STEP: Category */}
        {step === 'category' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">¿Qué quieres vender?</h2>
            <p className="text-sm text-gray-500 mb-6">Elige la categoría de tu artículo</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                    categoryId === cat.id
                      ? 'border-navy-700 bg-navy-50 text-navy-700'
                      : 'border-gray-200 text-gray-700 hover:border-navy-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP: Details */}
        {step === 'details' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Detalles del artículo</h2>
              <p className="text-sm text-gray-500">Describe tu artículo con claridad</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Ej: ${category?.label ?? ''} ${category?.specs.find(s => s.key === 'marca') ? '+ Marca' : ''}`}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
                maxLength={120}
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
                placeholder="Describe el estado, uso, accesorios incluidos, motivo de venta..."
                rows={4}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent resize-none"
                maxLength={2000}
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
                    placeholder="300.000"
                    className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent bg-white"
                >
                  <option value="">Seleccionar...</option>
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Región <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent bg-white"
                >
                  <option value="">Seleccionar...</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estación más cercana <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                </label>
                <select
                  value={estacion}
                  onChange={(e) => setEstacion(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent bg-white"
                >
                  <option value="">Seleccionar...</option>
                  {ESTACIONES.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP: Specs */}
        {step === 'specs' && category && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Especificaciones de {category.label}
              </h2>
              <p className="text-sm text-gray-500">Todos los campos son opcionales pero ayudan a vender más rápido</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {category.specs.map((spec) => {
                if (!isSpecVisible(spec)) return null;

                return (
                  <div key={spec.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {spec.label}
                      {spec.unit && <span className="text-gray-400 font-normal ml-1">({spec.unit})</span>}
                      <span className="text-gray-400 font-normal text-xs ml-1">(opcional)</span>
                    </label>

                    {spec.type === 'select' && spec.options ? (
                      <div>
                        <select
                          value={(specs[spec.key] as string) ?? ''}
                          onChange={(e) => handleSpecChange(spec.key, e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
                        >
                          <option value="">Seleccionar...</option>
                          {spec.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        {specs[spec.key] === 'Otro' && (
                          <input
                            type="text"
                            value={customTalla[spec.key] ?? ''}
                            onChange={(e) => setCustomTalla((prev) => ({ ...prev, [spec.key]: e.target.value }))}
                            placeholder="Especifica la talla..."
                            className="w-full mt-2 border border-navy-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
                          />
                        )}
                      </div>
                    ) : spec.type === 'boolean' ? (
                      <label className="flex items-center gap-3 cursor-pointer mt-2">
                        <input
                          type="checkbox"
                          checked={(specs[spec.key] as boolean) ?? false}
                          onChange={(e) => handleSpecChange(spec.key, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-navy-700 focus:ring-navy-500"
                        />
                        <span className="text-sm text-gray-600">Sí</span>
                      </label>
                    ) : (
                      <input
                        type={spec.type === 'number' ? 'text' : 'text'}
                        inputMode={spec.type === 'number' ? 'decimal' : 'text'}
                        value={(specs[spec.key] as string) ?? ''}
                        onChange={(e) => handleSpecChange(spec.key, e.target.value)}
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

        {/* STEP: Images */}
        {step === 'images' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Fotos del artículo</h2>
              <p className="text-sm text-gray-500">
                Agrega entre 1 y 3 fotos (máx 5 MB c/u). La primera será la imagen principal.
              </p>
            </div>
            <ImageUpload images={images} onChange={setImages} maxImages={3} />
          </div>
        )}

        {/* STEP: Contact */}
        {step === 'contact' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Datos de contacto</h2>
              <p className="text-sm text-gray-500">
                Tu teléfono solo se mostrará a quienes hagan clic en el botón de contacto.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono (WhatsApp) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 py-3 bg-gray-100 border border-gray-300 rounded-l-xl text-sm text-gray-600 border-r-0">
                  +56
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9 1234 5678"
                  className="flex-1 border border-gray-300 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Se usará para el botón de WhatsApp. No se mostrará directamente.
              </p>
            </div>
          </div>
        )}

        {/* STEP: Review */}
        {step === 'review' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Revisar y publicar</h2>
              <p className="text-sm text-gray-500">Confirma los datos antes de publicar</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Categoría</span>
                <span className="font-medium">{category?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Título</span>
                <span className="font-medium truncate max-w-48">{title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Precio</span>
                <span className="font-bold text-navy-700">
                  ${priceDisplay}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estado</span>
                <span className="font-medium">
                  {CONDITIONS.find((c) => c.value === condition)?.label}
                </span>
              </div>
              {region && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Región</span>
                  <span className="font-medium">{region}</span>
                </div>
              )}
              {estacion && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Estación</span>
                  <span className="font-medium">{estacion}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Fotos</span>
                <span className="font-medium">{images.length} foto{images.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contacto</span>
                <span className="font-medium">{nombre}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={goBack}
            disabled={currentStepIndex === 0}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>

          {step === 'review' ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-navy-700 hover:bg-navy-800 text-white font-semibold px-8 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Publicando...
                </>
              ) : (
                'Publicar artículo'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext()}
              className="bg-navy-700 hover:bg-navy-800 text-white font-semibold px-8 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
