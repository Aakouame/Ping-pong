export default async function getProfileInfo(id: string) {
  const response = await fetch(
    `http://${process.env.NEXT_PUBLIC_HOST}:3001/profile/${id}/main`,
    {
      method: "GET",

      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
  }

  const Profileinfo = await response.json();

  return Profileinfo;
}
