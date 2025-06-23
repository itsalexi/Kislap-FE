'use client';

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { getCardByUuid, updateCard, claimCard } from '../../lib/cards';
import { useAuth } from '../../components/AuthProvider';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorPage, { ErrorTypes } from '../../components/ErrorPage';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  PartyPopper,
  Wand2,
  UserCircle,
  Image as ImageIcon,
  Quote,
  Share2,
  Link as LinkIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import CardImageUploader from '../../components/CardEditor/CardImageUploader.js';
import ContactInfoForm from '../../components/CardEditor/ContactInfoForm.js';
import BioForm from '../../components/CardEditor/BioForm.js';
import SocialLinksForm from '../../components/CardEditor/SocialLinksForm.js';
import OtherLinksForm from '../../components/CardEditor/OtherLinksForm.js';
import CardView from '../../components/CardView';
import { getIn } from 'formik';

const steps = [
  { id: 'welcome', title: 'Welcome', fields: [] },
  {
    id: 'contact',
    title: 'Contact Info',
    fields: ['contactInfo.name', 'contactInfo.email'],
  },
  { id: 'images', title: 'Profile Images', fields: [] },
  { id: 'bio', title: 'Your Bio', fields: ['bio'] },
  { id: 'socials', title: 'Social Links', fields: ['socialLinks'] },
  { id: 'links', title: 'Other Links', fields: ['otherLinks'] },
  { id: 'review', title: 'Review & Finish', fields: [] },
];

const validationSchema = Yup.object().shape({
  contactInfo: Yup.object().shape({
    name: Yup.string()
      .min(1)
      .max(100)
      .required('Your name is required to get started.'),
    title: Yup.string().max(100),
    company: Yup.string().max(100),
    email: Yup.string().email('Please enter a valid email.'),
    phone: Yup.string().matches(
      /^(|[\+]?[0-9][\d]{0,15})$/,
      'Please enter a valid phone number.'
    ),
    website: Yup.string().url('Please enter a valid URL.'),
    address: Yup.string().max(200),
  }),
  bio: Yup.string().max(1000),
  socialLinks: Yup.array()
    .of(
      Yup.object().shape({
        platform: Yup.string().required('Platform is required.'),
        url: Yup.string()
          .url('Link must be a valid URL.')
          .required('URL is required.'),
      })
    )
    .max(5, 'You can add a maximum of 5 social links.'),
  otherLinks: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required('Title is required.'),
      url: Yup.string()
        .url('Link must be a valid URL.')
        .required('URL is required.'),
    })
  ),
});

