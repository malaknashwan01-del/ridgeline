import type { Difficulty, Trail } from './types';
import { generateProfile, generateRoute } from '../lib/geo';
import { hashString } from '../lib/random';
import { media } from './media';

interface Seed {
  id: string;
  name: string;
  nameAr: string;
  region: string;
  regionAr: string;
  lat: number;
  lng: number;
  distance: number;
  gain: number;
  base: number;
  duration: [number, number];
  difficulty: Difficulty;
  rating: number;
  reviews: number;
  palette: [string, string, string];
  image?: string[];
  description: { en: string; ar: string };
}

const seeds: Seed[] = [
  {
    id: 'lauberhorn-ridge',
    name: 'Lauberhorn Ridge',
    nameAr: 'حافة لاوبرهورن',
    region: 'Jungfrau Region',
    regionAr: 'منطقة يونغفراو',
    lat: 46.5856,
    lng: 7.9206,
    distance: 6.5,
    gain: 350,
    base: 2120,
    duration: [2.5, 3],
    difficulty: 'moderate',
    rating: 4.7,
    reviews: 198,
    palette: ['#F6B733', '#C97B2A', '#2F8F8A'],
    description: {
      en: 'A golden-larch ridge walk above Wengen with wide views over the turquoise valley lakes and the snowy Jungfrau massif. Best in October when the larches turn.',
      ar: 'ممشى على حافة غابات اللاركس الذهبية فوق فنغن، بإطلالات واسعة على بحيرات الوادي الفيروزية وقمم يونغفراو المثلجة. أجمل وقت له في أكتوبر لما يتلوّن الشجر.',
    },
  },
  {
    id: 'harder-kulm',
    name: 'Harder Kulm Ascent',
    nameAr: 'صعود هاردر كولم',
    region: 'Interlaken',
    regionAr: 'إنترلاكن',
    lat: 46.6977,
    lng: 7.8513,
    distance: 5.2,
    gain: 750,
    base: 570,
    duration: [2.5, 3.5],
    difficulty: 'hard',
    rating: 4.5,
    reviews: 412,
    palette: ['#7C6CF2', '#4B3FB0', '#1F1A4D'],
    description: {
      en: 'A steep forest climb straight out of Interlaken to a viewpoint above both lakes. Short, relentless and very rewarding at sunset.',
      ar: 'صعود حاد عبر الغابة من إنترلاكن مباشرة إلى نقطة مطلّة على البحيرتين. قصير ومتعب، لكنه يستاهل وقت الغروب.',
    },
  },
  {
    id: 'oeschinen-lake',
    name: 'Oeschinen Lake Loop',
    nameAr: 'حلقة بحيرة أوشينن',
    region: 'Kandersteg',
    regionAr: 'كاندرستيغ',
    lat: 46.4983,
    lng: 7.7307,
    distance: 4.8,
    gain: 220,
    base: 1580,
    duration: [1.5, 2],
    difficulty: 'easy',
    rating: 4.9,
    reviews: 864,
    palette: ['#5EC2C2', '#2F8F8A', '#1D4E5A'],
    description: {
      en: 'A gentle loop around a glacier-fed lake ringed by cliffs and waterfalls. Great for families and first alpine hikes.',
      ar: 'حلقة سهلة حول بحيرة جليدية محاطة بالمنحدرات والشلالات. مناسبة للعائلات ولأول تجربة مشي جبلي.',
    },
  },
  {
    id: 'bachalpsee',
    name: 'Bachalpsee Trail',
    nameAr: 'مسار باخالبسي',
    region: 'Grindelwald',
    regionAr: 'غريندلفالد',
    lat: 46.6672,
    lng: 8.0204,
    distance: 6.0,
    gain: 230,
    base: 2160,
    duration: [2, 2.5],
    difficulty: 'easy',
    rating: 4.8,
    reviews: 1203,
    palette: ['#8FC3EA', '#4A7FB5', '#24405E'],
    description: {
      en: 'High-alpine meadows to a mirror lake that reflects the Schreckhorn on calm mornings.',
      ar: 'مروج جبلية عالية توصلك لبحيرة صافية بتعكس قمة شريكهورن بالصبح لما يكون الجو هادي.',
    },
  },
  {
    id: 'schynige-platte',
    name: 'Schynige Platte Panorama',
    nameAr: 'بانوراما شينيغه بلاته',
    region: 'Wilderswil',
    regionAr: 'فيلدرسفيل',
    lat: 46.6516,
    lng: 7.9118,
    distance: 15.5,
    gain: 900,
    base: 1960,
    duration: [5.5, 6.5],
    difficulty: 'hard',
    rating: 4.6,
    reviews: 327,
    palette: ['#F59E0B', '#B45309', '#3F2A12'],
    description: {
      en: 'A long, exposed ridge traverse with non-stop views of the Eiger, Mönch and Jungfrau. Start early.',
      ar: 'عبور طويل ومكشوف على الحافة مع إطلالات متواصلة على آيغر ومونش ويونغفراو. ابدأ بكير.',
    },
  },
  {
    id: 'gelmersee',
    name: 'Gelmersee Circuit',
    nameAr: 'دائرة غيلمرسي',
    region: 'Grimsel',
    regionAr: 'غريمسل',
    lat: 46.6185,
    lng: 8.3247,
    distance: 5.6,
    gain: 420,
    base: 1410,
    duration: [2.5, 3],
    difficulty: 'moderate',
    rating: 4.7,
    reviews: 289,
    palette: ['#3F9E7A', '#256B52', '#16332A'],
    description: {
      en: 'Granite slabs and a turquoise reservoir high above the Grimsel road. Rocky underfoot — good boots help.',
      ar: 'صخور غرانيت وخزان فيروزي فوق طريق غريمسل. الأرض صخرية، فالحذاء المناسب بيفرق.',
    },
  },
  {
    id: 'five-lakes',
    name: 'Five Lakes Walk',
    nameAr: 'ممشى البحيرات الخمس',
    region: 'Zermatt',
    regionAr: 'زيرمات',
    lat: 46.0207,
    lng: 7.7853,
    distance: 9.3,
    gain: 500,
    base: 2290,
    duration: [3, 4],
    difficulty: 'moderate',
    rating: 4.8,
    reviews: 956,
    palette: ['#E86A5C', '#A43D33', '#3A1C1A'],
    description: {
      en: 'Five alpine lakes in one walk, several with Matterhorn reflections. Plenty of spots for a long lunch.',
      ar: 'خمس بحيرات جبلية بمشوار واحد، وكم وحدة منهم بتعكس جبل ماترهورن. في أماكن كثيرة لاستراحة غداء طويلة.',
    },
  },
  {
    id: 'aletsch-view',
    name: 'Aletsch Glacier View',
    nameAr: 'إطلالة نهر أليتش الجليدي',
    region: 'Bettmeralp',
    regionAr: 'بيتمرالب',
    lat: 46.4206,
    lng: 8.0645,
    distance: 12,
    gain: 650,
    base: 1950,
    duration: [4, 5],
    difficulty: 'hard',
    rating: 4.9,
    reviews: 512,
    palette: ['#B9D7E8', '#6E9AB8', '#2E4A63'],
    description: {
      en: 'Ridge path above the longest glacier in the Alps, through stone-pine forest and back via quiet alpine villages.',
      ar: 'مسار على الحافة فوق أطول نهر جليدي بجبال الألب، عبر غابات الصنوبر والرجوع من قرى جبلية هادية.',
    },
  },
];

