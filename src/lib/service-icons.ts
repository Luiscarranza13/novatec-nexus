import {
  Bot,
  Brain,
  Code2,
  Database,
  Globe,
  LayoutDashboard,
  Palette,
  ServerCog,
  Smartphone,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const SERVICE_ICONS = {
  Sparkles,
  Code2,
  Brain,
  Smartphone,
  Globe,
  Database,
  LayoutDashboard,
  Palette,
  Bot,
  ServerCog,
  Wrench,
} satisfies Record<string, LucideIcon>;

export const SERVICE_ICON_NAMES = Object.keys(SERVICE_ICONS);

export function getServiceIcon(name: string | null | undefined): LucideIcon {
  const key = name?.trim();
  if (!key) return Sparkles;
  return SERVICE_ICONS[key as keyof typeof SERVICE_ICONS] ?? Sparkles;
}

export function isServiceIconName(name: string) {
  return name in SERVICE_ICONS;
}
