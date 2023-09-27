import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateTodoDTO, Todo } from './models';

@Injectable()
export class AppService {
	private _todos: Todo[] = [];

	public constructor() {}

	public getTodos(): Todo[] {
		return this._todos;
	}

	public createTodo({ completed, description, title }: CreateTodoDTO): Todo {
		const newTodo: Todo = {
			id: randomUUID(),
			description,
			completed,
			title
		};

		this._todos.push(newTodo);

		return newTodo;
	}
}

