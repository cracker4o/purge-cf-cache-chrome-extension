param (
    [Parameter(Mandatory=$true)]
    [string]$destination,

    [Parameter(Mandatory=$true)]
    [string]$browser
)

Write-Output "Compressing the cf-purge extension"

if(Test-Path $destination){
    Remove-Item -Recurse -Force "$destination"
}

mkdir "$destination"
mkdir "$destination\temp"

Copy-Item -path ".\src\*" -include "*.js","*.css", "*.html", "*.png" -Destination "$destination\temp"
Copy-Item -path ".\src\$browser\*" -Recurse -Destination "$destination\temp"

&7z a -r -y "$browser.zip" "$destination\temp\*"

Remove-Item "$destination" -Recurse -Force -Verbose