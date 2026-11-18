# workit

自宅トレーニングをPCブラウザで案内する静的Webアプリです。種目の動作図と説明を休憩中に表示します。種目名を開くと、名前・主に使う部位・強度の目安と種目別の出典を確認できます。メニューの自動生成では準備運動と整理運動も含めて立位と床の切り替えを1回以内に抑えます。本編では直前に運動した部位を確認し、スキップ後も同じ部位への負荷が連続しないようにします。軽い準備運動と整理運動は、本編の負荷判定から外しています。

## ローカルで使う

リポジトリのルートで次を実行し、ブラウザで <http://localhost:8000/> を開きます。

```sh
python3 -m http.server 8000
```

音声ガイドはブラウザが利用できる端末内の日本語音声を使います。利用できない場合は合図音と画面表示で進行します。PCでは運動中に、ボタンや入力欄にフォーカスがないとき、スペースキーで一時停止・再開できます。

設定・保存メニュー・履歴は同じブラウザとサイトの組み合わせごとに保存されます。別のブラウザや公開先へ移行する場合は、設定画面からJSONを保存して復元してください。メニューの負荷調整は、新しく生成するメニューに反映します。

## GitHub Pages

GitHub のリポジトリ設定で **Pages → Deploy from a branch → main → / (root)** を選択します。サーバー側の処理やビルドは不要です。

## 運動の案内に使った資料

- [厚生労働省「身体活動・運動を安全に行うためのポイント」](https://kennet.mhlw.go.jp/information/information/exercise/s-00-008.html)
- [American Heart Association「Warm Up, Cool Down」](https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/warm-up-cool-down)
- [NHS「Strength exercises」](https://www.nhs.uk/live-well/exercise/strength-exercises/)
- [厚生労働省「筋力トレーニングについて」](https://kennet.mhlw.go.jp/information/information/exercise/s-00-005.html)

座位の動作図は、たとえば [University of Iowa の床で行うストレッチの図](https://chtc.sites.uiowa.edu/lower-body-stretches) を参考にしています。参考図のある種目では、種目画面から元のページを開けます。

メニュー生成は、既存の運動資料で動作と姿勢・道具を確認できた種目だけを使います。種目の並び順・休憩・開始時の負荷には、workit の設定が適用されます。以前の種目は履歴とバックアップの表示用に残しています。
