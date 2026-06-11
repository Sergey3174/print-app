import FB from "../../../assets/facebook.png";
import WA from "../../../assets/whatsapp.png";
import GOOGLE from "../../../assets/google.png";
import TG from "../../../assets/tg.png";

export type SocialProvider = {
  id: string;
  label: string;
  icon: string;
  accent: string;
  link: string;
};

export const socialProviders: SocialProvider[] = [
  {
    id: "google",
    label: "Google",
    icon: GOOGLE,
    accent: "#ffffff",
    link: "/api/auth/oauth/telegram?source=pwa",
  },
  {
    id: "whatsapp",
    label: "Whats App",
    icon: WA,
    accent: "#d1d5db",
    link: "/api/auth/oauth/telegram?source=pwa",
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: TG,
    accent: "#7dd3fc",
    link: "/api/oauth/telegram?source=pwa",
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: FB,
    accent: "#93c5fd",
    link: "/api/auth/oauth/telegram?source=pwa",
  },
];
