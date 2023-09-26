import { Controller, Get, Header, NotFoundException, Param } from '@nestjs/common';
import { ClientService } from './client.service';

@Controller()
export class ClientController {
	constructor(private readonly service: ClientService) {}

	@Get('/favicon.ico')
	public noop(): never {
		throw new NotFoundException();
	}

	@Get('/__client__/components/:component(\\w*).svelte')
	@Header('content-type', 'text/javascript')
	public getComponent(@Param('component') component: string): string {
		return this.service.loadComponent(component);
	}

	@Get('/((?!__svelte__/|__client__/):route(*))')
	@Header('content-type', 'text/html')
	public getRoute(@Param('route') route: string): string {
		return this.service.renderRoute(route);
	}
}

