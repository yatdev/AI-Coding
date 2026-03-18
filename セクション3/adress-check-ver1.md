function normalizeAddress(address) {
  if (!address) return "";

  let a = address;

  // 全角英数字 → 半角
  a = a.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s =>
    String.fromCharCode(s.charCodeAt(0) - 65248)
  );

  // スペース削除
  a = a.replace(/\s/g, "");

  // よくある表記ゆれ統一
  a = a
    .replace(/ヶ|ケ/g, "ケ")
    .replace(/ノ/g, "の")
    .replace(/大字/g, "")
    .replace(/字/g, "");

  // 漢数字変換
  const kanji = {
    "〇":0,"一":1,"二":2,"三":3,"四":4,
    "五":5,"六":6,"七":7,"八":8,"九":9
  };

  Object.keys(kanji).forEach(k=>{
    a = a.replaceAll(k,kanji[k]);
  });

  // 十の処理
  a = a.replace(/(\d*)十(\d*)/g,function(_,p1,p2){
    let left = p1 ? Number(p1)*10 : 10;
    let right = p2 ? Number(p2) : 0;
    return left+right;
  });

  // 丁目など統一
  a = a
    .replace(/丁目/g,"-")
    .replace(/番地/g,"-")
    .replace(/番/g,"-")
    .replace(/号/g,"");

  // ハイフン統一
  a = a
    .replace(/[ー－―‐]/g,"-");

  // 連続ハイフン整理
  a = a.replace(/--+/g,"-");

  return a;
}


function checkAddressDuplicates() {

  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) return;

  const values = sheet.getRange(2,1,lastRow-1,1).getValues();

  let normalized = [];
  let map = {};

  for (let i=0;i<values.length;i++){

    let addr = values[i][0];
    let norm = normalizeAddress(addr);

    normalized.push([norm]);

    if(!map[norm]) map[norm]=[];
    map[norm].push(i+2);
  }

  // B列に正規化住所
  sheet.getRange(2,2,normalized.length,1).setValues(normalized);

  // 色リセット
  sheet.getRange(2,1,lastRow-1,2).setBackground(null);

  // 重複ハイライト
  Object.keys(map).forEach(key=>{
    if(map[key].length>1){

      map[key].forEach(r=>{
        sheet.getRange(r,1,1,2).setBackground("#ffe0e0");
      });

    }
  });

}
