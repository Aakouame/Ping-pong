import { SettingsType } from "@/app/types/settingsType";

export default async function PutSettings(data: SettingsType) {
    const response = await fetch(`http://${process.env.NEXT_PUBLIC_HOST}:3001/settings/update_data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
     
      return await response.json();
}
