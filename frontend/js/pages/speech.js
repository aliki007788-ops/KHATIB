const DIM_LABELS = {
  clarity: 'وضوح بیان', pace: 'ریتم و سرعت', confidence: 'اعتماد به نفس',
  vocabulary: 'دامنهٔ واژگان', structure: 'ساختار', engagement: 'جذابیت',
};

route('#/app/speech', {
  private: true,
  async render(root) {
    let mode = 'text';
    let mediaRecorder = null, chunks = [], recording = false, recordedBlob = null;

    async function paint() {
      const list = await api.speechList().catch(() => []);
      root.innerHTML = `
        <div class="page-head">
          <div><h2>اتاق سخنرانی</h2><p class="muted">موضوعت را بنویس یا صدایت را ضبط کن تا تحلیل شود.</p></div>
          <div class="mode-toggle">
            <button data-m="text" class="${mode === 'text' ? 'active' : ''}">متن</button>
            <button data-m="audio" class="${mode === 'audio' ? 'active' : ''}">صدا</button>
          </div>
        </div>

        <div class="dash-grid">
          <div class="card" id="practice-card"></div>
          <div class="card">
            <h3>تاریخچهٔ سخنرانی‌ها</h3>
            <hr class="rule-brass"/>
            <div id="speech-history">
              ${list.length === 0 ? '<div class="empty-state">هنوز تمرینی ثبت نشده</div>' :
                list.map(s => `
                  <div class="speech-list-item" data-id="${s.id}">
                    <div>
                      <div class="title">${escapeHtml(s.topic_label || 'بدون عنوان')}</div>
                      <div class="muted" style="font-size:.78rem">${fmtDate(s.created_at)} · ${s.mode === 'audio' ? 'صوتی' : 'متنی'}</div>
                    </div>
                    <div class="badge ${s.status === 'completed' ? 'badge-sage' : s.status === 'failed' ? 'badge-brick' : 'badge-brass'}">
                      ${s.status === 'completed' ? (s.overall_score ?? '') : s.status === 'failed' ? 'ناموفق' : 'در حال پردازش'}
                    </div>
                  </div>`).join('')}
            </div>
          </div>
        </div>
      `;

      root.querySelectorAll('.mode-toggle button').forEach(b => b.addEventListener('click', () => { mode = b.dataset.m; paint(); }));
      root.querySelectorAll('.speech-list-item').forEach(node => node.addEventListener('click', () => showResult(node.dataset.id)));
      renderPracticeCard();
    }

    function renderPracticeCard() {
      const c = root.querySelector('#practice-card');
      if (mode === 'text') {
        c.innerHTML = `
          <h3>تمرین متنی</h3>
          <hr class="rule-brass"/>
          <form id="text-form">
            <div class="field"><label>عنوان موضوع</label><input name="topic_label" required maxlength="255" placeholder="مثلاً: معرفی خودم"/></div>
            <div class="field"><label>متن سخنرانی</label><textarea name="text" required minlength="20" maxlength="10000" rows="8" placeholder="حداقل ۲۰ نویسه..."></textarea></div>
            <button class="btn btn-brass btn-block" type="submit">ارسال برای تحلیل</button>
          </form>`;
        c.querySelector('#text-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const btn = e.target.querySelector('button');
          btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
          const fd = new FormData(e.target);
          try {
            const speech = await api.speechText({ topic_label: fd.get('topic_label'), text: fd.get('text') });
            toast('سخنرانی ثبت شد', 'ok');
            await pollAndShow(speech.id);
            paint();
          } catch (err) {
            toast(err.message, 'error');
            btn.disabled = false; btn.textContent = 'ارسال برای تحلیل';
          }
        });
      } else {
        c.innerHTML = `
          <h3>تمرین صوتی</h3>
          <hr class="rule-brass"/>
          <div class="field"><label>عنوان موضوع</label><input id="audio-topic" maxlength="255" placeholder="مثلاً: سخنرانی افتتاحیه"/></div>
          <div class="stack center gap-m" style="padding:20px 0">
            <button class="record-dot" id="rec-btn">${ICONS.mic}</button>
            <div class="muted" id="rec-status">برای شروع ضبط، دکمه را بزن</div>
            <button class="btn btn-brass hidden" id="send-audio">ارسال برای تحلیل</button>
          </div>`;
        const recBtn = c.querySelector('#rec-btn');
        const statusEl = c.querySelector('#rec-status');
        const sendBtn = c.querySelector('#send-audio');

        recBtn.addEventListener('click', async () => {
          if (!recording) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              chunks = [];
              mediaRecorder = new MediaRecorder(stream);
              mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
              mediaRecorder.onstop = () => {
                recordedBlob = new Blob(chunks, { type: 'audio/webm' });
                stream.getTracks().forEach(t => t.stop());
                statusEl.textContent = 'ضبط شد — آماده ارسال';
                sendBtn.classList.remove('hidden');
              };
              mediaRecorder.start();
              recording = true;
              recBtn.classList.add('active');
              statusEl.textContent = 'در حال ضبط... دوباره بزن تا متوقف شود';
            } catch {
              toast('دسترسی به میکروفون ممکن نشد', 'error');
            }
          } else {
            mediaRecorder.stop();
            recording = false;
            recBtn.classList.remove('active');
          }
        });

        sendBtn.addEventListener('click', async () => {
          if (!recordedBlob) return;
          sendBtn.disabled = true; sendBtn.innerHTML = '<span class="spinner"></span>';
          const topic = c.querySelector('#audio-topic').value || 'تمرین صوتی';
          try {
            const speech = await api.speechAudio(topic, new File([recordedBlob], 'audio.webm', { type: 'audio/webm' }));
            toast('صدا ارسال شد', 'ok');
            await pollAndShow(speech.id);
            paint();
          } catch (err) {
            toast(err.message, 'error');
            sendBtn.disabled = false; sendBtn.textContent = 'ارسال برای تحلیل';
          }
        });
      }
    }

    async function pollAndShow(id) {
      let speech = await api.speechGet(id);
      let tries = 0;
      while (speech.status === 'pending' || speech.status === 'processing') {
        if (tries++ > 20) break;
        await new Promise(r => setTimeout(r, 1500));
        speech = await api.speechGet(id);
      }
      renderResultModal(speech);
    }

    async function showResult(id) {
      try {
        const speech = await api.speechGet(id);
        renderResultModal(speech);
      } catch (e) { toast(e.message, 'error'); }
    }

    function renderResultModal(s) {
      if (s.status === 'failed') {
        openModal(`<h3>ناموفق</h3><p class="muted">تحلیل این سخنرانی با خطا مواجه شد.</p><button class="btn btn-ghost btn-block" onclick="this.closest('.modal-backdrop').remove()">بستن</button>`);
        return;
      }
      if (s.status !== 'completed') {
        openModal(`<h3>در حال پردازش</h3><p class="muted">نتیجه هنوز آماده نیست، کمی بعد دوباره بررسی کن.</p><button class="btn btn-ghost btn-block" onclick="this.closest('.modal-backdrop').remove()">بستن</button>`);
        return;
      }
      const dims = s.dimension_scores || {};
      const dimHtml = Object.entries(dims).map(([k, v]) => `
        <div class="dim-bar-row">
          <div style="width:110px;font-size:.85rem">${DIM_LABELS[k] || escapeHtml(k)}</div>
          <div class="dim-bar-track"><div class="dim-bar-fill" style="width:${v}%"></div></div>
          <div style="width:30px;text-align:left;font-size:.85rem">${v}</div>
        </div>`).join('');
      const listHtml = (arr, cls) => (arr || []).map(x => `<li class="${cls}">${escapeHtml(x)}</li>`).join('');
      openModal(`
        <div class="row gap-m" style="align-items:flex-start">
          ${scoreGauge(s.overall_score, 96)}
          <div><h3 style="margin-bottom:2px">${escapeHtml(s.topic_label || 'سخنرانی')}</h3><div class="muted" style="font-size:.8rem">${fmtDate(s.created_at)}</div></div>
        </div>
        <hr class="divider"/>
        ${dimHtml}
        ${s.strengths?.length ? `<h3 style="margin-top:18px">نقاط قوت</h3><ul>${listHtml(s.strengths)}</ul>` : ''}
        ${s.weaknesses?.length ? `<h3>نقاط قابل بهبود</h3><ul>${listHtml(s.weaknesses)}</ul>` : ''}
        ${s.next_practice ? `<p class="muted" style="margin-top:10px"><strong>پیشنهاد بعدی:</strong> ${escapeHtml(s.next_practice)}</p>` : ''}
        <button class="btn btn-ghost btn-block" style="margin-top:14px" onclick="this.closest('.modal-backdrop').remove()">بستن</button>
      `);
    }

    await paint();
  }
});
