export interface Experiment {
  id: string;
  title: string;
  subject: string;
  strand: string;
  subStrand: string;
  gradeLevel: string;
  description: string;
  thumbnail: string;
  assetType: '3d_model' | 'video' | 'image' | 'mixed';
  modelUrl?: string;
  modelScale?: number;
  hasAnimation?: boolean;
  videoUrl?: string;
  tags: string[];
  /** Clickable parts for models with named meshes */
  parts?: ModelPart[];
  /** Position-based hotspots for merged meshes */
  hotspots?: Hotspot[];
}

export interface ModelPart {
  meshName: string;
  label: string;
  description: string;
}

export interface Hotspot {
  position: [number, number, number];
  label: string;
  labelSw?: string;
  description: string;
  descriptionSw?: string;
}

export interface ApparatusItem {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  safetyNotes?: string;
}

export interface VideoLesson {
  id: string;
  title: string;
  subject: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  description: string;
}
