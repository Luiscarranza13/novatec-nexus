import {
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiPhp,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVuedotjs,
} from "react-icons/si";
import { TbRoute } from "react-icons/tb";
import type { IconType } from "react-icons";

export type TechItem = {
  name: string;
  icon: IconType;
};

export const TECH_STACK: TechItem[] = [
  { name: "Next.js", icon: SiNextdotjs },
  { name: "TanStack Start", icon: TbRoute },
  { name: "React", icon: SiReact },
  { name: "Vue", icon: SiVuedotjs },
  { name: "Supabase", icon: SiSupabase },
  { name: "PHP", icon: SiPhp },
  { name: "MySQL", icon: SiMysql },
  { name: "Node.js", icon: SiNodedotjs },
  { name: "TypeScript", icon: SiTypescript },
  { name: "Tailwind", icon: SiTailwindcss },
];
