<script lang="ts">
	import { Todo } from 'dist/models';

	export let initTodos: Todo[];

	let todos: Todo[] = initTodos ?? [];
</script>

<svelte:head>
	<link rel="stylesheet" href="https://mypico.jasonxu.dev/min" />
</svelte:head>

<main class="container">
	<h1>Todos</h1>
	{#each todos as todo (todo.id)}
		<section class="todo">
			<h3>{todo.title}</h3>
			<p>{todo.description}</p>
			<input type="checkbox" checked={todo.completed} />
		</section>
	{/each}
</main>
