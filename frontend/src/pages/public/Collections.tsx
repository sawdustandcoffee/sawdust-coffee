import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { Collection } from '../../types';
import { Spinner } from '../../components/ui';
import PublicLayout from '../../layouts/PublicLayout';
import CollectionCard from '../../components/CollectionCard';
import Breadcrumb from '../../components/Breadcrumb';
import SEO from '../../components/SEO';

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/public/collections');
      setCollections(response.data);
    } catch (err) {
      console.error('Failed to load collections', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <SEO
        title="Collections"
        description="Browse our curated collections of handcrafted woodworking products from Sawdust & Coffee"
      />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Shop', path: '/shop' }, { label: 'Collections' }]} />

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-coffee-dark mb-2">Collections</h1>
            <p className="text-lg text-gray-600">
              Explore our curated collections of handcrafted pieces
            </p>
          </div>

          {/* Collections Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">
                No collections available. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
