export default async function getUserStatus() {
    const response = await fetch(`http://${process.env.NEXT_PUBLIC_HOST}:3001/auth/getUserStatus`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      if (!response.ok) {
      
        return response.json();
      }
      return await response.json();
}
