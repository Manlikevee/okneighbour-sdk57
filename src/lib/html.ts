/**
 * Minimal, dependency-free HTML -> block/inline model for post content.
 * Handles what the rich-text editor and the web app produce: p/div/br, h1-h6, strong/b, em/i,
 * u, s, code, a, ul/ol/li, blockquote. Anything else is dropped but its text is kept.
 */

export type Inline = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  href?: string;
};

export type Block =
  | { type: 'paragraph'; children: Inline[] }
  | { type: 'heading'; level: 1 | 2 | 3; children: Inline[] }
  | { type: 'quote'; children: Inline[] }
  | { type: 'list'; ordered: boolean; items: Inline[][] };

const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '\u2019', lsquo: '\u2018',
  rdquo: '\u201D', ldquo: '\u201C', hellip: '\u2026', ndash: '\u2013', mdash: '\u2014',
};

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      try {
        return Number.isFinite(code) ? String.fromCodePoint(code) : m;
      } catch {
        return m;
      }
    }
    return NAMED[e.toLowerCase()] ?? m;
  });
}

const BLOCK_TAGS = new Set(['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote']);
const SKIP_CONTENT = new Set(['script', 'style']);

function safeHref(href: string): string | undefined {
  const h = decodeEntities(href).trim();
  return /^(https?:|mailto:|tel:)/i.test(h) ? h : undefined;
}

export function parseHtml(input: string | null | undefined): Block[] {
  const html = input ?? '';
  if (!html.trim()) return [];

  // Plain text (no markup): keep line breaks as paragraphs.
  if (!/<\/?[a-z][^>]*>/i.test(html)) {
    return html
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((text) => ({ type: 'paragraph', children: [{ text }] }));
  }

  const blocks: Block[] = [];
  const style = { bold: 0, italic: 0, underline: 0, strike: 0, code: 0 };
  const hrefs: (string | undefined)[] = [];
  let kind: 'paragraph' | 'heading' | 'quote' = 'paragraph';
  let level: 1 | 2 | 3 = 2;
  let buf: Inline[] = [];
  const lists: { ordered: boolean; items: Inline[][] }[] = [];
  let inItem = false;
  let skipDepth = 0;

  const trimRun = (runs: Inline[]): Inline[] => {
    const out = runs.filter((r) => r.text.length > 0).map((r) => ({ ...r }));
    if (out.length) {
      out[0].text = out[0].text.replace(/^\s+/, '');
      out[out.length - 1].text = out[out.length - 1].text.replace(/\s+$/, '');
    }
    return out.filter((r) => r.text.length > 0);
  };

  const flush = () => {
    const children = trimRun(buf);
    buf = [];
    if (children.length === 0) return;
    if (inItem && lists.length) {
      lists[lists.length - 1].items.push(children);
      return;
    }
    if (kind === 'heading') blocks.push({ type: 'heading', level, children });
    else if (kind === 'quote') blocks.push({ type: 'quote', children });
    else blocks.push({ type: 'paragraph', children });
  };

  const closeList = () => {
    flush();
    const l = lists.pop();
    if (l && l.items.length) blocks.push({ type: 'list', ordered: l.ordered, items: l.items });
    inItem = false;
  };

  const push = (text: string) => {
    if (!text) return;
    buf.push({
      text,
      bold: style.bold > 0 || undefined,
      italic: style.italic > 0 || undefined,
      underline: style.underline > 0 || undefined,
      strike: style.strike > 0 || undefined,
      code: style.code > 0 || undefined,
      href: hrefs[hrefs.length - 1],
    });
  };

  const re = /<\/?[a-zA-Z][^>]*>|<!--[\s\S]*?-->|[^<]+|</g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const tok = m[0];
    if (tok.startsWith('<!--')) continue;
    if (tok[0] !== '<' || tok === '<') {
      if (skipDepth > 0) continue;
      push(decodeEntities(tok).replace(/\s+/g, ' '));
      continue;
    }
    const closing = tok[1] === '/';
    const name = (/^<\/?([a-zA-Z0-9]+)/.exec(tok)?.[1] ?? '').toLowerCase();

    if (SKIP_CONTENT.has(name)) {
      skipDepth = Math.max(0, skipDepth + (closing ? -1 : 1));
      continue;
    }
    if (skipDepth > 0) continue;

    if (name === 'br') {
      push('\n');
      continue;
    }
    if (BLOCK_TAGS.has(name)) {
      flush();
      if (!closing) {
        if (name === 'blockquote') kind = 'quote';
        else if (/^h[1-6]$/.test(name)) {
          kind = 'heading';
          level = name === 'h1' ? 1 : name === 'h2' ? 2 : 3;
        } else kind = 'paragraph';
      } else kind = 'paragraph';
      continue;
    }
    if (name === 'ul' || name === 'ol') {
      if (closing) closeList();
      else {
        flush();
        lists.push({ ordered: name === 'ol', items: [] });
      }
      continue;
    }
    if (name === 'li') {
      flush();
      inItem = !closing;
      continue;
    }
    const delta = closing ? -1 : 1;
    switch (name) {
      case 'strong':
      case 'b':
        style.bold = Math.max(0, style.bold + delta);
        break;
      case 'em':
      case 'i':
        style.italic = Math.max(0, style.italic + delta);
        break;
      case 'u':
        style.underline = Math.max(0, style.underline + delta);
        break;
      case 's':
      case 'del':
      case 'strike':
        style.strike = Math.max(0, style.strike + delta);
        break;
      case 'code':
        style.code = Math.max(0, style.code + delta);
        break;
      case 'a':
        if (closing) hrefs.pop();
        else {
          const h = /href\s*=\s*("([^"]*)"|'([^']*)')/i.exec(tok);
          hrefs.push(h ? safeHref(h[2] ?? h[3] ?? '') : undefined);
        }
        break;
      default:
        break;
    }
  }
  while (lists.length) closeList();
  flush();
  return blocks;
}

export function htmlToPlainText(input: string | null | undefined): string {
  return parseHtml(input)
    .map((b) => (b.type === 'list' ? b.items.map((i) => i.map((r) => r.text).join('')).join('\n') : b.children.map((r) => r.text).join('')))
    .join('\n')
    .trim();
}

export type Segment = { kind: 'text' | 'hashtag' | 'url'; text: string };

/** Splits plain text into text / #hashtag / bare-URL segments for styling. */
export function splitSegments(text: string): Segment[] {
  const out: Segment[] = [];
  const re = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"]|#[A-Za-z0-9_]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ kind: 'text', text: text.slice(last, m.index) });
    out.push({ kind: m[0][0] === '#' ? 'hashtag' : 'url', text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ kind: 'text', text: text.slice(last) });
  return out;
}
