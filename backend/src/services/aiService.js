import OpenAI from 'openai';

// Initialize OpenAI client if key is provided
const getOpenAIClient = () => {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return null;
};

/**
 * 1. AI Resume Analyzer
 * Evaluates candidate resume text, extracts skills, calculates quality score,
 * highlights strengths, weaknesses, missing industry skills, and actionable advice.
 */
export const analyzeResumeService = async (resumeText) => {
  const openai = getOpenAIClient();

  if (openai) {
    try {
      const prompt = `You are an expert HR and Technical Talent Acquisition Director.
Analyze the following resume text and provide a structured assessment in strictly valid JSON format.
JSON schema:
{
  "score": number (0-100),
  "summary": "concise 2-sentence executive summary of the candidate's profile",
  "strengths": ["string", "string", ...],
  "weaknesses": ["string", "string", ...],
  "extractedSkills": ["string", "string", ...],
  "missingSkills": ["string", "string", ...],
  "suggestions": ["string", "string", ...]
}

Resume Text:
${resumeText.slice(0, 4000)}
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      return parsed;
    } catch (err) {
      console.warn(`[OpenAI API Warning]: ${err.message}. Falling back to smart heuristic analyzer.`);
    }
  }

  // Heuristic Smart Fallback Engine
  const commonTechSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL',
    'Python', 'AWS', 'Docker', 'Kubernetes', 'Git', 'REST API', 'GraphQL', 'Tailwind CSS',
    'HTML', 'CSS', 'Redux', 'Next.js', 'CI/CD', 'Jest', 'Redis', 'Microservices', 'SQL'
  ];

  const lowerText = resumeText.toLowerCase();
  const matchedSkills = commonTechSkills.filter((skill) =>
    lowerText.includes(skill.toLowerCase())
  );

  const wordCount = resumeText.trim().split(/\s+/).length;
  let score = 65;
  if (matchedSkills.length >= 8) score += 20;
  else if (matchedSkills.length >= 4) score += 12;
  else score += 5;

  if (wordCount > 250) score += 10;
  if (lowerText.includes('experience') || lowerText.includes('project')) score += 5;
  score = Math.min(Math.max(score, 45), 96);

  const allMissing = commonTechSkills.filter((s) => !matchedSkills.includes(s));
  const suggestedMissing = allMissing.slice(0, 4);

  return {
    score,
    summary: `Candidate displays solid technical foundational skills with ${matchedSkills.length} identified core competencies and clear exposure to software development cycles.`,
    strengths: [
      `Strong technical foundation demonstrated in: ${matchedSkills.slice(0, 5).join(', ') || 'General Engineering'}`,
      'Clear project and role involvement indicated throughout the text',
      'Good articulation of technical concepts and work experience'
    ],
    weaknesses: [
      'Could incorporate more quantifiable achievements (e.g. reduced latency by 30%, grew user base by 50%)',
      'Could elaborate on production cloud deployment and automated testing pipelines'
    ],
    extractedSkills: matchedSkills.length > 0 ? matchedSkills : ['General Problem Solving', 'Communication', 'Software Development'],
    missingSkills: suggestedMissing.length > 0 ? suggestedMissing : ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    suggestions: [
      'Add measurable metrics (percentages, dollar values, user counts) to each role description.',
      'Highlight architectural decision-making and performance optimization experience.',
      'Include links to active GitHub repositories or deployed live web applications.'
    ]
  };
};

/**
 * 2. AI Job ↔ Candidate Matching
 */
export const matchJobService = async (candidateProfile, job) => {
  const openai = getOpenAIClient();

  const candidateSkills = (candidateProfile?.skills || []).map((s) => s.toLowerCase());
  const jobSkills = (job.skills || []).map((s) => s.toLowerCase());

  if (openai) {
    try {
      const prompt = `You are an AI recruitment matchmaker.
Evaluate the candidate against the job specifications and return strictly valid JSON:
{
  "matchScore": number (0-100),
  "strongMatches": ["skill or qualification matched"],
  "missingSkills": ["important job requirement missing from candidate profile"],
  "recommendation": "e.g. 'Strong match — highly recommended to apply' or 'Fair match with minor skill gaps'",
  "insights": "2 concise sentences explaining why this job fits or does not fit the candidate"
}

Candidate:
- Headline: ${candidateProfile?.headline || 'N/A'}
- Skills: ${candidateProfile?.skills?.join(', ') || 'N/A'}
- Bio: ${candidateProfile?.bio || 'N/A'}

Job:
- Title: ${job.title}
- Company: ${job.company}
- Required Skills: ${job.skills?.join(', ') || 'N/A'}
- Requirements: ${job.requirements?.join('; ') || 'N/A'}
- Experience Level: ${job.experienceLevel}
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (err) {
      console.warn(`[OpenAI Match Warning]: ${err.message}. Using heuristic matcher.`);
    }
  }

  // Heuristic Matcher
  const matched = (job.skills || []).filter((s) =>
    candidateSkills.some((cs) => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs))
  );
  const missing = (job.skills || []).filter((s) => !matched.includes(s));

  const totalRequired = Math.max(job.skills?.length || 1, 1);
  let baseScore = Math.round((matched.length / totalRequired) * 70) + 25;
  baseScore = Math.min(Math.max(baseScore, 35), 98);

  let recommendation = 'Good match — consider applying';
  if (baseScore >= 80) recommendation = 'Outstanding match — highly recommended to apply!';
  else if (baseScore < 60) recommendation = 'Moderate match — consider acquiring missing skills first';

  return {
    matchScore: baseScore,
    strongMatches: matched.length > 0 ? matched : ['Relevant Technical Mindset'],
    missingSkills: missing.length > 0 ? missing : ['No critical skill gaps detected'],
    recommendation,
    insights: `You match ${matched.length} out of ${job.skills?.length || 0} core requested skills for ${job.title} at ${job.company}. Your technical profile aligns well with the position's requirements.`
  };
};

