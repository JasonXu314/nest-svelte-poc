import { Controller, Get, Header, Param } from '@nestjs/common';
import { resolve } from 'src/utils/utils';
import { SvelteService } from './svelte.service';

@Controller('/__svelte__')
export class SvelteController {
	constructor(private readonly service: SvelteService) {}

	@Get('/components/:component(*+)')
	@Header('content-type', 'text/javascript')
	public async svelteComponent(@Param('component') component: string): Promise<string> {
		const { dom } = await this.service.load(`components/${component}`);

		return dom.js.code.replace(/import (.+) from (?:'(.+).svelte'|"(.+).svelte")/g, (_, ...args) => {
			const imptContent = args[0];
			const imptPath = args[1] || args[2];

			return `import ${imptContent} from '/__svelte__/${resolve(`${imptPath}`)}.svelte'`;
		});
	}

	@Get('*')
	@Header('content-type', 'text/javascript')
	public async sveltePackage(@Param() { 0: path }: { 0: string }): Promise<string> {
		return this.service.loadSvelteInternal(path);
	}
}

