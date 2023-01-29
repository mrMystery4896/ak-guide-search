import type { Stage } from "@prisma/client";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useModal } from "../stores/modalStore";
import type { EventWithChildren } from "../utils/common-types";
import { trpc } from "../utils/trpc";
import Button from "./Button";
import Toast from "./Toast";

interface DeleteModalProps {
  event: EventWithChildren;
  stage?: Stage;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ event, stage }) => {
  const router = useRouter();
  const modal = useModal();

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
        modal.close();
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
        modal.close();
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
      <p>
        Are you sure you want to delete{" "}
        {(stage?.stageCode ? (
          <>
            <b>{stage.stageCode}</b> - {stage.stageName}
          </>
        ) : (
          stage?.stageName
        )) ?? event.name}
        ?
      </p>
      <div className="mt-2 flex w-full justify-end gap-4">
        <button
          className="font-bold text-primary focus:outline-none"
          onClick={() => modal.close()}
        >
          Cancel
        </button>
        <Button
          onClick={() => {
            if (stage !== undefined) {
              deleteStage(stage.id);
            } else if (event !== undefined) {
              //flatten the event object
              const events: EventWithChildren[] = [];
              const flattenEvents = (event: EventWithChildren) => {
                events.push(event);
                if (event.childEvents)
                  event.childEvents.forEach((child) => flattenEvents(child));
              };
              if (event) flattenEvents(event);
              deleteEvent(events.map((e) => e.id));
            }
          }}
          isLoading={deletingStage || deletingEvent}
          className="bg-red disabled:bg-red/50"
        >
          Delete
        </Button>
      </div>
    </>
  );
};

export default DeleteModal;
