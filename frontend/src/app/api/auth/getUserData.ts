export default async function getUserData() {
    const response = await fetch(`http://${process.env.NEXT_PUBLIC_HOST}:3001/auth/goodlogin`, {
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
