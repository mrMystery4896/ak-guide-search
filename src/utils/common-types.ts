import type {
  Event,
  Operator,
  Stage,
  GuideOperator,
  Creator,
  Guide,
  Tag,
  User,
} from "@prisma/client";

export type EventWithChildren = Event & {
  stages: Stage[];
  childEvents?: EventWithChildren[];
  parentEvent: Event | null;
};

export type OperatorWithDetails = Operator &
  Omit<GuideOperator, "operatorId" | "guideId">;

export type GuideWithDetails = Guide & {
  stage: Stage;
  guideOperator: OperatorWithDetails[];
  tags: Tag[];
  submittedBy: User;
  uploadedBy: Creator;
};
