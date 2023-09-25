import { Injectable } from '@nestjs/common';
import { SvelteService } from './svelte/svelte.service';

@Injectable()
export class AppService {
	public constructor(private readonly svelte: SvelteService) {}

	public async render(path: string): Promise<string> {
		const result = await this.svelte.render(`src/client/${path}.svelte`);

		// console.log(result.ssr, result.dom.js);

		return `
		<html>
			<head>
				${result.ssr.head}
				<style>
				${result.ssr.css.code}
				</style>
			</head>
			<body>
				${result.ssr.html}
				<script type="module">
					${result.dom.js.code}

					const app = new App({
						target: document.body,
						hydrate: true
					});
				</script>
			</body>
		</html>
		`;
	}
}

