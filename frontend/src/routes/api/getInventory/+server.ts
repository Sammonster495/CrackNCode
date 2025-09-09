import { prisma } from "../../../db/prisma";

export async function GET({ url }) {
    const email = url.searchParams.get('email');
    console.log("email: ", email);

    const user=await prisma.user.findFirst({
        where:{
            email:email
        },
        include:{
            inventory:true
        }
    })

    try {
        if (!user || !user.inventory) {
            return new Response(JSON.stringify({ error: 'User or inventory not found.' }), { status: 404 });
        }

        const inventory= await prisma.inventory.findFirst({
            where: { id: user.inventory.id }
        });

        if (!inventory) {
            return new Response(JSON.stringify({ error: 'Inventory not found.' }), { status: 404 });
        }

        const items=await prisma.item.findMany({
            where:{inventoryId:inventory.id}
        })

        console.log(items)

        return new Response(JSON.stringify({ items }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'An error occurred while fetching inventory items.' }), { status: 500 });
    }
};
