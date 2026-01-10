import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Button, Card, Input, Textarea, Spinner } from '../../components/ui';
import AdminLayout from '../../layouts/AdminLayout';

interface Setting {
  id: number;
  key: string;
  value: string;
  type: string;
  group: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<Record<string, Setting>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const settingsConfig = [
    {
      group: 'General',
      settings: [
        { key: 'site_name', label: 'Site Name', type: 'text', default: 'Sawdust & Coffee' },
        { key: 'site_tagline', label: 'Tagline', type: 'text', default: 'Custom Woodworking & Design' },
        { key: 'contact_email', label: 'Contact Email', type: 'email', default: 'info@sawdustandcoffee.com' },
        { key: 'contact_phone', label: 'Contact Phone', type: 'text', default: '(555) 123-4567' },
        { key: 'business_address', label: 'Business Address', type: 'textarea', default: '123 Workshop Lane\nCrafts City, ST 12345' },
      ],
    },
    {
      group: 'E-commerce',
      settings: [
        { key: 'tax_rate', label: 'Tax Rate (%)', type: 'number', default: '8.0' },
        { key: 'shipping_flat_rate', label: 'Flat Shipping Rate ($)', type: 'number', default: '10.00' },
        { key: 'free_shipping_threshold', label: 'Free Shipping Threshold ($)', type: 'number', default: '100.00' },
        { key: 'currency_symbol', label: 'Currency Symbol', type: 'text', default: '$' },
        { key: 'low_stock_threshold', label: 'Low Stock Alert Threshold', type: 'number', default: '10' },
      ],
    },
    {
      group: 'Social Media',
      settings: [
        { key: 'facebook_url', label: 'Facebook URL', type: 'url', default: '' },
        { key: 'instagram_url', label: 'Instagram URL', type: 'url', default: '' },
        { key: 'pinterest_url', label: 'Pinterest URL', type: 'url', default: '' },
        { key: 'twitter_url', label: 'Twitter/X URL', type: 'url', default: '' },
      ],
    },
    {
      group: 'Email Notifications',
      settings: [
        { key: 'admin_notification_email', label: 'Admin Notification Email', type: 'email', default: 'admin@sawdustandcoffee.com' },
        { key: 'send_order_confirmations', label: 'Send Order Confirmations', type: 'checkbox', default: 'true' },
        { key: 'send_quote_notifications', label: 'Send Quote Notifications', type: 'checkbox', default: 'true' },
        { key: 'send_contact_notifications', label: 'Send Contact Notifications', type: 'checkbox', default: 'true' },
      ],
    },
    {
      group: 'SEO',
      settings: [
        { key: 'meta_description', label: 'Meta Description', type: 'textarea', default: 'Custom woodworking and artisan coffee table designs' },
        { key: 'meta_keywords', label: 'Meta Keywords', type: 'text', default: 'woodworking, custom furniture, live edge, epoxy' },
        { key: 'google_analytics_id', label: 'Google Analytics ID', type: 'text', default: '' },
      ],
    },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get<Setting[]>('/admin/content');
      const settingsMap: Record<string, Setting> = {};
      const formDataMap: Record<string, any> = {};

      response.data.forEach((setting) => {
        settingsMap[setting.key] = setting;
        formDataMap[setting.key] = setting.type === 'boolean'
          ? setting.value === 'true'
          : setting.value;
      });

      // Fill in defaults for missing settings
      settingsConfig.forEach((group) => {
        group.settings.forEach((s) => {
          if (!formDataMap.hasOwnProperty(s.key)) {
            formDataMap[s.key] = s.type === 'checkbox' ? s.default === 'true' : s.default;
          }
        });
      });

      setSettings(settingsMap);
      setFormData(formDataMap);
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Save each setting
      for (const group of settingsConfig) {
        for (const setting of group.settings) {
          const value = formData[setting.key];
          const existing = settings[setting.key];

          const payload = {
            key: setting.key,
            value: setting.type === 'checkbox' ? String(value) : value,
            type: setting.type === 'checkbox' ? 'boolean' : 'text',
            group: group.group.toLowerCase(),
          };

          if (existing) {
            await api.put(`/admin/content/${existing.id}`, payload);
          } else {
            await api.post('/admin/content', payload);
          }
        }
      }

      alert('Settings saved successfully!');
      fetchSettings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-600 mt-1">Configure your store settings</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {settingsConfig.map((group) => (
            <Card key={group.group}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{group.group}</h2>
              <div className="space-y-4">
                {group.settings.map((setting) => (
                  <div key={setting.key}>
                    {setting.type === 'textarea' ? (
                      <Textarea
                        label={setting.label}
                        value={formData[setting.key] || ''}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        rows={3}
                      />
                    ) : setting.type === 'checkbox' ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData[setting.key] || false}
                          onChange={(e) => handleChange(setting.key, e.target.checked)}
                          className="rounded text-coffee focus:ring-coffee"
                        />
                        <span className="text-sm font-medium text-gray-700">{setting.label}</span>
                      </label>
                    ) : (
                      <Input
                        label={setting.label}
                        type={setting.type}
                        value={formData[setting.key] || ''}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        step={setting.type === 'number' ? '0.01' : undefined}
                      />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button type="button" variant="secondary" onClick={fetchSettings}>
              Reset
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
