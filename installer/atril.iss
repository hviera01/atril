#define MyAppName "Atril"
#ifndef MyAppVersion
#define MyAppVersion "1.0.0"
#endif
#define MyAppExe "Atril.exe"

[Setup]
AppId={{B7E2C1A4-5D3F-4C8E-9A61-2F0D7E4B8C13}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher=Iglesia Lirio de los Valles - AD
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=..\instalador
OutputBaseFilename=Atril-Setup-{#MyAppVersion}
SetupIconFile=..\build\icon.ico
UninstallDisplayIcon={app}\{#MyAppExe}
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
CloseApplications=yes
RestartApplications=no
VersionInfoVersion={#MyAppVersion}.0
VersionInfoProductName={#MyAppName}
VersionInfoDescription=Instalador de {#MyAppName} {#MyAppVersion}

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "Crear un acceso directo en el Escritorio"; GroupDescription: "Accesos directos:"

[Files]
Source: "..\dist\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExe}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExe}"; Description: "Abrir Atril"; Flags: nowait postinstall skipifsilent
Filename: "{app}\{#MyAppExe}"; Flags: nowait; Check: WizardSilent
