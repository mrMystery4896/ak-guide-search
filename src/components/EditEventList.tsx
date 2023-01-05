import Button from "./Button";
import { EventWithChildren } from "../utils/common-types";
import { Dialog, Disclosure } from "@headlessui/react";
import { FaChevronDown } from "react-icons/fa";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import Input from "./Input";
import React from "react";
import { trpc } from "../utils/trpc";
import toast from "react-hot-toast";
import Toast from "./Toast";

type EventListProps = EditEventListProps & {
  parentEvent: EventWithChildren | null;
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

const EditEventList: React.FC<EditEventListProps> = ({
  eventList,
  className,
}) => {
  const emptyErrorState = {
    name: "",
    startDate: "",
    endDate: "",
  };

  const [modalState, setModalState] = useState({
    open: false,
    title: "",
    parentEventId: "",
  });
  const [hasDuration, setHasDuration] = useState(false);
  const [errors, setErrors] = useState(emptyErrorState);
  const categoryNameInputRef = useRef<HTMLInputElement>(null);
  const categoryDescriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const eventStartDateDayInputRef = useRef<HTMLInputElement>(null);
  const eventStartDateMonthInputRef = useRef<HTMLInputElement>(null);
  const eventStartDateYearInputRef = useRef<HTMLInputElement>(null);
  const eventEndDateDayInputRef = useRef<HTMLInputElement>(null);
  const eventEndDateMonthInputRef = useRef<HTMLInputElement>(null);
  const eventEndDateYearInputRef = useRef<HTMLInputElement>(null);

  const { mutate, isLoading } = trpc.event.addEvent.useMutation({
    onSuccess: () => {
      setModalState({ open: false, title: "", parentEventId: "" });
      toast.custom((t) => (
        <Toast
          message="A new category has been added"
          type="success"
          visible={t.visible}
          duration={t.duration}
        />
      ));
    },
    onError: (err) => {
      toast.custom((t) => (
        <Toast
          message={err.message}
          type="error"
          visible={t.visible}
          duration={t.duration}
        />
      ));
    },
  });

  const handleAddCategory: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    let hasError = false;
    setErrors(emptyErrorState);
    if (!categoryNameInputRef.current?.value) {
      setErrors((prev) => ({ ...prev, name: "Name is required" }));
      hasError = true;
    }
    if (
      (!eventStartDateDayInputRef.current?.value ||
        !eventStartDateMonthInputRef.current?.value ||
        !eventStartDateYearInputRef.current?.value) &&
      hasDuration
    ) {
      setErrors((prev) => ({ ...prev, startDate: "Start date is required" }));
      hasError = true;
    }
    if (
      (!eventEndDateDayInputRef.current?.value ||
        !eventEndDateMonthInputRef.current?.value ||
        !eventEndDateYearInputRef.current?.value) &&
      hasDuration
    ) {
      setErrors((prev) => ({ ...prev, endDate: "End date is required" }));
      hasError = true;
    }
    // check if date is valid
    if (hasDuration) {
      const startDate = new Date(
        `${eventStartDateYearInputRef.current?.value}-${eventStartDateMonthInputRef.current?.value}-${eventStartDateDayInputRef.current?.value}`
      );
      const endDate = new Date(
        `${eventEndDateYearInputRef.current?.value}-${eventEndDateMonthInputRef.current?.value}-${eventEndDateDayInputRef.current?.value}`
      );
      if (startDate > endDate) {
        setErrors((prev) => ({
          ...prev,
          endDate: "End date must be after start date",
        }));
        hasError = true;
      }
      const isValidStartDate =
        !isNaN(startDate.getTime()) &&
        startDate.getDate() ===
          Number(eventStartDateDayInputRef.current?.value);
      const isValidEndDate =
        !isNaN(endDate.getTime()) &&
        endDate.getDate() === Number(eventEndDateDayInputRef.current?.value);
      if (!isValidStartDate) {
        setErrors((prev) => ({ ...prev, startDate: "Start date is invalid" }));
        hasError = true;
      }
      if (!isValidEndDate) {
        setErrors((prev) => ({ ...prev, endDate: "End date is invalid" }));
        hasError = true;
      }
    }
    if (hasError) return;
    if (categoryNameInputRef.current?.value) {
      mutate({
        name: categoryNameInputRef.current.value,
        description: categoryDescriptionInputRef.current?.value || null,
        startDate: hasDuration
          ? new Date(
              `${eventStartDateYearInputRef.current?.value}-${eventStartDateMonthInputRef.current?.value}-${eventStartDateDayInputRef.current?.value}`
            )
          : null,
        endDate: hasDuration
          ? new Date(
              `${eventEndDateYearInputRef.current?.value}-${eventEndDateMonthInputRef.current?.value}-${eventEndDateDayInputRef.current?.value}`
            )
          : null,
        parentEventId: modalState.parentEventId || null,
      });
    }
  };

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
                layout
                className="m-auto max-h-[80%] w-96 max-w-[80%] overflow-y-scroll rounded-md bg-gray-400 p-4 md:rounded-lg"
              >
                <Dialog.Title className="mb-4 text-xl font-bold">
                  {modalState.title}
                </Dialog.Title>
                <form onSubmit={handleAddCategory}>
                  <div className="mt-2" />
                  <Input
                    ref={categoryNameInputRef}
                    id="categoryName"
                    label="Category Name"
                    placeholder="Category Name"
                    errorMessage={errors.name}
                  />
                  <label
                    className="text-sm text-slate-200"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <textarea
                    ref={categoryDescriptionInputRef}
                    rows={3}
                    id="description"
                    placeholder="Description"
                    className="mt-2 mb-2 w-full resize-none rounded-md border-2 border-gray-300 bg-gray-300 p-2 placeholder:text-gray-100 focus:border-primary focus:outline-none"
                  />
                  <div className="mt-2 flex flex-row items-center">
                    <input
                      type="checkbox"
                      checked={hasDuration}
                      onChange={(e) => {
                        setHasDuration(e.target.checked);
                      }}
                      className="h-3 w-3 rounded text-primary md:h-4 md:w-4"
                      id="hasDuration"
                    />
                    <label
                      htmlFor="hasDuration"
                      className="m-auto ml-2 align-bottom text-sm"
                    >
                      Has Start/End Date
                    </label>
                  </div>
                  {hasDuration && (
                    <>
                      <label
                        className="text-sm text-slate-200"
                        htmlFor="startDateDay"
                      >
                        Start Date
                      </label>
                      <div className="relative flex justify-start gap-2">
                        <Input
                          ref={eventStartDateDayInputRef}
                          placeholder="DD"
                          id="startDateDay"
                          inputDivClassName="w-1/5"
                          type="number"
                          onWheel={(e) => {
                            e.currentTarget.blur();
                          }}
                          className={
                            errors.startDate
                              ? "border-red focus:border-red"
                              : ""
                          }
                        />
                        <Input
                          ref={eventStartDateMonthInputRef}
                          placeholder="MM"
                          inputDivClassName="w-1/5"
                          type="number"
                          onWheel={(e) => {
                            e.currentTarget.blur();
                          }}
                          className={
                            errors.startDate
                              ? "border-red focus:border-red"
                              : ""
                          }
                        />
                        <Input
                          ref={eventStartDateYearInputRef}
                          placeholder="YYYY"
                          inputDivClassName="w-2/5"
                          type="number"
                          onWheel={(e) => {
                            e.currentTarget.blur();
                          }}
                          className={
                            errors.startDate
                              ? "border-red focus:border-red"
                              : ""
                          }
                        />
                        <span
                          className={`absolute -bottom-1 h-5 text-sm font-semibold text-red ${
                            errors.startDate ? "" : "invisible"
                          }`}
                        >
                          {errors.startDate}
                        </span>
                      </div>
                      <label
                        className="text-sm text-slate-200"
                        htmlFor="endDateDay"
                      >
                        End Date
                      </label>
                      <div className="relative flex justify-start gap-2">
                        <Input
                          ref={eventEndDateDayInputRef}
                          placeholder="DD"
                          id="endDateDay"
                          inputDivClassName="w-1/5"
                          type="number"
                          onWheel={(e) => {
                            e.currentTarget.blur();
                          }}
                          className={
                            errors.endDate ? "border-red focus:border-red" : ""
                          }
                        />
                        <Input
                          ref={eventEndDateMonthInputRef}
                          placeholder="MM"
                          inputDivClassName="w-1/5"
                          type="number"
                          onWheel={(e) => {
                            e.currentTarget.blur();
                          }}
                          className={
                            errors.endDate ? "border-red focus:border-red" : ""
                          }
                        />
                        <Input
                          ref={eventEndDateYearInputRef}
                          placeholder="YYYY"
                          inputDivClassName="w-2/5"
                          type="number"
                          onWheel={(e) => {
                            e.currentTarget.blur();
                          }}
                          className={
                            errors.endDate ? "border-red focus:border-red" : ""
                          }
                        />
                        <span
                          className={`absolute -bottom-1 h-5 text-sm font-semibold text-red ${
                            errors.endDate ? "" : "invisible"
                          }`}
                        >
                          {errors.endDate}
                        </span>
                      </div>
                    </>
                  )}
                  <Button
                    type="submit"
                    className="ml-auto mt-2"
                    isLoading={isLoading}
                  >
                    Add
                  </Button>
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
      <Button
        className="mt-2 w-full py-2"
        onClick={() => {
          setModalState({
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
