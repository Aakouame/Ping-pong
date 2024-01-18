
export default async function getSettings() {
    const response = await fetch(`http://${process.env.NEXT_PUBLIC_HOST}:3001/settings`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    })
    if (!response.ok) {
      
    }
    return await response.json();
}
