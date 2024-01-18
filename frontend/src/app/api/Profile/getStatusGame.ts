export default async function getStatusGame(id: string) {
  const response = await fetch(
    `http://${process.env.NEXT_PUBLIC_HOST}:3001/profile/${id}/status_game`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
  }
  return await response.json();
}
