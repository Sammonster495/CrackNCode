import { prisma } from '../../../db/prisma';

export async function POST({ request }) {
    console.log("Details : ", request);
    try {
        const { id, name, latitude, longitude,address } = await request.json();
        const newDetail = await prisma.user.update({
            where: {
                email: id
            },
            data: {
                place: name,
                address:address,
                location: {
                    upsert: {
                        create: {
                            latitude: latitude,
                            longitude: longitude,
                            address: "default address",
                            city: "default city",
                            state: "default state",
                            country: "default country",
                            postalCode: "default postalCode"
                        },
                        update: {
                            latitude: latitude,
                            longitude: longitude,
                            address: "default address",
                            city: "default city",
                            state: "default state",
                            country: "default country",
                            postalCode: "default postalCode"
                        }
                    }
                }
            },
            include: { location: true }
        });
        return new Response(JSON.stringify(newDetail), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Error adding details to the database:", error);
        return new Response(JSON.stringify({ error: "Error adding details to the database" }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } finally {
        await prisma.$disconnect();
    }
};

