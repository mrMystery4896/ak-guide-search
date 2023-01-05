import { Disclosure } from "@headlessui/react";
import { Variants, motion, AnimatePresence } from "framer-motion";
import React from "react";
import { Dispatch, SetStateAction } from "react";
import { FaChevronDown } from "react-icons/fa";
import { EventWithChildren } from "../utils/common-types";
import Button from "./Button";

interface EventListProps {
  eventList: EventWithChildren[];
  className?: string;
  parentEvent: EventWithChildren | null;
  setModalState: Dispatch<
    SetStateAction<{
      open: boolean;
      title: string;
      parentEventId: string;
    }>
  >;
}

const chevronVariants: Variants = {
  up: {
    rotate: 180,
  },
  down: {
    rotate: 0,
  },
};

const EventList: React.FC<EventListProps> = ({
  eventList,
  className,
  parentEvent,
  setModalState,
}) => {
  return (
    <div className="flex flex-col">
      {parentEvent?.stages && (
        <Button
          className="mt-2 w-full py-2"
          onClick={() => {
            setModalState({
              open: true,
              title: `Add a category under ${parentEvent?.name || "Root"}`,
              parentEventId: parentEvent?.id || "",
            });
          }}
        >
          Add a category under {parentEvent?.name}
        </Button>
      )}
      {eventList.map((event) => {
        return (
          <React.Fragment key={event.id}>
            <Disclosure>
              {({ open }) => {
                return (
                  <>
                    <Disclosure.Button className="relative mt-2 rounded-md bg-gray-300">
                      <p className="truncate p-2 px-6 font-bold">
                        {event.name}
                      </p>
                      <motion.div
                        className="absolute right-2 top-0 flex h-full items-center justify-center"
                        variants={chevronVariants}
                        animate={open ? "up" : "down"}
                      >
                        <FaChevronDown />
                      </motion.div>
                    </Disclosure.Button>
                    <AnimatePresence>
                      {open && (
                        <Disclosure.Panel
                          className={className + " mr-8 overflow-hidden"}
                          as={motion.div}
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          static
                        >
                          <EventList
                            eventList={event.childEvents || []}
                            parentEvent={event}
                            setModalState={setModalState}
                          />
                          {event.stages && !event.childEvents && (
                            <>
                              {event.stages.map((stage) => (
                                <div
                                  key={stage.stageCode}
                                  className="mt-2 rounded-md bg-gray-300 p-2 text-center font-bold"
                                >
                                  {stage.stageCode}
                                </div>
                              ))}
                              <Button className="mt-2 w-full py-2">
                                Add Stage in {event.name}
                              </Button>
                            </>
                          )}
                        </Disclosure.Panel>
                      )}
                    </AnimatePresence>
                  </>
                );
              }}
            </Disclosure>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default EventList;
