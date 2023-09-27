import { Injectable, NotFoundException } from '@nestjs/common';
import { resolve, walkDir } from 'src/utils/utils';
import { CompileResult } from 'svelte/compiler';
import { RenderModuleCtx, SvelteService } from './svelte/svelte.service';

@Injectable()
export class ClientService {
	private readonly componentMap: Map<string, string> = new Map();
	private readonly routeMap: Map<string, { ssr: RenderModuleCtx; dom: CompileResult }> = new Map();

	public constructor(private readonly svelte: SvelteService) {
		walkDir('src/client/components', async (file) => {
			const { dom } = await this.svelte.load(file);

			this.componentMap.set(
				file.replace('src/client/components/', '').replace('.svelte', ''),
				dom.js.code.replace(/import (.+) from (?:'(.+).svelte'|"(.+).svelte")/g, (_, ...args) => {
					const imptContent = args[0];
					const imptPath = args[1] || args[2];

					return `import ${imptContent} from '/__client__/${resolve(`${imptPath}`)}.svelte'`;
				})
			);
		});
		walkDir('src/client/routes', async (file) => {
			const result = await this.svelte.render(file);

			this.routeMap.set(file.replace('src/client/routes/', '').replace('.svelte', ''), result);
		});
	}

	public renderRoute(path: string, props?: any): string {
		const app = this.routeMap.get(path === '' ? 'index' : path.endsWith('/') ? path + 'index' : path);

		if (!app) {
			throw new NotFoundException();
		}

		const { head, css, html } = app.ssr.component.render(props);

		return `
		<html data-theme="dark">
			<head>
				${head}
				<style>
				${css.code}
				</style>
			</head>
			<body>
				${html}
				<script type="module">
					${app.dom.js.code}

					const app = new App({
						target: document.body,
						hydrate: true,
						props: ${JSON.stringify(props, null, 4)}
					});
				</script>
			</body>
		</html>
		`;
	}

	public loadComponent(path: string): string {
		const component = this.componentMap.get(path);

		if (!component) {
			throw new NotFoundException('Component not found');
		} else {
			return component;
		}
	}
}

