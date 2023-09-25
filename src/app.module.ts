import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SvelteModule } from './svelte/svelte.module';

@Module({
	imports: [SvelteModule],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}

