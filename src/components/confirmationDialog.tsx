import React from 'react';
import { useDisclosure } from '@chakra-ui/react';
import { DialogActionTrigger, DialogBackdrop, DialogBody, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogRoot } from './ui/dialog';
import { Button } from './ui/button';
type VariantType = 'destructive' | 'success' | 'default';
interface TriggerElement extends React.HTMLAttributes<HTMLElement> {
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}
interface ConfirmationDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: VariantType;
  trigger?: React.ReactElement<TriggerElement>;
}
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen: externalIsOpen, onClose: externalOnClose, onConfirm = () => {}, title = 'Confirm Action', description = 'Are you sure? This action cannot be undone.', confirmText = 'Confirm', cancelText = 'Cancel', variant = 'destructive', trigger = null }) => {
  const { open: internalIsOpen, onOpen: internalOnOpen, onClose: internalOnClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  // Determine if we're using controlled or uncontrolled state
  const open = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onClose = externalOnClose || internalOnClose;
  const onOpen = internalOnOpen;
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  // Map variant to Chakra UI color scheme
  const getColorScheme = () => {
    switch (variant) {
      case 'destructive':
        return 'red';
      case 'success':
        return 'primary';
      default:
        return 'primary';
    }
  };
  const dialogContent = (
    <DialogRoot motionPreset="slide-in-bottom" role="alertdialog" open={open} closeOnEscape placement="center" preventScroll onOpenChange={onClose}>
      <DialogBackdrop />
      <DialogContent bg="white">
        <DialogHeader fontSize="lg" fontWeight="bold">
          {title}
        </DialogHeader>
        <DialogBody>{description}</DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button ref={cancelRef} onClick={onClose} fontWeight={'normal'} fontSize="sm">
              {cancelText}
            </Button>
          </DialogActionTrigger>
          <Button visual={getColorScheme()} onClick={handleConfirm} fontWeight={'normal'} fontSize="sm">
            {confirmText}
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
  if (trigger) {
    return (
      <>
        {React.cloneElement<TriggerElement>(trigger, {
          onClick: (event) => {
            trigger.props.onClick?.(event);
            onOpen();
          },
        })}
        {dialogContent}
      </>
    );
  }
  return dialogContent;
};
