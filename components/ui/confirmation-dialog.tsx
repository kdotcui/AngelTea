import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ConfirmationDialogProps {
  title: string;
  trigger: ReactNode;
  onConfirm: () => Promise<void>;
  confirmText?: string;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  cancelText?: string;
  description?: ReactNode;
}

export default function ConfirmationDialog({
  title,
  trigger,
  onConfirm,
  confirmText = 'Confirm',
  confirmVariant = 'destructive',
  cancelText = 'Cancel',
  description,
}: ConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {description && <div className="py-2">{description}</div>}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Processing…' : confirmText}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
            {cancelText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
