#!/bin/bash

# Create the xml directory if it doesn't exist
mkdir -p android/app/src/main/res/xml

# Create network_security_config.xml
cat > android/app/src/main/res/xml/network_security_config.xml << 'EOF'
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
EOF

echo "Network security config created successfully!"
echo ""
echo "Now you need to update AndroidManifest.xml:"
echo "Add this line inside the <application> tag:"
echo '  android:networkSecurityConfig="@xml/network_security_config"'
echo ""
echo "Example:"
echo '<application'
echo '  android:name=".MainApplication"'
echo '  android:networkSecurityConfig="@xml/network_security_config"'
echo '  ...'
echo '>'
