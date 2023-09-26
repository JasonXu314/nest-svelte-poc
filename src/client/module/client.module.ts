import { Module } from '@nestjs/common';
import { SvelteModule } from 'src/client/module/svelte/svelte.module';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';

@Module({
	imports: [SvelteModule],
	controllers: [ClientController],
	providers: [ClientService],
	exports: [ClientService]
})
export class ClientModule {}

