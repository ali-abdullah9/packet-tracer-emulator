// IP address validation
export function isValidIPAddress(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

// Subnet mask validation
export function isValidSubnetMask(mask: string): boolean {
  if (!isValidIPAddress(mask)) return false;
  
  const parts = mask.split('.').map(part => parseInt(part, 10));
  const binary = parts.map(part => part.toString(2).padStart(8, '0')).join('');
  
  // Check if it's a valid subnet mask (all 1s followed by all 0s)
  const firstZero = binary.indexOf('0');
  if (firstZero === -1) return true; // All 1s is valid (255.255.255.255)
  
  return binary.substring(firstZero).indexOf('1') === -1;
}

// Check if two IPs are in the same subnet
export function areInSameSubnet(ip1: string, ip2: string, subnetMask: string): boolean {
  if (!isValidIPAddress(ip1) || !isValidIPAddress(ip2) || !isValidSubnetMask(subnetMask)) {
    return false;
  }

  const ipToBinary = (ip: string): string => {
    return ip.split('.').map(part => parseInt(part, 10).toString(2).padStart(8, '0')).join('');
  };

  const ip1Binary = ipToBinary(ip1);
  const ip2Binary = ipToBinary(ip2);
  const maskBinary = ipToBinary(subnetMask);

  for (let i = 0; i < 32; i++) {
    if (maskBinary[i] === '1' && ip1Binary[i] !== ip2Binary[i]) {
      return false;
    }
  }

  return true;
}

// Generate default interface names based on device type
export function generateInterfaceName(deviceType: string, index: number): string {
  switch (deviceType) {
    case 'router':
      return `GigabitEthernet0/${index}`;
    case 'switch':
      return `FastEthernet0/${index}`;
    case 'pc':
    case 'server':
      return `Ethernet${index}`;
    default:
      return `Interface${index}`;
  }
}

// Device configuration templates
export function getDefaultDeviceConfig(deviceType: string) {
  const baseConfig = {
    hostname: `${deviceType}-${Math.random().toString(36).substr(2, 6)}`,
    interfaces: {},
    routingTable: []
  };

  switch (deviceType) {
    case 'router':
      return {
        ...baseConfig,
        enablePassword: 'cisco',
        routingTable: [
          {
            destination: '0.0.0.0',
            netmask: '0.0.0.0',
            gateway: '192.168.1.1',
            interface: 'GigabitEthernet0/0'
          }
        ]
      };
    
    case 'switch':
      return {
        ...baseConfig,
        vlans: [
          { id: 1, name: 'default', ports: [] }
        ]
      };
    
    case 'pc':
    case 'server':
      return {
        ...baseConfig,
        services: deviceType === 'server' ? [
          { type: 'web', enabled: false, config: { port: 80 } },
          { type: 'dns', enabled: false, config: { port: 53 } }
        ] : []
      };
    
    default:
      return baseConfig;
  }
}

// Validate device configuration
export function validateDeviceConfiguration(config: any, deviceType: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate hostname
  if (config.hostname && !/^[a-zA-Z0-9-_]+$/.test(config.hostname)) {
    errors.push('Hostname contains invalid characters');
  }

  // Validate IP addresses in interfaces
  if (config.interfaces) {
    Object.values(config.interfaces).forEach((iface: any, index) => {
      if (iface.ipAddress && !isValidIPAddress(iface.ipAddress)) {
        errors.push(`Invalid IP address in interface ${index}`);
      }
      if (iface.subnetMask && !isValidSubnetMask(iface.subnetMask)) {
        errors.push(`Invalid subnet mask in interface ${index}`);
      }
    });
  }

  // Validate routing table
  if (config.routingTable) {
    config.routingTable.forEach((route: any, index: number) => {
      if (!isValidIPAddress(route.destination) && route.destination !== '0.0.0.0') {
        errors.push(`Invalid destination in route ${index}`);
      }
      if (!isValidSubnetMask(route.netmask)) {
        errors.push(`Invalid netmask in route ${index}`);
      }
      if (!isValidIPAddress(route.gateway)) {
        errors.push(`Invalid gateway in route ${index}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
