sync.jats = sync.jats || {};

goog.events.listen(workspace, sync.api.Workspace.EventType.EDITOR_LOADED,
		function(e) {
			var editor = e.editor;
			editor.getActionsManager().registerAction('insert.fragment',
					new sync.jats.InsertFragmentAction(editor));
			sync.jats.InsertFragmentAction.addToJatsToolbar(editor,
					'insert.fragment');

		});

sync.jats.InsertReferencesDialog = function() {
	this.dialog = /** @type {sync.api.Dialog} */ null;
};

sync.jats.InsertReferencesDialog.prototype.designInsertDialog = function() {

	this.dialog = workspace.createDialog();
	this.dialog.setTitle('Insert');
	this.dialog.setContentPreferredSize(500, 500);
	this.dialog.show();
	var InsertDialogHTML = document
			.getElementsByClassName("modal-dialog-inner-content");
	var textArea = document.createElement("TEXTAREA");
	textArea.id = "textArea";
	textArea.scrollTop = textArea.scrollHeight;

	textArea.setAttribute('cols', 59);
	textArea.setAttribute('rows', 20);
	this.dialog.getElement().appendChild(textArea);
}

sync.jats.InsertReferencesDialog.prototype.getFragment = function() {
	return document.getElementById("textArea").value;
}
sync.jats.InsertReferencesDialog.prototype.getUsername = function() {
	return localStorage.getItem('username');
}
sync.jats.InsertReferencesDialog.prototype.getPassword = function() {
	return localStorage.getItem('password');
}


sync.jats.UserAndPasswordDialog = function() {
	this.dialog = /** @type {sync.api.Dialog} */ null;
	this.errorMessage = /** @type {String} */ "";
};

sync.jats.UserAndPasswordDialog.prototype.getUsername = function() {
	return document.getElementById("userName").value;
}
sync.jats.UserAndPasswordDialog.prototype.getPassword = function() {
	return document.getElementById("password").value;
}

sync.api.Dialog.prototype.clear = function() {
	this.getElement().remove(this.getElement().children);
}

sync.jats.UserAndPasswordDialog.prototype.designLogInDialog = function() {

	this.dialog = workspace.createDialog();
	this.dialog.setTitle('LogIn');
	this.dialog.setContentPreferredSize(500, 500);
	this.dialog.show();

	var logInDialogHTML = document
			.getElementsByClassName("modal-dialog-inner-content");
	var divDescription = document.createElement("DIV");
	divDescription.id = "div";
	var nodeDescription1 = document
			.createTextNode("Edifix is an online bibliographic reference solution for publishers, service providers, editors, and authors.This platform writes reference lists in XML format. ");
	divDescription.appendChild(nodeDescription1);
	var breakLine = document.createElement("BR");
	divDescription.appendChild(breakLine);

	var nodeDescription2 = document
			.createTextNode("Please enter your username and your password, and if you don't have an account or if you want to read more about Edifix you can access this link: ");
	divDescription.appendChild(nodeDescription2);

	var textArea = document.createElement("TEXTAREA");
	
	var pLink = document.createElement("P");
	var divLink = document.createElement("A");
	var nodeDescriptionLink = document.createTextNode("https://edifix.com/api_doc");
	divLink.appendChild(nodeDescriptionLink);
	divLink.setAttribute("href", "https://edifix.com/api_doc");
	divLink.setAttribute("target", "_blank");
	pLink.appendChild(divLink);
	divDescription.appendChild(pLink);

	var divUserName = document.createElement("DIV");
	divUserName.id = "div";
	var nodeUserName = document.createTextNode("Username : ");
	divUserName.appendChild(breakLine);
	divUserName.appendChild(nodeUserName);
	var userName = document.createElement("INPUT");
	userName.id = "userName";
	userName.setAttribute('maxlength', 40);
	userName.setAttribute('size', 18);
	userName.setAttribute('value', 'Username');
	userName.setAttribute('name', "myUserName");
	userName.value = localStorage.getItem('username');

	var divPassword = document.createElement("DIV");
	divPassword.id = "div";
	var nodePassword = document.createTextNode("Password : ");
	divPassword.appendChild(nodePassword);
	var password = document.createElement("INPUT");
	password.id = "password";
	password.setAttribute('type', 'password');
	password.setAttribute('maxlength', 20);
	password.setAttribute('size', 18);
	password.setAttribute('name', "myPassword");
	password.value = localStorage.getItem('password');
	
	var divErrorMessage = document.createElement("DIV");
	divErrorMessage.id = "div";
	var fontErrorMessage = document.createElement("FONT");
	fontErrorMessage.id = "font";
	var nodeDescriptionError = document
	.createTextNode(this.errorMessage);
	divErrorMessage.appendChild(fontErrorMessage);
	fontErrorMessage.appendChild(nodeDescriptionError);
	fontErrorMessage.setAttribute("color", "red");

	this.dialog.getElement().appendChild(divDescription);
	this.dialog.getElement().appendChild(divLink);
	this.dialog.getElement().appendChild(divUserName);
	divUserName.appendChild(userName);
	this.dialog.getElement().appendChild(divPassword);
	divPassword.appendChild(password);
	this.dialog.getElement().appendChild(divErrorMessage);
}

