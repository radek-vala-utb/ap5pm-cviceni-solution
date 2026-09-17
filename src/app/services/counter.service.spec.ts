import { TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from './counter.service';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('CounterService', () => {
  let service: CounterService;

  const getMock = vi.mocked(Preferences.get);
  const setMock = vi.mocked(Preferences.set);
  const removeMock = vi.mocked(Preferences.remove);

  const first: SavedCounter = {
    id: 'first',
    name: 'První',
    value: 1,
    createdAt: '2026-09-17T08:00:00.000Z',
  };

  const second: SavedCounter = {
    id: 'second',
    name: 'Druhé',
    value: 2,
    createdAt: '2026-09-17T09:00:00.000Z',
  };

  beforeEach(() => {
    // Vynulujeme počty volání mocků z předchozího testu.
    vi.clearAllMocks();

    // Výchozí stav: v Preferences zatím není uložená historie.
    getMock.mockResolvedValue({ value: null });

    // Zápis i odstranění ve výchozím stavu úspěšně skončí.
    setMock.mockResolvedValue(undefined);
    removeMock.mockResolvedValue(undefined);

    // Pro každý test vytvoříme nové prostředí Angular dependency injection.
    TestBed.configureTestingModule({
      providers: [CounterService],
    });

    // Z testovacího injectoru získáme čerstvou instanci služby.
    service = TestBed.inject(CounterService);
  });

  it('should initialize only once', async () => {
    // Dvě volání bez čekání simulují souběžné požadavky na inicializaci.
    await Promise.all([service.initialize(), service.initialize()]);

    // Další volání proběhne až po dokončení první inicializace.
    await service.initialize();

    // Všechna volání musí sdílet jedinou operaci načtení Preferences.
    expect(getMock).toHaveBeenCalledTimes(1);

    // Služba dokončila inicializaci a při value: null má prázdnou historii.
    expect(service.initialized()).toBe(true);
    expect(service.counters()).toEqual([]);
  });

  // TODO: samostatně doplňte testy
  it('should load counters from preferences', async () => {
    getMock.mockResolvedValue({
      value: JSON.stringify([first, second]),
    });

    await service.initialize();

    expect(service.counters()).toEqual([first, second]);

  });


  it('should add a new counter as a first item', async () => {

    // data jsou v service uložena v opačném pořadí, než byly přidány
    await service.initialize();
    await service.add(first);
    await service.add(second);

    expect(service.counters()).toEqual([second, first]);

    // Data byla uložena do Preferences
    expect(setMock).toHaveBeenLastCalledWith({
      key: 'saved-counters',
      value: JSON.stringify([second, first]),
    });

  });

  it('should remove only the counter with the given id and persist the state', async () => {
    await service.initialize();
    await service.add(first);
    await service.add(second);

    await service.remove('second');

    // v paměti služby zůstává pouze první počítadlo
    expect(service.counters()).toEqual([first]);

    // Data byla uložena do Preferences
    expect(setMock).toHaveBeenLastCalledWith({
      key: 'saved-counters',
      value: JSON.stringify([first]),
    });
  });

  it('should clear all counters and remove the persisted state', async () => {
    await service.initialize();
    await service.add(first);
    await service.add(second);

    await service.clear();

    // v paměti služby zůstává prázdná historie
    expect(service.counters()).toEqual([]);

    // Data byla odstraněna z Preferences
    expect(removeMock).toHaveBeenCalledWith({ key: 'saved-counters' });
  });

  it('broken JSON value in Preferences does not break the service', async () => {
    getMock.mockResolvedValue({
      value: 'this is not a valid JSON',
    });

    // Nejdříve začneme sledovat console.error
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    // Teprve nyní vyvoláme chybu
    await service.initialize();

    expect(service.counters()).toEqual([]);

    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
