// src/lib/talent-types.ts
// All 22 talent types with adaptive fields, rate card defaults,
// suggested skills, and headline templates for the profile builder

export type TalentTypeKey =
  | 'SOFTWARE_ENGINEER' | 'FRONTEND_DEVELOPER' | 'BACKEND_DEVELOPER'
  | 'FULLSTACK_DEVELOPER' | 'MOBILE_DEVELOPER' | 'DATA_SCIENTIST'
  | 'ML_ENGINEER' | 'DEVOPS_ENGINEER' | 'UI_UX_DESIGNER'
  | 'GRAPHIC_DESIGNER' | 'MOTION_DESIGNER' | 'VIDEO_EDITOR'
  | 'CONTENT_WRITER' | 'COPYWRITER' | 'SEO_SPECIALIST'
  | 'SOCIAL_MEDIA_MANAGER' | 'PRODUCT_MANAGER' | 'BUSINESS_ANALYST'
  | 'FINANCIAL_CONSULTANT' | 'LEGAL_CONSULTANT' | 'MARKETING_CONSULTANT'
  | 'PHOTOGRAPHER'

export type TalentCategory =
  | 'Engineering' | 'Design' | 'Content'
  | 'Marketing' | 'Business' | 'Creative'

export type AdaptiveFieldType =
  | 'text' | 'textarea' | 'select' | 'multiselect' | 'url' | 'number'

export interface AdaptiveField {
  key:         string
  label:       string
  type:        AdaptiveFieldType
  placeholder?: string
  options?:    string[]
  required?:   boolean
  helperText?: string
}

export interface RateCardDefaults {
  tier1Label: string; tier1Desc: string; tier1Price: number
  tier2Label: string; tier2Desc: string; tier2Price: number
  tier3Label: string; tier3Desc: string; tier3Price: number
}

export interface TalentTypeConfig {
  key:               TalentTypeKey
  label:             string
  emoji:             string
  category:          TalentCategory
  tagline:           string
  adaptiveFields:    AdaptiveField[]
  rateCardDefaults:  RateCardDefaults
  suggestedSkills:   string[]
  headlineTemplates: string[]
}

