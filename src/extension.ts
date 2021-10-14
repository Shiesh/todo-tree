// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DataProvider } from './DataProvider';
import { ListItem, ToDoGroup, TodoItem } from './TodoItem';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const dataProvider = new DataProvider([]);

	vscode.window.registerTreeDataProvider(
		'todo',
		dataProvider
	);

	const tree = vscode.window.createTreeView('todo', {
		treeDataProvider: dataProvider
	});

	context.subscriptions.push(vscode.commands.registerCommand('todo-tree.complete-entry', (node : ListItem) => {
		node.setCompleted();
		updateTree();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todo-tree.remove-entry', (node : ListItem) => {
		node.removeEntry(node);
		updateTree();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todo-tree.add-entry', async (node : ListItem) => {
		
		const type = await vscode.window.showQuickPick(["Entry", "Group"], 
			{canPickMany : false, 
			placeHolder : 'select a type of entry to add:'
		});

		const label = await vscode.window.showInputBox({
			ignoreFocusOut : true,
			placeHolder : "Enter a label name:"
		});
		if(typeof label === "undefined"){
			return;
		}

		if(node === undefined){
			if (type === 'Entry'){
				dataProvider.addChild(new TodoItem(label, dataProvider));
			}else{
				dataProvider.addChild(new ToDoGroup(label, [], dataProvider));
			}
		} else {
			if (type === 'Entry'){
				node.addChild(new TodoItem(label, node));
			}else{
				node.addChild(new ToDoGroup(label, [], node));

			}
		}
		updateTree();
		
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todo-tree.refreshEntry', () => dataProvider.refresh() ));
	
	const updateTree = () => {

		vscode.commands.executeCommand('todo-tree.refreshEntry');
		dataProvider.writeFile();

	};
}


// this method is called when your extension is deactivated
export function deactivate() {}
