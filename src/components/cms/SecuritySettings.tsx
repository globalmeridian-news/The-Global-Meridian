import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle,
  Eye,
  EyeOff,
  AlertCircle,
  Smartphone,
  Save,
  UserCheck,
} from 'lucide-react';
import { useNews } from '../../context/NewsContext';

export const SecuritySettings: React.FC = () => {
  const {
    adminCredentials,
    updateAdminCredentials,
    twoFactorEnabled,
    setTwoFactorEnabled,
    currentRole,
    currentLanguage,
    isAuthenticated,
  } = useNews();

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Admin Profile State
  const [username, setUsername] = useState(adminCredentials.username);
  const [email, setEmail] = useState(adminCredentials.email);
  const [recoveryEmail, setRecoveryEmail] = useState(adminCredentials.recoveryEmail);

  // Status message
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isBn = currentLanguage === 'bn';

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (currentPassword !== adminCredentials.password) {
      setStatusMessage({
        type: 'error',
        text: isBn ? 'বর্তমান পাসওয়ার্ডটি সঠিক নয়।' : 'Current password does not match.',
      });
      return;
    }

    if (newPassword.length < 4) {
      setStatusMessage({
        type: 'error',
        text: isBn ? 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'New password must be at least 4 characters long.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({
        type: 'error',
        text: isBn ? 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।' : 'New password and confirmation password do not match.',
      });
      return;
    }

    updateAdminCredentials({ password: newPassword });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setStatusMessage({
      type: 'success',
      text: isBn
        ? 'এডমিন পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! পরবর্তী লগইনে এই নতুন পাসওয়ার্ড কার্যকর হবে।'
        : 'Admin password updated successfully! Use your new password for subsequent logins.',
    });
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminCredentials({ username, email, recoveryEmail });
    setStatusMessage({
      type: 'success',
      text: isBn
        ? 'এডমিন প্রোফাইল ও রিকভারি ইমেইল সফলভাবে আপডেট হয়েছে!'
        : 'Admin profile and recovery email updated successfully!',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-slate-900 text-amber-400 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
            {isBn ? 'নিরাপত্তা ও অ্যাক্সেস' : 'Security Protocols'}
          </span>
          <span className="text-slate-400 text-xs">&middot;</span>
          <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isBn ? 'সক্রিয় এডমিন সেশন' : 'Active Admin Session'}
          </span>
        </div>
        <h2 className="font-serif-headline text-2xl font-bold text-slate-950 flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-red-600" />
          <span>{isBn ? 'এডমিন পাসওয়ার্ড ও লগইন সেটিংস' : 'Admin Credentials & Password Security'}</span>
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          {isBn
            ? 'আপনার মোবাইলে বা কম্পিউটারে এডমিন ড্যাশবোর্ডে প্রবেশের পাসওয়ার্ড পরিবর্তন করুন ও টু-ফ্যাক্টর নিরাপত্তা নিয়ন্ত্রণ করুন।'
            : 'Manage administrator login password, recovery email address, and multi-factor authentication from any phone or computer.'}
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-2xs animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Change Password Form */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <Lock className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-sm text-slate-900">
              {isBn ? 'এডমিন পাসওয়ার্ড পরিবর্তন' : 'Change Admin Password'}
            </h3>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-3.5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'বর্তমান পাসওয়ার্ড *' : 'Current Password *'}
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={isBn ? 'বর্তমান পাসওয়ার্ড লিখুন (ডিফল্ট: admin)' : 'Enter current password (default: admin)'}
                  className="w-full text-xs p-2.5 pr-8 border border-slate-300 rounded focus:border-red-600 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'নতুন পাসওয়ার্ড *' : 'New Password *'}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isBn ? 'নতুন পাসওয়ার্ড দিন (কমপক্ষে ৪ অক্ষর)' : 'Enter new password'}
                  className="w-full text-xs p-2.5 pr-8 border border-slate-300 rounded focus:border-red-600 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন *' : 'Confirm New Password *'}
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isBn ? 'নতুন পাসওয়ার্ডটি আবার লিখুন' : 'Re-type new password'}
                className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-red-600 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isBn ? 'পাসওয়ার্ড পরিবর্তন নিশ্চিত করুন' : 'Update Password'}</span>
            </button>
          </form>
        </div>

        {/* 2. Admin Username & Recovery Email */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              {isBn ? 'এডমিন প্রোফাইল ও লগইন ইমেইল' : 'Admin Login Profile'}
            </h3>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'এডমিন ইউজারনেম' : 'Admin Username'}
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-red-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'লগইন ইমেইল' : 'Primary Login Email'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-red-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'রিকভারি ইমেইল (পাসওয়ার্ড ভুলে গেলে)' : 'Emergency Recovery Email'}
              </label>
              <input
                type="email"
                required
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-red-600 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-2.5 rounded text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBn ? 'প্রোফাইল তথ্য সংরক্ষণ করুন' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* 3. Two-Factor Authentication & Mobile Access Info */}
      <div className="bg-slate-900 text-white rounded-lg p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Smartphone className="w-8 h-8 text-amber-400 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-slate-100">
                {isBn ? 'মোবাইল টু-ফ্যাক্টর নিরাপত্তা (2FA)' : 'Mobile Two-Factor Verification'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn
                  ? 'স্মার্টফোন বা ট্যাবলেট থেকে লগইনের সময় অতিরিক্ত নিরাপত্তা কোড যাচাই বাধ্যতামূলক থাকবে।'
                  : 'Enforces mobile confirmation PIN when signing into the Newsroom CMS from unfamiliar devices.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-amber-300">
              {twoFactorEnabled ? (isBn ? 'চালু আছে' : 'Enabled') : (isBn ? 'বন্ধ' : 'Disabled')}
            </span>
            <button
              type="button"
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`px-4 py-2 rounded text-xs font-bold transition-colors cursor-pointer ${
                twoFactorEnabled
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {twoFactorEnabled ? (isBn ? 'নিষ্ক্রিয় করুন' : 'Disable') : (isBn ? 'সক্রিয় করুন' : 'Enable')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
