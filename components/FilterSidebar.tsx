'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { CATEGORIES, REGIONS, CONDITIONS, getCategoryById } from '@/lib/categories';

type Props = {
  selectedCategory?: string;
};

export default function FilterSidebar({ selectedCategory }: Props) {
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
      // Reset page on filter change
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const category = selectedCategory ? getCategoryById(selectedCategory) : null;
  const filterableSpecs = category?.specs.filter((s) => s.filterable) ?? [];

  const currentCategory = searchParams.get('categoria') ?? selectedCategory ?? '';
  const currentRegion = searchParams.get('region') ?? '';
  const currentCondition = searchParams.get('condition') ?? '';
  const currentSort = searchParams.get('sort') ?? 'recent';
  const minPrice = searchParams.get('min_price') ?? '';
  const maxPrice = searchParams.get('max_price') ?? '';

  const handleReset = () => {
    router.push(pathname);
  };

  return (
    <aside className="w-full space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-5">
        {/* Sort */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Ordenar por
          </h3>
          <select
            value={currentSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
          >
            <option value="recent">Más recientes</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
          </select>
        </div>

        {/* Category (only show on homepage) */}
        {!selectedCategory && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Categoría
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => updateParam('categoria', null)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  !currentCategory
                    ? 'bg-navy-700 text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Todas las categorías
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam('categoria', cat.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    currentCategory === cat.id
                      ? 'bg-navy-700 text-white font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price range */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Precio (CLP)
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Mín"
              value={minPrice}
              onChange={(e) => updateParam('min_price', e.target.value || null)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-400"
            />
            <input
              type="number"
              placeholder="Máx"
              value={maxPrice}
              onChange={(e) => updateParam('max_price', e.target.value || null)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-400"
            />
          </div>
        </div>

        {/* Condition */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Estado
          </h3>
          <div className="space-y-1">
            {CONDITIONS.map((c) => (
              <button
                key={c.value}
                onClick={() =>
                  updateParam('condition', currentCondition === c.value ? null : c.value)
                }
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  currentCondition === c.value
                    ? 'bg-navy-700 text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Region */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Región
          </h3>
          <select
            value={currentRegion}
            onChange={(e) => updateParam('region', e.target.value || null)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
          >
            <option value="">Todas las regiones</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Category-specific spec filters */}
        {filterableSpecs.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Especificaciones
            </h3>
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
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
                      >
                        <option value="">Todos</option>
                        {spec.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (spec.type === 'boolean') {
                  return (
                    <label key={spec.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentValue === 'true'}
                        onChange={(e) =>
                          updateParam(paramKey, e.target.checked ? 'true' : null)
                        }
                        className="rounded border-gray-300 text-navy-700 focus:ring-navy-500"
                      />
                      <span className="text-sm text-gray-700">{spec.label}</span>
                    </label>
                  );
                }

                if (spec.type === 'number') {
                  return (
                    <div key={spec.key}>
                      <label className="block text-xs text-gray-600 mb-1">
                        {spec.label} {spec.unit && `(${spec.unit})`}
                      </label>
                      <input
                        type="number"
                        placeholder="Cualquier valor"
                        value={currentValue}
                        onChange={(e) => updateParam(paramKey, e.target.value || null)}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-400"
                      />
                    </div>
                  );
                }

                return (
                  <div key={spec.key}>
                    <label className="block text-xs text-gray-600 mb-1">{spec.label}</label>
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={currentValue}
                      onChange={(e) => updateParam(paramKey, e.target.value || null)}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-400"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reset */}
        <button
          onClick={handleReset}
          className="w-full text-sm text-gray-500 hover:text-red-600 py-2 border border-gray-200 rounded-lg hover:border-red-300 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </aside>
  );
}
