import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/temporal-ui.js', import.meta.url), 'utf8');

test('temporal storage is not read eagerly at module evaluation', () => {
  assert.doesNotMatch(source, /let encounter\s*=\s*encounterStorage\.loadActiveEncounter\(\)/);
  assert.match(source, /let encounter\s*=\s*null;/);
  assert.match(source, /function initTemporalWorkflow\(\)[\s\S]*?encounter = loadEncounter\(\);/);
});

test('temporal read and write failures are observable instead of throwing through UI handlers', () => {
  assert.match(source, /function loadEncounter\(\)[\s\S]*?try[\s\S]*?loadActiveEncounter\(\)[\s\S]*?catch[\s\S]*?reportEncounterStorageFailure/);
  assert.match(source, /function persistEncounter\(\)[\s\S]*?try[\s\S]*?saveActiveEncounter\(encounter\)[\s\S]*?catch[\s\S]*?reportEncounterStorageFailure/);
  assert.match(source, /function reportEncounterStorageFailure\([\s\S]*?textContent = 'NÃO SALVO'[\s\S]*?showFeedback\([\s\S]*?console\.error/);
});

test('destructive workflow reset is cancelled when persisted encounter cannot be cleared', () => {
  assert.match(source, /function clearActiveWorkflow\(\)[\s\S]*?if \(encounter && !clearPersistedEncounter\(\)\) return false;/);
  assert.match(source, /function handleDocumentationReset\(event\)[\s\S]*?event\?\.preventDefault\(\)/);
  assert.match(source, /decision\.clearWorkflow && !clearActiveWorkflow\(\)[\s\S]*?event\.preventDefault\(\)/);
});
