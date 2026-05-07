import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const BASE_REF = process.env.BASE_REF || 'main';
const PR_TITLE = process.env.PR_TITLE || '(no title)';
const PR_BODY = process.env.PR_BODY || '(no description)';
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || '';
const FAIL_ON_BLOCK = String(process.env.FAIL_ON_BLOCK || 'false').toLowerCase() === 'true';
const MIN_FAIL_RISK_SCORE = Number(process.env.MIN_FAIL_RISK_SCORE || 85);

const OUTPUT_FILE = 'pr-review-output.txt';
const SUMMARY_FILE = 'pr-review-summary.md';
const COMMENT_FILE = 'pr-review-comment.md';
const RESULT_FILE = 'pr-review-result.json';

const MAX_DIFF = 12000;
const MAX_ISSUE_BODY = 2500;
const MAX_ISSUE_COMMENTS = 2000;
const MAX_COMMITS = 1500;
const MAX_DIFF_STAT = 1500;
const MAX_CHANGED_FILES = 2000;

function safeTrim(text, maxLength, suffix = '\n\n[...truncated...]') {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + suffix : text;
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function estimateTokens(text) {
  return Math.ceil(String(text || '').length / 4);
}

function runGit(command, fallback = '') {
  try {
    return execSync(command, {
      maxBuffer: 1024 * 1024 * 10,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).toString();
  } catch (err) {
    console.error(`Git command failed: ${command}`);
    console.error(err.message);
    return fallback;
  }
}

function getDiffCommand(baseRef) {
  return [
    `git diff origin/${baseRef}...HEAD -- .`,
    `':(exclude)package-lock.json'`,
    `':(exclude)yarn.lock'`,
    `':(exclude)pnpm-lock.yaml'`,
    `':(exclude)dist/**'`,
    `':(exclude)build/**'`,
    `':(exclude)coverage/**'`,
    `':(exclude).next/**'`,
    `':(exclude)node_modules/**'`,
  ].join(' ');
}

function extractIssueNumbers(text) {
  if (!text) return [];

  const matches = new Set();

  const patterns = [
    /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)\b/gi,
    /\bissue\s*:\s*#(\d+)\b/gi,
    /\bref(?:erence)?s?\s*#(\d+)\b/gi,
    /\brelated\s+to\s+#(\d+)\b/gi,
    /\B#(\d+)\b/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      matches.add(Number(match[1]));
    }
  }

  return [...matches];
}

function getPrimaryIssueNumber() {
  const fromBody = extractIssueNumbers(PR_BODY);
  if (fromBody.length > 0) return fromBody[0];

  const fromTitle = extractIssueNumbers(PR_TITLE);
  if (fromTitle.length > 0) return fromTitle[0];

  return null;
}

async function githubRequest(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'ai-pr-review-script',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API error ${response.status} on ${path}: ${errorText}`);
  }

  return response.json();
}

async function fetchIssueContext(issueNumber) {
  if (!issueNumber) {
    return {
      hasLinkedIssue: false,
      issueNumber: null,
      issueTitle: '',
      issueBody: '',
      issueLabels: [],
      issueState: '',
      issueCommentsText: '',
      issueUrl: '',
      issueSummaryBlock: 'No linked issue was found in the PR title/body.',
    };
  }

  const issue = await githubRequest(`/repos/${owner}/${repo}/issues/${issueNumber}`);

  const comments =
    issue.comments > 0
      ? await githubRequest(`/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=10`)
      : [];

  const issueTitle = normalizeText(issue.title);
  const issueBody = safeTrim(normalizeText(issue.body), MAX_ISSUE_BODY);

  const issueLabels = Array.isArray(issue.labels)
    ? issue.labels
        .map((label) => (typeof label === 'string' ? label : label?.name))
        .filter(Boolean)
    : [];

  const serializedComments = comments
    .map((comment, index) => {
      const author = comment.user?.login || 'unknown';
      const body = normalizeText(comment.body) || '(empty)';
      return `Comment ${index + 1} by @${author}:\n${body}`;
    })
    .join('\n\n');

  const trimmedComments = safeTrim(serializedComments, MAX_ISSUE_COMMENTS);

  const issueSummaryBlock = [
    `Linked issue: #${issue.number}`,
    `Title: ${issueTitle || '(untitled)'}`,
    `State: ${issue.state || 'unknown'}`,
    `Labels: ${issueLabels.length > 0 ? issueLabels.join(', ') : '(none)'}`,
    `URL: ${issue.html_url || '(unavailable)'}`,
  ].join('\n');

  return {
    hasLinkedIssue: true,
    issueNumber: issue.number,
    issueTitle,
    issueBody,
    issueLabels,
    issueState: issue.state || '',
    issueCommentsText: trimmedComments,
    issueUrl: issue.html_url || '',
    issueSummaryBlock,
  };
}

