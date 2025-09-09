<script>
    import { page } from "$app/stores";
	import { SignIn, SignOut } from '@auth/sveltekit/components';

    console.log($page.data?.session?.user)

</script>


<nav class="border w-full bg-blue-500 py-3 px-5 text-white m-0">
    <nav class="flex justify-between items-center">
        <p class="font-bold text-white text-xl"><a href="/">MedFlow</a></p>
        <div class="flex space-x-2 items-center">

                {#if $page.data.session}
                <img src={$page.data?.session?.user?.image} alt='profile-img' class="profile"/>
                <p><a href="/profile">{$page.data.session?.user?.name}</a></p>
                
                <SignOut class="border border-white px-3 py-2 rounded-md hover:bg-[#f9f9f930]">
                    <div slot="submitButton" class="buttonPrimary">Sign out</div>
                </SignOut>
            {:else}
                <SignIn>
                    <div slot="submitButton" class="buttonPrimary">Sign in</div>
                </SignIn>
            {/if}
        </div>
    </nav>
    
</nav>

<style>
    .profile {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

</style>
