/* =====================================================
   SHAYEB SHOP — البيانات: الفئات والقوائم والمنتجات
   ===================================================== */
/* ---------- Categories (جديد، امرأة، رجل، أطفال، إلكتروني) ---------- */
const T3=(ar,en,tr)=>({ar,en,tr});
const CATS=[
 {id:"new",label:T3("جديد","New","Yeni"),tag:true,groups:[]},
 {id:"women",label:T3("امرأة","Women","Kadın"),groups:[
   {t:T3("ملابس","Clothing","Giyim"),items:[T3("فستان","Dress","Elbise"),T3("تي شيرت","T-shirt","Tişört"),T3("قميص","Shirt","Gömlek"),T3("جينز","Jeans","Kot"),T3("جاكيت جينز","Denim jacket","Kot ceket")]},
   {t:T3("حذاء","Shoes","Ayakkabı"),items:[T3("أحذية بكعب عالٍ","High heels","Topuklu"),T3("حذاء رياضة","Sneakers","Spor ayakkabı"),T3("أحذية كاجوال","Casual shoes","Günlük ayakkabı"),T3("صنادل","Sandals","Sandalet")]},
   {t:T3("الإكسسوارات والحقائب","Accessories & Bags","Aksesuar & Çanta"),items:[T3("شنطة","Bag","Çanta"),T3("ساعة","Watch","Saat"),T3("مجوهرات","Jewelry","Takı"),T3("حافظة","Wallet","Cüzdan"),T3("وشاح","Scarf","Şal")]},
   {t:T3("مستحضرات التجميل","Beauty","Kozmetik"),items:[T3("عطر","Perfume","Parfüm"),T3("مكياج العيون","Eye makeup","Göz makyajı"),T3("العناية بالبشرة","Skincare","Cilt bakımı"),T3("العناية بالشعر","Haircare","Saç bakımı")]}]},
 {id:"men",label:T3("رجل","Men","Erkek"),groups:[
   {t:T3("ملابس","Clothing","Giyim"),items:[T3("تي شيرت","T-shirt","Tişört"),T3("قميص","Shirt","Gömlek"),T3("بنطلون","Trousers","Pantolon"),T3("بدلة رياضية","Tracksuit","Eşofman"),T3("سراويل","Shorts","Şort")]},
   {t:T3("حذاء","Shoes","Ayakkabı"),items:[T3("أحذية رياضية","Sneakers","Spor ayakkabı"),T3("أحذية كاجوال","Casual shoes","Günlük ayakkabı"),T3("أحذية المشي","Walking shoes","Yürüyüş ayakkabısı")]},
   {t:T3("الساعات والإكسسوارات","Watches & Accessories","Saat & Aksesuar"),items:[T3("ساعة","Watch","Saat"),T3("نظارات شمسية","Sunglasses","Güneş gözlüğü"),T3("حزام","Belt","Kemer"),T3("محفظة","Wallet","Cüzdan")]},
   {t:T3("حقائب","Bags","Çanta"),items:[T3("حقيبة ظهر","Backpack","Sırt çantası"),T3("حقيبة مراسلة","Messenger bag","Postacı çantası"),T3("حقيبة كمبيوتر محمول","Laptop bag","Laptop çantası")]}]},
 {id:"kids",label:T3("أطفال","Kids","Çocuk"),groups:[
   {t:T3("ولد","Boys","Erkek çocuk"),items:[T3("سويت شيرت","Sweatshirt","Sweatshirt"),T3("أحذية رياضية","Sneakers","Spor ayakkabı"),T3("بدلة رياضية","Tracksuit","Eşofman"),T3("تيشيرتات","T-shirts","Tişörtler")]},
   {t:T3("بنت","Girls","Kız çocuk"),items:[T3("فستان","Dress","Elbise"),T3("سويت شيرت","Sweatshirt","Sweatshirt"),T3("أحذية رياضية","Sneakers","Spor ayakkabı"),T3("ملابس داخلية وبيجامات","Underwear & PJs","İç giyim & pijama")]},
   {t:T3("لعبة","Toys","Oyuncak"),items:[T3("ألعاب تعليمية","Educational toys","Eğitici oyuncak"),T3("سيارة لعبة","Toy car","Oyuncak araba"),T3("لعبة تحكم عن بعد","RC toys","Uzaktan kumandalı")]},
   {t:T3("رعاية الطفل","Baby care","Bebek bakım"),items:[T3("حفاضات","Diapers","Bebek bezi"),T3("شامبو الأطفال","Baby shampoo","Bebek şampuanı"),T3("حقيبة أطفال","Kids bag","Çocuk çantası")]}]},
 {id:"elec",label:T3("إلكتروني","Electronics","Elektronik"),groups:[
   {t:T3("الهاتف","Phones","Telefon"),items:[T3("الهاتف المحمول","Mobile phones","Cep telefonu"),T3("أغطية الهواتف","Phone cases","Telefon kılıfı"),T3("الشواحن","Chargers","Şarj aletleri")]},
   {t:T3("أجهزة الكمبيوتر","Computers","Bilgisayar"),items:[T3("كمبيوتر محمول","Laptop","Laptop"),T3("جهاز لوحي","Tablet","Tablet"),T3("شاشة","Monitor","Monitör")]},
   {t:T3("الأجهزة المنزلية","Home appliances","Ev aletleri"),items:[T3("مكواة بخار","Steam iron","Buharlı ütü"),T3("خلاط","Blender","Blender"),T3("مكنسة روبوت","Robot vacuum","Robot süpürge"),T3("ماكينة قهوة","Coffee machine","Kahve makinesi")]},
   {t:T3("التكنولوجيا القابلة للارتداء","Wearables","Giyilebilir teknoloji"),items:[T3("ساعة ذكية","Smartwatch","Akıllı saat"),T3("سوار ذكي","Smart band","Akıllı bileklik"),T3("سماعات لاسلكية","Wireless earbuds","Kablosuz kulaklık")]}]}
];

