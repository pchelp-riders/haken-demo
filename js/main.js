(() => {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // 求人一覧（staff.html のみ）
  const list = document.getElementById("jobList");
  if (list) {
    const jobs = window.JOBS || [];
    const count = document.getElementById("jobCount");
    const render = area => {
      const rows = jobs.filter(j => area === "all" || j.area === area);
      count.textContent = `${rows.length}件`;
      list.innerHTML = rows.length ? rows.map(j => `
        <li class="job">
          <span class="area">${esc(j.area)}<small>${esc(j.place)}</small></span>
          <div>
            <h3>${esc(j.title)}</h3>
            <div class="meta"><span>${esc(j.term)}</span><span>${esc(j.time)}</span><span class="tag">${esc(j.tag)}</span></div>
          </div>
          <div class="pay"><small>時給</small><b>¥${Number(j.pay).toLocaleString("ja-JP")}</b></div>
        </li>`).join("") : '<li class="empty">このエリアの募集は今はありません。登録いただければ、新しいお仕事が出たときにご連絡します。</li>';
    };
    document.querySelectorAll(".chip").forEach(btn => btn.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
      render(btn.dataset.area);
    }));
    render("all");
  }

  // お問い合わせ・登録フォーム（business.html / staff.html）
  const form = document.getElementById("contactForm");
  if (!form) return;
  const sent = document.getElementById("sentMsg");
  const submitBtn = document.getElementById("submitBtn");
  const show = msg => { sent.hidden = false; sent.textContent = msg; };

  form.addEventListener("submit", async e => {
    e.preventDefault();
    // form.name はフォーム自身の name 属性を指すので elements から取る
    const f = form.elements;
    const name = f["name"].value.trim();
    const email = f["email"].value.trim();
    if (!name || !email) return show("お名前とメールアドレスを入力してください。");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return show("メールアドレスの形が正しくありません。");
    if (!f["agree"].checked) return show("個人情報の取り扱いへの同意にチェックを入れてください。");

    submitBtn.disabled = true;
    try {
      const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      // 404/405 = send.php が動かない置き場所（GitHub Pages・Artifact の試作版）
      if (res.status === 404 || res.status === 405) return show("試作版のため、まだ送信はできません。本番では担当者にメールが届きます。");
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        form.reset();
        show("送信しました。担当者からご連絡します。");
      } else {
        show(data.error || "送信できませんでした。時間をおいてもう一度お試しいただくか、お電話でご連絡ください。");
      }
    } catch {
      show("通信に失敗しました。時間をおいてもう一度お試しいただくか、お電話でご連絡ください。");
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
