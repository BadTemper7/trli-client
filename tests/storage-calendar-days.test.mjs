import test from 'node:test';
import assert from 'node:assert/strict';
import {calendarStorageDays} from '../src/lib/storageDays.js';

test('Client Gate-out modal counts Oct 27 22:00 to Oct 28 01:00 as 2 days',()=>{
 assert.equal(calendarStorageDays('2026-10-27T14:00:00Z','2026-10-27T17:00:00Z'),2);
});
test('Client same Manila day counts 1, UTC-only midnight does not increment',()=>{
 assert.equal(calendarStorageDays('2026-10-27T18:00:00Z','2026-10-28T03:00:00Z'),1);
});
test('Client calendar days require physical entry timestamp and valid chronological order',()=>{
 assert.equal(calendarStorageDays(null,'2026-10-27T17:00:00Z'),0);
 assert.equal(calendarStorageDays('2026-10-27T18:00:00Z','2026-10-27T17:00:00Z'),0);
});
