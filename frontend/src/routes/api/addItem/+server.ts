import { prisma } from "../../../db/prisma";

export async function POST({ request })  {
    try {
        const {userEmail, name, category, expiryDate, status, description, price } = await request.json();
        console.log(userEmail, name, category, expiryDate, status, description, price)

        const inventory=await prisma.user.findFirst({
            where:{
                email:userEmail
            },include:{
                inventory:true
            }
        })

        console.log(inventory)

        if (!inventory) {
            return new Response(JSON.stringify({ error: 'User inventory not found.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        let inv_id=null;
        if (inventory.inventory==null){


        const inv = await prisma.inventory.create({
            data: {
                user: {
                    connect: { email: userEmail }
                }
            }
        });
        inv_id=inv.id
        }else{
            console.log("Inventory present")
            inv_id = inventory.inventory ? inventory.inventory.id : null;
        }

        if (inv_id === null) {
            return new Response(JSON.stringify({ error: 'Inventory ID not found.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        console.log(inv_id)

        const newItem = await prisma.item.create({
            data: {
                name,
                category,
                expiryDate: new Date(expiryDate),
                status,
                description,
                price,
                inventoryId:inv_id
            }
        });

        console.log("NewItem",newItem)

        return new Response(JSON.stringify(newItem), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'An error occurred while adding the item to the inventory.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};