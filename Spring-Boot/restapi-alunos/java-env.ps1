# Ative com: . .\java-env.ps1
$projectJdk = Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot '.tools\java17') -Directory |
    Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'bin\javac.exe') } |
    Select-Object -First 1
if (-not $projectJdk) {
    throw 'JDK portatil nao encontrado em .tools\java17.'
}
$env:JAVA_HOME = $projectJdk.FullName
if (($env:Path -split ';') -notcontains "$env:JAVA_HOME\bin") {
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
}
Write-Host "JAVA_HOME: $env:JAVA_HOME"
