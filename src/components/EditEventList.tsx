import Button from "./Button";
import { EventWithChildren } from "../utils/common-types";
import { useState } from "react";
import React from "react";
import AddEventModal from "./AddEventModal";
import EventList from "./EventList";
import AddStageModal from "./AddStageModal";
import { boolean } from "zod";
import { Stage } from "@prisma/client";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";

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
  const [addStageModalState, setAddStageModalState] = useState<{
    open: boolean;
    event?: EventWithChildren;
  }>({
    open: false,
    event: undefined,
  });
  const [editModalState, setEditModalState] = useState<{
    open: boolean;
    event?: EventWithChildren;
    stage?: Stage;
  }>({
    open: false,
    event: undefined,
    stage: undefined,
  });
  const [deleteModalState, setDeleteModalState] = useState<{
    open: boolean;
    event?: EventWithChildren;
    stage?: Stage;
  }>({
    open: false,
    event: undefined,
    stage: undefined,
  });

  return (
    <>
      <AddEventModal
        modalState={addEventModalState}
        setModalState={setAddEventModalState}
      />
      <AddStageModal
        modalState={addStageModalState}
        setModalState={setAddStageModalState}
      />
      <EditModal
        modalState={editModalState}
        setModalState={setEditModalState}
      />
      <DeleteModal
        modalState={deleteModalState}
        setModalState={setDeleteModalState}
      />
      <EventList
        eventList={eventList}
        className={className}
        setAddEventModalState={setAddEventModalState}
        setAddStageModalState={setAddStageModalState}
        setEditModalState={setEditModalState}
        setDeleteModalState={setDeleteModalState}
      />
      <Button
        className="-z-50 mt-2 w-full py-2"
        onClick={() => {
          setAddEventModalState({
            open: true,
            title: "Add a new category",
            parentEventId: "",
          });
        }}
      >
        Add a new category
      </Button>
    </>
  );
};

export default EditEventList;
