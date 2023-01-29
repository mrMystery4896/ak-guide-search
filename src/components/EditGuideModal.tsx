import { Dialog } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import type { GuideWithDetails } from "../utils/common-types";

interface EditGuideModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  guide: GuideWithDetails;
}

const EditGuideModal: React.FC<EditGuideModalProps> = ({
  isOpen,
  setIsOpen,
  guide,
}) => {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <Dialog
            open={isOpen}
            onClose={() => {
              setIsOpen(false);
            }}
            static
          >
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50"
            />
            <div className="absolute inset-0 flex min-h-screen items-center justify-center">
              <Dialog.Panel
                as={motion.div}
                key="modal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                layout
                className="m-auto max-h-[80%] w-96 max-w-[80%] overflow-y-scroll rounded-md bg-gray-400 p-4 md:rounded-lg"
              >
                <Dialog.Title className="mb-4 truncate text-xl font-bold">
                  Edit {guide.title}
                </Dialog.Title>
                Content
              </Dialog.Panel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default EditGuideModal;
