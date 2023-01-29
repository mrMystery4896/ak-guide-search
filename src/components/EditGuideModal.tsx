import type { GuideWithDetails } from "../utils/common-types";

interface EditGuideModalProps {
  guide: GuideWithDetails;
}

const EditGuideModal: React.FC<EditGuideModalProps> = ({ guide }) => {
  return <>{guide.title}</>;
};

export default EditGuideModal;