export default function OnboardingPage({ params }) {
  const { uuid } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const loadAndClaimCard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First, try to get the card data to see if user already owns it
      const result = await getCardByUuid(uuid);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.claimed && result.card) {
        // Card is claimed, check if current user owns it
        if (result.card.owner?.id === user.id) {
          // User already owns this card, proceed with setup
          setCardData(result.card);
          return;
        } else {
          // Card is claimed by another user
          setError('This card is already claimed by another user.');
          return;
        }
      }

      // Card is not claimed, try to claim it
      const claimResult = await claimCard(uuid);
      if (claimResult.error) {
        setError(claimResult.error);
        return;
      }

      // Card was successfully claimed, get the updated data
      const updatedResult = await getCardByUuid(uuid);
      if (updatedResult.error) {
        setError(updatedResult.error);
      } else if (updatedResult.claimed && updatedResult.card) {
        setCardData(updatedResult.card);
      } else {
        setError('This card is not available to be claimed.');
      }
    } catch (err) {
      console.error('Error in loadAndClaimCard:', err);
      setError('Failed to load card data.');
    } finally {
      setLoading(false);
    }
  }, [uuid, user?.id]);

  useEffect(() => {
    if (!authLoading && user) {
      loadAndClaimCard();
    } else if (!authLoading && !user) {
      router.push(`/api/auth/google?redirect=/onboarding/${uuid}`);
    }
  }, [authLoading, user, uuid, loadAndClaimCard]);

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
            throw new Error(result.error);
          }
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          setSubmitting(false);
        }
      });

    toast.promise(promise(), {
      loading: 'Saving your card...',
      success: () => {
        setTimeout(() => router.push(`/card/${uuid}`), 1000);
        return 'Your card is ready!';
      },
      error: (err) => err.message || 'Failed to save card.',
    });
  };

  // Drag and drop handlers
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedType, setDraggedType] = useState(null);
  const handleDragStart = (e, index, type) => {
    setDraggedItem(index);
    setDraggedType(type);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, dropIndex, type, values, setFieldValue) => {
    e.preventDefault();
    if (draggedType !== type || draggedItem === null) return;
    const listKey = type === 'social' ? 'socialLinks' : 'otherLinks';
    const updated = [...values[listKey]];
    const [moved] = updated.splice(draggedItem, 1);
    if (moved) updated.splice(dropIndex, 0, moved);
    setFieldValue(listKey, updated);
    setDraggedItem(null);
    setDraggedType(null);
  };
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedType(null);
  };

  if (authLoading || loading) {
    return <LoadingSpinner text="Getting your card ready..." />;
  }

  if (error) {
    return <ErrorPage type={ErrorTypes.GENERIC} message={error} />;
  }

  if (!cardData) {
    return <LoadingSpinner text="Finalizing setup..." />;
  }

  const progress = (currentStep / (steps.length - 1)) * 100;
  const initialValues = getSafeInitialValues(cardData);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({
        values,
        setFieldValue,
        isSubmitting,
        errors,
        touched,
        validateForm,
        setTouched,
        handleSubmit,
      }) => {
        const handleNext = async () => {
          const currentStepFields = steps[currentStep].fields;
          if (currentStepFields.length > 0) {
            // Mark current fields as touched to ensure error messages appear
            const touchedObject = {};
            currentStepFields.forEach((field) => {
              const fieldPath = field.split('.');
              let current = touchedObject;
              for (let i = 0; i < fieldPath.length - 1; i++) {
                current[fieldPath[i]] = current[fieldPath[i]] || {};
                current = current[fieldPath[i]];
              }
              current[fieldPath[fieldPath.length - 1]] = true;
            });
            await setTouched(touchedObject, true);

            const validationErrors = await validateForm();

            const firstError = currentStepFields
              .map((field) => getIn(validationErrors, field))
              .find(Boolean);

            if (firstError) {
              toast.error(firstError);
              return;
            }
          }
          setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        };

        const handleBack = () =>
          setCurrentStep((prev) => Math.max(prev - 1, 0));

        return (
          <Form className="flex flex-col h-screen bg-gray-50">
            <header className="flex-shrink-0 p-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-500 w-28 shrink-0">
                    Step {currentStep + 1} of {steps.length}:{' '}
                    {steps[currentStep].title}
                  </span>
                  <Progress value={progress} className="w-full" />
                </div>
              </div>
            </header>

            <main className="flex-grow overflow-y-auto">
              <div className="max-w-4xl mx-auto p-4 sm:p-8">
                {currentStep === 0 && (
                  <div className="text-center space-y-4">
                    <Wand2 className="mx-auto h-12 w-12 text-blue-500" />
                    <h1 className="text-3xl font-bold text-gray-900">
                      Welcome, {user.name || 'there'}!
                    </h1>
                    <p className="text-lg text-gray-600">
                      Let&apos;s set up your new digital business card.
                      It&apos;ll only take a minute.
                    </p>
                    <div className="mt-8 max-w-md mx-auto">
                      <CardView
                        cardData={{
                          contactInfo: {
                            name: user.name,
                          },
                          ...values,
                        }}
                      />
                    </div>
                  </div>
                )}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <UserCircle className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <h2 className="text-2xl font-semibold">
                        Your Contact Details
                      </h2>
                      <p className="text-gray-500 mt-1">
                        This information will be visible on your card.
                      </p>
                    </div>
                    <ContactInfoForm />
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <h2 className="text-2xl font-semibold">
                        Brand Your Card
                      </h2>
                      <p className="text-gray-500 mt-1">
                        Upload a profile picture and a banner to make your card
                        stand out.
                      </p>
                    </div>
                    <CardImageUploader
                      uuid={uuid}
                      values={values}
                      setFieldValue={setFieldValue}
                      cardData={cardData}
                      setCardData={setCardData}
                    />
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Quote className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <h2 className="text-2xl font-semibold">
                        Tell Us About Yourself
                      </h2>
                      <p className="text-gray-500 mt-1">
                        Add a short bio to introduce yourself to your
                        connections.
                      </p>
                    </div>
                    <BioForm />
                  </div>
                )}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Share2 className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <h2 className="text-2xl font-semibold">
                        Connect Your Socials
                      </h2>
                      <p className="text-gray-500 mt-1">
                        Link your social media profiles to make it easy for
                        people to find you.
                      </p>
                    </div>
                    <SocialLinksForm
                      values={values}
                      setFieldValue={setFieldValue}
                      handleDragStart={() => {}}
                      handleDragOver={() => {}}
                      handleDrop={() => {}}
                      handleDragEnd={() => {}}
                    />
                  </div>
                )}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <LinkIcon className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <h2 className="text-2xl font-semibold">
                        Add Other Links
                      </h2>
                      <p className="text-gray-500 mt-1">
                        Have a portfolio, project, or something else to share?
                        Add it here.
                      </p>
                    </div>
                    <OtherLinksForm
                      values={values}
                      setFieldValue={setFieldValue}
                      handleDragStart={() => {}}
                      handleDragOver={() => {}}
                      handleDrop={() => {}}
                      handleDragEnd={() => {}}
                    />
                  </div>
                )}
                {currentStep === 6 && (
                  <div className="text-center space-y-4">
                    <PartyPopper className="mx-auto h-12 w-12 text-green-500" />
                    <h1 className="text-3xl font-bold text-gray-900">
                      Looking Good!
                    </h1>
                    <p className="text-lg text-gray-600">
                      Here&apos;s a final preview of your card. Ready to go
                      live?
                    </p>
                    <div className="mt-8 max-w-md mx-auto">
                      <CardView cardData={values} />
                    </div>
                  </div>
                )}
              </div>
            </main>

            <footer className="flex-shrink-0 p-4 border-t bg-white/80 backdrop-blur-md sticky bottom-0 z-10">
              <div className="max-w-4xl mx-auto flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    <PartyPopper className="h-4 w-4 mr-2" />
                    Finish Setup
                  </Button>
                )}
              </div>
              <div className="text-xs text-gray-400 text-center mt-2">
                Debug: Step {currentStep + 1} of {steps.length} -{' '}
                {steps[currentStep].title}
              </div>
            </footer>
          </Form>
        );
      }}
    </Formik>
  );
}
