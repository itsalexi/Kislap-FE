'use client';

import React, { useState, useRef } from 'react';
import {
  uploadCardProfilePicture,
  uploadCardBannerPicture,
  deleteCardBannerPicture,
  deleteCardProfilePicture,
} from '../../lib/upload.js';
import { Button } from '../ui/button';
import LoadingSpinner from '../LoadingSpinner.js';
import { Upload, X, User } from 'lucide-react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { toast } from 'sonner';
import Image from 'next/image';

// Helper to get the cropped image
function getCroppedImg(image, crop, fileName) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context is not available'));
      return;
    }

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const croppedFile = new File([blob], fileName, {
          type: blob.type,
        });
        resolve(croppedFile);
      },
      'image/webp',
      0.85
    );
  });
}

// Modal Component for Cropping
const ImageCropModal = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspect,
  circularCrop,
}) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const imgRef = useRef(null);

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }

  async function handleCrop() {
    if (completedCrop?.width && completedCrop?.height && imgRef.current) {
      const croppedImg = await getCroppedImg(
        imgRef.current,
        completedCrop,
        'cropped-image.webp'
      );
      onCropComplete(croppedImg);
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <h2 className="text-xl font-bold mb-4">Crop Image</h2>
        <div className="flex-1 flex justify-center items-start overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            circularCrop={circularCrop}
          >
            <Image
              ref={imgRef}
              alt="Crop image"
              src={imageSrc}
              onLoad={onImageLoad}
              className="max-h-[60vh] max-w-full object-contain"
              width={600}
              height={200}
              priority
            />
          </ReactCrop>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCrop}>
            Crop &amp; Upload
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function CardImageUploader({
  uuid,
  values,
  setFieldValue,
  cardData,
  setCardData,
}) {
  const [isBannerUploading, setBannerUploading] = useState(false);
  const [isProfileUploading, setProfileUploading] = useState(false);
  const [error, setError] = useState({ banner: null, profile: null });
  const [cropConfig, setCropConfig] = useState(null);

  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError((prev) => ({
        ...prev,
        [type]: `File too large. Max is ${MAX_FILE_SIZE_MB}MB.`,
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropConfig({
        src: reader.result?.toString() || '',
        type: type,
        aspect: type === 'banner' ? 3 / 1 : 1,
        circularCrop: type === 'profile',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUploadCroppedImage = async (croppedFile) => {
    const type = cropConfig.type;
    const isBanner = type === 'banner';
    const field = isBanner ? 'bannerPicture' : 'profilePicture';
    const setLoading = isBanner ? setBannerUploading : setProfileUploading;
    const originalValue = cardData[field];

    setLoading(true);
    setError((prev) => ({ ...prev, [type]: null }));

    try {
      const formData = new FormData();
      formData.append(field, croppedFile);
      const uploadFn = isBanner
        ? uploadCardBannerPicture
        : uploadCardProfilePicture;
      const result = await uploadFn(uuid, formData);
      if (result.error) throw new Error(result.error);

      setCardData((prev) => ({
        ...prev,
        [field]: result[field] || result.url || result.imageUrl,
      }));

      const imageUrl = result[field] || result.url || result.imageUrl;
      setFieldValue(field, imageUrl);

      toast.success('Image uploaded successfully!');
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError((prev) => ({ ...prev, [type]: errorMessage }));
      setFieldValue(field, originalValue);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setCropConfig(null);
    }
  };

  const handleRemove = async (type) => {
    const isBanner = type === 'banner';
    const field = isBanner ? 'bannerPicture' : 'profilePicture';
    const setLoading = isBanner ? setBannerUploading : setProfileUploading;
    const originalValue = cardData[field];

    setLoading(true);
    setError((prev) => ({ ...prev, [type]: null }));

    try {
      const deleteFn = isBanner
        ? deleteCardBannerPicture
        : deleteCardProfilePicture;
      const result = await deleteFn(uuid);
      if (result.error) throw new Error(result.error);

      setCardData((prev) => ({
        ...prev,
        [field]: null,
      }));

      setFieldValue(field, null);

      toast.success('Image removed successfully!');
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError((prev) => ({ ...prev, [type]: errorMessage }));
      setFieldValue(field, originalValue);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (fieldValue) => {
    if (!fieldValue) return null;
    return fieldValue instanceof File
      ? URL.createObjectURL(fieldValue)
      : fieldValue;
  };

  const bannerUrl = getImageUrl(values.bannerPicture);
  const profileUrl = getImageUrl(values.profilePicture);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
      <h2 className="text-lg font-semibold">Card Images</h2>
      <div>
        <div className="relative">
          <div className="relative group w-full aspect-[3/1] bg-gray-100 rounded-md overflow-hidden">
            {bannerUrl ? (
              <Image
                src={bannerUrl}
                alt="Banner preview"
                className="w-full h-full object-cover"
                fill
                sizes="(max-width: 640px) 100%, (max-width: 1024px) 50vw, 33vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <span>Banner Image</span>
              </div>
            )}
            <div
              className="absolute inset-0 bg-transparent group-hover:bg-black/50 flex items-center justify-center transition-all cursor-pointer"
              onClick={() => bannerInputRef.current.click()}
            >
              <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                {isBannerUploading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>Update Banner</span>
                  </>
                )}
              </div>
            </div>
            {bannerUrl && !isBannerUploading && (
              <button
                type="button"
                onClick={() => handleRemove('banner')}
                className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <input
              type="file"
              ref={bannerInputRef}
              className="hidden"
              accept="image/jpeg, image/png, image/gif, image/webp"
              onChange={(e) => handleFileSelect(e, 'banner')}
            />
          </div>

          {error.banner && (
            <p className="text-sm text-red-500 mt-2 text-center">
              {error.banner}
            </p>
          )}

          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-lg group">
            <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden">
              {profileUrl ? (
                <Image
                  src={profileUrl}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                  width={112}
                  height={112}
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-10 w-10 text-gray-400" />
                </div>
              )}
            </div>
            <div
              className="absolute inset-0 bg-transparent group-hover:bg-black/60 flex items-center justify-center transition-all cursor-pointer rounded-full"
              onClick={() => profileInputRef.current.click()}
            >
              <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1 text-center">
                {isProfileUploading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span className="text-xs">Update</span>
                  </>
                )}
              </div>
            </div>
            {profileUrl && !isProfileUploading && (
              <button
                type="button"
                onClick={() => handleRemove('profile')}
                className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <input
              type="file"
              ref={profileInputRef}
              className="hidden"
              accept="image/jpeg, image/png, image/gif, image/webp"
              onChange={(e) => handleFileSelect(e, 'profile')}
            />
          </div>
        </div>
        <div className="text-center pt-16">
          {error.profile && (
            <p className="text-sm text-red-500 mb-1">{error.profile}</p>
          )}
          <p className="text-xs text-gray-500">
            Max file size: {MAX_FILE_SIZE_MB}MB. Hover over images to update.
          </p>
        </div>
        {cropConfig && (
          <ImageCropModal
            isOpen={!!cropConfig}
            onClose={() => setCropConfig(null)}
            imageSrc={cropConfig.src}
            onCropComplete={handleUploadCroppedImage}
            aspect={cropConfig.aspect}
            circularCrop={cropConfig.circularCrop}
          />
        )}
      </div>
    </div>
  );
}
