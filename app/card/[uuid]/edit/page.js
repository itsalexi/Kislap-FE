'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getCardByUuid, updateCard } from '../../../lib/cards.js';
import {
    uploadCardProfilePicture,
    uploadCardBannerPicture,
    deleteCardBannerPicture,
    deleteCardProfilePicture,
} from '../../../lib/upload.js';
import {
    SOCIAL_PLATFORMS,
    getSocialIcon,
    getPlatformData,
    renderSocialIcon,
} from '../../../lib/socialIcons.js';
import { useAuth } from '../../../components/AuthProvider.js';
import LoadingSpinner from '../../../components/LoadingSpinner.js';
import ErrorPage, { ErrorTypes } from '../../../components/ErrorPage';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import {
    Save,
    ArrowLeft,
    Plus,
    Trash2,
    GripVertical,
    ChevronDown,
    ChevronUp,
    Upload,
    X,
    Eye,
    User,
    Crop as CropIcon,
} from 'lucide-react';
import Link from 'next/link';
import CardView from '../../../components/CardView.js';
import React from 'react';
import ReactCrop, {
    centerCrop,
    makeAspectCrop,
    Crop,
    PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { toast } from 'sonner';
import Image from 'next/image';

// Validation schema
const validationSchema = Yup.object().shape({
    contactInfo: Yup.object().shape({
        name: Yup.string()
            .min(1, 'Name must be between 1 and 100 characters')
            .max(100, 'Name must be between 1 and 100 characters'),
        title: Yup.string()
            .min(1, 'Title must be between 1 and 100 characters')
            .max(100, 'Title must be between 1 and 100 characters'),
        company: Yup.string()
            .min(1, 'Company must be between 1 and 100 characters')
            .max(100, 'Company must be between 1 and 100 characters'),
        email: Yup.string().email('Email must be a valid email address'),
        phone: Yup.string().matches(
            /^[\+]?[0-9][\d]{0,15}$/,
            'Phone must be a valid phone number (digits only, optional + prefix)'
        ),
        website: Yup.string().url('Website must be a valid URL'),
        address: Yup.string()
            .min(1, 'Address must be between 1 and 200 characters')
            .max(200, 'Address must be between 1 and 200 characters'),
    }),
    bio: Yup.string()
        .min(1, 'Bio must be between 1 and 1000 characters')
        .max(1000, 'Bio must be between 1 and 1000 characters'),
    socialLinks: Yup.array()
        .of(
            Yup.object().shape({
                platform: Yup.string()
                    .min(1, 'Platform name must be between 1 and 50 characters')
                    .max(
                        50,
                        'Platform name must be between 1 and 50 characters'
                    )
                    .required('Platform is required'),
                url: Yup.string()
                    .url('Social link URL must be a valid HTTP/HTTPS URL')
                    .required('URL is required'),
            })
        )
        .max(5, 'You can add a maximum of 5 social links'),
    otherLinks: Yup.array().of(
        Yup.object().shape({
            title: Yup.string()
                .min(1, 'Link title must be between 1 and 100 characters')
                .max(100, 'Link title must be between 1 and 100 characters')
                .required('Title is required'),
            url: Yup.string()
                .url('Link URL must be a valid HTTP/HTTPS URL')
                .required('URL is required'),
        })
    ),
});

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
    const imgRef = React.useRef(null);

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
                    <Button onClick={handleCrop}>Crop &amp; Upload</Button>
                </div>
            </div>
        </div>
    );
};

