; itsLARP Custom NSIS Installer & Uninstaller Script
; Automates process termination and silent uninstallation of older versions

!macro customInit
  ; 1. Terminate any running itsLARP processes to eliminate file locking
  nsExec::Exec 'taskkill /F /T /IM itsLARP.exe'
  nsExec::Exec 'taskkill /F /T /IM itslarp.exe'
  nsExec::Exec 'taskkill /F /T /IM itslarp-desktop.exe'
  Sleep 600

  ; 2. Check if a previous installation exists in HKCU (per-user) or HKLM (per-machine)
  ReadRegStr $R0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\425a623f-3f39-5835-93b6-16cbd4e016c0" "QuietUninstallString"
  ${If} $R0 == ""
    ReadRegStr $R0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\425a623f-3f39-5835-93b6-16cbd4e016c0" "UninstallString"
    ${If} $R0 != ""
      StrCpy $R0 '$R0 /S'
    ${EndIf}
  ${EndIf}

  ${If} $R0 == ""
    ReadRegStr $R0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\425a623f-3f39-5835-93b6-16cbd4e016c0" "QuietUninstallString"
  ${EndIf}

  ${If} $R0 != ""
    DetailPrint "Silently removing previous version of itsLARP..."
    ExecWait '$R0 _?=$LOCALAPPDATA\Programs\itslarp-desktop'
    Sleep 1000
  ${Else}
    ; Fallback: check filesystem directly for existing uninstaller
    ${If} ${FileExists} "$LOCALAPPDATA\Programs\itslarp-desktop\Uninstall itsLARP.exe"
      DetailPrint "Found existing uninstaller at target directory, running silent removal..."
      ExecWait '"$LOCALAPPDATA\Programs\itslarp-desktop\Uninstall itsLARP.exe" /currentuser /S _?=$LOCALAPPDATA\Programs\itslarp-desktop'
      Sleep 1000
    ${EndIf}
  ${EndIf}
!macroend

!macro customCheckAppRunning
  ; Guarantee any lingering itsLARP processes are terminated to prevent the Retry dialog
  nsExec::Exec 'taskkill /F /T /IM itsLARP.exe'
  nsExec::Exec 'taskkill /F /T /IM itslarp.exe'
  nsExec::Exec 'taskkill /F /T /IM itslarp-desktop.exe'
  Sleep 400
!macroend

!macro customUnInit
  ; Ensure all itsLARP processes are cleanly closed before uninstallation starts
  nsExec::Exec 'taskkill /F /T /IM itsLARP.exe'
  nsExec::Exec 'taskkill /F /T /IM itslarp.exe'
  nsExec::Exec 'taskkill /F /T /IM itslarp-desktop.exe'
  Sleep 400
!macroend
