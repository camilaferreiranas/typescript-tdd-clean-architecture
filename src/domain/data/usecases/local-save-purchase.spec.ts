class LocalSavePurchases {
    constructor(private readonly cacheStore: CacheStore) {
    }

    async save(): Promise<void> {
        this.cacheStore.delete();
    }
}


interface CacheStore {
    delete: () => void;
}

class CacheStoreSpy implements CacheStore{
    deleteCallsCount = 0
    delete(): void {
        this.deleteCallsCount++;
    }
}

describe('LocalSavePurchases', () => {
    test('Should not delete cache on init', () => {
        const cacheStorage = new CacheStoreSpy()
        // System under test
       new LocalSavePurchases(cacheStorage)
        expect(cacheStorage.deleteCallsCount).toBe(0);
    })
    test('Should delete on cache on save', async () => {
        const cacheStorage = new CacheStoreSpy()
        // System under test
        const sut = new LocalSavePurchases(cacheStorage)
        await sut.save()
        expect(cacheStorage.deleteCallsCount).toBe(1);
    })
})