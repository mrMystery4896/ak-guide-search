import { Dialog } from "@headlessui/react";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { useRef, useState } from "react";
import type { EventWithChildren } from "../utils/common-types";
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
  const defaultError = {
    stageCode: "",
    stageName: "",
  };
  const [error, setError] = useState(defaultError);
  const [stages, setStages] = useState<
    {
      stageCode: string | null;
      stageName: string;
    }[]
  >([]);
  const stageCodeInputRef = useRef<HTMLInputElement>(null);
  const stageNameInputRef = useRef<HTMLInputElement>(null);
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
      setStages([]);
      setError(defaultError);
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
    if (stages.length === 0) {
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
      stages: stages,
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
              setStages([]);
              setError(defaultError);
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
                  onReorder={setStages}
                  values={stages}
                  ref={reorderGroupRef}
                  className="cursor-pointer overflow-y-hidden"
                >
                  <AnimatePresence mode="popLayout">
                    {stages.map((stage) => (
                      <Reorder.Item
                        layout
                        value={stage}
                        key={stage.stageName}
                        className="mb-2 flex items-center justify-between rounded bg-primary p-2"
                        dragConstraints={reorderGroupRef}
                        dragElastic={0.1}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        onClick={() => {
                          setStages(
                            stages.filter(
                              (stageToBeRemoved) =>
                                stageToBeRemoved.stageName !== stage.stageName
                            )
                          );
                        }}
                      >
                        <span>
                          {stage.stageName}{" "}
                          {stage.stageCode ? `(${stage.stageCode})` : ""}
                        </span>
                        <TiMinus />
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
                <div className="relative mb-4 flex flex-col md:mb-5">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setError(defaultError);
                      let hasError = false;
                      if (
                        stageNameInputRef.current &&
                        stageCodeInputRef.current
                      ) {
                        if (!stageNameInputRef.current.value) {
                          setError({
                            ...defaultError,
                            stageName: "Stage name is required",
                          });
                          hasError = true;
                          return;
                        }
                        if (
                          stages
                            .map((stage) => stage.stageName)
                            .includes(stageNameInputRef.current.value)
                        ) {
                          setError({
                            ...defaultError,
                            stageName: "Stage name already exists",
                          });
                          hasError = true;
                        }
                        if (
                          stages
                            .map((stage) => stage.stageCode)
                            .filter(
                              (code) => code !== undefined || code !== null
                            )
                            .includes(stageCodeInputRef.current.value)
                        ) {
                          setError({
                            ...defaultError,
                            stageCode: "Stage code already exists",
                          });
                          hasError = true;
                        }
                        if (hasError) return;
                        setStages([
                          ...stages,
                          {
                            stageName: stageNameInputRef.current?.value || "",
                            stageCode: stageCodeInputRef.current?.value || null,
                          },
                        ]);
                        stageCodeInputRef.current.value = "";
                        stageNameInputRef.current.value = "";
                      }
                    }}
                  >
                    <div className="flex flex-col">
                      <label
                        className="mb-1 text-xs text-slate-200 md:text-sm"
                        htmlFor="stageCode"
                      >
                        Stage Code (Optional)
                      </label>
                      <Input
                        className="w-24"
                        id="stageCode"
                        placeholder="e.g. CE-5"
                        ref={stageCodeInputRef}
                        errorMessage={error.stageCode}
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1 text-xs text-slate-200 md:text-sm"
                        htmlFor="stageName"
                      >
                        Stage Name
                      </label>
                      <div className="mb-2 flex justify-between gap-2">
                        <Input
                          inputDivClassName="mb-0 md:mb-0 w-full"
                          id="stageName"
                          placeholder="Stage Name"
                          ref={stageNameInputRef}
                          errorMessage={error.stageName}
                        />
                        <Button>
                          <TiPlus />
                        </Button>
                      </div>
                    </div>
                  </form>
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
