import { Dialog } from "@headlessui/react";
import { Stage } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { EventWithChildren } from "../utils/common-types";
import { trpc } from "../utils/trpc";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";
import SelectStageMenu from "./SelectStageMenu";
import Toast from "./Toast";

interface MoveModalProps {
  modalState: {
    open: boolean;
    event?: EventWithChildren;
    stage?: Stage;
    eventIdStack: string[];
  };
  setModalState: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      event?: EventWithChildren;
      stage?: Stage;
      eventIdStack: string[];
    }>
  >;
}

const MoveModal: React.FC<MoveModalProps> = ({ modalState, setModalState }) => {
  const [selectedEvent, setSelectedEvent] = useState<EventWithChildren | null>(
    null
  );
  const [error, setError] = useState<string>("");

  const {
    status,
    data: eventList,
    refetch: refetchEventList,
  } = trpc.event.getEventList.useQuery();
  const router = useRouter();

  const { isLoading: moveEventIsLoading, mutate: moveEvent } =
    trpc.event.moveEvent.useMutation({
      onSuccess: () => {
        setModalState({
          open: false,
          event: undefined,
          stage: undefined,
          eventIdStack: [],
        });
        toast.custom((t) => (
          <Toast
            type="success"
            message="Event moved successfully"
            visible={t.visible}
            duration={t.duration}
          />
        ));
        refetchEventList();
        router.replace(router.asPath);
      },
      onError: (error) => {
        toast.custom((t) => (
          <Toast
            type="error"
            message={error.message}
            visible={t.visible}
            duration={t.duration}
          />
        ));
      },
    });

  const { isLoading: moveStageIsLoading, mutate: moveStage } =
    trpc.stage.moveStage.useMutation({
      onSuccess: () => {
        setModalState({
          open: false,
          event: undefined,
          stage: undefined,
          eventIdStack: [],
        });
        toast.custom((t) => (
          <Toast
            type="success"
            message="Stage moved successfully"
            visible={t.visible}
            duration={t.duration}
          />
        ));
        refetchEventList();
        router.replace(router.asPath);
      },
      onError: (error) => {
        toast.custom((t) => (
          <Toast
            type="error"
            message={error.message}
            visible={t.visible}
            duration={t.duration}
          />
        ));
      },
    });

  useEffect(() => {
    setError("");
    // move stage
    if (modalState.stage !== undefined) {
      if (modalState.stage.eventId === selectedEvent?.id) {
        setError(
          `${
            modalState.stage.stageCode || modalState.stage.stageName
          } is already in ${selectedEvent?.name || "root"}`
        );
        return;
      }
      // if the destination event has child event, then the stage can't be moved
      if (selectedEvent?.childEvents) {
        setError(`${selectedEvent.name || "Root"} already has child category`);
        return;
      }
    } else {
      if (
        modalState.event?.parentEventId === selectedEvent?.id ||
        (modalState.event?.parentEventId === null && selectedEvent?.id === "") // case for root
      ) {
        setError(
          `${modalState.event?.name || "Root"} is already in ${
            selectedEvent?.name || "root"
          }`
        );
        return;
      }
      // move event
      // if the destination event has stage, then the event can't be moved
      if (selectedEvent?.stages?.length !== 0) {
        setError(`${selectedEvent?.name || "Root"} already has stage`);
        return;
      }
      if (modalState.event?.id === selectedEvent.id) {
        setError("Cannot move category to itself");
        return;
      }
    }
  }, [selectedEvent]);

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
                eventIdStack: [],
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
                  Move {modalState.stage?.stageCode ?? modalState.event.name}
                </Dialog.Title>
                {status === "success" ? (
                  <>
                    <p className={`mb-2 ${error ? "text-red" : "text-white"}`}>
                      {error || "Move to " + (selectedEvent?.name || "root")}
                    </p>
                    <SelectStageMenu
                      eventList={eventList}
                      onChange={(e) => setSelectedEvent(e)}
                      initialEventStack={
                        modalState.stage !== undefined
                          ? [...modalState.eventIdStack, modalState.event.id]
                          : modalState.eventIdStack
                      }
                    />
                    <Button
                      onClick={() => {
                        if (modalState.stage !== undefined) {
                          moveStage({
                            stageId: modalState.stage.id,
                            parentEventId: selectedEvent?.id ?? null,
                          });
                        } else if (modalState.event !== undefined) {
                          moveEvent({
                            id: modalState.event.id,
                            parentEventId: selectedEvent?.id || null,
                          });
                        }
                      }}
                      isLoading={moveStageIsLoading || moveEventIsLoading}
                      disabled={error !== ""}
                      className="ml-auto mt-4"
                    >
                      Move Here
                    </Button>
                  </>
                ) : (
                  <LoadingSpinner />
                )}
              </Dialog.Panel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default MoveModal;
