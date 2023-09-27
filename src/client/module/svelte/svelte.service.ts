import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolve } from 'src/utils/utils';
import preprocessor from 'svelte-preprocess';
import { CompileResult, compile, preprocess } from 'svelte/compiler';
import { Context, SourceTextModule, SyntheticModule, createContext } from 'vm';

export interface RenderResult {
	html: string;
	css: { code: string; map: null };
	head: string;
}

export interface RenderModuleCtx {
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
	public async render(path: string): Promise<{ ssr: RenderModuleCtx; dom: CompileResult }> {
		const contents = readFileSync(path).toString();

		const preprocessed = await preprocess(contents, preprocessor({ typescript: { compilerOptions: { module: 'es2020', target: 'es2020' } } }), {
			filename: path
		});
		const ssrResult = compile(preprocessed.code, { generate: 'ssr', hydratable: true, name: 'App' });
		const domResult = compile(preprocessed.code, { generate: 'dom', hydratable: true, sveltePath: '/__svelte__', name: 'App' });
		// console.log(domResult.js.code);

		const ssr = await this.eval(ssrResult);
		domResult.js.code = domResult.js.code.replace(/import (.+) from (?:'(.+).svelte'|"(.+).svelte")/g, (_, ...args) => {
			const imptContent = args[0];
			const imptPath = args[1] || args[2];

			return `import ${imptContent} from '/__client__/${resolve(`routes/${imptPath}`)}.svelte'`;
		});

		return { ssr, dom: domResult };
	}

	public async load(path: string): Promise<{ ssr: CompileResult; dom: CompileResult }> {
		const contents = readFileSync(path).toString();

		const preprocessed = await preprocess(contents, preprocessor({ typescript: { compilerOptions: { module: 'es2020', target: 'es2020' } } }), {
			filename: path
		});
		const ssr = compile(preprocessed.code, { generate: 'ssr', hydratable: true, filename: path });
		const dom = compile(preprocessed.code, { generate: 'dom', hydratable: true, sveltePath: '/__svelte__', filename: path });

		return { ssr, dom };
	}

	public async loadSvelteInternal(path: string): Promise<string> {
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

				return `import ${imptContent} from '${resolve(`${parent}/${imptPath}`).replace('node_modules/', '/').replace('svelte', '__svelte__')}'`;
			})
			.replace(/export (.+) from (?:'(.+)'|"(.+)")/g, (_, ...args) => {
				const exptContent = args[0];
				const exptPath = args[1] || args[2];

				return `export ${exptContent} from '${resolve(`${parent}/${exptPath}`).replace('node_modules/', '/').replace('svelte', '__svelte__')}'`;
			});
	}

	private async eval(result: CompileResult): Promise<RenderModuleCtx> {
		const context = createContext();
		const module = new SourceTextModule(result.js.code, { context });
		await module.link(async (specifier) => {
			if (specifier.endsWith('.svelte')) {
				const { ssr } = await this.load(resolve(`src/client/routes/${specifier}`));
				const module = new SourceTextModule(ssr.js.code, { context });

				return module;
			} else {
				return impt(specifier, context);
			}
		});

		const renderModule = new SourceTextModule(`import App from '%%component'; globalThis.component = App;`, { context });
		await renderModule.link((specifier) => (specifier === '%%component' ? module : impt(specifier, context)));
		await renderModule.evaluate();

		return module.context as RenderModuleCtx;
	}
}

