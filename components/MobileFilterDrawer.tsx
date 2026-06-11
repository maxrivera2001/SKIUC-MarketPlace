'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CATEGORIES, REGIONS, CONDITIONS, getCategoryById } from '@/lib/categories';

type Props = {
  selectedCategory?: string;
};

export default function MobileFilterDrawer({ selectedCategory }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleReset = () => {
    router.push(pathname);
    setOpen(false);
  };

  const category = selectedCategory ? getCategoryById(selectedCategory) : null;
  const filterableSpecs = category?.specs.filter((s) => s.filterable) ?? [];

  const currentCategory = searchParams.get('categoria') ?? selectedCategory ?? '';
  const currentRegion = searchParams.get('region') ?? '';
  const currentCondition = searchParams.get('condition') ?? '';
  const currentSort = searchParams.get('sort') ?? 'recent';
  const minPrice = searchParams.get('min_price') ?? '';
  const maxPrice = searchParams.get('max_price') ?? '';

  // Count active filters (excluding sort and q)
  const activeCount = ['categoria', 'region', 'condition', 'min_price', 'max_price']
    .filter((k) => searchParams.get(k))
    .length + Array.from(searchParams.keys()).filter(k => k.startsWith('spec_')).length;

  return (
    <>
      {/* Fixed bottom bar — mobile only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 shadow-lg">
        {/* Sort dropdown */}
        <div className="flex-1">
          <select
            value={currentSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-navy-400 font-medium text-gray-700"
          >
            <option value="recent">Más recientes</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
          </select>
        </div>

        {/* Filter button */}
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-navy-700 hover:bg-navy-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors relative"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Drawer overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Filtros</h3>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <button
                    onClick={handleReset}
                    className="text-sm text-red-600 font-medium hover:text-red-700"
                  >
                    Limpiar ({activeCount})
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5 pb-6">
              {/* Category (only on homepage) */}
              {!selectedCategory && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Categoría
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateParam('categoria', null)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        !currentCategory
                          ? 'bg-navy-700 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Todas
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => updateParam('categoria', cat.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                          currentCategory === cat.id
                            ? 'bg-navy-700 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Precio (CLP)
                </h4>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Mínimo"
                      value={minPrice}
                      onChange={(e) => updateParam('min_price', e.target.value || null)}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy-400"
                    />
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">—</div>
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Máximo"
                      value={maxPrice}
                      onChange={(e) => updateParam('max_price', e.target.value || null)}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy-400"
                    />
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Estado
                </h4>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() =>
                        updateParam('condition', currentCondition === c.value ? null : c.value)
                      }
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        currentCondition === c.value
                          ? 'bg-navy-700 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Region */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Región
                </h4>
                <select
                  value={currentRegion}
                  onChange={(e) => updateParam('region', e.target.value || null)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
                >
                  <option value="">Todas las regiones</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Spec filters */}
              {filterableSpecs.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Especificaciones
                  </h4>
                  <div className="space-y-3">
                    {filterableSpecs.map((spec) => {
                      const paramKey = `spec_${spec.key}`;
                      const currentValue = searchParams.get(paramKey) ?? '';

                      if (spec.type === 'select' && spec.options) {
                        return (
                          <div key={spec.key}>
                            <label className="block text-xs text-gray-600 mb-1">{spec.label}</label>
                            <select
                              value={currentValue}
                              onChange={(e) => updateParam(paramKey, e.target.value || null)}
                              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
                            >
                              <option value="">Todos</option>
                              {spec.options.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        );
                      }

                      if (spec.type === 'boolean') {
                        return (
                          <label key={spec.key} className="flex items-center gap-3 cursor-pointer py-1">
                            <input
                              type="checkbox"
                              checked={currentValue === 'true'}
                              onChange={(e) => updateParam(paramKey, e.target.checked ? 'true' : null)}
                              className="w-5 h-5 rounded border-gray-300 text-navy-700 focus:ring-navy-500"
                            />
                            <span className="text-sm text-gray-700">{spec.label}</span>
                          </label>
                        );
                      }

                      return (
                        <div key={spec.key}>
                          <label className="block text-xs text-gray-600 mb-1">
                            {spec.label} {spec.unit && `(${spec.unit})`}
                          </label>
                          <input
                            type="text"
                            placeholder="Filtrar..."
                            value={currentValue}
                            onChange={(e) => updateParam(paramKey, e.target.value || null)}
                            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy-400"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Apply button */}
            <div className="px-5 pb-8 pt-3 border-t border-gray-100">
              <button
                onClick={() => setOpen(false)}
                className="w-full bg-navy-700 hover:bg-navy-800 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
