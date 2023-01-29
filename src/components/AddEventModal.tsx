import Input from "./Input";
import Button from "./Button";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { trpc } from "../utils/trpc";
import Toast from "./Toast";
import { useRouter } from "next/router";
import { convertDateToUTCMinus7String } from "../utils/functions";
import { useModal } from "../stores/modalStore";

interface AddEventModalProps {
  parentEventId: string;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ parentEventId }) => {
  const emptyErrorState = {
    name: "",
    startDate: "",
    endDate: "",
  };

  const router = useRouter();
  const modal = useModal();

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
      modal.close();
      toast.custom((t) => (
        <Toast
          message="A new category has been added"
          type="success"
          visible={t.visible}
          duration={t.duration}
        />
      ));
      router.replace(router.asPath);
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
    if (hasError) return;
    if (categoryNameInputRef.current?.value) {
      mutate({
        name: categoryNameInputRef.current.value,
        description: categoryDescriptionInputRef.current?.value || null,
        startDate: hasDuration
          ? convertDateToUTCMinus7String(
              eventStartDateDayInputRef.current?.value,
              eventStartDateMonthInputRef.current?.value,
              eventStartDateYearInputRef.current?.value
            )
          : null,
        endDate: hasDuration
          ? convertDateToUTCMinus7String(
              eventEndDateDayInputRef.current?.value,
              eventEndDateMonthInputRef.current?.value,
              eventEndDateYearInputRef.current?.value
            )
          : null,
        parentEventId: parentEventId || null,
      });
    }
  };

  return (
    <>
      <form onSubmit={handleAddCategory}>
        <div className="mt-2" />
        <Input
          ref={categoryNameInputRef}
          id="categoryName"
          label="Category Name"
          placeholder="Category Name"
          errorMessage={errors.name}
        />
        <label className="text-sm text-slate-200" htmlFor="description">
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
            className="h-3 w-3 rounded text-primary"
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
            <label className="text-sm text-slate-200" htmlFor="startDateDay">
              Start Date (UTC -7)
            </label>
            <div className="relative flex justify-start gap-2">
              <Input
                ref={eventStartDateDayInputRef}
                placeholder="DD"
                id="startDateDay"
                inputDivClassName="w-1/5"
                type="number"
                className={
                  errors.startDate ? "border-red focus:border-red" : ""
                }
              />
              <Input
                ref={eventStartDateMonthInputRef}
                placeholder="MM"
                inputDivClassName="w-1/5"
                type="number"
                className={
                  errors.startDate ? "border-red focus:border-red" : ""
                }
              />
              <Input
                ref={eventStartDateYearInputRef}
                placeholder="YYYY"
                inputDivClassName="w-2/5"
                type="number"
                className={
                  errors.startDate ? "border-red focus:border-red" : ""
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
            <label className="text-sm text-slate-200" htmlFor="endDateDay">
              End Date (UTC -7)
            </label>
            <div className="relative flex justify-start gap-2">
              <Input
                ref={eventEndDateDayInputRef}
                placeholder="DD"
                id="endDateDay"
                inputDivClassName="w-1/5"
                type="number"
                className={errors.endDate ? "border-red focus:border-red" : ""}
              />
              <Input
                ref={eventEndDateMonthInputRef}
                placeholder="MM"
                inputDivClassName="w-1/5"
                type="number"
                className={errors.endDate ? "border-red focus:border-red" : ""}
              />
              <Input
                ref={eventEndDateYearInputRef}
                placeholder="YYYY"
                inputDivClassName="w-2/5"
                type="number"
                className={errors.endDate ? "border-red focus:border-red" : ""}
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
        <Button type="submit" className="ml-auto mt-2" isLoading={isLoading}>
          Add
        </Button>
      </form>
    </>
  );
};

export default AddEventModal;
