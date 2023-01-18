import { Menu } from "@headlessui/react";
import { Stage } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { EventWithChildren } from "../utils/common-types";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { BsCheck } from "react-icons/bs";

interface SelectStageMenuProps {
  eventList: EventWithChildren[];
  setSelectedStage: Dispatch<SetStateAction<Stage | null>>;
  selectedStage: Stage | null;
}

interface StageMenuProps {
  event: EventWithChildren;
  setMenuEventIdStack: Dispatch<SetStateAction<string[]>>;
  setSelectedStage: Dispatch<SetStateAction<Stage | null>>;
  selectedStage: Stage | null;
}

const StageMenu: React.FC<StageMenuProps> = ({
  event,
  setMenuEventIdStack,
  setSelectedStage,
  selectedStage,
}) => {
  const [swipeFrom, setSwipeFrom] = useState<"left" | "right">("left");

  return (
    <Menu>
      <Menu.Items
        as={motion.div}
        key={event.id}
        initial={{ opacity: 0, x: swipeFrom === "left" ? 100 : -100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: swipeFrom === "left" ? -100 : 100 }}
        transition={{
          ease: "easeInOut",
          duration: 0.5,
        }}
        className="flex w-full flex-col gap-1"
        static
      >
        {event.id !== "" && (
          <Menu.Item>
            {({ active }) => (
              <div
                onClick={() => {
                  setMenuEventIdStack((prev) => prev.slice(0, -1));
                  setSwipeFrom("right");
                }}
                className={`${
                  active ? "bg-primary" : ""
                } flex cursor-pointer items-center gap-2 rounded-md p-2`}
              >
                <HiChevronLeft className="text-xl" />
                Back
              </div>
            )}
          </Menu.Item>
        )}
        {event.childEvents ? (
          event.childEvents.map((childEvent) => {
            return (
              <Menu.Item key={childEvent.id}>
                {({ active }) => (
                  <div
                    onClick={() => {
                      setMenuEventIdStack((prev) => prev.concat(childEvent.id));
                      setSwipeFrom("left");
                    }}
                    className={`${
                      active ? "bg-primary" : ""
                    } flex cursor-pointer items-center justify-between rounded-md p-2`}
                  >
                    <p className="w-auto select-none truncate">
                      {childEvent.name}
                    </p>
                    <HiChevronRight className="text-xl" />
                  </div>
                )}
              </Menu.Item>
            );
          })
        ) : event.stages.length > 0 ? (
          event.stages.map((stage) => {
            return (
              <Menu.Item key={stage.id}>
                {({ active }) => (
                  <div
                    className={`${
                      selectedStage?.id === stage.id || active
                        ? "bg-primary"
                        : ""
                    } flex cursor-pointer items-center justify-between rounded-md p-2`}
                    onClick={() => {
                      setSelectedStage(selectedStage === stage ? null : stage);
                    }}
                  >
                    <p className="select-none truncate">
                      {stage.stageCode && (
                        <>
                          <b>{stage.stageCode}</b> -{" "}
                        </>
                      )}
                      {stage.stageName}
                    </p>
                    {selectedStage?.id === stage.id && (
                      <BsCheck className="text-2xl" />
                    )}
                  </div>
                )}
              </Menu.Item>
            );
          })
        ) : (
          <p className="p-2 text-slate-300">No stages</p>
        )}
      </Menu.Items>
    </Menu>
  );
};

const SelectStageMenu: React.FC<SelectStageMenuProps> = ({
  eventList,
  setSelectedStage,
  selectedStage,
}) => {
  const rootEvent = {
    id: "",
    name: "",
    startDate: null,
    endDate: null,
    description: null,
    parentEventId: null,
    childEvents: eventList,
    parentEvent: null,
    stages: [] as Stage[],
  };
  const [menuEventIdStack, setMenuEventIdStack] = useState<string[]>([]);
  const [currentSelectedEvent, setCurrentSelectedEvent] =
    useState<EventWithChildren>(rootEvent);

  useEffect(() => {
    if (menuEventIdStack.length === 0) {
      setCurrentSelectedEvent(rootEvent);
      return;
    }
    let currentEventId = menuEventIdStack[0];
    let currentEvent: EventWithChildren | undefined = rootEvent;
    for (let i = 0; i < menuEventIdStack.length; i++) {
      currentEventId = menuEventIdStack[i];
      currentEvent = currentEvent?.childEvents?.find(
        (event) => event.id === currentEventId
      );
    }
    currentEvent && setCurrentSelectedEvent(currentEvent);
  }, [menuEventIdStack]);

  return (
    <AnimatePresence>
      <div className="h-64 w-full overflow-y-scroll rounded-md bg-gray-300 p-2 overflow-x-hidden">
        <StageMenu
          event={currentSelectedEvent}
          setMenuEventIdStack={setMenuEventIdStack}
          setSelectedStage={setSelectedStage}
          selectedStage={selectedStage}
        />
      </div>
    </AnimatePresence>
  );
};

export default SelectStageMenu;
