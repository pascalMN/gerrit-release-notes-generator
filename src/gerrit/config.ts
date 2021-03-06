import {HostConfig, ParserOptions, WriterOptions} from "./@types/config";
import {Commit} from "./@types/commit";
import {Context} from "./@types/context";
import * as compareFunc from 'compare-func';

type ConfigWriterOptions = Pick<WriterOptions, 'transform' | 'groupBy' | 'commitGroupsSort' | 'commitsSort' | 'noteGroupsSort' | 'notesSort'>;

export const writerOptionsConfig: ConfigWriterOptions = {
  transform: (commit: Commit, context: Context) => {
    let discard = true;
    const issues = [];

    commit.notes.forEach(note => {
      note.title = `BREAKING CHANGES`
      discard = false
    });

    if (commit.type === `feat`) {
      commit.type = `Features`
    } else if (commit.type === `fix`) {
      commit.type = `Bug Fixes`
    } else if (commit.type === `perf`) {
      commit.type = `Performance Improvements`
    } else if (commit.type === `revert`) {
      commit.type = `Reverts`
    } else if (discard) {
      return
    } else if (commit.type === `docs`) {
      commit.type = `Documentation`
    } else if (commit.type === `style`) {
      commit.type = `Styles`
    } else if (commit.type === `refactor`) {
      commit.type = `Code Refactoring`
    } else if (commit.type === `test`) {
      commit.type = `Tests`
    } else if (commit.type === `build`) {
      commit.type = `Build System`
    } else if (commit.type === `ci`) {
      commit.type = `Continuous Integration`
    }

    if (commit.scope === `*`) {
      commit.scope = ``
    }

    if (typeof commit.hash === `string`) {
      commit.hash = commit.hash.substring(0, 7)
    }

    if (typeof commit.subject === `string`) {
      let url = context.issues;
      if (url) {
        commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
          issues.push(issue);
          return `[#${issue}](${url}/${issue})`
        })
      }
      if (context.host) {
        // User URLs.
        commit.subject = commit.subject.replace(/\B@([a-z0-9](?:-?[a-z0-9]){0,38})/g, `[@$1](${context.host}/$1)`)
      }
    }

    // remove references that already appear in the subject
    commit.references = commit.references.filter(reference => {
      return issues.indexOf(reference.issue) === -1;
    });

    return commit
  },
  groupBy: `type`,
  commitGroupsSort: `title`,
  commitsSort: [`scope`, `subject`],
  noteGroupsSort: `title`,
  notesSort: compareFunc
};

export const parserOptions: ParserOptions = {
  headerPattern: /^(\w*)(?:\((.*)\))?: (.*)$/,
  headerCorrespondence: [
    `type`,
    `scope`,
    `subject`
  ],
  noteKeywords: [`BREAKING CHANGE`],
  revertPattern: /^revert:\s([\s\S]*?)\s*This reverts commit (\w*)\./,
  revertCorrespondence: [`header`, `hash`]
};

export const GERRIT_HOST_CONFIG: HostConfig = {
  commit: '#/c',
  issuePrefixes: ['#'],
  referenceActions: [
    "close",
    "closes",
    "closed",
    "closing",
    "fix",
    "fixes",
    "fixed",
    "fixing",
    "resolve",
    "resolves",
    "resolved",
    "resolving",
  ]
};

GERRIT_HOST_CONFIG.referenceActions.push(...GERRIT_HOST_CONFIG.referenceActions.map(action => `${action}:`));
