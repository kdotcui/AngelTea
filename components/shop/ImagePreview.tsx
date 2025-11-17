import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ImagePreviewProps {
  images: Array<{ url: string; type: 'existing' | 'new' }>;
  onRemove: (index: number, type: 'existing' | 'new') => void;
  title?: string;
}

export default function ImagePreview({ images, onRemove, title }: ImagePreviewProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-2">
      {title && <Label>{title}</Label>}
      <div className="flex flex-wrap gap-2">
        {images.map((image, idx) => (
          <div key={`${image.type}-${idx}`} className="relative">
            <div className="relative h-24 w-24 overflow-hidden rounded-md border">
              <Image
                src={image.url}
                alt={`${title || 'Image'} ${idx + 1}`}
                fill
                className="object-cover"
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
              onClick={() => onRemove(idx, image.type)}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
