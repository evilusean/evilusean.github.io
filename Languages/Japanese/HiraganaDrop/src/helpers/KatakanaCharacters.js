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
        { romaji: 'sa', katakana: 'サ' },
        { romaji: 'shi', katakana: 'シ' },
        { romaji: 'su', katakana: 'ス' },
        { romaji: 'se', katakana: 'セ' },
        { romaji: 'so', katakana: 'ソ' },
        { romaji: 'ta', katakana: 'タ' },
        { romaji: 'chi', katakana: 'チ' },
        { romaji: 'tsu', katakana: 'ツ' },
        { romaji: 'te', katakana: 'テ' },
        { romaji: 'to', katakana: 'ト' },
        { romaji: 'na', katakana: 'ナ' },
        { romaji: 'ni', katakana: 'ニ' },
        { romaji: 'nu', katakana: 'ヌ' },
        { romaji: 'ne', katakana: 'ネ' },
        { romaji: 'no', katakana: 'ノ' },
        { romaji: 'ha', katakana: 'ハ' },
        { romaji: 'hi', katakana: 'ヒ' },
        { romaji: 'fu', katakana: 'フ' },
        { romaji: 'he', katakana: 'ヘ' },
        { romaji: 'ho', katakana: 'ホ' },
        { romaji: 'ma', katakana: 'マ' },
        { romaji: 'mi', katakana: 'ミ' },
        { romaji: 'mu', katakana: 'ム' },
        { romaji: 'me', katakana: 'メ' },
        { romaji: 'mo', katakana: 'モ' },
        { romaji: 'ya', katakana: 'ヤ' },
        { romaji: 'yu', katakana: 'ユ' },
        { romaji: 'yo', katakana: 'ヨ' },
        { romaji: 'ra', katakana: 'ラ' },
        { romaji: 'ri', katakana: 'リ' },
        { romaji: 'ru', katakana: 'ル' },
        { romaji: 're', katakana: 'レ' },
        { romaji: 'ro', katakana: 'ロ' },
        { romaji: 'wa', katakana: 'ワ' },
        { romaji: 'wo', katakana: 'ヲ' },
        { romaji: 'n', katakana: 'ン' }
    ]
};

const SPECIAL_CASES = {
    'ts': ['tsu'],
    'ch': ['chi'],
    'sh': ['shi']
};

module.exports = { KATAKANA_SET, SPECIAL_CASES }; 