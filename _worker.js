// Cloudflare Pages 고급 모드 워커: 정적 사이트 + 공공데이터 API 중계(CORS 우회, 키 서버주입)
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;
    const cors = { "access-control-allow-origin": "*" };
    // 전국 병의원/약국 API 중계
    if (p.startsWith("/B552657/")) {
      const t = new URL("https://apis.data.go.kr" + p + url.search);
      if (env.EGEN_KEY) t.searchParams.set("serviceKey", env.EGEN_KEY); // 서버 비밀키 주입
      const r = await fetch(t.toString(), { headers: { "User-Agent": "Mozilla/5.0" } });
      const body = await r.text();
      return new Response(body, { status: r.status, headers: {
        "content-type": r.headers.get("content-type") || "text/xml; charset=utf-8", ...cors } });
    }
    // 이대목동 의료진 페이지 중계(선택)
    if (p.startsWith("/mok/")) {
      const t = "https://mokdong.eumc.ac.kr" + p.slice(4) + url.search;
      const r = await fetch(t, { headers: { "User-Agent": "Mozilla/5.0" } });
      const body = await r.text();
      return new Response(body, { status: r.status, headers: {
        "content-type": r.headers.get("content-type") || "text/html; charset=utf-8", ...cors } });
    }
    // 그 외에는 정적 파일(index.html 등) 그대로 제공
    return env.ASSETS.fetch(request);
  }
};
