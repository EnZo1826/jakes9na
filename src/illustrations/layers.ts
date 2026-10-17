/** Maps an architecture/pipeline layer name to a DomainIcon glyph id. */
const LAYER_TO_ICON: Record<string, string> = {
  field: 'industrial-automation',
  edge: 'iot-edge',
  transport: 'layer-transport',
  backend: 'cloud-infrastructure',
  data: 'layer-data',
  app: 'realtime-visualization',
  operator: 'layer-operator',
  ai: 'ai-agents',
  control: 'layer-control',
};

/** Icon id for an architecture/pipeline layer name. */
export function layerIconId(layer: string): string {
  return LAYER_TO_ICON[layer] ?? 'layer-transport';
}
