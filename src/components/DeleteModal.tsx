import { Dialog } from "@headlessui/react";
import { Stage } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { EventWithChildren } from "../utils/common-types";
import Button from "./Button";
import Input from "./Input";

interface DeleteModalProps {
  modalState: {
    open: boolean;
    event?: EventWithChildren;
    stage?: Stage;
  };
  setModalState: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      event?: EventWithChildren;
      stage?: Stage;
    }>
  >;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  modalState,
  setModalState,
}) => {
  return (
    <>
      <AnimatePresence>
        {modalState.open && modalState.event && (
          <Dialog
            open={modalState.open}
            onClose={() => {
              setModalState({
                open: false,
                event: undefined,
                stage: undefined,
              });
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
                <Dialog.Title className="mb-4 text-xl font-bold">
                  Delete {modalState.stage?.stageCode ?? modalState.event.name}
                </Dialog.Title>
              </Dialog.Panel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default DeleteModal;
