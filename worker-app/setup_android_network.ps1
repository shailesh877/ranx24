# PowerShell script to setup Android network configuration

# Create the xml directory if it doesn't exist
$xmlDir = "android\app\src\main\res\xml"
if (-not (Test-Path $xmlDir)) {
    New-Item -ItemType Directory -Path $xmlDir -Force | Out-Null
    Write-Host "Created directory: $xmlDir" -ForegroundColor Green
}

# Create network_security_config.xml
$configContent = @'
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Allow cleartext traffic for development -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    
    <!-- Specific domains that allow cleartext traffic -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">192.168.1.15</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
    </domain-config>
</network-security-config>
'@

$configPath = "$xmlDir\network_security_config.xml"
$configContent | Out-File -FilePath $configPath -Encoding UTF8
Write-Host "Created: $configPath" -ForegroundColor Green

Write-Host ""
Write-Host "Network security config created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: You need to update AndroidManifest.xml manually:" -ForegroundColor Yellow
Write-Host "Add this line inside the <application> tag:" -ForegroundColor Cyan
Write-Host '  android:networkSecurityConfig="@xml/network_security_config"' -ForegroundColor White
Write-Host ""
Write-Host "Example:" -ForegroundColor Cyan
Write-Host '<application' -ForegroundColor White
Write-Host '  android:name=".MainApplication"' -ForegroundColor White
Write-Host '  android:networkSecurityConfig="@xml/network_security_config"' -ForegroundColor Yellow
Write-Host '  ...' -ForegroundColor White
Write-Host '>' -ForegroundColor White
Write-Host ""
Write-Host "After updating, rebuild the app with:" -ForegroundColor Cyan
Write-Host "  npx expo run:android" -ForegroundColor White
