export default async function getFriends(id: string) {
    const response = await fetch(`http://${process.env.NEXT_PUBLIC_HOST}:3001/profile/${id}/friends`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    return await response.json();
}
