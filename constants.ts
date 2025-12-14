import { AppConfig, OptionItem, ShotType, AtmosphereType, LightType, CameraType, GenderType, NationalityType, ArtDirectionType, SceneType } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  shot: 'Wide shot',
  atmosphere: 'Dark Luxury',
  light: 'Warm rim light',
  camera: 'Sony A7R IV',
  gender: 'Female',
  nationality: 'Asian',
  artDirection: 'Netflix Documentary',
  scene: 'Dark Industrial Warehouse',
};

// Options for UI Selectors

export const SHOT_OPTIONS: OptionItem<ShotType>[] = [
  { label: '广角全身 (Wide Shot)', value: 'Wide shot' },
  { label: '中景半身 (Medium Shot)', value: 'Medium shot' },
  { label: '特写 (Close-up)', value: 'Close-up' },
];

export const ART_DIRECTION_OPTIONS: OptionItem<ArtDirectionType>[] = [
  { label: 'Netflix 纪录片团队 (Netflix Docu)', value: 'Netflix Documentary' },
  { label: 'Nike 商业广告团队 (Nike Commercial)', value: 'Nike Commercial' },
  { label: 'Lululemon 生活方式团队 (Clean Lifestyle)', value: 'Lululemon Lifestyle' },
  { label: 'CrossFit 硬核竞技团队 (Industrial)', value: 'CrossFit Industrial' },
  { label: 'Vogue 运动时尚团队 (High Fashion)', value: 'Vogue Editorial' },
];

export const ATMOSPHERE_OPTIONS: OptionItem<AtmosphereType>[] = [
  { label: '高级暗调 (Dark Luxury)', value: 'Dark Luxury' },
  { label: '明亮活力 (Bright & Energetic)', value: 'Bright & Energetic' },
  { label: '自然疗愈 (Nature & Zen)', value: 'Nature & Zen' },
  { label: '赛博朋克 (Cyberpunk)', value: 'Cyberpunk' },
];

export const LIGHT_OPTIONS: OptionItem<LightType>[] = [
  { label: '暖色轮廓光 (Warm Rim)', value: 'Warm rim light' },
  { label: '电影感冷光 (Cinematic Cool)', value: 'Cinematic cool lighting' },
  { label: '霓虹灯效 (Neon)', value: 'Neon lights' },
  { label: '自然柔光 (Soft Natural)', value: 'Soft natural light' },
];

export const CAMERA_OPTIONS: OptionItem<CameraType>[] = [
  { label: '索尼高清 (Sony A7R IV)', value: 'Sony A7R IV' },
  { label: '胶片感 (Kodak Portra 400)', value: 'Kodak Portra 400' },
  { label: '运动相机 (GoPro Hero 10)', value: 'GoPro Hero 10' },
];

export const GENDER_OPTIONS: OptionItem<GenderType>[] = [
  { label: '女 (Female)', value: 'Female' },
  { label: '男 (Male)', value: 'Male' },
  { label: '混合 (Mixed)', value: 'Mixed' },
];

export const NATIONALITY_OPTIONS: OptionItem<NationalityType>[] = [
  { label: '亚洲 (Asian)', value: 'Asian' },
  { label: '欧美 (Caucasian)', value: 'Caucasian' },
  { label: '黑人 (Black)', value: 'Black' },
  { label: '多元化 (Diverse)', value: 'Diverse' },
];

export const SCENE_OPTIONS: OptionItem<SceneType>[] = [
  { label: '暗黑工业 (Dark Industrial)', value: 'Dark Industrial Warehouse' },
  { label: '高端私教 (Luxury Wellness)', value: 'Luxury Wellness Studio' },
  { label: '赛博霓虹 (Cyber Neon)', value: 'Cyber Neon Gym' },
  { label: '自然禅意 (Zen Nature)', value: 'Zen Nature Space' },
  { label: '城市天台 (Urban Rooftop)', value: 'Urban Rooftop' },
  { label: '北欧居家 (Sunlit Scandi)', value: 'Sunlit Scandi Home' },
];

// Translations and Keywords for Prompt Generation

export const getShotCN = (v: ShotType): string => {
  const map: Record<ShotType, string> = {
    'Wide shot': '广角全身镜头',
    'Medium shot': '中景半身镜头',
    'Close-up': '特写镜头'
  };
  return map[v];
};

export const getGenderCN = (v: GenderType): string => {
  const map: Record<GenderType, string> = {
    'Female': '女性',
    'Male': '男性',
    'Mixed': '混合性别'
  };
  return map[v];
};

export const getNationalityCN = (v: NationalityType): string => {
  const map: Record<NationalityType, string> = {
    'Asian': '亚洲',
    'Caucasian': '欧美',
    'Black': '黑人',
    'Diverse': '多元化'
  };
  return map[v];
};

export const getAtmosphereCN = (v: AtmosphereType): string => {
  const map: Record<AtmosphereType, string> = {
    'Dark Luxury': '高级暗调氛围',
    'Bright & Energetic': '明亮活力氛围',
    'Nature & Zen': '自然疗愈氛围',
    'Cyberpunk': '赛博朋克氛围'
  };
  return map[v];
};

export const getLightCN = (v: LightType): string => {
  const map: Record<LightType, string> = {
    'Warm rim light': '暖色轮廓光',
    'Cinematic cool lighting': '电影感冷光',
    'Neon lights': '霓虹灯效',
    'Soft natural light': '自然柔光'
  };
  return map[v];
};

export const getCameraCN = (v: CameraType): string => {
  const map: Record<CameraType, string> = {
    'Sony A7R IV': '索尼A7R IV',
    'Kodak Portra 400': '柯达Portra 400胶片',
    'GoPro Hero 10': 'GoPro Hero 10运动视角'
  };
  return map[v];
};

export const getArtDirectionCN = (v: ArtDirectionType): string => {
  const map: Record<ArtDirectionType, string> = {
    'Netflix Documentary': 'Netflix纪录片风格，电影级景深，真实胶片颗粒感，情绪化暗调，叙事感构图',
    'Nike Commercial': 'Nike商业广告风格，英雄主义氛围，高对比度，汗水反光，极致动态，充满力量感',
    'Lululemon Lifestyle': 'Lululemon生活方式风格，明亮干净，柔和色调，自然光，高级灰度，愉悦感',
    'CrossFit Industrial': 'CrossFit硬核竞技风格，粗粝质感，空气中的镁粉，冷峻工业风，爆发力，低饱和度',
    'Vogue Editorial': 'Vogue运动时尚大片，精致布光，模特姿态优雅，色彩鲜艳，杂志封面质感，锐利对焦'
  };
  return map[v];
};

export const getSceneCN = (v: SceneType): string => {
  const map: Record<SceneType, string> = {
    'Dark Industrial Warehouse': '暗黑工业风仓库，水泥墙面，裸露管道，戏剧性光影',
    'Luxury Wellness Studio': '高端私教工作室，暖木色调，落地镜，高级酒店质感',
    'Cyber Neon Gym': '赛博朋克健身房，黑暗背景，霓虹灯条，沉浸式科技感',
    'Zen Nature Space': '自然禅意空间，绿植环绕，白纱帘，充足阳光，宁静致远',
    'Urban Rooftop': '城市天台，开阔视野，城市天际线背景，黄金时刻夕阳',
    'Sunlit Scandi Home': '北欧风格居家环境，干净明亮的客厅，充满生活气息'
  };
  return map[v];
};