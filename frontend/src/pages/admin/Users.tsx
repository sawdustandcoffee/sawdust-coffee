import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { PaginatedResponse } from '../../types';
import { Button, Card, Badge, Spinner, Modal, Input } from '../../components/ui';
import AdminLayout from '../../layouts/AdminLayout';
import { useAuth } from '../../context/AuthContext';

interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    is_admin: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
        sort_by: 'created_at',
        sort_dir: 'desc',
      });

      if (search) params.append('search', search);

      const response = await api.get<PaginatedResponse<User>>(
        `/admin/users?${params}`
      );
      setUsers(response.data.data);
      setTotalPages(response.data.last_page);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      is_admin: false,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't populate password
      is_admin: user.is_admin,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    try {
      setSaving(true);
      const payload: any = {
        name: formData.name,
        email: formData.email,
        is_admin: formData.is_admin,
      };

      // Only include password if it's set
      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, payload);
      } else {
        await api.post('/admin/users', payload);
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Failed to save user');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.name}"?`)) return;

    try {
      await api.delete(`/admin/users/${user.id}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <Button onClick={openCreateModal}>+ Add User</Button>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
          />
        </div>

        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No users found. Click "Add User" to create your first user.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Created
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{user.name}</span>
                            {user.id === currentUser?.id && (
                              <Badge variant="info">You</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          {user.is_admin ? (
                            <Badge variant="success">Admin</Badge>
                          ) : (
                            <Badge variant="default">User</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openEditModal(user)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(user)}
                              disabled={user.id === currentUser?.id}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="secondary"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            error={formErrors.name?.[0]}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            error={formErrors.email?.[0]}
          />

          <Input
            label={editingUser ? 'Password (leave blank to keep current)' : 'Password'}
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editingUser}
            helperText={editingUser ? 'Only enter a password if you want to change it' : 'Minimum 8 characters'}
            error={formErrors.password?.[0]}
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_admin}
              onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
              className="rounded text-coffee focus:ring-coffee"
            />
            <span className="text-sm font-medium text-gray-700">Administrator</span>
            <span className="text-xs text-gray-500">(Can access admin panel)</span>
          </label>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
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