function loadReviewPrompt() {
  const promptPaths = [
    '.github/prompts/pr-review-prompt.txt',
    '.codex/review-prompt.txt',
    '.github/prompts/review-prompt.txt',
  ];

  for (const path of promptPaths) {
    if (existsSync(path)) {
      try {
        return readFileSync(path, 'utf8');
      } catch (err) {
        console.error(`Failed to read prompt file ${path}: ${err.message}`);
      }
    }
  }

  return `Review this PR as a senior engineer.

Focus on correctness, security, reliability, tests, dependency risks, and merge readiness.

Be concise and evidence-based.`;
}

function addMissingIssueWarning(reviewOutput, issueContext) {
  if (issueContext.hasLinkedIssue) return reviewOutput;

  const warningBanner = `> [!WARNING]
> No linked GitHub issue was found in the PR title or body.
> Requirements alignment could not be fully validated.
> Add a reference like \`Closes #123\` or \`Issue: #123\` in the PR description.

`;

  if (!reviewOutput || !reviewOutput.trim()) {
    return `${warningBanner}## 📋 PR Summary

Review output was not generated.`;
  }

  return `${warningBanner}${reviewOutput}`;
}

function normalizeHeading(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSectionsByMarkdownHeadings(markdown) {
  const lines = String(markdown || '').split('\n');
  const sections = {};
  let currentHeading = null;
  let currentContent = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{2,3}\s+(.+?)\s*$/);

    if (headingMatch) {
      if (currentHeading) {
        sections[normalizeHeading(currentHeading)] = currentContent.join('\n').trim();
      }

      currentHeading = headingMatch[1];
      currentContent = [];
    } else if (currentHeading) {
      currentContent.push(line);
    }
  }

  if (currentHeading) {
    sections[normalizeHeading(currentHeading)] = currentContent.join('\n').trim();
  }

  return sections;
}

function findSection(sections, possibleNames) {
  const normalizedNames = possibleNames.map(normalizeHeading);

  for (const [heading, content] of Object.entries(sections)) {
    if (normalizedNames.some((name) => heading.includes(name))) {
      return content;
    }
  }

  return '';
}

function detectStatus(sectionText) {
  const text = String(sectionText || '').toLowerCase();

  if (!text.trim()) {
    return 'ℹ️ Not Available';
  }

  if (
    text.includes('no findings') ||
    text.includes('no dependency risks') ||
    text.includes('no security risks') ||
    text.includes('coverage looks adequate') ||
    text.includes('no auto-fix suggestions') ||
    text.includes('none') ||
    text.includes('approve') ||
    text.includes('pass')
  ) {
    return '✅ Pass';
  }

  if (
    text.includes('decision: block') ||
    text.includes('block') ||
    text.includes('critical') ||
    text.includes('high risk') ||
    text.includes('security issue') ||
    text.includes('vulnerability') ||
    text.includes('failed') ||
    text.includes('must fix')
  ) {
    return '❌ Issues Found';
  }

  if (
    text.includes('request changes') ||
    text.includes('medium') ||
    text.includes('partial') ||
    text.includes('unclear') ||
    text.includes('missing') ||
    text.includes('gap') ||
    text.includes('needs review') ||
    text.includes('risk')
  ) {
    return '⚠️ Needs Review';
  }

  return 'ℹ️ Review Available';
}

