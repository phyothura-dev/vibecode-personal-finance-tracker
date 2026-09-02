import React, { useState } from 'react';
import { User, Award, Check, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';

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
      onShowToast('အမည်ထည့်သွင်းရန် လိုအပ်ပါသည်။', 'error');
      return;
    }

    let parsedGoal: number | null = null;
    if (monthlyGoal.trim() !== '') {
      parsedGoal = parseFloat(monthlyGoal);
      if (isNaN(parsedGoal) || parsedGoal < 0) {
        onShowToast('လစဉ်ဝင်ငွေ ရည်မှန်းချက်သည် အပေါင်းကိန်း ဖြစ်ရပါမည်။', 'error');
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
      onShowToast('ပရိုဖိုင် အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('ပရိုဖိုင် ပြင်ဆင်ခြင်း မအောင်မြင်ပါ။', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Avatar picker */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
              ပရိုဖိုင်ပုံ ရွေးချယ်ပါ
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <img
                id="profile-preview-avatar"
                src={photoURL || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                referrerPolicy="no-referrer"
                alt="Current profile"
                className="w-16 h-16 rounded-full border border-slate-200 bg-slate-100 object-cover flex-shrink-0"
              />
              <div className="flex-1 w-full flex justify-center sm:justify-start">
                <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start max-w-xs">
                  {avatarPresets.map((preset, idx) => {
                    const isSelected = photoURL === preset;
                    return (
                      <button
                        id={`btn-preset-avatar-${idx}`}
                        key={preset}
                        type="button"
                        onClick={() => setPhotoURL(preset)}
                        className={`relative rounded-full overflow-hidden border-2 w-10 h-10 hover:opacity-85 transition-all cursor-pointer ${
                          isSelected ? 'border-[#4F46E5] scale-105 shadow-sm' : 'border-slate-200'
                        }`}
                      >
                        <img src={preset} alt="preset" referrerPolicy="no-referrer" className="object-cover w-full h-full" />
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
                အမည် အပြည့်အစုံ
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 sm:top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="p-fullName"
                  type="text"
                  required
                  placeholder="ဦးမောင်မောင်"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 sm:py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-base sm:text-sm focus:ring-1 focus:ring-indigo-500 bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              {/* Monthly Income Goal */}
              <div>
                <label htmlFor="p-monthlyGoal" className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  လစဉ်ဝင်ငွေ ရည်မှန်းချက် (Ks)
                </label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-3 sm:top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="p-monthlyGoal"
                    type="number"
                    placeholder="ဥပမာ - ၁,၀၀၀,၀၀၀"
                    value={monthlyGoal}
                    onChange={(e) => setMonthlyGoal(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 sm:py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-base sm:text-sm focus:ring-1 focus:ring-indigo-500 bg-white transition-colors"
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
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#4F46E5] text-sm font-medium text-white hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer min-h-[44px]"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              သိမ်းဆည်းမည်
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
