// src/constants/permissions.js

// базовые действия в системе
export const ACT = {
  JOURNAL_EDIT: "journal.edit",
  JOURNAL_TEAM_MANAGE: "journal.team.manage",

  ARTICLE_VIEW_ALL: "article.view.all",
  ARTICLE_STATUS_CHANGE: "article.status.change",
  ARTICLE_SCREENING: "article.screening",

  REVIEW_ASSIGN: "review.assign",
  REVIEW_READ_ALL: "review.read.all",

  PRODUCTION_UPLOAD: "production.upload",
  ISSUE_PUBLISH: "issue.publish",
};

// матрица прав по ролям ЖУРНАЛА (JournalMembershipRoleEnum)
export const JOURNAL_ROLE_PERMS = {
  chief_editor: new Set([
    ACT.JOURNAL_EDIT,
    ACT.JOURNAL_TEAM_MANAGE,

    ACT.ARTICLE_VIEW_ALL,
    ACT.ARTICLE_STATUS_CHANGE,
    ACT.ARTICLE_SCREENING,

    ACT.REVIEW_ASSIGN,
    ACT.REVIEW_READ_ALL,

    ACT.PRODUCTION_UPLOAD,
    ACT.ISSUE_PUBLISH,
  ]),

  editor: new Set([
    ACT.JOURNAL_EDIT,

    ACT.ARTICLE_VIEW_ALL,
    ACT.ARTICLE_STATUS_CHANGE,
    ACT.ARTICLE_SCREENING,

    ACT.REVIEW_ASSIGN,
    ACT.REVIEW_READ_ALL,

    ACT.PRODUCTION_UPLOAD,
  ]),

  manager: new Set([
    ACT.JOURNAL_EDIT,
    ACT.JOURNAL_TEAM_MANAGE,

    ACT.ARTICLE_VIEW_ALL,
    ACT.ARTICLE_STATUS_CHANGE,
    ACT.ARTICLE_SCREENING,

    ACT.REVIEW_ASSIGN,
    ACT.REVIEW_READ_ALL,
  ]),

  proofreader: new Set([
    ACT.ARTICLE_VIEW_ALL,
    ACT.REVIEW_READ_ALL,
    ACT.PRODUCTION_UPLOAD,
  ]),

  secretary: new Set([
    ACT.JOURNAL_EDIT,
    ACT.ARTICLE_VIEW_ALL,
    ACT.REVIEW_READ_ALL,
  ]),

  reviewer: new Set([
    // рецензент НЕ видит все статьи по умолчанию — только назначенные (бэк фильтрует),
    // на фронте просто не даём лишних кнопок
    ACT.REVIEW_READ_ALL, // читать материалы по назначенным статьям, не все подряд
  ]),
};

// роли ОРГАНИЗАЦИИ (OrganizationMembershipRoleEnum)
// org.admin — «суперпользователь» внутри своей организации: получает все действия по журналам орг-ции
export const ORG_ROLE_PERMS = {
  admin: "ALL", // трактуем как все действия выше
  member: new Set([]),
};
