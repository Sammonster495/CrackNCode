<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '../ui/button/button.svelte';
	import { page } from '$app/stores';

	let map;
	let mapElement; // Reference for the map container div
	let searchInput; // Reference for the search input
	let address: string;

	interface Place {
		name?: string;
		formatted_address?: string;
		place_id?: string;
		geometry?: {
			location: {
				lat: () => number;
				lng: () => number;
			};
			viewport?: object;
		};
	}

	let place: Place = {};
	let lat: number;
	let lng: number;
	let marker; // Marker for selected place
	let currentLocationMarker; // Marker for current location

	onMount(() => {
		// Load the Google Maps JavaScript API script with Places Library
		getDetails();
		const script = document.createElement('script');
		script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
		script.async = true;
		script.defer = true;
		document.head.appendChild(script);

		// Define the initMap function globally to be used as a callback
		window.initMap = () => {
			const defaultLocation = { lat: lat, lng: lng };
			// Initialize the map
			map = new google.maps.Map(mapElement, {
				center: { lat: -33.8688, lng: 151.2093 }, // Default location (Sydney)
				zoom: 12
			});

			// Add a marker (pointer) at the default location (Sydney)
			new google.maps.Marker({
				map,
				position: defaultLocation,
				title: 'Sydney',
				icon: {
					url: 'https://maps.google.com/mapfiles/ms/icons/red-pushpin.png' // Custom pointer icon
				}
			});

			// Set up the search box with Autocomplete
			const autocomplete = new google.maps.places.Autocomplete(searchInput);
			autocomplete.bindTo('bounds', map);

			// When a place is selected, move the map to that location
			autocomplete.addListener('place_changed', () => {
				place = autocomplete.getPlace();

				if (!place.geometry) {
					console.log("No details available for input: '" + place.name + "'");
					return;
				}

				// Log place details to console
				lat = place.geometry.location.lat();
				lng = place.geometry.location.lng();
				address = place.formatted_address;
				console.log('Place Details:');
				console.log('Name:', place.name);
				console.log('Latitude:', lat);
				console.log('Longitude:', lng);
				console.log('Address:', place.formatted_address);
				console.log('Place ID:', place.place_id);
				console.log('Additional Info:', place);

				// Center the map on the selected location
				if (place.geometry.viewport) {
					map.fitBounds(place.geometry.viewport);
				} else {
					map.setCenter(place.geometry.location);
					map.setZoom(15); // Zoom in closer
				}

				// Remove previous marker, if any
				if (marker) {
					marker.setMap(null);
				}

				// Add a new marker at the selected location
				marker = new google.maps.Marker({
					map,
					position: place.geometry.location,
					title: place.name
				});
			});
		};

		return () => {
			// Cleanup function to remove the script if the component is destroyed
			document.head.removeChild(script);
			delete window.initMap;
		};
	});

	// Function to fetch the user's current location and add it to the map
	const useCurrentLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				lat = position.coords.latitude;
				lng = position.coords.longitude;

				// Update place object with current location details
				place = {
					name: 'Current Location',
					formatted_address: 'Your current location',
					place_id: 'current_location'
				};

				// Center the map on the current location
				map.setCenter({ lat, lng });
				map.setZoom(15);

				// Remove previous current location marker, if any
				if (currentLocationMarker) {
					currentLocationMarker.setMap(null);
				}

				// Add a new custom pointer marker at the current location
				currentLocationMarker = new google.maps.Marker({
					map,
					position: { lat, lng },
					title: 'Current Location',
					icon: {
						url: 'https://maps.google.com/mapfiles/ms/icons/red-pushpin.png' // Custom pointer icon URL
					}
				});

				console.log('Current Location:');
				console.log('Latitude:', lat);
				console.log('Longitude:', lng);
			});
		} else {
			console.error('Geolocation is not supported by this browser.');
		}
	};

	const addDetails = async () => {
		const userEmail = $page.data.session?.user?.email;
		console.log(userEmail);
		const res = await fetch('/api/addDetails', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				id: userEmail,
				name: place.name,
				latitude: lat,
				longitude: lng,
				address: address
			})
		});
	};

	const getDetails = async () => {
		const userEmail = $page.data.session?.user?.email;
		const res = await fetch(`/api/getDetails?id=${userEmail}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const data = await res.json();
		console.log(data);
		place.name = data.place;
		lat = data.location.latitude;
		lng = data.location.longitude;
		address = data.address;
	};
</script>

<div class="m-3 mx-auto w-fit rounded-md border p-10 text-center text-xl">
	<p><span class="font-bold">Name :</span> {place.name}</p>
	<p><span class="font-bold">Address :</span> {address}</p>
</div>

<!-- HTML template for the map and search box -->
<div class="p-10">
    <div class="flex items-center justify-between">

        <input id="search-box" type="text" placeholder="Search a location" bind:this={searchInput} />
        <div>
            <Button onclick={useCurrentLocation}>Use Current Location</Button>
            <Button onclick={addDetails}>Select</Button>
        </div>
    </div>

	<div id="map" bind:this={mapElement}></div>
</div>

<style>
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
</style>
