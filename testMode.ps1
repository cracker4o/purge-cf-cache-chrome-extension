param (
    [Parameter(Mandatory=$true)]
    [bool]$init
)

if ($init) {
    Copy-Item -Path '.\src\chrome\manifest.json' -Destination '.\src\' -Force
} else {
    if (Test-Path '.\src\manifest.json') {
        Remove-Item -Path '.\src\manifest.json' -Force
    }
}