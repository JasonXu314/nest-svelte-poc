import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolve } from 'src/utils/utils';
import preprocessor from 'svelte-preprocess';
import { CompileResult, compile, preprocess } from 'svelte/compiler';
import { Context, SourceTextModule, SyntheticModule, createContext } from 'vm';

interface RenderResult {
	html: string;
	css: { code: string; map: null };
	head: string;
}

interface RenderModuleCtx {
	component: {
		render(props?: any, extra?: { $$slots: any; context: Map<any, any> }): RenderResult;
	};
}

async function impt(mod: string, context: Context): Promise<SyntheticModule> {
	const module = await import(mod);

	const m = new SyntheticModule(
		Object.keys(module),
		() => {
			Object.entries(module).forEach(([key, val]) => {
				m.setExport(key, val);
			});
		},
		{ context }
	);

	return m;
}

@Injectable()
export class SvelteService {
	public async render(path: string): Promise<{ ssr: RenderResult; dom: CompileResult }> {
		const contents = readFileSync(path).toString();

		const preprocessed = await preprocess(contents, preprocessor({ typescript: { compilerOptions: { module: 'commonjs' } } }), { filename: path });
		const ssrResult = compile(preprocessed.code, { generate: 'ssr', hydratable: true, name: 'App' });
		const domResult = compile(preprocessed.code, { generate: 'dom', hydratable: true, sveltePath: '/svelte', name: 'App' });

		const ssr = await this.eval(ssrResult);

		return { ssr, dom: domResult };
	}

	public async loadSvelte(path: string): Promise<string> {
		if (path.endsWith('.js')) {
			path = resolve(`node_modules/svelte/${path}`);
		} else {
			const pkg = JSON.parse(readFileSync('node_modules/svelte/package.json').toString());
			const filePath = pkg.exports[`./${path}`].default;
			path = resolve(`node_modules/svelte/${filePath}`);
		}

		const parent = path.split('/').slice(0, -1).join('/');

		return readFileSync(path)
			.toString()
			.replace(/import (.+) from (?:'(.+)'|"(.+)")/g, (_, ...args) => {
				const imptContent = args[0];
				const imptPath = args[1] || args[2];

				return `import ${imptContent} from '${resolve(`${parent}/${imptPath}`).replace('node_modules/', '/')}'`;
			})
			.replace(/export (.+) from (?:'(.+)'|"(.+)")/g, (_, ...args) => {
				const exptContent = args[0];
				const exptPath = args[1] || args[2];

				return `export ${exptContent} from '${resolve(`${parent}/${exptPath}`).replace('node_modules/', '/')}'`;
			});
	}

	private async eval(result: CompileResult): Promise<RenderResult> {
		const context = createContext();
		const module = new SourceTextModule(result.js.code, { context });
		await module.link((specifier) => impt(specifier, context));

		const renderModule = new SourceTextModule(`import App from '%%component'; globalThis.component = App;`, { context });
		await renderModule.link((specifier) => (specifier === '%%component' ? module : impt(specifier, context)));
		await renderModule.evaluate();

		const { component } = module.context as RenderModuleCtx;
		return component.render();
	}
}

