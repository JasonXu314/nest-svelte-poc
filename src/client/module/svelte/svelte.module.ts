import { Module } from '@nestjs/common';
import { SvelteController } from './svelte.controller';
import { SvelteService } from './svelte.service';

@Module({
	imports: [],
	controllers: [SvelteController],
	providers: [SvelteService],
	exports: [SvelteService]
})
export class SvelteModule {}

