import React, { useState } from 'react';
import { User, DollarSign, Award, Check, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';
import { useLanguage } from '../lib/LanguageContext';

interface ProfileManagerProps {
  profile: UserProfile | null;
  onUpdateProfile: (data: Partial<UserProfile>) => Promise<void>;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export default function ProfileManager({
  profile,
  onUpdateProfile,
  onShowToast,
}: ProfileManagerProps) {
  const { t } = useLanguage();

  // Local Form state
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [currency, setCurrency] = useState('Ks');
  const [monthlyGoal, setMonthlyGoal] = useState(
    profile?.monthlyIncomeGoal ? profile.monthlyIncomeGoal.toString() : ''
  );
  
  const [isSaving, setIsSaving] = useState(false);

  // Avatar presets helper
  const avatarPresets = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Lilly',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Cody',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aria',
    'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(fullName || 'User'),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      onShowToast(t('profile.nameEmptyError'), 'error');
      return;
    }

    let parsedGoal: number | null = null;
    if (monthlyGoal.trim() !== '') {
      parsedGoal = parseFloat(monthlyGoal);
      if (isNaN(parsedGoal) || parsedGoal < 0) {
        onShowToast(t('profile.goalPositiveError'), 'error');
        return;
      }
    }

    setIsSaving(true);
    try {
      await onUpdateProfile({
        fullName: fullName.trim(),
        photoURL,
        currency,
        monthlyIncomeGoal: parsedGoal,
      });
      onShowToast(t('profile.updateSuccess'), 'success');
    } catch (err) {
      console.error(err);
      onShowToast(t('profile.updateFail'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h3 className="font-semibold text-slate-800 text-sm">{t('profile.title')}</h3>
          <p className="text-xs text-slate-400 mt-1">{t('profile.description')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar picker */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
              {t('profile.selectAvatar')}
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <img
                id="profile-preview-avatar"
                src={photoURL || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                referrerPolicy="no-referrer"
                alt="Current profile"
                className="w-16 h-16 rounded-full border border-slate-200 bg-slate-100 object-cover"
              />
              <div className="flex-1">
                <div className="grid grid-cols-6 gap-2 max-w-xs">
                  {avatarPresets.map((preset, idx) => {
                    const isSelected = photoURL === preset;
                    return (
                      <button
                        id={`btn-preset-avatar-${idx}`}
                        key={preset}
                        type="button"
                        onClick={() => setPhotoURL(preset)}
                        className={`relative rounded-full overflow-hidden border-2 w-10 h-10 hover:opacity-85 transition-all cursor-pointer ${
                          isSelected ? 'border-[#4F46E5] scale-105' : 'border-slate-200'
                        }`}
                      >
                        <img src={preset} alt="preset" referrerPolicy="no-referrer" className="object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#4F46E5]/25 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white font-bold" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Form details */}
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="p-fullName" className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                {t('profile.fullNameLabel')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="p-fullName"
                  type="text"
                  required
                  placeholder={t('profile.fullNamePlaceholder')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm focus:ring-1 focus:ring-indigo-500 bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              {/* Monthly Income Goal */}
              <div>
                <label htmlFor="p-monthlyGoal" className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  {t('profile.monthlyGoalLabel')}
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="p-monthlyGoal"
                    type="number"
                    placeholder={t('profile.monthlyGoalPlaceholder')}
                    value={monthlyGoal}
                    onChange={(e) => setMonthlyGoal(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm focus:ring-1 focus:ring-indigo-500 bg-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              id="btn-save-profile"
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-lg bg-[#4F46E5] text-sm font-medium text-white hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              {t('profile.saveProfileButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
