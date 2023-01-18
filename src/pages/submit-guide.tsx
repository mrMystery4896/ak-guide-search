import { Operator, Stage, Tag } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { GetServerSideProps, type NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { HiArrowsUpDown } from "react-icons/hi2";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown";
import Input from "../components/Input";
import SelectedOperatorTable from "../components/SelectedOperatorTable";
import SelectOperatorDropdown from "../components/SelectOperatorDropdown";
import SelectStageMenu from "../components/SelectStageMenu";
import SelectTagDropdown from "../components/SelectTagDropdown";
import TagCard from "../components/TagCard";
import Toast from "../components/Toast";
import Tooltip from "../components/Tooltip";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { prisma } from "../server/db/client";
import { EventWithChildren, OperatorWithDetails } from "../utils/common-types";
import {
  getEliteBasedOnRarity,
  calculateMaxLevel,
  getEvent,
  getSkill,
  getSkillLevel,
  getMastery,
} from "../utils/functions";
import { trpc } from "../utils/trpc";

interface SubmitGuideProps {
  operatorList: Operator[];
  tagList: Tag[];
  eventList: EventWithChildren[];
}

const SubmitGuide: NextPage<SubmitGuideProps> = ({
  operatorList,
  tagList,
  eventList,
}) => {
  const videoUrlInputRef = useRef<HTMLInputElement>(null);

  const [selectedOperators, setSelectedOperators] = useState<
    OperatorWithDetails[]
  >([]);
  const [activeOperator, setActiveOperator] = useState<Operator | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [activeOperatorDetails, setActiveOperatorDetails] = useState<
    Omit<OperatorWithDetails, keyof Operator>
  >({
    elite: null,
    level: null,
    skill: null,
    skillLevel: null,
    mastery: null,
    moduleType: null,
    moduleLevel: null,
  });
  const [lastAddedOperator, setLastAddedOperator] = useState({
    ...activeOperator,
    ...activeOperatorDetails,
  });
  const session = useSession();
  const router = useRouter();
  const { data: operatorElite } = useQuery(
    ["calculate-operator-elite", activeOperator],
    {
      queryFn: () => {
        if (!activeOperator) return null;
        const eliteArray = getEliteBasedOnRarity(activeOperator.rarity);
        if (
          activeOperatorDetails.elite === null ||
          !eliteArray.includes(activeOperatorDetails.elite)
        ) {
          setActiveOperatorDetails((prev) => ({
            ...prev,
            elite: eliteArray[eliteArray.length - 1] ?? null,
          }));
        }
        return eliteArray;
      },
    }
  );
  const { data: operatorMaxLevel } = useQuery(
    [
      "calculate-operator-max-level",
      activeOperatorDetails.elite,
      activeOperator?.rarity,
    ],
    {
      queryFn: () => {
        if (activeOperatorDetails.elite === null || !activeOperator) {
          setActiveOperatorDetails((prev) => ({ ...prev, level: null }));
          return null;
        }
        const maxLevel = calculateMaxLevel(
          activeOperator.rarity,
          activeOperatorDetails.elite
        );
        setActiveOperatorDetails((prev) => ({
          ...prev,
          level: maxLevel,
        }));
        if (
          activeOperatorDetails.level === null ||
          (maxLevel && activeOperatorDetails.level > maxLevel)
        ) {
          setActiveOperatorDetails((prev) => ({
            ...prev,
            level: maxLevel,
          }));
        }
        if (
          activeOperatorDetails.elite === lastAddedOperator.elite &&
          activeOperator.rarity === lastAddedOperator.rarity
        ) {
          setActiveOperatorDetails((prev) => ({
            ...prev,
            level: lastAddedOperator.level,
          }));
        }
        return maxLevel;
      },
    }
  );
  const { data: operatorSkills } = useQuery({
    queryKey: [
      "get-operator-skills",
      activeOperatorDetails.elite,
      activeOperator?.rarity,
    ],
    queryFn: () => {
      if (!activeOperator || activeOperatorDetails.elite === null) return null;
      const skillArray = getSkill(
        activeOperator.rarity,
        activeOperatorDetails.elite
      );
      if (
        activeOperatorDetails.skill &&
        !skillArray.includes(activeOperatorDetails.skill)
      ) {
        setActiveOperatorDetails((prev) => ({
          ...prev,
          skill: null,
          skillLevel: null,
        }));
      }
      return skillArray;
    },
  });
  const { data: operatorSkillLevels } = useQuery({
    queryKey: ["get-operator-skill-levels", activeOperatorDetails.elite],
    queryFn: () => {
      if (activeOperatorDetails.elite === null) return null;
      const skillLevelArray = getSkillLevel(activeOperatorDetails.elite);
      const masteryArray = getMastery(activeOperatorDetails.elite);
      if (
        activeOperatorDetails.skillLevel &&
        !skillLevelArray.includes(activeOperatorDetails.skillLevel)
      ) {
        setActiveOperatorDetails((prev) => ({
          ...prev,
          skillLevel: null,
        }));
      }
      if (
        activeOperatorDetails.mastery !== null &&
        !masteryArray.includes(activeOperatorDetails.mastery)
      ) {
        setActiveOperatorDetails((prev) => ({
          ...prev,
          mastery: null,
        }));
      }
      if (
        activeOperatorDetails.skillLevel === null &&
        activeOperatorDetails.mastery === null
      ) {
        setActiveOperatorDetails((prev) => ({
          ...prev,
          skillLevel: null,
          mastery: null,
        }));
      }
      return { skillLevelArray, masteryArray };
    },
  });

  const {
    data: youtubeData,
    error: youtubeError,
    isLoading: videoIsLoading,
    mutate,
  } = trpc.youtube.getVideo.useMutation();
  const { mutate: submitGuide, isLoading: isSubmitting } =
    trpc.guide.submitGuide.useMutation({
      onSuccess: () => {
        toast.custom((t) => (
          <Toast
            message={`Guide submitted successfully!${
              session.data?.user?.role === "ADMIN"
                ? " It will show up once a moderator have approved it."
                : ""
            }`}
            visible={t.visible}
            duration={3000}
            type="success"
          />
        ));
        router.push("/");
      },
      onError: (error) => {
        toast.custom((t) => (
          <Toast
            message={error.message}
            visible={t.visible}
            duration={3000}
            type="error"
          />
        ));
      },
    });

  const getVideoDetails = async () => {
    if (!videoUrlInputRef.current) return;
    mutate(videoUrlInputRef.current.value);
  };

  const addOperatorToList = () => {
    if (!activeOperator) return;
    const operatorToBeAdded: OperatorWithDetails = {
      ...activeOperator,
      ...activeOperatorDetails,
    };
    setSelectedOperators((prev) => [...prev, operatorToBeAdded]);
    setActiveOperator(null);
    setLastAddedOperator(operatorToBeAdded);
  };

  const handleSubmit = async () => {
    // e.preventDefault();
    if (!youtubeData) {
      toast.custom((t) => (
        <Toast
          message="Please fetch a video first."
          visible={t.visible}
          duration={3000}
          type="error"
        />
      ));
      return;
    }
    if (selectedOperators.length === 0) {
      toast.custom((t) => (
        <Toast
          message="Please select at least one operator."
          visible={t.visible}
          duration={3000}
          type="error"
        />
      ));
      return;
    }
    if (selectedTags.length === 0) {
      toast.custom((t) => (
        <Toast
          message="Please select at least one tag."
          visible={t.visible}
          duration={3000}
          type="error"
        />
      ));
      return;
    }
    if (!selectedStage) {
      toast.custom((t) => (
        <Toast
          message="Please select a stage."
          visible={t.visible}
          duration={3000}
          type="error"
        />
      ));
      return;
    }
    submitGuide({
      id: youtubeData.id,
      title: youtubeData.title,
      stageId: selectedStage.id,
      operators: selectedOperators,
      tags: selectedTags.map((tag) => tag.id),
      uploadedById: youtubeData.channelId,
      uploadedByName: youtubeData.channelTitle,
      thumbnailUrl: youtubeData.thumbnail,
    });
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Submit Guide</h1>
      <h2 className="mt-2 flex items-center text-xl font-bold">
        YouTube Link
        <Tooltip content="test" />
      </h2>
      <div className="mt-3 flex w-full">
        <Input
          type="text"
          placeholder="Link to Guide on YouTube"
          ref={videoUrlInputRef}
          errorMessage={
            youtubeError?.data?.zodError?.formErrors[0] ?? youtubeError?.message
          }
          className="mr-4 w-[50vw]"
        />
        <Button
          onClick={getVideoDetails}
          type="button"
          isLoading={videoIsLoading}
          className="h-full"
        >
          <HiArrowsUpDown className="inline-block md:mr-2" />
          <span className="hidden md:inline-block">Fetch</span>
        </Button>
      </div>
      {/* Loading state for fetching video */}
      {youtubeData ? (
        <div className="mt-4 flex flex-col md:flex-row">
          <div className="relative h-44 w-80 min-w-[320px] max-w-full overflow-hidden rounded-md drop-shadow-md md:rounded-lg">
            <Image
              src={youtubeData.thumbnail}
              alt={youtubeData.title}
              fill
              style={{ objectFit: "cover" }}
              sizes="100%"
            />
          </div>
          <div className="mt-2 gap-2 md:ml-4 md:mt-0">
            <h3 className="text-lg font-bold md:text-2xl">
              {youtubeData.title}
            </h3>
            <p className="mt-2 text-slate-300">{youtubeData.channelTitle}</p>
          </div>
        </div>
      ) : null}
      <div className="mt-2">
        <h2 className="text-xl font-bold">Add Operators</h2>
        {/* TODO: Add input for skill, level, and modules.  */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addOperatorToList();
          }}
          className="mt-3 w-fit max-w-[85vw] flex-col gap-2"
        >
          <SelectedOperatorTable
            selectedOperators={selectedOperators}
            setSelectedOperators={setSelectedOperators}
          />
          <div className="relative z-20">
            <SelectOperatorDropdown
              operators={operatorList.filter(
                (operator) =>
                  !selectedOperators.some(
                    (selectedOperator) => selectedOperator.id === operator.id
                  )
              )}
              setActiveOperator={setActiveOperator}
              activeOperator={activeOperator}
            />
          </div>
          <div className="relative z-10 my-2 mt-3 flex w-full max-w-[90vw] flex-col gap-3 md:flex-row md:flex-wrap md:gap-8">
            <div className="z-50 grid w-auto max-w-[90vw] grid-cols-[80px_auto] gap-3 md:grid-cols-[100px_auto]">
              <div className="flex items-center justify-between">
                <h4 className="font-bold">Elite</h4>
                <h4 className="font-bold">:</h4>
              </div>
              <Dropdown
                options={
                  operatorElite?.map((elite) => {
                    return `Elite ${elite}`;
                  }) || []
                }
                onChange={(v) => {
                  setActiveOperatorDetails({
                    ...activeOperatorDetails,
                    elite: v === null ? null : parseInt(v.charAt(v.length - 1)),
                  });
                }}
                selected={
                  activeOperatorDetails.elite !== null
                    ? `Elite ${activeOperatorDetails.elite}`
                    : null
                }
                disabled={activeOperator === null}
                hasNullOption={true}
                className="w-full md:w-32 md:max-w-full"
                optionsClassName="w-full z-50 md:w-32 md:max-w-full"
              />
              <div className="flex items-center justify-between">
                <h4 className="font-bold">Level</h4>
                <h4 className="font-bold">:</h4>
              </div>
              <Input
                type="number"
                disabled={
                  activeOperator === null ||
                  activeOperatorDetails.elite === null
                }
                value={activeOperatorDetails.level ?? ""}
                onChange={(e) => {
                  if (e.target.value === "")
                    return setActiveOperatorDetails({
                      ...activeOperatorDetails,
                      level: null,
                    });
                  const value = parseInt(e.target.value);
                  if (!operatorMaxLevel) return;
                  if (isNaN(value)) return;
                  if (value > operatorMaxLevel || value < 0) {
                    return;
                  }
                  setActiveOperatorDetails({
                    ...activeOperatorDetails,
                    level: value,
                  });
                }}
                inputDivClassName="mb-0 md:mb-0 w-full md:w-32 md:max-w-full"
                className="w-full text-base"
              />
            </div>
            <div className="z-40 grid w-auto max-w-[90vw] grid-cols-[80px_auto] gap-3 md:grid-cols-[100px_auto]">
              <div className="flex items-center justify-between">
                <h4 className="font-bold">Skill</h4>
                <h4 className="font-bold">:</h4>
              </div>
              <Dropdown
                options={
                  operatorSkills?.map((skill) => {
                    return `Skill ${skill}`;
                  }) || []
                }
                onChange={(v) => {
                  setActiveOperatorDetails({
                    ...activeOperatorDetails,
                    skill: v === null ? null : parseInt(v.charAt(v.length - 1)),
                  });
                }}
                selected={
                  operatorSkills?.length === 1
                    ? `Skill ${operatorSkills[0]}`
                    : activeOperatorDetails.skill !== null
                    ? `Skill ${activeOperatorDetails.skill}`
                    : null
                }
                disabled={
                  activeOperator === null ||
                  activeOperator.rarity === 1 ||
                  activeOperator.rarity === 2
                }
                hasNullOption={true}
                nullOptionText="Unknown"
                className="w-full md:w-32 md:max-w-full"
                optionsClassName="w-full z-50 md:w-32 md:max-w-full"
              />
              <div className="flex items-center justify-between">
                <h4 className="font-bold">Skill Lvl</h4>
                <h4 className="font-bold">:</h4>
              </div>
              <Dropdown
                options={
                  operatorSkillLevels?.skillLevelArray
                    ?.map((skill) => {
                      return `L${skill}`;
                    })
                    .concat(
                      operatorSkillLevels.masteryArray.map(
                        (mastery) => `M${mastery}`
                      )
                    )
                    .filter((level) => level !== "M0") || []
                }
                onChange={(v) => {
                  if (v === null) {
                    setActiveOperatorDetails({
                      ...activeOperatorDetails,
                      skillLevel: null,
                      mastery: null,
                    });
                    return;
                  }
                  if (v.charAt(0) === "L") {
                    setActiveOperatorDetails({
                      ...activeOperatorDetails,
                      skillLevel: parseInt(v.charAt(v.length - 1)),
                      mastery: 0,
                    });
                    return;
                  }
                  setActiveOperatorDetails({
                    ...activeOperatorDetails,
                    skillLevel: 7,
                    mastery: parseInt(v.charAt(v.length - 1)),
                  });
                }}
                selected={
                  activeOperatorDetails.skillLevel !== null
                    ? activeOperatorDetails.mastery
                      ? `M${activeOperatorDetails.mastery}`
                      : `L${activeOperatorDetails.skillLevel}`
                    : null
                }
                disabled={
                  activeOperatorDetails.skill === null ||
                  activeOperator?.rarity === 1 ||
                  activeOperator?.rarity === 2 ||
                  activeOperator === null
                }
                hasNullOption={true}
                nullOptionText="Unknown"
                className="w-full md:w-32 md:max-w-full"
                optionsClassName="w-full z-50 md:w-32 md:max-w-full"
              />
            </div>
            <div className="z-30 grid w-auto max-w-[90vw] grid-cols-[80px_auto] gap-3 md:grid-cols-[100px_auto]">
              <div className="flex items-center justify-between">
                <h4 className="font-bold">Module</h4>
                <h4 className="font-bold">:</h4>
              </div>
              <Dropdown
                options={["X", "Y", "None"]}
                onChange={(v) => {
                  setActiveOperatorDetails({
                    ...activeOperatorDetails,
                    moduleType: v,
                  });
                }}
                selected={activeOperatorDetails.moduleType ?? null}
                disabled={
                  activeOperator === null ||
                  activeOperatorDetails.elite === null ||
                  activeOperatorDetails.elite < 2
                }
                hasNullOption={true}
                className="w-full md:w-32 md:max-w-full"
                optionsClassName="w-full z-50 md:w-32 md:max-w-full"
              />
              <div className="flex items-center justify-between">
                <h4 className="font-bold">Module Lvl</h4>
                <h4 className="font-bold">:</h4>
              </div>
              <Dropdown
                options={[1, 2, 3]}
                onChange={(v) => {
                  setActiveOperatorDetails({
                    ...activeOperatorDetails,
                    moduleLevel: v,
                  });
                }}
                selected={activeOperatorDetails.moduleLevel}
                disabled={
                  activeOperator === null ||
                  activeOperatorDetails.elite === null ||
                  activeOperatorDetails.elite < 2 ||
                  activeOperatorDetails.moduleType === "None" ||
                  activeOperatorDetails.moduleType === null
                }
                hasNullOption={true}
                className="w-full md:w-32 md:max-w-full"
                optionsClassName="w-full z-50 md:w-32 md:max-w-full"
              />
            </div>
          </div>
          <Button
            onClick={addOperatorToList}
            disabled={activeOperator === null}
            className="mt-4 w-full"
          >
            Add
          </Button>
        </form>
        <h2 className="mt-5 text-xl font-bold">
          Select Tags &#40;Click to Remove&#41;
        </h2>
        {selectedTags.length > 0 ? (
          <div className="flex flex-wrap gap-2 py-2 md:gap-3">
            {selectedTags.map((tag) => {
              return (
                <TagCard
                  tag={tag}
                  key={tag.id}
                  onClick={() => {
                    setSelectedTags(
                      selectedTags.filter(
                        (selectedTag) => selectedTag.id !== tag.id
                      )
                    );
                  }}
                />
              );
            })}
          </div>
        ) : null}
        <SelectTagDropdown
          setSelectedTags={setSelectedTags}
          tags={tagList.filter((tag) => !selectedTags.includes(tag))}
          className="mt-2"
        />
        <h2 className="mt-5 text-xl font-bold">Select a Stage</h2>
        <motion.div
          key={selectedStage?.id ?? "none"}
          className="my-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              ease: "easeOut",
              duration: 0.3,
            },
          }}
        >
          {selectedStage?.stageCode && (
            <>
              <b>{selectedStage.stageCode}</b> -{" "}
            </>
          )}
          {selectedStage?.stageName ?? "Please select a stage"}
        </motion.div>
        <SelectStageMenu
          eventList={eventList}
          setSelectedStage={setSelectedStage}
          selectedStage={selectedStage}
        />
        <Button
          className="my-5"
          onClick={handleSubmit}
          isLoading={isSubmitting}
        >
          Submit
        </Button>
      </div>
    </>
  );
};

export default SubmitGuide;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  const operatorList = await prisma.operator.findMany({
    orderBy: [
      {
        rarity: "desc",
      },
      {
        name: "asc",
      },
    ],
  });
  const tagList = await prisma.tag.findMany({
    orderBy: {
      name: "asc",
    },
  });
  const eventList = await getEvent();

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      operatorList,
      tagList,
      eventList: JSON.parse(JSON.stringify(eventList)),
    },
  };
};
