import React, { useCallback } from 'react';
import { useDropzone as useReactDropzone } from 'react-dropzone';
import { ImageIcon, Loader2Icon } from 'lucide-react';

interface DropzoneProps {
  onDrop: (files: File[]) => void;
  isUploading?: boolean;
  preview?: string;
  className?: string;
}

export const Dropzone = ({ onDrop, isUploading, preview, className }: DropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useReactDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`relative h-48 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden ${
        isDragActive ? 'border-gray-400 bg-gray-50' : 'border-gray-200'
      } ${className || ''}`}
    >
      <input {...getInputProps()} />
      
      {isUploading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2Icon className="h-5 w-5 animate-spin" />
          <span>Uploading...</span>
        </div>
      ) : preview ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-contain"
            style={{ maxHeight: '100%', maxWidth: '100%' }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <ImageIcon className="h-8 w-8" />
          <span>Drag & drop or click to upload</span>
        </div>
      )}
    </div>
  );
};