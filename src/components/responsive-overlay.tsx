import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type ResponsiveOverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footer?: React.ReactNode;
  modal?: boolean;
  ariaLabel?: string;
};

export const ResponsiveOverlay: React.FC<ResponsiveOverlayProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  footer,
  modal = true,
  ariaLabel,
}) => {
  const isMobile = useIsMobile();

  // Desktop: Radix Dialog centered modal
  if (!isMobile) {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange} modal={modal}>
        <Dialog.Portal>
          <Dialog.Overlay
            className={cn(
              "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            )}
          />
          <Dialog.Content
            aria-label={ariaLabel}
            className={cn(
              "fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background shadow-lg outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
              className,
            )}
          >
            <div className={cn("flex items-start justify-between gap-3 border-b p-4", headerClassName)}>
              <div className="min-w-0">
                {title && (
                  <Dialog.Title className="text-base font-semibold text-foreground line-clamp-1">{title}</Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="mt-1 text-sm text-muted-foreground">{description}</Dialog.Description>
                )}
              </div>
              <Dialog.Close className="ring-offset-background focus:ring-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-offset-2">
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>
            <div className={cn("max-h-[70vh] overflow-y-auto p-4", contentClassName)}>{children}</div>
            {footer && <div className="border-t p-4">{footer}</div>}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  // Mobile: bottom sheet (simple accessible drawer)
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal={modal}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content
          aria-label={ariaLabel}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col rounded-t-lg border bg-background shadow-lg outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
            className,
          )}
        >
          <div className={cn("relative flex items-start justify-between gap-3 p-4", headerClassName)}>
            <div className="mx-auto h-1.5 w-10 shrink-0 rounded-full bg-muted" aria-hidden />
            <Dialog.Close className="ring-offset-background focus:ring-ring absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-offset-2">
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>
          {(title || description) && (
            <div className="px-4 pb-2">
              {title && (
                <Dialog.Title className="text-base font-semibold text-foreground">{title}</Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="mt-1 text-sm text-muted-foreground">{description}</Dialog.Description>
              )}
            </div>
          )}
          <div className={cn("min-h-0 flex-1 overflow-y-auto px-4 pb-4", contentClassName)}>{children}</div>
          {footer && <div className="border-t p-4">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ResponsiveOverlay;

