route('#/app/chat', {
  private: true,
  async render(root) {
    let activeId = null;

    async function paint() {
      const list = await api.convList().catch(() => []);
      if (!activeId && list.length) activeId = list[0].id;

      root.innerHTML = `
        <div class="page-head">
          <div><h2>گفتگوی عراقی</h2><p class="muted">با هم‌صحبت هوشمند به لهجهٔ عراقی تمرین کن.</p></div>
          <button class="btn btn-brass btn-sm" id="new-conv">${ICONS.chat} گفتگوی تازه</button>
        </div>
        <div class="chat-shell">
          <div class="conv-list">
            ${list.length === 0 ? '<div class="empty-state">گفتگویی نداری</div>' :
              list.map(c => `<div class="conv-item ${c.id === activeId ? 'active' : ''}" data-id="${c.id}">${escapeHtml(c.title || 'گفتگوی بدون عنوان')}<div class="muted" style="font-size:.74rem">${fmtDate(c.updated_at)}</div></div>`).join('')}
          </div>
          <div class="chat-col card" id="chat-col"></div>
        </div>
      `;

      root.querySelector('#new-conv').addEventListener('click', async () => {
        try {
          const conv = await api.convCreate();
          activeId = conv.id;
          paint();
        } catch (e) { toast(e.message, 'error'); }
      });
      root.querySelectorAll('.conv-item').forEach(n => n.addEventListener('click', () => { activeId = n.dataset.id; paint(); }));

      if (activeId) await paintThread(); else paintEmptyThread();
    }

    function paintEmptyThread() {
      root.querySelector('#chat-col').innerHTML = `<div class="empty-state">یک گفتگوی تازه بساز و شروع کن</div>`;
    }

    async function paintThread() {
      const col = root.querySelector('#chat-col');
      col.innerHTML = `<div class="empty-state"><div class="spinner" style="margin:0 auto"></div></div>`;
      let conv;
      try { conv = await api.convGet(activeId); } catch (e) { toast(e.message, 'error'); return; }

      col.innerHTML = `
        <div class="chat-msgs" id="msgs">
          ${conv.messages.length === 0 ? '<div class="empty-state">پیامی بفرست تا گفتگو آغاز شود</div>' :
            conv.messages.map(m => `<div class="msg ${m.role === 'user' ? 'user' : 'assistant'}">${escapeHtml(m.content)}</div>`).join('')}
        </div>
        <div class="chat-input-row">
          <input id="msg-input" placeholder="پیامت را بنویس..." maxlength="2000"/>
          <button class="btn btn-brass" id="send-btn">ارسال</button>
        </div>
      `;
      const msgsEl = col.querySelector('#msgs');
      msgsEl.scrollTop = msgsEl.scrollHeight;

      const input = col.querySelector('#msg-input');
      const sendBtn = col.querySelector('#send-btn');
      const send = async () => {
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        sendBtn.disabled = true;
        msgsEl.insertAdjacentHTML('beforeend', `<div class="msg user">${escapeHtml(text)}</div>`);
        msgsEl.scrollTop = msgsEl.scrollHeight;
        try {
          const reply = await api.convSend(activeId, text);
          msgsEl.insertAdjacentHTML('beforeend', `<div class="msg assistant">${escapeHtml(reply.content)}</div>`);
          msgsEl.scrollTop = msgsEl.scrollHeight;
        } catch (e) { toast(e.message, 'error'); }
        sendBtn.disabled = false;
      };
      sendBtn.addEventListener('click', send);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
    }

    await paint();
  }
});
