// src/components/GenericModal.tsx
"use client";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

type AddEditModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: () => void;
  isSubmitting?: boolean;
};

export function AddEditModal({
  isOpen,
  onOpenChange,
  title,
  children,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onSubmit,
  isSubmitting = false,
}: AddEditModalProps) {
  return (
    <Modal size="xl" isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside" aria-labelledby={title} key={title}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {title}
            </ModalHeader>
            <ModalBody>
              {children}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                {cancelLabel}
              </Button>
              <Button
                color="primary"
                onPress={onSubmit}
                isLoading={isSubmitting}
              >
                {isSubmitting ? '' : submitLabel}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}