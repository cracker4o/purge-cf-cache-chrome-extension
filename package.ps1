param (
    [Parameter(Mandatory=$true)]
    [string]$source,

    [Parameter(Mandatory=$true)]
    [string]$destination
)

Write-Output "Compressing the cf-purge extension"

if(Test-Path $destination){
    Remove-Item -Recurse -Force "$destination"
}

&7z a -r -y $destination $source\*