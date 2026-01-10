interface ProductBadgeProps {
  badge: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProductBadge({ badge, size = 'md' }: ProductBadgeProps) {
  const getBadgeStyle = (badgeType: string) => {
    const lowerBadge = badgeType.toLowerCase();

    const styles: Record<string, string> = {
      new: 'bg-blue-500 text-white',
      hot: 'bg-red-500 text-white',
      trending: 'bg-orange-500 text-white',
      'limited edition': 'bg-purple-500 text-white',
      limited: 'bg-purple-500 text-white',
      handcrafted: 'bg-wood-700 text-sawdust',
      custom: 'bg-coffee text-white',
      bestseller: 'bg-green-600 text-white',
      'best seller': 'bg-green-600 text-white',
      exclusive: 'bg-indigo-600 text-white',
      seasonal: 'bg-amber-600 text-white',
      featured: 'bg-coffee-dark text-sawdust',
    };

    return styles[lowerBadge] || 'bg-gray-600 text-white';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-4 py-1.5 text-sm';
      case 'md':
      default:
        return 'px-3 py-1 text-xs';
    }
  };

  return (
    <span
      className={`inline-block font-semibold rounded-full ${getBadgeStyle(
        badge
      )} ${getSizeClasses()}`}
    >
      {badge}
    </span>
  );
}
