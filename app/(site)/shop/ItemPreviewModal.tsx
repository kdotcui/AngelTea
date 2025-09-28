"use client";
import { ShopItem } from './types';

interface ItemPreviewModalProps {
  item: ShopItem;
  onClose: () => void;
}

export default function ItemPreviewModal({ item, onClose }: ItemPreviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-3xl bg-white rounded-xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="h-64 md:h-full bg-gray-100">
            <img
              src={item.images?.[0] || '/placeholder.jpg'}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{item.name}</h2>
                {item.description && (
                  <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                )}
              </div>
              <button
                type="button"
                className="ml-4 text-gray-500 hover:text-gray-700"
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-green-600">${item.price.toFixed(2)}</span>
              <div className="text-sm text-gray-600">
                <span className="text-yellow-500 mr-1">★</span>
                {(item.review_score / item.total_reviews).toFixed(1)}/5
              </div>
            </div>

            <div className="text-xs text-gray-500">
              {item.purchases} purchases · {item.total_reviews} reviews
            </div>

            <div className="pt-2 text-right">
              <span className="inline-block text-sm text-gray-700">
                In stock: {item.quantity}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


