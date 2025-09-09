import { prisma } from "../../../db/prisma";

export async function GET({ url }) {
    const id = url.searchParams.get('id');
    console.log("id : ", id);

    if (!id) {
        return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    // Fetch user details from the database using Prisma
    const userDetails = await prisma.user.findUnique({
        where: { email: id },
        include: { location: true } // Include related location data if needed
    });

    if (!userDetails) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    return new Response(JSON.stringify(userDetails), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}