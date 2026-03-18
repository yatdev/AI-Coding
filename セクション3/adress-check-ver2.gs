function onOpen() {

  const ui = SpreadsheetApp.getUi();

  ui.createMenu("住所チェック")
    .addItem("重複チェック実行", "checkAddressDuplicates")
    .addToUi();

}


function normalizeAddress(addr) {

  if (!addr) return "";

  let a = addr;

  // 全角英数字 → 半角
  a = a.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s =>
    String.fromCharCode(s.charCodeAt(0) - 65248)
  );

  // スペース削除
  a = a.replace(/[ 　]/g, "");

  // ハイフン統一
  a = a.replace(/[ー－―‐−ｰ]/g,"-");

  // 丁目・番地など統一
  a = a
    .replace(/丁目/g,"-")
    .replace(/番地/g,"-")
    .replace(/番/g,"-")
    .replace(/号/g,"");

  // よくある表記ゆれ
  a = a
    .replace(/大字/g,"")
    .replace(/字/g,"")
    .replace(/ヶ|ケ/g,"ケ")
    .replace(/ノ/g,"の");

  // 漢数字変換
  const kanji = {
    "〇":0,"一":1,"二":2,"三":3,"四":4,
    "五":5,"六":6,"七":7,"八":8,"九":9
  };

  Object.keys(kanji).forEach(k=>{
    a = a.replaceAll(k,kanji[k]);
  });

  // 十処理（十一 → 11など）
  a = a.replace(/(\d*)十(\d*)/g,function(_,p1,p2){

    let left = p1 ? Number(p1)*10 : 10;
    let right = p2 ? Number(p2) : 0;

    return left + right;

  });

  // 建物番号など削除
  a = a.replace(/[-]?\d{3,4}号?室?$/,"");

  // 連続ハイフン整理
  a = a.replace(/--+/g,"-");

  return a;

}


function checkAddressDuplicates() {

  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) return;

  const data = sheet.getRange(2,1,lastRow-1,1).getValues();

  let normalized = [];
  let map = {};

  for (let i=0;i<data.length;i++){

    let addr = data[i][0];
    let norm = normalizeAddress(addr);

    normalized.push([norm]);

    if(!map[norm]) map[norm]=[];
    map[norm].push(i+2);

  }

  // B列に正規化住所
  sheet.getRange(2,2,normalized.length,1).setValues(normalized);

  // 背景色リセット
  sheet.getRange(2,1,lastRow-1,2).setBackground(null);

  // 重複ハイライト
  Object.keys(map).forEach(key=>{

    if(map[key].length>1){

      map[key].forEach(r=>{
        sheet.getRange(r,1,1,2).setBackground("#ffd9d9");
      });

    }

  });

}
