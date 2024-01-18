export default async function PutImage(formData: FormData) {
    
    const response = await fetch(`http://${process.env.NEXT_PUBLIC_HOST}:3001/settings/update_image`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
    })
    if (!response.ok) {
      
    } else {
       
    }
    return await response.json();
}
