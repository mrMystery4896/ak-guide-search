import Button from "./Button";
import type { EventWithChildren } from "../utils/common-types";
import React from "react";
import AddEventModal from "./AddEventModal";
import EventList from "./EventList";
import { useModal } from "../stores/modalStore";

interface EditEventListProps {
  eventList: EventWithChildren[];
  className?: string;
}

const EditEventList: React.FC<EditEventListProps> = ({
  eventList,
  className,
}) => {
  const modal = useModal();

  return (
    <>
      <EventList eventList={eventList} className={className} />
      <Button
        className="-z-50 mt-2 w-full py-2"
        onClick={() => {
          modal.open({
            title: "Add a new category",
            children: <AddEventModal parentEventId="" />,
          });
        }}
      >
        Add a new category
      </Button>
    </>
  );
};

export default EditEventList;
