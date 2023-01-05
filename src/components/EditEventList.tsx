import Button from "./Button";
import { EventWithChildren } from "../utils/common-types";
import { useState } from "react";
import React from "react";
import AddEventModal from "./AddEventModal";
import EventList from "./EventList";

interface EditEventListProps {
  eventList: EventWithChildren[];
  className?: string;
}

const EditEventList: React.FC<EditEventListProps> = ({
  eventList,
  className,
}) => {
  const [addEventModalState, setAddEventModalState] = useState({
    open: false,
    title: "",
    parentEventId: "",
  });

  return (
    <>
      <AddEventModal
        modalState={addEventModalState}
        setModalState={setAddEventModalState}
      />
      <EventList
        eventList={eventList}
        className={className}
        parentEvent={null}
        setModalState={setAddEventModalState}
      />
      <Button
        className="mt-2 w-full py-2"
        onClick={() => {
          setAddEventModalState({
            open: true,
            title: "Add a category under Root",
            parentEventId: "",
          });
        }}
      >
        Add a category under Root
      </Button>
    </>
  );
};

export default EditEventList;
