"use client";

import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

interface WinDialogProps {
  isOpen: boolean;
  winner: string;
  onClose: () => void;
  onReset: () => void;
}

export function WinDialog({ isOpen, winner, onClose, onReset }: WinDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onReset()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Čestitamo!</AlertDialogTitle>
          <AlertDialogDescription className="text-xl text-center py-4 ">
            <span className="text-danger">
              {winner}
            </span> je zmagal igro!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Zapri</AlertDialogCancel>
          <AlertDialogAction onClick={onReset}>Igraj Ponovno</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