// ─── 22 talent types ─────────────────────────────────────────────────────────
export const TALENT_TYPES: Record<TalentTypeKey, TalentTypeConfig> = {

  SOFTWARE_ENGINEER: {
    key: 'SOFTWARE_ENGINEER', label: 'Software Engineer', emoji: '💻', category: 'Engineering',
    tagline: 'Build reliable software that scales',
    adaptiveFields: [
      { key: 'primaryLanguage', label: 'Primary language', type: 'select', required: true,
        options: ['JavaScript','TypeScript','Python','Java','Go','Rust','C++','C#','Ruby','Swift','Kotlin'] },
      { key: 'specialisation', label: 'Specialisation', type: 'select',
        options: ['Backend systems','Frontend','Full stack','Infrastructure','Security','Performance','APIs'] },
      { key: 'githubUrl', label: 'GitHub profile', type: 'url', placeholder: 'https://github.com/yourname' },
    ],
    rateCardDefaults: {
      tier1Label: 'Bug fix',       tier1Desc: 'Diagnose and fix a specific bug, same day',              tier1Price: 3000,
      tier2Label: 'Feature build', tier2Desc: 'Build a complete feature from spec to deployed',         tier2Price: 20000,
      tier3Label: 'Project build', tier3Desc: 'End-to-end software project delivery',                   tier3Price: 100000,
    },
    suggestedSkills: ['TypeScript','Node.js','PostgreSQL','Docker','AWS','REST APIs','Git','CI/CD'],
    headlineTemplates: [
      'Software engineer building reliable backends for SaaS companies',
      'Full-stack engineer helping startups ship fast without breaking things',
    ],
  },

  FRONTEND_DEVELOPER: {
    key: 'FRONTEND_DEVELOPER', label: 'Frontend Developer', emoji: '🎨', category: 'Engineering',
    tagline: 'Pixel-perfect UIs that users love',
    adaptiveFields: [
      { key: 'framework', label: 'Primary framework', type: 'select', required: true,
        options: ['React','Next.js','Vue','Nuxt','Angular','Svelte','Vanilla JS'] },
      { key: 'portfolioUrl', label: 'Portfolio / CodePen', type: 'url', placeholder: 'https://yourportfolio.dev' },
      { key: 'designTools', label: 'Design tools', type: 'multiselect',
        options: ['Figma','Adobe XD','Storybook','Tailwind CSS','Framer'] },
    ],
    rateCardDefaults: {
      tier1Label: 'Component',     tier1Desc: 'Build a reusable React component',                        tier1Price: 2500,
      tier2Label: 'Page / feature', tier2Desc: 'Complete page or feature from design to code',           tier2Price: 15000,
      tier3Label: 'Full frontend', tier3Desc: 'Complete frontend of your web app',                       tier3Price: 75000,
    },
    suggestedSkills: ['React','Next.js','TypeScript','Tailwind CSS','Figma','CSS','HTML','Framer Motion'],
    headlineTemplates: [
      'Frontend developer turning Figma designs into pixel-perfect React code',
      'Next.js developer building fast, beautiful web apps for product teams',
    ],
  },

  BACKEND_DEVELOPER: {
    key: 'BACKEND_DEVELOPER', label: 'Backend Developer', emoji: '⚙️', category: 'Engineering',
    tagline: 'Fast APIs and bulletproof databases',
    adaptiveFields: [
      { key: 'primaryStack', label: 'Primary stack', type: 'select', required: true,
        options: ['Node.js','Python / Django','Python / FastAPI','Java / Spring','Go','Ruby on Rails','PHP / Laravel','.NET'] },
      { key: 'databases', label: 'Databases', type: 'multiselect',
        options: ['PostgreSQL','MySQL','MongoDB','Redis','DynamoDB','Supabase','Firebase'] },
      { key: 'cloudProvider', label: 'Cloud provider', type: 'select',
        options: ['AWS','GCP','Azure','Vercel','Railway','DigitalOcean','Hetzner'] },
    ],
    rateCardDefaults: {
      tier1Label: 'API endpoint',  tier1Desc: 'Build or fix a single API endpoint',                     tier1Price: 3000,
      tier2Label: 'API module',    tier2Desc: 'Complete API module with auth and tests',                 tier2Price: 18000,
      tier3Label: 'Backend system',tier3Desc: 'Full backend for your product',                           tier3Price: 90000,
    },
    suggestedSkills: ['Node.js','PostgreSQL','REST APIs','GraphQL','Docker','AWS','Redis','Prisma'],
    headlineTemplates: [
      'Backend developer building fast, scalable APIs for product teams',
      'Node.js engineer specialising in high-performance database design',
    ],
  },

  FULLSTACK_DEVELOPER: {
    key: 'FULLSTACK_DEVELOPER', label: 'Fullstack Developer', emoji: '🚀', category: 'Engineering',
    tagline: 'Zero to deployed, end to end',
    adaptiveFields: [
      { key: 'stack', label: 'Preferred stack', type: 'select', required: true,
        options: ['Next.js + Node.js','React + Django','Vue + Laravel','MEAN stack','MERN stack','T3 Stack','Remix + Prisma'] },
      { key: 'githubUrl', label: 'GitHub profile', type: 'url', placeholder: 'https://github.com/yourname' },
      { key: 'deploymentPlatforms', label: 'Deployment', type: 'multiselect',
        options: ['Vercel','AWS','GCP','Railway','Heroku','DigitalOcean'] },
    ],
    rateCardDefaults: {
      tier1Label: 'Bug / hotfix',  tier1Desc: 'Fix that broken feature, same day',                      tier1Price: 3000,
      tier2Label: 'Feature sprint',tier2Desc: 'Full feature from design to production in one week',      tier2Price: 18000,
      tier3Label: 'MVP build',     tier3Desc: 'Full MVP ready for your first users',                     tier3Price: 85000,
    },
    suggestedSkills: ['Next.js','TypeScript','Node.js','PostgreSQL','Prisma','Tailwind CSS','AWS','Docker'],
    headlineTemplates: [
      'Fullstack developer who ships complete products from design to deployment',
      'Next.js + Node.js engineer building MVPs for early-stage startups',
    ],
  },

  MOBILE_DEVELOPER: {
    key: 'MOBILE_DEVELOPER', label: 'Mobile Developer', emoji: '📱', category: 'Engineering',
    tagline: 'Apps your users actually want to open',
    adaptiveFields: [
      { key: 'platform', label: 'Platform', type: 'select', required: true,
        options: ['React Native','Flutter','iOS (Swift)','Android (Kotlin)','Expo','Ionic'] },
      { key: 'appStoreLink', label: 'App Store / Play Store link', type: 'url', placeholder: 'https://apps.apple.com/...' },
      { key: 'appsShipped', label: 'Apps shipped', type: 'number', placeholder: '5' },
    ],
    rateCardDefaults: {
      tier1Label: 'Screen build',  tier1Desc: 'Build a single app screen from design',                  tier1Price: 4000,
      tier2Label: 'Feature module',tier2Desc: 'Complete app module (e.g. auth, payments)',               tier2Price: 25000,
      tier3Label: 'Full app',      tier3Desc: 'Complete mobile app, App Store ready',                    tier3Price: 120000,
    },
    suggestedSkills: ['React Native','Flutter','Swift','Kotlin','Expo','Firebase','REST APIs','App Store'],
    headlineTemplates: [
      'React Native developer building cross-platform apps from idea to App Store',
      'Flutter engineer crafting beautiful mobile experiences for growing startups',
    ],
  },

  DATA_SCIENTIST: {
    key: 'DATA_SCIENTIST', label: 'Data Scientist', emoji: '📊', category: 'Engineering',
    tagline: 'Turn your data into decisions',
    adaptiveFields: [
      { key: 'tools', label: 'Primary tools', type: 'multiselect', required: true,
        options: ['Python','R','SQL','Tableau','Power BI','Jupyter','Spark','dbt'] },
      { key: 'domain', label: 'Domain expertise', type: 'select',
        options: ['E-commerce','Finance','Healthcare','SaaS / B2B','Retail','EdTech','Manufacturing'] },
      { key: 'kaggleUrl', label: 'Kaggle / notebook link', type: 'url', placeholder: 'https://kaggle.com/yourname' },
    ],
    rateCardDefaults: {
      tier1Label: 'Data audit',     tier1Desc: 'Review your data quality and report gaps',               tier1Price: 5000,
      tier2Label: 'Analysis project',tier2Desc:'Full analysis with findings and recommendations',         tier2Price: 30000,
      tier3Label: 'ML model',       tier3Desc: 'End-to-end model from data to production',               tier3Price: 150000,
    },
    suggestedSkills: ['Python','SQL','Pandas','Scikit-learn','Tableau','Statistics','Machine Learning','dbt'],
    headlineTemplates: [
      'Data scientist turning messy datasets into revenue-driving insights',
      'ML engineer building production-grade models for growth teams',
    ],
  },

  ML_ENGINEER: {
    key: 'ML_ENGINEER', label: 'ML Engineer', emoji: '🤖', category: 'Engineering',
    tagline: 'AI that actually ships to production',
    adaptiveFields: [
      { key: 'frameworks', label: 'ML frameworks', type: 'multiselect', required: true,
        options: ['PyTorch','TensorFlow','Hugging Face','LangChain','OpenAI API','scikit-learn','XGBoost','ONNX'] },
      { key: 'specialisation', label: 'Specialisation', type: 'select',
        options: ['LLMs / RAG','Computer Vision','NLP','Recommendation Systems','Time Series','MLOps'] },
      { key: 'paperUrl', label: 'Paper / project link', type: 'url', placeholder: 'https://arxiv.org/...' },
    ],
    rateCardDefaults: {
      tier1Label: 'ML consult',    tier1Desc: '2-hour deep-dive on your ML problem',                    tier1Price: 6000,
      tier2Label: 'Model build',   tier2Desc: 'Training pipeline + deployed model endpoint',            tier2Price: 50000,
      tier3Label: 'ML system',     tier3Desc: 'Complete ML platform with monitoring',                   tier3Price: 200000,
    },
    suggestedSkills: ['PyTorch','Python','LLMs','RAG','MLOps','Docker','FastAPI','Hugging Face'],
    headlineTemplates: [
      'ML engineer building LLM-powered products that work in production',
      'AI engineer specialising in RAG systems and fine-tuned models',
    ],
  },

  DEVOPS_ENGINEER: {
    key: 'DEVOPS_ENGINEER', label: 'DevOps Engineer', emoji: '🛠️', category: 'Engineering',
    tagline: 'Ship faster, break less',
    adaptiveFields: [
      { key: 'cloudProviders', label: 'Cloud providers', type: 'multiselect', required: true,
        options: ['AWS','GCP','Azure','DigitalOcean','Hetzner','Cloudflare'] },
      { key: 'tools', label: 'Core tools', type: 'multiselect',
        options: ['Terraform','Kubernetes','Docker','Ansible','GitHub Actions','Jenkins','ArgoCD','Prometheus'] },
      { key: 'certifications', label: 'Certifications', type: 'text', placeholder: 'AWS Solutions Architect, CKA...' },
    ],
    rateCardDefaults: {
      tier1Label: 'Infra audit',   tier1Desc: 'Review and report on your current infrastructure',       tier1Price: 8000,
      tier2Label: 'CI/CD pipeline',tier2Desc: 'Full automated deploy pipeline setup',                   tier2Price: 35000,
      tier3Label: 'Platform build',tier3Desc: 'Production-grade Kubernetes platform',                   tier3Price: 180000,
    },
    suggestedSkills: ['AWS','Terraform','Docker','Kubernetes','CI/CD','GitHub Actions','Linux','Monitoring'],
    headlineTemplates: [
      'DevOps engineer setting up infrastructure that lets your team ship daily',
      'Platform engineer building zero-downtime deployments on AWS',
    ],
  },

  UI_UX_DESIGNER: {
    key: 'UI_UX_DESIGNER', label: 'UI/UX Designer', emoji: '✏️', category: 'Design',
    tagline: 'Design products users genuinely love',
    adaptiveFields: [
      { key: 'tools', label: 'Design tools', type: 'multiselect', required: true,
        options: ['Figma','Framer','Adobe XD','Sketch','Principle','Protopie','Maze'] },
      { key: 'portfolioUrl', label: 'Portfolio / Dribbble', type: 'url', required: true, placeholder: 'https://dribbble.com/yourname' },
      { key: 'specialisation', label: 'Specialisation', type: 'select',
        options: ['Product design','Design systems','Mobile app design','Web design','User research','Interaction design'] },
    ],
    rateCardDefaults: {
      tier1Label: 'Design audit',  tier1Desc: '2-hour review of your product with actionable fixes',     tier1Price: 5000,
      tier2Label: 'Design sprint', tier2Desc: '5-day sprint — wireframes, prototype, handoff',           tier2Price: 25000,
      tier3Label: 'Full product',  tier3Desc: 'End-to-end design from discovery to production',          tier3Price: 100000,
    },
    suggestedSkills: ['Figma','Design Systems','User Research','Prototyping','Framer','Wireframing','Accessibility'],
    headlineTemplates: [
      'Product designer helping SaaS startups ship interfaces users love',
      'UI/UX designer specialising in design systems for growing product teams',
    ],
  },

  GRAPHIC_DESIGNER: {
    key: 'GRAPHIC_DESIGNER', label: 'Graphic Designer', emoji: '🖼️', category: 'Design',
    tagline: 'Brand identity that people remember',
    adaptiveFields: [
      { key: 'tools', label: 'Design tools', type: 'multiselect', required: true,
        options: ['Adobe Illustrator','Photoshop','InDesign','Figma','Canva Pro','CorelDRAW'] },
      { key: 'portfolioUrl', label: 'Portfolio / Behance', type: 'url', required: true, placeholder: 'https://behance.net/yourname' },
      { key: 'specialisation', label: 'Specialisation', type: 'select',
        options: ['Brand identity','Logo design','Print / packaging','Social media graphics','Pitch decks','Illustration'] },
    ],
    rateCardDefaults: {
      tier1Label: 'Logo design',   tier1Desc: 'Logo with 3 concepts and source files',                  tier1Price: 5000,
      tier2Label: 'Brand identity',tier2Desc: 'Logo + colour palette + typography + guidelines',        tier2Price: 20000,
      tier3Label: 'Full brand kit',tier3Desc: 'Complete brand identity system for a growing company',   tier3Price: 75000,
    },
    suggestedSkills: ['Adobe Illustrator','Photoshop','Branding','Logo Design','Typography','Color Theory','Print'],
    headlineTemplates: [
      'Graphic designer crafting brand identities that build instant recognition',
      'Visual designer turning startup ideas into professional brand systems',
    ],
  },

  MOTION_DESIGNER: {
    key: 'MOTION_DESIGNER', label: 'Motion Designer', emoji: '🎬', category: 'Design',
    tagline: 'Make your brand move',
    adaptiveFields: [
      { key: 'tools', label: 'Tools', type: 'multiselect', required: true,
        options: ['After Effects','Cinema 4D','Lottie','Rive','Blender','Premiere Pro','DaVinci Resolve'] },
      { key: 'portfolioUrl', label: 'Showreel / portfolio', type: 'url', required: true, placeholder: 'https://vimeo.com/yourname' },
      { key: 'specialisation', label: 'Specialisation', type: 'select',
        options: ['UI animations','Brand animations','3D motion','Explainer videos','Social reels','Lottie / Rive'] },
    ],
    rateCardDefaults: {
      tier1Label: 'Animated logo', tier1Desc: 'Animated version of your logo (5s loop)',                tier1Price: 5000,
      tier2Label: 'Animation pack',tier2Desc: '5 branded motion assets for social + web',               tier2Price: 25000,
      tier3Label: 'Explainer video',tier3Desc: '60-second animated explainer, full production',         tier3Price: 80000,
    },
    suggestedSkills: ['After Effects','Lottie','Cinema 4D','Rive','Motion Graphics','Blender','Animation'],
    headlineTemplates: [
      'Motion designer giving brands a personality that moves',
      'Animation specialist creating Lottie and Rive micro-interactions for apps',
    ],
  },

  VIDEO_EDITOR: {
    key: 'VIDEO_EDITOR', label: 'Video Editor', emoji: '🎥', category: 'Creative',
    tagline: 'Videos that keep people watching',
    adaptiveFields: [
      { key: 'tools', label: 'Editing tools', type: 'multiselect', required: true,
        options: ['Premiere Pro','Final Cut Pro','DaVinci Resolve','After Effects','CapCut'] },
      { key: 'portfolioUrl', label: 'YouTube / Vimeo reel', type: 'url', required: true, placeholder: 'https://youtube.com/@yourname' },
      { key: 'specialisation', label: 'Specialisation', type: 'select',
        options: ['YouTube / long form','Instagram Reels','Corporate videos','Podcast editing','Wedding / events','Course content'] },
    ],
    rateCardDefaults: {
      tier1Label: 'Short reel',    tier1Desc: 'Edit a 60-90 second reel or short',                      tier1Price: 2000,
      tier2Label: 'YouTube video', tier2Desc: 'Edit a 10-15 min YouTube video, colour graded',           tier2Price: 8000,
      tier3Label: 'Monthly retainer',tier3Desc: '8 videos per month, full editing package',              tier3Price: 40000,
    },
    suggestedSkills: ['Premiere Pro','DaVinci Resolve','Color Grading','After Effects','Audio Mixing','Storytelling'],
    headlineTemplates: [
      'Video editor helping creators turn raw footage into content people share',
      'YouTube editor specialising in long-form educational and business content',
    ],
  },

  CONTENT_WRITER: {
    key: 'CONTENT_WRITER', label: 'Content Writer', emoji: '✍️', category: 'Content',
    tagline: 'Content that ranks and converts',
    adaptiveFields: [
      { key: 'niches', label: 'Writing niches', type: 'multiselect', required: true,
        options: ['SaaS / B2B','Tech / Developer','Finance','Healthcare','E-commerce','EdTech','Travel','HR / People'] },
      { key: 'portfolioUrl', label: 'Portfolio / Substack', type: 'url', placeholder: 'https://substack.com/@yourname' },
      { key: 'wordsPerArticle', label: 'Typical article length', type: 'select',
        options: ['500–800 words','800–1,200 words','1,200–2,000 words','2,000–3,500 words','3,500+ words'] },
    ],
    rateCardDefaults: {
      tier1Label: 'Single article',tier1Desc: '800–1,200 word SEO article, fully researched',            tier1Price: 2500,
      tier2Label: 'Content bundle',tier2Desc: '4 articles per month, content strategy included',         tier2Price: 12000,
      tier3Label: 'Monthly retainer',tier3Desc: '8 long-form articles + 2 pillar pages per month',      tier3Price: 35000,
    },
    suggestedSkills: ['SEO Writing','Research','Long-form Content','CMS','WordPress','Editing','Topic Clustering'],
    headlineTemplates: [
      'B2B content writer helping SaaS companies rank on Google and convert readers',
      'Tech content writer making complex topics readable for busy founders',
    ],
  },

  COPYWRITER: {
    key: 'COPYWRITER', label: 'Copywriter', emoji: '📝', category: 'Content',
    tagline: 'Words that make people click and buy',
    adaptiveFields: [
      { key: 'specialisation', label: 'Copy specialisation', type: 'select', required: true,
        options: ['Landing pages','Email sequences','Ad copy','Product descriptions','Sales pages','Brand voice'] },
      { key: 'industries', label: 'Industry experience', type: 'multiselect',
        options: ['E-commerce','SaaS','D2C brands','Finance','Health & wellness','Coaching / courses'] },
      { key: 'portfolioUrl', label: 'Portfolio link', type: 'url', placeholder: 'https://yourportfolio.com' },
    ],
    rateCardDefaults: {
      tier1Label: 'Single page',   tier1Desc: 'One landing page or email, optimised for conversion',    tier1Price: 5000,
      tier2Label: 'Launch copy kit',tier2Desc:'Landing page + 3 emails + ad copy variants',             tier2Price: 20000,
      tier3Label: 'Full funnel',   tier3Desc: 'Complete acquisition funnel from ad to checkout',        tier3Price: 60000,
    },
    suggestedSkills: ['Conversion Copywriting','Email Marketing','Landing Pages','A/B Testing','Brand Voice','Direct Response'],
    headlineTemplates: [
      'Copywriter writing landing pages that turn visitors into paying customers',
      'Email copywriter helping D2C brands generate revenue on autopilot',
    ],
  },

  SEO_SPECIALIST: {
    key: 'SEO_SPECIALIST', label: 'SEO Specialist', emoji: '🔍', category: 'Marketing',
    tagline: 'Get found on Google. Get customers.',
    adaptiveFields: [
      { key: 'tools', label: 'SEO tools', type: 'multiselect', required: true,
        options: ['Ahrefs','Semrush','Moz','Google Search Console','Screaming Frog','Surfer SEO','Google Analytics'] },
      { key: 'specialisation', label: 'SEO focus', type: 'select',
        options: ['Technical SEO','On-page SEO','Link building','Local SEO','E-commerce SEO','Content SEO'] },
      { key: 'caseStudyUrl', label: 'Case study link', type: 'url', placeholder: 'https://yoursite.com/case-study' },
    ],
    rateCardDefaults: {
      tier1Label: 'SEO audit',     tier1Desc: 'Full technical + on-page audit with priority fixes',      tier1Price: 8000,
      tier2Label: 'SEO sprint',    tier2Desc: '30-day sprint: audit + on-page + content + links',       tier2Price: 30000,
      tier3Label: 'Monthly SEO',   tier3Desc: 'Ongoing SEO management — 6 month commitment',            tier3Price: 25000,
    },
    suggestedSkills: ['Ahrefs','Semrush','Technical SEO','Link Building','Content Strategy','Google Analytics','Core Web Vitals'],
    headlineTemplates: [
      'SEO specialist helping B2B SaaS companies rank for their best keywords',
      'Technical SEO expert turning crawl errors into traffic and revenue',
    ],
  },

  SOCIAL_MEDIA_MANAGER: {
    key: 'SOCIAL_MEDIA_MANAGER', label: 'Social Media Manager', emoji: '📲', category: 'Marketing',
    tagline: 'Build an audience that actually buys',
    adaptiveFields: [
      { key: 'platforms', label: 'Platforms managed', type: 'multiselect', required: true,
        options: ['Instagram','LinkedIn','Twitter / X','YouTube','Facebook','Pinterest','TikTok','Threads'] },
      { key: 'tools', label: 'Tools used', type: 'multiselect',
        options: ['Buffer','Hootsuite','Later','Canva','Notion','Metricool','Sprout Social'] },
      { key: 'niches', label: 'Brand niches', type: 'multiselect',
        options: ['D2C / E-commerce','B2B SaaS','Personal brands','Food & beverage','Real estate','Health & wellness'] },
    ],
    rateCardDefaults: {
      tier1Label: 'Content audit',  tier1Desc: 'Audit + strategy doc for one platform',                 tier1Price: 4000,
      tier2Label: 'Monthly mgmt',   tier2Desc: 'Manage one platform — content, posting, engagement',    tier2Price: 15000,
      tier3Label: 'Full presence',  tier3Desc: 'Manage 3 platforms — strategy, content, analytics',    tier3Price: 40000,
    },
    suggestedSkills: ['Instagram','LinkedIn','Content Strategy','Canva','Analytics','Community Management','Copywriting'],
    headlineTemplates: [
      'Social media manager growing personal brands and D2C businesses on Instagram',
      'LinkedIn content strategist helping founders build thought leadership',
    ],
  },

  PRODUCT_MANAGER: {
    key: 'PRODUCT_MANAGER', label: 'Product Manager', emoji: '📋', category: 'Business',
    tagline: 'Ship the right product, not just a product',
    adaptiveFields: [
      { key: 'productType', label: 'Product type', type: 'select', required: true,
        options: ['B2B SaaS','B2C app','Marketplace','API / developer tools','E-commerce','Platform'] },
      { key: 'tools', label: 'Tools', type: 'multiselect',
        options: ['Jira','Linear','Notion','Figma','Amplitude','Mixpanel','Productboard','Miro'] },
      { key: 'linkedinUrl', label: 'LinkedIn profile', type: 'url', placeholder: 'https://linkedin.com/in/yourname' },
    ],
    rateCardDefaults: {
      tier1Label: 'Product audit', tier1Desc: '4-hour discovery: user flows, roadmap gaps, quick wins', tier1Price: 8000,
      tier2Label: 'Sprint PM',     tier2Desc: 'Act as interim PM for a 2-week product sprint',          tier2Price: 35000,
      tier3Label: 'Fractional PM', tier3Desc: 'Ongoing fractional PM — 2 days/week',                    tier3Price: 60000,
    },
    suggestedSkills: ['Product Strategy','Roadmapping','User Research','Jira','OKRs','Agile','Data Analysis','Stakeholder Management'],
    headlineTemplates: [
      'Fractional PM helping early-stage startups build products users actually want',
      'Product manager with 6 years in B2B SaaS helping teams ship with clarity',
    ],
  },

  BUSINESS_ANALYST: {
    key: 'BUSINESS_ANALYST', label: 'Business Analyst', emoji: '📈', category: 'Business',
    tagline: 'Clarity before you build anything',
    adaptiveFields: [
      { key: 'domain', label: 'Domain', type: 'select', required: true,
        options: ['IT / Software','Finance','Operations','Supply chain','Healthcare','Banking','E-commerce'] },
      { key: 'tools', label: 'Tools', type: 'multiselect',
        options: ['Excel / Sheets','SQL','Power BI','Tableau','JIRA','Confluence','Visio','Lucidchart'] },
      { key: 'certifications', label: 'Certifications', type: 'text', placeholder: 'CBAP, PMI-PBA, ECBA...' },
    ],
    rateCardDefaults: {
      tier1Label: 'Requirements doc',tier1Desc:'Gather and document requirements for one module',        tier1Price: 6000,
      tier2Label: 'Process mapping',tier2Desc: 'Map and optimise a complete business process',          tier2Price: 25000,
      tier3Label: 'Full BA engagement',tier3Desc:'End-to-end BA for a project or system rollout',       tier3Price: 80000,
    },
    suggestedSkills: ['Requirements Gathering','Process Mapping','SQL','Power BI','Stakeholder Management','BPMN','Use Cases'],
    headlineTemplates: [
      'Business analyst helping IT teams build the right thing the first time',
      'BA with 7 years in fintech turning business problems into clear requirements',
    ],
  },

  FINANCIAL_CONSULTANT: {
    key: 'FINANCIAL_CONSULTANT', label: 'Financial Consultant', emoji: '💰', category: 'Business',
    tagline: 'Numbers that make your decisions easy',
    adaptiveFields: [
      { key: 'specialisation', label: 'Specialisation', type: 'select', required: true,
        options: ['Startup finance','CFO services','Financial modelling','Tax planning','Fundraising prep','M&A','Personal finance'] },
      { key: 'qualifications', label: 'Qualifications', type: 'text', placeholder: 'CA, CFA, MBA (Finance)...' },
      { key: 'tools', label: 'Tools', type: 'multiselect',
        options: ['Excel','Tally','QuickBooks','Zoho Books','Power BI','SAP','Xero'] },
    ],
    rateCardDefaults: {
      tier1Label: 'Financial review',tier1Desc: 'Review financials and identify top 3 risks',            tier1Price: 8000,
      tier2Label: 'Financial model',tier2Desc: 'Build a 3-year financial model with scenarios',         tier2Price: 35000,
      tier3Label: 'Fractional CFO', tier3Desc: 'Ongoing fractional CFO support — 1 day/week',           tier3Price: 50000,
    },
    suggestedSkills: ['Financial Modelling','Excel','Tax Planning','Fundraising','P&L','Cash Flow','Valuation','Compliance'],
    headlineTemplates: [
      'CA helping funded startups build financial models investors trust',
      'Fractional CFO turning financial chaos into clean monthly reporting',
    ],
  },

  LEGAL_CONSULTANT: {
    key: 'LEGAL_CONSULTANT', label: 'Legal Consultant', emoji: '⚖️', category: 'Business',
    tagline: 'Legal protection without the law firm price tag',
    adaptiveFields: [
      { key: 'practiceArea', label: 'Practice area', type: 'select', required: true,
        options: ['Startup law','Corporate law','IP & trademarks','Employment law','Contract drafting','GDPR / privacy','Real estate'] },
      { key: 'barCouncil', label: 'Bar council / enrollment', type: 'text', placeholder: 'Bar Council of Maharashtra, 2018' },
      { key: 'experience', label: 'Years of practice', type: 'number', placeholder: '5' },
    ],
    rateCardDefaults: {
      tier1Label: 'Document review',tier1Desc: 'Review and redline one contract or agreement',           tier1Price: 5000,
      tier2Label: 'Legal package',  tier2Desc: 'Draft 3 agreements + 1-hour advisory call',             tier2Price: 20000,
      tier3Label: 'Monthly retainer',tier3Desc:'Ongoing legal support for your startup',                 tier3Price: 30000,
    },
    suggestedSkills: ['Contract Drafting','Startup Law','IP & Trademarks','Employment Law','GDPR','NDAs','Due Diligence'],
    headlineTemplates: [
      'Startup lawyer helping founders get their legal foundation right from day one',
      'IP lawyer protecting your brand and product with practical, fast advice',
    ],
  },

  MARKETING_CONSULTANT: {
    key: 'MARKETING_CONSULTANT', label: 'Marketing Consultant', emoji: '📣', category: 'Marketing',
    tagline: 'Strategy that fills your pipeline',
    adaptiveFields: [
      { key: 'specialisation', label: 'Marketing focus', type: 'select', required: true,
        options: ['Growth strategy','Performance marketing','Brand marketing','GTM strategy','Content marketing','Demand generation','ABM'] },
      { key: 'channels', label: 'Channels', type: 'multiselect',
        options: ['Google Ads','Meta Ads','LinkedIn Ads','Email','SEO','Influencer','Event marketing','PR'] },
      { key: 'industries', label: 'Industries', type: 'multiselect',
        options: ['SaaS','E-commerce','D2C','B2B','Healthcare','EdTech','Fintech'] },
    ],
    rateCardDefaults: {
      tier1Label: 'Marketing audit',tier1Desc: 'Audit current marketing + 30-day action plan',          tier1Price: 10000,
      tier2Label: 'GTM strategy',   tier2Desc: 'Full go-to-market plan with channel strategy',         tier2Price: 40000,
      tier3Label: 'Fractional CMO', tier3Desc: 'Ongoing marketing leadership — 2 days/week',           tier3Price: 70000,
    },
    suggestedSkills: ['Growth Strategy','Performance Marketing','Google Ads','Meta Ads','Email Marketing','Analytics','Brand Strategy'],
    headlineTemplates: [
      'Growth marketing consultant helping B2B startups build predictable pipeline',
      'Fractional CMO helping D2C brands scale profitably past ₹1Cr monthly revenue',
    ],
  },

  PHOTOGRAPHER: {
    key: 'PHOTOGRAPHER', label: 'Photographer', emoji: '📷', category: 'Creative',
    tagline: 'Photos that make people stop scrolling',
    adaptiveFields: [
      { key: 'specialisation', label: 'Photography type', type: 'select', required: true,
        options: ['Product photography','Brand / corporate','Food photography','Portrait','Event','Real estate','Fashion','Wedding'] },
      { key: 'portfolioUrl', label: 'Portfolio / Instagram', type: 'url', required: true, placeholder: 'https://instagram.com/yourname' },
      { key: 'equipment', label: 'Camera system', type: 'select',
        options: ['Sony','Canon','Nikon','Fujifilm','Leica','Hasselblad'] },
      { key: 'turnaroundDays', label: 'Delivery time (days)', type: 'number', placeholder: '5' },
    ],
    rateCardDefaults: {
      tier1Label: 'Half-day shoot', tier1Desc: '4-hour shoot, 30 edited images',                        tier1Price: 8000,
      tier2Label: 'Full-day shoot', tier2Desc: '8-hour shoot, 80 edited images + raw files',            tier2Price: 20000,
      tier3Label: 'Monthly content',tier3Desc: '2 shoots per month, 60 edited images, usage rights',   tier3Price: 35000,
    },
    suggestedSkills: ['Adobe Lightroom','Photoshop','Product Photography','Lighting','Retouching','Art Direction','Composition'],
    headlineTemplates: [
      'Product photographer helping D2C brands shoot content that converts on Instagram',
      'Brand photographer creating visual stories for premium Indian companies',
    ],
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getAllTalentTypes(): TalentTypeConfig[] {
  return Object.values(TALENT_TYPES)
}

export function getTalentTypesByCategory(): Record<TalentCategory, TalentTypeConfig[]> {
  const grouped = {
    Engineering: [], Design: [], Content: [],
    Marketing: [], Business: [], Creative: [],
  } as Record<TalentCategory, TalentTypeConfig[]>
  Object.values(TALENT_TYPES).forEach(t => grouped[t.category].push(t))
  return grouped
}

export function getTalentTypeConfig(key: TalentTypeKey): TalentTypeConfig {
  return TALENT_TYPES[key]
}

export function getTalentTypeLabel(key: string): string {
  return TALENT_TYPES[key as TalentTypeKey]?.label ?? key
}

export function getTalentTypeEmoji(key: string): string {
  return TALENT_TYPES[key as TalentTypeKey]?.emoji ?? '💼'
}

export const CATEGORY_ORDER: TalentCategory[] = [
  'Engineering', 'Design', 'Content', 'Marketing', 'Business', 'Creative',
]
