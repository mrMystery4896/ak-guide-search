import { env } from "../env/client.mjs";
import { OperatorWithDetails } from "../utils/common-types";
import {
  formatEliteLevel,
  formatModule,
  formatSkillLevel,
  translateRarityToClassName,
} from "../utils/functions";
import Image from "next/image.js";
import React, { Fragment } from "react";
import Button from "./Button";
import { IoRemove } from "react-icons/io5";
import { IoMdRemove } from "react-icons/io";

interface SelectedOperatorTableProps {
  selectedOperators: OperatorWithDetails[];
  setSelectedOperators: React.Dispatch<
    React.SetStateAction<OperatorWithDetails[]>
  >;
}

const SelectedOperatorTable: React.FC<SelectedOperatorTableProps> = ({
  selectedOperators,
  setSelectedOperators,
}) => {
  if (selectedOperators.length === 0) return null;

  return (
    <div className="my-4 grid max-w-[90vw] grid-cols-[auto_repeat(4,100px)] gap-2 overflow-x-auto md:grid-cols-[300px_repeat(4,100px)]">
      <h4 className="font-semibold">Operator</h4>
      <h4 className="font-semibold">Level</h4>
      <h4 className="font-semibold">Skill</h4>
      <h4 className="font-semibold">Module</h4>
      <div />
      {/* <h4 className="text-center font-semibold">Remove</h4> */}
      {selectedOperators.map((operator) => {
        return (
          <Fragment key={operator.id}>
            <div className="flex w-fit items-center justify-between gap-3 pr-4">
              <div
                className={`${translateRarityToClassName(
                  operator.rarity
                )} relative h-9 w-9 overflow-hidden rounded-full`}
                onClick={() => {
                  setSelectedOperators(
                    selectedOperators.filter(
                      (selectedOperator) => selectedOperator.id !== operator.id
                    )
                  );
                }}
              >
                <Image
                  src={`${env.NEXT_PUBLIC_GOOGLE_CLOUD_STORAGE_BASE_URL}/operator-thumbnail/${operator.id}.png`}
                  alt={operator.id}
                  width={36}
                  height={36}
                />
              </div>
              <h5 className="truncate font-semibold">{operator.name}</h5>
            </div>
            <p className="flex items-center">
              {formatEliteLevel(operator.elite, operator.level)}
            </p>
            <p className="flex items-center">
              {formatSkillLevel(
                operator.skill,
                operator.skillLevel,
                operator.mastery
              )}
            </p>
            <p className="flex items-center">
              {formatModule(operator.moduleType, operator.moduleLevel)}
            </p>
            <div className="flex justify-center">
              <Button
                className="h-8"
                type="button"
                onClick={() => {
                  setSelectedOperators(
                    selectedOperators.filter(
                      (selectedOperator) => selectedOperator.id !== operator.id
                    )
                  );
                }}
              >
                <IoMdRemove />
              </Button>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
};

export default SelectedOperatorTable;
