import { ChevronLeft, User } from "lucide-react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "../../../app/store/store";

type ProfileHeaderProps = {
  onBack: () => void;
};

export function ProfileHeader({ onBack }: ProfileHeaderProps) {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.user.user);
  const photo = user?.photo ?? null;

  return (
    <div className="flex justify-between items-center pt-10">
      <div className="flex items-center gap-4">
        <button type="button" onClick={onBack}>
          <ChevronLeft />
        </button>
        <div className="">
          <h2 className="font-bold text-3xl text-cyan-900 leading-none">
            {t("profile.headerTitle")}
          </h2>
          <p className="font-bold text-xl text-cyan-900 leading-6">
            {t("profile.headerSubtitle")}
          </p>
        </div>
      </div>
      {photo ? (
        <img
          src={photo}
          className="rounded-full w-12 h-12 border-1  border-blue-400 bg-gray-600/20"
        />
      ) : (
        <User
          className="rounded-full border-1 border-blue-400 bg-gray-600/20 p-3"
          color="black"
          size={48}
        />
      )}
    </div>
  );
}
