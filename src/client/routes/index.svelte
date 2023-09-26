<script lang="ts">
	import Form from '../components/Form.svelte';

	let count: number = 0,
		text: string = '';
</script>

<svelte:head>
	<link rel="stylesheet" href="https://mypico.jasonxu.dev/min" />
</svelte:head>

<button
	on:click={() => {
		count++;
		console.log(text);
	}}
>
	Count: {count}
</button>
<Form bind:value={text} />
