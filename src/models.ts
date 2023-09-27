import { IsBoolean, IsString } from 'class-validator';
import { fi } from './utils/utils';

export interface Todo {
	id: string;
	title: string;
	description: string;
	completed: boolean;
}

export class CreateTodoDTO {
	@IsString()
	title: string = fi();

	@IsString()
	description: string = fi();

	@IsBoolean()
	completed: boolean = fi();
}

