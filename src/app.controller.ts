import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly service: AppService) {}

	@Get('/')
	public async index(): Promise<string> {
		return this.service.render('index');
	}

	@Get('/favicon.ico')
	public noop(): never {
		throw new NotFoundException();
	}

	@Get('/:path')
	public async get(@Param('path') path: string): Promise<string> {
		return this.service.render(path);
	}
}

