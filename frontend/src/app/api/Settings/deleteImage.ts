export default async function DeleteImage() {
    const response = await fetch(`http://${process.env.NEXT_PUBLIC_HOST}:3001/settings/delete_image`, {
        method: 'DELETE',
        credentials: 'include',
    })
    if (!response.ok) {
       
    }
    
    return  await response.json();
}
