module.exports = {
    input: ['src/**/*.{js,jsx,ts,tsx}'],
    output: 'public/locales/$LOCALE/$NAMESPACE.json',

    locales: ['kk', 'ru', 'en'],
    defaultNamespace: 'common',

    // ВАЖНО: чтобы работал стиль "namespace:key"
    namespaceSeparator: ':',
    keySeparator: '.',              // 'section.title'

    createOldCatalogs: false,
    keepRemoved: true,              // на время миграции удобно держать true
    sort: true,
    indentation: 2,

    // Значение по умолчанию: RU — как «черновой» текст, KK/EN — пусто
    defaultValue: '',
    // …но если в коде есть defaultValue, применяй его только к этим локалям:
    defaultValueLocales: ['ru'],

    lexers: {
        js:  ['JsxLexer'],
        jsx: ['JsxLexer'],
        ts:  ['JsxLexer'],
        tsx: ['JsxLexer'],
    },
    func: {
        list: ['t', 'i18next.t'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    trans: { component: 'Trans', i18nKey: 'i18nKey' },
};
