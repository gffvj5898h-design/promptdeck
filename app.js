(()=>{
const C=window.PROMPTDECK_COMMANDS||[];
const cats=[['all','Все'],['product_scene','Продукт · стиль'],['product_info','Продукт · инфографика'],['portrait','Лицо'],['people_photo','Люди и фото']];
const varCmd=new Set(['/hairstyle','/sunglasses','/beardstyle','/glasses','/outfitpreview']);
const quick=[
  ['📸','Улучшить фото','/proshot'],['💇','Подобрать прическу','/hairstyle'],['👓','Подобрать очки','/glasses'],['🧔','Подобрать бороду','/beardstyle'],
  ['🖼','Сменить фон','/newbg'],['👔','Примерить образы','/outfitpreview'],['🎬','Кадр из фильма','/cinereel'],['💼','Фото для работы','/headshot'],
  ['🛍','Красиво показать товар','/premiumshowcase'],['📊','Сделать инфографику','/infographic']
];
let cat='all',cur=null,ratio='',variants='4',look='',installEvent=null,photoFile=null,photoUrl='';
const $=x=>document.getElementById(x);
const fav=()=>JSON.parse(localStorage.getItem('pdFav')||'[]');
const recent=()=>JSON.parse(localStorage.getItem('pdRecent')||'[]');
const setFav=x=>localStorage.setItem('pdFav',JSON.stringify(x));
const setRecent=x=>localStorage.setItem('pdRecent',JSON.stringify(x));
const esc=s=>(s||'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function card(c){const on=fav().includes(c.command);return `<button class="card" data-cmd="${c.command}"><div><code>${esc(c.command)}</code><b>${esc(c.title)}</b><small>${esc(c.categoryLabel)}</small></div><span class="star ${on?'on':''}">${on?'★':'☆'}</span></button>`}
function render(){const q=$('q').value.trim().toLowerCase(),a=C.filter(c=>(cat==='all'||c.category===cat)&&(!q||(c.command+' '+c.title+' '+c.rule).toLowerCase().includes(q)));$('list').innerHTML=a.map(card).join('')||'<div class="empty">Ничего не найдено.</div>';bindCards($('list'))}
function bindCards(node){node.querySelectorAll('.card').forEach(b=>b.onclick=e=>{const cmd=b.dataset.cmd;if(e.target.classList.contains('star')){e.stopPropagation();toggleFav(cmd);renderAllLists();render();return}openCmd(cmd)})}
function renderCats(){$('cats').innerHTML=cats.map(([k,n])=>`<button data-cat="${k}" class="${k===cat?'on':''}">${n}</button>`).join('');$('cats').querySelectorAll('button').forEach(b=>b.onclick=()=>{cat=b.dataset.cat;renderCats();render()})}
function renderQuick(){$('quick').innerHTML=quick.map(([i,n,c])=>`<button data-cmd="${c}"><span>${i}</span><b>${n}</b></button>`).join('');$('quick').querySelectorAll('button').forEach(b=>b.onclick=()=>openCmd(b.dataset.cmd))}
function renderAllLists(){const f=fav().map(x=>C.find(c=>c.command===x)).filter(Boolean),r=recent().map(x=>C.find(c=>c.command===x)).filter(Boolean);$('favList').innerHTML=f.map(card).join('');$('recentList').innerHTML=r.map(card).join('');$('favEmpty').classList.toggle('hidden',!!f.length);$('recentEmpty').classList.toggle('hidden',!!r.length);bindCards($('favList'));bindCards($('recentList'));if(cur)$('star').textContent=fav().includes(cur.command)?'★':'☆'}
function toggleFav(cmd){let f=fav();f=f.includes(cmd)?f.filter(x=>x!==cmd):[cmd,...f];setFav(f.slice(0,60))}
function addRecent(cmd){let r=recent().filter(x=>x!==cmd);setRecent([cmd,...r].slice(0,20));renderAllLists()}
function selectGroup(id,v){$(id).querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===v))}
function openCmd(cmd){cur=C.find(c=>c.command===cmd);if(!cur)return;ratio='';variants='4';look='';$('note').value='';selectGroup('ratios','');selectGroup('variants','4');selectGroup('looks','');$('sheetCat').textContent=cur.categoryLabel;$('sheetCmd').textContent=cur.command;$('sheetTitle').textContent=cur.title;$('rule').textContent=cur.rule;$('variantsBox').classList.toggle('hidden',!varCmd.has(cur.command));$('star').textContent=fav().includes(cur.command)?'★':'☆';build();$('shade').classList.remove('hidden');$('sheet').classList.add('open');addRecent(cmd)}
function close(){$('sheet').classList.remove('open');$('shade').classList.add('hidden')}
function sourceInstruction(){if(photoFile)return 'Используй приложенное изображение как главный визуальный референс.';return 'Изображение не приложено. Создай новое изображение, следуя задаче и ограничениям ниже.'}
function categoryGuard(){if(!cur)return '';if(cur.category==='product_scene'||cur.category==='product_info')return 'Сохраняй узнаваемую форму, упаковку, логотипы и надписи товара, если сама задача прямо не требует их стилизации. Не придумывай характеристики, состав, размеры, материалы, преимущества, цифры или свойства, которых нет в исходнике или моём уточнении.';return 'Сохраняй идентичность человека, пропорции, возрастные признаки и узнаваемые черты, кроме тех изменений, которые прямо требуются задачей. Не превращай человека в другого человека.'}
function build(){if(!cur)return;const opts=[];if(varCmd.has(cur.command))opts.push(`Количество вариантов: ${variants}.`);if(ratio)opts.push(`Формат результата: ${ratio}.`);if(look)opts.push(`Визуальная подача: ${look}.`);if($('face').checked&&['portrait','people_photo'].includes(cur.category))opts.push('Сохрани идентичность лица.');if($('text').checked)opts.push('Не добавляй лишний текст, подписи, бренды, слоганы или факты, которых я не предоставил.');if($('real').checked&&['portrait','people_photo'].includes(cur.category))opts.push('Приоритет — максимально реалистичный результат без пластиковой ретуши и визуальных галлюцинаций.');if($('strict').checked)opts.push('Выполни только указанную трансформацию; всё остальное по возможности оставь без изменений.');document.querySelectorAll('#extra .on').forEach(b=>opts.push(b.dataset.v.charAt(0).toUpperCase()+b.dataset.v.slice(1)+'.'));const n=$('note').value.trim();if(n)opts.push(`Дополнительное уточнение пользователя: ${n}`);const prompt=[
sourceInstruction(),
`Задача: ${cur.title}.`,
`Правило выполнения: ${cur.rule}`,
categoryGuard(),
opts.length?'Дополнительные параметры:\n- '+opts.join('\n- '):'',
'Не объясняй команду и не описывай, что собираешься делать. Выполни редактирование или генерацию изображения сразу.'
].filter(Boolean).join('\n\n');$('prompt').value=prompt;$('photoState').textContent=photoFile?`Фото прикреплено: ${photoFile.name}`:'Фото не прикреплено — промт будет работать как новая генерация.'}
function bindGroup(id,fn){$(id).querySelectorAll('button').forEach(b=>b.onclick=()=>{fn(b.dataset.v);selectGroup(id,b.dataset.v);build()})}
function screens(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.screen===id));if(id!=='home')renderAllLists()}
function toast(msg='Скопировано'){$('toast').textContent=msg;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),1300)}
function setPhoto(file){if(photoUrl)URL.revokeObjectURL(photoUrl);photoFile=file||null;photoUrl='';if(!photoFile){$('photoPreview').classList.add('hidden');$('pickPhoto').classList.remove('hidden');if(cur)build();return}photoUrl=URL.createObjectURL(photoFile);$('photoImg').src=photoUrl;$('photoName').textContent=photoFile.name||'Фото';$('photoMeta').textContent=`${Math.max(1,Math.round(photoFile.size/1024))} КБ`;$('photoPreview').classList.remove('hidden');$('pickPhoto').classList.add('hidden');if(cur)build()}
$('pickPhoto').onclick=()=>$('photoInput').click();$('photoInput').onchange=e=>{const f=e.target.files&&e.target.files[0];if(f)setPhoto(f)};$('removePhoto').onclick=()=>{setPhoto(null);$('photoInput').value=''};
$('q').oninput=()=>{$('clear').classList.toggle('hidden',!$('q').value);render()};$('clear').onclick=()=>{$('q').value='';$('clear').classList.add('hidden');render()};$('clearRecent').onclick=()=>{setRecent([]);renderAllLists()};document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>screens(b.dataset.screen));$('close').onclick=close;$('shade').onclick=close;bindGroup('ratios',v=>ratio=v);bindGroup('variants',v=>variants=v);bindGroup('looks',v=>look=v);document.querySelectorAll('#extra button').forEach(b=>b.onclick=()=>{b.classList.toggle('on');build()});['face','text','real','strict'].forEach(id=>$(id).onchange=()=>{localStorage.setItem('pd_'+id,$(id).checked?'1':'0');build()});['face','text','real','strict'].forEach(id=>{const v=localStorage.getItem('pd_'+id);if(v!==null)$(id).checked=v==='1'});$('note').oninput=build;$('star').onclick=()=>{toggleFav(cur.command);renderAllLists();render()};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('prompt').value)}catch(e){$('prompt').select();document.execCommand('copy')}toast()};
$('share').onclick=async()=>{const text=$('prompt').value;try{if(photoFile&&navigator.share&&navigator.canShare&&navigator.canShare({files:[photoFile]})){await navigator.share({text,files:[photoFile]});return}if(navigator.share){await navigator.share({text});if(photoFile)toast('Промт отправлен; фото добавь вручную');return}$('copy').click()}catch(e){if(e&&e.name!=='AbortError')toast('Не удалось поделиться')}};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvent=e;$('install').classList.remove('hidden')});$('install').onclick=async()=>{if(installEvent){installEvent.prompt();await installEvent.userChoice;installEvent=null;$('install').classList.add('hidden')}};if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(()=>{});
renderQuick();renderCats();render();renderAllLists();
})();
