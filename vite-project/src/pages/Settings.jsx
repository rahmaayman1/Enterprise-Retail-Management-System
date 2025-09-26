import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Database, 
  Download, 
  Upload,
  Save,
  Eye,
  EyeOff,
  Building,
  Palette,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Percent,
  FileText,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Key,
  Lock,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';

// Import services
import { userService } from '../services/userService';
import { branchService } from '../services/branchService';
import { backupService } from '../services/backupService';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Company Settings
  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    currency: 'NGN',
    taxRate: 7.5,
    logo: null
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    theme: 'light',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Africa/Lagos',
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlert: true,
    expiryAlert: true,
    invoicePrefix: 'INV-',
    quotationPrefix: 'QUO-',
    receiptPrefix: 'RCP-'
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: {
      sales: true,
      purchases: true,
      lowStock: true,
      expiry: true,
      reports: false
    },
    smsNotifications: {
      sales: false,
      purchases: false,
      lowStock: true,
      expiry: false
    },
    pushNotifications: {
      sales: true,
      purchases: true,
      lowStock: true,
      expiry: true
    }
  });

  // Backup Settings
  const [backupData, setBackupData] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    keepBackups: 30,
    lastBackup: null,
    backupSize: 0
  });

  const [backups, setBackups] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadUserProfile();
    loadCompanySettings();
    loadSystemSettings();
    loadBackups();
  }, []);

  const loadUserProfile = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser._id) {
        const userData = await userService.getUserById(currentUser._id);
        setProfileData(prev => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || ''
        }));
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  };

  const loadCompanySettings = async () => {
    try {
      // Load company settings from localStorage or API
      const savedSettings = localStorage.getItem('companySettings');
      if (savedSettings) {
        setCompanyData(JSON.parse(savedSettings));
      }
    } catch (err) {
      console.error('Error loading company settings:', err);
    }
  };

  const loadSystemSettings = async () => {
    try {
      const savedSettings = localStorage.getItem('systemSettings');
      if (savedSettings) {
        setSystemSettings(JSON.parse(savedSettings));
      }
    } catch (err) {
      console.error('Error loading system settings:', err);
    }
  };

  const loadBackups = async () => {
    try {
      const backupList = await backupService.getAllBackups();
      setBackups(Array.isArray(backupList) ? backupList : []);
    } catch (err) {
      console.error('Error loading backups:', err);
      setBackups([]);
    }
  };

  const saveProfile = async () => {
    if (!profileData.name.trim() || !profileData.email.trim()) {
      setError('Name and email are required');
      return;
    }

    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updateData = {
        name: profileData.name.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone?.trim()
      };

      if (profileData.newPassword) {
        updateData.password = profileData.newPassword;
      }

      await userService.updateUser(currentUser._id, updateData);
      
      // Update local storage
      const updatedUser = { ...currentUser, ...updateData };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess('Profile updated successfully!');
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setError('Failed to update profile: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const saveCompanySettings = async () => {
    try {
      setSaving(true);
      setError(null);

      // Save to localStorage (in real app, save to API)
      localStorage.setItem('companySettings', JSON.stringify(companyData));
      setSuccess('Company settings saved successfully!');
    } catch (err) {
      setError('Failed to save company settings');
    } finally {
      setSaving(false);
    }
  };

  const saveSystemSettings = async () => {
    try {
      setSaving(true);
      setError(null);

      localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
      setSuccess('System settings saved successfully!');
      
      // Apply theme immediately
      document.documentElement.classList.toggle('dark', systemSettings.theme === 'dark');
    } catch (err) {
      setError('Failed to save system settings');
    } finally {
      setSaving(false);
    }
  };

  const createBackup = async () => {
    try {
      setLoading(true);
      await backupService.createBackup();
      await loadBackups();
      setSuccess('Backup created successfully!');
    } catch (err) {
      setError('Failed to create backup: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = async (backupId) => {
    try {
      await backupService.downloadBackup(backupId);
      setSuccess('Backup downloaded successfully!');
    } catch (err) {
      setError('Failed to download backup: ' + (err.message || 'Unknown error'));
    }
  };

  const ProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input 
              type="text"
              value={profileData.role}
              readOnly
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={profileData.currentPassword}
                onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-teal-500"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input 
              type="password"
              value={profileData.newPassword}
              onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input 
              type="password"
              value={profileData.confirmPassword}
              onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={saveProfile}
          disabled={saving}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </>
          )}
        </button>
      </div>
    </div>
  );

  const CompanyTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input 
              type="text"
              value={companyData.name}
              onChange={(e) => {
  const value = e.target.value;
  setCompanyData(prev => ({
    ...prev,
    taxRate: value === '' ? '' : parseFloat(value)
  }));
}}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
              placeholder="Your Company Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Number</label>
            <input 
              type="text"
              value={companyData.taxNumber}
              onChange={(e) => {
  const value = e.target.value;
  setCompanyData(prev => ({
    ...prev,
    taxRate: value === '' ? '' : parseFloat(value)
  }));
}}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
              placeholder="Tax ID/Registration Number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email"
              value={companyData.email}
              onChange={(e) => {
  const value = e.target.value;
  setCompanyData(prev => ({
    ...prev,
    taxRate: value === '' ? '' : parseFloat(value)
  }));
}}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
              placeholder="company@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input 
              type="tel"
              value={companyData.phone}
              onChange={(e) => {
  const value = e.target.value;
  setCompanyData(prev => ({
    ...prev,
    taxRate: value === '' ? '' : parseFloat(value)
  }));
}}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
              placeholder="+234 xxx xxx xxxx"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea 
              value={companyData.address}
              onChange={(e) => {
  const value = e.target.value;
  setCompanyData(prev => ({
    ...prev,
    taxRate: value === '' ? '' : parseFloat(value)
  }));
}}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
              placeholder="Company full address"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
            <select
              value={companyData.currency}
              onChange={(e) => {
  const value = e.target.value;
  setCompanyData(prev => ({
    ...prev,
    taxRate: value === '' ? '' : parseFloat(value)
  }));
}}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            >
              <option value="NGN">Nigerian Naira (₦)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Tax Rate (%)</label>
            <input 
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={companyData.taxRate}
              onChange={(e) => {
  const value = e.target.value;
  setCompanyData(prev => ({
    ...prev,
    taxRate: value === '' ? '' : parseFloat(value)
  }));
}}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={saveCompanySettings}
          disabled={saving}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );

  const SystemTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
            <div className="flex space-x-3">
              <button
                onClick={() => setSystemSettings(prev => ({ ...prev, theme: 'light' }))}
                className={`flex items-center px-3 py-2 rounded-lg border ${
                  systemSettings.theme === 'light'
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-gray-300 bg-white text-gray-700'
                }`}
              >
                <Sun className="w-4 h-4 mr-2" />
                Light
              </button>
              <button
                onClick={() => setSystemSettings(prev => ({ ...prev, theme: 'dark' }))}
                className={`flex items-center px-3 py-2 rounded-lg border ${
                  systemSettings.theme === 'dark'
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-gray-300 bg-white text-gray-700'
                }`}
              >
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </button>
              <button
                onClick={() => setSystemSettings(prev => ({ ...prev, theme: 'auto' }))}
                className={`flex items-center px-3 py-2 rounded-lg border ${
                  systemSettings.theme === 'auto'
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-gray-300 bg-white text-gray-700'
                }`}
              >
                <Monitor className="w-4 h-4 mr-2" />
                Auto
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={systemSettings.language}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, language: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
            <select
              value={systemSettings.dateFormat}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={systemSettings.timezone}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            >
              <option value="Africa/Lagos">West Africa Time</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="Europe/London">Greenwich Mean Time</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Prefixes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix</label>
            <input 
              type="text"
              value={systemSettings.invoicePrefix}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, invoicePrefix: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Prefix</label>
            <input 
              type="text"
              value={systemSettings.quotationPrefix}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, quotationPrefix: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Prefix</label>
            <input 
              type="text"
              value={systemSettings.receiptPrefix}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, receiptPrefix: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={saveSystemSettings}
          disabled={saving}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-3">
          {Object.entries(notificationSettings.emailNotifications).map(([key, value]) => (
            <label key={key} className="flex items-center">
              <input 
                type="checkbox"
                checked={value}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  emailNotifications: {
                    ...prev.emailNotifications,
                    [key]: e.target.checked
                  }
                }))}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="ml-3 text-sm text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS Notifications</h3>
        <div className="space-y-3">
          {Object.entries(notificationSettings.smsNotifications).map(([key, value]) => (
            <label key={key} className="flex items-center">
              <input 
                type="checkbox"
                checked={value}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  smsNotifications: {
                    ...prev.smsNotifications,
                    [key]: e.target.checked
                  }
                }))}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="ml-3 text-sm text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => {
            localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
            setSuccess('Notification settings saved!');
          }}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  );

  const BackupTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center">
              <input 
                type="checkbox"
                checked={backupData.autoBackup}
                onChange={(e) => setBackupData(prev => ({ ...prev, autoBackup: e.target.checked }))}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="ml-3 text-sm text-gray-700">Enable automatic backups</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Backup Frequency</label>
            <select
              value={backupData.backupFrequency}
              onChange={(e) => setBackupData(prev => ({ ...prev, backupFrequency: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
              disabled={!backupData.autoBackup}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Manual Backup</h3>
          <button 
            onClick={createBackup}
            disabled={loading}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Create Backup
              </>
            )}
          </button>
        </div>
        
        {backups.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Available Backups</h4>
            <div className="space-y-2">
              {backups.slice(0, 5).map((backup, index) => (
                <div key={backup._id || index} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Backup {backup.name || `#${index + 1}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {backup.createdAt ? new Date(backup.createdAt).toLocaleString() : 'Recently created'}
                      {backup.size && ` • ${(backup.size / 1024 / 1024).toFixed(1)} MB`}
                    </p>
                  </div>
                  <button 
                    onClick={() => downloadBackup(backup._id)}
                    className="px-3 py-1 text-teal-600 border border-teal-600 rounded hover:bg-teal-50 text-xs"
                  >
                    <Download className="w-3 h-3 mr-1 inline" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User, component: ProfileTab },
    { id: 'company', name: 'Company', icon: Building, component: CompanyTab },
    { id: 'system', name: 'System', icon: SettingsIcon, component: SystemTab },
    { id: 'notifications', name: 'Notifications', icon: Bell, component: NotificationsTab },
    { id: 'backup', name: 'Backup', icon: Database, component: BackupTab }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ProfileTab;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and system preferences</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
            <button 
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-400 hover:text-green-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Settings Layout */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          {/* Desktop Tabs */}
          <nav className="hidden sm:flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>

          {/* Mobile Dropdown */}
          <div className="sm:hidden px-6 py-4">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <ActiveComponent />
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>System Version: 1.0.0 • Last Updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default SettingsPage;