const {
  formatMessage,
  validateBranchName
} = require('../validate-branch-name');

describe('validate-branch-name', () => {
  const configuration = {
    prefixes: ['feat', 'fix', 'docs'],
    suggestions: {
      feature: 'feat'
    },
    banned: ['wip'],
    skip: ['development', 'staging'],
    disallowed: ['master', 'main'],
    separator: '/',
    msgBranchBanned: 'Branches with the name "%s" are not allowed.',
    msgBranchDisallowed: 'Pushing to "%s" is not allowed, use git-flow.',
    msgPrefixNotAllowed: 'Branch prefix "%s" is not allowed.',
    msgPrefixSuggestion: 'Instead of "%s" try "%s".',
    msgseparatorRequired: 'Branch "%s" must contain a separator "%s".'
  };

  it('formats placeholder messages', () => {
    expect(formatMessage('hello %s %s', 'a', 'b')).toBe('hello a b');
  });

  it('allows skipped branches', () => {
    expect(validateBranchName('development', configuration)).toBeNull();
  });

  it('allows detached head', () => {
    expect(validateBranchName('HEAD', configuration)).toBeNull();
  });

  it('rejects disallowed branch names', () => {
    expect(validateBranchName('main', configuration)).toBe(
      'Pushing to "main" is not allowed, use git-flow.'
    );
  });

  it('rejects banned branch names', () => {
    expect(validateBranchName('wip', configuration)).toBe(
      'Branches with the name "wip" are not allowed.'
    );
  });

  it('requires a separator', () => {
    expect(validateBranchName('feature', configuration)).toBe(
      'Branch "feature" must contain a separator "/".'
    );
  });

  it('accepts allowed prefixes', () => {
    expect(validateBranchName('feat/new-build', configuration)).toBeNull();
  });

  it('returns suggestion for mapped prefixes', () => {
    expect(validateBranchName('feature/new-build', configuration)).toBe(
      'Branch prefix "feature" is not allowed. Instead of "feature" try "feat".'
    );
  });

  it('rejects unknown prefixes', () => {
    expect(validateBranchName('unknown/new-build', configuration)).toBe(
      'Branch prefix "unknown" is not allowed.'
    );
  });
});
