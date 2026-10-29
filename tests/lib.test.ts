import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHtml, htmlToPlainText, splitSegments, decodeEntities } from '../src/lib/html.ts';
import { timeAgo, initials, fullName, localFirst, mentionsPlace, plural } from '../src/lib/format.ts';
import { deriveCity, placeFromNominatim } from '../src/lib/place.ts';
import { isExpired } from '../src/lib/token.ts';

test('parseHtml: tiptap paragraph with inline styles and link', () => {
  const b = parseHtml('<p>Hello <strong>big</strong> <em>wide</em> <u>world</u> <a href="https://x.com/a?b=1&amp;c=2">link</a></p>');
  assert.equal(b.length, 1);
  assert.equal(b[0].type, 'paragraph');
  const runs = (b[0] as any).children;
  assert.equal(runs.map((r: any) => r.text).join(''), 'Hello big wide world link');
  assert.ok(runs.find((r: any) => r.text === 'big').bold);
  assert.ok(runs.find((r: any) => r.text === 'wide').italic);
  assert.ok(runs.find((r: any) => r.text === 'world').underline);
  assert.equal(runs.find((r: any) => r.text === 'link').href, 'https://x.com/a?b=1&c=2');
});

test('parseHtml: lists (tiptap wraps li content in p)', () => {
  const b = parseHtml('<ul><li><p>One</p></li><li><p>Two</p></li></ul><ol><li><p>A</p></li></ol>');
  assert.equal(b.length, 2);
  assert.deepEqual(b.map((x) => x.type), ['list', 'list']);
  assert.equal((b[0] as any).ordered, false);
  assert.equal((b[0] as any).items.length, 2);
  assert.equal((b[1] as any).ordered, true);
});

test('parseHtml: plain text keeps line breaks; empty and whitespace handled', () => {
  assert.equal(parseHtml('line one\nline two').length, 2);
  assert.deepEqual(parseHtml(''), []);
  assert.deepEqual(parseHtml(null), []);
  assert.deepEqual(parseHtml('<p></p><p>   </p>'), []);
  assert.equal(parseHtml('I <3 Luton & friends').length, 1);
});

test('parseHtml: br, entities, scripts and unsafe hrefs', () => {
  const b = parseHtml('<p>a<br>b &amp; c &#39;q&#39; &nbsp;d</p><script>alert(1)</script><p><a href="javascript:alert(1)">x</a></p>');
  assert.equal(b.length, 2);
  assert.equal((b[0] as any).children.map((r: any) => r.text).join(''), "a\nb & c 'q' d");
  assert.equal((b[1] as any).children[0].href, undefined);
  assert.ok(!htmlToPlainText('<script>alert(1)</script><p>ok</p>').includes('alert'));
});

test('htmlToPlainText counts visible characters', () => {
  assert.equal(htmlToPlainText('<p>Hi&nbsp;there</p>'), 'Hi there');
  assert.equal(htmlToPlainText('<ul><li><p>a</p></li><li><p>b</p></li></ul>'), 'a\nb');
});

test('splitSegments finds hashtags and urls', () => {
  const s = splitSegments('Join #Luton market https://luton.gov.uk/events. Bring friends');
  assert.deepEqual(s.map((x) => x.kind), ['text', 'hashtag', 'text', 'url', 'text']);
  assert.equal(s[3].text, 'https://luton.gov.uk/events');
  assert.equal(decodeEntities('&lt;b&gt;'), '<b>');
});

test('timeAgo', () => {
  const now = Date.parse('2026-10-28T12:00:00Z');
  assert.equal(timeAgo('2026-10-28T11:59:50Z', now), 'just now');
  assert.equal(timeAgo('2026-10-28T11:30:00Z', now), '30m');
  assert.equal(timeAgo('2026-10-28T09:00:00Z', now), '3h');
  assert.equal(timeAgo('2026-10-26T12:00:00Z', now), '2d');
  assert.equal(timeAgo('2026-09-01T12:00:00Z', now), '1 Sept 2026'.replace('Sept', 'Sep'));
  assert.equal(timeAgo('garbage', now), '');
  assert.equal(timeAgo(undefined, now), '');
});

test('names, initials, plural, local-first ranking', () => {
  assert.equal(initials('viktor odah'), 'VO');
  assert.equal(initials(''), '?');
  assert.equal(fullName({ first_name: '', last_name: '', username: 'vik' }), 'vik');
  assert.equal(fullName(null), 'Neighbour');
  assert.equal(plural(1, 'post'), '1 post');
  assert.equal(plural(2, 'post'), '2 posts');
  assert.ok(mentionsPlace('Luton, Bedfordshire', 'luton'));
  const items = [{ l: 'Leeds' }, { l: 'Luton' }, { l: 'Dunstable' }, { l: 'South Luton' }];
  assert.deepEqual(localFirst(items, (i) => i.l, 'Luton').map((i) => i.l), ['Luton', 'South Luton', 'Leeds', 'Dunstable']);
  assert.equal(localFirst(items, (i) => i.l, null), items);
});

test('deriveCity keeps the previous app precedence (town > village > county > city)', () => {
  assert.equal(deriveCity({ town: 'Luton', county: 'Bedfordshire' }), 'Luton');
  assert.equal(deriveCity({ city: 'Manchester', county: 'Greater Manchester' }), 'Greater Manchester');
  assert.equal(deriveCity({}), 'Unknown');
  assert.equal(placeFromNominatim({ display_name: 'x', address: { country: 'UK' } }, 'manual'), null);
  const p = placeFromNominatim({ lat: '51.87', lon: '-0.42', display_name: 'Luton, England', address: { town: 'Luton', state: 'England', country: 'United Kingdom', postcode: 'LU1' } }, 'manual', 1)!;
  assert.equal(p.city, 'Luton');
  assert.equal(p.latitude, 51.87);
  assert.equal(p.postCode, 'LU1');
});

test('isExpired', () => {
  const now = 1_000_000_000_000;
  assert.equal(isExpired(null), true);
  assert.equal(isExpired({}), true);
  assert.equal(isExpired({ exp: now / 1000 + 600 }, 30, now), false);
  assert.equal(isExpired({ exp: now / 1000 + 10 }, 30, now), true);
});
