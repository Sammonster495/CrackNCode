<script>
	import home from '$lib/assets/home.jpg';
	import Button from '$lib/components/ui/button/button.svelte';
	import { goto } from '$app/navigation';
</script>

<div class="mt-32 flex">
	<div class="pl-20">
		<p class=" text-[80px]">Revolutionizing Healthcare</p>
		<p class="text-xl  text-gray-800">
			Healthcare systems often face critical shortages of essential medical supplies, such as
			personal protective equipment (PPE), medications, and medical devices, due to sudden surges in
			demand, supply chain disruptions, or limited availability in certain regions.
		</p>
		<p class="text-xl font-bold">
			But we are here to solve it!!!
		</p>
		<Button class="bg-blue-500 text-xl mt-10 px-6 py-6 hover:scale-110 transition" on:click={() => { goto('/find'); }}>Explore Solutions</Button>
		<Button class="bg-white text-blue-500 border-2 border-blue-500 text-xl mt-10 px-6 py-6 hover:scale-110 transition ml-5 hover:text-white" on:click={() => { goto('/inventory'); }}>Inventory</Button>
	</div>
	<div>
		<img src={home} alt="home-image" />
	</div>
</div>
