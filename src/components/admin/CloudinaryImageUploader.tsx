'use client';

import { useState, useRef, useCallback } from 'react';

interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

interface ImageUploaderProps {
  currentImageUrl?: string;
  onUploadComplete: (result: CloudinaryUploadResult) => void;
  onUploadError?: (error: string) => void;
  label?: string;
}

export default function CloudinaryImageUploader({
  currentImageUrl,
  onUploadComplete,
  onUploadError,
  label = 'Product Image',
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = useCallback(
    async (file: File) => {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        const msg = 'Only JPG, PNG, WebP, or GIF images are allowed.';
        setError(msg);
        onUploadError?.(msg);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        const msg = 'Image must be under 10MB.';
        setError(msg);
        onUploadError?.(msg);
        return;
      }

      setError(null);
      setUploading(true);
      setProgress(10);

      // Show local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      try {
        // Step 1: Get signed upload params from our secure API
        setProgress(20);
        const sigRes = await fetch('/api/admin/cloudinary-signature');
        if (!sigRes.ok) throw new Error('Failed to get upload signature');
        const { timestamp, signature, cloudName, apiKey, folder } = await sigRes.json();

        setProgress(40);

        // Step 2: Upload directly to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('timestamp', String(timestamp));
        formData.append('signature', signature);
        formData.append('api_key', apiKey);
        formData.append('folder', folder);
        formData.append('transformation', 'w_1200,h_1200,c_limit,q_auto:good,f_auto');

        setProgress(60);
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: formData }
        );

        if (!uploadRes.ok) throw new Error('Upload to Cloudinary failed');

        const data = await uploadRes.json();
        setProgress(100);

        onUploadComplete({ url: data.secure_url, publicId: data.public_id });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
        setError(msg);
        onUploadError?.(msg);
        setPreview(currentImageUrl || null);
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [currentImageUrl, onUploadComplete, onUploadError]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadToCloudinary(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadToCloudinary(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <label style={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>{label}</label>

      {/* Drop Zone */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? '#e91e8c' : error ? '#ef4444' : '#d1d5db'}`,
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: dragOver ? 'rgba(233,30,140,0.04)' : '#fafafa',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{
              maxHeight: '160px',
              maxWidth: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
              opacity: uploading ? 0.5 : 1,
              transition: 'opacity 0.3s',
            }}
          />
        ) : (
          <>
            <div style={{ fontSize: '40px' }}>📷</div>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              <strong style={{ color: '#e91e8c' }}>Click to choose</strong> or drag & drop
            </p>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>
              JPG, PNG, WebP · Max 10MB
            </p>
          </>
        )}

        {/* Progress bar overlay */}
        {uploading && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '4px', background: '#f3f4f6',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #e91e8c, #ff6b6b)',
              transition: 'width 0.4s ease',
              borderRadius: '0 4px 4px 0',
            }} />
          </div>
        )}
      </div>

      {/* Status messages */}
      {uploading && (
        <p style={{ margin: 0, color: '#e91e8c', fontSize: '13px', fontWeight: 500 }}>
          ⏳ Uploading image… {progress}%
        </p>
      )}
      {error && (
        <p style={{ margin: 0, color: '#ef4444', fontSize: '13px' }}>⚠️ {error}</p>
      )}
      {!uploading && !error && preview && preview !== currentImageUrl && (
        <p style={{ margin: 0, color: '#16a34a', fontSize: '13px', fontWeight: 500 }}>
          ✅ Image uploaded successfully!
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={uploading}
      />
    </div>
  );
}
