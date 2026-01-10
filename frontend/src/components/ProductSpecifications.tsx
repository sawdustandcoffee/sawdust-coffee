import { useState } from 'react';

interface ProductSpecificationsProps {
  specifications?: Record<string, string>;
  careInstructions?: string;
}

export default function ProductSpecifications({
  specifications,
  careInstructions,
}: ProductSpecificationsProps) {
  const [activeTab, setActiveTab] = useState<'specs' | 'care'>('specs');

  // Don't render if no data
  if ((!specifications || Object.keys(specifications).length === 0) && !careInstructions) {
    return null;
  }

  const hasSpecs = specifications && Object.keys(specifications).length > 0;
  const hasCare = !!careInstructions;

  // If only one section has data, show it directly without tabs
  if (hasSpecs && !hasCare) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-coffee-dark mb-6">
          Product Specifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(specifications).map(([key, value]) => (
            <div key={key} className="border-b pb-3">
              <dt className="text-sm font-semibold text-gray-700 mb-1">
                {formatLabel(key)}
              </dt>
              <dd className="text-gray-900">{value}</dd>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hasSpecs && hasCare) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-coffee-dark mb-6">
          Care Instructions
        </h2>
        <div className="prose prose-coffee max-w-none">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800 whitespace-pre-wrap">
                {careInstructions}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Both sections have data - show tabs
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-4 px-1 border-b-2 font-semibold transition ${
              activeTab === 'specs'
                ? 'border-coffee text-coffee'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`pb-4 px-1 border-b-2 font-semibold transition ${
              activeTab === 'care'
                ? 'border-coffee text-coffee'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Care Instructions
          </button>
        </div>
      </div>

      {/* Specifications Tab */}
      {activeTab === 'specs' && hasSpecs && (
        <div>
          <h2 className="text-2xl font-bold text-coffee-dark mb-6">
            Product Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(specifications).map(([key, value]) => (
              <div key={key} className="border-b pb-3">
                <dt className="text-sm font-semibold text-gray-700 mb-1">
                  {formatLabel(key)}
                </dt>
                <dd className="text-gray-900">{value}</dd>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Care Instructions Tab */}
      {activeTab === 'care' && hasCare && (
        <div>
          <h2 className="text-2xl font-bold text-coffee-dark mb-6">
            Care Instructions
          </h2>
          <div className="prose prose-coffee max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800 whitespace-pre-wrap">
                  {careInstructions}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to format specification labels
function formatLabel(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