/* ---------- Products — الأسعار الأساسية بالدولار ثم تُحوَّل حسب اللغة ---------- */
let PID=100;
const P=(name,cat,usd,oldUsd,rate,votes,icon,g1,g2,desc)=>({id:PID++,name,cat,usd,oldUsd,rate,votes,icon,g1,g2,img:null,seller:null,desc,comments:[],ownerEmail:null,stock:3+(PID%13)});
const PRODUCTS=[
 P(T3("سماعات لاسلكية بعزل الضجيج","Wireless Noise-Cancelling Earbuds","Kablosuz Gürültü Önleyici Kulaklık"),"elec",15,24,4.6,2318,"🎧","#e3f5ec","#eafaf2",T3("بطارية 30 ساعة، عزل ضجيج فعّال، مقاومة للماء IPX5.","30h battery, active noise cancelling, IPX5 water resistant.","30 saat pil, aktif gürültü önleme, IPX5 suya dayanıklı.")),
 P(T3("ساعة ذكية رياضية مقاومة للماء","Waterproof Sports Smartwatch","Su Geçirmez Spor Akıllı Saat"),"elec",25,38,4.7,1841,"⌚","#e6f6ef","#e9f8f1",T3("قياس نبض وأكسجين، GPS، شاشة أموليد، بطارية 10 أيام.","Heart rate & SpO2, GPS, AMOLED display, 10-day battery.","Nabız ve SpO2, GPS, AMOLED ekran, 10 gün pil.")),
 P(T3("مكنسة روبوت ذكية بالليزر","Smart Laser Robot Vacuum","Akıllı Lazer Robot Süpürge"),"elec",90,130,4.6,933,"🤖","#eef4f0","#e6f6ef",T3("خرائط ليزرية، شفط 4000Pa، تحكم بالتطبيق.","Laser mapping, 4000Pa suction, app control.","Lazer haritalama, 4000Pa emiş, uygulama kontrolü.")),
 P(T3("مكواة بخار احترافية 2600W","Pro Steam Iron 2600W","Profesyonel Buharlı Ütü 2600W"),"elec",18,27,4.6,1420,"🫖","#e9f8f1","#f0f6f2",T3("بخار قوي 45غ/د، قاعدة سيراميك، حماية من الكلس.","Powerful 45g/min steam, ceramic plate, anti-calc.","45g/dk güçlü buhar, seramik taban, kireç önleyici.")),
 P(T3("خلاط كهربائي متعدد السرعات","Multi-Speed Blender","Çok Hızlı Blender"),"elec",16,23,4.3,1187,"🥤","#e6f6ef","#eef4f0",T3("محرك 1000W، دورق زجاجي 1.5 لتر، شفرات ستانلس.","1000W motor, 1.5L glass jar, stainless blades.","1000W motor, 1.5L cam hazne, çelik bıçaklar.")),
 P(T3("مصفف شعر 2 في 1","2-in-1 Hair Styler","2'si 1 Arada Saç Şekillendirici"),"elec",20,29,4.5,1276,"💈","#f2ede9","#e9f8f1",T3("تمليس وتجعيد بجهاز واحد، حماية حرارية أيونية.","Straighten & curl in one device, ionic heat protection.","Tek cihazla düzleştirme ve dalga, iyonik ısı koruması.")),
 P(T3("فستان صيفي قطني","Cotton Summer Dress","Pamuklu Yazlık Elbise"),"women",12,18,4.4,986,"👗","#fdf0f2","#eafaf2",T3("قطن 100% خفيف ومريح، متوفر بعدة قياسات.","100% light comfy cotton, multiple sizes.","%100 hafif pamuk, birçok beden.")),
 P(T3("عطر شرقي فاخر 100مل","Luxury Oriental Perfume 100ml","Lüks Oryantal Parfüm 100ml"),"women",14,22,4.8,655,"🌸","#fdf0f2","#f2ecf7",T3("ثبات طويل، نفحات عود وعنبر وفانيلا.","Long-lasting; oud, amber & vanilla notes.","Kalıcı; ud, amber ve vanilya notaları.")),
 P(T3("حذاء رياضي نسائي خفيف","Women's Lightweight Sneakers","Kadın Hafif Spor Ayakkabı"),"women",17,25,4.5,1204,"👟","#eafaf2","#e6f6ef",T3("نعل مرن مريح للمشي اليومي.","Flexible sole, comfy for daily walks.","Esnek taban, günlük yürüyüşe uygun.")),
 P(T3("حقيبة كتف أنيقة","Elegant Shoulder Bag","Şık Omuz Çantası"),"women",11,17,4.4,689,"👜","#f6efe9","#fdf0f2",T3("جلد صناعي فاخر بعدة جيوب داخلية.","Premium faux leather, multiple inner pockets.","Kaliteli suni deri, çoklu iç cep.")),
 P(T3("تيشيرت قطني رجالي أساسي","Men's Basic Cotton T-Shirt","Erkek Basic Pamuklu Tişört"),"men",5,8,4.4,4210,"👕","#e6f6ef","#eef4f0",T3("قطن مريح بقصّة عصرية وألوان متعددة.","Comfy cotton, modern fit, many colors.","Rahat pamuk, modern kesim, çok renk.")),
 P(T3("حذاء رياضي رجالي للجري","Men's Running Shoes","Erkek Koşu Ayakkabısı"),"men",22,32,4.5,3102,"🏃","#e9f8f1","#e3f5ec",T3("توسيد هوائي وامتصاص صدمات للجري الطويل.","Air cushioning & shock absorption for long runs.","Uzun koşular için hava yastığı ve şok emici.")),
 P(T3("ساعة رجالية كلاسيكية","Men's Classic Watch","Erkek Klasik Saat"),"men",19,28,4.6,857,"⌚","#eef4f0","#e6f6ef",T3("سوار ستانلس، مقاومة للماء 5ATM.","Stainless strap, 5ATM water resistant.","Çelik kordon, 5ATM suya dayanıklı.")),
 P(T3("حقيبة ظهر عملية مقاومة للماء","Waterproof Everyday Backpack","Su Geçirmez Günlük Sırt Çantası"),"men",10,16,4.5,742,"🎒","#e6f6ef","#eafaf2",T3("جيب لابتوب 15.6، منفذ USB خارجي.","15.6\" laptop pocket, external USB port.","15.6\" laptop bölmesi, harici USB.")),
 P(T3("سيارة أطفال بتحكم عن بعد","Kids RC Racing Car","Çocuk Uzaktan Kumandalı Araba"),"kids",13,20,4.7,1530,"🏎️","#eafaf2","#fff3e0",T3("سرعة عالية، بطارية شحن، مناسبة +6 سنوات.","High speed, rechargeable, ages 6+.","Yüksek hız, şarjlı, 6 yaş ve üzeri.")),
 P(T3("طقم ملابس أطفال قطني","Kids Cotton Clothing Set","Çocuk Pamuklu Takım"),"kids",8,13,4.6,921,"🧒","#fff3e0","#eafaf2",T3("طقم 3 قطع قطن ناعم لطيف على البشرة.","Soft 3-piece cotton set, gentle on skin.","Yumuşak 3 parça pamuk takım.")),
 P(T3("حقيبة مدرسية بعجلات","Kids School Trolley Bag","Tekerlekli Okul Çantası"),"kids",12,19,4.5,678,"🎒","#e6f6ef","#fdf0f2",T3("عجلات صامتة وظهر مبطّن ومقاومة للماء.","Silent wheels, padded back, water resistant.","Sessiz teker, yastıklı sırt, suya dayanıklı.")),
 P(T3("مكعبات تعليمية 120 قطعة","Educational Blocks 120 pcs","Eğitici Bloklar 120 Parça"),"kids",9,14,4.8,1112,"🧩","#eafaf2","#f2ecf7",T3("بلاستيك آمن خالٍ من BPA، تنمّي الإبداع.","Safe BPA-free plastic, boosts creativity.","BPA içermeyen güvenli plastik, yaratıcılığı geliştirir."))
];