sync.jats.InsertFragmentAction = function(editor) {
	sync.actions.AbstractAction.call(this);
	this.editor = editor;
	this.logInDialog = /** @type {sync.jats.UserAndPasswordDialog} */ new sync.jats.UserAndPasswordDialog;
	this.insertDialog = /** @type {sync.jats.InsertReferencesDialog} */ new sync.jats.InsertReferencesDialog;
};

goog.inherits(sync.jats.InsertFragmentAction, sync.actions.AbstractAction);
sync.jats.InsertFragmentAction.prototype.getDisplayName = function() {
	return 'Insert Dialog';
};

sync.jats.InsertFragmentAction.prototype.actionPerformed = function(editor,
		callback) {
	this.logInDialog.designLogInDialog();
	this.logInDialog.dialog.onSelect(function(choosenValue) {
		
		if ("ok" === choosenValue) {
			var username = this.logInDialog.getUsername();
			var password = this.logInDialog.getPassword();
			this.logInDialog.dialog.clear();
			this.editor.getActionsManager().invokeOperation(
					'com.oxygen.jats.EdifixInsertReferencesOperation', {
						Username : username,
						Password : password
					}, this.checkError.bind(this, username, password));
			
		} else if ("cancel" === choosenValue) {
			this.logInDialog.errorMessage = " ";
			this.logInDialog.dialog.clear();
		}
		
	
	}.bind(this));
};
	
sync.jats.InsertFragmentAction.saveInLocalStorage = function(username, password) {
	localStorage.setItem('username', username);
	localStorage.setItem('password', password);
}

sync.jats.InsertFragmentAction.prototype.checkError = function(username, password, err) {
	var firstEditor = this.editor;
	if (err) {
		this.logInDialog.errorMessage = "You have entered an invalid username or password.";
		this.actionPerformed(firstEditor);
	} else {
		this.logInDialog.errorMessage = " ";
		sync.jats.InsertFragmentAction.saveInLocalStorage(username, password);
		this.insertReferences(firstEditor);
	}
}

sync.jats.InsertFragmentAction.prototype.insertReferences = function(editor) {
	var insertDialog = new sync.jats.InsertReferencesDialog();
	insertDialog.designInsertDialog();
	insertDialog.dialog.onSelect(function(choosenValue) {
		var username = insertDialog.getUsername();
		var password = insertDialog.getPassword();
		var fragment = insertDialog.getFragment();
		if (document.getElementById("textArea").value != null) {
			editor.getActionsManager().invokeOperation(
					'com.oxygen.jats.EdifixInsertReferencesOperation',
					{
						Username : username,
						Password : password,
						Fragment : fragment
					});
		}
	}.bind(this));
}

sync.jats.InsertFragmentAction.addToJatsToolbar = function(editor, actionId) {
	goog.events.listen(editor, sync.api.Editor.EventTypes.ACTIONS_LOADED,
		function(e) {
			var actionsConfig = e.actionsConfiguration;

			var jatsToolbar = null;
			if (actionsConfig.toolbars) {
				for (var i = 0; i < actionsConfig.toolbars.length; i++) {
					var toolbar = actionsConfig.toolbars[i];
					if (toolbar.name == "JATSKit") {
						jatsToolbar = toolbar;
					}
				}
			}

			if (jatsToolbar) {
				jatsToolbar.children.push({
					id : actionId,
					type : "action",
					iconDom: sync.util.renderLargeIcon(sync.ext.Registry.extensionURL + sync.util.computeHdpiIcon('img/DitaMapViewMode24.png'))
				});
			}
			//document.getElementById(":1m").setAttribute("color", "red");
		});
}