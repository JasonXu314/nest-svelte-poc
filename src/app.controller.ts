import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientService } from './client/module/client.service';

@Controller()
export class AppController {
	constructor(private readonly service: AppService, private readonly client: ClientService) {}

	@Get('/')
	public testRoute(): string {
		return this.client.renderRoute('', { initTodos: [{ id: 'asdf', title: 'Do stuff', description: 'Do stuff here lul', completed: false }] });
	}
}

