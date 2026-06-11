import type { SocialProvider } from "../../features/auth/model/socialProviders";

type SocialButtonProps = {
  provider: SocialProvider;
  onClick: () => void;
};

export function SocialButton({ provider, onClick }: SocialButtonProps) {
  return (
    <button
      className="grid grid-cols-[1fr_2fr] w-full items-center  gap-3 rounded-full border-0 bg-[#00abe8] px-4 py-2.5 text-left text-[#eef6ff]  transition-transform duration-200 hover:-translate-y-0.5"
      type="button"
      onClick={onClick}
    >
      <span
        className="inline-flex items-center justify-end"
        style={{ color: provider.accent, borderColor: provider.accent }}
      >
        <img className="h-8 w-8" src={provider.icon} />
      </span>
      <span className="text-sm font-semibold sm:text-base">
        Continue with {provider.label}
      </span>
    </button>
  );
}
