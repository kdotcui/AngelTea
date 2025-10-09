/**
 * Generate a SKU (Stock Keeping Unit) from product name, size, and color
 * @param productName - The name of the product
 * @param size - Optional size variant (e.g., "M", "L", "XL")
 * @param color - Optional color variant (e.g., "Blue", "Red")
 * @returns A sanitized SKU string in the format: PRODUCTNAME-COLOR-SIZE
 */
export function generateSKU(productName: string, size?: string, color?: string): string {
  // Remove all non-alphanumeric characters and convert to uppercase
  const sanitizedName = productName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  
  const parts = [sanitizedName];
  
  // Add color if present (remove spaces and special chars)
  if (color) {
    const sanitizedColor = color.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (sanitizedColor) parts.push(sanitizedColor);
  }
  
  // Add size if present
  if (size) {
    const sanitizedSize = size.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (sanitizedSize) parts.push(sanitizedSize);
  }
  
  return parts.join('-');
}

