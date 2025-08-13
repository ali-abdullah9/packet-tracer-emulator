import Joi from 'joi';

export const createDeviceSchema = Joi.object({
  type: Joi.string().valid('router', 'switch', 'pc', 'server').required(),
  name: Joi.string().min(1).max(50).required(),
  position: Joi.object({
    x: Joi.number().required(),
    y: Joi.number().required()
  }).required(),
  interfaces: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      ipAddress: Joi.string().ip().optional(),
      subnetMask: Joi.string().ip().optional(),
      status: Joi.string().valid('up', 'down').default('down')
    })
  ).default([]),
  config: Joi.object({
    hostname: Joi.string().optional(),
    enablePassword: Joi.string().optional(),
    interfaces: Joi.object().pattern(
      Joi.string(),
      Joi.object({
        ipAddress: Joi.string().ip().optional(),
        subnetMask: Joi.string().ip().optional(),
        enabled: Joi.boolean().default(true),
        vlan: Joi.number().optional(),
        mode: Joi.string().valid('access', 'trunk').optional()
      })
    ).optional(),
    routingTable: Joi.array().items(
      Joi.object({
        destination: Joi.string().required(),
        netmask: Joi.string().required(),
        gateway: Joi.string().required(),
        interface: Joi.string().required()
      })
    ).optional()
  }).optional()
});

export const updateDeviceSchema = createDeviceSchema.fork(['type', 'name', 'position'], (schema) => schema.optional());

export const createConnectionSchema = Joi.object({
  source: Joi.string().required(),
  target: Joi.string().required(),
  sourceInterface: Joi.string().required(),
  targetInterface: Joi.string().required()
});

export const createNetworkSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  devices: Joi.array().items(Joi.string()).default([]),
  connections: Joi.array().items(Joi.string()).default([])
});

export const updateNetworkSchema = createNetworkSchema.fork(['name'], (schema) => schema.optional());

export const sendPacketSchema = Joi.object({
  source: Joi.string().required(),
  destination: Joi.string().required(),
  protocol: Joi.string().valid('ICMP', 'TCP', 'UDP', 'ARP', 'DNS').required(),
  payload: Joi.object().optional()
});

export const interfaceConfigSchema = Joi.object({
  ipAddress: Joi.string().ip().optional(),
  subnetMask: Joi.string().ip().optional(),
  enabled: Joi.boolean().required(),
  vlan: Joi.number().optional(),
  mode: Joi.string().valid('access', 'trunk').optional()
});
