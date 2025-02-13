'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import { PhotoIcon, XCircleIcon, CameraIcon } from '@heroicons/react/24/outline';
import EXIF from 'exif-js';

interface PhotoDetails {
  id: string;
  file: File;
  preview: string;
  name: string;
  uploadDate: Date;
  location?: string;
  camera?: string;
  dimensions?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: string;
}

export default function Home() {
  const [photos, setPhotos] = useState<PhotoDetails[]>([]);

  const getExifData = (file: File): Promise<Partial<PhotoDetails>> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        const exifData: any = {};
        
        EXIF.getData(file as any, function(this: any) {
          const exif = EXIF.getAllTags(this);
          if (exif) {
            exifData.camera = `${exif.Make || ''} ${exif.Model || ''}`.trim() || 'Unknown Camera';
            if (exif.ExposureTime) {
              exifData.exposureTime = `1/${1 / exif.ExposureTime}s`;
            }
            if (exif.FNumber) {
              exifData.fNumber = `f/${exif.FNumber}`;
            }
            if (exif.ISOSpeedRatings) {
              exifData.iso = `ISO ${exif.ISOSpeedRatings}`;
            }
          }
        });

        // Create an image to get dimensions
        const img = new Image();
        img.onload = function() {
          exifData.dimensions = `${img.width} × ${img.height}`;
          resolve(exifData);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(async (file) => {
      const reader = new FileReader();
      const exifData = await getExifData(file);
      
      reader.onload = () => {
        setPhotos((prevPhotos) => [
          ...prevPhotos,
          {
            id: Math.random().toString(36).substring(7),
            file,
            preview: reader.result as string,
            name: file.name,
            uploadDate: new Date(),
            location: 'Unknown Location',
            ...exifData
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const deletePhoto = (id: string) => {
    setPhotos((prevPhotos) => prevPhotos.filter(photo => photo.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    }
  });

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">📸 Photo Gallery</h1>
        
        <div {...getRootProps()} className={`card mb-8 p-8 text-center cursor-pointer border-2 border-dashed border-[#76ABAE] transition-colors ${isDragActive ? 'border-white' : ''}`}>
          <input {...getInputProps()} />
          <PhotoIcon className="w-12 h-12 mx-auto mb-4 text-[#76ABAE]" />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag & drop photos here, or click to select files</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo.id} className="card group relative">
              <button
                onClick={() => deletePhoto(photo.id)}
                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-label="Delete photo"
              >
                <XCircleIcon className="w-8 h-8 text-red-500 hover:text-red-600 transition-colors" />
              </button>
              <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                <img
                  src={photo.preview}
                  alt={photo.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-accent">📁</span>
                  <h3 className="font-bold truncate text-[#76ABAE]">{photo.name}</h3>
                </div>
                
                <div className="flex items-center gap-2">
                  <span>📷</span>
                  <span className="font-semibold">{photo.camera}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span className="font-semibold">
                    {format(photo.uploadDate, 'PPP')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span>📐</span>
                  <span className="font-semibold">{photo.dimensions}</span>
                </div>

                {(photo.exposureTime || photo.fNumber || photo.iso) && (
                  <div className="flex items-center gap-2">
                    <span>⚙️</span>
                    <p className="font-semibold space-x-2">
                      {photo.exposureTime && <span>{photo.exposureTime}</span>}
                      {photo.fNumber && <span>{photo.fNumber}</span>}
                      {photo.iso && <span>{photo.iso}</span>}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span className="font-semibold">{photo.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="wave-container">
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'>
          <path
            fill='#76ABAE'
            fillOpacity='0.2'
            d='M0,192L120,202.7C240,213,480,235,720,213.3C960,192,1200,128,1320,96L1440,64L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z'
          />
        </svg>
      </div>
    </main>
  );
}
