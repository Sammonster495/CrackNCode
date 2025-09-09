<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { page } from '$app/stores';
	import Button from '../ui/button/button.svelte';

	let items: {
		name: string;
		category: string;
		expiryDate: string;
		status: string;
		description: string;
		price: number;
	}[] = [];

	let map;
	let mapElement;
	let searchInput;
	let placesService;

	let place = 'City Hospital'; // Default place
	let lat = 13.0153; // Default latitude for City Hospital
	let lng = 74.8069; // Default longitude for City Hospital

	// Create a writable store to store nearby locations
	const nearbyLocations = writable([]);

	// Default location details for the hospital (replace with actual coordinates)
	const defaultLocation = {
		name: 'City Hospital',
		lat: 13.0153,
		lng: 74.8069
	};

	onMount(() => {
		getDetails(); // Fetch details for hospital or custom location
		getInventoryItem();

		const script = document.createElement('script');
		script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
		script.async = true;
		script.defer = true;
		document.head.appendChild(script);

		window.initMap = () => {
			// Initialize the map with the default location first
			map = new google.maps.Map(mapElement, {
				center: { lat: lat, lng: lng },
				zoom: 15
			});

			// Add a marker for the default location
			const hospitalMarker = new google.maps.Marker({
				map,
				position: { lat: lat, lng: lng },
				title: place
			});

			// Create an InfoWindow for the default location
			const hospitalInfoWindow = new google.maps.InfoWindow({
				content: `<div>${place}</div>`
			});
			hospitalInfoWindow.open(map, hospitalMarker);

			// Initialize the PlacesService
			placesService = new google.maps.places.PlacesService(map);

			// Find nearby medicine supply centers for the default location (City Hospital)
			findNearbyMedicineCenters({ lat: lat, lng: lng });

			// Set up the search box with Autocomplete
			const autocomplete = new google.maps.places.Autocomplete(searchInput);
			autocomplete.bindTo('bounds', map);

			// Listener for when a place is selected
			autocomplete.addListener('place_changed', () => {
				const selectedPlace = autocomplete.getPlace();

				if (!selectedPlace.geometry) {
					console.log("No details available for input: '" + selectedPlace.name + "'");
					return;
				}

				// Center the map on the selected location
				if (selectedPlace.geometry.viewport) {
					map.fitBounds(selectedPlace.geometry.viewport);
				} else {
					map.setCenter(selectedPlace.geometry.location);
					map.setZoom(15);
				}

				// Place a marker at the selected location
				new google.maps.Marker({
					map,
					position: selectedPlace.geometry.location
				});

				// Find nearby medicine supply centers for the selected location
				findNearbyMedicineCenters(selectedPlace.geometry.location);
			});
		};

		return () => {
			document.head.removeChild(script);
			delete window.initMap;
		};
	});

	async function getDetails() {
		const userEmail = $page.data.session?.user?.email;
		const res = await fetch(`/api/getDetails?id=${userEmail}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const data = await res.json();

		console.log(data);
		place = data.place;
		lat = parseFloat(data.location.latitude); // Ensure lat is a number
		lng = parseFloat(data.location.longitude); // Ensure lng is a number
		console.log(place, lat, lng);

		// Once data is fetched, initialize the map
		if (window.initMap) {
			window.initMap();
		}
	}

	function findNearbyMedicineCenters(location) {
		const request = {
			location: location,
			radius: 5000, // Search within 5 kilometers
			type: 'pharmacy' // Search for pharmacies/medicine supply centers
		};

		// Perform a nearby search for pharmacies
		placesService.nearbySearch(request, (results, status) => {
			if (status === google.maps.places.PlacesServiceStatus.OK) {
				// Update the nearbyLocations store with the results
				console.log(results);
				nearbyLocations.set(
					results.map((place) => ({
						name: place.name,
						lat: place.geometry.location.lat(),
						lng: place.geometry.location.lng(),
						rating: place.rating
					}))
				);

				// Add markers for each pharmacy found
				results.forEach((place) => {
					// Skip the default location (hospital) if it's in the nearby results
					if (
						place.geometry.location.lat() === defaultLocation.lat &&
						place.geometry.location.lng() === defaultLocation.lng
					) {
						return; // Skip this place since it's the default location
					}

					// Place a marker for each pharmacy found
					const marker = new google.maps.Marker({
						map,
						position: place.geometry.location,
						title: place.name,
						icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' // Different icon for other locations
					});

					// Add an InfoWindow to each marker to show the name
					const infoWindow = new google.maps.InfoWindow({
						content: `<div>${place.name}</div>`
					});

					// Open the InfoWindow when the marker is clicked
					marker.addListener('click', () => {
						infoWindow.open(map, marker);
					});
				});
			} else {
				console.log('No nearby places found or request failed:', status);
			}
		});
	}

	function centerMapOnLocation(location) {
		map.setCenter({ lat: location.lat, lng: location.lng });
		map.setZoom(15);
	}

	function getRandomNumberInRange() {
		return Math.floor(Math.random() * 11); // 11 because Math.random() generates a number between 0 (inclusive) and 1 (exclusive)
	}

	const getInventoryItem = async () => {
		const userEmail = $page.data.session?.user?.email;
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

	let showOrderForm = false;
	let orderDetails = {
		name: '',
		item: '',
		quantity: 1
	};

	function submitOrder() {
		console.log('Order submitted:', orderDetails);
		// Add your order submission logic here
		showOrderForm = false;
		orderDetails.name = '';
		orderDetails.item = '';
		orderDetails.quantity = 1;
	}
</script>

<!-- HTML for the search box and map container -->
<input id="search-box" type="text" placeholder="Search a location" bind:this={searchInput} />
<div id="map" bind:this={mapElement}></div>

<!-- List nearby locations -->
<h3 class="mt-2 text-center text-2xl font-bold">Nearby Locations</h3>
<div class="location-list flex flex-wrap justify-center">
	{#each $nearbyLocations as location (location.name)}
		<div
			class="location-item m-2 rounded-sm border border-black"
			role="button"
			tabindex="0"
			on:click={() => {
				centerMapOnLocation(location);
				const infoWindow = new google.maps.InfoWindow({
					content: `<div>${location.name}</div>`
				});
				const marker = new google.maps.Marker({
					map,
					icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png', // Change marker color to green
					position: { lat: location.lat, lng: location.lng }
				});
				infoWindow.open(map, marker);
				orderDetails.name = location.name;
			}}
			on:keydown={(e) => e.key === 'Clicked' && centerMapOnLocation(location)}
		>
			<p class="font-bold">{location.name} - <span>{location.rating}</span></p>
			{#if getRandomNumberInRange() >= 6}
				<div class="flex">
					<p class="font-bold text-green-500">AVAILABLE</p>
					<div>
						<p>
							- > [
							{#each items as item}
								{#if item.status == 'Unavailable'}
									{item.name},
								{/if}
							{/each}
							]
						</p>
					</div>
				</div>
			{:else}
				<p class="text-red-500">Not Available</p>
			{/if}
		</div>
	{/each}
</div>

<Button
	class="fixed bottom-10 right-10 px-5 py-6 text-xl transition hover:scale-105"
	on:click={() => (showOrderForm = true)}>Order Now</Button
>
<!-- Order Now Popup Form -->
{#if showOrderForm}
	<div class="order-form-overlay">
		<div class="order-form">
			<h2 class="mb-4 text-center text-2xl font-bold">Order Now</h2>
			<form on:submit|preventDefault={submitOrder}>
				<div class="form-group">
					<label for="name">Name:</label>
					<input type="text" id="name" bind:value={orderDetails.name} required />
				</div>
				<div class="form-group">
					<label for="item">Item:</label>
					<select id="item" bind:value={orderDetails.item} required>
						<option value="" disabled selected>Select an item</option>
						{#each items as item}
							{#if item.status == 'Unavailable'}
								<option value={item.name}>{item.name}</option>
							{/if}
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="quantity">Quantity:</label>
					<input type="number" id="quantity" bind:value={orderDetails.quantity} min="1" required />
				</div>
				<div class="form-actions">
					<button type="submit" class="btn btn-primary">Submit Order</button>
					<button type="button" class="btn btn-secondary" on:click={() => (showOrderForm = false)}
						>Cancel</button
					>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.order-form-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}
	.order-form {
		background: white;
		padding: 20px;
		border-radius: 8px;
		width: 400px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}
	.form-group {
		margin-bottom: 15px;
	}
	.form-group label {
		display: block;
		margin-bottom: 5px;
	}
	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	.form-actions {
		display: flex;
		justify-content: space-between;
	}
	.btn {
		padding: 10px 20px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
	.btn-primary {
		background: #007bff;
		color: white;
	}
	.btn-secondary {
		background: #6c757d;
		color: white;
	}
	#map {
		width: 100%;
		height: 600px;
	}
	#search-box {
		width: 300px;
		margin: 10px;
		padding: 8px;
		border-radius: 4px;
		border: 1px solid #ccc;
	}
	.location-list {
		margin-top: 20px;
		padding: 10px;
		border-top: 2px solid #ccc;
	}
	.location-item {
		padding: 8px;
		cursor: pointer;
	}
	.location-item:hover {
		background-color: #f0f0f0;
	}
</style>
