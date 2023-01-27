import { Dialog } from "@headlessui/react";
import type { Stage } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import type { EventWithChildren } from "../utils/common-types";
import { trpc } from "../utils/trpc";
import Button from "./Button";
import Toast from "./Toast";

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
  const router = useRouter();

  const { isLoading: deletingStage, mutate: deleteStage } =
    trpc.stage.deleteStage.useMutation({
      onSuccess: () => {
        toast.custom((t) => (
          <Toast
            message="Stage deleted successfully"
            type="success"
            duration={t.duration}
            visible={t.visible}
          />
        ));
        setModalState({
          open: false,
          event: undefined,
          stage: undefined,
        });
        router.replace(router.asPath);
      },
      onError: (error) => {
        toast.custom((t) => (
          <Toast
            message={error.message}
            type="error"
            duration={t.duration}
            visible={t.visible}
          />
        ));
      },
    });

  const { isLoading: deletingEvent, mutate: deleteEvent } =
    trpc.event.deleteEvent.useMutation({
      onSuccess: () => {
        toast.custom((t) => (
          <Toast
            message="Event deleted successfully"
            type="success"
            duration={t.duration}
            visible={t.visible}
          />
        ));
        setModalState({
          open: false,
          event: undefined,
          stage: undefined,
        });
        router.replace(router.asPath);
      },
      onError: (error) => {
        toast.custom((t) => (
          <Toast
            message={error.message}
            type="error"
            duration={t.duration}
            visible={t.visible}
          />
        ));
      },
    });

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
                Are you sure you want to delete{" "}
                {(modalState.stage?.stageCode || modalState.stage?.stageName) ??
                  modalState.event.name}
                ?
                <Button
                  onClick={() => {
                    if (modalState.stage !== undefined) {
                      deleteStage(modalState.stage.id);
                    } else if (modalState.event !== undefined) {
                      //flatten the event object
                      const events: EventWithChildren[] = [];
                      const flattenEvents = (event: EventWithChildren) => {
                        events.push(event);
                        if (event.childEvents)
                          event.childEvents.forEach((child) =>
                            flattenEvents(child)
                          );
                      };
                      if (modalState.event) flattenEvents(modalState.event);
                      deleteEvent(events.map((e) => e.id));
                    }
                  }}
                  isLoading={deletingStage || deletingEvent}
                  className="ml-auto mt-2 bg-red disabled:bg-red/50"
                >
                  Delete
                </Button>
              </Dialog.Panel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default DeleteModal;
