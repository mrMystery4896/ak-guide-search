import { Dialog } from "@headlessui/react";
import {
  AnimatePresence,
  motion,
  MotionAdvancedProps,
  Reorder,
} from "framer-motion";
import { useRef, useState } from "react";
import { EventWithChildren } from "../utils/common-types";
import Button from "./Button";
import Input from "./Input";
import { TiMinus, TiPlus } from "react-icons/ti";
import { trpc } from "../utils/trpc";
import { toast } from "react-hot-toast";
import Toast from "./Toast";
import { useRouter } from "next/router";

interface AddStageModalProps {
  modalState: {
    open: boolean;
    event?: EventWithChildren;
  };
  setModalState: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      event?: EventWithChildren;
    }>
  >;
}

const AddStageModal: React.FC<AddStageModalProps> = ({
  modalState,
  setModalState,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [stageCodes, setStageCodes] = useState<string[]>([]);
  const stageCodeInputRef = useRef<HTMLInputElement>(null);
  const reorderGroupRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  const { mutate, isLoading } = trpc.stage.addStage.useMutation({
    onSuccess: () => {
      toast.custom((t) => (
        <Toast
          message="Stage added successfully"
          type="success"
          visible={t.visible}
          duration={3000}
        />
      ));
      setModalState({ open: false, event: undefined });
      setStageCodes([]);
      setErrorMessage("");
      router.replace(router.asPath);
    },
    onError: (error) => {
      toast.custom((t) => (
        <Toast
          message={error.message}
          type="error"
          visible={t.visible}
          duration={3000}
        />
      ));
    },
  });

  const addStage = () => {
    if (modalState.event === undefined) {
      toast.custom((t) => (
        <Toast
          message="Something went wront. Please try again later"
          type="error"
          visible={t.visible}
          duration={3000}
        />
      ));
      return;
    }
    if (stageCodes.length === 0) {
      toast.custom((t) => (
        <Toast
          message="Please add at least one stage."
          type="error"
          visible={t.visible}
          duration={3000}
        />
      ));
      return;
    }
    mutate({
      parentEventId: modalState.event.id,
      stageCodes: stageCodes,
    });
  };

  return (
    <>
      <AnimatePresence>
        {modalState.open && modalState.event && (
          <Dialog
            open={modalState.open}
            onClose={() => {
              setModalState({ open: false, event: undefined });
              setStageCodes([]);
              setErrorMessage("");
            }}
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
                className="m-auto max-h-[80%] w-96 max-w-[80%] overflow-y-scroll rounded-md bg-gray-400 p-4 md:rounded-lg"
              >
                <Dialog.Title className="mb-4 text-xl font-bold">
                  Add Stage to {modalState.event.name}
                </Dialog.Title>
                <Reorder.Group
                  axis="y"
                  onReorder={setStageCodes}
                  values={stageCodes}
                  ref={reorderGroupRef}
                  className="cursor-pointer overflow-y-hidden"
                >
                  <AnimatePresence mode="popLayout">
                    {stageCodes.map((stageCode) => (
                      <Reorder.Item
                        layout
                        value={stageCode}
                        key={stageCode}
                        className="mb-2 flex items-center justify-between rounded bg-primary p-2"
                        dragConstraints={reorderGroupRef}
                        dragElastic={0.1}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        onClick={() => {
                          setStageCodes(
                            stageCodes.filter((code) => code !== stageCode)
                          );
                        }}
                      >
                        <span>{stageCode}</span>
                        <TiMinus />
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
                <div className="relative mb-4 flex flex-col md:mb-5">
                  <label
                    className="mb-1 text-xs text-slate-200 md:text-sm"
                    htmlFor="stageCode"
                  >
                    Stage Code
                  </label>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setErrorMessage("");
                      if (!stageCodeInputRef.current?.value) {
                        setErrorMessage("Stage code cannot be empty");
                        return;
                      }
                      if (
                        stageCodes.includes(stageCodeInputRef.current.value)
                      ) {
                        setErrorMessage("Stage code already exists");
                        return;
                      }
                      setStageCodes([
                        ...stageCodes,
                        stageCodeInputRef.current.value,
                      ]);
                      stageCodeInputRef.current.value = "";
                    }}
                    className="flex justify-between"
                  >
                    <input
                      className={`mr-4 w-full rounded-md border-2 border-gray-300 bg-gray-300 px-3 py-2 text-sm placeholder:text-sm placeholder:text-gray-100 focus:outline-none md:text-base placeholder:md:text-base ${
                        errorMessage ? "border-red" : "focus:border-primary"
                      }`}
                      id="stageCode"
                      placeholder="Stage Code (e.g. CE-5)"
                      ref={stageCodeInputRef}
                    />
                    <Button>
                      <TiPlus />
                    </Button>
                  </form>
                  <span
                    className={`absolute -bottom-5 h-5 text-sm font-semibold text-red ${
                      errorMessage ? "" : "invisible"
                    }`}
                  >
                    {errorMessage}
                  </span>
                </div>
                <Button
                  className="ml-auto"
                  isLoading={isLoading}
                  onClick={addStage}
                >
                  Add
                </Button>
              </Dialog.Panel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddStageModal;
