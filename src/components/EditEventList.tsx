import Button from "./Button";
import { EventWithChildren } from "../utils/common-types";
import { Disclosure } from "@headlessui/react";
import { FaChevronDown } from "react-icons/fa";
import { AnimatePresence, motion, Variants } from "framer-motion";

interface EditEventListProps {
  eventList: EventWithChildren[];
  className?: string;
  parentEventName?: string;
}

const chevronVariants: Variants = {
  up: {
    rotate: 180,
  },
  down: {
    rotate: 0,
  },
};

const EditEventList: React.FC<EditEventListProps> = ({
  eventList,
  className,
  parentEventName,
}) => {
  return (
    <div className="flex flex-col">
      {eventList.map((event) => {
        return (
          <Disclosure key={event.id}>
            {({ open }) => {
              return (
                <>
                  <Disclosure.Button className="relative mt-2 rounded-md bg-gray-300">
                    <p className="p-2 font-bold">{event.name}</p>
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
                        className={className + "mx-4 overflow-hidden md:mx-8"}
                        as={motion.div}
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        static
                      >
                        {event.childEvents?.length ? (
                          <EditEventList
                            eventList={event.childEvents}
                            parentEventName={event.name}
                          />
                        ) : (
                          <>
                            <>
                              {event.stages.map((stage) => (
                                <div
                                  key={stage.stageCode}
                                  className="mt-2 rounded-md bg-gray-300 p-2 text-center font-bold"
                                >
                                  {stage.stageCode}
                                </div>
                              ))}
                              <Button className="mt-2 w-full">
                                Add Stage in {event.name}
                              </Button>
                            </>
                          </>
                        )}
                      </Disclosure.Panel>
                    )}
                  </AnimatePresence>
                </>
              );
            }}
          </Disclosure>
        );
      })}
      <Button
        className="mt-2 w-full"
        onClick={() => console.log(eventList[0]?.parentEventId)}
      >
        Add a category under {parentEventName}
      </Button>
    </div>
  );
};

export default EditEventList;
