/* --------------------------------------------------------------------------------------------
 * SonarLint for VisualStudio Code
 * Copyright (C) 2017-2021 SonarSource SA
 * sonarlint@sonarsource.com
 * Licensed under the LGPLv3 License. See LICENSE.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import * as vscode from 'vscode';
import { API, GitExtension, Repository } from './git';
import { SonarLintExtendedLanguageClient } from './client';
import { logToSonarLintOutput } from './extension';

const GIT_EXTENSION_ID = 'vscode.git';
const GIT_API_VERSION = 1;

interface Scm extends vscode.Disposable {
  getBranchForFolder(folderUri: vscode.Uri): string|null;
}

class NoopScm implements Scm {

  getBranchForFolder(folderUri: vscode.Uri) {
    return null;
  }

  dispose() {
    // NOP
  }
}

class GitScm implements Scm {

  private readonly listeners: Array<vscode.Disposable>;

  constructor(private readonly gitApi: API, private readonly client: SonarLintExtendedLanguageClient) {
    this.listeners = [
      gitApi.onDidOpenRepository(r => {
        this.subscribeToRepositoryChanges(r);
      })
    ];
    if (gitApi.state === 'initialized') {
      this.subscribeToAllRepositoryChanges();
    } else {
      gitApi.onDidChangeState(state => {
        if(state === 'initialized') {
          this.subscribeToAllRepositoryChanges();
        }
      });
    }
  }

  getBranchForFolder(folderUri: vscode.Uri) {
    return this.gitApi.getRepository(folderUri).state.HEAD?.name;
  }

  private subscribeToAllRepositoryChanges() {
    this.gitApi.repositories.forEach(this.subscribeToRepositoryChanges, this);
    vscode.workspace.workspaceFolders.forEach(folder => {
      const branchName = this.gitApi.getRepository(folder.uri)?.state.HEAD?.name;
      logToSonarLintOutput(`Initializing ${folder.uri} on branch ${branchName}`);
      this.client.didLocalBranchNameChange(folder.uri, branchName);
    });
  }

  private subscribeToRepositoryChanges(repository: Repository) {
    this.listeners.push(repository.state.onDidChange(() => {
      vscode.workspace.workspaceFolders.forEach(folder => {
        if (folder.uri.toString().startsWith(repository.rootUri.toString())) {
          const branchName = repository.state.HEAD?.name;
          logToSonarLintOutput(`Folder ${folder.uri} is now on branch ${branchName}`);
          this.client.didLocalBranchNameChange(folder.uri, branchName);
        }
      });
    }));
  }

  dispose() {
    this.listeners.forEach(d => {
      try {
        d.dispose();
      } catch (e) {
        // Ignored during dispose
      }
    });
  }
}

export function initScm(client: SonarLintExtendedLanguageClient) {
  try {
    const gitApi = vscode.extensions.getExtension<GitExtension>(GIT_EXTENSION_ID).exports?.getAPI(GIT_API_VERSION);
    return new GitScm(gitApi, client);
  } catch(e) {
    logToSonarLintOutput(`Exception occurred while initializing the Git API: ${e}`);
    return new NoopScm();
  }
}

