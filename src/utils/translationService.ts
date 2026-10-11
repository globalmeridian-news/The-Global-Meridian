import { Article, SupportedLanguage } from '../types/news';

// In-memory cache for translations: key = `${targetLang}:${text}`
const memoryCache = new Map<string, string>();

// Active in-flight requests to deduplicate concurrent calls
const inFlightRequests = new Map<string, Promise<string>>();

// Subscribers for real-time translation updates
type TranslationListener = (lang: SupportedLanguage, text: string, translated: string) => void;
const listeners = new Set<TranslationListener>();

export function subscribeTranslation(listener: TranslationListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyTranslation(lang: SupportedLanguage, text: string, translated: string) {
  listeners.forEach((fn) => {
    try {
      fn(lang, text, translated);
    } catch (e) {
      console.error('Translation listener error:', e);
    }
  });
}

// Load persistent cache from localStorage if available
function loadPersistentCache(lang: SupportedLanguage): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(`meridian_trans_cache_${lang}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToPersistentCache(lang: SupportedLanguage, original: string, translated: string) {
  if (typeof window === 'undefined') return;
  try {
    const key = `meridian_trans_cache_${lang}`;
    const raw = localStorage.getItem(key);
    const existing: Record<string, string> = raw ? JSON.parse(raw) : {};
    existing[original] = translated;
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {
    // Ignore storage quota errors
  }
}

// Pre-seeded high-quality translations for immediate, zero-lag rendering of demo articles
export const PRE_SEEDED_TRANSLATIONS: Record<string, Record<string, string>> = {
  ja: {
    // Article 9
    'Global Climate Summit in Nairobi Finalizes Landmark $100B Loss and Damage Operationalization Compact':
      'ナイロビの気候サミット、1000億ドル規模の「損失と被害」基金運用の歴史的合意を採択',
    'Envoys from 140 nations establish expedited disbursement mechanisms for coastal and agricultural economies facing extreme weather shocks, with initial capitalization unlocked immediately.':
      '140カ国の代表が、異常気象に見舞われる沿岸および農業経済向けの迅速な資金拠出枠組みを確立し、初期資金の拠出が直ちに開始されました。',
    'Nairobi, Kenya': 'ケニア・ナイロビ',
    'NAIROBI — In an unprecedented breakthrough concluding two weeks of marathon diplomacy in the Kenyan capital, ministers representing 140 nations reached unanimous agreement Saturday morning on the operating statutes of the $100 Billion International Loss and Damage Mechanism.':
      'ナイロビ — ケニアの首都で2週間にわたるマラソン外交の末、土曜日の朝、140カ国の環境相が1000億ドル規模の国際損失・被害メカニズムの運用規定に満場一致で合意しました。',

    // Article 10
    'International Quantum Network Achieves Intercontinental Entanglement Over 10,000 Kilometers':
      '国際量子ネットワーク、1万キロメートルを超える大陸間量子もつれ伝送に成功',
    'Consortium of physicists in Tokyo, Zurich, and Toronto verify tamper-proof quantum key distribution across low-Earth orbit satellites with zero signal distortion.':
      '東京、チューリッヒ、トロントの物理学者コンソーシアムが、地球低軌道衛星を経由した改ざん不可能な量子鍵配送を信号歪みゼロで検証しました。',
    'Tokyo, Japan': '日本・東京',
    'TOKYO — A multinational scientific coalition announced Saturday morning that it has established the longest unamplified quantum entanglement link in history, exchanging cryptographically unbreakable keys between ground stations in Koganei (Tokyo) and Zurich via the constellation Q-Orbiter 3.':
      '東京 — 多国籍科学連合は土曜日の朝、小金井（東京）とチューリッヒの地上局間で衛星Q-Orbiter 3を介して暗号解読不能な鍵を交換し、歴史上最長の非増幅量子もつれリンクを確立したと発表しました。',

    // Article 11
    'South Asian Trilateral Grid Synchronizes 4,000 MW Himalayan Hydropower Corridor Across Nepal, Bhutan, and Bangladesh':
      '南アジア三国間グリッド、ネパール・ブータン・バングラデシュを結ぶ4,000MWヒマラヤ水力回廊を同期化',
    'Cross-border high-voltage direct current interconnectors go live, powering regional manufacturing centers while cutting fossil fuel reliance by 35% in first quarter.':
      '国境を越えた高圧直流連系線が稼働し、第1四半期に化石燃料依存度を35％削減しながら地域の製造業拠点へ送電を開始しました。',
    'Dhaka, Bangladesh': 'バングラデシュ・ダッカ',

    // Article 12
    'WHO Grants Full Prequalification to Dual mRNA Vaccine Conferring 94% Efficacy Against Dengue and Chikungunya':
      'WHO、デング熱とチクングニア熱に94%の有効性を示す二価mRNAワクチンを事前承認',
    'Global multi-center Phase 3 results confirm single-dose protection against all four dengue serotypes, with distribution starting across Latin America and Southeast Asia.':
      '世界規模の多施設共同第3相試験により、デング熱全4血清型に対する単回投与での予防効果が確認され、ラテンアメリカおよび東南アジアで配布が開始されます。',

    // Article 13
    'World Athletics Ratifies Historic Sub-Two-Hour Marathon Recorded Under Certified Open Road Race Conditions':
      'ワールドアスレティックス、公認ロードレース条件下で記録された2時間切りマラソンを歴史的公認',
    'Kenyan distance phenomenon clocks 1:59:14 along the certified Danube course, establishing an unprecedented milestone in human endurance and athletic capability.':
      'ケニアの長距離選手が公認のドナウ川コースで1時間59分14秒を記録し、人類の持久力と運動能力における前例のないマイルストーンを樹立しました。',
    'Vienna, Austria': 'オーストリア・ウィーン',

    // Article 1
    'UN Delegates In Geneva Reach Landmark Accord On Sovereign AI Safeguards and Critical Infrastructure':
      'ジュネーブの国連代表団、国家主権AIセーフガードと重要インフラに関する画期的合意に署名',
    'Envoys from 64 nations conclude three weeks of high-stakes deliberations with a binding framework regulating military AI deployment and establishing global inspection protocols.':
      '64カ国の代表団は3週間にわたる白熱した協議を終え、軍事用AIの配備を規制し国際査察プロトコルを確立する法的拘束力のある枠組みを採択しました。',
    'Geneva, Switzerland': 'スイス・ジュネーブ',
    'The Assembly Hall at the Palais des Nations during the closing plenary vote on international algorithmic verification.':
      '国際アルゴリズム検証に関する本会議の最終採決におけるパレ・デ・ナシオンの総会議場。',
    'GENEVA — In what international legal scholars are designating the most consequential multilateral breakthrough since the Comprehensive Nuclear-Test-Ban Treaty, 64 sovereign nations voted overwhelmingly Tuesday afternoon to ratify the Geneva Accords on Autonomous Systems and Critical AI Infrastructure.':
      'ジュネーブ — 国際法学者が包括的核実験禁止条約以来の最も重大な多国間合意と位置付ける中、64の主権国家が火曜日の午後、自律システムと重要AIインフラに関するジュネーブ協定を圧倒的多数で批准しました。',
    'The treaty establishes an independent international inspection registry, administered under the auspices of the International Telecommunication Union and IAEA dual-oversight mechanisms, designed to audit algorithmic weight deployments in defense hardware and civilian energy grid architectures.':
      'この条約は、国際電気通信連合（ITU）とIAEAの二重監督機構の下で管理される独立した国際査察登録簿を設立し、防衛ハードウェアおよび民生用エネルギーグリッドにおけるアルゴリズム重みの配備を監査することを目的としています。',
    'Diplomats close to the Swiss delegation confirmed that negotiations extended through three consecutive overnight working sessions, centered on defining strict verification protocols for proprietary neural networks without compromising national intellectual property rights.':
      'スイス代表団に近い外交官は、国家の知的財産権を侵害することなく独自ニューラルネットワークの厳格な検証プロトコルを策定することに焦点を当て、協議が3晩連続の徹夜作業セッションに及んだことを確認しました。',
    'Envoys convene for bilateral verification protocols following the plenary consensus.':
      '本会議の合意形成後、二国間検証プロトコルのために集まる外交官たち。',
    'The global community has demonstrated that algorithmic sovereignty must coexist with collective existential assurance. This accord does not impede technological discovery; it creates the indispensable guardrails that preserve human agency.':
      '国際社会は、アルゴリズムの主権が集団的な実存的保証と共存しなければならないことを示しました。この協定は技術的発見を妨げるものではなく、人間の主体性を維持するために不可欠なガードレールを構築するものです。',

    // Article 2
    'European and Asian Semiconductor Alliance Breaks Ground on $28B Photonic Chip Foundry in Dresden':
      'ヨーロッパとアジアの半導体アライアンスがドレスデンで280億ドル規模のフォトニックチップファウンドリに着工',
    'The Silicon Saxony facility will produce light-based processors capable of operating at 80% lower thermal dissipation, targeting zero-carbon computational centers.':
      'シリコンサクソニーの施設では、炭素排出ゼロの計算センターを目指し、熱放散を80％削減して動作可能な光ベースのプロセッサを製造します。',
    'Dresden, Germany': 'ドイツ・ドレスデン',
    'DRESDEN — Industrial leaders from Germany, the Netherlands, Japan, and South Korea formally launched construction on Tuesday of the continent’s most advanced photonic foundry, an investment totaling €26.2 billion ($28.4 billion) backed by European Chips Act capital and private equity syndicates.':
      'ドレスデン — ドイツ、オランダ、日本、韓国の産業界のリーダーは火曜日、欧州半導体法とプライベートエクイティシンジケートの支援を受け、総額262億ユーロ（284億ドル）に達する大陸最先端のフォトニックファウンドリの建設を正式に開始しました。',
    'Unlike conventional silicon designs relying purely on sub-2nm electron copper traces, photonic processors integrate indium phosphide wave-guides to transmit data packets at the speed of light. The technology reduces thermal throttling in large neural cluster arrays while dramatically curbing power drain.':
      '2nm未満の電子銅配線に依存する従来のシリコン設計とは異なり、フォトニックプロセッサはインジウムリンの光導波路を統合し、光の速度でデータパケットを送信します。この技術により、大規模ニューラルクラスタアレイでの熱スロットリングを低減しながら、消費電力を大幅に抑制します。',
    'Cleanroom technician inspects a 300mm photonic wafer pilot run during prototype certification.':
      'クリーンルームの技術者が、プロトタイプ認証のパイロットラン中に300mmフォトニックウェハーを検査しています。',

    // Article 3
    'G10 Central Banks Announce Coordinated Foreign Exchange Swap Enhancements to Cushion Developing Markets':
      'G10主要中央銀行、途上国市場のショック緩和へ向け協調外国為替スワップ拡充を発表',
    'Bilateral standing currency lines widened across Tokyo, London, Frankfurt, and Washington to preempt short-term balance-of-payments volatility amid global trade realignments.':
      '世界貿易の再編が進む中、短期的な国際収支の変動を予防するため、東京、ロンドン、フランクフルト、ワシントン間で恒常的通貨スワップ枠が拡大されました。',
    'Basel, Switzerland': 'スイス・バーゼル',

    // Article 4
    'Historic Antarctic Ocean Protection Treaty Expands Protected Marine Sanctuary to 2.4 Million Square Kilometers':
      '南極海保護に関する歴史的条約が締結、海洋保護区を240万平方キロメートルへ拡大',
    'Commission for the Conservation of Antarctic Marine Living Resources reaches unanimous agreement in Hobart, closing critical krill feeding zones to industrial trawling.':
      '南極海洋生物資源保存委員会（CCAMLR）がホバートで満場一致の合意に達し、主要なオキアミ摂食海域での商業トロール漁を禁止しました。',
    'Hobart, Australia': 'オーストラリア・ホバート',

    // Article 5
    'World Health Organization Validates 88% Efficacy in Phase 3 Trials of Pan-Tuberculosis Vaccine':
      'WHO、全結核対応ワクチンの第3相治験で88%の有効性を確認',
    'Multi-country randomized trials across South Asia and Sub-Saharan Africa demonstrate sustained long-term immune memory against drug-resistant pulmonary strains.':
      '南アジアおよびサブサハラアフリカの多国間無作為化比較試験において、薬剤耐性肺結核株に対する長期持続的な免疫記憶が実証されました。',
    'Brazzaville, Republic of Congo': 'コンゴ共和国・ブラザビル',

    // Article 6
    'Nordic and Baltic Coalition Deploys Integrated Sub-Surface Acoustic Defense Grid':
      '北欧・バルト連合、バルト海に統合海底音響防衛グリッドを展開',
    'Automated hydrophone network and uncrewed patrol submersibles commissioned to protect undersea power conduits and telecommunication cables.':
      '海底送電線および光海底ケーブルを保護するため、自動ハイドロフォン網と無人哨戒潜水艇が正式配備されました。',
    'Helsinki, Finland': 'フィンランド・ヘルシンキ',

    // Article 7
    'FIFA Confirms Global Free-to-Air Distribution Mandate for Expanded 2027 Club Tournament':
      'FIFA、拡大版2027クラブワールドカップ全64試合の全世界無料地上波放送義務化を決定',
    'Governing body rules that linear broadcasters across 180 territories must ensure unencrypted public access for all 64 tournament fixtures.':
      '統括団体FIFAは、180の国・地域の地上波放送局に対し、全64試合の無料暗号なし一般公開を義務付ける決定を下しました。',
    'Zurich, Switzerland': 'スイス・チューリッヒ',

    // Article 8
    'James Webb Space Telescope Confirms Nitrogen-Rich Atmosphere and Water Vapor on Temperate Exoplanet':
      'ジェームズ・ウェッブ宇宙望遠鏡、温暖な太陽系外惑星で窒素豊富大気と水蒸気を検出',
    'Transmission spectroscopy of rocky super-Earth LHS 1140 b reveals definitive biosignature precursor indicators 48 light-years from Earth.':
      '地球から48光年離れた岩石型スーパーアース「LHS 1140 b」の透過分光観測により、生命居住可能性を示す明確な大気前駆物質が確認されました。',
    'Baltimore, United States': '米国・ボルチモア',

    // Author and Bureau
    'Elena Rostova': 'エレナ・ロストワ',
    'Marcus Vance': 'マーカス・ヴァンス',
    'Dr. Tariq Al-Mansoor': 'タリク・アル＝マンスール博士',
    'Aisha Chowdhury': 'アイシャ・チョードリー',
    'Julian Moreau': 'ジュリアン・モロー',
    'Chief Diplomatic Correspondent': '主任外交特派員',
    'Senior Technology & AI Editor': '上級テクノロジー＆AI担当編集長',
    'Global Energy & Climate Correspondent': '国際エネルギー・気候担当特派員',
    'South Asia & Global Economics Bureau Chief': '南アジア・世界経済支局長',
    'Defense and Aerospace Analyst': '防衛・航空宇宙アナリスト',
  },
  es: {
    'UN Delegates In Geneva Reach Landmark Accord On Sovereign AI Safeguards and Critical Infrastructure':
      'Los delegados de la ONU en Ginebra alcanzan un acuerdo histórico sobre salvaguardas de IA e infraestructura crítica',
    'Envoys from 64 nations conclude three weeks of high-stakes deliberations with a binding framework regulating military AI deployment and establishing global inspection protocols.':
      'Enviados de 64 naciones concluyen tres semanas de deliberaciones clave con un marco vinculante que regula el despliegue militar de IA.',
    'European and Asian Semiconductor Alliance Breaks Ground on $28B Photonic Chip Foundry in Dresden':
      'La Alianza de Semiconductores de Europa y Asia inicia la construcción de una fundición de chips fotónicos de 28.000 millones de dólares en Dresde',
    'The Silicon Saxony facility will produce light-based processors capable of operating at 80% lower thermal dissipation, targeting zero-carbon computational centers.':
      'La instalación de Silicon Saxony producirá procesadores basados en luz capaces de operar con una disipación térmica un 80% menor.',
  },
};

/**
 * Synchronous cache lookup for instantaneous rendering
 */
export function getCachedTranslation(text: string, targetLang: SupportedLanguage): string | null {
  if (!text || targetLang === 'en') return text;

  // 1. Memory cache
  const memKey = `${targetLang}:${text}`;
  if (memoryCache.has(memKey)) {
    return memoryCache.get(memKey)!;
  }

  // 2. Pre-seeded translations
  if (PRE_SEEDED_TRANSLATIONS[targetLang] && PRE_SEEDED_TRANSLATIONS[targetLang][text]) {
    const val = PRE_SEEDED_TRANSLATIONS[targetLang][text];
    memoryCache.set(memKey, val);
    return val;
  }

  // 3. Persistent localStorage
  const persistent = loadPersistentCache(targetLang);
  if (persistent[text]) {
    memoryCache.set(memKey, persistent[text]);
    return persistent[text];
  }

  return null;
}

/**
 * Asynchronous translation engine using Google Translate client endpoint
 * with memory + persistent caching and request deduplication.
 */
export async function translateText(
  text: string,
  targetLang: SupportedLanguage,
  sourceLang: string = 'auto'
): Promise<string> {
  if (!text || text.trim() === '') return '';
  if (targetLang === 'en') return text;

  // Check cache first
  const cached = getCachedTranslation(text, targetLang);
  if (cached) return cached;

  const requestKey = `${targetLang}:${text}`;

  // Deduplicate ongoing request
  if (inFlightRequests.has(requestKey)) {
    return inFlightRequests.get(requestKey)!;
  }

  const promise = (async () => {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Translation API error: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map((part: any) => part[0] || '').join('');
        if (translated) {
          memoryCache.set(requestKey, translated);
          saveToPersistentCache(targetLang, text, translated);
          notifyTranslation(targetLang, text, translated);
          return translated;
        }
      }
      return text;
    } catch (err) {
      console.warn(`Translation to ${targetLang} failed for: "${text.slice(0, 30)}..."`, err);
      return text;
    } finally {
      inFlightRequests.delete(requestKey);
    }
  })();

  inFlightRequests.set(requestKey, promise);
  return promise;
}

/**
 * Translates an array of texts in parallel
 */
export async function translateBatch(
  texts: string[],
  targetLang: SupportedLanguage
): Promise<string[]> {
  if (targetLang === 'en') return texts;
  return Promise.all(texts.map((t) => translateText(t, targetLang)));
}
