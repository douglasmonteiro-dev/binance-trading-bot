const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const getConfig = configPath => {
  const absolutePath = path.resolve(configPath);
  const rawConfig = fs.readFileSync(absolutePath, 'utf8');

  return JSON.parse(rawConfig).branchNameLinter;
};

const getBranchName = () => {
  const branchName = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    encoding: 'utf8'
  }).trim();

  return branchName;
};

const formatMessage = (message, ...values) => {
  let formatted = message;

  values.forEach(value => {
    formatted = formatted.replace('%s', value);
  });

  return formatted;
};

const validateBranchName = (branchName, configuration) => {
  if (configuration.skip.includes(branchName) || branchName === 'HEAD') {
    return null;
  }

  if (configuration.disallowed.includes(branchName)) {
    return formatMessage(configuration.msgBranchDisallowed, branchName);
  }

  if (configuration.banned.includes(branchName)) {
    return formatMessage(configuration.msgBranchBanned, branchName);
  }

  if (branchName.includes(configuration.separator) === false) {
    return formatMessage(
      configuration.msgseparatorRequired,
      branchName,
      configuration.separator
    );
  }

  const [prefix] = branchName.split(configuration.separator);

  if (configuration.prefixes.includes(prefix)) {
    return null;
  }

  if (configuration.suggestions[prefix]) {
    return `${formatMessage(
      configuration.msgPrefixNotAllowed,
      prefix
    )} ${formatMessage(
      configuration.msgPrefixSuggestion,
      prefix,
      configuration.suggestions[prefix]
    )}`;
  }

  return formatMessage(configuration.msgPrefixNotAllowed, prefix);
};

const main = () => {
  const configPath = process.argv[2] || '.branch-name-list.json';
  const configuration = getConfig(configPath);
  const branchName = getBranchName();
  const validationError = validateBranchName(branchName, configuration);

  if (validationError) {
    console.error(validationError);
    process.exit(1);
  }

  console.log(`Branch name validated: ${branchName}`);
};

if (require.main === module) {
  main();
}

module.exports = {
  formatMessage,
  getConfig,
  validateBranchName
};
