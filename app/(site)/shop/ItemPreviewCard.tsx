import { ShopItem } from '@/types/ShopItem';

interface ItemPreviewProps {
  product: ShopItem;
  onClick?: () => void;
}

export default function ItemPreviewCard({ product, onClick }: ItemPreviewProps) {
  const averageRating = (product.review_score / product.total_reviews).toFixed(1);
  
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-green-600"
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={product.images?.[0] || '/placeholder.jpg'} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl font-bold text-green-600">
            ${product.price.toFixed(2)}
          </span>
          <div className="flex items-center">
            <span className="text-yellow-500 mr-1">★</span>
            <span className="text-sm text-gray-600">
              {averageRating}/5
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {product.total_reviews} reviews
        </p>
      </div>
    </button>
  );
}
