'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, MapPin, Shield, Sparkles } from 'lucide-react';
import MobileFrame from '@/components/MobileFrame';
import useStore from '@/store/useStore';
import type { IdentityType, CommunicationPreference, ComfortPreference, AvailabilityVibe } from '@/types';
import { COMMUNICATION_LABELS, COMMUNICATION_ICONS, COMFORT_LABELS, INTEREST_OPTIONS } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const STEPS = ['Identity', 'Communication', 'Interests', 'Location', 'Safety'];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { currentUser, setCurrentUser, loadFromStorage } = useStore();
  const [step, setStep] = useState(0);

  // Form state
  const [identity, setIdentity] = useState<IdentityType | null>(null);
  const [commPrefs, setCommPrefs] = useState<CommunicationPreference[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [school, setSchool] = useState('');
  const [radius, setRadius] = useState(15);
  const [showToAllies, setShowToAllies] = useState(true);
  const [allowGroupInvites, setAllowGroupInvites] = useState(true);
  const [showASLLearners, setShowASLLearners] = useState(true);
  const [comfortPrefs, setComfortPrefs] = useState<ComfortPreference[]>([]);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (currentUser?.onboardingComplete) {
      router.push('/discover');
    }
  }, [currentUser, router]);

  const toggleComm = (pref: CommunicationPreference) => {
    setCommPrefs((p) =>
      p.includes(pref) ? p.filter((x) => x !== pref) : [...p, pref]
    );
  };

  const toggleInterest = (interest: string) => {
    setInterests((p) =>
      p.includes(interest) ? p.filter((x) => x !== interest) : [...p, interest]
    );
  };

  const toggleComfort = (pref: ComfortPreference) => {
    setComfortPrefs((p) =>
      p.includes(pref) ? p.filter((x) => x !== pref) : [...p, pref]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 0: return identity !== null;
      case 1: return commPrefs.length > 0;
      case 2: return interests.length > 0;
      case 3: return city.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  const handleComplete = () => {
    const userName = session?.user?.name || 'User';
    const userEmail = session?.user?.email || 'user@example.com';

    const profile = {
      id: currentUser?.id || uuidv4(),
      name: userName,
      email: userEmail,
      avatar: session?.user?.image || '',
      photos: [],
      identity: identity!,
      communicationPreferences: commPrefs,
      comfortPreferences: comfortPrefs,
      interests,
      bio: {
        perfectHangout: '',
        communicationStyle: '',
        lookingForFriend: '',
      },
      location: {
        city,
        school: school || undefined,
        radiusMiles: radius,
      },
      availability: [] as AvailabilityVibe[],
      safetySettings: {
        showToHearingAllies: showToAllies,
        allowGroupInvites,
        showASLLearners,
      },
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(profile);
    router.push('/profile');
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Who are you?</h2>
              <p className="text-gray-500 text-sm">This helps us find the right community for you</p>
            </div>
            {([
              { value: 'deaf' as IdentityType, label: 'Deaf', icon: '🤟', desc: 'I identify as Deaf' },
              { value: 'hoh' as IdentityType, label: 'Hard of Hearing', icon: '👂', desc: 'I have some hearing loss' },
              { value: 'hearing_ally' as IdentityType, label: 'Hearing Ally', icon: '🤝', desc: 'I support the Deaf community' },
            ]).map((option) => (
              <button
                key={option.value}
                onClick={() => setIdentity(option.value)}
                className={`w-full p-5 rounded-2xl text-left flex items-center gap-4 transition-all ${
                  identity === option.value
                    ? 'bg-purple-500 text-white shadow-lg scale-[1.02]'
                    : 'bg-white border-2 border-gray-100 hover:border-purple-200 text-gray-800'
                }`}
              >
                <span className="text-3xl">{option.icon}</span>
                <div>
                  <div className="font-bold text-lg">{option.label}</div>
                  <div className={`text-sm ${identity === option.value ? 'text-purple-100' : 'text-gray-500'}`}>
                    {option.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How do you communicate?</h2>
              <p className="text-gray-500 text-sm">Select all that apply</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(COMMUNICATION_LABELS) as CommunicationPreference[]).map((pref) => (
                <button
                  key={pref}
                  onClick={() => toggleComm(pref)}
                  className={`p-4 rounded-2xl text-center transition-all ${
                    commPrefs.includes(pref)
                      ? 'bg-purple-500 text-white shadow-lg scale-[1.02]'
                      : 'bg-white border-2 border-gray-100 hover:border-purple-200 text-gray-800'
                  }`}
                >
                  <span className="text-2xl block mb-1">{COMMUNICATION_ICONS[pref]}</span>
                  <span className="text-sm font-semibold">{COMMUNICATION_LABELS[pref]}</span>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Comfort preferences</h3>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(COMFORT_LABELS) as ComfortPreference[]).map((pref) => (
                  <button
                    key={pref}
                    onClick={() => toggleComfort(pref)}
                    className={`p-3 rounded-xl text-xs font-medium transition-all ${
                      comfortPrefs.includes(pref)
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                        : 'bg-gray-50 text-gray-600 border-2 border-transparent'
                    }`}
                  >
                    {COMFORT_LABELS[pref]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your interests</h2>
              <p className="text-gray-500 text-sm">Pick at least 3 to help find your people</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    interests.includes(interest)
                      ? 'bg-purple-500 text-white shadow-md scale-[1.02]'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <MapPin className="mx-auto mb-3 text-purple-500" size={32} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your location</h2>
              <p className="text-gray-500 text-sm">Your address stays hidden — others only see distance</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Dallas, TX"
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-purple-400 focus:outline-none text-gray-800 bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">School (optional)</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g., Lincoln High School"
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-purple-400 focus:outline-none text-gray-800 bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Distance radius: {radius} miles
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5 mi</span>
                <span>50 mi</span>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <Shield className="mx-auto mb-3 text-purple-500" size={32} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Safety & boundaries</h2>
              <p className="text-gray-500 text-sm">You can change these anytime in settings</p>
            </div>
            {[
              {
                label: 'Show me to Hearing Allies',
                desc: 'Allow hearing allies to see your profile',
                value: showToAllies,
                onChange: setShowToAllies,
              },
              {
                label: 'Allow group invites',
                desc: 'Let others invite you to groups',
                value: allowGroupInvites,
                onChange: setAllowGroupInvites,
              },
              {
                label: 'Show ASL learners',
                desc: 'Include people who are learning ASL',
                value: showASLLearners,
                onChange: setShowASLLearners,
              },
            ].map((setting) => (
              <div key={setting.label} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100">
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{setting.label}</div>
                  <div className="text-xs text-gray-500">{setting.desc}</div>
                </div>
                <button
                  onClick={() => setting.onChange(!setting.value)}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    setting.value ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      setting.value ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <MobileFrame>
      <div className="flex flex-col min-h-full bg-gray-50">
        {/* Header */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <Sparkles className="text-purple-500" size={24} />
            <span className="text-sm font-semibold text-gray-500">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  i <= step ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-4 overflow-y-auto pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 py-4 pb-8 bg-gray-50/95 backdrop-blur-sm" style={{ borderBottomLeftRadius: '2.5rem', borderBottomRightRadius: '2.5rem' }}>
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gray-100 text-gray-700 font-semibold flex items-center justify-center gap-1 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft size={18} />
                Back
              </button>
            )}
            <button
              onClick={step === STEPS.length - 1 ? handleComplete : () => setStep(step + 1)}
              disabled={!canProceed()}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-semibold flex items-center justify-center gap-1 transition-all ${
                canProceed()
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {step === STEPS.length - 1 ? 'Complete' : 'Next'}
              {step < STEPS.length - 1 && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
