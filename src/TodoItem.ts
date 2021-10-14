import * as vscode from 'vscode';
import { DataProvider } from './DataProvider';

export abstract class ListItem extends vscode.TreeItem {

	constructor (
		public readonly label: string,
		public readonly collapsibleState : vscode.TreeItemCollapsibleState,
		protected completed : boolean,
		protected children : ListItem[],
		protected parent : ListItem | DataProvider
	) {
		super(label, collapsibleState);
	}

	public abstract addChild(child : ListItem) : void;
	abstract removeEntry(child : ListItem) : void;
	public abstract setCompleted() : void;

	removeChild(child : ListItem){
		this.children.splice(this.children.indexOf(child), 1);
	}

	getChildren() : ListItem[] {
		return this.children;
	}

	public getCompleted() : boolean {
		return this.completed;
	}

	
}

export class TodoItem extends ListItem {
	
	constructor (
		label: string,
		parent : ListItem | DataProvider
	) {
		super(label, vscode.TreeItemCollapsibleState.None, false, [], parent);
	}
		
	addChild(child: ListItem): void {
		return;
	}

	removeEntry(child: ListItem): void {
		this.parent.removeChild(this);
	}

	setCompleted() : void {
		this.completed = !this.completed;
		if (this.completed){
			this.iconPath = new vscode.ThemeIcon("check",new vscode.ThemeColor("charts.green"));
		} else {
			this.iconPath = new vscode.ThemeIcon("circle-large-outline",new vscode.ThemeColor("charts.orange"));
		}
	}

	iconPath = new vscode.ThemeIcon("circle-large-outline",new vscode.ThemeColor("charts.orange"));
	contextValue = 'entry';
	
}

export class ToDoGroup extends ListItem {

	constructor (
		label : string,
		children : ListItem[],
		parent : ListItem | DataProvider
	) {
		super(label, vscode.TreeItemCollapsibleState.Collapsed, true, children, parent);
	}

	addChild(child: ListItem): void {
		this.children.push(child);
		vscode.commands.executeCommand('todo-tree.refreshEntry');
	}

	removeEntry(child: ListItem): void {
		this.parent.removeChild(this);
	}

	setCompleted(): void {
		this.completed = !this.completed;		
	}

	contextValue = 'group';

	iconPath = new vscode.ThemeIcon("folder");

}