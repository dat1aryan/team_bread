'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  Phone, 
  Heart, 
  ShieldCheck, 
  Check, 
  Edit2, 
  Save,
  Globe
} from 'lucide-react';
import { PatientProfile, LanguageCode } from '@/types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PatientProfile;
  onSaveProfile: (updated: PatientProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile
}) => {
  const [formData, setFormData] = useState<PatientProfile>(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setIsEditing(false);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white font-extrabold text-lg flex items-center justify-center shadow-xs">
              {formData.fullName.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">My Health Profile</h3>
              <p className="text-xs text-slate-500">Official patient demographics and ABHA identity</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Edit Profile</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile details successfully saved and updated!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
              <div className="relative">
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 text-sm text-slate-900 font-medium disabled:text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  disabled={!isEditing}
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 text-sm text-slate-900 font-medium disabled:text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                disabled={!isEditing}
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 text-sm text-slate-900 font-medium disabled:text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
              <select
                disabled={!isEditing}
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 text-sm text-slate-900 font-medium disabled:text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="unknown">Prefer not to say</option>
              </select>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 text-sm text-slate-900 font-medium disabled:text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 text-sm text-slate-900 font-medium disabled:text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            {/* Emergency Contact */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact & Kin</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 text-sm text-slate-900 font-medium disabled:text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            {/* ABHA Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ABHA ID (14 Digits)</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.abhaId || ''}
                onChange={(e) => setFormData({ ...formData, abhaId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 text-sm font-mono text-slate-900 font-medium disabled:text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            {/* ABHA Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ABHA Address (PHR Handle)</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.abhaAddress || ''}
                onChange={(e) => setFormData({ ...formData, abhaAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 text-sm font-mono text-slate-900 font-medium disabled:text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(profile);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            )}
          </div>
        </form>

      </div>
    </div>
  );
};
