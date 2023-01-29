import type { Stage } from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useModal } from "../stores/modalStore";
import type { EventWithChildren } from "../utils/common-types";
import { trpc } from "../utils/trpc";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";
import SelectStageMenu from "./SelectStageMenu";
import Toast from "./Toast";

interface MoveModalProps {
  event: EventWithChildren;
  stage?: Stage;
  eventIdStack: string[];
}

const MoveModal: React.FC<MoveModalProps> = ({
  event,
  stage,
  eventIdStack,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<EventWithChildren | null>(
    null
  );
  const [error, setError] = useState<string>("");
  const modal = useModal();

  const {
    status,
    data: eventList,
    refetch: refetchEventList,
  } = trpc.event.getEventList.useQuery();
  const router = useRouter();

  const { isLoading: moveEventIsLoading, mutate: moveEvent } =
    trpc.event.moveEvent.useMutation({
      onSuccess: () => {
        modal.close();
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
        modal.close();
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
    if (stage !== undefined) {
      if (stage.eventId === selectedEvent?.id) {
        setError(
          `${stage.stageCode || stage.stageName} is already in ${
            selectedEvent?.name || "root"
          }`
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
        event?.parentEventId === selectedEvent?.id ||
        (event?.parentEventId === null && selectedEvent?.id === "") // case for root
      ) {
        setError(
          `${event?.name || "Root"} is already in ${
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
      if (event?.id === selectedEvent.id) {
        setError("Cannot move category to itself");
        return;
      }
    }
  }, [selectedEvent, event, stage]);

  return (
    <>
      {status === "success" ? (
        <>
          <p className={`mb-2 ${error ? "text-red" : "text-white"}`}>
            {error || "Move to " + (selectedEvent?.name || "root")}
          </p>
          <SelectStageMenu
            eventList={eventList}
            onChange={(e) => setSelectedEvent(e)}
            initialEventStack={
              stage !== undefined ? [...eventIdStack, event.id] : eventIdStack
            }
          />
          <Button
            onClick={() => {
              if (stage !== undefined) {
                moveStage({
                  stageId: stage.id,
                  parentEventId: selectedEvent?.id ?? null,
                });
              } else if (event !== undefined) {
                moveEvent({
                  id: event.id,
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
    </>
  );
};

export default MoveModal;