function extractRiskScore(reviewOutput) {
  const patterns = [
    /risk score[:\s]+(\d{1,3})\s*\/\s*100/i,
    /risk score[:\s]+(\d{1,3})/i,
    /score[:\s]+(\d{1,3})\s*\/\s*100/i,
  ];

  for (const pattern of patterns) {
    const match = reviewOutput.match(pattern);
    if (match) {
      const value = Number(match[1]);
      if (Number.isFinite(value)) {
        return Math.max(0, Math.min(100, value));
      }
    }
  }

  return null;
}

function extractFinalDecision(reviewOutput) {
  const text = String(reviewOutput || '').toLowerCase();

  if (
    text.includes('decision: block') ||
    text.includes('final recommendation: block') ||
    text.includes('merge recommendation: block')
  ) {
    return 'BLOCK';
  }

  if (
    text.includes('decision: request_changes') ||
    text.includes('decision: request changes') ||
    text.includes('final recommendation: request changes') ||
    text.includes('merge recommendation: request changes')
  ) {
    return 'REQUEST_CHANGES';
  }

  if (
    text.includes('decision: approve') ||
    text.includes('final recommendation: approve') ||
    text.includes('merge recommendation: approve')
  ) {
    return 'APPROVE';
  }

  return 'REVIEW_REQUIRED';
}

function formatDecision(decision) {
  switch (decision) {
    case 'BLOCK':
      return '❌ Block';
    case 'REQUEST_CHANGES':
      return '⚠️ Request Changes';
    case 'APPROVE':
      return '✅ Approve';
    default:
      return 'ℹ️ Review Required';
  }
}

function buildGateSummary(reviewOutput) {
  const failed =
    reviewOutput.includes('PR Review Failed') ||
    reviewOutput.includes('automated review could not be completed');

  if (failed) {
    return {
      markdown: `## 🤖 AI PR Review Gate Summary

| Gate | Status |
|---|---|
| AI Review | ❌ Failed |
| PR Summary | ℹ️ Not Available |
| Risk Scoring | ℹ️ Not Available |
| Code Review | ℹ️ Not Available |
| Auto-Fix Suggestions | ℹ️ Not Available |
| Requirements Alignment | ℹ️ Not Available |
| Testing Gaps | ℹ️ Not Available |
| Dependency Review | ℹ️ Not Available |
| Security Scan | ℹ️ Not Available |
| Merge Gatekeeper | ❌ Failed |

**Final Recommendation:** ❌ Review Manually
**Risk Score:** Not detected
`,
      riskScore: null,
      finalDecision: 'REVIEW_REQUIRED',
    };
  }

  const riskScore = extractRiskScore(reviewOutput);
  const finalDecision = extractFinalDecision(reviewOutput);
  const sections = extractSectionsByMarkdownHeadings(reviewOutput);

  const gates = {
    'PR Summary': findSection(sections, ['PR Summary', 'Change Summary']),
    'Risk Scoring': findSection(sections, ['AI Risk Scoring', 'Risk Scoring']),
    'Code Review': findSection(sections, [
      'AI Code Review Findings',
      'Review Findings',
      'Code Review',
    ]),
    'Auto-Fix Suggestions': findSection(sections, [
      'AI Auto-Fix Suggestions',
      'Auto-Fix Suggestions',
    ]),
    'Requirements Alignment': findSection(sections, ['Requirements Alignment']),
    'Testing Gaps': findSection(sections, ['Testing Gaps']),
    'Dependency Review': findSection(sections, ['Dependency Review']),
    'Security Scan': findSection(sections, ['Security Scan']),
    'Merge Gatekeeper': findSection(sections, ['AI Merge Gatekeeper', 'Merge Gatekeeper']),
  };

  const tableRows = Object.entries(gates)
    .map(([name, content]) => `| ${name} | ${detectStatus(content)} |`)
    .join('\n');

  return {
    markdown: `## 🤖 AI PR Review Gate Summary

| Gate | Status |
|---|---|
${tableRows}

**Final Recommendation:** ${formatDecision(finalDecision)}
**Risk Score:** ${riskScore !== null ? `${riskScore}/100` : 'Not detected'}
`,
    riskScore,
    finalDecision,
  };
}

