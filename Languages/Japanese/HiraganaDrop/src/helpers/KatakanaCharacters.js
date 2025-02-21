const KATAKANA_SET = {
    basic: [
        { romaji: 'a', katakana: 'ア' },
        { romaji: 'i', katakana: 'イ' },
        { romaji: 'u', katakana: 'ウ' },
        { romaji: 'e', katakana: 'エ' },
        { romaji: 'o', katakana: 'オ' },
        { romaji: 'ka', katakana: 'カ' },
        { romaji: 'ki', katakana: 'キ' },
        { romaji: 'ku', katakana: 'ク' },
        { romaji: 'ke', katakana: 'ケ' },
        { romaji: 'ko', katakana: 'コ' },
        // ... rest of katakana characters ...
    ]
};

const SPECIAL_CASES = {
    'ts': ['tsu'],
    'ch': ['chi'],
    'sh': ['shi']
};

module.exports = { KATAKANA_SET, SPECIAL_CASES }; 