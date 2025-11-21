import { prisma } from "@/lib/prisma"

type NullableString = string | null | undefined
type SiteSettingsInput = Partial<Record<keyof SiteSettingsData, NullableString>>

export interface SiteSettingsData {
  phone: string
  email: string
  instagram: string
  facebook: string
}

const DEFAULT_SETTINGS: SiteSettingsData = {
  phone: "",
  email: "",
  instagram: "",
  facebook: "",
}

const normalize = (value: NullableString) => (value ?? "").trim()

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const settings = await prisma.siteSetting.findFirst({
      orderBy: { id: "asc" },
    })

    if (!settings) {
      return DEFAULT_SETTINGS
    }

    return {
      phone: normalize(settings.phone),
      email: normalize(settings.email),
      instagram: normalize(settings.instagram),
      facebook: normalize(settings.facebook),
    }
  } catch (error) {
    console.error("Failed to load site settings", error)
    return DEFAULT_SETTINGS
  }
}

export function toApiPayload(settings: SiteSettingsInput): SiteSettingsData {
  return {
    phone: normalize(settings.phone),
    email: normalize(settings.email),
    instagram: normalize(settings.instagram),
    facebook: normalize(settings.facebook),
  }
}
