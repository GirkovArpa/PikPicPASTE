#SingleInstance, force
#NoTrayIcon

WinGet, MyNumber, Count
WinGet, MyArray, List

isNext := false

Loop %MyArray% {
  hwnd := MyArray%A_Index%
  WinGetTitle, WinTitle, ahk_id %hwnd%
  if (isNext and WinTitle != "") {
    WinActivate, ahk_id %hwnd%
    ExitApp
  }
  if (WinTitle == %1%) { 
    isNext := true
  }
}