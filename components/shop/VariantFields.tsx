import { ProductVariant } from '@/types/shop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'ONE SIZE'] as const;

interface VariantFieldsProps {
  variants: ProductVariant[];
  onAddVariant: () => void;
  onRemoveVariant: (index: number) => void;
  onUpdateVariant: (index: number, field: keyof ProductVariant, value: string | number) => void;
  onUpdateVariantPrice: (index: number, value: string) => void;
}

export default function VariantFields({
  variants,
  onAddVariant,
  onRemoveVariant,
  onUpdateVariant,
  onUpdateVariantPrice,
}: VariantFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Product Variants</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAddVariant}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Variant
        </Button>
      </div>
      
      {variants.map((variant, idx) => (
        <div key={idx} className="p-3 border rounded-md space-y-2 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Variant {idx + 1}</span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onRemoveVariant(idx)}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Auto-generated SKU</Label>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                {variant.sku || 'Enter size/color'}
              </span>
            </div>
            <div>
              <Label className="text-xs">Stock *</Label>
              <Input
                type="number"
                min="0"
                value={variant.stock}
                onChange={(e) => onUpdateVariant(idx, 'stock', Number(e.target.value))}
                placeholder="0"
                className="h-8 text-sm"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Size</Label>
              <select
                value={variant.size || ''}
                onChange={(e) => onUpdateVariant(idx, 'size', e.target.value)}
                className="h-8 text-sm w-full rounded-md border border-input bg-background px-3 py-1"
              >
                <option value="">Select size</option>
                {STANDARD_SIZES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Color</Label>
              <Input
                value={variant.color || ''}
                onChange={(e) => onUpdateVariant(idx, 'color', e.target.value)}
                placeholder="e.g., Blue"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Variant Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={variant.price || ''}
                onChange={(e) => onUpdateVariantPrice(idx, e.target.value)}
                placeholder="Optional"
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>
      ))}
      
      {variants.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No variants added yet. Click &quot;Add Variant&quot; to create one.
        </p>
      )}
    </div>
  );
}
