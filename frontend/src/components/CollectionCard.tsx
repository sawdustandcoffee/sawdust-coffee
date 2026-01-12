import { Link } from 'react-router-dom';
import { Collection } from '../types';

interface CollectionCardProps {
  collection: Collection;
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  const imagePath = collection.image_path
    ? `${import.meta.env.VITE_API_URL}/storage/${collection.image_path}`
    : '/placeholder-collection.jpg';

  const getCollectionTypeLabel = (type: string) => {
    switch (type) {
      case 'auto_new':
        return 'New Arrivals';
      case 'auto_featured':
        return 'Featured';
      case 'auto_sale':
        return 'On Sale';
      default:
        return 'Collection';
    }
  };

  return (
    <Link
      to={`/collections/${collection.slug}`}
      className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300"
    >
      {/* Collection Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
        <img
          src={imagePath}
          alt={collection.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Collection Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {collection.type !== 'manual' && (
            <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase rounded-full mb-2">
              {getCollectionTypeLabel(collection.type)}
            </span>
          )}
          <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
            {collection.name}
          </h3>
          {collection.description && (
            <p className="text-sm text-white/90 line-clamp-2 drop-shadow">
              {collection.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm font-medium">
              {collection.product_count} {collection.product_count === 1 ? 'Product' : 'Products'}
            </span>
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