export const trails: Trail[] = seeds.map(({ base, ...s }) => {
  const seed = hashString(s.id);
  // Your own cover in /public/media/trails/<id>.jpg wins; Lauberhorn also falls back to the hero photo.
  const image = [media.trail(s.id), ...(s.id === 'lauberhorn-ridge' ? media.hero : [])];
  const profile = generateProfile(base, s.gain, s.distance, seed);
  return {
    ...s,
    image,
    route: generateRoute(s.lat, s.lng, s.distance, seed),
    profile,
    maxElevation: Math.max(...profile.map((p) => p.e)),
  };
});

export const trailById = (id: string | undefined) => trails.find((t) => t.id === id);

export const reviews = [
  {
    id: 'r1',
    trailId: '*',
    author: 'Lena K.',
    rating: 5,
    date: '2026-10-12',
    text: {
      en: 'Golden larches everywhere and almost no one on the ridge before 9am. Bring layers — the wind picks up near the top.',
      ar: 'شجر اللاركس الذهبي بكل مكان وتقريباً ما في حدا على الحافة قبل الساعة 9. خذ معك طبقات ملابس، الهوا بيقوى قرب القمة.',
    },
  },
  {
    id: 'r2',
    trailId: '*',
    author: 'Tomás R.',
    rating: 4,
    date: '2026-09-28',
    text: {
      en: 'Well marked and the views are unreal. The last climb is steeper than the profile suggests.',
      ar: 'المسار واضح والإطلالات خيالية. آخر طلعة أصعب من ما بيبيّن الرسم.',
    },
  },
  {
    id: 'r3',
    trailId: '*',
    author: 'Aiko S.',
    rating: 5,
    date: '2026-09-03',
    text: {
      en: 'Did it with my kids (10 and 12). We took our time and had lunch by the lake. Perfect day.',
      ar: 'مشيته مع ولادي (10 و12 سنة). أخذنا وقتنا وتغدينا جنب البحيرة. يوم مثالي.',
    },
  },
];
