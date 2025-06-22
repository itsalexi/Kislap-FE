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
import CardImageUploader from '../../../components/CardEditor/CardImageUploader.js';
import ContactInfoForm from '../../../components/CardEditor/ContactInfoForm.js';
import BioForm from '../../../components/CardEditor/BioForm.js';
import SocialLinksForm from '../../../components/CardEditor/SocialLinksForm.js';
import OtherLinksForm from '../../../components/CardEditor/OtherLinksForm.js';

// Validation schema
const validationSchema = Yup.object().shape({
    contactInfo: Yup.object().shape({
        name: Yup.string()
            .min(1, 'Name must be between 1 and 100 characters')
            .max(100, 'Name must be between 1 and 100 characters'),
        title: Yup.string().max(
            100,
            'Title must be between 1 and 100 characters'
        ),
        company: Yup.string().max(
            100,
            'Company must be between 1 and 100 characters'
        ),
        email: Yup.string().email('Email must be a valid email address'),
        phone: Yup.string().matches(
            /^(|[\+]?[0-9][\d]{0,15})$/,
            'Phone must be a valid phone number (digits only, optional + prefix)'
        ),
        website: Yup.string().url('Website must be a valid URL'),
        address: Yup.string().max(
            200,
            'Address must be between 1 and 200 characters'
        ),
    }),
    bio: Yup.string().max(1000, 'Bio must be between 1 and 1000 characters'),
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
    const [error, setError] = useState(null);

    // Drag and drop state
    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedType, setDraggedType] = useState(null);

    // Helper to create safe initial values
    const getSafeInitialValues = (data) => {
        const contactInfo = data?.contactInfo || {};
        return {
            profilePicture: data?.profilePicture || null,
            bannerPicture: data?.bannerPicture || null,
            contactInfo: {
                name: contactInfo.name || '',
                title: contactInfo.title || '',
                company: contactInfo.company || '',
                email: contactInfo.email || '',
                phone: contactInfo.phone || '',
                website: contactInfo.website || '',
                address: contactInfo.address || '',
            },
            bio: data?.bio || '',
            socialLinks: data?.socialLinks || [],
            otherLinks: data?.otherLinks || [],
        };
    };

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

        if (moved) {
            updated.splice(dropIndex, 0, moved);
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
                    // Create a deep copy to rebuild the payload safely
                    const {
                        contactInfo,
                        bio,
                        socialLinks,
                        otherLinks,
                        profilePicture,
                        bannerPicture,
                    } = JSON.parse(JSON.stringify(values));

                    const payload = {};

                    // Add top-level fields if they have a value
                    if (bio) payload.bio = bio;
                    if (profilePicture) payload.profilePicture = profilePicture;
                    if (bannerPicture) payload.bannerPicture = bannerPicture;
                    if (socialLinks) payload.socialLinks = socialLinks;
                    if (otherLinks) payload.otherLinks = otherLinks;

                    // Clean and add contactInfo
                    const cleanContact = {};
                    if (contactInfo) {
                        Object.keys(contactInfo).forEach((key) => {
                            if (contactInfo[key]) {
                                cleanContact[key] = contactInfo[key];
                            }
                        });
                        if (Object.keys(cleanContact).length > 0) {
                            payload.contactInfo = cleanContact;
                        }
                    }

                    const result = await updateCard(uuid, payload);

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

    const initialValues = getSafeInitialValues(cardData);

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({ values, isSubmitting, setFieldValue }) => (
                <Form>
                    <div className="min-h-screen bg-gray-50/50">
                        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex justify-between items-center py-4">
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            href="/dashboard"
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
                                            disabled={isSubmitting}
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {isSubmitting
                                                ? 'Saving...'
                                                : 'Save Changes'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </header>
                        <main className="flex-1 p-4 sm:p-6 md:p-8">
                            <div className="max-w-7xl mx-auto w-full">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8">
                                    <div className="lg:col-span-2 space-y-6">
                                        <CardImageUploader
                                            uuid={uuid}
                                            values={values}
                                            setFieldValue={setFieldValue}
                                            cardData={cardData}
                                            setCardData={setCardData}
                                        />
                                        <ContactInfoForm />
                                        <BioForm />
                                        <SocialLinksForm
                                            values={values}
                                            setFieldValue={setFieldValue}
                                            handleDragStart={handleDragStart}
                                            handleDragOver={handleDragOver}
                                            handleDrop={handleDrop}
                                            handleDragEnd={handleDragEnd}
                                        />
                                        <OtherLinksForm
                                            values={values}
                                            setFieldValue={setFieldValue}
                                            handleDragStart={handleDragStart}
                                            handleDragOver={handleDragOver}
                                            handleDrop={handleDrop}
                                            handleDragEnd={handleDragEnd}
                                        />
                                    </div>
                                    <div className="hidden lg:block">
                                        <div className="sticky top-24 space-y-4">
                                            <h2 className="text-lg font-semibold">
                                                Live Preview
                                            </h2>
                                            <CardView cardData={values} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </Form>
            )}
        </Formik>
    );
}
