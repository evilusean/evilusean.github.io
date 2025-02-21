const HIRAGANA_SET = {
    basic: [
        { romaji: 'a', hiragana: 'あ' },
        { romaji: 'i', hiragana: 'い' },
        { romaji: 'u', hiragana: 'う' },
        { romaji: 'e', hiragana: 'え' },
        { romaji: 'o', hiragana: 'お' },
        { romaji: 'ka', hiragana: 'か' },
        { romaji: 'ki', hiragana: 'き' },
        { romaji: 'ku', hiragana: 'く' },
        { romaji: 'ke', hiragana: 'け' },
        { romaji: 'ko', hiragana: 'こ' },
        // ... rest of hiragana characters ...
    ]
};

const SPECIAL_CASES = {
    'ts': ['tsu'],
    'ch': ['chi'],
    'sh': ['shi']
};

module.exports = { HIRAGANA_SET, SPECIAL_CASES }; 