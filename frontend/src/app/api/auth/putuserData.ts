export default async function PutUserData(userData: {
  full_name: string;
  nickname: string;
}) {
  try {
    const response = await fetch(
      `http://${process.env.NEXT_PUBLIC_HOST}:3001/auth/signup`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      }
    );
    if (!response.ok) {
      if (response.status === 403) {
        return await response.json();
      } else {
        return response;
      }
    }
    return response;
  } catch (err) {}
}
