import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Button, Card, Spinner, Modal, Input } from '../../components/ui';
import AdminLayout from '../../layouts/AdminLayout';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  requires_data: boolean;
}

export default function EmailPreview() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewSubject, setPreviewSubject] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get<EmailTemplate[]>('/admin/email-templates');
      setTemplates(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (templateId: string) => {
    try {
      setLoadingPreview(true);
      setSelectedTemplate(templateId);
      const response = await api.get(`/admin/email-templates/${templateId}/preview`);
      setPreviewHtml(response.data.html);
      setPreviewSubject(response.data.subject);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to preview email');
      setSelectedTemplate(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTemplate) return;

    try {
      setSending(true);
      const response = await api.post(`/admin/email-templates/${selectedTemplate}/send-test`, {
        email: testEmail,
      });
      alert(response.data.message);
      setIsTestModalOpen(false);
      setTestEmail('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  const openTestModal = () => {
    setIsTestModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
            <p className="text-gray-600 mt-1">Preview and test email templates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template List */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Templates</h2>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="md" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">{error}</div>
              ) : (
                <div className="space-y-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handlePreview(template.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        selectedTemplate === template.id
                          ? 'border-coffee bg-coffee/5'
                          : 'border-gray-200 hover:border-coffee/50'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedTemplate ? 'Preview' : 'Select a template'}
                </h2>
                {selectedTemplate && (
                  <Button onClick={openTestModal}>Send Test Email</Button>
                )}
              </div>

              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Spinner size="lg" />
                  <p className="text-gray-600 mt-4">Loading preview...</p>
                </div>
              ) : selectedTemplate ? (
                <div className="space-y-4">
                  {/* Subject Line */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">Subject:</p>
                    <p className="text-gray-900">{previewSubject}</p>
                  </div>

                  {/* Email Preview */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                      <p className="text-sm text-gray-600">Email Body Preview:</p>
                    </div>
                    <div className="bg-white p-6 max-h-[600px] overflow-y-auto">
                      <iframe
                        srcDoc={previewHtml}
                        className="w-full min-h-[500px] border-0"
                        title="Email Preview"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <svg
                    className="w-16 h-16 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-lg">Select a template to preview</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Test Email Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Send Test Email"
        size="md"
      >
        <form onSubmit={handleSendTest} className="space-y-4">
          <p className="text-gray-600">
            Enter an email address to send a test version of this email template.
          </p>

          <Input
            label="Email Address"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            required
            placeholder="your@email.com"
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={sending}>
              {sending ? 'Sending...' : 'Send Test Email'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsTestModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
