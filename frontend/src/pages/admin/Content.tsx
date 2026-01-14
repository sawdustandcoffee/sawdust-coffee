import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { SiteContent, PaginatedResponse } from '../../types';
import { Button, Card, Badge, Spinner, Modal, Input, Textarea, Select } from '../../components/ui';
import AdminLayout from '../../layouts/AdminLayout';

export default function Content() {
  const [content, setContent] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<SiteContent | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    type: 'text' as 'text' | 'html' | 'json' | 'boolean' | 'integer' | 'float',
    group: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [selectedGroup]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      let url = '/admin/content?per_page=100&sort_by=group';
      if (selectedGroup !== 'all') {
        url += `&group=${selectedGroup}`;
      }
      const response = await api.get<PaginatedResponse<SiteContent>>(url);
      setContent(response.data.data || response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingContent(null);
    setFormData({
      key: '',
      value: '',
      type: 'text',
      group: '',
      description: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: SiteContent) => {
    setEditingContent(item);
    setFormData({
      key: item.key,
      value: item.value,
      type: item.type,
      group: item.group || '',
      description: item.description || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    try {
      setSaving(true);

      if (editingContent) {
        await api.put(`/admin/content/${editingContent.id}`, formData);
      } else {
        await api.post('/admin/content', formData);
      }

      setIsModalOpen(false);
      fetchContent();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Failed to save content');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: SiteContent) => {
    if (!confirm(`Are you sure you want to delete "${item.key}"?`)) return;

    try {
      await api.delete(`/admin/content/${item.id}`);
      fetchContent();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete content');
    }
  };

  const groups = ['all', ...Array.from(new Set(content.map((c) => c.group).filter(Boolean)))];

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
      text: 'default',
      html: 'info',
      json: 'success',
      boolean: 'warning',
      integer: 'info',
      float: 'info',
    };
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>;
  };

  const formatValue = (item: SiteContent) => {
    if (item.type === 'json') {
      try {
        return JSON.stringify(JSON.parse(item.value), null, 2);
      } catch {
        return item.value;
      }
    }
    return item.value;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Site Content</h1>
          <Button onClick={openCreateModal}>+ Add Content</Button>
        </div>

        <Card>
          <div className="mb-4 flex gap-2">
            {groups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group || 'all')}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedGroup === group
                    ? 'bg-coffee text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {group || 'all'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : content.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No content found. Click "Add Content" to create your first content item.
            </div>
          ) : (
            <div className="space-y-4">
              {content.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <code className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {item.key}
                        </code>
                        {getTypeBadge(item.type)}
                        {item.group && (
                          <Badge variant="info">{item.group}</Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditModal(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(item)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    {item.type === 'json' ? (
                      <pre className="text-xs text-gray-900 overflow-x-auto">
                        {formatValue(item)}
                      </pre>
                    ) : item.type === 'html' ? (
                      <div className="text-sm text-gray-900 max-h-32 overflow-y-auto">
                        <code>{item.value}</code>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {item.value.length > 200
                          ? item.value.substring(0, 200) + '...'
                          : item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContent ? 'Edit Content' : 'Add New Content'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Key"
            name="key"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            required
            disabled={!!editingContent}
            helperText="Unique identifier (e.g., hero_title, contact_email)"
            error={formErrors.key?.[0]}
          />

          <Select
            label="Type"
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as typeof formData.type,
              })
            }
            options={[
              { value: 'text', label: 'Text' },
              { value: 'html', label: 'HTML' },
              { value: 'json', label: 'JSON' },
              { value: 'boolean', label: 'Boolean' },
              { value: 'integer', label: 'Integer' },
              { value: 'float', label: 'Float' },
            ]}
          />

          {formData.type === 'text' || formData.type === 'html' ? (
            <Textarea
              label="Value"
              name="value"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              required
              rows={6}
              error={formErrors.value?.[0]}
            />
          ) : (
            <Input
              label="Value"
              name="value"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              required
              error={formErrors.value?.[0]}
            />
          )}

          <Input
            label="Group"
            name="group"
            value={formData.group}
            onChange={(e) => setFormData({ ...formData, group: e.target.value })}
            helperText="Organize content (e.g., home, about, contact)"
            error={formErrors.group?.[0]}
          />

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            helperText="What this content is used for"
            error={formErrors.description?.[0]}
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingContent ? 'Update Content' : 'Create Content'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
