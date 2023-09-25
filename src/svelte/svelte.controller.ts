import { Controller, Get, Header, Param } from '@nestjs/common';
import { SvelteService } from './svelte.service';

@Controller('/svelte')
export class SvelteController {
	constructor(private readonly service: SvelteService) {}

	@Get('*')
	@Header('content-type', 'text/javascript')
	public async sveltePackage(@Param() { 0: path }: { 0: string }): Promise<string> {
		return this.service.loadSvelte(path);
	}
}

