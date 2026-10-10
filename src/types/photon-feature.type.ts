import type { PhotonGeometry } from './photon-geometry.type.js';
import type { PhotonProperties } from './photon-properties.type.js';

export interface PhotonFeature {
  geometry: PhotonGeometry;
  properties?: PhotonProperties;
}
