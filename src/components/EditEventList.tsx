import Button from "./Button";
import { EventWithChildren } from "../utils/common-types";
import { Dialog, Disclosure } from "@headlessui/react";
import { FaChevronDown } from "react-icons/fa";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import Input from "./Input";

type EventListProps = EditEventListProps & {
  parentEvent: {
    name: string;
    id: string;
  } | null;
  setModalState: Dispatch<
    SetStateAction<{
      open: boolean;
      title: string;
      parentEventId: string;
    }>
  >;
};
interface EditEventListProps {
  eventList: EventWithChildren[];
  className?: string;
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
      {eventList.map((event) => {
        return (
          <>
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
                            <EventList
                              eventList={event.childEvents}
                              parentEvent={{
                                // pass this event as parent event to the child
                                name: event.name,
                                id: event.id,
                              }}
                              setModalState={setModalState}
                            />
                          ) : (
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
                          )}
                        </Disclosure.Panel>
                      )}
                    </AnimatePresence>
                  </>
                );
              }}
            </Disclosure>
          </>
        );
      })}
      <Button
        className="mt-2 w-full"
        onClick={() => {
          setModalState({
            open: true,
            title: `Add a category under ${parentEvent?.name || "Root"}`,
            parentEventId: parentEvent?.id || "",
          });
        }}
      >
        Add a category under {parentEvent?.name || "Root"}
      </Button>
    </div>
  );
};

const EditEventList: React.FC<EditEventListProps> = ({
  eventList,
  className,
}) => {
  const [modalState, setModalState] = useState({
    open: false,
    title: "",
    parentEventId: "",
  });
  const [hasDuration, setHasDuration] = useState(false);
  const categoryNameInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <AnimatePresence>
        {modalState.open && (
          <Dialog
            open={modalState.open}
            onClose={() => {
              setModalState({ open: false, title: "", parentEventId: "" });
            }}
            initialFocus={categoryNameInputRef}
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
                className="m-auto w-full max-w-sm rounded-md bg-gray-400 p-2 md:rounded-lg md:p-4"
              >
                <Dialog.Title className="text-xl font-bold">
                  {modalState.title}
                </Dialog.Title>
                <form>
                  <div className="mt-2" />
                  <label htmlFor="categoryName">Category Name</label>
                  <Input
                    ref={categoryNameInputRef}
                    id="categoryName"
                    placeholder="Category Name"
                  />
                  <div className="mt-2 flex flex-row items-center">
                    <input
                      type="checkbox"
                      checked={hasDuration}
                      onChange={(e) => {
                        setHasDuration(e.target.checked);
                      }}
                      className="ml-1 h-4 w-4 rounded text-primary"
                      id="hasDuration"
                    />
                    <label
                      htmlFor="hasDuration"
                      className="m-auto ml-2 align-bottom"
                    >
                      Has Start/End Date
                    </label>
                  </div>
                  <Button className="ml-auto mt-2">Add</Button>
                </form>
              </Dialog.Panel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
      <EventList
        eventList={eventList}
        className={className}
        parentEvent={null}
        setModalState={setModalState}
      />
    </>
  );
};

export default EditEventList;
