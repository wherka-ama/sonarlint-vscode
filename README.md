# SonarLint for Visual Studio Code

SonarLint is a free IDE extension that lets you fix coding issues before they exist! Like a spell checker, SonarLint highlights Bugs and Security Vulnerabilities as you write code, with clear remediation guidance so you can fix them before the code is even committed. SonarLint in VS Code supports analysis of JavaScript, TypeScript, Python, Java, HTML & PHP code, and you can install it directly from the VS Code Marketplace!

## How it works

Simply open a JS, TS, Python, Java, HTML or PHP file, start coding, and you will start seeing issues reported by SonarLint. Issues are highlighted in your code, and also listed in the 'Problems' panel.

![sonarlint on-the-fly](images/sonarlint-vscode.gif)

You can access the detailed rule description directly from your editor, using the provided contextual menu.

![rule description](images/sonarlint-rule-description.gif)

## Static Analysis Rules

Out of the box, SonarLint automatically checks your code against the following rules:

- [JavaScript rules](https://rules.sonarsource.com/javascript)
- [TypeScript rules](https://rules.sonarsource.com/typescript)
- [Python rules](https://rules.sonarsource.com/python)
- [Java rules](https://rules.sonarsource.com/java)
- [HTML rules](https://rules.sonarsource.com/html)
- [PHP rules](https://rules.sonarsource.com/php)
- [Secrets rules](https://rules.sonarsource.com/secrets)

The full list of available rules is visible in the "SonarLint Rules" view in the explorer, where you can activate and deactivate rules to match your conventions. SonarLint will also show a code action on each issue to quickly deactivate the corresponding rule.

## Requirements

The SonarLint language server needs a Java Runtime (JRE) 11+. If one is already installed on your computer, SonarLint should automatically find and use it.

If a suitable JRE cannot be found at the usual places, SonarLint will ask for your permission to download and manage its own version.

Finally, you can explicitly set the path where the JRE is installed using the `sonarlint.ls.javaHome` variable in VS Code settings. For instance:

    {
        "sonarlint.ls.javaHome": "C:\\Program Files\\Java\\jre-11.0.11"
    }

### JS/TS analysis specific requirements

To analyze JavaScript and TypeScript code, SonarLint requires Node.js executable. It will be autodetected, or you can force the location using:

    {
        "sonarlint.pathToNodeExecutable": "/home/julien/.nvm/versions/node/v11.12.0/bin/node"
    }

### Java analysis specific requirements

To enable the support for Java analysis, you need the [Language support for Java](https://marketplace.visualstudio.com/items?itemName=redhat.java) VSCode extension (version 0.56.0 or higher). You also need to be in [standard mode](https://code.visualstudio.com/docs/java/java-project#_lightweight-mode).

### Apex analysis specific requirements

The support for Apex analysis is only available together with SonarQube Enterprise Edition or SonarCloud (see connected mode below). You also need the [Salesforce Extension Pack](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode) VSCode extension.

### PL/SQL analysis specific requirements

The support for PL/SQL analysis is only available together with SonarQube Developer Edition or SonarCloud (see connected mode below). You also need the [Oracle Developer Tools for VSCode](https://marketplace.visualstudio.com/items?itemName=Oracle.oracledevtools) extension.

## Connected mode

You can connect SonarLint to SonarQube >= 7.9 or SonarCloud and bind your workspace folders to a SonarQube/SonarCloud project to benefit from the same rules and settings that are used to inspect your project on the server. SonarLint then hides in VSCode the issues that are marked as **Won’t Fix** or **False Positive**.

Connected mode will also allow to unlock analysis of those languages:

- [Apex rules](https://rules.sonarsource.com/apex)
- [C rules](https://rules.sonarsource.com/c)
- [C++ rules](https://rules.sonarsource.com/cpp)
- [Objective C rules](https://rules.sonarsource.com/objective-c)
- [PL/SQL rules](https://rules.sonarsource.com/plsql).

The first step is to configure connection details (user token, SonarQube server URL or SonarCloud organization). For security reasons, the token should not be stored in SCM with workspace settings. That's why we suggest to configure them in VSCode user settings.

Example for SonarQube:

    {
        "sonarlint.connectedMode.connections.sonarqube": [
            { "serverUrl": "https://sonarqube.mycompany.com", "token": "<generated from SonarQube account/security page>" }
        ]
    }

Example for SonarCloud:

    {
        "sonarlint.connectedMode.connections.sonarcloud": [
            { "organizationKey": "myOrg", "token": "<generated from https://sonarcloud.io/account/security/>" }
        ]
    }

The second step is to configure the project binding, either at workspace level, or in every workspace folders. Example:

    {
        "sonarlint.connectedMode.project": {
            "projectKey": "the-project-key"
        }
    }

If you plan to use multiple connections, to different SonarQube servers and/or SonarCloud organizations, simply give a unique `connectionId` to each entry, and use them as reference in the binding.

Example:

    // In user settings
    {
        "sonarlint.connectedMode.connections.sonarqube": [
            { "connectionId": "mySonar", "serverUrl": "https://sonarqube.mycompany.com", "token": "xxx" }
        ]
        "sonarlint.connectedMode.connections.sonarcloud": [
            { "connectionId": "myOrgOnSonarCloud", "organizationKey": "myOrg", "token": "yyy" }
        ]
    }

    // In project1/.vscode/settings.json
    {
        "sonarlint.connectedMode.project": {
            "connectionId": "mySonar",
            "projectKey": "the-project-key-on-sq"
        }
    }

    // In project2/.vscode/settings.json
    {
        "sonarlint.connectedMode.project": {
            "connectionId": "myOrgOnSonarCloud",
            "projectKey": "the-project-key-on-sc"
        }
    }

Configuring a project binding at the workspace level mutes **Won’t Fix** and **False Positive** issues in any of the project's sub-folders added to the workspace.

In connected mode with SonarCloud or any commercial edition of SonarQube, SonarLint receives notifications about Quality Gate changes and new issues. This feature can be toggled using the `disableNotifications` field in a server connection definition.

When using SonarQube >= 8.6 and browsing a [security hotspot](https://docs.sonarqube.org/latest/user-guide/security-hotspots/) there will be a button offering to open the hotspot in SonarLint if you have already SonarLint running in VSCode. Limitation: this feature relies on local communication between your web browser and SonarLint, and consequently is not available in CodeSpaces.

SonarLint keeps server side data in a local storage. If you change something on the server such as the quality profile, you can trigger an update of the local storage using the "SonarLint: Update all project bindings to SonarQube/SonarCloud" command on the command palette (search for "sonarlint").

### C/C++/Objective C analysis specific configuration

CFamily sensor brings an extra requirement - the location of the compilation map produced by the [build wrapper](https://docs.sonarqube.org/latest/analysis/languages/cfamily/#header-5 "A process capturing the details of the build and storing it in the map, which in turn is used when replaying the command by the sensor."). 

Such map can be produced by a manual execution of the build wrapped with a dedicated interceptor process. However, SonarLint can also rely on a widely used [compilation database](https://clang.llvm.org/docs/JSONCompilationDatabase.html) as its input. When detected, it is automatically translated into a build wrapper format.

It is also possible to tune other parameters which are usually set in [sonar-project.properties](https://docs.sonarqube.org/latest/analysis/languages/cfamily/)

**Note**: CFamily sensors rely on the analysis executed locally. Therefore it is necessary to have a working compiler suitable for a given context. By default SonarLint will use `clang`, but it is possible to use one of the following: `msvc-cl`, `armclang`, `iar`, `armcc`, `qcc`, `texas`, `diab`. It is also possible to specify the full location of the compilation database and the environment variables passed to the build wrapper map. It is useful when `clang` or other compilers are not exposed automatically or when we want to use other version than the one available by default. 
`buildWrapperOutput` can be treated as a meta-location. In the absence of `sonar.cfamily.build-wrapper-output` it is resolved on the workspace folder level and the resulting value feeds into `sonar.cfamily.build-wrapper-output` which is mandatory for CFamily sensors.
It's also worth stressing that only `${workspaceFolder}` gets expanded. No other variable will be taken into account at this stage.

Example:

    // In .vscode/settings.json    
    {        
        "sonarlint.analyzerProperties": {
            "sonar.cfamily.build-wrapper-output": "${workspaceFolder}/cfamily-compilation-database",
            "sonar.cfamily.cache.enabled": "true",
            "sonar.cfamily.cache.path": "${workspaceFolder}/.sonar-cache",
            "sonar.cfamily.log.level": "DEBUG",
            "sonar.log.level": "DEBUG",
        },
        "sonarlint.cfamily":{
            "compilationDataBase": "${workspaceFolder}/compile_commands.json",
            "buildWrapperCompiler": "clang",
            "buildWrapperEnv": ["PATH=/home/me/bin"],
            "buildWrapperOutput": "${workspaceFolder}/cfamily-compilation-database"
        }
    }

## Contributions

If you would like to see a new feature, please create a new thread in the forum ["Suggest new features"](https://community.sonarsource.com/c/suggestions/features).

Please be aware that we are not actively looking for feature contributions. The truth is that it's extremely difficult for someone outside SonarSource to comply with our roadmap and expectations. Therefore, we typically only accept minor cosmetic changes and typo fixes.

With that in mind, if you would like to submit a code contribution, please create a pull request for this repository. Please explain your motives to contribute this change: what problem you are trying to fix, what improvement you are trying to make.

Make sure that you follow our [code style](https://github.com/SonarSource/sonar-developer-toolset#code-style) and all tests are passing.

## Have Question or Feedback?

For SonarLint support questions ("How do I?", "I got this error, why?", ...), please first read the [FAQ](https://community.sonarsource.com/t/frequently-asked-questions/7204) and then head to the [SonarSource forum](https://community.sonarsource.com/c/help/sl). There are chances that a question similar to yours has already been answered.

Be aware that this forum is a community, so the standard pleasantries ("Hi", "Thanks", ...) are expected. And if you don't get an answer to your thread, you should sit on your hands for at least three days before bumping it. Operators are not standing by. :-)

Issue tracker (readonly): https://jira.sonarsource.com/browse/SLVSCODE

## License

Copyright 2017-2021 SonarSource.

Licensed under the [GNU Lesser General Public License, Version 3.0](http://www.gnu.org/licenses/lgpl.txt)

## Data and telemetry

This extension collects anonymous usage data and sends it to SonarSource to help improve SonarLint functionality.  No source code nor IP address is collected, and SonarSource does not share the data with anyone else. Collection of telemetry is controlled via the setting: `sonarlint.disableTelemetry`. Click [here](telemetry-sample.md) to see a sample of the data that are collected.
