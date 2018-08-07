const fs = require('fs');
const NIGHTMARE = require('nightmare');
const SCREEN_WIDTH = 960;
const SCREEN_HEIGHT = 540;
const APP = NIGHTMARE({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  show: true, // ブラウザを表示するか
  enableLargerThanScreen: true // ブラウザを画面より大きく出来るか
});
let scrapingCount = 1;
const SCRAPING_LIMIT = 5;

// ロドストにアクセスして日記を検索
const SEARCH = () => {
  APP.goto('https://jp.finalfantasyxiv.com/lodestone/blog/')
    .wait('.form__horizontal')
    .click('.icon-btn__search_28')
    .insert("input[placeholder='キーワードを入力']", false)
    .insert("input[placeholder='キーワードを入力']", '4.4')
    .select('.sys_tag_presets', '攻略')
    .select('.sys_tag_presets', '固定')
    .select('.sys_tag_presets', '零式・絶')
    .select('select[name="worldname"', '_dc_Gaia')
    .click('input[value="検索"]');

  CHECK();
};

// 日記詳細をチェック
const CHECK = () => {
  SHOW_DETAIL().then(r => {
    SCREENSHOT(r);
  });
};

// 詳細を表示
const SHOW_DETAIL = () => {
  return new Promise((resolve, reject) => {
    APP.wait('.ldst__contents')
      .click(
        `.entry__block__wrapper .entry__blog_block:nth-child(${scrapingCount}) .entry__blog_block__box a`
      )
      .wait('.ldst__window')
      .evaluate(() => {
        const $BODY = document.querySelector('body');

        // ページ全体の幅と高さを返す
        return {
          width: $BODY.scrollWidth,
          height: $BODY.scrollHeight
        };
      })
      .then(result => {
        resolve(result);
      });
  });
};

// スクリーンショット保存
const SCREENSHOT = r => {
  const TODAY = new Date();
  const MONTH = TODAY.getMonth() + 1;
  const DATE = TODAY.getDate();
  const HOUR = TODAY.getHours();
  const FOLDER_NAME = `${MONTH}月${DATE}日${HOUR}時`;

  // フォルダが無ければ作成
  if (!fs.existsSync(`./${FOLDER_NAME}`)) {
    fs.mkdirSync(`./${FOLDER_NAME}`);
  }

  APP.viewport(r.width, r.height)
    .wait(1000)
    .screenshot(`./${FOLDER_NAME}/screenshot${scrapingCount}.jpg`)
    .then(() => {
      if (scrapingCount === SCRAPING_LIMIT) {
        APP.end();
      } else {
        scrapingCount += 1;
        APP.viewport(SCREEN_WIDTH, SCREEN_HEIGHT).back();
        CHECK();
      }
    });
};

// 実行開始
SEARCH();
