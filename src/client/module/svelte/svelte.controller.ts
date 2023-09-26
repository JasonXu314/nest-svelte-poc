import { Controller, Get, Header, Param } from '@nestjs/common';
import { SvelteService } from './svelte.service';

@Controller('/__svelte__')
export class SvelteController {
	constructor(private readonly service: SvelteService) {}

	@Get('/:path(*)')
	@Header('content-type', 'text/javascript')
	public async sveltePackage(@Param('path') path: string): Promise<string> {
		return this.service.loadSvelteInternal(path);
	}
}

