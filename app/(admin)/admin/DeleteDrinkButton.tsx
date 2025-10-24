'use client';

import { Button } from '@/components/ui/button';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { deletePopularDrink } from '@/services/popularDrinks';

export default function DeleteDrinkButton({
  drinkId,
  onDeleted,
}: {
  drinkId: string;
  onDeleted: () => Promise<void> | void;
}) {
  async function handleDelete() {
    await deletePopularDrink(drinkId);
    await onDeleted();
  }

  return (
    <ConfirmationDialog
      title="Delete this drink?"
      trigger={
        <Button size="sm" variant="outline">
          Delete
        </Button>
      }
      onConfirm={handleDelete}
      confirmText="Delete"
      confirmVariant="destructive"
    />
  );
}
