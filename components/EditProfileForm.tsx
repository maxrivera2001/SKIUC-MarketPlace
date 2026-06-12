'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

type EditProfileFormProps = {
  userId: string;
  defaultNombre: string;
  defaultTelefono: string;
  defaultBio: string;
  defaultAvatarUrl: string;
};

export default function EditProfileForm({
  userId,
  defaultNombre,
  defaultTelefono,
  defaultBio,
  defaultAvatarUrl,
}: EditProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nombre, setNombre] = useState(defaultNombre);
  const [telefono, setTelefono] = useState(defaultTelefono);
  const [bio, setBio] = useState(defaultBio);
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatarUrl);
  const [avatarPreview, setAvatarPreview] = useState(defaultAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Show local preview immediately
      const localUrl = URL.createObjectURL(file);
      setAvatarPreview(localUrl);

      const ext = file.name.split('.').pop();
      const path = `avatars/${userId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(path, file, { upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(path);

      setAvatarUrl(urlData.publicUrl);
      setAvatarPreview(urlData.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen');
      setAvatarPreview(defaultAvatarUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          bio: bio.trim(),
          avatar_url: avatarUrl.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Error al guardar');
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const initials = nombre.trim().charAt(0).toUpperCase() || '?';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          {avatarPreview ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 relative">
              <Image
                src={avatarPreview}
                alt="Avatar"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-navy-100 flex items-center justify-center text-navy-700 font-black text-3xl">
              {initials}
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
              <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm mb-1">Foto de perfil</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {uploading ? 'Subiendo...' : 'Cambiar foto'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <p className="text-xs text-gray-400 mt-1">O ingresa una URL abajo</p>
        </div>
      </div>

      {/* Avatar URL manual input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL de avatar <span className="text-gray-400 font-normal text-xs">(opcional)</span>
        </label>
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => { setAvatarUrl(e.target.value); setAvatarPreview(e.target.value); }}
          placeholder="https://..."
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
        />
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
          required
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
        />
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono (WhatsApp) <span className="text-gray-400 font-normal text-xs">(opcional)</span>
        </label>
        <div className="flex gap-2">
          <span className="flex items-center px-3 py-3 bg-gray-100 border border-gray-300 rounded-l-xl text-sm text-gray-600 border-r-0">
            +56
          </span>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="9 1234 5678"
            className="flex-1 border border-gray-300 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Biografía <span className="text-gray-400 font-normal text-xs">(opcional)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Cuéntanos un poco sobre ti..."
          rows={3}
          maxLength={200}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">{bio.length}/200</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          Perfil actualizado correctamente.
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-navy-700 hover:bg-navy-800 text-white font-semibold px-8 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </button>
        <a
          href={`/perfil/${userId}`}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          Ver perfil
        </a>
      </div>
    </form>
  );
}
