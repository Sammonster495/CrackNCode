<script lang="ts">
	import '../app.css';
	let { children } = $props();
	import Navbar from "../lib/components/Navbar/+page.svelte"
</script>

<Navbar />
{@render children()}