/**
 * 3. AI Job Description Generator (for Recruiters)
 */
export const generateJobDescriptionService = async ({ title, skills, experienceLevel, company, workplaceType }) => {
  const openai = getOpenAIClient();

  if (openai) {
    try {
      const prompt = `You are a professional talent consultant. Generate a compelling, high-converting job post in strictly valid JSON format:
{
  "title": "${title}",
  "description": "rich markdown string describing role overview, mission, and culture",
  "requirements": ["requirement 1", "requirement 2", ...],
  "responsibilities": ["responsibility 1", "responsibility 2", ...],
  "skills": ["skill1", "skill2", ...],
  "suggestedSalary": { "min": number, "max": number, "currency": "USD", "period": "year" }
}

Details:
- Title: ${title}
- Target Company: ${company || 'Our Company'}
- Key Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}
- Experience Level: ${experienceLevel || 'Mid'}
- Workplace: ${workplaceType || 'Remote'}
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.4
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (err) {
      console.warn(`[OpenAI Generator Warning]: ${err.message}. Using intelligent template generator.`);
    }
  }

  // Heuristic Template Generator
  const skillsArray = Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s) => s.trim()) : ['Full Stack Development', 'Problem Solving']);

  return {
    title: title || 'Senior Software Engineer',
    description: `We are looking for an exceptional **${title}** to join ${company || 'our engineering team'}. In this role, you will lead the architecture, development, and scaling of mission-critical systems that serve thousands of daily users. You will work closely with cross-functional partners in product, design, and operations in a collaborative ${workplaceType || 'Remote'} environment.`,
    responsibilities: [
      `Architect, develop, and maintain performant, scalable services using ${skillsArray.slice(0, 3).join(', ') || 'modern stacks'}.`,
      'Collaborate with product designers and frontend teams to deliver seamless user experiences.',
      'Participate in comprehensive peer code reviews and mentor junior developers.',
      'Ensure high standards of software quality through automated testing, monitoring, and CI/CD pipelines.'
    ],
    requirements: [
      `Demonstrated experience as a ${title} or comparable technical role (${experienceLevel || 'Mid'} level).`,
      `Hands-on proficiency with ${skillsArray.join(', ')}.`,
      'Deep understanding of RESTful API design, database modeling, and distributed systems.',
      'Strong problem-solving abilities and clear verbal/written communication skills.'
    ],
    skills: skillsArray,
    suggestedSalary: {
      min: experienceLevel === 'Senior' ? 120000 : 80000,
      max: experienceLevel === 'Senior' ? 175000 : 130000,
      currency: 'USD',
      period: 'year'
    }
  };
};

/**
 * 4. AI Interview Preparation
 * Generates initial questions or fetches additional questions while preserving previous ones
 */
export const generateInterviewPrepService = async (job, options = {}) => {
  const { excludeQuestions = [], page = 1, count = 3 } = options;
  const openai = getOpenAIClient();

  const isMore = page > 1 || excludeQuestions.length > 0;
  const techCount = isMore ? count : 5;
  const behCount = isMore ? Math.max(1, count - 1) : 4;

  if (openai) {
    try {
      const prompt = `You are a Principal Technical Interviewer.
Generate high-yield interview questions and model answers for the following job in strictly valid JSON format.
${isMore ? `IMPORTANT: Generate ${techCount} NEW technical questions and ${behCount} NEW behavioral questions that are DIFFERENT from previous ones.` : `Generate ${techCount} technical questions and ${behCount} behavioral questions.`}
${excludeQuestions.length > 0 ? `Do NOT repeat any of these questions:\n${excludeQuestions.slice(-10).join('\n')}` : ''}

JSON schema:
{
  "technicalQuestions": [
    { "question": "string", "sampleAnswer": "concise expert answer", "tip": "interviewer insight" }
  ],
  "behavioralQuestions": [
    { "question": "string", "sampleAnswer": "STAR-method answer", "tip": "interviewer insight" }
  ],
  "roleSpecificQuestions": [
    { "question": "string", "sampleAnswer": "answer", "tip": "advice" }
  ],
  "generalTips": ["string", "string", "string"]
}

Job Details:
Title: ${job.title}
Company: ${job.company || 'Tech Company'}
Skills: ${job.skills?.join(', ') || 'Fullstack Engineering'}
Requirements: ${job.requirements?.join('; ') || 'Scalable Software Development'}
Experience: ${job.experienceLevel || 'Mid-to-Senior'}
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.4
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (err) {
      console.warn(`[OpenAI Interview Prep Warning]: ${err.message}. Using intelligent heuristic prep.`);
    }
  }

  // Comprehensive Heuristic Interview Prep Engine
  const mainSkill = job.skills?.[0] || 'Software Architecture';
  const secondSkill = job.skills?.[1] || 'System Design';
  const company = job.company || 'our company';
  const title = job.title || 'Software Engineer';

  // Comprehensive Technical Question Pool
  const allTechnicalQuestions = [
    {
      question: `How do you handle state management, scalability, and asynchronous side-effects when building applications with ${mainSkill}?`,
      sampleAnswer: `I maintain strict unidirectional data flow, decouple business logic into custom hooks or dedicated services, and leverage normalized caching patterns (such as Redux Toolkit or React Query) to minimize memory overhead and eliminate unnecessary re-renders.`,
      tip: `Interviewers look for understanding of memory consumption, caching strategies, and race conditions.`
    },
    {
      question: `Explain how you would design a RESTful or GraphQL API to handle high-concurrency requests with rate limiting and database indexing.`,
      sampleAnswer: `I implement compound indexes matching typical query predicates, introduce Redis-based token bucket rate limiting at the API gateway layer, and optimize payload size with pagination and field projection.`,
      tip: `Focus on bottleneck identification and database query execution plans.`
    },
    {
      question: `Walk me through how you approach debugging a high-latency issue or memory leak in a production application.`,
      sampleAnswer: `I first verify telemetry metrics (APM, p99 latency charts), isolate database slow queries using explain plans, inspect external network dependencies, and capture heap snapshots / CPU profiles under synthetic load.`,
      tip: `Highlight systematic root-cause diagnosis over random trial-and-error.`
    },
    {
      question: `How would you architect a database schema and caching layer (e.g. Redis) to support millions of real-time search queries without degrading performance?`,
      sampleAnswer: `I use a multi-tier caching strategy: CDN for edge assets, distributed Redis clusters for hot query results with cache-aside pattern and jittered TTLs to prevent stampedes, and replica read-pools for database reads.`,
      tip: `Demonstrate understanding of cache invalidation strategies and eventual consistency.`
    },
    {
      question: `How do you implement secure authentication, JWT token rotation, and mitigate common vulnerabilities (CSRF, XSS, injection) in modern web applications?`,
      sampleAnswer: `I store short-lived JWTs in memory, use httpOnly Secure SameSite cookies for refresh tokens, implement cryptographic token rotation with reuse detection, and enforce strict input validation with sanitization (e.g., Zod) and Helmet security headers.`,
      tip: `Interviewers value practical security hygiene and defense-in-depth architecture.`
    },
    {
      question: `Describe how you design asynchronous background workers or message queues (e.g. BullMQ, RabbitMQ, Kafka) for heavy processing tasks without blocking user requests.`,
      sampleAnswer: `I decouple intensive operations from the HTTP lifecycle by pushing events to durable message queues. Workers process jobs concurrently with exponential backoff retries, dead-letter queues (DLQ) for poisoned messages, and idempotent consumers.`,
      tip: `Highlight idempotency, consumer backpressure, and fault tolerance.`
    },
    {
      question: `How do you ensure zero-downtime deployments and manage database schema migrations in production systems?`,
      sampleAnswer: `I employ the expand-and-contract (parallel change) pattern: add new nullable columns/tables first, deploy code that writes to both old and new schemas, backfill legacy records asynchronously, and finally deprecate the old schema once verified.`,
      tip: `Showcase backward compatibility and graceful fallback rollout procedures.`
    },
    {
      question: `How do you evaluate and optimize frontend bundle sizes, critical rendering paths, and Core Web Vitals for applications built with ${mainSkill}?`,
      sampleAnswer: `I use dynamic route-level code splitting via React.lazy/Suspense, analyze webpack/vite bundle visualizers to eliminate duplicate dependencies, optimize LCP through modern image formats (WebP/AVIF) and preloading, and eliminate CLS with fixed aspect ratios.`,
      tip: `Discuss real user monitoring (RUM) and Lighthouse metric benchmarks.`
    },
    {
      question: `Explain the mechanics of database indexing (B-trees, compound indexes, covered queries) and how you diagnose slow queries using EXPLAIN plans.`,
      sampleAnswer: `Indexes use balanced tree structures to reduce search time from O(n) table scans to O(log n). For compound indexes, I adhere to the Equality-Sort-Range (ESR) rule and inspect execution stats for 'COLLSCAN' vs 'IXSCAN' in EXPLAIN outputs.`,
      tip: `Highlight how unnecessary indexes also penalize write operations.`
    },
    {
      question: `How do you architect real-time bidirectional communication (WebSockets / SSE) with horizontal scaling across multiple servers?`,
      sampleAnswer: `I use WebSockets backed by a Redis Pub/Sub or cluster adapter (like socket.io-redis) so instances can broadcast messages across nodes, paired with sticky sessions or token-based authentication handshakes.`,
      tip: `Mention connection pooling, heartbeat ping-pong timeouts, and reconnection backoff.`
    },
    {
      question: `What is your testing pyramid philosophy and how do you design automated testing suites for a ${title} position?`,
      sampleAnswer: `I maintain a broad base of fast unit tests for business logic, integration tests for API contracts and database interactions, and selective end-to-end smoke tests for critical user conversion funnels in CI/CD.`,
      tip: `Discuss test maintainability, mock boundaries, and deterministic execution.`
    },
    {
      question: `How do you handle rate-limiting, circuit-breaking, and graceful degradation under sudden 10x traffic spikes?`,
      sampleAnswer: `I implement distributed rate limiting at the API gateway with Redis, wrap third-party API dependencies with circuit breakers (e.g. opossum) to fail fast, and enable degraded fallbacks (e.g. cached stale data) when downstream services saturate.`,
      tip: `Focus on preserving core user experiences even when non-critical features fail.`
    }
  ];

  // Comprehensive Behavioral Question Pool
  const allBehavioralQuestions = [
    {
      question: `Tell me about a time you had a technical disagreement with a colleague or product manager. How did you resolve it?`,
      sampleAnswer: `In a previous project, we disagreed on database schema denormalization. I benchmarked both approaches with synthetic query workloads and presented clear trade-offs, which enabled consensus based on objective data rather than opinion.`,
      tip: `Always use the STAR format (Situation, Task, Action, Result) and demonstrate empathy and objectivity.`
    },
    {
      question: `Describe a situation where a production bug slipped through. What did you learn and how did you prevent recurrence?`,
      sampleAnswer: `A race condition caused duplicate records during peak flash sales. I patched the transaction isolation level immediately, added automated regression integration tests, and updated our team post-mortem checklist.`,
      tip: `Take ownership, avoid blaming others, and focus on systemic improvements.`
    },
    {
      question: `Tell me about a time you had to deliver a critical feature under severe time constraints. How did you balance speed versus technical debt?`,
      sampleAnswer: `Ahead of a major client demo, we had 48 hours to ship a reporting engine. I scoped an MVP focusing strictly on primary query paths, documented deferred refactorings in our backlog, and scheduled a dedicated hardening sprint right after launch.`,
      tip: `Demonstrate pragmatic business alignment while maintaining engineering discipline.`
    },
    {
      question: `Describe a scenario where you had to collaborate with non-technical stakeholders to scope and deliver a complex feature.`,
      sampleAnswer: `When designing an analytics dashboard for operations teams, I translated technical latency trade-offs into plain business terms, created clickable prototypes to validate requirements early, and conducted weekly demos.`,
      tip: `Highlight active listening, plain-language communication, and empathy.`
    },
    {
      question: `Give an example of a project where requirements were ambiguous or constantly shifting. How did you establish clarity and maintain team momentum?`,
      sampleAnswer: `When launching a new recommendation feature without clear specs, I organized collaborative discovery workshops, defined clear milestone acceptance criteria, and iterated in 1-week feedback cycles with end users.`,
      tip: `Showcase adaptability, proactive initiative, and leadership under uncertainty.`
    },
    {
      question: `Tell me about a time you gave constructive feedback during a code review or mentored an engineer who was struggling.`,
      sampleAnswer: `A junior engineer was struggling with asynchronous state flow. Instead of simply pointing out errors, I paired with them to walk through asynchronous call stacks visually and shared reference implementations, boosting their subsequent velocity.`,
      tip: `Highlight patience, constructive coaching, and team-first mindset.`
    },
    {
      question: `Can you share an experience where an architectural decision you advocated for did not turn out as planned? What did you do?`,
      sampleAnswer: `I advocated for a micro-frontend setup that introduced too much bundle overhead and build complexity for our team size. I recognized the friction early, presented the data openly, and guided a clean migration back to a modular monorepo.`,
      tip: `Admitting mistakes with data and pivoting without ego is a hallmark of senior engineers.`
    },
    {
      question: `Tell me about a situation where you had to rapidly learn a new technology or domain to unblock a deliverable.`,
      sampleAnswer: `When tasked with integrating vector embeddings for an AI search pipeline, I researched vector database indexes (HNSW), built a small proof-of-concept benchmark over a weekend, and led a tech-share session for the broader team.`,
      tip: `Emphasize curiosity, structured learning, and knowledge sharing.`
    }
  ];

  // Filter out questions that have already been displayed
  const filterUnused = (pool, excludes) => {
    if (!excludes || excludes.length === 0) return pool;
    const filtered = pool.filter((item) =>
      !excludes.some((ex) => ex && (ex.toLowerCase().includes(item.question.slice(0, 30).toLowerCase()) || item.question.toLowerCase().includes(ex.slice(0, 30).toLowerCase())))
    );
    return filtered.length > 0 ? filtered : pool;
  };

  const availableTech = filterUnused(allTechnicalQuestions, excludeQuestions);
  const availableBeh = filterUnused(allBehavioralQuestions, excludeQuestions);

  // Slice questions based on current page / count
  const startIndex = isMore ? ((page - 1) * count) % allTechnicalQuestions.length : 0;
  const selectedTech = availableTech.slice(0, techCount);
  const selectedBeh = availableBeh.slice(0, behCount);

  return {
    technicalQuestions: selectedTech.length > 0 ? selectedTech : allTechnicalQuestions.slice(startIndex, startIndex + techCount),
    behavioralQuestions: selectedBeh.length > 0 ? selectedBeh : allBehavioralQuestions.slice(0, behCount),
    roleSpecificQuestions: [
      {
        question: `Why are you interested in joining ${company} as a ${title}?`,
        sampleAnswer: `Your mission and engineering challenges directly match my passion for building resilient software with ${mainSkill} and ${secondSkill}.`,
        tip: `Mention company values and specific technical problems relevant to ${company}.`
      },
      {
        question: `How does your prior experience with ${mainSkill} position you to make an immediate impact on our engineering goals?`,
        sampleAnswer: `Having designed production systems from scratch, I can immediately contribute to system scalability, code quality, and peer mentorship within your sprints.`,
        tip: `Focus on time-to-productivity and team velocity.`
      }
    ],
    generalTips: [
      `Review key data structures, distributed system fundamentals, and architectural trade-offs relevant to ${mainSkill}.`,
      `Frame your answers using the STAR method (Situation, Task, Action, Result) with quantifiable impact.`,
      `Have 2-3 prepared questions for your interviewers concerning team culture, deployment cadence, and technical debt.`,
      `Articulate trade-offs clearly: senior engineers stand out by discussing "why this approach over another".`
    ]
  };
};