function buildComment(reviewOutput) {
  const gateSummary = buildGateSummary(reviewOutput);

  return `${gateSummary.markdown}

---

## 📄 Full AI Review Details

${reviewOutput}
`;
}

function writeReviewFiles(reviewOutput) {
  const gateSummary = buildGateSummary(reviewOutput);
  const riskScore = gateSummary.riskScore;
  const finalDecision = gateSummary.finalDecision;

  const shouldBlock =
    finalDecision === 'BLOCK' || (riskScore !== null && riskScore >= MIN_FAIL_RISK_SCORE);

  writeFileSync(OUTPUT_FILE, reviewOutput);
  writeFileSync(SUMMARY_FILE, gateSummary.markdown);
  writeFileSync(COMMENT_FILE, buildComment(reviewOutput));

  writeFileSync(
    RESULT_FILE,
    JSON.stringify(
      {
        riskScore,
        finalDecision,
        shouldBlock,
        minFailRiskScore: MIN_FAIL_RISK_SCORE,
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );
}

if (!GITHUB_TOKEN) {
  writeReviewFiles(
    `## ⚠️ PR Review Failed

The automated review could not be completed.

**Reason:** Missing \`GITHUB_TOKEN\`.

Please review this PR manually or re-run the workflow.`
  );
  process.exit(0);
}

if (!GITHUB_REPOSITORY || !GITHUB_REPOSITORY.includes('/')) {
  writeReviewFiles(
    `## ⚠️ PR Review Failed

The automated review could not be completed.

**Reason:** Missing or invalid \`GITHUB_REPOSITORY\` environment variable.

Please review this PR manually or re-run the workflow.`
  );
  process.exit(0);
}

const [owner, repo] = GITHUB_REPOSITORY.split('/');

async function main() {
  const diff = runGit(getDiffCommand(BASE_REF), '');
  const diffStat = runGit(`git diff origin/${BASE_REF}...HEAD --stat`, '');
  const commits = runGit(`git log origin/${BASE_REF}...HEAD --oneline`, '');
  const changedFiles = runGit(`git diff --name-only origin/${BASE_REF}...HEAD`, '');

  const trimmedDiff = safeTrim(
    diff || '(empty - no changes detected)',
    MAX_DIFF,
    '\n\n[...diff truncated due to token budget...]'
  );

  const trimmedDiffStat = safeTrim(diffStat || '(unavailable)', MAX_DIFF_STAT);
  const trimmedCommits = safeTrim(commits || '(none)', MAX_COMMITS);
  const trimmedChangedFiles = safeTrim(changedFiles || '(unavailable)', MAX_CHANGED_FILES);

  const issueNumber = getPrimaryIssueNumber();
  let issueContext;

  try {
    issueContext = await fetchIssueContext(issueNumber);
  } catch (err) {
    console.error(`Failed to fetch linked issue: ${err.message}`);

    issueContext = {
      hasLinkedIssue: false,
      issueNumber,
      issueTitle: '',
      issueBody: '',
      issueLabels: [],
      issueState: '',
      issueCommentsText: '',
      issueUrl: '',
      issueSummaryBlock: issueNumber
        ? `Linked issue #${issueNumber} could not be fetched.`
        : 'No linked issue was found in the PR title/body.',
    };
  }

  const reviewPrompt = loadReviewPrompt();

  const systemPrompt = `You are a senior software engineer performing a concise production PR review.

${reviewPrompt}

Additional rules:
- Review the PR against the linked GitHub issue when available.
- Do not invent requirements.
- Be concise because the model has an 8k token limit.
- Prioritize high-confidence findings.
- Include dependency and security sections even if no issues are found.
- Include a merge recommendation.
- Use the exact markdown headings below.
- Do not rename, remove, or reorder the headings.

Always respond using exactly these sections:

## 📋 PR Summary
2-4 concise sentences.

## 🔥 AI Risk Scoring
Risk Level: LOW / MEDIUM / HIGH
Risk Score: number from 0-100
Reasons:
- concise reason
- concise reason

## 🔍 AI Code Review Findings
Findings ordered High -> Medium -> Low.
If none: No findings.

## 🔧 AI Auto-Fix Suggestions
Concrete fix suggestions.
If none: No auto-fix suggestions.

## ✅ Requirements Alignment
Compare the PR against the linked issue.
If no linked issue exists, say requirements alignment could not be fully validated.

## 🧪 Testing Gaps
Missing tests that increase delivery risk.
If none: Coverage looks adequate.

## 📦 Dependency Review
Mention dependency or lockfile risks.
If none: No dependency risks detected from the diff.

## 🔐 Security Scan
Mention security/privacy risks.
If none: No security risks detected from the diff.

## 🚦 AI Merge Gatekeeper
Decision: APPROVE / REQUEST_CHANGES / BLOCK
Reason: concise reason.

## ⚠️ Residual Risks
Remaining manual checks.
If none: None.`;

  const userMessage = `## Pull Request
Title: ${PR_TITLE}
Description:
${PR_BODY}

## Linked Issue Summary
${issueContext.issueSummaryBlock}

## Linked Issue Title
${issueContext.issueTitle || '(none)'}

## Linked Issue Body
${issueContext.issueBody || '(none)'}

## Linked Issue Comments
${issueContext.issueCommentsText || '(none)'}

## Commits
${trimmedCommits}

## Changed Files
${trimmedChangedFiles}

## Diff Stat
${trimmedDiffStat}

## Diff
\`\`\`diff
${trimmedDiff}
\`\`\`
`;

  console.log('Estimated system tokens:', estimateTokens(systemPrompt));
  console.log('Estimated user tokens:', estimateTokens(userMessage));
  console.log('Estimated total tokens:', estimateTokens(systemPrompt + userMessage));

  console.log('Calling GitHub Models API...');

  let reviewOutput = '';

  try {
    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1800,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Models API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    reviewOutput = data.choices?.[0]?.message?.content?.trim() ?? '';

    if (!reviewOutput) {
      throw new Error('Empty response from GitHub Models API.');
    }
  } catch (err) {
    console.error('Review failed:', err.message);

    reviewOutput = `## ⚠️ PR Review Failed

The automated review could not be completed.

**Reason:** ${err.message}

Please review this PR manually or re-run the workflow.`;
  }

  reviewOutput = addMissingIssueWarning(reviewOutput, issueContext);

  writeReviewFiles(reviewOutput);

  const gateSummary = buildGateSummary(reviewOutput);
  const riskScore = gateSummary.riskScore;
  const finalDecision = gateSummary.finalDecision;

  console.log('Review written to:', OUTPUT_FILE);
  console.log('Summary written to:', SUMMARY_FILE);
  console.log('Comment written to:', COMMENT_FILE);
  console.log('Result written to:', RESULT_FILE);
  console.log('Risk score:', riskScore);
  console.log('Final decision:', finalDecision);

  if (
    FAIL_ON_BLOCK &&
    (finalDecision === 'BLOCK' || (riskScore !== null && riskScore >= MIN_FAIL_RISK_SCORE))
  ) {
    console.error('AI merge gate blocked this PR.');
    process.exit(1);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Unexpected failure:', err);

  writeReviewFiles(`## ⚠️ PR Review Failed

The automated review crashed before completion.

**Reason:** ${err.message}

Please review this PR manually or re-run the workflow.`);

  process.exit(0);
});
