'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Settings, ShieldCheck, UserCircle, KeySquare } from 'lucide-react';

export default function GlobalProfileSettings() {
  const { user, fetchUser } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const payload = { name, email };
      if (password.trim() !== '') {
        payload.password = password;
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage('Profile updated successfully!');
        setPassword('');
        await fetchUser(); 
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="p-8">Loading profile context...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3 border-b pb-4">
        <Settings className="w-8 h-8 text-gray-700" />
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your standard identity metrics here.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        
        <div className="bg-linear-to-r from-gray-50 to-gray-100 p-8 flex items-center gap-6 border-b border-gray-200">
          <div className="w-24 h-24 rounded-full bg-blue-600 text-white font-bold text-4xl flex items-center justify-center uppercase shadow-md">
            {user.name?.charAt(0) || '?'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${
                user.role === 'admin' ? 'bg-purple-600 text-white' : 
                user.role === 'teacher' ? 'bg-blue-600 text-white' : 
                'bg-green-600 text-white'
              }`}>
                {user.role} workspace
              </span>
              <span className="flex items-center text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-100">
                <ShieldCheck className="w-4 h-4 mr-1"/> Verified Active
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <form className="space-y-6" onSubmit={handleUpdateProfile}>
            
            {/* Name/Email config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <UserCircle className="w-4 h-4 text-gray-400" /> Full Name
                </label>
                <input 
                  type="text" 
                  required
                  value={name} 
                  onChange={e=>setName(e.target.value)} 
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none transition-shadow" 
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <UserCircle className="w-4 h-4 text-gray-400" /> Active Email
                </label>
                <input 
                  type="email" 
                  required
                  value={email} 
                  onChange={e=>setEmail(e.target.value)} 
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none transition-shadow" 
                />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Password Config */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <KeySquare className="w-4 h-4 text-gray-500" /> Change Password
              </label>
              <p className="text-xs text-gray-500 mb-4">Leave this field blank if you do not wish to alter your current password.</p>
              <input 
                type="password" 
                placeholder="Type new secure password..."
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none transition-shadow bg-white" 
              />
            </div>

            {/* Alerts */}
            {message && <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl font-medium text-sm">{message}</div>}
            {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium text-sm">{error}</div>}

            <button 
              type="submit" 
              disabled={saving}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-sm ${saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'}`}
            >
              {saving ? 'Processing Changes...' : 'Save Profile Settings'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
