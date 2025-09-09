<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Button from '../ui/button/button.svelte';

	let items: {
		name: string;
		category: string;
		expiryDate: string;
		status: string;
		description: string;
		price: number;
	}[] = [];

	const userEmail = $page.data.session?.user?.email;

	let name = '';
	let category = '';
	let expiryDate = '';
	let status = '';
	let description = '';
	let price = '';

	onMount(() => {
		getInventoryItem();
	});

	async function addItem() {
		const response = await fetch('/api/addItem', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name,
				category,
				expiryDate,
				status,
				description,
				price,
				userEmail
			})
		});

		if (response.ok) {
			const newItem = await response.json();
			console.log('Item added:', newItem);
			getInventoryItem()
			name = '';
			category = '';
			expiryDate = '';
			status = '';
			description = '';
			price = '';
		} else {
			console.error('Failed to add item');
		}
	}

	const getInventoryItem = async () => {
		try {
			const res = await fetch(`/api/getInventory?email=${userEmail}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!res.ok) {
				throw new Error(`HTTP error! Status: ${res.status}`);
			}

			const data = await res.json();
			items = data.items;
			console.log(data.items);
		} catch (error) {
			console.error('Error fetching inventory item:', error);
		}
	};
</script>

<table class="min-w-full border border-gray-200 bg-white">
	<thead>
		<tr class="w-full border-b bg-gray-100">
			<th class="px-4 py-2 text-left">Name</th>
			<th class="px-4 py-2 text-left">Category</th>
			<th class="px-4 py-2 text-left">Expiry Date</th>
			<th class="px-4 py-2 text-left">Price</th>
			<th class="px-4 py-2 text-left">Status</th>
		</tr>
	</thead>
	<tbody>
		{#each items as item}
			<tr class="border-b hover:bg-gray-50">
				<td class="px-4 py-2">{item.name}</td>
				<td class="px-4 py-2">{item.category}</td>
				<td class="px-4 py-2">{new Date(item.expiryDate).toLocaleDateString()}</td>
				<td class="px-4 py-2">{item.price}</td>
				<td class="px-4 py-2" style="color: {item.status === 'Available' ? 'green' : 'red'}"
					>{item.status}</td
				>
			</tr>
		{/each}
	</tbody>
</table>

<form
	on:submit|preventDefault={addItem}
	class="m-auto mt-10 w-fit flex-col justify-center rounded-lg border border-black bg-[#eeecec] p-8"
>
	<p class="text-center text-2xl">Enter Item Details</p>
	<hr class="mb-2 border border-black" />
	<label>
		Name:
		<input type="text" bind:value={name} required class=" m-2 rounded-3xl px-2 py-1" />
	</label>
	<br />
	<label>
		Category:
		<select bind:value={category} class=" m-2 rounded-3xl px-2 py-1" required>
			<option value="" disabled selected>Select a category</option>
			<option value="Disinfectants">Disinfectants</option>
			<option value="PPE">PPE</option>
			<option value="Medical_Devices">Medical Devices</option>
			<option value="Medications">Medications</option>
			<option value="Other">Other</option>
		</select>
	</label>
	<br />
	<label>
		Expiry Date:
		<input type="date" bind:value={expiryDate} class=" m-2 rounded-3xl px-2 py-1" required />
	</label>
	<br />
	<label>
		Status:
		<select bind:value={status} class=" m-2 rounded-3xl px-2 py-1" required>
			<option value="" disabled selected>Select status</option>
			<option value="Available">Available</option>
			<option value="Unavailable">Unavailable</option>
		</select>
	</label>
	<br />
	<label>
		Description:
		<textarea bind:value={description} required></textarea>
	</label>
	<br />
	<label>
		Price:
		<input type="number" bind:value={price} class=" m-2 rounded-3xl px-2 py-1" required />
	</label>
	<br />
	<div class="m-auto w-fit">
		<Button type="submit">Add Item</Button>
	</div>
</form>
