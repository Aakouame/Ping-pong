
export default async function CheckUserStatus(cookie: string) {
    try {
        const response = await fetch(`http://${process.env.NEXT_PUBLIC_HOST}:3001/auth/checkUserStatus`, {
            method: 'GET',
            headers: {
                'Cookie': `connect.sid=${cookie}`,
            },
          
        })
        return response;
    } catch(err) {
        
        throw err;
    }
}
