import React, { useState } from 'react';
import {
  Users,
  Shield,
  UserPlus,
  Crown,
  Edit3,
  Mic,
  Trash2,
  CheckCircle,
  X,
  Mail,
  Check,
} from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { TeamUser, UserRole } from '../../types/news';

export const TeamManager: React.FC = () => {
  const {
    teamUsers,
    addTeamUser,
    updateTeamUserRole,
    deleteTeamUser,
    currentRole,
    currentLanguage,
  } = useNews();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [title, setTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isBn = currentLanguage === 'bn';

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('admin');
    setTitle('');
    setIsAdding(false);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert(isBn ? 'অনুগ্রহ করে নাম এবং ইমেইল পূরণ করুন।' : 'Please enter name and email.');
      return;
    }

    addTeamUser({
      name,
      email,
      role,
      title: title || (role === 'admin' ? 'Editorial Administrator' : role === 'editor' ? 'Senior News Editor' : 'Staff Reporter'),
      isActive: true,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=120&q=80`,
    });

    setToastMessage(
      isBn
        ? `সফলভাবে ${name}-কে "${role.toUpperCase()}" হিসেবে যুক্ত করা হয়েছে!`
        : `Successfully added ${name} as "${role.toUpperCase()}"!`
    );
    setTimeout(() => setToastMessage(null), 3000);
    resetForm();
  };

  const handleRoleChange = (userId: string, newRole: UserRole, userName: string) => {
    updateTeamUserRole(userId, newRole);
    setToastMessage(
      isBn
        ? `${userName}-কে সফলভাবে "${newRole.toUpperCase()}" বানানো হয়েছে!`
        : `Successfully changed ${userName}'s role to "${newRole.toUpperCase()}"!`
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return (
          <span className="bg-red-100 text-red-900 border border-red-300 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Crown className="w-3 h-3 text-red-700" />
            <span>ADMIN (সর্বোচ্চ ক্ষমতা)</span>
          </span>
        );
      case 'editor':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Edit3 className="w-3 h-3 text-amber-700" />
            <span>EDITOR (সম্পাদনা ও প্রকাশ)</span>
          </span>
        );
      case 'reporter':
        return (
          <span className="bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Mic className="w-3 h-3 text-blue-700" />
            <span>REPORTER (সংবাদ প্রেরণ)</span>
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">
            READER
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-100 text-red-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
              {isBn ? 'ব্যবহারকারী ও অ্যাক্সেস কন্ট্রোল' : 'User Access & Roles'}
            </span>
          </div>
          <h2 className="font-serif-headline text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            <span>{isBn ? 'টিম ম্যানেজমেন্ট ও এডমিন তৈরি' : 'Team & Admin Role Delegation'}</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {isBn
              ? 'যেকোনো ব্যক্তিকে এক ক্লিকেই এডমিন (Admin), এডিটর (Editor) বা রিপোর্টার (Reporter) বানান বা নতুন টিম সদস্য যুক্ত করুন।'
              : 'Promote any journalist or user to Admin with full newsroom privileges directly from your phone.'}
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white font-bold px-4 py-2.5 rounded text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>{isBn ? '+ নতুন ব্যক্তি / এডমিন যুক্ত করুন' : '+ Add User / Make Admin'}</span>
          </button>
        )}
      </div>

      {toastMessage && (
        <div className="bg-emerald-600 text-white p-3 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Add User / Make Admin Form Card with ✕ Close Button */}
      {isAdding && (
        <div className="bg-white border-2 border-red-500 rounded-lg p-5 shadow-lg relative animate-in fade-in">
          {/* Prominent Close ✕ Button */}
          <button
            onClick={resetForm}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            title={isBn ? 'ফর্মটি বন্ধ করুন' : 'Close form'}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="pr-8 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
              {isBn ? 'নতুন এডমিন / টিম সদস্য ফর্ম' : 'Role Provisioning'}
            </span>
            <h3 className="text-lg font-bold text-slate-950 font-serif-headline">
              {isBn ? 'কাউকে এডমিন বা রিপোর্টার হিসেবে যোগ করুন' : 'Grant Team Permissions'}
            </h3>
            <p className="text-xs text-slate-500">
              {isBn
                ? 'নাম ও ইমেইল দিয়ে তার ভূমিকা নির্ধারণ করুন।'
                : 'Enter name and email, then select their access level.'}
            </p>
          </div>

          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'পূর্ণ নাম *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isBn ? 'যেমন: মোহাম্মদ রফিক' : 'e.g., Alexander Hayes'}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'ইমেইল অ্যাড্রেস *' : 'Email Address *'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rafiq@meridian-news.org"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-red-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'ভূমিকা / ক্ষমতা নির্ধারণ করুন (Role) *' : 'Select Access Role *'}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-red-600 focus:outline-hidden bg-white font-medium"
                >
                  <option value="admin">👑 ADMIN — সর্বোচ্চ ক্ষমতা (খবর পাবলিশ, ডিলিট, এডমিন তৈরি, বিজ্ঞাপন)</option>
                  <option value="editor">📝 EDITOR — এডিটর (খবর সম্পাদনা, সংশোধন ও প্রকাশ করার ক্ষমতা)</option>
                  <option value="reporter">🎤 REPORTER — রিপোর্টার (মোবাইল থেকে খবর লিখে ড্রাফট পাঠানোর ক্ষমতা)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'পদবী / উপাধি (ঐচ্ছিক)' : 'Official Title (Optional)'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isBn ? 'যেমন: প্রধান আন্তর্জাতিক প্রতিনিধি' : 'e.g., Senior Diplomatic Editor'}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-red-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Actions: Save & Close ✕ */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2 rounded text-xs cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isBn ? 'বাতিল করুন (✕)' : 'Cancel & Close'}</span>
              </button>

              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isBn ? 'নিশ্চিত করুন ও ক্ষমতা প্রদান করুন' : 'Confirm & Grant Role'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team Members List */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            {isBn ? `সক্রিয় টিম সদস্য ও এডমিন তালিকা (${teamUsers.length})` : `Team Members & Privileges (${teamUsers.length})`}
          </span>
          <span className="text-[11px] text-slate-500">
            {teamUsers.filter((u) => u.role === 'admin').length} {isBn ? 'জন এডমিন' : 'admins'}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {teamUsers.map((user) => (
            <div
              key={user.id}
              className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
            >
              {/* User Identity */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-300">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h4 className="font-bold text-slate-950 text-sm">
                      {user.name}
                    </h4>
                    {getRoleBadge(user.role)}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {user.email}
                    </span>
                    {user.title && (
                      <>
                        <span>&middot;</span>
                        <span className="text-slate-600">{user.title}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Instant Role Switching Buttons (Make Admin / Make Editor / Make Reporter) */}
              <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {/* 1. Make Admin */}
                {user.role !== 'admin' && (
                  <button
                    onClick={() => handleRoleChange(user.id, 'admin', user.name)}
                    className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 px-2.5 py-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title={isBn ? 'এই ব্যক্তিকে পূর্ণ এডমিন ক্ষমতা প্রদান করুন' : 'Promote to Admin with full access'}
                  >
                    <Crown className="w-3 h-3 text-red-700" />
                    <span>{isBn ? 'এডমিন বানান' : 'Make Admin'}</span>
                  </button>
                )}

                {/* 2. Make Editor */}
                {user.role !== 'editor' && (
                  <button
                    onClick={() => handleRoleChange(user.id, 'editor', user.name)}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    title={isBn ? 'এই ব্যক্তিকে এডিটর ক্ষমতা প্রদান করুন' : 'Assign Editor Role'}
                  >
                    <Edit3 className="w-3 h-3 text-amber-700" />
                    <span>{isBn ? 'এডিটর বানান' : 'Make Editor'}</span>
                  </button>
                )}

                {/* 3. Make Reporter */}
                {user.role !== 'reporter' && (
                  <button
                    onClick={() => handleRoleChange(user.id, 'reporter', user.name)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    title={isBn ? 'এই ব্যক্তিকে রিপোর্টার বানান' : 'Assign Reporter Role'}
                  >
                    <Mic className="w-3 h-3 text-blue-700" />
                    <span>{isBn ? 'রিপোর্টার বানান' : 'Make Reporter'}</span>
                  </button>
                )}

                {/* 4. Delete user (except first admin) */}
                {user.id !== 'user-admin-1' && (
                  <>
                    {confirmDeleteId === user.id ? (
                      <div className="flex items-center gap-1 bg-red-50 p-1 rounded border border-red-200">
                        <span className="text-[10px] text-red-800 font-bold">{isBn ? 'মুছবেন?' : 'Delete?'}</span>
                        <button
                          onClick={() => {
                            deleteTeamUser(user.id);
                            setConfirmDeleteId(null);
                          }}
                          className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer hover:bg-red-700"
                        >
                          {isBn ? 'হ্যাঁ' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-slate-600 text-[10px] px-1 hover:text-slate-950 cursor-pointer"
                        >
                          {isBn ? 'না' : 'No'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(user.id)}
                        className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer transition-colors ml-1"
                        title={isBn ? 'টিম থেকে বাদ দিন' : 'Remove user'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
