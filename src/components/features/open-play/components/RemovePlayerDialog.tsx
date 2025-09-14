import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import type { Participant } from "../types";

interface RemovePlayerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  participant: Participant | null;
  team: 'A' | 'B' | null;
  isLoading?: boolean;
}

const RemovePlayerDialog: React.FC<RemovePlayerDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  participant,
  team,
  isLoading = false
}) => {
  if (!participant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <DialogTitle>Remove Player from Match</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-semibold">
              {participant.user?.personalInfo?.firstName} {participant.user?.personalInfo?.lastName}
            </span>{" "}
            from Team {team}?
            <br />
            <span className="text-red-600 text-sm">
              This action cannot be undone and the player will be moved back to the ready list.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Removing..." : "Remove Player"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemovePlayerDialog;
