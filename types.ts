export type ShotType = 'Wide shot' | 'Medium shot' | 'Close-up';
export type AtmosphereType = 'Dark Luxury' | 'Bright & Energetic' | 'Nature & Zen' | 'Cyberpunk';
export type LightType = 'Warm rim light' | 'Cinematic cool lighting' | 'Neon lights' | 'Soft natural light';
export type CameraType = 'Sony A7R IV' | 'Kodak Portra 400' | 'GoPro Hero 10';
export type GenderType = 'Female' | 'Male' | 'Mixed';
export type NationalityType = 'Asian' | 'Caucasian' | 'Black' | 'Diverse';
export type ArtDirectionType = 'Netflix Documentary' | 'Nike Commercial' | 'Lululemon Lifestyle' | 'CrossFit Industrial' | 'Vogue Editorial';
export type SceneType = 'Dark Industrial Warehouse' | 'Luxury Wellness Studio' | 'Cyber Neon Gym' | 'Zen Nature Space' | 'Urban Rooftop' | 'Sunlit Scandi Home';

export interface AppConfig {
  shot: ShotType;
  atmosphere: AtmosphereType;
  light: LightType;
  camera: CameraType;
  gender: GenderType;
  nationality: NationalityType;
  artDirection: ArtDirectionType;
  scene: SceneType;
}

export interface CourseItem {
  id: string;
  name: string;
  action: string | null; // Deduced by Gemini
  prompt: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  imageStatus: 'idle' | 'loading' | 'success' | 'error';
  imageUrl: string | null;
  errorMsg?: string; // New field for detailed error messages
}

export interface OptionItem<T> {
  label: string;
  value: T;
  desc?: string;
}