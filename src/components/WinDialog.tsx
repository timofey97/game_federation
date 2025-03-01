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
import { Dispatch, SetStateAction } from "react";

interface WinDialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  winner: string;
  onPlayAgain: () => void;
}

export function WinDialog({ open, onOpenChange, winner, onPlayAgain }: WinDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Zapri</AlertDialogCancel>
          <AlertDialogAction onClick={onPlayAgain}>Igraj Ponovno</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