export default function EditCardPage({ params }) {
    const { uuid } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [cardData, setCardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Drag and drop state
    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedType, setDraggedType] = useState(null);

    useEffect(() => {
        if (!authLoading && user) {
            loadCard();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [authLoading, user, uuid]);

    const loadCard = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await getCardByUuid(uuid);

            if (result.error) {
                setError(result.error);
            } else if (result.claimed && result.card) {
                const card = result.card;
                setCardData(card);

                // Check if user owns this card
                if (card.owner?.id !== user.id) {
                    setError('You do not have permission to edit this card');
                    return;
                }
            } else {
                setError('Card not found or not claimed');
            }
        } catch (err) {
            setError('Failed to load card');
        } finally {
            setLoading(false);
        }
    };

    // This component is defined inside EditCardPage to have access to its state and props,
    // particularly the Formik `setFieldValue` function.
    const CardImageUploader = ({ values, setFieldValue }) => {
        const [isBannerUploading, setBannerUploading] = useState(false);
        const [isProfileUploading, setProfileUploading] = useState(false);
        const [error, setError] = useState({ banner: null, profile: null });
        const [cropConfig, setCropConfig] = useState(null);

        const MAX_FILE_SIZE_MB = 5;
        const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

        const bannerInputRef = React.useRef(null);
        const profileInputRef = React.useRef(null);

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
            const setLoading = isBanner
                ? setBannerUploading
                : setProfileUploading;
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

                // Update the card data locally instead of reloading
                setCardData((prev) => ({
                    ...prev,
                    [field]: result[field] || result.url || result.imageUrl,
                }));

                // Update the form field value with the actual URL
                const imageUrl = result[field] || result.url || result.imageUrl;
                setFieldValue(field, imageUrl);

                toast.success('Image uploaded successfully!');
            } catch (err) {
                const errorMessage =
                    err.message || 'An unexpected error occurred.';
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
            const setLoading = isBanner
                ? setBannerUploading
                : setProfileUploading;
            const originalValue = cardData[field];

            setLoading(true);
            setError((prev) => ({ ...prev, [type]: null }));

            try {
                const deleteFn = isBanner
                    ? deleteCardBannerPicture
                    : deleteCardProfilePicture;
                const result = await deleteFn(uuid);
                if (result.error) throw new Error(result.error);

                // Update the card data locally instead of reloading
                setCardData((prev) => ({
                    ...prev,
                    [field]: null,
                }));

                // Update the form field value
                setFieldValue(field, null);

                toast.success('Image removed successfully!');
            } catch (err) {
                const errorMessage =
                    err.message || 'An unexpected error occurred.';
                setError((prev) => ({ ...prev, [type]: errorMessage }));
                setFieldValue(field, originalValue); // Revert on error
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
                        <p className="text-sm text-red-500 mt-2">
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
                {error.profile && (
                    <p className="text-sm text-red-500 mt-14 text-center">
                        {error.profile}
                    </p>
                )}
                <p className="text-xs text-gray-500 pt-12 text-center">
                    Max file size: {MAX_FILE_SIZE_MB}MB. Hover over images to
                    update.
                </p>
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
        );
    };

    // Custom dropdown component for platform selection
    const PlatformDropdown = ({ field, form, ...props }) => {
        const { name, value, onBlur } = field;
        const { errors, touched } = form;
        const error = errors.socialLinks?.[name.split('.')[1]]?.platform;
        const isTouched = touched.socialLinks?.[name.split('.')[1]]?.platform;

        const [isOpen, setIsOpen] = useState(false);
        const [searchTerm, setSearchTerm] = useState('');

        const selectedPlatform = SOCIAL_PLATFORMS.find(
            (p) => p.value === value
        );
        const filteredPlatforms = SOCIAL_PLATFORMS.filter((p) =>
            p.label.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="relative">
                <div
                    className={`flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer ${
                        error && isTouched
                            ? 'border-red-500'
                            : 'border-gray-300'
                    } hover:border-gray-400 focus:border-blue-500 focus:outline-none`}
                    onClick={() => setIsOpen(!isOpen)}
                    onBlur={onBlur}
                >
                    <div className="flex items-center space-x-2">
                        {selectedPlatform ? (
                            <>
                                {renderSocialIcon(selectedPlatform.value, {
                                    className: 'h-4 w-4',
                                })}
                                <span>{selectedPlatform.label}</span>
                            </>
                        ) : (
                            <span className="text-gray-500">
                                Select platform...
                            </span>
                        )}
                    </div>
                    <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                    />
                </div>

                {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2 border-b">
                            <input
                                type="text"
                                placeholder="Search platforms..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="py-1">
                            {filteredPlatforms.map((platform) => (
                                <div
                                    key={platform.value}
                                    className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        form.setFieldValue(
                                            name,
                                            platform.value
                                        );
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                >
                                    {renderSocialIcon(platform.value, {
                                        className: 'h-4 w-4',
                                    })}
                                    <span className="text-sm">
                                        {platform.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Drag and drop handlers
    const handleDragStart = (e, index, type) => {
        setDraggedItem(index);
        setDraggedType(type);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex, type, values, setFieldValue) => {
        e.preventDefault();

        if (draggedType !== type || draggedItem === null) return;

        const listKey = type === 'social' ? 'socialLinks' : 'otherLinks';
        const updated = [...values[listKey]];
        const [moved] = updated.splice(draggedItem, 1);

        // Validate the moved item before inserting it back
        if (moved && typeof moved === 'object') {
            if (
                type === 'social' &&
                moved.platform !== undefined &&
                moved.url !== undefined
            ) {
                updated.splice(dropIndex, 0, moved);
            } else if (
                type === 'other' &&
                moved.title !== undefined &&
                moved.url !== undefined
            ) {
                updated.splice(dropIndex, 0, moved);
            }
        }

        setFieldValue(listKey, updated);
        setDraggedItem(null);
        setDraggedType(null);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDraggedType(null);
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        const promise = () =>
            new Promise(async (resolve, reject) => {
                try {
                    const { contactInfo, bio, socialLinks, otherLinks } =
                        values;

                    // Prepare and add text data update
                    const cleanContactInfo = {};
                    Object.entries(contactInfo).forEach(([key, value]) => {
                        if (
                            value &&
                            typeof value === 'string' &&
                            value.trim()
                        ) {
                            cleanContactInfo[key] = value.trim();
                        } else if (value) {
                            cleanContactInfo[key] = value;
                        }
                    });

                    const updatePayload = {
                        contactInfo: cleanContactInfo,
                        bio: bio.trim() || undefined,
                        socialLinks: socialLinks,
                        otherLinks: otherLinks,
                    };

                    const result = await updateCard(uuid, updatePayload);

                    if (result.error) {
                        throw new Error(
                            result.error || 'Failed to save card information'
                        );
                    }

                    resolve(result);
                } catch (err) {
                    reject(err);
                } finally {
                    setSubmitting(false);
                }
            });

        toast.promise(promise(), {
            loading: 'Saving changes...',
            success: (data) => {
                return 'Changes saved successfully!';
            },
            error: (err) => {
                setError(err.message);
                return err.message || 'Failed to save changes.';
            },
        });
    };

    if (authLoading || loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ErrorPage type={ErrorTypes.AUTH_REQUIRED} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ErrorPage
                    type={ErrorTypes.GENERIC}
                    message={error}
                    onRetry={() => setError(null)}
                />
            </div>
        );
    }

    if (!cardData) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ErrorPage
                    type={ErrorTypes.NOT_FOUND}
                    message="Card not found"
                    onRetry={loadCard}
                />
            </div>
        );
    }

    return (
        <Formik
            initialValues={{
                contactInfo: {
                    name: cardData.contactInfo?.name || '',
                    title: cardData.contactInfo?.title || '',
                    company: cardData.contactInfo?.company || '',
                    email: cardData.contactInfo?.email || '',
                    phone: cardData.contactInfo?.phone || '',
                    website: cardData.contactInfo?.website || '',
                    address: cardData.contactInfo?.address || '',
                },
                bio: cardData.bio || '',
                socialLinks: Array.isArray(cardData.socialLinks)
                    ? cardData.socialLinks.filter(
                          (link) =>
                              link &&
                              typeof link === 'object' &&
                              typeof link.platform === 'string' &&
                              typeof link.url === 'string'
                      )
                    : [],
                otherLinks: Array.isArray(cardData.otherLinks)
                    ? cardData.otherLinks.filter(
                          (link) =>
                              link &&
                              typeof link === 'object' &&
                              typeof link.title === 'string' &&
                              typeof link.url === 'string'
                      )
                    : [],
                profilePicture: cardData.profilePicture || null,
                bannerPicture: cardData.bannerPicture || null,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({ values, errors, touched, setFieldValue, isSubmitting }) => {
                return (
                    <Form className="flex flex-col h-screen bg-gray-50 overflow-hidden">
                        {/* Header */}
                        <div className="bg-white border-b flex-shrink-0">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex justify-between items-center py-4">
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            href={`/card/${uuid}`}
                                            className="p-2 rounded-md hover:bg-gray-100"
                                        >
                                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                                        </Link>
                                        <div>
                                            <h1 className="text-xl font-bold text-gray-900">
                                                Edit Card
                                            </h1>
                                            <p className="text-sm text-gray-500">
                                                Update your business card
                                                information
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/card/${uuid}`} passHref>
                                            <Button
                                                variant="outline"
                                                as="a"
                                                className="hidden sm:flex"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Card
                                            </Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || saving}
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {saving
                                                ? 'Saving...'
                                                : 'Save Changes'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-grow max-w-7xl mx-auto w-full overflow-hidden">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 h-full">
                                {/* Form - Left Column */}
                                <div className="lg:col-span-2 overflow-y-auto">
                                    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
                                        {/* Banner and Profile Pictures */}
                                        <CardImageUploader
                                            values={values}
                                            setFieldValue={setFieldValue}
                                        />

                                        {/* Contact Information */}
                                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                                            <h2 className="text-lg font-semibold mb-4">
                                                Contact Information
                                            </h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label
                                                        htmlFor="name"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                    >
                                                        Name
                                                    </label>
                                                    <Field
                                                        as={Input}
                                                        name="contactInfo.name"
                                                        placeholder="Your full name"
                                                    />
                                                    <ErrorMessage
                                                        name="contactInfo.name"
                                                        component="div"
                                                        className="text-red-500 text-sm mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="title"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                    >
                                                        Job Title
                                                    </label>
                                                    <Field
                                                        as={Input}
                                                        name="contactInfo.title"
                                                        placeholder="e.g., Software Engineer"
                                                    />
                                                    <ErrorMessage
                                                        name="contactInfo.title"
                                                        component="div"
                                                        className="text-red-500 text-sm mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="company"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                    >
                                                        Company
                                                    </label>
                                                    <Field
                                                        as={Input}
                                                        name="contactInfo.company"
                                                        placeholder="e.g., Tech Corp"
                                                    />
                                                    <ErrorMessage
                                                        name="contactInfo.company"
                                                        component="div"
                                                        className="text-red-500 text-sm mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="email"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                    >
                                                        Email
                                                    </label>
                                                    <Field
                                                        as={Input}
                                                        name="contactInfo.email"
                                                        placeholder="your.email@example.com"
                                                    />
                                                    <ErrorMessage
                                                        name="contactInfo.email"
                                                        component="div"
                                                        className="text-red-500 text-sm mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="phone"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                    >
                                                        Phone
                                                    </label>
                                                    <Field
                                                        as={Input}
                                                        name="contactInfo.phone"
                                                        placeholder="+1234567890"
                                                    />
                                                    <ErrorMessage
                                                        name="contactInfo.phone"
                                                        component="div"
                                                        className="text-red-500 text-sm mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="website"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                    >
                                                        Website
                                                    </label>
                                                    <Field
                                                        as={Input}
                                                        name="contactInfo.website"
                                                        placeholder="https://yourwebsite.com"
                                                    />
                                                    <ErrorMessage
                                                        name="contactInfo.website"
                                                        component="div"
                                                        className="text-red-500 text-sm mt-1"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label
                                                        htmlFor="address"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                    >
                                                        Address
                                                    </label>
                                                    <Field
                                                        as={Input}
                                                        name="contactInfo.address"
                                                        placeholder="123 Main St, City, State"
                                                    />
                                                    <ErrorMessage
                                                        name="contactInfo.address"
                                                        component="div"
                                                        className="text-red-500 text-sm mt-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                                            <h2 className="text-lg font-semibold mb-4">
                                                Bio
                                            </h2>
                                            <div>
                                                <label
                                                    htmlFor="bio"
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    About You
                                                </label>
                                                <Field
                                                    as="textarea"
                                                    name="bio"
                                                    placeholder="Tell people about yourself, your expertise, or what you do..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                    rows={4}
                                                />
                                                <ErrorMessage
                                                    name="bio"
                                                    component="div"
                                                    className="text-red-500 text-sm mt-1"
                                                />
                                            </div>
                                        </div>

                                        {/* Social Links */}
                                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-lg font-semibold">
                                                    Social Links
                                                </h2>
                                                <span className="text-sm text-gray-500">
                                                    ({values.socialLinks.length}{' '}
                                                    / 5)
                                                </span>
                                            </div>

                                            <FieldArray name="socialLinks">
                                                {({ push, remove, move }) => {
                                                    try {
                                                        return (
                                                            <div className="space-y-4">
                                                                {values.socialLinks
                                                                    .filter(
                                                                        (
                                                                            link
                                                                        ) =>
                                                                            link &&
                                                                            typeof link ===
                                                                                'object' &&
                                                                            typeof link.platform ===
                                                                                'string' &&
                                                                            typeof link.url ===
                                                                                'string'
                                                                    )
                                                                    .map(
                                                                        (
                                                                            link,
                                                                            index
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="flex items-center space-x-2"
                                                                                draggable
                                                                                onDragStart={(
                                                                                    e
                                                                                ) =>
                                                                                    handleDragStart(
                                                                                        e,
                                                                                        index,
                                                                                        'social'
                                                                                    )
                                                                                }
                                                                                onDragOver={
                                                                                    handleDragOver
                                                                                }
                                                                                onDrop={(
                                                                                    e
                                                                                ) =>
                                                                                    handleDrop(
                                                                                        e,
                                                                                        index,
                                                                                        'social',
                                                                                        values,
                                                                                        setFieldValue
                                                                                    )
                                                                                }
                                                                                onDragEnd={
                                                                                    handleDragEnd
                                                                                }
                                                                            >
                                                                                <GripVertical className="h-5 w-5 text-gray-400 cursor-grab hidden sm:block" />
                                                                                <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                                    <div>
                                                                                        <Field
                                                                                            name={`socialLinks.${index}.platform`}
                                                                                            component={
                                                                                                PlatformDropdown
                                                                                            }
                                                                                        />
                                                                                        <ErrorMessage
                                                                                            name={`socialLinks.${index}.platform`}
                                                                                            component="div"
                                                                                            className="text-red-500 text-sm mt-1"
                                                                                            render={(
                                                                                                msg
                                                                                            ) => (
                                                                                                <div className="text-red-500 text-sm mt-1">
                                                                                                    {typeof msg ===
                                                                                                    'string'
                                                                                                        ? msg
                                                                                                        : 'Invalid platform'}
                                                                                                </div>
                                                                                            )}
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <Field
                                                                                            name={`socialLinks.${index}.url`}
                                                                                        >
                                                                                            {({
                                                                                                field,
                                                                                            }) => (
                                                                                                <Input
                                                                                                    {...field}
                                                                                                    placeholder="https://example.com"
                                                                                                    value={
                                                                                                        typeof field.value ===
                                                                                                        'string'
                                                                                                            ? field.value
                                                                                                            : ''
                                                                                                    }
                                                                                                />
                                                                                            )}
                                                                                        </Field>
                                                                                        <ErrorMessage
                                                                                            name={`socialLinks.${index}.url`}
                                                                                            component="div"
                                                                                            className="text-red-500 text-sm mt-1"
                                                                                            render={(
                                                                                                msg
                                                                                            ) => (
                                                                                                <div className="text-red-500 text-sm mt-1">
                                                                                                    {typeof msg ===
                                                                                                    'string'
                                                                                                        ? msg
                                                                                                        : 'Invalid URL'}
                                                                                                </div>
                                                                                            )}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center">
                                                                                    <div className="sm:hidden flex flex-col -space-y-1">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() =>
                                                                                                move(
                                                                                                    index,
                                                                                                    index -
                                                                                                        1
                                                                                                )
                                                                                            }
                                                                                            disabled={
                                                                                                index ===
                                                                                                0
                                                                                            }
                                                                                            className="p-1 rounded-md text-gray-400 hover:text-gray-800 disabled:opacity-30"
                                                                                        >
                                                                                            <ChevronUp className="h-5 w-5" />
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() =>
                                                                                                move(
                                                                                                    index,
                                                                                                    index +
                                                                                                        1
                                                                                                )
                                                                                            }
                                                                                            disabled={
                                                                                                index ===
                                                                                                values
                                                                                                    .socialLinks
                                                                                                    .length -
                                                                                                    1
                                                                                            }
                                                                                            className="p-1 rounded-md text-gray-400 hover:text-gray-800 disabled:opacity-30"
                                                                                        >
                                                                                            <ChevronDown className="h-5 w-5" />
                                                                                        </button>
                                                                                    </div>
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        onClick={() =>
                                                                                            remove(
                                                                                                index
                                                                                            )
                                                                                        }
                                                                                        className="text-gray-500 hover:text-red-500"
                                                                                    >
                                                                                        <Trash2 className="h-4 w-4" />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        push({
                                                                            platform:
                                                                                '',
                                                                            url: '',
                                                                        })
                                                                    }
                                                                    disabled={
                                                                        values
                                                                            .socialLinks
                                                                            .length >=
                                                                        5
                                                                    }
                                                                >
                                                                    <Plus className="h-4 w-4 mr-2" />
                                                                    Add Social
                                                                    Link
                                                                </Button>
                                                                <ErrorMessage
                                                                    name="socialLinks"
                                                                    component="div"
                                                                    className="text-red-500 text-sm mt-1"
                                                                    render={(
                                                                        msg
                                                                    ) => (
                                                                        <div className="text-red-500 text-sm mt-1">
                                                                            {typeof msg ===
                                                                            'string'
                                                                                ? msg
                                                                                : 'Invalid social links'}
                                                                        </div>
                                                                    )}
                                                                />
                                                            </div>
                                                        );
                                                    } catch (error) {
                                                        console.error(
                                                            'Error rendering socialLinks:',
                                                            error
                                                        );
                                                        return (
                                                            <div className="text-red-500">
                                                                Error rendering
                                                                social links.
                                                                Please refresh
                                                                the page.
                                                            </div>
                                                        );
                                                    }
                                                }}
                                            </FieldArray>
                                        </div>

                                        {/* Other Links */}
                                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-lg font-semibold">
                                                    Other Links
                                                </h2>
                                            </div>

                                            <FieldArray name="otherLinks">
                                                {({ push, remove, move }) => {
                                                    try {
                                                        return (
                                                            <div className="space-y-4">
                                                                {values.otherLinks
                                                                    .filter(
                                                                        (
                                                                            link
                                                                        ) =>
                                                                            link &&
                                                                            typeof link ===
                                                                                'object' &&
                                                                            typeof link.title ===
                                                                                'string' &&
                                                                            typeof link.url ===
                                                                                'string'
                                                                    )
                                                                    .map(
                                                                        (
                                                                            link,
                                                                            index
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="flex items-center space-x-2"
                                                                                draggable
                                                                                onDragStart={(
                                                                                    e
                                                                                ) =>
                                                                                    handleDragStart(
                                                                                        e,
                                                                                        index,
                                                                                        'other'
                                                                                    )
                                                                                }
                                                                                onDragOver={
                                                                                    handleDragOver
                                                                                }
                                                                                onDrop={(
                                                                                    e
                                                                                ) =>
                                                                                    handleDrop(
                                                                                        e,
                                                                                        index,
                                                                                        'other',
                                                                                        values,
                                                                                        setFieldValue
                                                                                    )
                                                                                }
                                                                                onDragEnd={
                                                                                    handleDragEnd
                                                                                }
                                                                            >
                                                                                <GripVertical className="h-5 w-5 text-gray-400 cursor-grab hidden sm:block" />
                                                                                <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                                    <div>
                                                                                        <Field
                                                                                            as={
                                                                                                Input
                                                                                            }
                                                                                            name={`otherLinks.${index}.title`}
                                                                                            placeholder="Link title (e.g., My Portfolio)"
                                                                                        />
                                                                                        <ErrorMessage
                                                                                            name={`otherLinks.${index}.title`}
                                                                                            component="div"
                                                                                            className="text-red-500 text-sm mt-1"
                                                                                            render={(
                                                                                                msg
                                                                                            ) => (
                                                                                                <div className="text-red-500 text-sm mt-1">
                                                                                                    {typeof msg ===
                                                                                                    'string'
                                                                                                        ? msg
                                                                                                        : 'Invalid title'}
                                                                                                </div>
                                                                                            )}
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <Field
                                                                                            name={`otherLinks.${index}.url`}
                                                                                        >
                                                                                            {({
                                                                                                field,
                                                                                            }) => (
                                                                                                <Input
                                                                                                    {...field}
                                                                                                    placeholder="https://example.com"
                                                                                                    value={
                                                                                                        typeof field.value ===
                                                                                                        'string'
                                                                                                            ? field.value
                                                                                                            : ''
                                                                                                    }
                                                                                                />
                                                                                            )}
                                                                                        </Field>
                                                                                        <ErrorMessage
                                                                                            name={`otherLinks.${index}.url`}
                                                                                            component="div"
                                                                                            className="text-red-500 text-sm mt-1"
                                                                                            render={(
                                                                                                msg
                                                                                            ) => (
                                                                                                <div className="text-red-500 text-sm mt-1">
                                                                                                    {typeof msg ===
                                                                                                    'string'
                                                                                                        ? msg
                                                                                                        : 'Invalid URL'}
                                                                                                </div>
                                                                                            )}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center">
                                                                                    <div className="sm:hidden flex flex-col -space-y-1">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() =>
                                                                                                move(
                                                                                                    index,
                                                                                                    index -
                                                                                                        1
                                                                                                )
                                                                                            }
                                                                                            disabled={
                                                                                                index ===
                                                                                                0
                                                                                            }
                                                                                            className="p-1 rounded-md text-gray-400 hover:text-gray-800 disabled:opacity-30"
                                                                                        >
                                                                                            <ChevronUp className="h-5 w-5" />
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() =>
                                                                                                move(
                                                                                                    index,
                                                                                                    index +
                                                                                                        1
                                                                                                )
                                                                                            }
                                                                                            disabled={
                                                                                                index ===
                                                                                                values
                                                                                                    .otherLinks
                                                                                                    .length -
                                                                                                    1
                                                                                            }
                                                                                            className="p-1 rounded-md text-gray-400 hover:text-gray-800 disabled:opacity-30"
                                                                                        >
                                                                                            <ChevronDown className="h-5 w-5" />
                                                                                        </button>
                                                                                    </div>
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        onClick={() =>
                                                                                            remove(
                                                                                                index
                                                                                            )
                                                                                        }
                                                                                        className="text-gray-500 hover:text-red-500"
                                                                                    >
                                                                                        <Trash2 className="h-4 w-4" />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        push({
                                                                            title: '',
                                                                            url: '',
                                                                        })
                                                                    }
                                                                >
                                                                    <Plus className="h-4 w-4 mr-2" />
                                                                    Add Link
                                                                </Button>
                                                                <ErrorMessage
                                                                    name="otherLinks"
                                                                    component="div"
                                                                    className="text-red-500 text-sm mt-1"
                                                                    render={(
                                                                        msg
                                                                    ) => (
                                                                        <div className="text-red-500 text-sm mt-1">
                                                                            {typeof msg ===
                                                                            'string'
                                                                                ? msg
                                                                                : 'Invalid links'}
                                                                        </div>
                                                                    )}
                                                                />
                                                            </div>
                                                        );
                                                    } catch (error) {
                                                        console.error(
                                                            'Error rendering otherLinks:',
                                                            error
                                                        );
                                                        return (
                                                            <div className="text-red-500">
                                                                Error rendering
                                                                links. Please
                                                                refresh the
                                                                page.
                                                            </div>
                                                        );
                                                    }
                                                }}
                                            </FieldArray>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview - Right Column */}
                                <div className="lg:col-span-1 overflow-y-auto">
                                    <div className="p-4 sm:p-6 lg:p-8">
                                        <div className="lg:sticky lg:top-8">
                                            <h2 className="text-lg font-semibold mb-4">
                                                Live Preview
                                            </h2>
                                            <CardView cardData={values} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Form>
                );
            }}
        </Formik>
    );
}
