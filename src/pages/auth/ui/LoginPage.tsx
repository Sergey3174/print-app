import { socialProviders } from "../../../features/auth/model/socialProviders";
import { SocialButton } from "../../../shared/ui/SocialButton";
import { MobileShell } from "../../../widgets/mobile-shell/ui/MobileShell";
import BG_LOGIN from "../../../assets/login.png";

export function LoginPage() {
  return (
    <MobileShell>
      <section className="flex flex-col px-4  flex-1 overflow-auto  gap-5 bg-white">
        <div className="text-center">
          <div className="relative flex justify-center max-w-[360px] mx-auto">
            <img className="relative z-1" src={BG_LOGIN} />
            <div className="absolute  left-1/2 opacity-20 -translate-x-1/2 top-1/2 rounded-4xl rotate-55 -translate-y-1/2 bg-[#00abe8] w-1/2 aspect-square"></div>
          </div>
          <h1 className="m-0 text-[1.8rem] leading-none font-extrabold md:text-[2.1rem] text-[#00abe8]">
            Your body needs water!
          </h1>
          <p className="mt-2 text-lg text-gray-500 max-w-60 mx-auto leading-6 ">
            Track yor daily water intake with just a few taps!
          </p>
        </div>

        <div className="grid gap-3">
          {socialProviders.map((provider) => (
            <SocialButton
              key={provider.id}
              provider={provider}
              onClick={() => {
                window.open(
                  `${import.meta.env.VITE_BASE_URL}${provider.link}`,
                  "_self",
                );
              }}
            />
          ))}
        </div>
      </section>
    </MobileShell>
  );
}
