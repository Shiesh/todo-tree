import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ListItem, ToDoGroup, TodoItem } from './TodoItem';

export class DataProvider implements vscode.TreeDataProvider<ListItem>{

	private list : ListItem[] = [];
	private root : string | undefined;

	getTreeItem(element: TodoItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: TodoItem): Thenable<ListItem[]> {

		if (!element) {

			// return the list itself
			return Promise.resolve(this.list);

		} else {

			//return children of a folder
			return Promise.resolve(element.getChildren());

		}

		
	}

	public removeChild(entry : ListItem){
		const i = this.list.indexOf(entry);
		if (i > -1){
			this.list.splice(i, 1)
		}
	}

	public addChild(entry : ListItem) {
		this.list.push(entry);
		vscode.commands.executeCommand('todo-tree.refreshEntry');
	}

	private _onDidChangeTreeData: vscode.EventEmitter<ListItem | undefined | null | void> = new vscode.EventEmitter<ListItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<ListItem | undefined | null | void> = this._onDidChangeTreeData.event;
  
	refresh(): void {
		this._onDidChangeTreeData.fire();
		this.writeFile();
	}

	public readFile(){

		if (this.root === undefined){
			return;
		}

		this.list = [];

		const file = path.join(this.root, 'Todo.json');

		if (fs.existsSync(file)){
			var json = JSON.parse(fs.readFileSync(file,  'utf-8'));
			this.parseEntries(json.entries, this);
		}

		vscode.commands.executeCommand('todo-tree.refreshEntry');
	}

	parseEntries(entries : any[], parent : ListItem | DataProvider){

		entries.forEach(element => {
			if (element.type === 'group') {

				var node = new ToDoGroup(element.label, [], parent);
				parent.addChild(node);
				this.parseEntries(element.children, node);

			}else if (element.type === 'entry') {

				var node = new TodoItem(element.label, parent);
				if (element.completed) {node.setCompleted();}
				parent.addChild(node);

			}
		});

	}

	writeFile() {

		if(this.root === undefined){
			return;
		}

		var json : object = {
			"verion" : "0.0.1",
			"entries" : this.serializeEntries(this.list)
		};

		var data = JSON.stringify(json);
		fs.writeFileSync(path.join(this.root, 'Todo.json'), data);
		

	}

	serializeEntries(entries : ListItem[]) : object[]{

		var objects : object[] = [];

		entries.forEach(element => {
			objects.push({

				'type' : element.contextValue,
				'label' : element.label,
				'completed' : element.getCompleted(),
				'children' : element.getChildren().length > 0 ? this.serializeEntries(element.getChildren()) : []

			});
		});

		return objects;

	}

	constructor (
		items : ListItem[]
	) {
		this.list = items;
		this.root = vscode.workspace.rootPath;
		this.readFile();
	}

}